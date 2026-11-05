'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, Crown, ExternalLink, ImagePlus, Loader2, Pencil, Trash2, X } from 'lucide-react';
import ImgBBMultiUploader from '@/components/ImgBBMultiUploader';
import ImgBBUploader from '@/components/ImgBBUploader';

type PortfolioImage = { id:string; url:string; position:number; caption?:string|null };

export default function TalentMediaManager({ modelId, modelName, initialCover, initialPortfolio, initialComposite }: {
  modelId:string;
  modelName:string;
  initialCover:string;
  initialPortfolio:PortfolioImage[];
  initialComposite:{url:string;isPublic:boolean};
}) {
  const router=useRouter();
  const [cover,setCover]=useState(initialCover);
  const [portfolio,setPortfolio]=useState(initialPortfolio);
  const [pendingUrls,setPendingUrls]=useState<string[]>([]);
  const [compositeUrl,setCompositeUrl]=useState(initialComposite.url);
  const [compositePublic,setCompositePublic]=useState(initialComposite.isPublic);
  const [captioning,setCaptioning]=useState<PortfolioImage|null>(null);
  const [caption,setCaption]=useState('');
  const [deleting,setDeleting]=useState<PortfolioImage|null>(null);
  const [busy,setBusy]=useState('');
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');

  async function request(method:string,body:Record<string,unknown>) {
    const response=await fetch(`/api/admin/talents/${encodeURIComponent(modelId)}/media`,{method,credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(payload.error||'Opération impossible.');
    return payload;
  }

  async function addImages() {
    if(!pendingUrls.length) return;
    setBusy('add'); setError(''); setNotice('');
    try { const payload=await request('POST',{urls:pendingUrls}); setPortfolio((current)=>[...current,...(payload.images||[])]); setPendingUrls([]); setNotice('Les nouvelles photos sont ajoutées au portfolio.'); }
    catch(cause){setError(cause instanceof Error?cause.message:'Ajout impossible.');}
    finally{setBusy('');}
  }

  async function setAsCover(image:PortfolioImage) {
    setBusy(image.id); setError(''); setNotice('');
    try { const payload=await request('PATCH',{action:'cover',imageId:image.id}); setCover(String(payload.imageUrl||image.url)); setNotice('Photo principale mise à jour.'); router.refresh(); }
    catch(cause){setError(cause instanceof Error?cause.message:'Mise à jour impossible.');}
    finally{setBusy('');}
  }

  async function saveCaption() {
    if(!captioning) return;
    setBusy(captioning.id); setError('');
    try { const payload=await request('PATCH',{action:'caption',imageId:captioning.id,caption}); setPortfolio((current)=>current.map((image)=>image.id===captioning.id?payload.image:image)); setCaptioning(null); setNotice('Légende enregistrée.'); }
    catch(cause){setError(cause instanceof Error?cause.message:'Mise à jour impossible.');}
    finally{setBusy('');}
  }

  async function removeImage() {
    if(!deleting) return;
    setBusy(deleting.id); setError('');
    try { const payload=await request('DELETE',{imageId:deleting.id}); setPortfolio((current)=>current.filter((image)=>image.id!==deleting.id)); if(payload.clearedCover)setCover(''); setDeleting(null); setNotice('Photo retirée du portfolio.'); router.refresh(); }
    catch(cause){setError(cause instanceof Error?cause.message:'Suppression impossible.');}
    finally{setBusy('');}
  }

  async function saveComposite() {
    setBusy('composite'); setError(''); setNotice('');
    try { const payload=await request('PATCH',{action:'composite',url:compositeUrl,isPublic:compositePublic}); setCompositeUrl(String(payload.composite?.url||'')); setCompositePublic(Boolean(payload.composite?.isPublic)); setNotice('Composite officiel enregistré dans la fiche Talent 360°.'); router.refresh(); }
    catch(cause){setError(cause instanceof Error?cause.message:'Enregistrement impossible.');}
    finally{setBusy('');}
  }

  return <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
    <section className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="control-kicker">Portfolio · {portfolio.length}/24</p><h2 className="mt-1 font-playfair text-3xl font-semibold">Images du talent</h2><p className="mt-2 text-sm text-pm-ink/45">Ajout, couverture et légendes se gèrent ici sans quitter la fiche.</p></div><span className="rounded-full bg-pm-peach px-3 py-2 text-[9px] font-black uppercase tracking-[.08em] text-pm-wine">Photo principale intégrée</span></div>
      {(notice||error)&&<p className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${error?'bg-rose-50 text-rose-900':'bg-emerald-50 text-emerald-900'}`}>{!error&&<CheckCircle2 size={15}/>} {error||notice}</p>}
      <div className="mt-5 rounded-[1.4rem] bg-pm-ink p-4 text-white"><ImgBBMultiUploader values={pendingUrls} onChange={setPendingUrls} maxFiles={Math.min(8,Math.max(0,24-portfolio.length))} scope={`admin/talents/${modelId}/portfolio`}/>{pendingUrls.length>0&&<button type="button" disabled={busy==='add'} onClick={()=>void addImages()} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-pm-gold px-4 text-xs font-black text-pm-ink disabled:opacity-50">{busy==='add'?<Loader2 size={14} className="animate-spin"/>:<ImagePlus size={14}/>}Enregistrer {pendingUrls.length} photo{pendingUrls.length>1?'s':''}</button>}</div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{portfolio.map((image)=><article key={image.id} className="overflow-hidden rounded-2xl border border-pm-ink/[.08] bg-pm-ivory"><div className="relative aspect-[4/5]"><Image src={image.url} alt={image.caption||`Portfolio de ${modelName}`} fill sizes="(max-width:640px) 50vw, (max-width:1280px) 33vw, 20vw" className="object-cover"/>{cover===image.url&&<span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-pm-gold px-2 py-1 text-[8px] font-black uppercase text-pm-ink"><Crown size={10}/>Principale</span>}{busy===image.id&&<div className="absolute inset-0 grid place-items-center bg-pm-ink/50 text-white"><Loader2 className="animate-spin"/></div>}</div><div className="p-2"><p className="line-clamp-2 min-h-8 text-[10px] leading-4 text-pm-ink/50">{image.caption||'Sans légende'}</p><div className="mt-2 grid grid-cols-3 gap-1"><button type="button" disabled={cover===image.url||Boolean(busy)} onClick={()=>void setAsCover(image)} title="Définir comme photo principale" className="grid h-8 place-items-center rounded-lg bg-white text-pm-wine disabled:opacity-35"><Crown size={12}/></button><button type="button" disabled={Boolean(busy)} onClick={()=>{setCaptioning(image);setCaption(image.caption||'');}} title="Modifier la légende" className="grid h-8 place-items-center rounded-lg bg-white text-pm-wine"><Pencil size={12}/></button><button type="button" disabled={Boolean(busy)} onClick={()=>setDeleting(image)} title="Retirer la photo" className="grid h-8 place-items-center rounded-lg bg-rose-50 text-rose-800"><Trash2 size={12}/></button></div></div></article>)}</div>
      {!portfolio.length&&<p className="mt-5 rounded-2xl bg-pm-ivory p-8 text-center text-sm text-pm-ink/40">Aucune photo dans le portfolio.</p>}
    </section>

    <section className="h-fit rounded-[1.7rem] border border-pm-ink/[.08] bg-white p-5 sm:p-6 xl:sticky xl:top-5"><p className="control-kicker">Composite officiel</p><h2 className="mt-1 font-playfair text-3xl font-semibold">Format portrait</h2><p className="mt-2 text-sm leading-6 text-pm-ink/45">Le composite est séparé du portfolio et conserve ses proportions naturelles.</p><div className="mt-5 rounded-[1.4rem] bg-pm-ink p-4 text-white"><ImgBBUploader value={compositeUrl} onChange={(url)=>{setCompositeUrl(url);if(!url)setCompositePublic(false);}} scope={`admin/talents/${modelId}/composite`} compact/></div><label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-pm-ivory p-4"><input type="checkbox" checked={compositePublic} disabled={!compositeUrl||busy==='composite'} onChange={(event)=>setCompositePublic(event.target.checked)} className="mt-1 h-4 w-4 accent-pm-wine"/><span><b className="block text-sm">Partager publiquement</b><span className="mt-1 block text-xs leading-5 text-pm-ink/45">Disponible uniquement lorsque le composite existe.</span></span></label><button type="button" disabled={busy==='composite'} onClick={()=>void saveComposite()} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-pm-wine px-5 text-xs font-black uppercase tracking-[.07em] text-white disabled:opacity-50">{busy==='composite'&&<Loader2 size={14} className="animate-spin"/>}Enregistrer le composite</button>{compositeUrl&&<Link href={`/composite/${encodeURIComponent(modelId)}`} target="_blank" className="mt-3 inline-flex w-full items-center justify-center gap-2 text-xs font-black text-pm-coral"><ExternalLink size={13}/>Aperçu public</Link>}</section>

    {captioning&&<div className="fixed inset-0 z-[140] grid place-items-center bg-pm-ink/65 p-4"><div className="w-full max-w-md rounded-[1.7rem] bg-white p-6"><div className="flex items-start justify-between"><h3 className="font-playfair text-3xl font-semibold">Légende de la photo</h3><button type="button" onClick={()=>setCaptioning(null)} className="grid h-9 w-9 place-items-center rounded-full bg-pm-ivory"><X size={16}/></button></div><textarea value={caption} onChange={(event)=>setCaption(event.target.value)} rows={4} maxLength={300} className="mt-5 w-full rounded-xl border border-pm-ink/10 bg-pm-ivory p-4 text-sm outline-none focus:border-pm-coral"/><button type="button" disabled={Boolean(busy)} onClick={()=>void saveCaption()} className="mt-4 min-h-11 w-full rounded-full bg-pm-wine text-sm font-black text-white">Enregistrer</button></div></div>}
    {deleting&&<div className="fixed inset-0 z-[140] grid place-items-center bg-pm-ink/65 p-4"><div className="w-full max-w-md rounded-[1.7rem] bg-white p-6"><h3 className="font-playfair text-3xl font-semibold">Retirer cette photo ?</h3><p className="mt-3 text-sm leading-6 text-pm-ink/50">La photo sera supprimée du portfolio de {modelName}. L’image ImgBB originale n’est pas effacée.</p><div className="mt-6 flex justify-end gap-2"><button type="button" disabled={Boolean(busy)} onClick={()=>setDeleting(null)} className="min-h-11 rounded-full border border-pm-ink/10 px-5 text-sm font-bold">Annuler</button><button type="button" disabled={Boolean(busy)} onClick={()=>void removeImage()} className="min-h-11 rounded-full bg-rose-700 px-5 text-sm font-black text-white">Retirer</button></div></div></div>}
  </div>;
}
