'use server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

const schema=z.object({fullName:z.string().trim().min(2).max(100),email:z.string().trim().email().max(254),subject:z.string().trim().min(3).max(160),message:z.string().trim().min(10).max(5000),category:z.enum(['Job Opportunity','Internship','Collaboration','Technical Discussion','Other']),website:z.string().max(0).optional()});
// Best-effort per-process throttling; use a shared Redis/KV limiter for multi-instance production deployments.
const attempts=new Map<string,{count:number;start:number}>();
export async function submitContactAction(fd:FormData){
 const parsed=schema.safeParse(Object.fromEntries(fd.entries())); if(!parsed.success) redirect('/contact?sent=invalid'); const d=parsed.data; if(d.website) redirect('/contact?sent=ok');
 const h=await headers(); const ip=(h.get('x-forwarded-for')||'unknown').split(',')[0].trim(); const now=Date.now(); const prev=attempts.get(ip); if(prev&&now-prev.start<15*60*1000&&prev.count>=5) redirect('/contact?sent=limited'); if(!prev||now-prev.start>=15*60*1000) attempts.set(ip,{count:1,start:now}); else attempts.set(ip,{count:prev.count+1,start:prev.start});
 const message=await prisma.contactMessage.create({data:{fullName:d.fullName,email:d.email.toLowerCase(),subject:d.subject,message:d.message,category:d.category,emailDeliveryStatus:process.env.RESEND_API_KEY&&process.env.CONTACT_TO_EMAIL&&process.env.CONTACT_FROM_EMAIL?'PENDING':'NOT_CONFIGURED'}});
 if(process.env.RESEND_API_KEY&&process.env.CONTACT_TO_EMAIL&&process.env.CONTACT_FROM_EMAIL){
   try{const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.CONTACT_FROM_EMAIL,to:[process.env.CONTACT_TO_EMAIL],reply_to:d.email,subject:`Portfolio enquiry: ${d.subject}`,text:`From: ${d.fullName} <${d.email}>\nCategory: ${d.category}\n\n${d.message}`}),cache:'no-store'}); if(!response.ok)throw new Error(`Email provider returned ${response.status}`); await prisma.contactMessage.update({where:{id:message.id},data:{emailDeliveryStatus:'SENT',emailSentAt:new Date(),emailAttemptedAt:new Date()}})}catch(e){await prisma.contactMessage.update({where:{id:message.id},data:{emailDeliveryStatus:'FAILED',emailDeliveryError:e instanceof Error?e.message:'Email delivery failed',emailAttemptedAt:new Date()}})}
 }
 redirect('/contact?sent=ok');
}
