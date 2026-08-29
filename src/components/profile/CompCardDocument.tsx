'use client';

import { useRef, useState } from 'react';
import { Download, Loader2, Printer } from 'lucide-react';

type CompCardModel = {
  id: string;
  name: string;
  username?: string | null;
  imageUrl?: string | null;
  heightCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  shoeSize?: string | null;
  hairColor?: string | null;
  eyeColor?: string | null;
  location?: string | null;
  categories?: string[];
  instagramUrl?: string | null;
};

type Props = { model: CompCardModel; images: string[]; agencyWebsite?: string; agencyInstagram?: string; agencyPhone?: string };

const compact = (value: unknown, suffix = '') => value === null || value === undefined || value === '' ? '—' : `${value}${suffix}`;
const fileName = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase();

export default function CompCardDocument({ model, images, agencyWebsite='perfectmodels.online', agencyInstagram='@perfectmodels.ga', agencyPhone='+241 74 00 73 74' }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting,setExporting] = useState(false);
  const [error,setError] = useState('');
  const unique = [...new Set([model.imageUrl, ...images].filter(Boolean).map(String))].slice(0,4);
  while (unique.length < 4) unique.push('/logo.svg');

  const exportPdf = async () => {
    if(!cardRef.current) return;
    setExporting(true); setError('');
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      const canvas = await html2canvas(cardRef.current,{scale:2,useCORS:true,backgroundColor:'#fff7ef',logging:false});
      const pdf = new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const width = canvas.width * ratio;
      const height = canvas.height * ratio;
      pdf.addImage(canvas.toDataURL('image/jpeg',0.94),'JPEG',(pageWidth-width)/2,(pageHeight-height)/2,width,height,undefined,'FAST');
      pdf.save(`comp-card-${fileName(model.name)}.pdf`);
    } catch(cause) {
      setError(cause instanceof Error ? `Export PDF impossible : ${cause.message}. Utilisez « Imprimer » puis « Enregistrer au format PDF ».` : 'Export PDF impossible. Utilisez l’impression PDF.');
    } finally { setExporting(false); }
  };

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-pm-coral">Comp card PMM</p><p className="mt-1 text-sm text-pm-ink/50">Format A4 paysage · généré depuis la fiche talent 360°</p></div><div className="flex gap-2"><button type="button" onClick={()=>window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-pm-ink/15 bg-white px-4 text-xs font-black uppercase tracking-[.07em]"><Printer size={15}/> Imprimer</button><button type="button" disabled={exporting} onClick={()=>void exportPdf()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-pm-ink px-5 text-xs font-black uppercase tracking-[.07em] text-white disabled:opacity-50">{exporting?<Loader2 size={15} className="animate-spin"/>:<Download size={15}/>} Exporter PDF</button></div></div>
    {error&&<p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">{error}</p>}
    <div className="overflow-x-auto rounded-[1.8rem] border border-pm-ink/10 bg-white p-3 shadow-[0_24px_70px_rgba(60,35,35,.08)] print:overflow-visible print:border-0 print:p-0 print:shadow-none">
      <div ref={cardRef} className="relative mx-auto grid aspect-[297/210] w-[1120px] grid-cols-[41%_59%] overflow-hidden bg-[#fff7ef] text-[#251b20] print:w-[297mm] print:max-w-none">
        <section className="relative overflow-hidden bg-[#e8d8cb]"><img src={unique[0]} crossOrigin="anonymous" alt={model.name} className="h-full w-full object-cover"/><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent px-9 pb-9 pt-24 text-white"><p className="text-[12px] font-black uppercase tracking-[.28em] text-[#f2c87d]">Perfect Models Management</p><h1 className="mt-3 font-serif text-6xl font-semibold leading-[.88]">{model.name}</h1><p className="mt-3 text-sm font-semibold uppercase tracking-[.15em] text-white/75">{(model.categories||[]).slice(0,3).join(' · ') || 'Model'}</p></div></section>
        <section className="grid grid-rows-[54%_46%]">
          <div className="grid grid-cols-3 gap-[3px] bg-[#fff7ef]"><img src={unique[1]} crossOrigin="anonymous" alt={`${model.name} portfolio 2`} className="h-full w-full object-cover"/><img src={unique[2]} crossOrigin="anonymous" alt={`${model.name} portfolio 3`} className="h-full w-full object-cover"/><img src={unique[3]} crossOrigin="anonymous" alt={`${model.name} portfolio 4`} className="h-full w-full object-cover"/></div>
          <div className="grid grid-cols-[1fr_1fr] gap-8 px-10 py-8"><div><p className="text-[10px] font-black uppercase tracking-[.23em] text-[#a34d54]">Measurements</p><div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 text-[15px]"><Metric label="Height" value={compact(model.heightCm,' cm')}/><Metric label="Chest" value={compact(model.chestCm,' cm')}/><Metric label="Waist" value={compact(model.waistCm,' cm')}/><Metric label="Hips" value={compact(model.hipsCm,' cm')}/><Metric label="Shoes" value={compact(model.shoeSize)}/><Metric label="Location" value={compact(model.location)}/></div></div><div className="border-l border-[#251b20]/10 pl-8"><p className="text-[10px] font-black uppercase tracking-[.23em] text-[#a34d54]">Profile</p><div className="mt-5 space-y-3 text-[14px]"><Line label="Hair" value={compact(model.hairColor)}/><Line label="Eyes" value={compact(model.eyeColor)}/><Line label="ID" value={model.username || model.id}/></div><div className="mt-6 border-t border-[#251b20]/10 pt-5"><p className="font-serif text-2xl font-semibold">Book this talent</p><p className="mt-2 text-[12px] leading-5 text-[#251b20]/62">{agencyWebsite}<br/>{agencyInstagram}<br/>{agencyPhone}</p></div></div></div>
        </section>
        <div aria-hidden="true" className="absolute right-8 top-7 grid h-14 w-14 place-items-center rounded-full bg-[#6b2942] font-serif text-sm font-black text-white shadow-lg">PMM</div>
      </div>
    </div>
  </div>;
}

function Metric({label,value}:{label:string;value:string}){return <div><p className="text-[9px] font-black uppercase tracking-[.12em] text-[#251b20]/42">{label}</p><p className="mt-1 font-serif text-2xl font-semibold">{value}</p></div>}
function Line({label,value}:{label:string;value:string}){return <div className="flex items-baseline justify-between gap-4 border-b border-[#251b20]/8 pb-2"><span className="text-[10px] font-black uppercase tracking-[.12em] text-[#251b20]/42">{label}</span><strong className="text-right">{value}</strong></div>}
