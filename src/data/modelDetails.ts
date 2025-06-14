
import { DetailedModel } from "@/types/modelTypes";

const showcases = [
  { 
    id: '1', 
    title: 'CLOFAS 241 2024', 
    date: 'Mars 2024', 
    location: 'Libreville, Gabon', 
    images: ['https://i.ibb.co/BV1HFbft/MG-0695.jpg'] 
  },
  { 
    id: '2', 
    title: 'Fashion Week Gabonaise', 
    date: 'Décembre 2023', 
    location: 'Libreville, Gabon', 
    images: ['https://i.ibb.co/yc1fYcqB/DSC-0261.jpg'] 
  },
  { 
    id: '3', 
    title: 'K\'elle Pour Elle', 
    date: 'Octobre 2023', 
    location: 'Libreville, Gabon', 
    images: ['https://i.ibb.co/78q5My4/PMM0161.jpg'] 
  }
];

const collaborations = [
  { 
    id: '1', 
    title: 'Campagne Azur Gabon', 
    description: 'Campagne publicitaire pour la marque de cosmétiques Azur', 
    date: 'Février 2024', 
    image: 'https://i.ibb.co/fz5jtwfG/448406365-449418894385926-3540828592057987599-n.jpg' 
  },
  { 
    id: '2', 
    title: 'Magazine Elle Afrique', 
    description: 'Shooting photo pour le magazine Elle Afrique', 
    date: 'Janvier 2024', 
    image: 'https://i.ibb.co/7thKmdTt/DSC-0445.jpg' 
  }
];

