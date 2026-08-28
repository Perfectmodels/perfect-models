import Link from 'next/link';

type Model = { id: string; name: string; imageUrl?: string; height?: string; gender?: string; location?: string };
type Service = { slug: string; title: string; description?: string; category?: string };
type Event = { edition: number; theme: string; date: string; location?: string; description?: string; coverImageUrl?: string };
type Article = { slug: string; title: string; imageUrl?: string; category?: string; date: string; excerpt?: string };
type Props = { models: Model[]; services: Service[]; events: Event[]; articles: Article[] };

const fallback = 'https://ui-avatars.com/api/?name=Perfect+Models&size=1200&background=111114&color=D2AD65&bold=true&format=png';

function formatDate(value?: string) {
  if (!value) return 'Date à venir';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function HomePage({ models, services, events, articles }: Props) {
  const featuredModels = models.slice(0, 4);
  const latestEvent = [...events].sort((a, b) => Number(b.edition) - Number(a.edition))[0];
  const featuredArticles = articles.slice(0, 3);
  const heroImage = latestEvent?.coverImageUrl || featuredModels[0]?.imageUrl || fallback;
  const secondaryImage = featuredModels[1]?.imageUrl || featuredArticles[0]?.imageUrl || heroImage;

  return (
    <main className="overflow-hidden bg-pm-dark text-pm-off-white">
      <section className="relative isolate min-h-[calc(100svh-6rem)] border-b border-white/10">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_30%,rgba(106,35,57,.28),transparent_34%),linear-gradient(120deg,#0a0a0c_0%,#111114_65%,#17130f_100%)]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[.08] [background-image:linear-gradient(rgba(255,255,255,.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.3)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="mx-auto grid min-h-[calc(100svh-6rem)] max-w-[1600px] grid-cols-1 px-5 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:px-12 xl:px-16">
          <div className="flex flex-col justify-between py-12 sm:py-16 lg:py-20">
            <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[.42em] text-pm-gold">
              <span>Agence créative</span><span className="h-px w-10 bg-pm-gold/50" /><span>Libreville · Gabon</span>
            </div>

            <div className="max-w-4xl py-16 lg:py-10">
              <p className="mb-6 font-montserrat text-xs font-semibold uppercase tracking-[.34em] text-white/45">Management · Casting · Production</p>
              <h1 className="font-playfair text-[clamp(4.25rem,9.5vw,10rem)] font-semibold leading-[.76] tracking-[-.065em] text-pm-ivory">
                Faire<br />
                <span className="ml-[.16em] italic text-pm-gold-light">présence.</span>
              </h1>
              <p className="mt-10 max-w-xl border-l border-pm-gold/60 pl-6 text-sm leading-7 text-white/60 sm:text-base">
                Perfect Models Management construit des carrières et des images fortes, depuis Libreville vers les scènes de la mode, de la publicité et de la culture.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/mannequins" className="pmm-button pmm-button--light">Découvrir les talents <span aria-hidden="true">↗</span></Link>
                <Link href="/contact?subject=booking" className="pmm-button pmm-button--ghost">Booker un talent</Link>
              </div>
            </div>

            <div className="grid max-w-2xl grid-cols-3 border-t border-white/10 pt-5 text-[9px] font-bold uppercase tracking-[.25em] text-white/35">
              <span>Fondée en 2021</span><span className="text-center">Mode & image</span><span className="text-right">Gabon</span>
            </div>
          </div>

          <div className="relative min-h-[520px] border-x border-white/10 lg:min-h-full">
            <div className="absolute inset-5 overflow-hidden sm:inset-8 lg:inset-x-10 lg:inset-y-12">
              <img src={heroImage} alt="L’univers Perfect Models Management" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-6 sm:p-8">
                <div><p className="text-[9px] font-bold uppercase tracking-[.38em] text-pm-gold-light">Éditorial PMM</p><p className="mt-2 font-playfair text-2xl text-white">Talent. Discipline. Vision.</p></div>
                <span className="font-playfair text-5xl italic text-white/25">01</span>
              </div>
            </div>
            <div aria-hidden="true" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-90 whitespace-nowrap text-[8px] font-bold uppercase tracking-[.6em] text-white/25">Perfect Models Management</div>
          </div>
        </div>
      </section>

      <section className="bg-pm-ivory text-pm-ink">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[.72fr_1.28fr] lg:px-12 lg:py-36">
          <div>
            <SectionMark index="01" label="Le manifeste" dark />
            <p className="mt-12 max-w-xs text-sm leading-7 text-pm-ink/55">Plus qu’un book : une direction, un apprentissage et des opportunités pensées pour durer.</p>
          </div>
          <div>
            <h2 className="max-w-5xl font-playfair text-[clamp(3.2rem,6.8vw,7.4rem)] font-semibold leading-[.9] tracking-[-.055em]">
              Le talent attire le regard.<br /><em className="font-normal text-pm-wine">La préparation le retient.</em>
            </h2>
            <div className="mt-14 grid gap-8 border-t border-pm-ink/15 pt-8 sm:grid-cols-3">
              {[
                ['Repérer', 'Identifier les personnalités, les silhouettes et les potentiels singuliers.'],
                ['Développer', 'Former les talents à la posture, à l’image et aux exigences du métier.'],
                ['Connecter', 'Créer le lien juste entre mannequins, marques, créatifs et événements.'],
              ].map(([title, text], index) => <div key={title}><span className="font-playfair text-3xl text-pm-gold-deep">0{index + 1}</span><h3 className="mt-5 font-montserrat text-xs font-black uppercase tracking-[.22em]">{title}</h3><p className="mt-3 text-sm leading-6 text-pm-ink/55">{text}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0b0b0d] py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div><SectionMark index="02" label="Le roster" /><h2 className="mt-8 font-playfair text-5xl font-semibold tracking-[-.045em] sm:text-7xl lg:text-8xl">Talents en lumière.</h2></div>
            <Link href="/mannequins" className="pmm-text-link">Voir tous les profils <span>↗</span></Link>
          </div>

          {featuredModels.length > 0 ? (
            <div className="mt-14 grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-4 lg:gap-x-5">
              {featuredModels.map((model, index) => (
                <Link key={model.id} href={`/mannequins/${model.id}`} className={`group block ${index % 2 ? 'lg:translate-y-14' : ''}`}>
                  <div className="relative aspect-[3/4.35] overflow-hidden bg-[#171719]">
                    <img src={model.imageUrl || fallback} alt={model.name} className="h-full w-full object-cover saturate-[.72] transition duration-700 ease-out group-hover:scale-[1.035] group-hover:saturate-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
                    <span className="absolute right-4 top-4 font-playfair text-2xl italic text-white/45">0{index + 1}</span>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4 border-t border-white/12 pt-4">
                    <div><h3 className="font-playfair text-xl text-white sm:text-2xl">{model.name}</h3><p className="mt-1 text-[8px] font-bold uppercase tracking-[.26em] text-white/35">{model.location || 'Libreville'} {model.height ? `· ${model.height}` : ''}</p></div>
                    <span className="text-pm-gold transition group-hover:translate-x-1">↗</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-14 border border-white/10 px-6 py-16 text-center"><p className="font-playfair text-3xl text-white/60">Le nouveau roster arrive bientôt.</p></div>
          )}
        </div>
      </section>

      <section className="bg-pm-sand text-pm-ink">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
            <div><SectionMark index="03" label="Savoir-faire" dark /><h2 className="mt-8 max-w-md font-playfair text-5xl font-semibold leading-[.94] tracking-[-.045em] sm:text-7xl">De l’intuition à l’impact.</h2></div>
            <div className="border-t border-pm-ink/20">
              {services.slice(0, 5).map((service, index) => (
                <Link href={`/services/${service.slug}`} key={service.slug} className="group grid gap-4 border-b border-pm-ink/20 py-7 transition hover:bg-pm-ivory/45 sm:grid-cols-[4rem_1fr_2fr_auto] sm:items-center sm:px-4">
                  <span className="font-playfair text-2xl text-pm-gold-deep">0{index + 1}</span>
                  <h3 className="font-playfair text-2xl sm:text-3xl">{service.title}</h3>
                  <p className="text-sm leading-6 text-pm-ink/55">{service.description}</p>
                  <span className="text-xl transition group-hover:translate-x-1">↗</span>
                </Link>
              ))}
              {!services.length && <p className="border-b border-pm-ink/20 py-10 text-pm-ink/50">Nos expertises seront bientôt présentées ici.</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate bg-pm-wine py-20 text-pm-ivory sm:py-28 lg:py-36">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-1/2 overflow-hidden opacity-25"><img src={latestEvent?.coverImageUrl || secondaryImage} alt="" className="h-full w-full object-cover mix-blend-luminosity" /></div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-pm-wine via-pm-wine to-pm-wine/55" />
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:px-12">
          <div><SectionMark index="04" label="Événement signature" /><p className="mt-10 max-w-xs text-sm leading-7 text-white/55">Créateurs, talents, partenaires et public réunis autour d’une vision contemporaine de la mode au Gabon.</p></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.38em] text-pm-gold-light">Perfect Fashion Day · Édition {latestEvent?.edition || '—'}</p>
            <h2 className="mt-6 max-w-5xl font-playfair text-[clamp(3.6rem,7.6vw,8.4rem)] font-semibold leading-[.83] tracking-[-.055em]">{latestEvent?.theme || 'La scène où les visions se rencontrent.'}</h2>
            <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-white/20 pt-6 text-xs font-semibold uppercase tracking-[.18em] text-white/65">
              <span>{formatDate(latestEvent?.date)}</span><span>{latestEvent?.location || 'Libreville, Gabon'}</span><Link href="/fashion-day" className="text-pm-gold-light transition hover:text-white">Découvrir l’événement ↗</Link>
            </div>
          </div>
        </div>
      </section>

      {featuredArticles.length > 0 && (
        <section className="bg-pm-ivory py-20 text-pm-ink sm:py-28 lg:py-36">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="flex items-end justify-between gap-8"><div><SectionMark index="05" label="Journal" dark /><h2 className="mt-8 font-playfair text-5xl font-semibold tracking-[-.045em] sm:text-7xl">Dans les coulisses.</h2></div><Link href="/magazine" className="pmm-text-link !text-pm-ink">Tout lire <span>↗</span></Link></div>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {featuredArticles.map((article, index) => <Link href={`/magazine/${article.slug}`} key={article.slug} className="group"><div className={`overflow-hidden bg-pm-ink ${index === 1 ? 'aspect-[4/5] md:-mt-8' : 'aspect-[4/4.4]'}`}><img src={article.imageUrl || fallback} alt={article.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" /></div><p className="mt-5 text-[8px] font-black uppercase tracking-[.3em] text-pm-wine">{article.category || 'Journal'} · {formatDate(article.date)}</p><h3 className="mt-3 font-playfair text-2xl leading-tight sm:text-3xl">{article.title}</h3></Link>)}
            </div>
          </div>
        </section>
      )}

      <section className="relative bg-[#09090b] px-5 py-24 text-center sm:px-8 sm:py-32">
        <p className="text-[9px] font-bold uppercase tracking-[.5em] text-pm-gold">Un projet en tête ?</p>
        <h2 className="mx-auto mt-7 max-w-5xl font-playfair text-[clamp(3.4rem,7.5vw,8rem)] font-semibold leading-[.88] tracking-[-.055em]">Trouvons le visage.<br /><em className="font-normal text-white/45">Créons l’image.</em></h2>
        <Link href="/contact" className="pmm-button pmm-button--light mt-10">Parler à l’agence <span>↗</span></Link>
      </section>
    </main>
  );
}

function SectionMark({ index, label, dark = false }: { index: string; label: string; dark?: boolean }) {
  return <div className={`flex items-center gap-4 text-[9px] font-black uppercase tracking-[.38em] ${dark ? 'text-pm-wine' : 'text-pm-gold'}`}><span>{index}</span><span className={`h-px w-10 ${dark ? 'bg-pm-wine/40' : 'bg-pm-gold/45'}`} /><span>{label}</span></div>;
}
