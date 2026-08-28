import Link from 'next/link';

type Model = { id: string; name: string; imageUrl?: string; height?: string; gender?: string; location?: string };
type Service = { slug: string; title: string; description?: string; category?: string };
type Event = { edition: number; theme: string; date: string; location?: string; description?: string; coverImageUrl?: string };
type Article = { slug: string; title: string; imageUrl?: string; category?: string; date: string; excerpt?: string };
type Props = { models: Model[]; services: Service[]; events: Event[]; articles: Article[] };

const fallback = '/images/grace-elsa.jpg';

function formatDate(value?: string) {
  if (!value) return 'Date à venir';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function HomePage({ models, services, events, articles }: Props) {
  const featuredModels = models.slice(0, 6);
  const latestEvent = [...events].sort((a, b) => Number(b.edition) - Number(a.edition))[0];
  const featuredArticles = articles.slice(0, 3);
  const heroImage = featuredModels[0]?.imageUrl || latestEvent?.coverImageUrl || featuredArticles[0]?.imageUrl || fallback;
  const secondaryImage = featuredModels[1]?.imageUrl || latestEvent?.coverImageUrl || heroImage;
  const accentImage = featuredModels[2]?.imageUrl || featuredArticles[0]?.imageUrl || secondaryImage;

  return (
    <main className="overflow-hidden bg-pm-ivory text-pm-ink">
      <section className="relative isolate overflow-hidden border-b border-pm-ink/10 bg-pm-ivory">
        <div aria-hidden="true" className="absolute -left-32 top-24 -z-20 h-80 w-80 rounded-full bg-pm-gold-light/35 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-20 -top-20 -z-20 h-[34rem] w-[34rem] rounded-full bg-pm-coral-soft/45 blur-3xl" />
        <div aria-hidden="true" className="warm-grid absolute inset-0 -z-30 opacity-30" />

        <div className="mx-auto grid min-h-[calc(100svh-78px)] max-w-[1700px] gap-12 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:px-12 lg:py-16 xl:px-16">
          <div className="relative z-10 max-w-3xl py-8 lg:py-12">
            <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[.38em] text-pm-wine sm:text-[9px]">
              <span>Perfect Models Management</span><span className="h-px w-10 bg-pm-coral" /><span>Libreville</span>
            </div>
            <h1 className="mt-8 font-playfair text-[clamp(4.4rem,8.7vw,9.7rem)] font-semibold leading-[.76] tracking-[-.07em] text-pm-ink">
              L’allure<br />devient <em className="font-normal text-pm-coral">langage.</em>
            </h1>
            <p className="mt-8 max-w-xl text-sm leading-7 text-pm-ink/62 sm:text-base sm:leading-8">
              Une maison gabonaise de talents où le management, la formation et la création d’image se rencontrent pour révéler des présences inoubliables.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/mannequins" className="control-button">Explorer le roster <span aria-hidden="true">↗</span></Link>
              <Link href="/casting-formulaire" className="control-button control-button--soft">Rejoindre l’agence</Link>
            </div>
            <div className="mt-12 grid max-w-2xl grid-cols-3 gap-4 border-t border-pm-ink/12 pt-5 text-[8px] font-black uppercase tracking-[.18em] text-pm-ink/42 sm:text-[9px]">
              <span>Depuis 2021</span><span className="text-center">Mode · Image</span><span className="text-right">Gabon</span>
            </div>
          </div>

          <div className="relative min-h-[35rem] sm:min-h-[44rem] lg:min-h-[47rem]">
            <div className="absolute inset-x-[9%] inset-y-[3%] rotate-[2.5deg] overflow-hidden rounded-[2.8rem_2.8rem_10rem_2.8rem] bg-pm-peach shadow-[0_35px_100px_rgba(96,42,53,.16)]">
              <img src={heroImage} alt={featuredModels[0]?.name || 'Talent Perfect Models Management'} className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-[3%] left-0 h-[35%] w-[34%] -rotate-3 overflow-hidden rounded-[1.7rem] border-[8px] border-pm-ivory bg-pm-sage shadow-2xl sm:border-[12px]">
              <img src={secondaryImage} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="absolute right-0 top-[7%] h-[29%] w-[29%] rotate-3 overflow-hidden rounded-full border-[8px] border-pm-ivory bg-pm-gold-light shadow-2xl sm:border-[12px]">
              <img src={accentImage} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-[8%] right-[2%] rounded-full bg-pm-coral px-5 py-4 text-center text-[8px] font-black uppercase tracking-[.25em] text-white shadow-xl sm:px-7 sm:py-6 sm:text-[9px]">Beauté<br />en mouvement</div>
            <div aria-hidden="true" className="absolute left-[3%] top-[7%] grid h-20 w-20 place-items-center rounded-full border border-pm-wine/25 text-3xl text-pm-wine">✦</div>
          </div>
        </div>
      </section>

      <section className="bg-pm-paper">
        <div className="mx-auto grid max-w-[1550px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[.5fr_1.5fr] lg:px-12 lg:py-36">
          <div><SectionMark index="01" label="Manifeste" /><p className="mt-8 max-w-xs text-sm leading-7 text-pm-ink/55">Une agence peut gérer des profils. Une maison construit des trajectoires, une culture et une signature.</p></div>
          <div>
            <h2 className="max-w-6xl font-playfair text-[clamp(3.2rem,6.2vw,7rem)] font-semibold leading-[.88] tracking-[-.055em]">Nous ne cherchons pas la perfection.<br /><em className="font-normal text-pm-wine">Nous révélons le singulier.</em></h2>
            <div className="mt-14 grid gap-4 sm:grid-cols-3">
              {[
                ['Repérer', 'Identifier une personnalité, une silhouette et une énergie qui ne ressemblent à aucune autre.'],
                ['Développer', 'Former chaque talent à la posture, à l’image, à la discipline et aux standards du métier.'],
                ['Connecter', 'Créer les rencontres justes entre talents, marques, stylistes, créatifs et événements.'],
              ].map(([title, text], index) => (
                <article key={title} className={`rounded-[1.8rem] p-6 sm:p-7 ${index === 0 ? 'bg-pm-peach' : index === 1 ? 'bg-pm-sage' : 'bg-pm-gold-light/45'}`}>
                  <span className="font-playfair text-3xl italic text-pm-wine">0{index + 1}</span><h3 className="mt-8 text-[10px] font-black uppercase tracking-[.24em]">{title}</h3><p className="mt-4 text-sm leading-7 text-pm-ink/58">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-pm-ink/10 bg-[#F5EBDD] py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-[1550px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div><SectionMark index="02" label="Talents" /><h2 className="mt-7 font-playfair text-5xl font-semibold tracking-[-.05em] sm:text-7xl lg:text-8xl">Le roster vivant.</h2></div>
            <Link href="/mannequins" className="inline-flex items-center gap-3 border-b border-pm-ink pb-2 text-[9px] font-black uppercase tracking-[.22em]">Tous les profils ↗</Link>
          </div>
          {featuredModels.length > 0 ? (
            <div className="mt-14 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-6">
              {featuredModels.map((model, index) => (
                <Link key={model.id} href={`/mannequins/${model.id}`} className={`group block ${index % 3 === 1 ? 'lg:translate-y-12' : ''}`}>
                  <div className={`relative overflow-hidden bg-pm-sage ${index % 3 === 2 ? 'aspect-[4/5]' : 'aspect-[3/4]'}`}>
                    <img src={model.imageUrl || fallback} alt={model.name} className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]" />
                    <span className="absolute left-4 top-4 rounded-full bg-pm-ivory/90 px-3 py-2 text-[7px] font-black uppercase tracking-[.22em] text-pm-wine backdrop-blur">PMM · 0{index + 1}</span>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4 border-t border-pm-ink/15 pt-4"><div><h3 className="font-playfair text-2xl font-semibold">{model.name}</h3><p className="mt-1 text-[8px] font-black uppercase tracking-[.2em] text-pm-ink/42">{model.location || 'Libreville'} {model.height ? `· ${model.height}` : ''}</p></div><span className="text-pm-coral transition group-hover:translate-x-1">↗</span></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-14 rounded-[2rem] border border-pm-ink/10 bg-white/65 p-8 sm:p-12"><p className="font-playfair text-4xl font-semibold">Notre roster public se prépare.</p><p className="mt-3 max-w-2xl text-sm leading-7 text-pm-ink/52">Les profils apparaissent uniquement après validation de l’agence.</p></div>
          )}
        </div>
      </section>

      <section className="bg-pm-sage py-20 sm:py-28 lg:py-36">
        <div className="mx-auto grid max-w-[1550px] gap-12 px-5 sm:px-8 lg:grid-cols-[.62fr_1.38fr] lg:px-12">
          <div><SectionMark index="03" label="Expertises" /><h2 className="mt-7 max-w-md font-playfair text-5xl font-semibold leading-[.91] tracking-[-.05em] sm:text-7xl">Tout ce qu’une présence exige.</h2><p className="mt-7 max-w-sm text-sm leading-7 text-pm-ink/55">Du premier casting à la production finale, chaque étape est pensée comme un métier à part entière.</p></div>
          <div className="border-t border-pm-ink/15">
            {services.slice(0, 6).map((service, index) => (
              <Link href={`/services/${service.slug}`} key={service.slug} className="group grid gap-3 border-b border-pm-ink/15 py-6 transition hover:bg-white/30 sm:grid-cols-[3rem_1fr_1.15fr_auto] sm:items-center sm:px-4">
                <span className="font-playfair text-2xl italic text-pm-wine">0{index + 1}</span><h3 className="font-playfair text-2xl sm:text-3xl">{service.title}</h3><p className="text-sm leading-6 text-pm-ink/48">{service.description}</p><span className="text-pm-coral transition group-hover:translate-x-1">↗</span>
              </Link>
            ))}
            {!services.length && <p className="border-b border-pm-ink/15 py-10 text-pm-ink/40">Nos expertises seront bientôt présentées ici.</p>}
          </div>
        </div>
      </section>

      <section className="bg-pm-coral text-white">
        <div className="mx-auto grid min-h-[670px] max-w-[1700px] lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative min-h-[430px] overflow-hidden lg:min-h-full"><img src={latestEvent?.coverImageUrl || secondaryImage} alt={latestEvent?.theme || 'Perfect Fashion Day'} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-pm-wine/55 to-transparent" /></div>
          <div className="flex flex-col justify-center px-5 py-20 sm:px-10 lg:px-16 xl:px-20">
            <SectionMark index="04" label="Événement signature" light />
            <p className="mt-10 text-[9px] font-black uppercase tracking-[.3em] text-white/75">Perfect Fashion Day · Édition {latestEvent?.edition || '—'}</p>
            <h2 className="mt-6 font-playfair text-[clamp(3.8rem,6.8vw,7.7rem)] font-semibold leading-[.83] tracking-[-.06em]">{latestEvent?.theme || 'La scène où les visions se rencontrent.'}</h2>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/35 pt-6 text-[9px] font-black uppercase tracking-[.18em] text-white/75"><span>{formatDate(latestEvent?.date)}</span><span>{latestEvent?.location || 'Libreville, Gabon'}</span><Link href="/fashion-day" className="text-pm-gold-light">Découvrir ↗</Link></div>
          </div>
        </div>
      </section>

      {featuredArticles.length > 0 && (
        <section className="bg-pm-paper py-20 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-[1550px] px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><div><SectionMark index="05" label="Journal" /><h2 className="mt-7 font-playfair text-5xl font-semibold tracking-[-.05em] sm:text-7xl">Dans les coulisses.</h2></div><Link href="/blog" className="inline-flex border-b border-pm-ink pb-2 text-[9px] font-black uppercase tracking-[.22em]">Tout lire ↗</Link></div>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {featuredArticles.map((article, index) => (
                <Link href={`/blog/${article.slug}`} key={article.slug} className={`group rounded-[2rem] p-3 transition hover:-translate-y-1 ${index === 0 ? 'bg-pm-peach' : index === 1 ? 'bg-pm-gold-light/35' : 'bg-pm-sage'}`}>
                  <div className="aspect-[4/3.8] overflow-hidden rounded-[1.4rem]"><img src={article.imageUrl || fallback} alt={article.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" /></div>
                  <div className="p-4"><p className="text-[8px] font-black uppercase tracking-[.24em] text-pm-wine">{article.category || 'Journal'} · {formatDate(article.date)}</p><h3 className="mt-3 font-playfair text-2xl font-semibold leading-tight sm:text-3xl">{article.title}</h3>{article.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-6 text-pm-ink/50">{article.excerpt}</p>}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-pm-gold-light/45">
        <div className="mx-auto grid max-w-[1550px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[.55fr_1.45fr] lg:items-end lg:px-12 lg:py-32">
          <div><SectionMark index="06" label="Collaboration" /><p className="mt-8 max-w-xs text-sm leading-7 text-pm-ink/55">Campagne, défilé, casting, production ou représentation : transformons votre intention en image.</p></div>
          <div><h2 className="font-playfair text-[clamp(3.5rem,7vw,7.7rem)] font-semibold leading-[.85] tracking-[-.06em]">Trouvons le visage.<br /><em className="font-normal text-pm-wine">Créons l’évidence.</em></h2><div className="mt-9"><Link href="/contact" className="control-button">Parler à l’agence <span>↗</span></Link></div></div>
        </div>
      </section>
    </main>
  );
}

function SectionMark({ index, label, light = false }: { index: string; label: string; light?: boolean }) {
  return <div className={`flex items-center gap-4 text-[8px] font-black uppercase tracking-[.34em] sm:text-[9px] ${light ? 'text-white' : 'text-pm-wine'}`}><span>{index}</span><span className={`h-px w-10 ${light ? 'bg-white/55' : 'bg-pm-coral'}`} /><span>{label}</span></div>;
}
