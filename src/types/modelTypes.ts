
export interface Service {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  date?: string;
  image?: string;
}

export interface ModelApplication {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  category_id: string;
  age: number | null;
  height: number;
  weight: number | null;
  bust: number | null;
  waist: number | null;
  hips: number | null;
  shoe_size: number | null;
  hair_color?: string;
  eye_color?: string;
  experience?: string;
  instagram_url?: string;
  events_participated?: string[];
  availability: string;
  languages?: string[];
  special_skills?: string[];
}

export interface DetailedModel {
  id: string;
  first_name: string;
  last_name: string;
  images: string[];
  gender: string;
  category_id?: string;
  measurements: {
    height: number;
    bust?: number;
    waist?: number;
    hips?: number;
    shoe_size?: number;
    eye_color?: string;
    hair_color?: string;
  };
  category?: string;
  instagram_url?: string;
}

export interface Collaboration {
  id: string;
  title: string;
  description?: string;
  image: string;
  date?: string;
}

export interface ModelShowcase {
  id: string;
  title: string;
  date?: string;
  images: string[];
  location?: string;
}
