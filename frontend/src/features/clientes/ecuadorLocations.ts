export const ECUADOR_PROVINCES = [
  "Azuay",
  "Bolívar",
  "Cañar",
  "Carchi",
  "Chimborazo",
  "Cotopaxi",
  "El Oro",
  "Esmeraldas",
  "Galápagos",
  "Guayas",
  "Imbabura",
  "Loja",
  "Los Ríos",
  "Manabí",
  "Morona Santiago",
  "Napo",
  "Orellana",
  "Pastaza",
  "Pichincha",
  "Santa Elena",
  "Santo Domingo de los Tsáchilas",
  "Sucumbíos",
  "Tungurahua",
  "Zamora Chinchipe",
] as const;

export const ECUADOR_CITIES_BY_PROVINCE: Record<(typeof ECUADOR_PROVINCES)[number], readonly string[]> = {
  Azuay: [
    "Camilo Ponce Enríquez",
    "Chordeleg",
    "Cuenca",
    "El Pan",
    "Girón",
    "Guachapala",
    "Gualaceo",
    "Nabón",
    "Oña",
    "Paute",
    "Pucará",
    "San Fernando",
    "Santa Isabel",
    "Sevilla de Oro",
    "Sígsig",
  ],
  Bolívar: ["Caluma", "Chillanes", "Chimbo", "Echeandía", "Guaranda", "Las Naves", "San Miguel"],
  Cañar: ["Azogues", "Biblián", "Cañar", "Déleg", "El Tambo", "La Troncal", "Suscal"],
  Carchi: ["Bolívar", "El Ángel", "Huaca", "Mira", "San Gabriel", "Tulcán"],
  Chimborazo: [
    "Alausí",
    "Chambo",
    "Chunchi",
    "Cumandá",
    "Guamote",
    "Guano",
    "Pallatanga",
    "Penipe",
    "Riobamba",
    "Villa La Unión",
  ],
  Cotopaxi: ["El Corazón", "La Maná", "Latacunga", "Pujilí", "Saquisilí", "San Miguel de Salcedo", "Sigchos"],
  "El Oro": [
    "Arenillas",
    "Balsas",
    "Chilla",
    "El Guabo",
    "Huaquillas",
    "La Victoria",
    "Machala",
    "Marcabelí",
    "Paccha",
    "Pasaje",
    "Piñas",
    "Portovelo",
    "Santa Rosa",
    "Zaruma",
  ],
  Esmeraldas: ["Atacames", "Esmeraldas", "Muisne", "Rioverde", "Rosa Zárate", "San Lorenzo", "Valdez"],
  Galápagos: ["Puerto Ayora", "Puerto Baquerizo Moreno", "Puerto Villamil"],
  Guayas: [
    "Balao",
    "Balzar",
    "Bucay",
    "Colimes",
    "Coronel Marcelino Maridueña",
    "Daule",
    "Durán",
    "El Triunfo",
    "General Villamil",
    "Guayaquil",
    "Isidro Ayora",
    "Jujan",
    "Lomas de Sargentillo",
    "Milagro",
    "Naranjal",
    "Naranjito",
    "Narcisa de Jesús",
    "Palestina",
    "Pedro Carbo",
    "Salitre",
    "Samborondón",
    "Santa Lucía",
    "Simón Bolívar",
    "Velasco Ibarra",
    "Yaguachi",
  ],
  Imbabura: ["Atuntaqui", "Cotacachi", "Ibarra", "Otavalo", "Pimampiro", "Urcuquí"],
  Loja: [
    "Alamor",
    "Amaluza",
    "Cariamanga",
    "Catacocha",
    "Catamayo",
    "Celica",
    "Chaguarpamba",
    "Gonzanamá",
    "Loja",
    "Macará",
    "Olmedo",
    "Pindal",
    "Quilanga",
    "Saraguro",
    "Sozoranga",
    "Zapotillo",
  ],
  "Los Ríos": [
    "Babahoyo",
    "Baba",
    "Buena Fe",
    "Catarama",
    "Mocache",
    "Montalvo",
    "Palenque",
    "Puebloviejo",
    "Quevedo",
    "Quinsaloma",
    "Valencia",
    "Ventanas",
    "Vinces",
  ],
  Manabí: [
    "Bahía de Caráquez",
    "Calceta",
    "Chone",
    "El Carmen",
    "Flavio Alfaro",
    "Jama",
    "Jaramijó",
    "Jipijapa",
    "Junín",
    "Manta",
    "Montecristi",
    "Olmedo",
    "Paján",
    "Pedernales",
    "Pichincha",
    "Portoviejo",
    "Puerto López",
    "Rocafuerte",
    "San Vicente",
    "Santa Ana",
    "Sucre",
    "Tosagua",
  ],
  "Morona Santiago": [
    "Gral. Leonidas Plaza Gutiérrez (Limón)",
    "Gualaquiza",
    "Huamboya",
    "Logroño",
    "Macas",
    "Palora",
    "Pablo Sexto",
    "San Juan Bosco",
    "Santiago",
    "Santiago de Méndez",
    "Sucúa",
    "Taisha",
  ],
  Napo: ["Archidona", "Arajuno", "Baeza", "Carlos Julio Arosemena Tola", "El Chaco", "Tena"],
  Orellana: ["El Coca", "La Joya de los Sachas", "Loreto", "Tiputini"],
  Pastaza: ["Mera", "Puyo", "Santa Clara"],
  Pichincha: [
    "Cayambe",
    "Machachi",
    "Pedro Vicente Maldonado",
    "Puerto Quito",
    "Quito",
    "San Miguel de Los Bancos",
    "Sangolquí",
    "Tabacundo",
  ],
  "Santa Elena": ["La Libertad", "Salinas", "Santa Elena"],
  "Santo Domingo de los Tsáchilas": ["La Concordia", "Santo Domingo"],
  Sucumbíos: [
    "El Dorado de Cascales",
    "La Bonita",
    "Lumbaqui",
    "Nueva Loja",
    "Puerto El Carmen de Putumayo",
    "Shushufindi",
    "Tarapoa",
  ],
  Tungurahua: [
    "Ambato",
    "Baños de Agua Santa",
    "Cevallos",
    "Mocha",
    "Patate",
    "Pelileo",
    "Píllaro",
    "Quero",
    "Tisaleo",
  ],
  "Zamora Chinchipe": [
    "28 de Mayo",
    "El Pangui",
    "Guayzimi",
    "Palanda",
    "Paquisha",
    "Yantzaza",
    "Zamora",
    "Zumba",
    "Zumbi",
  ],
};

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function isEcuadorCountry(country?: { name?: string; iso_code?: string } | null): boolean {
  if (!country) {
    return false;
  }

  const isoCode = normalizeText(country.iso_code ?? "");
  const name = normalizeText(country.name ?? "");
  return isoCode === "ec" || isoCode === "ecu" || name === "ecuador";
}

export function getEcuadorCities(province: string): string[] {
  const normalizedProvince = normalizeText(province);
  const match = ECUADOR_PROVINCES.find((item) => normalizeText(item) === normalizedProvince);
  if (!match) {
    return [];
  }
  return [...ECUADOR_CITIES_BY_PROVINCE[match]];
}

export function mergeOption(options: readonly string[], currentValue: string): string[] {
  const normalizedCurrentValue = currentValue.trim();
  if (!normalizedCurrentValue) {
    return [...options];
  }
  return options.includes(normalizedCurrentValue) ? [...options] : [normalizedCurrentValue, ...options];
}
