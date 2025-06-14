
-- Create a table for models
CREATE TABLE public.models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  gender TEXT NOT NULL,
  category TEXT NOT NULL,
  experience TEXT,
  image TEXT,
  images TEXT[],
  measurements JSONB,
  instagram_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for the new table
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Add a policy to allow public read access to active models
CREATE POLICY "Allow public read access to models"
ON public.models
FOR SELECT
USING (is_active = TRUE);

-- Insert all models from the current hardcoded data into the new table
INSERT INTO public.models (slug, name, first_name, last_name, gender, category, experience, image, images, measurements, instagram_url) VALUES
('1', 'Annie Flora', 'Annie', 'Flora', 'women', 'Femme', 'Professionnelle', 'https://i.ibb.co/ShShsp0/DSC-0369.jpg', '{"https://i.ibb.co/ShShsp0/DSC-0369.jpg", "https://i.ibb.co/7thKmdTt/DSC-0445.jpg", "https://i.ibb.co/gMYnh7Mz/AJC-1549.jpg"}', '{"height": 175, "bust": 88, "waist": 60, "hips": 90, "shoe_size": 40, "eye_color": "Marron", "hair_color": "Noir"}', 'https://www.instagram.com/perfectmodels.ga/'),
('2', 'Diane Vanessa', 'Diane', 'Vanessa', 'women', 'Femme', 'Professionnelle', 'https://i.ibb.co/yc1fYcqB/DSC-0261.jpg', '{"https://i.ibb.co/yc1fYcqB/DSC-0261.jpg"}', '{"height": 178, "bust": 85, "waist": 62, "hips": 92, "shoe_size": 41, "eye_color": "Noir", "hair_color": "Noir"}', NULL),
('3', 'Noémi Kim', 'Noémi', 'Kim', 'women', 'Femme', 'Expérimentée', 'https://i.ibb.co/QFMs75yF/480772387-617829161101429-7604127548633621221-n.jpg', '{"https://i.ibb.co/QFMs75yF/480772387-617829161101429-7604127548633621221-n.jpg"}', '{"height": 172, "bust": 80, "waist": 58, "hips": 88, "shoe_size": 39, "eye_color": "Marron", "hair_color": "Châtain"}', NULL),
('4', 'Duchesse', 'Duchesse', '', 'women', 'Femme', 'Professionnelle', 'https://i.ibb.co/gMYnh7Mz/AJC-1549.jpg', '{"https://i.ibb.co/gMYnh7Mz/AJC-1549.jpg"}', '{"height": 176, "bust": 86, "waist": 96, "hips": 97, "shoe_size": 40, "eye_color": "Marron", "hair_color": "Noir", "shoulder": 50}', NULL),
('5', 'Aimée Mawili', 'Aimée', 'Mawili', 'women', 'Femme', 'Expérimentée', 'https://i.ibb.co/CpmMPQ8b/476223692-604882878920159-1798037705929760559-n.jpg', '{"https://i.ibb.co/CpmMPQ8b/476223692-604882878920159-1798037705929760559-n.jpg"}', '{"height": 174, "bust": 86, "waist": 61, "hips": 91, "shoe_size": 39, "eye_color": "Marron", "hair_color": "Noir"}', NULL),
('6', 'Cegolaine Biye', 'Cegolaine', 'Biye', 'women', 'Femme', 'Expérimentée', 'https://i.ibb.co/fz5jtwfG/448406365-449418894385926-3540828592057987599-n.jpg', '{"https://i.ibb.co/fz5jtwfG/448406365-449418894385926-3540828592057987599-n.jpg"}', '{"height": 179, "bust": 89, "waist": 63, "hips": 94, "shoe_size": 41, "eye_color": "Noir", "hair_color": "Noir"}', NULL),
('7', 'Cassandra Viera', 'Cassandra', 'Viera', 'women', 'Femme', 'Professionnelle', 'https://i.ibb.co/78q5My4/PMM0161.jpg', '{"https://i.ibb.co/78q5My4/PMM0161.jpg"}', '{"height": 170, "bust": 82, "waist": 70, "hips": 95, "shoe_size": 38, "eye_color": "Noir", "hair_color": "Noir", "shoulder": 43}', NULL),
('8', 'Sephora Nawelle', 'Sephora', 'Nawelle', 'women', 'Femme', 'Expérimentée', 'https://i.ibb.co/kgdjvvN9/DSC01394-Modifier.jpg', '{"https://i.ibb.co/kgdjvvN9/DSC01394-Modifier.jpg"}', '{"height": 177, "bust": 76, "waist": 66, "hips": 85, "shoe_size": 40, "eye_color": "Marron", "hair_color": "Noir", "shoulder": 42}', NULL),
('9', 'AJ Caramela', 'AJ', 'Caramela', 'women', 'Femme', 'Professionnelle', 'https://i.ibb.co/Kcq2dMW7/DSC01379-Modifier.jpg', '{"https://i.ibb.co/Kcq2dMW7/DSC01379-Modifier.jpg"}', '{"height": 175, "bust": 88, "waist": 60, "hips": 90, "shoe_size": 40, "eye_color": "Marron", "hair_color": "Noir"}', NULL),
('10', 'Nynelle Mbazogho', 'Nynelle', 'Mbazogho', 'women', 'Femme', 'Expérimentée', 'https://i.ibb.co/j95xqjHT/DSC-0053.jpg', '{"https://i.ibb.co/j95xqjHT/DSC-0053.jpg"}', '{"height": 173, "bust": 83, "waist": 65, "hips": 88, "shoe_size": 39, "eye_color": "Noir", "hair_color": "Noir", "shoulder": 42}', NULL),
('11', 'Khellany Allogho', 'Khellany', 'Allogho', 'women', 'Femme', 'Professionnelle', 'https://i.ibb.co/jPtxQN0F/DSC-0457.jpg', '{"https://i.ibb.co/jPtxQN0F/DSC-0457.jpg"}', '{"height": 176, "bust": 86, "waist": 61, "hips": 92, "shoe_size": 40, "eye_color": "Marron", "hair_color": "Noir"}', NULL),
('12', 'Mebiame Ayito Kendra', 'Mebiame', 'Ayito Kendra', 'women', 'Femme', 'Expérimentée', 'https://i.ibb.co/ksdXSfpY/474134983-590912627126416-4665446951991920838-n.jpg', '{"https://i.ibb.co/ksdXSfpY/474134983-590912627126416-4665446951991920838-n.jpg"}', '{"height": 175, "bust": 88, "waist": 60, "hips": 90, "shoe_size": 40, "eye_color": "Marron", "hair_color": "Noir"}', NULL),
('14', 'Stecy Glappier', 'Stecy', 'Glappier', 'women', 'Femme', 'Expérimentée', 'https://i.ibb.co/fdKk7PQL/PMM0249.jpg', '{"https://i.ibb.co/fdKk7PQL/PMM0249.jpg"}', '{"height": 176, "shoulder": 46, "bust": 85, "waist": 72, "hips": 97, "shoe_size": 40, "eye_color": "Noir", "hair_color": "Brun"}', NULL),
('17', 'Jodelle Juliana', 'Jodelle', 'Juliana', 'women', 'Femme', 'Expérimentée', 'https://i.ibb.co/HT252kvW/MG-9959.jpg', '{"https://i.ibb.co/HT252kvW/MG-9959.jpg"}', '{"height": 177, "shoulder": 44, "bust": 86, "waist": 72, "hips": 97, "shoe_size": 40, "eye_color": "Marron", "hair_color": "Noir"}', NULL),
('21', 'Merveille Aworet', 'Merveille', 'Aworet', 'women', 'Femme', 'Expérimentée', 'https://i.ibb.co/fYNh5b7v/485747370-636810719203273-4287383373947579383-n.jpg', '{"https://i.ibb.co/fYNh5b7v/485747370-636810719203273-4287383373947579383-n.jpg"}', '{"height": 172, "shoulder": 46, "bust": 84, "waist": 66, "hips": 96, "shoe_size": 39, "eye_color": "Marron", "hair_color": "Noir"}', NULL),
('25', 'Sadia', 'Sadia', '', 'women', 'Femme', 'Expérimentée', 'https://i.ibb.co/1t6zbJm3/484135904-630949926456019-7069478021622378576-n.jpg', '{"https://i.ibb.co/1t6zbJm3/484135904-630949926456019-7069478021622378576-n.jpg"}', '{"height": 173, "shoulder": 47, "bust": 96, "waist": 65, "hips": 88, "shoe_size": 38, "eye_color": "Marron", "hair_color": "Noir"}', NULL),
('37', 'Eunice Moreau', 'Eunice', 'Moreau', 'women', 'Femme', 'Expérimentée', 'https://i.ibb.co/RpkcngtM/484178713-631586356392376-6790495192437511142-n.jpg', '{"https://i.ibb.co/RpkcngtM/484178713-631586356392376-6790495192437511142-n.jpg"}', '{"height": 175, "shoulder": 44, "bust": 84, "waist": 68, "hips": 94, "shoe_size": 40, "eye_color": "Noir", "hair_color": "Châtain"}', NULL),
('29', 'Donatien Anani', 'Donatien', 'Anani', 'men', 'Homme', 'Professionnel', 'https://i.ibb.co/q3wBhxpS/MG-0651.jpg', '{"https://i.ibb.co/q3wBhxpS/MG-0651.jpg", "https://i.ibb.co/9HtWHDDZ/DSC-0350.jpg"}', '{"height": 185, "waist": 73, "shoe_size": 44, "eye_color": "Marron", "hair_color": "Noir", "shoulder": 51, "bust": 86, "sleeve": 32, "sleeve_length": 69, "thigh": 58, "pants_length": 99, "size": "S/M"}', 'https://www.instagram.com/perfectmodels.ga/'),
('30', 'Davy', 'Davy', '', 'men', 'Homme', 'Expérimenté', 'https://i.ibb.co/p6TkcS2g/DSC-0163.jpg', '{"https://i.ibb.co/p6TkcS2g/DSC-0163.jpg"}', '{"height": 188, "waist": 80, "shoe_size": 45, "eye_color": "Noir", "hair_color": "Noir"}', NULL),
('31', 'Osée JN', 'Osée', 'JN', 'men', 'Homme', 'Professionnel', 'https://i.ibb.co/7tk4pKvr/474620403-594457843438561-7313394165363117491-n.jpg', '{"https://i.ibb.co/7tk4pKvr/474620403-594457843438561-7313394165363117491-n.jpg"}', '{"height": 186, "waist": 79, "shoe_size": 44, "eye_color": "Marron", "hair_color": "Noir"}', NULL),
('32', 'Moustapha Nziengui', 'Moustapha', 'Nziengui', 'men', 'Homme', 'Expérimenté', 'https://i.ibb.co/C5Z1N6Zp/481335188-618392171045128-1143329793191383014-n.jpg', '{"https://i.ibb.co/C5Z1N6Zp/481335188-618392171045128-1143329793191383014-n.jpg"}', '{"height": 184, "waist": 77, "shoe_size": 43, "eye_color": "Marron", "hair_color": "Noir"}', NULL),
('33', 'Pablo Zapatero', 'Pablo', 'Zapatero', 'men', 'Homme', 'Professionnel', 'https://i.ibb.co/9HtWHDDZ/DSC-0350.jpg', '{"https://i.ibb.co/9HtWHDDZ/DSC-0350.jpg"}', '{"height": 187, "waist": 79, "shoe_size": 44, "eye_color": "Bleu", "hair_color": "Blond"}', NULL),
('34', 'Rosly Biyoghe', 'Rosly', 'Biyoghe', 'men', 'Homme', 'Expérimenté', 'https://i.ibb.co/5hNTMd2H/476836105-4020224331539840-2275745508852289673-n.jpg', '{"https://i.ibb.co/5hNTMd2H/476836105-4020224331539840-2275745508852289673-n.jpg"}', '{"height": 185, "waist": 78, "shoe_size": 44, "eye_color": "Marron", "hair_color": "Noir"}', NULL),
('35', 'Rosnel Ayo', 'Rosnel', 'Ayo', 'men', 'Homme', 'Professionnel', 'https://i.ibb.co/gbb1sBsX/481850366-17957549744909537-119699887645910338-n.jpg', '{"https://i.ibb.co/gbb1sBsX/481850366-17957549744909537-119699887645910338-n.jpg"}', '{"height": 186, "waist": 82, "shoe_size": 44, "eye_color": "Marron", "hair_color": "Noir", "shoulder": 59, "bust": 98, "sleeve": 34, "sleeve_length": 68, "thigh": 60, "pants_length": 108, "size": "M"}', NULL);
