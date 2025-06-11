import { z } from "zod";

export const modelApplicationSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Téléphone requis"),
  gender: z.string().min(1, "Genre requis"),
  category_id: z.string().min(1, "Catégorie requise"),
  date_of_birth: z.union([
    z.string().min(1, "Date de naissance requise"),
    z.date(),
  ]),
  age: z.number().int().min(0).nullable(),
  weight: z.number().min(0, "Poids requis").nullable(),
  height: z.number().min(0, "Taille requise"),
  bust: z.number().min(0).nullable(),
  waist: z.number().min(0).nullable(),
  hips: z.number().min(0).nullable(),
  shoe_size: z.number().min(0).nullable(),
  hair_color: z.string().optional(),
  eye_color: z.string().optional(),
  experience: z.string().optional(),
  instagram_url: z.string().url("Lien Instagram invalide").optional().or(z.literal("")),
  availability: z.string().optional(),
  languages: z.array(z.string()).optional(),
  special_skills: z.array(z.string()).optional(),
  events_participated: z.array(z.string()).optional(),
});

// Type TypeScript associé
export type ModelApplication = z.infer<typeof modelApplicationSchema>;
