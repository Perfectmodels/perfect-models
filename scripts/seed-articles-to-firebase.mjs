import { magazineAdditions } from '../src/constants/magazineAdditions.ts';
import { dorcasArticle } from '../src/constants/dorcasArticle.ts';
import { articles as seedArticles } from '../src/constants/magazineData.ts';

const FIREBASE_API_KEY = 'AIzaSyBawZl4SJz7drhzIrG0dnazSglyF6vmKCg';
const DATABASE_URL = 'https://perfect-156b5-default-rtdb.firebaseio.com';

async function adminSignIn() {
  const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@perfectmodels.online', password: 'Pmm2026@', returnSecureToken: true }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Sign in failed: ${JSON.stringify(data.error)}`);
  return data.idToken;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Seeding All Local Articles to Firebase Database');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('🔑 Signing in as admin@perfectmodels.online...');
  const token = await adminSignIn();
  console.log('✅ Admin ID Token obtained.\n');

  // Fetch current articles in Database
  const getResp = await fetch(`${DATABASE_URL}/articles.json?auth=${token}`);
  const currentDbData = await getResp.json();
  let existingArticles = [];
  if (Array.isArray(currentDbData)) {
    existingArticles = currentDbData.filter(Boolean);
  } else if (currentDbData && typeof currentDbData === 'object') {
    existingArticles = Object.values(currentDbData).filter(Boolean);
  }

  console.log(`📡 Current articles in Database: ${existingArticles.length}`);
  console.log(`📦 Local seedArticles count: ${seedArticles.length}`);
  console.log(`📦 Local magazineAdditions count: ${magazineAdditions.length}`);

  // Merge all articles. Local additions & seedArticles take priority to ensure fresh content is synced.
  const allArticles = [...magazineAdditions, dorcasArticle, ...existingArticles, ...seedArticles];
  const seenSlugs = new Set();
  const mergedArticles = [];

  for (const art of allArticles) {
    if (!art || !art.slug) continue;
    const slugKey = String(art.slug).trim();
    if (seenSlugs.has(slugKey)) continue;
    seenSlugs.add(slugKey);
    mergedArticles.push({
      ...art,
      status: art.status || 'published',
    });
  }

  console.log(`\n✨ Total unique articles to save: ${mergedArticles.length}`);

  // Write back to Firebase Database
  const putResp = await fetch(`${DATABASE_URL}/articles.json?auth=${token}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mergedArticles),
  });

  if (!putResp.ok) {
    const errText = await putResp.text();
    throw new Error(`Failed to write articles: ${errText}`);
  }

  console.log('🎉 SUCCESS! All articles have been migrated and stored in Firebase Database.');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
