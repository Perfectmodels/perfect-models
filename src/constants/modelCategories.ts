
interface ModelCategory {
  id: string;
  name: string;
  group: string;
}

export const MODEL_CATEGORIES: ModelCategory[] = [
  // Par domaine d'activité
  {
    id: "runway",
    name: "Mannequin de défilé",
    group: "Domaine d'activité"
  },
  {
    id: "fashion",
    name: "Mannequin photo",
    group: "Domaine d'activité"
  },
  {
    id: "commercial",
    name: "Mannequin commercial",
    group: "Domaine d'activité"
  },
  {
    id: "lingerie",
    name: "Mannequin lingerie & maillot",
    group: "Domaine d'activité"
  },
  {
    id: "showroom",
    name: "Mannequin showroom",
    group: "Domaine d'activité"
  },
  {
    id: "art",
    name: "Mannequin artistique",
    group: "Domaine d'activité"
  },
  {
    id: "parts",
    name: "Mannequin de détails",
    group: "Domaine d'activité"
  },
  {
    id: "advertising",
    name: "Mannequin publicitaire",
    group: "Domaine d'activité"
  },

  // Par critères physiques
  {
    id: "haute-couture",
    name: "Mannequin haute couture",
    group: "Critères physiques"
  },
  {
    id: "petite",
    name: "Mannequin petite taille",
    group: "Critères physiques"
  },
  {
    id: "plus-size",
    name: "Mannequin grande taille",
    group: "Critères physiques"
  },
  {
    id: "fitness",
    name: "Mannequin fitness",
    group: "Critères physiques"
  },
  {
    id: "senior",
    name: "Mannequin senior",
    group: "Critères physiques"
  },
  {
    id: "child",
    name: "Mannequin enfant",
    group: "Critères physiques"
  },
  {
    id: "teen",
    name: "Mannequin adolescent",
    group: "Critères physiques"
  },

  // Autres catégories
  {
    id: "influencer",
    name: "Mannequin influenceur",
    group: "Autres"
  },
  {
    id: "alternative",
    name: "Mannequin alternatif",
    group: "Autres"
  },
  {
    id: "ethnic",
    name: "Mannequin ethnique",
    group: "Autres"
  },
  {
    id: "androgynous",
    name: "Mannequin androgyne",
    group: "Autres"
  }
];

export const getModelCategoriesByGroup = () => {
  const groupedCategories = MODEL_CATEGORIES.reduce((acc, category) => {
    if (!acc[category.group]) {
      acc[category.group] = [];
    }
    acc[category.group].push(category);
    return acc;
  }, {} as Record<string, ModelCategory[]>);

  return groupedCategories;
};

