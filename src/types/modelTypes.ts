
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

export interface Service {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  location?: string;
  date?: string;
  image?: string;
}

export interface DetailedModel {
  id: string;
  first_name: string;
  last_name: string;
  images: string[];
  gender: string;
  category_id: string;
  measurements: {
    height?: number;
    bust?: number;
    waist?: number;
    hips?: number;
    shoe_size?: number;
    eye_color?: string;
    hair_color?: string;
  };
  instagram_url?: string;
}

export interface Collaboration {
  id: string;
  title: string;
  description?: string;
  date?: string;
  image?: string;
}

export interface ModelShowcase {
  id: string;
  title: string;
  date?: string;
  location?: string;
  images: string[];
}
