
type Asset={publicUrl:string|null;contentType:string;originalName:string;altText:string|null};
export function MediaDisplay({asset,externalUrl,title}:{asset?:Asset|null;externalUrl?:string|null;title:string}) {
 const url=asset?.publicUrl||externalUrl||'';
 const type=asset?.contentType||'';
 if(asset&&url&&type.startsWith('image/')) return <a className="media-visual" href={url} target="_blank" rel="noreferrer"><img src={url} alt={asset.altText||title} loading="lazy"/></a>;
 if(asset&&url&&type.startsWith('video/')) return <div className="media-visual"><video controls preload="metadata" playsInline poster={undefined}><source src={url} type={type}/></video></div>;
 if(asset&&url&&type.startsWith('audio/')) return <div className="media-audio"><span className="media-icon">♫</span><audio controls preload="none" src={url}/></div>;
 if(asset&&url&&type==='application/pdf') return <a className="media-document" href={url} target="_blank" rel="noreferrer"><span className="media-icon">PDF</span><span><strong>Open document</strong><small>{asset.originalName}</small></span><b>↗</b></a>;
 if(url) {
   const clean=url.split('?')[0].toLowerCase();
   if(/\\.(mp4|webm|mov)$/.test(clean)) return <div className="media-visual"><video controls preload="metadata" playsInline src={url}/></div>;
   if(/\\.(mp3|m4a|wav|ogg)$/.test(clean)) return <div className="media-audio"><span className="media-icon">♫</span><audio controls preload="none" src={url}/></div>;
   if(/\\.pdf$/.test(clean)) return <a className="media-document" href={url} target="_blank" rel="noreferrer"><span className="media-icon">PDF</span><span><strong>Open document</strong><small>PDF document</small></span><b>↗</b></a>;
   if(/\\.(jpg|jpeg|png|webp|gif)$/.test(clean)) return <a className="media-visual" href={url} target="_blank" rel="noreferrer"><img src={url} alt={title} loading="lazy"/></a>;
   const yt=url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/);
   if(yt) return <div className="media-visual media-embed"><iframe src={`https://www.youtube-nocookie.com/embed/${yt[1]}`} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div>;
   return <a className="media-link" href={url} target="_blank" rel="noreferrer"><span className="media-icon">↗</span><span><strong>View original media</strong><small>Opens the original post or recording</small></span></a>;
 }
 return <div className="media-placeholder" aria-hidden="true"><span>PM</span></div>;
}
