'use client';
import React from'react';
import{Link,useNavigate}from'react-router-dom';
import{AcademicCapIcon,ArrowRightOnRectangleIcon,CalendarDaysIcon,ChatBubbleLeftRightIcon,ClipboardDocumentCheckIcon,CurrencyDollarIcon,EnvelopeIcon,UserGroupIcon}from'@heroicons/react/24/outline';
import SEO from'../components/SEO';
import{useAuth}from'../contexts/AuthContext';

const MODULES=[
 {label:'Classroom',href:'/admin/classroom',icon:AcademicCapIcon,description:'Cours, progression, quiz, demandes et suivi pédagogique.'},
 {label:'Progression',href:'/admin/classroom-progress',icon:ClipboardDocumentCheckIcon,description:'Analyse détaillée de l’avancement de chaque mannequin.'},
 {label:'Mannequins',href:'/admin/models',icon:UserGroupIcon,description:'Consulter et gérer les profils selon vos permissions.'},
 {label:'Absences',href:'/admin/absences',icon:CalendarDaysIcon,description:'Justificatifs, décisions et suivi des absences.'},
 {label:'Cotisations',href:'/admin/payments',icon:CurrencyDollarIcon,description:'Suivi des cotisations et preuves soumises.'},
 {label:'Messages',href:'/admin/messages',icon:ChatBubbleLeftRightIcon,description:'Échanges opérationnels avec les mannequins.'},
 {label:'Briefings',href:'/admin/artistic-direction',icon:EnvelopeIcon,description:'Briefs et propositions de shootings.'},
];
export default function ManagerDashboard(){const{user,logout}=useAuth();const nav=useNavigate();const signout=async()=>{await logout();nav('/login')};return <div className="min-h-screen bg-[#060606] text-white"><SEO title="Manager — Perfect Models Management" noIndex/><header className="border-b border-white/10 px-5 py-5"><div className="mx-auto flex max-w-7xl items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.3em] text-pm-gold">Perfect Models Management</p><p className="mt-1 text-sm text-white/40">Espace Manager</p></div><button onClick={signout} className="flex items-center gap-2 text-xs text-white/40 hover:text-red-300"><ArrowRightOnRectangleIcon className="h-4 w-4"/>Déconnexion</button></div></header><main className="mx-auto max-w-7xl px-5 py-10"><p className="text-[10px] font-black uppercase tracking-[.35em] text-pm-gold">Pilotage opérationnel</p><h1 className="mt-2 font-playfair text-4xl font-black">Bonjour {user?.displayName||'Manager'}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">Vous disposez d’un accès proche du tableau de bord administrateur, limité aux fonctions opérationnelles autorisées. Les paramètres sensibles, comptes administrateurs, permissions et configurations techniques restent réservés au super-administrateur.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{MODULES.map(m=><Link key={m.href} to={m.href} className="group rounded-2xl border border-white/10 bg-white/[.03] p-6 transition hover:border-pm-gold/40 hover:bg-pm-gold/[.04]"><m.icon className="h-7 w-7 text-pm-gold"/><h2 className="mt-5 font-playfair text-2xl font-bold">{m.label}</h2><p className="mt-2 text-sm leading-6 text-white/40">{m.description}</p><span className="mt-5 inline-block text-[9px] font-black uppercase tracking-[.25em] text-pm-gold">Ouvrir →</span></Link>)}</div></main></div>}
