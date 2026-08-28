import Link from 'next/link';

type Model = { id: string; name: string; imageUrl?: string; height?: string; gender?: string; location?: string };
type Service = { slug: string; title: string; description?: string; category?: string };
type Event = { edition: number; theme: string; date: string; location?: string; description?: string; coverImageUrl?: string };
type Article = { slug: string; title: string; imageUrl?: string; category?: string; date: string; excerpt?: string };
type Props = { models: Model[]; services: Service[]; events: Event[]; articles: Article[] };

const fallback = '/logopmm.jpg';

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
  const heroImage = featuredModels[0]?.imageUrl || latestEvent?.coverImageUrl || featuredArticles[0]?.imageUrl || fallback;
  const secondaryImage = featuredModels[1]?.imageUrl || latestEvent?.coverImageUrl || featuredArticles[0]?.imageUrl || heroImage;

  return (
    <main className="overflow-hidden bg-pm-ivory text-pm-ink">
      <section className="relative isolate min-h-[calc(100svh-78px)] overflow-hidden bg-pm-dark text-pm-ivory">
        <div aria-hidden="true" className="absolute inset-0 -z-30 bg-[#08080a]" />
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-20 w-full lg:w-[58%]">
          <img src={heroImage} alt="" className="h-full w-full object-cover object-center opacity-88" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/30 to-transparent lg:from-[#08080a]/92 lg:via-[#08080a]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15" />
        </div>
        <div aria-hidden="true" className="absolute -left-[4vw] bottom-[-2vw] -z-10 select-none whitespace-nowrap font-playfair text-[clamp(8rem,23vw,24rem)] font-semibold leading-[.7] tracking-[-.08em] text-white/[.028]">PERFECT</div>

        <div className="mx-auto flex min-h-[calc(100svh-78px)] max-w-[1700px] flex-col justify-between px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16 xl:px-16">
          <div className="flex max-w-2xl items-center gap-4 text-[8px] font-black uppercase tracking-[.42em] text-pm-gold-light sm:text-[9px]">
            <span>Perfect Models Management</span>
            <span className="h-px w-10 bg-current/40" />
            <span>Libreville</span>
          </div>

          <div className="max-w-[940px] py-16 sm:py-20 lg:py-14">
            <p className="mb-6 text-[9px] font-black uppercase tracking-[.38em] text-white/45 sm:text-[10px]">Management · Casting · Production</p>
            <h1 className="max-w-5xl font-playfair text-[clamp(4.1rem,9vw,9.5rem)] font-semibold leading-[.78] tracking-[-.065em] text-pm-ivory">
              Plus qu’un visage.<br />
              <em className="font-normal text-pm-gold-light">Une présence.</em>
            </h1>
            <p className="mt-8 max-w-xl text-sm leading-7 text-white/62 sm:mt-10 sm:text-base sm:leading-8">
              Nous révélons, préparons et représentons des talents capables d’incarner la mode, la publicité et les grandes scènes créatives du Gabon.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 sm:mt-11">
              <Link href="/mannequins" className="pmm-button pmm-button--light">Découvrir les talents <span aria-hidden="true">↗</span></Link>
              <Link href="/contact?subject=booking" className="pmm-button pmm-button--ghost">Booker un talent</Link>
            </div>
          </div>

          <div className="grid max-w-3xl grid-cols-3 border-t border-white/15 pt-5 text-[8px] font-black uppercase tracking-[.24em] text-white/38 sm:text-[9px]">
            <span>Depuis 2021</span>
            <span className="text-center">Mode · Image · Culture</span>
            <span className="text-right">Gabon</span>
          </div>
        </div>
      </section>

      <section className="bg-pm-ivory">
        <div className="mx-auto grid max-w-[1550px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[.55fr_1.45fr] lg:px-12 lg:py-36">
          <div className="lg:pt-2">
            <SectionMark index="01" label="Notre vision" dark />
            <p className="mt-10 max-w-xs text-sm leading-7 text-pm-ink/55">Une agence n’est pas seulement un portefeuille de visages. C’est une direction, une discipline et une exigence de représentation.</p>
          </div>
          <div>
            <h2 className="max-w-6xl font-playfair text-[clamp(3.2rem,6.3vw,7rem)] font-semibold leading-[.9] tracking-[-.052em]">
              Le talent attire le regard.<br />
              <em className="font-normal text-pm-wine">La préparation crée la différence.</em>
            </h2>
            <div className="mt-14 grid gap-8 border-t border-pm-ink/15 pt-8 sm:grid-cols-3 lg:mt-16">
              {[
                ['Repérer', 'Identifier les personnalités, les silhouettes et les potentiels singuliers.'],
                ['Développer', 'Former les talents à la posture, à l’image et aux standards professionnels.'],
                ['Connecter', 'Créer le lien juste entre talents, marques, créatifs et événements.'],
              ].map(([title, text], index) => (
                <div key={title} className="border-t border-pm-ink/10 pt-5 sm:border-t-0 sm:pt-0">
                  <span className="font-playfair text-3xl italic text-pm-gold-deep">0{index + 1}</span>
                  <h3 className="mt-5 font-montserrat text-[10px] font-black uppercase tracking-[.24em]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-pm-ink/55">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-pm-ink/10 bg-[#ece5db] py-20 text-pm-ink sm:py-28 lg:py-36">
        <div className="mx-auto max-w-[1550px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionMark index="02" label="Talents" dark />
              <h2 className="mt-8 font-playfair text-5xl font-semibold tracking-[-.045em] sm:text-7xl lg:text-8xl">Le roster PMM.</h2>
            </div>
            <Link href="/mannequins" className="pmm-text-link !text-pm-ink">Tous les profils <span>↗</span></Link>
          </div>

          {featuredModels.length > 0 ? (
            <div className="mt-14 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
              {featuredModels.map((model, index) => (
                <Link key={model.id} href={`/mannequins/${model.id}`} className={`group block ${index === 1 || index === 3 ? 'lg:translate-y-12' : ''}`}>
                  <div className="relative aspect-[3/4.2] overflow-hidden bg-pm-ink/10">
                    <img src={model.imageUrl || fallback} alt={model.name} className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70" />
                    <span className="absolute left-4 top-4 text-[8px] font-black uppercase tracking-[.24em] text-white/65">PMM · 0{index + 1}</span>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4 border-t border-pm-ink/15 pt-4">
                    <div>
                      <h3 className="font-playfair text-xl font-semibold sm:text-2xl">{model.name}</h3>
                      <p className="mt-1 text-[8px] font-black uppercase tracking-[.24em] text-pm-ink/42">{model.location || 'Libreville'} {model.height ? `· ${model.height}` : ''}</p>
                    </div>
                    <span className="text-pm-wine transition group-hover:translate-x-1">↗</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-14 grid gap-8 border-y border-pm-ink/15 py-12 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="font-playfair text-4xl font-semibold">Notre roster public se prépare.</p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-pm-ink/52">Les profils sont publiés uniquement après validation de l’agence. Aucun mannequin fictif n’est affiché.</p>
              </div>
              <Link href="/casting-formulaire" className="pmm-button border-pm-ink bg-pm-ink text-pm-ivory hover:border-pm-wine hover:bg-pm-wine">Rejoindre l’agence ↗</Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-pm-ink py-20 text-pm-ivory sm:py-28 lg:py-36">
        <div className="mx-auto max-w-[1550px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[.62fr_1.38fr]">
            <div>
              <SectionMark index="03" label="Expertises" />
              <h2 className="mt-8 max-w-md font-playfair text-5xl font-semibold leading-[.93] tracking-[-.045em] sm:text-7xl">Construire l’image juste.</h2>
              <p className="mt-8 max-w-sm text-sm leading-7 text-white/42">Casting, booking, formation, stylisme, production : chaque service répond à une exigence professionnelle précise.</p>
            </div>
            <div className="border-t border-white/15">
              {services.slice(0, 6).map((service, index) => (
                <Link href={`/services/${service.slug}`} key={service.slug} className="group grid gap-4 border-b border-white/15 py-7 transition hover:bg-white/[.035] sm:grid-cols-[4rem_1.05fr_1.35fr_auto] sm:items-center sm:px-4">
                  <span className="font-playfair text-2xl italic text-pm-gold">0{index + 1}</span>
                  <h3 className="font-playfair text-2xl text-white sm:text-3xl">{service.title}</h3>
                  <p className="text-sm leading-6 text-white/42">{service.description}</p>
                  <span className="text-pm-gold transition group-hover:translate-x-1">↗</span>
                </Link>
              ))}
              {!services.length && <p className="border-b border-white/15 py-10 text-white/40">Nos expertises seront bientôt présentées ici.</p>}
              <div className="mt-8 flex justify-end"><Link href="/services" className="pmm-text-link">Voir toutes les expertises <span>↗</span></Link></div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate min-h-[680px] overflow-hidden bg-pm-wine text-pm-ivory">
        <div aria-hidden="true" className="absolute inset-0 -z-20">
          <img src={latestEvent?.coverImageUrl || secondaryImage} alt="" className="h-full w-full object-cover opacity-55" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-pm-wine via-pm-wine/92 to-pm-wine/28" />
        <div className="mx-auto grid min-h-[680px] max-w-[1550px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[.58fr_1.42fr] lg:items-end lg:px-12 lg:py-28">
          <div>
            <SectionMark index="04" label="Événement signature" />
            <p className="mt-9 max-w-xs text-sm leading-7 text-white/58">Perfect Fashion Day réunit talents, créateurs et partenaires autour d’une vision contemporaine de la mode au Gabon.</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.38em] text-pm-gold-light">Perfect Fashion Day · Édition {latestEvent?.edition || '—'}</p>
            <h2 className="mt-6 max-w-5xl font-playfair text-[clamp(3.5rem,7.2vw,8rem)] font-semibold leading-[.84] tracking-[-.055em]">{latestEvent?.theme || 'La scène où les visions se rencontrent.'}</h2>
            <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-white/25 pt-6 text-[9px] font-black uppercase tracking-[.18em] text-white/65 sm:text-[10px]">
              <span>{formatDate(latestEvent?.date)}</span>
              <span>{latestEvent?.location || 'Libreville, Gabon'}</span>
              <Link href="/fashion-day" className="text-pm-gold-light transition hover:text-white">Découvrir ↗</Link>
            </div>
          </div>
        </div>
      </section>

      {featuredArticles.length > 0 && (
        <section className="bg-pm-ivory py-20 text-pm-ink sm:py-28 lg:py-36">
          <div className="mx-auto max-w-[1550px] px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div><SectionMark index="05" label="Journal" dark /><h2 className="mt-8 font-playfair text-5xl font-semibold tracking-[-.045em] sm:text-7xl">La vie de l’agence.</h2></div>
              <Link href="/magazine" className="pmm-text-link !text-pm-ink">Tout lire <span>↗</span></Link>
            </div>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {featuredArticles.map((article, index) => (
                <Link href={`/magazine/${article.slug}`} key={article.slug} className="group">
                  <div className={`overflow-hidden bg-pm-ink ${index === 1 ? 'aspect-[4/5] md:-mt-7' : 'aspect-[4/4.35]'}`}>
                    <img src={article.imageUrl || fallback} alt={article.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                  </div>
                  <p className="mt-5 text-[8px] font-black uppercase tracking-[.28em] text-pm-wine">{article.category || 'Journal'} · {formatDate(article.date)}</p>
                  <h3 className="mt-3 font-playfair text-2xl font-semibold leading-tight sm:text-3xl">{article.title}</h3>
                  {article.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-6 text-pm-ink/48">{article.excerpt}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-pm-sand text-pm-ink">
        <div className="mx-auto grid max-w-[1550px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[.62fr_1.38fr] lg:items-end lg:px-12 lg:py-32">
          <div><SectionMark index="06" label="Collaboration" dark /><p className="mt-9 max-w-xs text-sm leading-7 text-pm-ink/52">Campagne, défilé, casting, production ou représentation : parlons de votre projet.</p></div>
          <div>
            <h2 className="font-playfair text-[clamp(3.5rem,7vw,7.7rem)] font-semibold leading-[.86] tracking-[-.055em]">Trouvons le visage.<br /><em className="font-normal text-pm-wine">Créons l’image.</em></h2>
            <div className="mt-9"><Link href="/contact" className="pmm-button border-pm-ink bg-pm-ink text-pm-ivory hover:border-pm-wine hover:bg-pm-wine">Parler à l’agence <span>↗</span></Link></div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionMark({ index, label, dark = false }: { index: string; label: string; dark?: boolean }) {
  return (
    <div className={`flex items-center gap-4 text-[8px] font-black uppercase tracking-[.36em] sm:text-[9px] ${dark ? 'text-pm-wine' : 'text-pm-gold'}`}>
      <span>{index}</span>
      <span className={`h-px w-10 ${dark ? 'bg-pm-wine/40' : 'bg-pm-gold/45'}`} />
      <span>{label}</span>
    </div>
  );
}
