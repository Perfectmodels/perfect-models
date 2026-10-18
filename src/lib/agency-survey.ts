export type SurveyQuestion = {
  id: number;
  section: number;
  label: string;
  type: 'single' | 'multiple' | 'scale' | 'text';
  options?: string[];
  internal?: boolean;
  optional?: boolean;
  maxSelections?: number;
};

export const SURVEY_SECTIONS = [
  'Votre relation avec l’agence',
  'Image et réputation',
  'Organisation interne',
  'Direction et climat humain',
  'Mannequins et opportunités',
  'Communication et événements',
  'Transparence et engagements',
  'Satisfaction et perspectives',
  'Parole libre',
] as const;

const single = (id: number, section: number, label: string, options: string[], internal = false, optional = true): SurveyQuestion =>
  ({ id, section, label, type: 'single', options, internal, optional });
const multiple = (id: number, section: number, label: string, options: string[], internal = false, maxSelections?: number): SurveyQuestion =>
  ({ id, section, label, type: 'multiple', options, internal, optional: true, maxSelections });
const text = (id: number, section: number, label: string, internal = false): SurveyQuestion =>
  ({ id, section, label, type: 'text', internal, optional: true });

const general = ['Toujours', 'Souvent', 'Parfois', 'Rarement', 'Jamais', 'Je ne sais pas', 'Non concerné(e)'];
const quality = ['Excellente', 'Bonne', 'Moyenne', 'Mauvaise', 'Très mauvaise', 'Je ne sais pas'];
const satisfaction = ['Très satisfait(e)', 'Satisfait(e)', 'Moyennement satisfait(e)', 'Insatisfait(e)', 'Très insatisfait(e)', 'Non concerné(e)'];
export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  single(1,0,'Quel est votre lien avec Perfect Models Management ?', ['Mannequin actuellement dans l’agence','Ancien(ne) mannequin','Candidat(e) souhaitant intégrer l’agence','Collaborateur ou membre de l’équipe','Client ou partenaire','Prestataire externe','Observateur extérieur','Autre','Je préfère ne pas répondre'],false,false),
  single(2,0,'Depuis combien de temps connaissez-vous Perfect Models Management ?', ['Moins de 3 mois','Entre 3 et 6 mois','Entre 6 mois et 1 an','Entre 1 et 3 ans','Plus de 3 ans']),
  single(3,0,'Comment avez-vous découvert l’agence ?', ['Réseaux sociaux','Recommandation d’un proche','Événement ou défilé','Site internet','Casting ou recrutement','Autre']),
  single(4,1,'Quelle image avez-vous globalement de Perfect Models Management ?', ['Très positive','Positive','Mitigée','Négative','Très négative']),
  multiple(5,1,'Quels sont les principaux points forts de l’agence ?', ['Qualité et potentiel des mannequins','Professionnalisme de l’équipe','Organisation des événements','Visibilité sur les réseaux sociaux','Créativité et innovation','Encadrement des talents','Réseau professionnel','Image et identité de marque','Aucun en particulier','Autre']),
  multiple(6,1,'Quels sont les principaux points faibles de l’agence ?', ['Communication insuffisante','Mauvaise organisation','Manque de transparence','Manque d’opportunités','Manque de professionnalisme','Favoritisme','Encadrement insuffisant','Mauvaise gestion des conflits','Engagements non respectés','Manque de moyens','Aucun en particulier','Autre']),
  single(7,1,'Recommanderiez-vous Perfect Models Management ?', ['Oui, sans hésitation','Probablement oui','Je suis partagé(e)','Probablement non','Non']),
  single(8,2,'Comment évaluez-vous l’organisation générale de l’agence ?', quality),
  single(9,2,'Les rôles et responsabilités sont-ils clairement définis ?', ['Oui, parfaitement','Plutôt oui','Pas vraiment','Pas du tout','Je ne sais pas'],true),
  single(10,2,'Comment jugez-vous la communication entre la direction et les membres ?', ['Très bonne','Bonne','Moyenne','Mauvaise','Inexistante','Non concerné(e)'],true),
  single(11,2,'Les informations importantes sont-elles communiquées suffisamment tôt ?',general,true),
  multiple(12,2,'Quelles difficultés perturbent le plus le fonctionnement de l’agence ?', ['Manque de coordination','Changements de dernière minute','Absence de planification','Mauvaise répartition des responsabilités','Retards fréquents','Manque de moyens financiers','Problèmes de leadership','Manque de discipline','Manque de suivi','Autre'],true),
  single(13,3,'Avez-vous confiance dans la direction ?', ['Totalement','Plutôt oui','Moyennement','Plutôt non','Pas du tout','Je préfère ne pas répondre']),
  single(14,3,'La direction prend-elle en considération les préoccupations des membres ?',general,true),
  single(15,3,'Les décisions prises vous semblent-elles justes et transparentes ?',general,true),
  single(16,3,'Avez-vous déjà observé ou ressenti du favoritisme au sein de l’agence ?', ['Oui, régulièrement','Oui, occasionnellement','Non, jamais','Je ne sais pas','Je préfère ne pas répondre'],true),
  single(17,3,'Comment décririez-vous l’ambiance générale ?', ['Très saine et motivante','Agréable','Variable selon les situations','Tendue','Conflictuelle','Je ne sais pas'],true),
  single(18,3,'Vous sentez-vous libre d’exprimer une critique sans crainte de conséquences négatives ?', ['Oui, totalement','Plutôt oui','Pas vraiment','Pas du tout','Je préfère ne pas répondre','Non concerné(e)'],true),
  multiple(19,3,'Avez-vous été témoin ou victime de comportements inappropriés ?', ['Manque de respect','Humiliation ou propos blessants','Intimidation ou pression','Discrimination','Harcèlement','Abus d’autorité','Aucun','Je préfère ne pas répondre'],true),
  single(20,4,'L’agence accompagne-t-elle suffisamment les mannequins dans leur développement professionnel ?', ['Oui, parfaitement','Assez bien','Moyennement','Insuffisamment','Pas du tout','Je ne sais pas'],true),
  multiple(21,4,'Quels aspects de l’accompagnement devraient être renforcés ?', ['Formation à la démarche','Expression corporelle et posture','Développement personnel','Shooting photo et portfolio','Préparation aux castings','Coaching professionnel','Communication et image personnelle','Recherche de contrats','Accompagnement international','Autre'],true),
  single(22,4,'Les opportunités sont-elles réparties équitablement entre les mannequins ?',general,true),
  single(23,4,'Êtes-vous satisfait(e) des opportunités proposées par l’agence ?',satisfaction,true),
  single(24,4,'L’agence respecte-t-elle ses engagements envers ses mannequins et collaborateurs ?',general,true),
  text(25,4,'Qu’attendez-vous en priorité de l’agence pour faire évoluer les talents ?',true),
  single(26,5,'Comment évaluez-vous la communication publique de l’agence ?', ['Excellente','Bonne','Moyenne','Insuffisante','Très mauvaise']),
  multiple(27,5,'Sur quels aspects l’agence devrait-elle améliorer sa communication ?', ['Qualité des publications','Régularité des contenus','Mise en avant des mannequins','Communication sur les castings','Présentation des événements','Informations sur les activités','Interaction avec la communauté','Site internet','Autre']),
  single(28,5,'Comment jugez-vous la qualité des événements organisés ou soutenus par l’agence ?', ['Excellente','Bonne','Moyenne','Mauvaise','Très mauvaise','Je n’ai jamais participé à un événement']),
  multiple(29,5,'Quels problèmes avez-vous constatés lors des événements ?', ['Retards','Mauvaise coordination','Informations insuffisantes','Manque de préparation','Problèmes logistiques','Manque de professionnalisme','Mauvaise gestion des participants','Aucun problème','Autre','Non concerné(e)']),
  single(30,6,'Les conditions de collaboration sont-elles suffisamment claires ?', ['Oui, totalement','Plutôt oui','Partiellement','Pas du tout','Non concerné(e)'],true),
  single(31,6,'Les contrats, rémunérations et engagements sont-ils traités avec transparence ?',general,true),
  multiple(32,6,'Avez-vous rencontré une difficulté liée à un engagement ou une rémunération ?', ['Retard de paiement','Montant ou conditions mal expliqués','Engagement non respecté','Absence de contrat clair','Difficulté à obtenir des explications','Aucune difficulté','Je préfère ne pas répondre','Non concerné(e)'],true),
  { id: 33, section: 7, label: 'Sur une échelle de 0 à 10, quelle note globale attribuez-vous à Perfect Models Management ?', type: 'scale', optional: true },
  single(34,7,'Selon vous, l’agence évolue-t-elle dans la bonne direction ?', ['Oui, clairement','Plutôt oui','Difficile à dire','Plutôt non','Non, pas du tout']),
  multiple(35,7,'Quelles devraient être les trois priorités absolues ?', ['Améliorer la communication','Renforcer la discipline','Professionnaliser le management','Développer les opportunités professionnelles','Former davantage les mannequins','Améliorer l’organisation des événements','Renforcer la transparence','Améliorer les relations humaines','Développer les partenariats','Accroître la visibilité internationale','Autre'],false,3),
  text(36,8,'Qu’est-ce que Perfect Models Management fait particulièrement bien et devrait conserver ?'),
  text(37,8,'Qu’est-ce qui vous déçoit le plus dans le fonctionnement actuel de l’agence ?'),
  text(38,8,'Si vous pouviez changer une seule chose immédiatement, laquelle choisiriez-vous ?'),
  text(39,8,'Avez-vous une expérience positive ou négative que vous souhaiteriez partager anonymement ?'),
  text(40,8,'Quel message souhaiteriez-vous adresser anonymement à la direction ?'),
];

export const surveyQuestionById = (id: number) => SURVEY_QUESTIONS.find(question => question.id === id);
export const isInternalRespondent = (role: string | undefined) =>
  ['Mannequin actuellement dans l’agence', 'Ancien(ne) mannequin', 'Collaborateur ou membre de l’équipe', 'Prestataire externe'].includes(role || '');
