/**
 * Script de seed autonome pour ajouter l'article Grace Elsa dans Firebase.
 * Ne dépend d'aucun import TypeScript local.
 */

const FIREBASE_API_KEY = 'AIzaSyBawZl4SJz7drhzIrG0dnazSglyF6vmKCg';
const DATABASE_URL = 'https://perfect-156b5-default-rtdb.firebaseio.com';

async function adminSignIn() {
  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@perfectmodels.online',
        password: 'Pmm2026@',
        returnSecureToken: true,
      }),
    }
  );
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Sign in failed: ${JSON.stringify(data.error)}`);
  return data.idToken;
}

const graceElsaArticle = {
  slug: 'grace-elsa-egerie-gagnante-troisieme-edition-perfect-fashion-day',
  title: 'Grace Elsa : Égérie Officielle et Grande Gagnante de la 3e Édition du Perfect Fashion Day',
  category: 'Événements · Égérie · Portrait · Fashion Day',
  excerpt:
    "Découvrez le portrait captivant de Grace Elsa, couronnée Égérie Officielle de la 3e Édition du Perfect Fashion Day. Un visage angélique, un charisme magnétique et une prestance naturelle qui incarnent l'excellence de la mode et de la culture au Gabon.",
  imageUrl: '/images/grace-elsa.jpg',
  author: 'Perfect Models Management',
  date: '2026-08-21',
  status: 'published',
  isFeatured: true,
  photographer: 'Gaumintiseur',
  brands: ['Perfect Models Management', 'Perfect Fashion Day 3'],
  tags: [
    'Grace Elsa',
    'Égérie',
    'Perfect Fashion Day 3',
    'Gagnante',
    'Concours Égérie',
    'Mannequinat Gabon',
    'Libreville',
    'Focus Model 241',
  ],
  reactions: { likes: 0, dislikes: 0 },
  viewCount: 0,
  content: [
    {
      type: 'paragraph',
      text: "C'est dans une atmosphère féerique marquant l'aboutissement de la 3e Édition du Perfect Fashion Day que Grace Elsa a été sacrée Égérie Officielle. Face à une sélection rigoureuse des plus beaux espoirs du mannequinat au Gabon, sa grâce naturelle, son port altier et son charisme singulier ont unanimement séduit le jury et le public.",
    },
    {
      type: 'image',
      src: '/images/grace-elsa.jpg',
      alt: 'Grace Elsa - Égérie Officielle de la 3e Édition du Perfect Fashion Day',
      caption: 'Grace Elsa, Égérie Officielle de la 3e Édition du Perfect Fashion Day — Photo : Gaumintiseur',
    },
    {
      type: 'heading',
      level: 2,
      text: "Grace Elsa : le portrait d'une révélation",
    },
    {
      type: 'paragraph',
      text: "Dès ses premiers pas sur le podium et lors des séances photos officielles, Grace Elsa a fait preuve d'une présence captivante. Arborant une coupe afropunk naturelle sublimée par une tenue drapée émeraude et dorée, elle incarne une beauté authentique, fière et contemporaine. Son regard déterminé et son sourire empreint de sérénité font d'elle l'ambassadrice idéale de la vision PMM.",
    },
    {
      type: 'quote',
      text: "Le titre d'Égérie du Perfect Fashion Day est le début d'une grande aventure. C'est l'opportunité de porter haut les couleurs du mannequinat gabonais et d'inspirer toute une génération de jeunes talents.",
      author: 'Grace Elsa',
    },
    {
      type: 'heading',
      level: 2,
      text: "Le rôle d'Égérie Officielle PFD 3",
    },
    {
      type: 'paragraph',
      text: "En tant que gagnante du concours Égérie, Grace Elsa occupera une place centrale au sein des activités de Perfect Models Management durant toute l'année. Elle sera la vedette des campagnes visuelles majeures, participera aux défilés de haute couture des créateurs phares et représentera l'agence lors des grands événements culturels et de mode à Libreville et à l'international.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Retour sur le succès du Perfect Fashion Day 3',
    },
    {
      type: 'paragraph',
      text: "Le Perfect Fashion Day s'impose plus que jamais comme le rendez-vous majeur de la mode, du stylisme et de la culture au Gabon. Cette 3e édition a réuni des créateurs visionnaires, des artistes de renom et un public passionné venu célébrer la création africaine et l'excellence du podium.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Une nouvelle icône pour la mode gabonaise 🇬🇦',
    },
    {
      type: 'paragraph',
      text: "Avec ce sacre mérité, Grace Elsa s'inscrit désormais parmi les figures emblématiques représentées par Perfect Models Management. Toute l'équipe de l'agence et les acteurs de la mode au Gabon célèbrent cette brillante victoire et lui souhaitent une carrière internationale riche et florissante.",
    },
  ],
};

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Seed : Article Grace Elsa → Firebase');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('🔑 Connexion admin...');
  const token = await adminSignIn();
  console.log('✅ Token obtenu.\n');

  // Fetch current articles
  const getResp = await fetch(`${DATABASE_URL}/articles.json?auth=${token}`);
  const currentDbData = await getResp.json();

  let existingArticles = [];
  if (Array.isArray(currentDbData)) {
    existingArticles = currentDbData.filter(Boolean);
  } else if (currentDbData && typeof currentDbData === 'object') {
    existingArticles = Object.values(currentDbData).filter(Boolean);
  }

  console.log(`📡 Articles actuellement en base : ${existingArticles.length}`);

  // Check if Grace Elsa article already exists
  const already = existingArticles.find(
    (a) => a.slug === graceElsaArticle.slug
  );
  if (already) {
    console.log('⚠️  L\'article Grace Elsa existe déjà en base. Mise à jour...');
    existingArticles = existingArticles.filter(
      (a) => a.slug !== graceElsaArticle.slug
    );
  }

  // Insert Grace Elsa article at the front (so it appears first)
  const mergedArticles = [graceElsaArticle, ...existingArticles];

  console.log(`\n✨ Total articles à sauvegarder : ${mergedArticles.length}`);

  const putResp = await fetch(`${DATABASE_URL}/articles.json?auth=${token}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mergedArticles),
  });

  if (!putResp.ok) {
    const errText = await putResp.text();
    throw new Error(`Échec écriture Firebase : ${errText}`);
  }

  console.log('\n🎉 SUCCÈS ! Article Grace Elsa publié dans Firebase.');
  console.log(`📰 Slug : ${graceElsaArticle.slug}`);
  console.log(`🏆 Titre : ${graceElsaArticle.title}`);
}

main().catch((err) => {
  console.error('❌ Erreur :', err);
  process.exit(1);
});