export const detailedModels: DetailedModel[] = [
  // Women
  { 
    id: '1', name: "Annie Flora", first_name: "Annie", last_name: "Flora", gender: 'women',
    image: "https://i.ibb.co/ShShsp0/DSC-0369.jpg",
    images: ["https://i.ibb.co/ShShsp0/DSC-0369.jpg", "https://i.ibb.co/7thKmdTt/DSC-0445.jpg", "https://i.ibb.co/gMYnh7Mz/AJC-1549.jpg"],
    measurements: { height: 175, bust: 88, waist: 60, hips: 90, shoe_size: 40, eye_color: 'Marron', hair_color: 'Noir' },
    instagram_url: 'https://www.instagram.com/perfectmodels.ga/',
    showcases: showcases.slice(0, 2),
    collaborations: collaborations.slice(0,1)
  },
  { id: '2', name: "Diane Vanessa", first_name: "Diane", last_name: "Vanessa", gender: 'women', image: "https://i.ibb.co/yc1fYcqB/DSC-0261.jpg", images: ["https://i.ibb.co/yc1fYcqB/DSC-0261.jpg"], measurements: { height: 178, bust: 85, waist: 62, hips: 92, shoe_size: 41, eye_color: 'Noir', hair_color: 'Noir' } },
  { id: '3', name: "Noémi Kim", first_name: "Noémi", last_name: "Kim", gender: 'women', image: "https://i.ibb.co/QFMs75yF/480772387-617829161101429-7604127548633621221-n.jpg", images: ["https://i.ibb.co/QFMs75yF/480772387-617829161101429-7604127548633621221-n.jpg"], measurements: { height: 172, bust: 80, waist: 58, hips: 88, shoe_size: 39, eye_color: 'Marron', hair_color: 'Châtain' } },
  { id: '4', name: "Duchesse", first_name: "Duchesse", last_name: "", gender: 'women', image: "https://i.ibb.co/gMYnh7Mz/AJC-1549.jpg", images: ["https://i.ibb.co/gMYnh7Mz/AJC-1549.jpg"], measurements: { height: 176, bust: 86, waist: 96, hips: 97, shoe_size: 40, eye_color: 'Marron', hair_color: 'Noir', shoulder: 50 } },
  { id: '5', name: "Aimée Mawili", first_name: "Aimée", last_name: "Mawili", gender: 'women', image: "https://i.ibb.co/CpmMPQ8b/476223692-604882878920159-1798037705929760559-n.jpg", images: ["https://i.ibb.co/CpmMPQ8b/476223692-604882878920159-1798037705929760559-n.jpg"], measurements: { height: 174, bust: 86, waist: 61, hips: 91, shoe_size: 39, eye_color: 'Marron', hair_color: 'Noir' } },
  { id: '6', name: "Cegolaine Biye", first_name: "Cegolaine", last_name: "Biye", gender: 'women', image: "https://i.ibb.co/fz5jtwfG/448406365-449418894385926-3540828592057987599-n.jpg", images: ["https://i.ibb.co/fz5jtwfG/448406365-449418894385926-3540828592057987599-n.jpg"], measurements: { height: 179, bust: 89, waist: 63, hips: 94, shoe_size: 41, eye_color: 'Noir', hair_color: 'Noir' } },
  { id: '7', name: "Barbie Black", first_name: "Barbie", last_name: "Black", gender: 'women', image: "https://i.ibb.co/78q5My4/PMM0161.jpg", images: ["https://i.ibb.co/78q5My4/PMM0161.jpg"], measurements: { height: 170, bust: 82, waist: 59, hips: 89, shoe_size: 38, eye_color: 'Noir', hair_color: 'Noir' } },
  { id: '8', name: "Sephora Nawelle", first_name: "Sephora", last_name: "Nawelle", gender: 'women', image: "https://i.ibb.co/kgdjvvN9/DSC01394-Modifier.jpg", images: ["https://i.ibb.co/kgdjvvN9/DSC01394-Modifier.jpg"], measurements: { height: 177, bust: 76, waist: 66, hips: 85, shoe_size: 40, eye_color: 'Marron', hair_color: 'Noir', shoulder: 42 } },
  { id: '9', name: "AJ Caramela", first_name: "AJ", last_name: "Caramela", gender: 'women', image: "https://i.ibb.co/Kcq2dMW7/DSC01379-Modifier.jpg", images: ["https://i.ibb.co/Kcq2dMW7/DSC01379-Modifier.jpg"], measurements: { height: 175, bust: 88, waist: 60, hips: 90, shoe_size: 40, eye_color: 'Marron', hair_color: 'Noir' } },
  { id: '10', name: "Nynelle Mbazogho", first_name: "Nynelle", last_name: "Mbazogho", gender: 'women', image: "https://i.ibb.co/j95xqjHT/DSC-0053.jpg", images: ["https://i.ibb.co/j95xqjHT/DSC-0053.jpg"], measurements: { height: 173, bust: 83, waist: 65, hips: 88, shoe_size: 39, eye_color: 'Noir', hair_color: 'Noir', shoulder: 42 } },
  { id: '11', name: "Khellany Allogho", first_name: "Khellany", last_name: "Allogho", gender: 'women', image: "https://i.ibb.co/jPtxQN0F/DSC-0457.jpg", images: ["https://i.ibb.co/jPtxQN0F/DSC-0457.jpg"], measurements: { height: 176, bust: 86, waist: 61, hips: 92, shoe_size: 40, eye_color: 'Marron', hair_color: 'Noir' } },
  { id: '12', name: "Mebiame Ayito Kendra", first_name: "Mebiame", last_name: "Ayito Kendra", gender: 'women', image: "https://i.ibb.co/ksdXSfpY/474134983-590912627126416-4665446951991920838-n.jpg", images: ["https://i.ibb.co/ksdXSfpY/474134983-590912627126416-4665446951991920838-n.jpg"], measurements: { height: 175, bust: 88, waist: 60, hips: 90, shoe_size: 40, eye_color: 'Marron', hair_color: 'Noir' } },
  {
    id: '14', name: "Stecy Glappier", first_name: "Stecy", last_name: "Glappier", gender: 'women',
    image: "https://i.ibb.co/fdKk7PQL/PMM0249.jpg",
    images: ["https://i.ibb.co/fdKk7PQL/PMM0249.jpg"],
    measurements: { height: 176, shoulder: 46, bust: 85, waist: 72, hips: 97, shoe_size: 40, eye_color: 'Noir', hair_color: 'Brun' }
  },
  {
    id: '17', name: "Jodelle Juliana", first_name: "Jodelle", last_name: "Juliana", gender: 'women',
    image: "https://i.ibb.co/HT252kvW/MG-9959.jpg",
    images: ["https://i.ibb.co/HT252kvW/MG-9959.jpg"],
    measurements: { height: 177, shoulder: 44, bust: 86, waist: 72, hips: 97, shoe_size: 40, eye_color: 'Marron', hair_color: 'Noir' }
  },
  {
    id: '21', name: "Merveille Aworet", first_name: "Merveille", last_name: "Aworet", gender: 'women',
    image: "https://i.ibb.co/fYNh5b7v/485747370-636810719203273-4287383373947579383-n.jpg",
    images: ["https://i.ibb.co/fYNh5b7v/485747370-636810719203273-4287383373947579383-n.jpg"],
    measurements: { height: 172, shoulder: 46, bust: 84, waist: 66, hips: 96, shoe_size: 39, eye_color: 'Marron', hair_color: 'Noir' }
  },
  {
    id: '25', name: "Sadia", first_name: "Sadia", last_name: "", gender: 'women',
    image: "https://i.ibb.co/1t6zbJm3/484135904-630949926456019-7069478021622378576-n.jpg",
    images: ["https://i.ibb.co/1t6zbJm3/484135904-630949926456019-7069478021622378576-n.jpg"],
    measurements: { height: 173, shoulder: 47, bust: 96, waist: 65, hips: 88, shoe_size: 38, eye_color: 'Marron', hair_color: 'Noir' }
  },
  {
    id: '36', name: "Cassandra Viera", first_name: "Cassandra", last_name: "Viera", gender: 'women',
    image: "https://i.ibb.co/3QGcXdb/DSC-0124.jpg",
    images: ["https://i.ibb.co/3QGcXdb/DSC-0124.jpg"],
    measurements: { height: 174, shoulder: 43, bust: 82, waist: 70, hips: 95, shoe_size: 39, eye_color: 'Marron', hair_color: 'Noir' }
  },
  {
    id: '37', name: "Eunice Moreau", first_name: "Eunice", last_name: "Moreau", gender: 'women',
    image: "https://i.ibb.co/RpkcngtM/484178713-631586356392376-6790495192437511142-n.jpg",
    images: ["https://i.ibb.co/RpkcngtM/484178713-631586356392376-6790495192437511142-n.jpg"],
    measurements: { height: 175, shoulder: 44, bust: 84, waist: 68, hips: 94, shoe_size: 40, eye_color: 'Noir', hair_color: 'Châtain' }
  },

  // Men
  { 
    id: '29', name: "Donatien Anani", first_name: "Donatien", last_name: "Anani", gender: 'men',
    image: "https://i.ibb.co/q3wBhxpS/MG-0651.jpg",
    images: ["https://i.ibb.co/q3wBhxpS/MG-0651.jpg", "https://i.ibb.co/9HtWHDDZ/DSC-0350.jpg"],
    measurements: { height: 185, waist: 73, shoe_size: 44, eye_color: 'Marron', hair_color: 'Noir', shoulder: 51, bust: 86, sleeve: 32, sleeve_length: 69, thigh: 58, pants_length: 99, size: 'S/M' },
    instagram_url: 'https://www.instagram.com/perfectmodels.ga/',
    showcases: showcases.slice(1, 3),
    collaborations: collaborations.slice(1,2)
  },
  { id: '30', name: "Davy", first_name: "Davy", last_name: "", gender: 'men', image: "https://i.ibb.co/p6TkcS2g/DSC-0163.jpg", images: ["https://i.ibb.co/p6TkcS2g/DSC-0163.jpg"], measurements: { height: 188, waist: 80, shoe_size: 45, eye_color: 'Noir', hair_color: 'Noir' } },
  { id: '31', name: "Osée JN", first_name: "Osée", last_name: "JN", gender: 'men', image: "https://i.ibb.co/7tk4pKvr/474620403-594457843438561-7313394165363117491-n.jpg", images: ["https://i.ibb.co/7tk4pKvr/474620403-594457843438561-7313394165363117491-n.jpg"], measurements: { height: 186, waist: 79, shoe_size: 44, eye_color: 'Marron', hair_color: 'Noir' } },
  { id: '32', name: "Moustapha Nziengui", first_name: "Moustapha", last_name: "Nziengui", gender: 'men', image: "https://i.ibb.co/C5Z1N6Zp/481335188-618392171045128-1143329793191383014-n.jpg", images: ["https://i.ibb.co/C5Z1N6Zp/481335188-618392171045128-1143329793191383014-n.jpg"], measurements: { height: 184, waist: 77, shoe_size: 43, eye_color: 'Marron', hair_color: 'Noir' } },
  { id: '33', name: "Pablo Zapatero", first_name: "Pablo", last_name: "Zapatero", gender: 'men', image: "https://i.ibb.co/9HtWHDDZ/DSC-0350.jpg", images: ["https://i.ibb.co/9HtWHDDZ/DSC-0350.jpg"], measurements: { height: 187, waist: 79, shoe_size: 44, eye_color: 'Bleu', hair_color: 'Blond' } },
  { id: '34', name: "Rosly Biyoghe", first_name: "Rosly", last_name: "Biyoghe", gender: 'men', image: "https://i.ibb.co/5hNTMd2H/476836105-4020224331539840-2275745508852289673-n.jpg", images: ["https://i.ibb.co/5hNTMd2H/476836105-4020224331539840-2275745508852289673-n.jpg"], measurements: { height: 185, waist: 78, shoe_size: 44, eye_color: 'Marron', hair_color: 'Noir' } },
  { id: '35', name: "Rosnel Ayo", first_name: "Rosnel", last_name: "Ayo", gender: 'men', image: "https://i.ibb.co/gbb1sBsX/481850366-17957549744909537-119699887645910338-n.jpg", images: ["https://i.ibb.co/gbb1sBsX/481850366-17957549744909537-119699887645910338-n.jpg"], measurements: { height: 186, waist: 82, shoe_size: 44, eye_color: 'Marron', hair_color: 'Noir', shoulder: 59, bust: 98, sleeve: 34, sleeve_length: 68, thigh: 60, pants_length: 108, size: 'M' } }
];
