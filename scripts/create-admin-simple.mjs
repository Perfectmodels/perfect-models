// Script pour créer le compte admin Firebase via API REST
const API_KEY = "AIzaSyBawZl4SJz7drhzIrG0dnazSglyF6vmKCg";

async function createAdminViaRest() {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@perfectmodels.online',
          password: 'Pmm2025',
          returnSecureToken: true
        })
      }
    );
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Compte admin créé:', data.email);
      console.log('LocalId (UID):', data.localId);
    } else if (res.status === 400) {
      console.log('ℹ️ L\'email existe probablement déjà');
    } else {
      console.error('❌ Erreur:', await res.text());
    }
  } catch (err) {
    console.error('Erreur:', err);
  }
}

createAdminViaRest();
export {};