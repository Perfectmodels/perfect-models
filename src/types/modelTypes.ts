
export interface ModelApplication {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  category_id: string;
  date_of_birth?: Date;
  age: number | null;
  height: number;
  weight: number | null;
  bust: number | null;
  waist: number | null;
  hips: number | null;
  shoe_size: number | null;
  hair_color: string;
  eye_color: string;
  experience: string;
  instagram_url: string;
  availability: string;
  languages: string[];
  special_skills: string[];
  events_participated: string[];
}
