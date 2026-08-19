/**
 * API — Gestion des permissions admin par utilisateur
 *
 * GET  /api/admin/permissions         → liste tous les utilisateurs admin avec leurs permissions
 * PUT  /api/admin/permissions         → { uid, permissions: AdminPagePermissions } → sauvegarde
 * POST /api/admin/permissions/promote → { uid, email, name, identifier } → promouvoit en admin délégué
 */

import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { firebaseDatabaseGet, firebaseDatabasePut, firebaseDatabasePatch, getValidFirebaseIdToken } from '@/lib/firebase-backend';

export const dynamic = 'force-dynamic';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Seul l'admin principal (all:true) peut gérer les permissions */
async function requireSuperAdmin() {
  const profile = await getCurrentAppProfile();
  if (!profile || profile.role !== 'admin') return null;
  if (!(profile.permissions as any)?.all && !(profile.permissions as any)?.isAdmin) return null;
  return profile;
}

// ── GET — liste des admins avec permissions ────────────────────────────────────

export async function GET() {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  try {
    // 1. Lire tous les noeuds users/* qui ont role=admin
    const usersNode = await firebaseDatabaseGet('users').catch(() => null);
    const users: Record<string, any> = usersNode && typeof usersNode === 'object' ? usersNode : {};

    // 2. Lire toutes les permissions admin
    const permNode = await firebaseDatabaseGet('adminPermissions').catch(() => null);
    const perms: Record<string, any> = permNode && typeof permNode === 'object' ? permNode : {};

    const adminUsers = Object.entries(users)
      .filter(([, u]) => u?.role === 'admin' || u?.app_role === 'admin')
      .map(([uid, u]) => ({
        uid,
        email: u.email || '',
        name: u.name || u.displayName || u.email || uid,
        identifier: u.identifier || u.matricule || '',
        permissions: perms[uid] || {},
        isSuper: !!(u.permissions?.all || u.permissions?.isAdmin),
      }));

    return NextResponse.json({ users: adminUsers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── PUT — sauvegarder les permissions d'un admin délégué ──────────────────────

export async function PUT(request: Request) {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const uid = String(body.uid || '').trim();
  const permissions = body.permissions;

  if (!uid || !permissions || typeof permissions !== 'object') {
    return NextResponse.json({ error: 'uid et permissions requis.' }, { status: 400 });
  }

  try {
    await firebaseDatabasePut(`adminPermissions/${uid}`, permissions);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
