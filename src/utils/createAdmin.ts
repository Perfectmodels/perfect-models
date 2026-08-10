// Script pour créer le compte admin Firebase depuis la console admin
// À placer dans AdminModelAccess.tsx comme fonction

const createAdminFirebase = async () => {
  if (!confirm('Créer le compte admin Firebase (admin@perfectmodels.online / Pmm2026@) ?')) return;
  
  try {
    const { auth } = await import('../firebase');
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    
    await createUserWithEmailAndPassword(auth, 'admin@perfectmodels.online', 'Pmm2026@');
    alert('✅ Compte admin Firebase créé avec succès!\nVous pouvez maintenant vous connecter avec admin@perfectmodels.online / Pmm2026@');
    
    // Notifier l'admin
    const { notifyAdmin } = await import('../utils/adminNotify');
    notifyAdmin('migration', 'Compte admin Firebase créé', '/admin').catch(() => {});
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      alert('ℹ️ Le compte admin existe déjà dans Firebase Auth');
    } else {
      alert('❌ Erreur: ' + error.message);
    }
  }
};

// Export pour utilisation dans AdminModelAccess
export { createAdminFirebase };