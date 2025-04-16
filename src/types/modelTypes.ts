
export interface ModelApplication {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth?: string | null;
  height: number;
  bust?: number | null;
  waist?: number | null;
  hips?: number | null;
  experience?: string | null;
  instagram_url?: string | null;
  image_front_url?: string | null;
  image_side_url?: string | null;
  image_full_url?: string | null;
  status?: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ModelCategory {
  id?: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export interface Model {
  id?: string;
  first_name: string;
  last_name: string;
  gender: string;
  height: number;
  bust?: number | null;
  waist?: number | null;
  hips?: number | null;
  shoe_size?: number | null;
  hair_color?: string | null;
  eye_color?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  instagram_url?: string | null;
  is_featured?: boolean;
  category_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ModelImage {
  id?: string;
  model_id: string;
  image_url: string;
  is_profile?: boolean;
  is_polaroid?: boolean;
  order_number?: number;
  created_at?: string;
}
