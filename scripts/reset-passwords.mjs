/**
 * reset-passwords.mjs
 * Réinitialise le mot de passe de TOUS les comptes Firebase Auth
 * (mannequins, jury, staff, admin) à "Pmm2026".
 *
 * Usage: node scripts/reset-passwords.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth }             from 'firebase-admin/auth';

const serviceAccount = {
  type: "service_account",
  project_id: "perfect-156b5",
  private_key_id: "fd8972b3a5901bb68bcb4225b330a79b21fb5299",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxCJ3lZCFnNc+t\n7eCPmnmmCNR4TTl9xFU453OB5bRi+T3/eeNmunpq/JtWoeRv+PeoWKwpw1mcLM8G\nnzf2fuGNZC7iDF492/B0JIWT+W8BTBeypiUo6mk59rd7HNLcNvx3Nezvgv1fQWmd\nGvHy5dM0HrguRlJnqDQDUxd+Pkp3xbaqLxw2MYt9iWH0CjgVGxqxq6nBf68JpSRQ\nktsIXm2luNd098DZYvmTlMDXGJ6y0jjzgEfky3FmSawPRPt1Tv6TXyvri2ni38Ph\nEs9dGPFMN2VIqfsWsbsiEkyt3ZbQj9Mv3bifLprUa1CtXtTe3jjljRJZzhon6Yp/\nA0Xop9R/AgMBAAECggEACfon1+1AOq5cMXu2C7HTiEl4G/2SL2XYvbfBmUEGXQuZ\n9GN8ruX0j0IESSofkzXvUzQII+RoEPavhjqD72bwNEVApSm4R/k0wH7sbk4A9QxC\nS6W0c21el88xQQV7VsDckqVd4JO7ztoDZ0DFAQD12bqfe7An5cKjh8pviQReswg/\n6FUxwLp5ygSRum2RfqTWkAtYh7Ue7dxGP0Sp1/e8XVoWg9shX4TOBiRL0NkP4uQU\naZJfvbdxlQe6dHmPOvlfDzzdw1of1NBL43pfpnaqx3a9THFXtQvfoXZXdcotpbv5\n+pP5cvQ5W+rQyf3F1RVyU2HvUtqUClJt+YHgexotRQKBgQDriM54FRz0ZOTu6h9A\nf4mi7NSq92wL2qPq2usMAktDNt/vQGuXqifQeg7gzEBUEdEBFH9Zpmamb2K7xjfC\nK+bgAhPaID6LyOKGNNmNSy8scuUfsIgEbkfeQC3jW658LK6cY51doUYirDCb54pr\nDwTNHrCDFgXx4LvsNz/ypfMfHQKBgQDAaoc07Na6nlpfocHwvg6yy5qeyj1RiV9F\nnubW2MZPwDi9GQVerqWehCK6kd7/mmNOj1hy3SwcRJzhgg8UuQ9Cq8axZLpU3sEQ\nouIXNmIlLptyLuiq6J/g4Q/6jZLqi16m8G9YrMSCi0M3k2+3fBoyx8d5jOlmNtuI\nlyJi0oPjSwKBgD5VNk8RR1hmWy/fReYL2qEDjESytiVs93Rv+0RyVviyzRDEO7Un\nkuHZa5aSd3PIQ0fF5O4U25WwZLDNBHSeqbse0aIoZmUYBNr/oZODEjjxLzHzxgtm\nJB7tXTeOS98Q9CTvN/ZPeAA1Eagw3rD2iI7AUHZgnbIlh5Y8CPBueqkBAoGBAIge\nVEvSiA043MHuUp6WNRuzAUz30O0Pe0BrKu4uKAxe9USAoNXcQvmijFbjvpefhkUb\nDv0jDYNp3nmBYl3MlMkbb9Iqac6ETpwQPlUhecjH8duS57GQIxoY3Q7ofFhEA8+h\nI4PdpJ6dGg4E1PE+b+IghjKsxqgygpdcI005k2eFAoGAQIOI99xf7km5yERGVANn\nQ6msLvLwA0HHUIose93+AwfsGUZl6Ai6yJ06qthC0g080n1D90ACiwsSaAl/8Dl/\nno1RRxlZFJX4U1XpczmejCabgh8n0obBoHlHUORL0vMpORwOUGTx/J8uSyxKEU96\nLVuAxjsO/Petfu4zvj2x0rQ=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@perfect-156b5.iam.gserviceaccount.com",
  client_id: "118127840207205322048",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

const NEW_PASSWORD = 'Pmm2026';

const app       = initializeApp({ credential: cert(serviceAccount) });
const adminAuth = getAuth(app);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('🔑 Reset mot de passe → ' + NEW_PASSWORD);
  console.log('─'.repeat(70));

  let pageToken;
  let total = 0, ok = 0, errors = 0;

  do {
    const result = await adminAuth.listUsers(1000, pageToken);

    for (const user of result.users) {
      total++;
      try {
        await adminAuth.updateUser(user.uid, { password: NEW_PASSWORD });
        console.log(`  ✅ ${(user.displayName || user.email || user.uid).padEnd(40)} ${user.email || ''}`);
        ok++;
      } catch (err) {
        console.log(`  ❌ ${user.email || user.uid} → ${err.message}`);
        errors++;
      }
      await sleep(50); // éviter rate limiting
    }

    pageToken = result.pageToken;
  } while (pageToken);

  console.log('\n' + '─'.repeat(70));
  console.log(`✅ ${ok}/${total} comptes mis à jour  |  ❌ ${errors} erreur(s)`);
  process.exit(errors > 0 ? 1 : 0);
}

main().catch(err => { console.error('Erreur fatale:', err.message); process.exit(1); });
