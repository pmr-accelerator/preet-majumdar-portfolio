'use client';
export function ConfirmSubmitButton({children,confirmation}:{children:React.ReactNode;confirmation:string}){return <button className="button" type="submit" onClick={event=>{if(!window.confirm(confirmation))event.preventDefault()}}>{children}</button>}
