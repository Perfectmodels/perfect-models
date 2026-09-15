import Image from 'next/image';
import Link from 'next/link';

type Tone = 'wine' | 'coral' | 'teal' | 'gold';
type Props = { eyebrow:string; title:string; accent:string; description:string; images?:string[]; tone?:Tone; primary?:{label:string;href:string}; secondary?:{label:string;href:string}; meta?:string[] };
const FALLBACK='/images/grace-elsa.jpg';

export default function VisualMasthead({eyebrow,title,accent,description,images=[],primary,secondary,meta=[]}:Props){
 const background=images.find(Boolean)||FALLBACK;
 return <section className="relative isolate min-h-[70svh] overflow-hidden bg-black text-white lg:min-h-[760px]">
   <Image src={background} alt="" fill priority sizes="100vw" className="object-cover object-center" />
   <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/58 to-black/15" />
   <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25" />
   <div className="relative mx-auto flex min-h-[70svh] max-w-[1700px] items-end px-5 py-14 sm:px-8 sm:py-20 lg:min-h-[760px] lg:px-12 lg:py-24 xl:px-16">
    <div className="max-w-5xl">
      <p className="text-[9px] font-black uppercase tracking-[.34em] text-pm-gold-light sm:text-[10px]">{eyebrow}</p>
      <h1 className="mt-6 font-playfair text-[clamp(3.8rem,7.5vw,8.6rem)] font-semibold leading-[.82] tracking-[-.055em] drop-shadow-lg">{title}<br/><em className="font-normal text-pm-gold-light">{accent}</em></h1>
      <p className="mt-7 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">{description}</p>
      {(primary||secondary)&&<div className="mt-9 flex flex-wrap gap-3">{primary&&<Link href={primary.href} className="inline-flex min-h-12 items-center justify-center bg-pm-gold px-6 py-3 text-sm font-extrabold text-black transition hover:bg-pm-gold-light">{primary.label}<span className="ml-2">↗</span></Link>}{secondary&&<Link href={secondary.href} className="inline-flex min-h-12 items-center justify-center border border-white/35 bg-black/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:border-pm-gold">{secondary.label}</Link>}</div>}
      {meta.length>0&&<div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/20 pt-5">{meta.map(item=><span key={item} className="text-[8px] font-black uppercase tracking-[.2em] text-white/55">{item}</span>)}</div>}
    </div>
   </div>
   <div className="african-trim h-2 w-full" aria-hidden="true"/>
 </section>;
}
