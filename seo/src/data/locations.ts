/**
 * Location data for programmatic SEO pages
 * Countries and cities for geo-targeted landing pages
 */

export interface City {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  population: number;
  region?: string;
  timezone?: string;
}

export interface Country {
  slug: string;
  name: string;
  code: string;
  cities: City[];
  language: string;
  currency: string;
}

export const COUNTRIES: Record<string, Country> = {
  ireland: {
    slug: "ireland",
    name: "Ireland",
    code: "IE",
    language: "English",
    currency: "EUR",
    cities: [
      { slug: "dublin", name: "Dublin", country: "Ireland", countryCode: "IE", population: 1400000, region: "Leinster" },
      { slug: "cork", name: "Cork", country: "Ireland", countryCode: "IE", population: 210000, region: "Munster" },
      { slug: "galway", name: "Galway", country: "Ireland", countryCode: "IE", population: 80000, region: "Connacht" },
      { slug: "limerick", name: "Limerick", country: "Ireland", countryCode: "IE", population: 95000, region: "Munster" },
      { slug: "waterford", name: "Waterford", country: "Ireland", countryCode: "IE", population: 54000, region: "Munster" },
      { slug: "drogheda", name: "Drogheda", country: "Ireland", countryCode: "IE", population: 41000, region: "Leinster" },
      { slug: "kilkenny", name: "Kilkenny", country: "Ireland", countryCode: "IE", population: 26000, region: "Leinster" },
      { slug: "wexford", name: "Wexford", country: "Ireland", countryCode: "IE", population: 20000, region: "Leinster" },
      { slug: "sligo", name: "Sligo", country: "Ireland", countryCode: "IE", population: 20000, region: "Connacht" },
      { slug: "carlow", name: "Carlow", country: "Ireland", countryCode: "IE", population: 24000, region: "Leinster" },
    ]
  },

  uk: {
    slug: "uk",
    name: "United Kingdom",
    code: "GB",
    language: "English",
    currency: "GBP",
    cities: [
      { slug: "london", name: "London", country: "United Kingdom", countryCode: "GB", population: 8900000, region: "England" },
      { slug: "manchester", name: "Manchester", country: "United Kingdom", countryCode: "GB", population: 550000, region: "England" },
      { slug: "birmingham", name: "Birmingham", country: "United Kingdom", countryCode: "GB", population: 1140000, region: "England" },
      { slug: "leeds", name: "Leeds", country: "United Kingdom", countryCode: "GB", population: 790000, region: "England" },
      { slug: "liverpool", name: "Liverpool", country: "United Kingdom", countryCode: "GB", population: 500000, region: "England" },
      { slug: "bristol", name: "Bristol", country: "United Kingdom", countryCode: "GB", population: 460000, region: "England" },
      { slug: "sheffield", name: "Sheffield", country: "United Kingdom", countryCode: "GB", population: 580000, region: "England" },
      { slug: "newcastle", name: "Newcastle", country: "United Kingdom", countryCode: "GB", population: 300000, region: "England" },
      { slug: "edinburgh", name: "Edinburgh", country: "United Kingdom", countryCode: "GB", population: 520000, region: "Scotland" },
      { slug: "glasgow", name: "Glasgow", country: "United Kingdom", countryCode: "GB", population: 630000, region: "Scotland" },
      { slug: "cardiff", name: "Cardiff", country: "United Kingdom", countryCode: "GB", population: 365000, region: "Wales" },
      { slug: "belfast", name: "Belfast", country: "United Kingdom", countryCode: "GB", population: 340000, region: "Northern Ireland" },
      { slug: "nottingham", name: "Nottingham", country: "United Kingdom", countryCode: "GB", population: 330000, region: "England" },
      { slug: "leicester", name: "Leicester", country: "United Kingdom", countryCode: "GB", population: 350000, region: "England" },
      { slug: "brighton", name: "Brighton", country: "United Kingdom", countryCode: "GB", population: 290000, region: "England" },
    ]
  },

  usa: {
    slug: "usa",
    name: "United States",
    code: "US",
    language: "English",
    currency: "USD",
    cities: [
      { slug: "new-york", name: "New York", country: "United States", countryCode: "US", population: 8300000, region: "New York" },
      { slug: "los-angeles", name: "Los Angeles", country: "United States", countryCode: "US", population: 3900000, region: "California" },
      { slug: "chicago", name: "Chicago", country: "United States", countryCode: "US", population: 2700000, region: "Illinois" },
      { slug: "houston", name: "Houston", country: "United States", countryCode: "US", population: 2300000, region: "Texas" },
      { slug: "phoenix", name: "Phoenix", country: "United States", countryCode: "US", population: 1600000, region: "Arizona" },
      { slug: "philadelphia", name: "Philadelphia", country: "United States", countryCode: "US", population: 1600000, region: "Pennsylvania" },
      { slug: "san-antonio", name: "San Antonio", country: "United States", countryCode: "US", population: 1500000, region: "Texas" },
      { slug: "san-diego", name: "San Diego", country: "United States", countryCode: "US", population: 1400000, region: "California" },
      { slug: "dallas", name: "Dallas", country: "United States", countryCode: "US", population: 1300000, region: "Texas" },
      { slug: "san-jose", name: "San Jose", country: "United States", countryCode: "US", population: 1000000, region: "California" },
      { slug: "austin", name: "Austin", country: "United States", countryCode: "US", population: 980000, region: "Texas" },
      { slug: "jacksonville", name: "Jacksonville", country: "United States", countryCode: "US", population: 950000, region: "Florida" },
      { slug: "san-francisco", name: "San Francisco", country: "United States", countryCode: "US", population: 870000, region: "California" },
      { slug: "columbus", name: "Columbus", country: "United States", countryCode: "US", population: 900000, region: "Ohio" },
      { slug: "charlotte", name: "Charlotte", country: "United States", countryCode: "US", population: 870000, region: "North Carolina" },
      { slug: "indianapolis", name: "Indianapolis", country: "United States", countryCode: "US", population: 880000, region: "Indiana" },
      { slug: "seattle", name: "Seattle", country: "United States", countryCode: "US", population: 750000, region: "Washington" },
      { slug: "denver", name: "Denver", country: "United States", countryCode: "US", population: 720000, region: "Colorado" },
      { slug: "washington-dc", name: "Washington DC", country: "United States", countryCode: "US", population: 700000, region: "District of Columbia" },
      { slug: "boston", name: "Boston", country: "United States", countryCode: "US", population: 680000, region: "Massachusetts" },
      { slug: "nashville", name: "Nashville", country: "United States", countryCode: "US", population: 690000, region: "Tennessee" },
      { slug: "detroit", name: "Detroit", country: "United States", countryCode: "US", population: 640000, region: "Michigan" },
      { slug: "portland", name: "Portland", country: "United States", countryCode: "US", population: 650000, region: "Oregon" },
      { slug: "las-vegas", name: "Las Vegas", country: "United States", countryCode: "US", population: 640000, region: "Nevada" },
      { slug: "miami", name: "Miami", country: "United States", countryCode: "US", population: 450000, region: "Florida" },
      { slug: "atlanta", name: "Atlanta", country: "United States", countryCode: "US", population: 500000, region: "Georgia" },
    ]
  },

  canada: {
    slug: "canada",
    name: "Canada",
    code: "CA",
    language: "English",
    currency: "CAD",
    cities: [
      { slug: "toronto", name: "Toronto", country: "Canada", countryCode: "CA", population: 2700000, region: "Ontario" },
      { slug: "montreal", name: "Montreal", country: "Canada", countryCode: "CA", population: 1700000, region: "Quebec" },
      { slug: "vancouver", name: "Vancouver", country: "Canada", countryCode: "CA", population: 630000, region: "British Columbia" },
      { slug: "calgary", name: "Calgary", country: "Canada", countryCode: "CA", population: 1300000, region: "Alberta" },
      { slug: "edmonton", name: "Edmonton", country: "Canada", countryCode: "CA", population: 980000, region: "Alberta" },
      { slug: "ottawa", name: "Ottawa", country: "Canada", countryCode: "CA", population: 1000000, region: "Ontario" },
      { slug: "winnipeg", name: "Winnipeg", country: "Canada", countryCode: "CA", population: 750000, region: "Manitoba" },
      { slug: "quebec-city", name: "Quebec City", country: "Canada", countryCode: "CA", population: 540000, region: "Quebec" },
      { slug: "hamilton", name: "Hamilton", country: "Canada", countryCode: "CA", population: 570000, region: "Ontario" },
      { slug: "kitchener", name: "Kitchener", country: "Canada", countryCode: "CA", population: 470000, region: "Ontario" },
    ]
  },

  australia: {
    slug: "australia",
    name: "Australia",
    code: "AU",
    language: "English",
    currency: "AUD",
    cities: [
      { slug: "sydney", name: "Sydney", country: "Australia", countryCode: "AU", population: 5300000, region: "New South Wales" },
      { slug: "melbourne", name: "Melbourne", country: "Australia", countryCode: "AU", population: 5000000, region: "Victoria" },
      { slug: "brisbane", name: "Brisbane", country: "Australia", countryCode: "AU", population: 2500000, region: "Queensland" },
      { slug: "perth", name: "Perth", country: "Australia", countryCode: "AU", population: 2100000, region: "Western Australia" },
      { slug: "adelaide", name: "Adelaide", country: "Australia", countryCode: "AU", population: 1400000, region: "South Australia" },
      { slug: "gold-coast", name: "Gold Coast", country: "Australia", countryCode: "AU", population: 680000, region: "Queensland" },
      { slug: "canberra", name: "Canberra", country: "Australia", countryCode: "AU", population: 450000, region: "Australian Capital Territory" },
      { slug: "newcastle", name: "Newcastle", country: "Australia", countryCode: "AU", population: 320000, region: "New South Wales" },
    ]
  },

  germany: {
    slug: "germany",
    name: "Germany",
    code: "DE",
    language: "German",
    currency: "EUR",
    cities: [
      { slug: "berlin", name: "Berlin", country: "Germany", countryCode: "DE", population: 3600000, region: "Berlin" },
      { slug: "hamburg", name: "Hamburg", country: "Germany", countryCode: "DE", population: 1900000, region: "Hamburg" },
      { slug: "munich", name: "Munich", country: "Germany", countryCode: "DE", population: 1500000, region: "Bavaria" },
      { slug: "cologne", name: "Cologne", country: "Germany", countryCode: "DE", population: 1080000, region: "North Rhine-Westphalia" },
      { slug: "frankfurt", name: "Frankfurt", country: "Germany", countryCode: "DE", population: 750000, region: "Hesse" },
      { slug: "stuttgart", name: "Stuttgart", country: "Germany", countryCode: "DE", population: 630000, region: "Baden-Württemberg" },
      { slug: "dusseldorf", name: "Düsseldorf", country: "Germany", countryCode: "DE", population: 620000, region: "North Rhine-Westphalia" },
      { slug: "leipzig", name: "Leipzig", country: "Germany", countryCode: "DE", population: 590000, region: "Saxony" },
    ]
  },

  france: {
    slug: "france",
    name: "France",
    code: "FR",
    language: "French",
    currency: "EUR",
    cities: [
      { slug: "paris", name: "Paris", country: "France", countryCode: "FR", population: 2100000, region: "Île-de-France" },
      { slug: "marseille", name: "Marseille", country: "France", countryCode: "FR", population: 860000, region: "Provence-Alpes-Côte d'Azur" },
      { slug: "lyon", name: "Lyon", country: "France", countryCode: "FR", population: 520000, region: "Auvergne-Rhône-Alpes" },
      { slug: "toulouse", name: "Toulouse", country: "France", countryCode: "FR", population: 480000, region: "Occitanie" },
      { slug: "nice", name: "Nice", country: "France", countryCode: "FR", population: 340000, region: "Provence-Alpes-Côte d'Azur" },
      { slug: "nantes", name: "Nantes", country: "France", countryCode: "FR", population: 310000, region: "Pays de la Loire" },
      { slug: "bordeaux", name: "Bordeaux", country: "France", countryCode: "FR", population: 260000, region: "Nouvelle-Aquitaine" },
      { slug: "lille", name: "Lille", country: "France", countryCode: "FR", population: 230000, region: "Hauts-de-France" },
    ]
  },

  spain: {
    slug: "spain",
    name: "Spain",
    code: "ES",
    language: "Spanish",
    currency: "EUR",
    cities: [
      { slug: "madrid", name: "Madrid", country: "Spain", countryCode: "ES", population: 3300000, region: "Community of Madrid" },
      { slug: "barcelona", name: "Barcelona", country: "Spain", countryCode: "ES", population: 1600000, region: "Catalonia" },
      { slug: "valencia", name: "Valencia", country: "Spain", countryCode: "ES", population: 790000, region: "Valencian Community" },
      { slug: "seville", name: "Seville", country: "Spain", countryCode: "ES", population: 690000, region: "Andalusia" },
      { slug: "bilbao", name: "Bilbao", country: "Spain", countryCode: "ES", population: 350000, region: "Basque Country" },
      { slug: "malaga", name: "Málaga", country: "Spain", countryCode: "ES", population: 580000, region: "Andalusia" },
    ]
  },

  netherlands: {
    slug: "netherlands",
    name: "Netherlands",
    code: "NL",
    language: "Dutch",
    currency: "EUR",
    cities: [
      { slug: "amsterdam", name: "Amsterdam", country: "Netherlands", countryCode: "NL", population: 870000, region: "North Holland" },
      { slug: "rotterdam", name: "Rotterdam", country: "Netherlands", countryCode: "NL", population: 650000, region: "South Holland" },
      { slug: "the-hague", name: "The Hague", country: "Netherlands", countryCode: "NL", population: 540000, region: "South Holland" },
      { slug: "utrecht", name: "Utrecht", country: "Netherlands", countryCode: "NL", population: 360000, region: "Utrecht" },
      { slug: "eindhoven", name: "Eindhoven", country: "Netherlands", countryCode: "NL", population: 230000, region: "North Brabant" },
    ]
  },

  uae: {
    slug: "uae",
    name: "United Arab Emirates",
    code: "AE",
    language: "Arabic",
    currency: "AED",
    cities: [
      { slug: "dubai", name: "Dubai", country: "United Arab Emirates", countryCode: "AE", population: 3400000, region: "Dubai" },
      { slug: "abu-dhabi", name: "Abu Dhabi", country: "United Arab Emirates", countryCode: "AE", population: 1500000, region: "Abu Dhabi" },
      { slug: "sharjah", name: "Sharjah", country: "United Arab Emirates", countryCode: "AE", population: 1400000, region: "Sharjah" },
    ]
  }
};

// Get all country slugs
export const getCountrySlugs = (): string[] => Object.keys(COUNTRIES);

// Get country by slug
export const getCountry = (slug: string): Country | null => COUNTRIES[slug] || null;

// Get all cities for a country
export const getCitiesByCountry = (countrySlug: string): City[] => {
  const country = COUNTRIES[countrySlug];
  return country ? country.cities : [];
};

// Get city by slug and country
export const getCity = (countrySlug: string, citySlug: string): City | null => {
  const country = COUNTRIES[countrySlug];
  if (!country) return null;
  return country.cities.find(c => c.slug === citySlug) || null;
};

// Find city by slug across all countries
export const findCityBySlug = (citySlug: string): { city: City; country: Country } | null => {
  for (const country of Object.values(COUNTRIES)) {
    const city = country.cities.find(c => c.slug === citySlug);
    if (city) {
      return { city, country };
    }
  }
  return null;
};

// Get all cities across all countries
export const getAllCities = (): City[] => {
  return Object.values(COUNTRIES).flatMap(c => c.cities);
};

// Get total city count
export const getTotalCityCount = (): number => getAllCities().length;
