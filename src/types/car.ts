export interface Car {
  id: string;
  user_id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  fuel_type: string | null;
  transmission: string | null;
  body_type: string | null;
  color: string | null;
  location: string | null;
  description: string | null;
  images: string[];
  is_sold: boolean;
  is_approved?: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface StandProfile {
  id: string;
  user_id: string;
  business_name: string;
  logo_url?: string;
  description?: string;
  primary_color?: string;
  secondary_color?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  created_at: string;
  updated_at: string;
}

export interface CarFilters {
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  minMileage?: number;
  maxMileage?: number;
  location?: string;
  search?: string;
}

export const CAR_BRANDS = [
  "Abarth",
  "Alfa Romeo",
  "Alpine",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "BYD",
  "Chevrolet",
  "Chrysler",
  "Citroën",
  "Cupra",
  "Dacia",
  "DS Automobiles",
  "Ferrari",
  "Fiat",
  "Ford",
  "Honda",
  "Hyundai",
  "Isuzu",
  "Jaguar",
  "Jeep",
  "Kia",
  "Lamborghini",
  "Land Rover",
  "Lexus",
  "Maserati",
  "Mazda",
  "Mercedes-Benz",
  "Mini",
  "Mitsubishi",
  "MG",
  "Nissan",
  "Opel",
  "Peugeot",
  "Polestar",
  "Porsche",
  "RAM",
  "Renault",
  "Rolls-Royce",
  "Seat",
  "Škoda",
  "Smart",
  "Subaru",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

export const FUEL_TYPES = ["Gasolina", "Diesel", "Elétrico", "Híbrido", "GPL"];

export const TRANSMISSIONS = ["Manual", "Automático", "Semi-automático"];

export const BODY_TYPES = [
  "Berlina",
  "Hatchback",
  "SUV",
  "Coupé",
  "Descapotável",
  "Carrinha",
  "Comercial",
  "Pick-up",
  "Monovolume",
];

export const COLORS = [
  "Preto",
  "Branco",
  "Prata",
  "Cinzento",
  "Azul",
  "Vermelho",
  "Verde",
  "Castanho",
  "Bege",
  "Amarelo",
  "Laranja",
  "Roxo",
];

export const LOCATIONS = [
  "Lisboa",
  "Porto",
  "Braga",
  "Faro",
  "Coimbra",
  "Setúbal",
  "Aveiro",
  "Leiria",
  "Viseu",
  "Santarém",
  "Évora",
  "Viana do Castelo",
];

export const MILEAGE_RANGES = [
  { label: "Menos de 10.000 km", max: 10000 },
  { label: "Menos de 50.000 km", max: 50000 },
  { label: "Menos de 100.000 km", max: 100000 },
  { label: "Menos de 150.000 km", max: 150000 },
  { label: "Menos de 200.000 km", max: 200000 },
];
