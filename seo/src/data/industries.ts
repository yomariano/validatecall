/**
 * Industry data for programmatic SEO pages
 * Each industry generates a unique landing page
 */

export interface Industry {
  slug: string;
  name: string;
  namePlural: string;
  description: string;
  metaDescription: string;
  leadsCount: number;
  countriesCount: number;
  avgResponseRate: number;
  painPoints: string[];
  useCases: string[];
  relatedIndustries: string[];
  topLocations: string[];
  keywords: string[];
  icon: string;
}

export const INDUSTRIES: Record<string, Industry> = {
  // Professional Services
  "real-estate": {
    slug: "real-estate",
    name: "Real Estate",
    namePlural: "Real Estate Agents",
    description: "Real estate agencies, brokers, and property management companies",
    metaDescription: "Generate qualified real estate leads and validate property market ideas with AI-powered research calls. Find real estate agents, brokers, and property managers.",
    leadsCount: 125000,
    countriesCount: 95,
    avgResponseRate: 32,
    painPoints: [
      "Finding qualified buyers and sellers",
      "Validating new market areas",
      "Understanding buyer preferences",
      "Competitive market analysis"
    ],
    useCases: [
      "New market expansion research",
      "Buyer preference surveys",
      "Property valuation feedback",
      "Agent recruitment campaigns"
    ],
    relatedIndustries: ["mortgage-brokers", "property-management", "home-inspectors"],
    topLocations: ["new-york", "los-angeles", "london", "dubai", "sydney"],
    keywords: ["real estate leads", "realtor leads", "property leads", "real estate prospecting"],
    icon: "building"
  },

  "dental-clinics": {
    slug: "dental-clinics",
    name: "Dental Clinics",
    namePlural: "Dentists",
    description: "Dental practices, orthodontists, and oral surgery clinics",
    metaDescription: "Find dental clinic leads and validate dental marketing ideas with AI-powered market research. Connect with dentists, orthodontists, and oral surgeons.",
    leadsCount: 89000,
    countriesCount: 78,
    avgResponseRate: 34,
    painPoints: [
      "Attracting new patients",
      "Promoting cosmetic services",
      "Understanding patient needs",
      "Insurance acceptance decisions"
    ],
    useCases: [
      "New patient acquisition",
      "Invisalign/implant service validation",
      "Patient satisfaction research",
      "Treatment pricing surveys"
    ],
    relatedIndustries: ["orthodontists", "oral-surgeons", "dental-labs"],
    topLocations: ["los-angeles", "new-york", "london", "toronto", "melbourne"],
    keywords: ["dental leads", "dentist leads", "dental marketing", "dental prospecting"],
    icon: "tooth"
  },

  "restaurants": {
    slug: "restaurants",
    name: "Restaurants",
    namePlural: "Restaurant Owners",
    description: "Restaurants, cafes, bars, and food service establishments",
    metaDescription: "Generate restaurant leads and validate food service business ideas with AI calling. Research restaurant owners, cafe managers, and food service operators.",
    leadsCount: 245000,
    countriesCount: 120,
    avgResponseRate: 28,
    painPoints: [
      "Customer acquisition costs",
      "Menu optimization",
      "Delivery service decisions",
      "Staff scheduling challenges"
    ],
    useCases: [
      "Menu feedback research",
      "Delivery platform validation",
      "Customer preference surveys",
      "Location expansion research"
    ],
    relatedIndustries: ["coffee-shops", "bars-pubs", "catering-services", "food-trucks"],
    topLocations: ["new-york", "london", "paris", "tokyo", "los-angeles"],
    keywords: ["restaurant leads", "food service leads", "restaurant marketing", "cafe leads"],
    icon: "utensils"
  },

  "law-firms": {
    slug: "law-firms",
    name: "Law Firms",
    namePlural: "Lawyers",
    description: "Legal practices, attorneys, and law offices",
    metaDescription: "Find law firm leads and validate legal service ideas with AI market research. Connect with attorneys, lawyers, and legal professionals.",
    leadsCount: 67000,
    countriesCount: 65,
    avgResponseRate: 26,
    painPoints: [
      "Client acquisition",
      "Practice area expansion",
      "Competitive differentiation",
      "Technology adoption"
    ],
    useCases: [
      "New service validation",
      "Client satisfaction surveys",
      "Legal tech adoption research",
      "Referral network building"
    ],
    relatedIndustries: ["accounting-firms", "notaries", "legal-consultants"],
    topLocations: ["new-york", "london", "chicago", "los-angeles", "washington-dc"],
    keywords: ["law firm leads", "attorney leads", "lawyer leads", "legal leads"],
    icon: "scale"
  },

  "plumbers": {
    slug: "plumbers",
    name: "Plumbing Services",
    namePlural: "Plumbers",
    description: "Plumbing contractors and plumbing service companies",
    metaDescription: "Generate plumber leads and validate home service business ideas with AI calling. Research plumbing contractors and service providers.",
    leadsCount: 78000,
    countriesCount: 45,
    avgResponseRate: 38,
    painPoints: [
      "Lead generation costs",
      "Seasonal demand fluctuations",
      "Service area expansion",
      "Emergency service pricing"
    ],
    useCases: [
      "Service expansion research",
      "Pricing validation",
      "Customer feedback collection",
      "Partnership opportunity research"
    ],
    relatedIndustries: ["electricians", "hvac-contractors", "handymen"],
    topLocations: ["los-angeles", "houston", "phoenix", "dallas", "chicago"],
    keywords: ["plumber leads", "plumbing leads", "plumbing contractor leads"],
    icon: "wrench"
  },

  "car-dealerships": {
    slug: "car-dealerships",
    name: "Car Dealerships",
    namePlural: "Car Dealers",
    description: "New and used car dealerships and automotive sales",
    metaDescription: "Find car dealership leads and validate automotive business ideas with AI research calls. Connect with car dealers and automotive sales managers.",
    leadsCount: 56000,
    countriesCount: 52,
    avgResponseRate: 31,
    painPoints: [
      "Lead quality issues",
      "Inventory management",
      "Online vs in-person sales",
      "Customer retention"
    ],
    useCases: [
      "EV adoption research",
      "Customer buying journey analysis",
      "Service department optimization",
      "Digital marketing validation"
    ],
    relatedIndustries: ["auto-repair-shops", "car-rental", "auto-parts"],
    topLocations: ["los-angeles", "houston", "dallas", "chicago", "atlanta"],
    keywords: ["car dealer leads", "dealership leads", "automotive leads"],
    icon: "car"
  },

  "insurance-agencies": {
    slug: "insurance-agencies",
    name: "Insurance Agencies",
    namePlural: "Insurance Agents",
    description: "Insurance brokers and agencies across all insurance types",
    metaDescription: "Generate insurance agency leads and validate insurance product ideas with AI calling. Research insurance agents and brokers.",
    leadsCount: 94000,
    countriesCount: 68,
    avgResponseRate: 29,
    painPoints: [
      "Lead generation costs",
      "Policy retention",
      "Cross-selling opportunities",
      "Digital transformation"
    ],
    useCases: [
      "New product validation",
      "Customer satisfaction research",
      "Claims experience surveys",
      "Agent recruitment"
    ],
    relatedIndustries: ["financial-advisors", "mortgage-brokers", "accounting-firms"],
    topLocations: ["new-york", "chicago", "dallas", "atlanta", "los-angeles"],
    keywords: ["insurance leads", "insurance agent leads", "insurance broker leads"],
    icon: "shield"
  },

  "fitness-centers": {
    slug: "fitness-centers",
    name: "Fitness Centers",
    namePlural: "Gym Owners",
    description: "Gyms, fitness studios, and health clubs",
    metaDescription: "Find fitness center leads and validate gym business ideas with AI market research. Connect with gym owners and fitness studio managers.",
    leadsCount: 72000,
    countriesCount: 85,
    avgResponseRate: 35,
    painPoints: [
      "Member acquisition",
      "Retention and churn",
      "Class scheduling optimization",
      "Equipment investment decisions"
    ],
    useCases: [
      "New class/service validation",
      "Member satisfaction surveys",
      "Pricing research",
      "Location expansion analysis"
    ],
    relatedIndustries: ["yoga-studios", "personal-trainers", "martial-arts", "pilates-studios"],
    topLocations: ["los-angeles", "new-york", "london", "sydney", "miami"],
    keywords: ["gym leads", "fitness leads", "health club leads", "fitness center leads"],
    icon: "dumbbell"
  },

  "hair-salons": {
    slug: "hair-salons",
    name: "Hair Salons",
    namePlural: "Salon Owners",
    description: "Hair salons, beauty parlors, and styling studios",
    metaDescription: "Generate hair salon leads and validate beauty business ideas with AI calling. Research salon owners and beauty professionals.",
    leadsCount: 156000,
    countriesCount: 92,
    avgResponseRate: 36,
    painPoints: [
      "Client retention",
      "Stylist recruitment",
      "Service pricing",
      "Product retail sales"
    ],
    useCases: [
      "New service validation",
      "Product line research",
      "Customer preference surveys",
      "Booking system feedback"
    ],
    relatedIndustries: ["nail-salons", "spas", "barbershops", "med-spas"],
    topLocations: ["los-angeles", "new-york", "miami", "london", "paris"],
    keywords: ["salon leads", "hair salon leads", "beauty salon leads"],
    icon: "scissors"
  },

  "medical-clinics": {
    slug: "medical-clinics",
    name: "Medical Clinics",
    namePlural: "Healthcare Providers",
    description: "Medical practices, urgent care, and healthcare clinics",
    metaDescription: "Find medical clinic leads and validate healthcare business ideas with AI research. Connect with doctors, clinics, and healthcare providers.",
    leadsCount: 134000,
    countriesCount: 75,
    avgResponseRate: 24,
    painPoints: [
      "Patient acquisition",
      "Insurance reimbursement",
      "Staff scheduling",
      "Technology adoption"
    ],
    useCases: [
      "New service line validation",
      "Patient satisfaction research",
      "Telehealth adoption surveys",
      "Referral network building"
    ],
    relatedIndustries: ["dental-clinics", "chiropractors", "physical-therapists", "veterinarians"],
    topLocations: ["new-york", "los-angeles", "chicago", "houston", "phoenix"],
    keywords: ["medical leads", "healthcare leads", "clinic leads", "doctor leads"],
    icon: "stethoscope"
  },

  // Add more industries...
  "electricians": {
    slug: "electricians",
    name: "Electrical Services",
    namePlural: "Electricians",
    description: "Electrical contractors and electrical service companies",
    metaDescription: "Generate electrician leads and validate electrical service business ideas with AI calling. Research electrical contractors.",
    leadsCount: 65000,
    countriesCount: 42,
    avgResponseRate: 37,
    painPoints: ["Lead generation", "Seasonal demand", "Service area coverage", "Pricing competition"],
    useCases: ["Service expansion", "Pricing validation", "Customer feedback", "Partnership research"],
    relatedIndustries: ["plumbers", "hvac-contractors", "general-contractors"],
    topLocations: ["los-angeles", "houston", "phoenix", "dallas", "atlanta"],
    keywords: ["electrician leads", "electrical contractor leads"],
    icon: "bolt"
  },

  "hvac-contractors": {
    slug: "hvac-contractors",
    name: "HVAC Services",
    namePlural: "HVAC Contractors",
    description: "Heating, ventilation, and air conditioning contractors",
    metaDescription: "Find HVAC contractor leads and validate HVAC business ideas with AI market research. Connect with heating and cooling professionals.",
    leadsCount: 48000,
    countriesCount: 38,
    avgResponseRate: 36,
    painPoints: ["Seasonal demand", "Emergency service pricing", "Equipment costs", "Technician shortage"],
    useCases: ["Service expansion", "Equipment preference research", "Maintenance plan validation", "Customer satisfaction"],
    relatedIndustries: ["plumbers", "electricians", "general-contractors"],
    topLocations: ["houston", "phoenix", "dallas", "los-angeles", "atlanta"],
    keywords: ["hvac leads", "heating leads", "cooling leads", "air conditioning leads"],
    icon: "thermometer"
  },

  "coffee-shops": {
    slug: "coffee-shops",
    name: "Coffee Shops",
    namePlural: "Coffee Shop Owners",
    description: "Coffee shops, cafes, and specialty coffee businesses",
    metaDescription: "Generate coffee shop leads and validate cafe business ideas with AI calling. Research coffee shop owners and cafe managers.",
    leadsCount: 89000,
    countriesCount: 95,
    avgResponseRate: 33,
    painPoints: ["Customer retention", "Location traffic", "Product sourcing", "Staff management"],
    useCases: ["Menu validation", "Customer preference research", "Location expansion", "Product line testing"],
    relatedIndustries: ["restaurants", "bakeries", "juice-bars"],
    topLocations: ["seattle", "portland", "san-francisco", "new-york", "london"],
    keywords: ["coffee shop leads", "cafe leads", "coffee business leads"],
    icon: "coffee"
  },

  "accounting-firms": {
    slug: "accounting-firms",
    name: "Accounting Firms",
    namePlural: "Accountants",
    description: "CPA firms, bookkeeping services, and tax professionals",
    metaDescription: "Find accounting firm leads and validate financial service ideas with AI research. Connect with CPAs, bookkeepers, and tax professionals.",
    leadsCount: 78000,
    countriesCount: 58,
    avgResponseRate: 27,
    painPoints: ["Client acquisition", "Seasonal workload", "Technology adoption", "Staff retention"],
    useCases: ["Service expansion validation", "Client satisfaction research", "Software adoption surveys", "Pricing research"],
    relatedIndustries: ["law-firms", "financial-advisors", "tax-consultants"],
    topLocations: ["new-york", "chicago", "los-angeles", "atlanta", "dallas"],
    keywords: ["accounting leads", "CPA leads", "bookkeeping leads", "tax professional leads"],
    icon: "calculator"
  },

  "photographers": {
    slug: "photographers",
    name: "Photography Services",
    namePlural: "Photographers",
    description: "Professional photographers and photography studios",
    metaDescription: "Generate photographer leads and validate photography business ideas with AI calling. Research professional photographers and studios.",
    leadsCount: 112000,
    countriesCount: 88,
    avgResponseRate: 34,
    painPoints: ["Client acquisition", "Seasonal demand", "Pricing strategy", "Equipment costs"],
    useCases: ["Service validation", "Pricing research", "Client preference surveys", "Partnership opportunities"],
    relatedIndustries: ["wedding-planners", "videographers", "event-planners"],
    topLocations: ["los-angeles", "new-york", "london", "paris", "miami"],
    keywords: ["photographer leads", "photography leads", "wedding photographer leads"],
    icon: "camera"
  },

  "wedding-planners": {
    slug: "wedding-planners",
    name: "Wedding Planning",
    namePlural: "Wedding Planners",
    description: "Wedding planners and event coordination services",
    metaDescription: "Find wedding planner leads and validate wedding business ideas with AI market research. Connect with wedding coordinators and event planners.",
    leadsCount: 34000,
    countriesCount: 65,
    avgResponseRate: 38,
    painPoints: ["Lead generation", "Vendor relationships", "Seasonal demand", "Client expectations"],
    useCases: ["Service validation", "Vendor preference research", "Pricing surveys", "Trend analysis"],
    relatedIndustries: ["photographers", "florists", "event-venues", "catering-services"],
    topLocations: ["new-york", "los-angeles", "miami", "chicago", "london"],
    keywords: ["wedding planner leads", "wedding planning leads", "event planner leads"],
    icon: "heart"
  },

  "web-design": {
    slug: "web-design",
    name: "Web Design Agencies",
    namePlural: "Web Designers",
    description: "Web design agencies and digital design studios",
    metaDescription: "Generate web design agency leads and validate digital service ideas with AI calling. Research web designers and digital agencies.",
    leadsCount: 67000,
    countriesCount: 72,
    avgResponseRate: 31,
    painPoints: ["Client acquisition", "Project scope creep", "Pricing competition", "Technology changes"],
    useCases: ["Service validation", "Pricing research", "Client satisfaction surveys", "Partnership opportunities"],
    relatedIndustries: ["marketing-agencies", "it-services", "seo-agencies"],
    topLocations: ["new-york", "london", "san-francisco", "los-angeles", "berlin"],
    keywords: ["web design leads", "web development leads", "digital agency leads"],
    icon: "globe"
  },

  "marketing-agencies": {
    slug: "marketing-agencies",
    name: "Marketing Agencies",
    namePlural: "Marketing Professionals",
    description: "Digital marketing agencies and advertising firms",
    metaDescription: "Find marketing agency leads and validate marketing service ideas with AI research. Connect with digital marketers and ad agencies.",
    leadsCount: 89000,
    countriesCount: 78,
    avgResponseRate: 29,
    painPoints: ["Client retention", "Proving ROI", "Talent acquisition", "Service differentiation"],
    useCases: ["Service validation", "Pricing research", "Client feedback surveys", "Industry trend analysis"],
    relatedIndustries: ["web-design", "seo-agencies", "pr-agencies"],
    topLocations: ["new-york", "london", "los-angeles", "chicago", "sydney"],
    keywords: ["marketing agency leads", "digital marketing leads", "advertising agency leads"],
    icon: "megaphone"
  },

  "cleaning-services": {
    slug: "cleaning-services",
    name: "Cleaning Services",
    namePlural: "Cleaning Companies",
    description: "Residential and commercial cleaning services",
    metaDescription: "Generate cleaning service leads and validate cleaning business ideas with AI calling. Research cleaning companies and janitorial services.",
    leadsCount: 145000,
    countriesCount: 65,
    avgResponseRate: 39,
    painPoints: ["Client acquisition", "Staff reliability", "Pricing competition", "Service consistency"],
    useCases: ["Service expansion validation", "Pricing research", "Customer satisfaction surveys", "Territory expansion"],
    relatedIndustries: ["pest-control", "landscapers", "handymen"],
    topLocations: ["new-york", "los-angeles", "houston", "chicago", "phoenix"],
    keywords: ["cleaning service leads", "janitorial leads", "commercial cleaning leads"],
    icon: "sparkles"
  },

  "landscapers": {
    slug: "landscapers",
    name: "Landscaping Services",
    namePlural: "Landscapers",
    description: "Landscaping companies and lawn care services",
    metaDescription: "Find landscaping leads and validate lawn care business ideas with AI market research. Connect with landscapers and lawn service providers.",
    leadsCount: 98000,
    countriesCount: 42,
    avgResponseRate: 37,
    painPoints: ["Seasonal demand", "Equipment costs", "Staff management", "Weather dependency"],
    useCases: ["Service expansion", "Pricing validation", "Customer preference research", "Territory analysis"],
    relatedIndustries: ["pest-control", "cleaning-services", "pool-services"],
    topLocations: ["los-angeles", "phoenix", "dallas", "houston", "atlanta"],
    keywords: ["landscaping leads", "lawn care leads", "landscape contractor leads"],
    icon: "leaf"
  },

  // Healthcare & Medical
  "chiropractors": {
    slug: "chiropractors",
    name: "Chiropractic Clinics",
    namePlural: "Chiropractors",
    description: "Chiropractic practices and spinal health clinics",
    metaDescription: "Generate chiropractor leads and validate chiropractic business ideas with AI calling. Research chiropractic clinics and practitioners.",
    leadsCount: 45000,
    countriesCount: 35,
    avgResponseRate: 33,
    painPoints: ["Patient acquisition", "Insurance billing", "Treatment plan compliance", "Competition"],
    useCases: ["New service validation", "Patient satisfaction research", "Pricing surveys", "Referral network building"],
    relatedIndustries: ["physical-therapists", "medical-clinics", "massage-therapists"],
    topLocations: ["los-angeles", "phoenix", "dallas", "denver", "atlanta"],
    keywords: ["chiropractor leads", "chiropractic leads", "spine clinic leads"],
    icon: "spine"
  },

  "physical-therapists": {
    slug: "physical-therapists",
    name: "Physical Therapy",
    namePlural: "Physical Therapists",
    description: "Physical therapy clinics and rehabilitation centers",
    metaDescription: "Find physical therapy leads and validate PT business ideas with AI market research. Connect with physical therapists and rehab clinics.",
    leadsCount: 52000,
    countriesCount: 42,
    avgResponseRate: 31,
    painPoints: ["Patient referrals", "Insurance reimbursement", "Staff retention", "Treatment adherence"],
    useCases: ["Service expansion research", "Patient outcome surveys", "Referral source analysis", "Equipment investment"],
    relatedIndustries: ["chiropractors", "medical-clinics", "sports-medicine"],
    topLocations: ["new-york", "los-angeles", "chicago", "houston", "phoenix"],
    keywords: ["physical therapy leads", "PT leads", "rehab clinic leads"],
    icon: "activity"
  },

  "veterinarians": {
    slug: "veterinarians",
    name: "Veterinary Clinics",
    namePlural: "Veterinarians",
    description: "Animal hospitals, vet clinics, and pet care practices",
    metaDescription: "Generate veterinary clinic leads and validate pet care business ideas with AI calling. Research vets and animal hospitals.",
    leadsCount: 67000,
    countriesCount: 55,
    avgResponseRate: 35,
    painPoints: ["Client acquisition", "Emergency services", "Specialty referrals", "Staff scheduling"],
    useCases: ["New service validation", "Pet owner surveys", "Pricing research", "Service area expansion"],
    relatedIndustries: ["pet-stores", "pet-grooming", "pet-boarding"],
    topLocations: ["los-angeles", "new-york", "houston", "chicago", "phoenix"],
    keywords: ["veterinarian leads", "vet clinic leads", "animal hospital leads"],
    icon: "paw"
  },

  "optometrists": {
    slug: "optometrists",
    name: "Optometry Clinics",
    namePlural: "Optometrists",
    description: "Eye care clinics and vision centers",
    metaDescription: "Find optometrist leads and validate eye care business ideas with AI research. Connect with optometrists and vision centers.",
    leadsCount: 38000,
    countriesCount: 45,
    avgResponseRate: 32,
    painPoints: ["Patient acquisition", "Insurance networks", "Retail eyewear competition", "Technology investment"],
    useCases: ["Service validation", "Patient satisfaction surveys", "Product line research", "Marketing effectiveness"],
    relatedIndustries: ["medical-clinics", "dental-clinics", "hearing-aids"],
    topLocations: ["new-york", "los-angeles", "chicago", "houston", "dallas"],
    keywords: ["optometrist leads", "eye doctor leads", "vision center leads"],
    icon: "eye"
  },

  "pharmacies": {
    slug: "pharmacies",
    name: "Pharmacies",
    namePlural: "Pharmacists",
    description: "Independent pharmacies and drugstores",
    metaDescription: "Generate pharmacy leads and validate pharmaceutical business ideas with AI calling. Research independent pharmacies and drugstores.",
    leadsCount: 42000,
    countriesCount: 48,
    avgResponseRate: 28,
    painPoints: ["PBM negotiations", "Big chain competition", "Inventory management", "Patient adherence"],
    useCases: ["Service expansion", "Customer satisfaction research", "Product line validation", "Partnership opportunities"],
    relatedIndustries: ["medical-clinics", "senior-care", "home-health"],
    topLocations: ["new-york", "los-angeles", "chicago", "houston", "phoenix"],
    keywords: ["pharmacy leads", "drugstore leads", "pharmacist leads"],
    icon: "pill"
  },

  "mental-health": {
    slug: "mental-health",
    name: "Mental Health Services",
    namePlural: "Therapists",
    description: "Psychologists, counselors, and mental health clinics",
    metaDescription: "Find mental health practice leads and validate therapy business ideas with AI research. Connect with therapists and counselors.",
    leadsCount: 78000,
    countriesCount: 52,
    avgResponseRate: 29,
    painPoints: ["Client acquisition", "Insurance credentialing", "Telehealth adoption", "Burnout prevention"],
    useCases: ["Service validation", "Client satisfaction research", "Telehealth preference surveys", "Specialty expansion"],
    relatedIndustries: ["medical-clinics", "life-coaches", "addiction-treatment"],
    topLocations: ["new-york", "los-angeles", "chicago", "seattle", "denver"],
    keywords: ["therapy leads", "counselor leads", "mental health leads", "psychologist leads"],
    icon: "brain"
  },

  "dermatologists": {
    slug: "dermatologists",
    name: "Dermatology Clinics",
    namePlural: "Dermatologists",
    description: "Dermatology practices and skin care clinics",
    metaDescription: "Generate dermatology leads and validate skin care business ideas with AI calling. Research dermatologists and skin clinics.",
    leadsCount: 28000,
    countriesCount: 38,
    avgResponseRate: 30,
    painPoints: ["Patient acquisition", "Cosmetic vs medical balance", "Insurance reimbursement", "Product recommendations"],
    useCases: ["New treatment validation", "Patient satisfaction surveys", "Pricing research", "Cosmetic service demand"],
    relatedIndustries: ["med-spas", "plastic-surgeons", "medical-clinics"],
    topLocations: ["los-angeles", "new-york", "miami", "dallas", "chicago"],
    keywords: ["dermatologist leads", "skin clinic leads", "dermatology leads"],
    icon: "shield-check"
  },

  "home-health": {
    slug: "home-health",
    name: "Home Health Care",
    namePlural: "Home Health Providers",
    description: "Home health agencies and in-home care services",
    metaDescription: "Find home health care leads and validate home care business ideas with AI research. Connect with home health agencies.",
    leadsCount: 56000,
    countriesCount: 35,
    avgResponseRate: 34,
    painPoints: ["Caregiver recruitment", "Patient acquisition", "Insurance reimbursement", "Quality compliance"],
    useCases: ["Service expansion", "Caregiver satisfaction surveys", "Family feedback research", "Territory analysis"],
    relatedIndustries: ["senior-care", "medical-clinics", "hospice"],
    topLocations: ["new-york", "los-angeles", "houston", "chicago", "phoenix"],
    keywords: ["home health leads", "home care leads", "in-home care leads"],
    icon: "home-heart"
  },

  // Home Services
  "roofing-contractors": {
    slug: "roofing-contractors",
    name: "Roofing Services",
    namePlural: "Roofing Contractors",
    description: "Roofing contractors and roof repair companies",
    metaDescription: "Generate roofing contractor leads and validate roofing business ideas with AI calling. Research roofing companies and contractors.",
    leadsCount: 72000,
    countriesCount: 38,
    avgResponseRate: 36,
    painPoints: ["Lead quality", "Weather dependency", "Material costs", "Labor shortage"],
    useCases: ["Service expansion", "Pricing research", "Customer satisfaction surveys", "Insurance work validation"],
    relatedIndustries: ["general-contractors", "siding-contractors", "gutter-services"],
    topLocations: ["houston", "dallas", "phoenix", "denver", "atlanta"],
    keywords: ["roofing leads", "roof contractor leads", "roofing company leads"],
    icon: "home"
  },

  "pest-control": {
    slug: "pest-control",
    name: "Pest Control",
    namePlural: "Pest Control Companies",
    description: "Pest control and extermination services",
    metaDescription: "Find pest control leads and validate extermination business ideas with AI market research. Connect with pest control companies.",
    leadsCount: 58000,
    countriesCount: 42,
    avgResponseRate: 38,
    painPoints: ["Seasonal demand", "Customer retention", "Chemical regulations", "Service area coverage"],
    useCases: ["Service expansion", "Pricing validation", "Customer preference research", "Recurring service optimization"],
    relatedIndustries: ["landscapers", "cleaning-services", "property-management"],
    topLocations: ["houston", "phoenix", "miami", "los-angeles", "atlanta"],
    keywords: ["pest control leads", "exterminator leads", "pest management leads"],
    icon: "bug"
  },

  "pool-services": {
    slug: "pool-services",
    name: "Pool Services",
    namePlural: "Pool Service Companies",
    description: "Pool cleaning, maintenance, and repair services",
    metaDescription: "Generate pool service leads and validate pool business ideas with AI calling. Research pool cleaning and maintenance companies.",
    leadsCount: 34000,
    countriesCount: 28,
    avgResponseRate: 37,
    painPoints: ["Seasonal demand", "Chemical costs", "Route optimization", "Equipment investment"],
    useCases: ["Service expansion", "Pricing research", "Customer satisfaction surveys", "New service validation"],
    relatedIndustries: ["landscapers", "outdoor-living", "home-services"],
    topLocations: ["phoenix", "los-angeles", "miami", "houston", "dallas"],
    keywords: ["pool service leads", "pool cleaning leads", "pool maintenance leads"],
    icon: "waves"
  },

  "garage-door": {
    slug: "garage-door",
    name: "Garage Door Services",
    namePlural: "Garage Door Companies",
    description: "Garage door installation and repair services",
    metaDescription: "Find garage door service leads and validate garage door business ideas with AI research. Connect with garage door installers.",
    leadsCount: 28000,
    countriesCount: 25,
    avgResponseRate: 39,
    painPoints: ["Lead generation", "Emergency service pricing", "Parts inventory", "Competition"],
    useCases: ["Service area expansion", "Pricing validation", "Customer feedback research", "Product line analysis"],
    relatedIndustries: ["general-contractors", "locksmiths", "home-security"],
    topLocations: ["los-angeles", "houston", "dallas", "phoenix", "chicago"],
    keywords: ["garage door leads", "overhead door leads", "garage door repair leads"],
    icon: "door"
  },

  "locksmiths": {
    slug: "locksmiths",
    name: "Locksmith Services",
    namePlural: "Locksmiths",
    description: "Locksmith and security lock services",
    metaDescription: "Generate locksmith leads and validate locksmith business ideas with AI calling. Research locksmiths and security services.",
    leadsCount: 42000,
    countriesCount: 48,
    avgResponseRate: 35,
    painPoints: ["Emergency call pricing", "Scam reputation issues", "Mobile service logistics", "Competition"],
    useCases: ["Service validation", "Pricing research", "Customer satisfaction surveys", "Security product demand"],
    relatedIndustries: ["home-security", "garage-door", "auto-services"],
    topLocations: ["new-york", "los-angeles", "chicago", "houston", "phoenix"],
    keywords: ["locksmith leads", "lock service leads", "security lock leads"],
    icon: "key"
  },

  "painting-contractors": {
    slug: "painting-contractors",
    name: "Painting Services",
    namePlural: "Painting Contractors",
    description: "Residential and commercial painting contractors",
    metaDescription: "Find painting contractor leads and validate painting business ideas with AI research. Connect with painters and painting companies.",
    leadsCount: 89000,
    countriesCount: 45,
    avgResponseRate: 36,
    painPoints: ["Lead generation", "Seasonal demand", "Labor costs", "Material expenses"],
    useCases: ["Service expansion", "Pricing validation", "Customer preference research", "Commercial vs residential"],
    relatedIndustries: ["general-contractors", "flooring-contractors", "drywall-contractors"],
    topLocations: ["los-angeles", "new-york", "houston", "chicago", "phoenix"],
    keywords: ["painting leads", "painter leads", "painting contractor leads"],
    icon: "paintbrush"
  },

  "flooring-contractors": {
    slug: "flooring-contractors",
    name: "Flooring Services",
    namePlural: "Flooring Contractors",
    description: "Flooring installation and refinishing contractors",
    metaDescription: "Generate flooring contractor leads and validate flooring business ideas with AI calling. Research flooring installers and companies.",
    leadsCount: 67000,
    countriesCount: 38,
    avgResponseRate: 35,
    painPoints: ["Material sourcing", "Installation scheduling", "Customer expectations", "Competition"],
    useCases: ["Product line validation", "Pricing research", "Customer satisfaction surveys", "Territory expansion"],
    relatedIndustries: ["general-contractors", "painting-contractors", "kitchen-remodelers"],
    topLocations: ["los-angeles", "new-york", "houston", "dallas", "chicago"],
    keywords: ["flooring leads", "floor installation leads", "hardwood flooring leads"],
    icon: "layers"
  },

  "kitchen-remodelers": {
    slug: "kitchen-remodelers",
    name: "Kitchen Remodeling",
    namePlural: "Kitchen Remodelers",
    description: "Kitchen renovation and remodeling contractors",
    metaDescription: "Find kitchen remodeling leads and validate renovation business ideas with AI research. Connect with kitchen contractors.",
    leadsCount: 45000,
    countriesCount: 32,
    avgResponseRate: 33,
    painPoints: ["Lead quality", "Project delays", "Material costs", "Subcontractor management"],
    useCases: ["Design trend research", "Pricing validation", "Customer preference surveys", "Product line analysis"],
    relatedIndustries: ["bathroom-remodelers", "general-contractors", "cabinet-makers"],
    topLocations: ["los-angeles", "new-york", "chicago", "houston", "dallas"],
    keywords: ["kitchen remodeling leads", "kitchen renovation leads", "kitchen contractor leads"],
    icon: "utensils"
  },

  "bathroom-remodelers": {
    slug: "bathroom-remodelers",
    name: "Bathroom Remodeling",
    namePlural: "Bathroom Remodelers",
    description: "Bathroom renovation and remodeling contractors",
    metaDescription: "Generate bathroom remodeling leads and validate renovation business ideas with AI calling. Research bathroom contractors.",
    leadsCount: 42000,
    countriesCount: 32,
    avgResponseRate: 34,
    painPoints: ["Lead quality", "Project scope creep", "Plumbing coordination", "Tile sourcing"],
    useCases: ["Design trend research", "Pricing validation", "Customer satisfaction surveys", "Product demand analysis"],
    relatedIndustries: ["kitchen-remodelers", "plumbers", "general-contractors"],
    topLocations: ["los-angeles", "new-york", "chicago", "houston", "phoenix"],
    keywords: ["bathroom remodeling leads", "bathroom renovation leads", "bath contractor leads"],
    icon: "bath"
  },

  "general-contractors": {
    slug: "general-contractors",
    name: "General Contractors",
    namePlural: "General Contractors",
    description: "General construction and building contractors",
    metaDescription: "Find general contractor leads and validate construction business ideas with AI research. Connect with builders and contractors.",
    leadsCount: 156000,
    countriesCount: 52,
    avgResponseRate: 31,
    painPoints: ["Project acquisition", "Subcontractor management", "Permit delays", "Material costs"],
    useCases: ["Service expansion", "Pricing research", "Client satisfaction surveys", "Market analysis"],
    relatedIndustries: ["kitchen-remodelers", "roofing-contractors", "electricians"],
    topLocations: ["los-angeles", "new-york", "houston", "chicago", "dallas"],
    keywords: ["general contractor leads", "builder leads", "construction leads"],
    icon: "hammer"
  },

  "moving-companies": {
    slug: "moving-companies",
    name: "Moving Services",
    namePlural: "Moving Companies",
    description: "Residential and commercial moving services",
    metaDescription: "Generate moving company leads and validate relocation business ideas with AI calling. Research movers and moving services.",
    leadsCount: 78000,
    countriesCount: 45,
    avgResponseRate: 34,
    painPoints: ["Seasonal demand", "Damage claims", "Labor management", "Price competition"],
    useCases: ["Service expansion", "Pricing validation", "Customer satisfaction surveys", "Storage service demand"],
    relatedIndustries: ["storage-facilities", "cleaning-services", "handymen"],
    topLocations: ["new-york", "los-angeles", "chicago", "houston", "dallas"],
    keywords: ["moving company leads", "mover leads", "relocation leads"],
    icon: "truck"
  },

  "appliance-repair": {
    slug: "appliance-repair",
    name: "Appliance Repair",
    namePlural: "Appliance Repair Technicians",
    description: "Home appliance repair and service companies",
    metaDescription: "Find appliance repair leads and validate appliance service business ideas with AI research. Connect with repair technicians.",
    leadsCount: 52000,
    countriesCount: 38,
    avgResponseRate: 38,
    painPoints: ["Parts availability", "Diagnostic accuracy", "Warranty claims", "Competition from replacement"],
    useCases: ["Service area expansion", "Pricing research", "Brand specialization analysis", "Customer feedback"],
    relatedIndustries: ["hvac-contractors", "electricians", "handymen"],
    topLocations: ["los-angeles", "new-york", "chicago", "houston", "phoenix"],
    keywords: ["appliance repair leads", "appliance service leads", "appliance technician leads"],
    icon: "settings"
  },

  "handymen": {
    slug: "handymen",
    name: "Handyman Services",
    namePlural: "Handymen",
    description: "General handyman and home repair services",
    metaDescription: "Generate handyman leads and validate home repair business ideas with AI calling. Research handyman services.",
    leadsCount: 112000,
    countriesCount: 48,
    avgResponseRate: 39,
    painPoints: ["Lead generation", "Service pricing", "Scope management", "Insurance costs"],
    useCases: ["Service expansion", "Pricing validation", "Customer preference research", "Recurring service demand"],
    relatedIndustries: ["painting-contractors", "electricians", "plumbers"],
    topLocations: ["los-angeles", "new-york", "houston", "chicago", "phoenix"],
    keywords: ["handyman leads", "home repair leads", "fix-it leads"],
    icon: "tool"
  },

  // Automotive
  "auto-repair": {
    slug: "auto-repair",
    name: "Auto Repair Shops",
    namePlural: "Auto Mechanics",
    description: "Automotive repair shops and mechanics",
    metaDescription: "Find auto repair shop leads and validate automotive business ideas with AI research. Connect with mechanics and repair shops.",
    leadsCount: 145000,
    countriesCount: 58,
    avgResponseRate: 33,
    painPoints: ["Customer trust", "Parts sourcing", "Technology changes", "Competition"],
    useCases: ["Service expansion", "Customer satisfaction surveys", "Pricing research", "Specialty service validation"],
    relatedIndustries: ["car-dealerships", "tire-shops", "auto-body"],
    topLocations: ["los-angeles", "houston", "dallas", "chicago", "phoenix"],
    keywords: ["auto repair leads", "mechanic leads", "car repair leads"],
    icon: "wrench"
  },

  "car-wash": {
    slug: "car-wash",
    name: "Car Wash Services",
    namePlural: "Car Wash Owners",
    description: "Car wash and auto detailing services",
    metaDescription: "Generate car wash leads and validate auto detailing business ideas with AI calling. Research car wash owners and detailers.",
    leadsCount: 67000,
    countriesCount: 45,
    avgResponseRate: 35,
    painPoints: ["Weather dependency", "Water costs", "Equipment maintenance", "Membership retention"],
    useCases: ["Service validation", "Pricing research", "Customer preference surveys", "Location analysis"],
    relatedIndustries: ["auto-repair", "auto-detailing", "car-dealerships"],
    topLocations: ["los-angeles", "phoenix", "houston", "dallas", "miami"],
    keywords: ["car wash leads", "auto detailing leads", "car care leads"],
    icon: "droplet"
  },

  "tire-shops": {
    slug: "tire-shops",
    name: "Tire Shops",
    namePlural: "Tire Shop Owners",
    description: "Tire sales and service shops",
    metaDescription: "Find tire shop leads and validate tire business ideas with AI research. Connect with tire shops and dealers.",
    leadsCount: 48000,
    countriesCount: 42,
    avgResponseRate: 34,
    painPoints: ["Inventory management", "Price competition", "Seasonal demand", "Big chain competition"],
    useCases: ["Brand preference research", "Pricing validation", "Service expansion analysis", "Customer satisfaction"],
    relatedIndustries: ["auto-repair", "auto-body", "oil-change"],
    topLocations: ["los-angeles", "houston", "dallas", "chicago", "phoenix"],
    keywords: ["tire shop leads", "tire dealer leads", "tire service leads"],
    icon: "circle"
  },

  "auto-body": {
    slug: "auto-body",
    name: "Auto Body Shops",
    namePlural: "Auto Body Shop Owners",
    description: "Auto body repair and collision centers",
    metaDescription: "Generate auto body shop leads and validate collision repair business ideas with AI calling. Research body shops.",
    leadsCount: 52000,
    countriesCount: 38,
    avgResponseRate: 32,
    painPoints: ["Insurance negotiations", "Parts delays", "Skilled labor shortage", "DRP relationships"],
    useCases: ["Insurance partner research", "Customer satisfaction surveys", "Pricing analysis", "Service expansion"],
    relatedIndustries: ["auto-repair", "car-dealerships", "tow-trucks"],
    topLocations: ["los-angeles", "houston", "dallas", "chicago", "phoenix"],
    keywords: ["auto body leads", "collision repair leads", "body shop leads"],
    icon: "car"
  },

  "tow-trucks": {
    slug: "tow-trucks",
    name: "Towing Services",
    namePlural: "Tow Truck Operators",
    description: "Towing and roadside assistance services",
    metaDescription: "Find towing service leads and validate tow truck business ideas with AI research. Connect with towing companies.",
    leadsCount: 38000,
    countriesCount: 32,
    avgResponseRate: 36,
    painPoints: ["Response time pressure", "Equipment costs", "Insurance requirements", "Competition"],
    useCases: ["Service area analysis", "Pricing research", "Partnership opportunities", "Fleet expansion validation"],
    relatedIndustries: ["auto-repair", "auto-body", "insurance-agencies"],
    topLocations: ["los-angeles", "new-york", "houston", "chicago", "phoenix"],
    keywords: ["towing leads", "tow truck leads", "roadside assistance leads"],
    icon: "truck"
  },

  // Beauty & Wellness
  "nail-salons": {
    slug: "nail-salons",
    name: "Nail Salons",
    namePlural: "Nail Salon Owners",
    description: "Nail salons and manicure services",
    metaDescription: "Generate nail salon leads and validate nail business ideas with AI calling. Research nail salons and technicians.",
    leadsCount: 134000,
    countriesCount: 75,
    avgResponseRate: 37,
    painPoints: ["Technician retention", "Product costs", "Walk-in traffic", "Competition"],
    useCases: ["Service validation", "Pricing research", "Customer preference surveys", "Product line analysis"],
    relatedIndustries: ["hair-salons", "spas", "med-spas"],
    topLocations: ["los-angeles", "new-york", "miami", "houston", "dallas"],
    keywords: ["nail salon leads", "manicure leads", "nail tech leads"],
    icon: "sparkles"
  },

  "spas": {
    slug: "spas",
    name: "Day Spas",
    namePlural: "Spa Owners",
    description: "Day spas and wellness centers",
    metaDescription: "Find spa leads and validate wellness business ideas with AI research. Connect with spa owners and managers.",
    leadsCount: 78000,
    countriesCount: 65,
    avgResponseRate: 34,
    painPoints: ["Client retention", "Staff training", "Product inventory", "Service differentiation"],
    useCases: ["New treatment validation", "Customer satisfaction surveys", "Pricing research", "Membership program analysis"],
    relatedIndustries: ["hair-salons", "med-spas", "massage-therapists"],
    topLocations: ["los-angeles", "new-york", "miami", "scottsdale", "las-vegas"],
    keywords: ["spa leads", "day spa leads", "wellness center leads"],
    icon: "flower"
  },

  "barbershops": {
    slug: "barbershops",
    name: "Barbershops",
    namePlural: "Barbers",
    description: "Barbershops and men's grooming services",
    metaDescription: "Generate barbershop leads and validate men's grooming business ideas with AI calling. Research barbers and shops.",
    leadsCount: 98000,
    countriesCount: 72,
    avgResponseRate: 38,
    painPoints: ["Barber retention", "Walk-in vs appointment balance", "Product sales", "Location traffic"],
    useCases: ["Service expansion", "Pricing validation", "Customer preference research", "Product line testing"],
    relatedIndustries: ["hair-salons", "men-grooming", "spas"],
    topLocations: ["new-york", "los-angeles", "atlanta", "chicago", "houston"],
    keywords: ["barbershop leads", "barber leads", "men's grooming leads"],
    icon: "scissors"
  },

  "med-spas": {
    slug: "med-spas",
    name: "Medical Spas",
    namePlural: "Med Spa Owners",
    description: "Medical spas and aesthetic clinics",
    metaDescription: "Find med spa leads and validate aesthetic business ideas with AI research. Connect with medical spa owners.",
    leadsCount: 34000,
    countriesCount: 38,
    avgResponseRate: 31,
    painPoints: ["Provider recruitment", "Equipment investment", "Regulatory compliance", "Competition"],
    useCases: ["Treatment validation", "Customer satisfaction surveys", "Pricing research", "Market demand analysis"],
    relatedIndustries: ["dermatologists", "plastic-surgeons", "spas"],
    topLocations: ["los-angeles", "miami", "new-york", "dallas", "scottsdale"],
    keywords: ["med spa leads", "medical spa leads", "aesthetic clinic leads"],
    icon: "sparkle"
  },

  "massage-therapists": {
    slug: "massage-therapists",
    name: "Massage Therapy",
    namePlural: "Massage Therapists",
    description: "Massage therapy practices and wellness centers",
    metaDescription: "Generate massage therapist leads and validate massage business ideas with AI calling. Research massage practices.",
    leadsCount: 89000,
    countriesCount: 58,
    avgResponseRate: 36,
    painPoints: ["Client acquisition", "Physical demands", "Pricing strategy", "Appointment scheduling"],
    useCases: ["Service validation", "Customer preference surveys", "Pricing research", "Specialty massage demand"],
    relatedIndustries: ["chiropractors", "spas", "physical-therapists"],
    topLocations: ["los-angeles", "new-york", "chicago", "denver", "seattle"],
    keywords: ["massage leads", "massage therapist leads", "massage business leads"],
    icon: "hand"
  },

  "tattoo-shops": {
    slug: "tattoo-shops",
    name: "Tattoo Studios",
    namePlural: "Tattoo Artists",
    description: "Tattoo parlors and body art studios",
    metaDescription: "Find tattoo shop leads and validate tattoo business ideas with AI research. Connect with tattoo artists and studios.",
    leadsCount: 67000,
    countriesCount: 55,
    avgResponseRate: 33,
    painPoints: ["Artist recruitment", "Walk-in vs appointment balance", "Health regulations", "Portfolio marketing"],
    useCases: ["Style trend research", "Customer preference surveys", "Pricing analysis", "Service expansion"],
    relatedIndustries: ["piercing-studios", "barbershops", "hair-salons"],
    topLocations: ["los-angeles", "new-york", "austin", "portland", "miami"],
    keywords: ["tattoo shop leads", "tattoo artist leads", "body art leads"],
    icon: "pen"
  },

  "yoga-studios": {
    slug: "yoga-studios",
    name: "Yoga Studios",
    namePlural: "Yoga Studio Owners",
    description: "Yoga studios and meditation centers",
    metaDescription: "Generate yoga studio leads and validate wellness business ideas with AI calling. Research yoga studios and instructors.",
    leadsCount: 56000,
    countriesCount: 62,
    avgResponseRate: 35,
    painPoints: ["Member retention", "Instructor scheduling", "Class optimization", "Competition"],
    useCases: ["Class format validation", "Member satisfaction surveys", "Pricing research", "Virtual class demand"],
    relatedIndustries: ["pilates-studios", "fitness-centers", "meditation-centers"],
    topLocations: ["los-angeles", "new-york", "denver", "austin", "san-francisco"],
    keywords: ["yoga studio leads", "yoga business leads", "wellness studio leads"],
    icon: "sun"
  },

  "pilates-studios": {
    slug: "pilates-studios",
    name: "Pilates Studios",
    namePlural: "Pilates Studio Owners",
    description: "Pilates studios and reformer classes",
    metaDescription: "Find pilates studio leads and validate pilates business ideas with AI research. Connect with pilates instructors and studios.",
    leadsCount: 28000,
    countriesCount: 42,
    avgResponseRate: 34,
    painPoints: ["Equipment costs", "Instructor certification", "Member retention", "Class scheduling"],
    useCases: ["Class format validation", "Member preference surveys", "Pricing research", "Equipment investment analysis"],
    relatedIndustries: ["yoga-studios", "fitness-centers", "personal-trainers"],
    topLocations: ["los-angeles", "new-york", "chicago", "miami", "san-francisco"],
    keywords: ["pilates studio leads", "pilates business leads", "reformer pilates leads"],
    icon: "activity"
  },

  "personal-trainers": {
    slug: "personal-trainers",
    name: "Personal Training",
    namePlural: "Personal Trainers",
    description: "Personal trainers and fitness coaches",
    metaDescription: "Generate personal trainer leads and validate fitness coaching business ideas with AI calling. Research trainers.",
    leadsCount: 112000,
    countriesCount: 72,
    avgResponseRate: 36,
    painPoints: ["Client acquisition", "Scheduling flexibility", "Income stability", "Certification costs"],
    useCases: ["Service validation", "Client preference surveys", "Pricing research", "Online coaching demand"],
    relatedIndustries: ["fitness-centers", "yoga-studios", "nutrition-coaches"],
    topLocations: ["los-angeles", "new-york", "miami", "chicago", "houston"],
    keywords: ["personal trainer leads", "fitness coach leads", "PT leads"],
    icon: "dumbbell"
  },

  "martial-arts": {
    slug: "martial-arts",
    name: "Martial Arts Schools",
    namePlural: "Martial Arts Instructors",
    description: "Martial arts schools and dojos",
    metaDescription: "Find martial arts school leads and validate dojo business ideas with AI research. Connect with martial arts instructors.",
    leadsCount: 45000,
    countriesCount: 52,
    avgResponseRate: 37,
    painPoints: ["Student retention", "Competition", "Instructor training", "Belt testing programs"],
    useCases: ["Class format validation", "Student satisfaction surveys", "Pricing research", "After-school program demand"],
    relatedIndustries: ["fitness-centers", "yoga-studios", "dance-studios"],
    topLocations: ["los-angeles", "new-york", "houston", "chicago", "phoenix"],
    keywords: ["martial arts leads", "karate school leads", "dojo leads", "MMA leads"],
    icon: "shield"
  },

  // Food & Beverage
  "bakeries": {
    slug: "bakeries",
    name: "Bakeries",
    namePlural: "Bakery Owners",
    description: "Bakeries and pastry shops",
    metaDescription: "Generate bakery leads and validate pastry business ideas with AI calling. Research bakeries and bakers.",
    leadsCount: 78000,
    countriesCount: 72,
    avgResponseRate: 35,
    painPoints: ["Early hours", "Ingredient costs", "Custom order management", "Seasonal demand"],
    useCases: ["Product line validation", "Customer preference surveys", "Pricing research", "Wholesale opportunity analysis"],
    relatedIndustries: ["coffee-shops", "restaurants", "catering-services"],
    topLocations: ["new-york", "los-angeles", "chicago", "san-francisco", "paris"],
    keywords: ["bakery leads", "baker leads", "pastry shop leads"],
    icon: "cake"
  },

  "catering-services": {
    slug: "catering-services",
    name: "Catering Services",
    namePlural: "Caterers",
    description: "Catering and event food services",
    metaDescription: "Find catering leads and validate catering business ideas with AI research. Connect with caterers and event food services.",
    leadsCount: 67000,
    countriesCount: 55,
    avgResponseRate: 34,
    painPoints: ["Event booking seasonality", "Staff scheduling", "Menu pricing", "Food waste"],
    useCases: ["Menu validation", "Client preference surveys", "Pricing research", "Service expansion analysis"],
    relatedIndustries: ["event-venues", "wedding-planners", "restaurants"],
    topLocations: ["new-york", "los-angeles", "chicago", "houston", "miami"],
    keywords: ["catering leads", "caterer leads", "event catering leads"],
    icon: "utensils"
  },

  "food-trucks": {
    slug: "food-trucks",
    name: "Food Trucks",
    namePlural: "Food Truck Owners",
    description: "Food trucks and mobile food vendors",
    metaDescription: "Generate food truck leads and validate mobile food business ideas with AI calling. Research food truck owners.",
    leadsCount: 34000,
    countriesCount: 38,
    avgResponseRate: 37,
    painPoints: ["Location permits", "Weather dependency", "Equipment maintenance", "Event booking"],
    useCases: ["Menu validation", "Location preference research", "Pricing analysis", "Event partnership opportunities"],
    relatedIndustries: ["restaurants", "catering-services", "event-planners"],
    topLocations: ["los-angeles", "austin", "portland", "new-york", "houston"],
    keywords: ["food truck leads", "mobile food leads", "street food leads"],
    icon: "truck"
  },

  "juice-bars": {
    slug: "juice-bars",
    name: "Juice Bars",
    namePlural: "Juice Bar Owners",
    description: "Juice bars and smoothie shops",
    metaDescription: "Find juice bar leads and validate smoothie business ideas with AI research. Connect with juice bar owners.",
    leadsCount: 28000,
    countriesCount: 42,
    avgResponseRate: 36,
    painPoints: ["Produce costs", "Ingredient sourcing", "Seasonal demand", "Health trend changes"],
    useCases: ["Menu validation", "Customer preference surveys", "Pricing research", "Product line expansion"],
    relatedIndustries: ["coffee-shops", "fitness-centers", "health-food-stores"],
    topLocations: ["los-angeles", "miami", "new-york", "san-diego", "honolulu"],
    keywords: ["juice bar leads", "smoothie shop leads", "health drink leads"],
    icon: "glass"
  },

  "bars-pubs": {
    slug: "bars-pubs",
    name: "Bars & Pubs",
    namePlural: "Bar Owners",
    description: "Bars, pubs, and nightclubs",
    metaDescription: "Generate bar and pub leads and validate nightlife business ideas with AI calling. Research bar owners and managers.",
    leadsCount: 156000,
    countriesCount: 85,
    avgResponseRate: 32,
    painPoints: ["Liquor regulations", "Staff turnover", "Security concerns", "Competition"],
    useCases: ["Concept validation", "Customer preference surveys", "Pricing research", "Entertainment demand"],
    relatedIndustries: ["restaurants", "event-venues", "entertainment"],
    topLocations: ["new-york", "las-vegas", "miami", "los-angeles", "chicago"],
    keywords: ["bar leads", "pub leads", "nightclub leads", "tavern leads"],
    icon: "beer"
  },

  // Professional Services
  "financial-advisors": {
    slug: "financial-advisors",
    name: "Financial Advisors",
    namePlural: "Financial Advisors",
    description: "Financial planning and wealth management services",
    metaDescription: "Find financial advisor leads and validate wealth management business ideas with AI research. Connect with financial planners.",
    leadsCount: 89000,
    countriesCount: 58,
    avgResponseRate: 26,
    painPoints: ["Client acquisition", "Regulatory compliance", "Fee compression", "Technology adoption"],
    useCases: ["Service validation", "Client satisfaction surveys", "Technology preference research", "Niche market analysis"],
    relatedIndustries: ["insurance-agencies", "accounting-firms", "mortgage-brokers"],
    topLocations: ["new-york", "chicago", "san-francisco", "boston", "los-angeles"],
    keywords: ["financial advisor leads", "wealth management leads", "financial planner leads"],
    icon: "trending-up"
  },

  "mortgage-brokers": {
    slug: "mortgage-brokers",
    name: "Mortgage Brokers",
    namePlural: "Mortgage Brokers",
    description: "Mortgage brokers and loan officers",
    metaDescription: "Generate mortgage broker leads and validate lending business ideas with AI calling. Research loan officers and brokers.",
    leadsCount: 67000,
    countriesCount: 38,
    avgResponseRate: 29,
    painPoints: ["Rate competition", "Regulatory changes", "Lead quality", "Processing times"],
    useCases: ["Product validation", "Borrower preference surveys", "Pricing research", "Partnership opportunities"],
    relatedIndustries: ["real-estate", "financial-advisors", "insurance-agencies"],
    topLocations: ["los-angeles", "new-york", "miami", "houston", "phoenix"],
    keywords: ["mortgage broker leads", "loan officer leads", "mortgage leads"],
    icon: "home"
  },

  "staffing-agencies": {
    slug: "staffing-agencies",
    name: "Staffing Agencies",
    namePlural: "Staffing Professionals",
    description: "Staffing agencies and recruitment firms",
    metaDescription: "Find staffing agency leads and validate recruitment business ideas with AI research. Connect with staffing professionals.",
    leadsCount: 56000,
    countriesCount: 48,
    avgResponseRate: 28,
    painPoints: ["Candidate sourcing", "Client retention", "Margin pressure", "Compliance"],
    useCases: ["Service validation", "Client preference surveys", "Industry specialization research", "Technology adoption"],
    relatedIndustries: ["hr-consultants", "executive-search", "outsourcing"],
    topLocations: ["new-york", "los-angeles", "chicago", "atlanta", "dallas"],
    keywords: ["staffing agency leads", "recruitment leads", "temp agency leads"],
    icon: "users"
  },

  "it-services": {
    slug: "it-services",
    name: "IT Services",
    namePlural: "IT Service Providers",
    description: "Managed IT services and tech support companies",
    metaDescription: "Generate IT service leads and validate tech support business ideas with AI calling. Research MSPs and IT companies.",
    leadsCount: 78000,
    countriesCount: 62,
    avgResponseRate: 27,
    painPoints: ["Client acquisition", "Talent retention", "Technology changes", "Pricing pressure"],
    useCases: ["Service validation", "Client satisfaction surveys", "Technology preference research", "Vertical specialization"],
    relatedIndustries: ["web-design", "cybersecurity", "cloud-services"],
    topLocations: ["san-francisco", "new-york", "austin", "seattle", "boston"],
    keywords: ["IT service leads", "MSP leads", "tech support leads"],
    icon: "server"
  },

  "seo-agencies": {
    slug: "seo-agencies",
    name: "SEO Agencies",
    namePlural: "SEO Professionals",
    description: "Search engine optimization agencies",
    metaDescription: "Find SEO agency leads and validate digital marketing business ideas with AI research. Connect with SEO professionals.",
    leadsCount: 45000,
    countriesCount: 55,
    avgResponseRate: 29,
    painPoints: ["Proving ROI", "Algorithm changes", "Client education", "Competition"],
    useCases: ["Service validation", "Client satisfaction surveys", "Pricing research", "Service expansion analysis"],
    relatedIndustries: ["marketing-agencies", "web-design", "ppc-agencies"],
    topLocations: ["new-york", "los-angeles", "london", "san-francisco", "chicago"],
    keywords: ["SEO agency leads", "SEO company leads", "search marketing leads"],
    icon: "search"
  },

  "pr-agencies": {
    slug: "pr-agencies",
    name: "PR Agencies",
    namePlural: "PR Professionals",
    description: "Public relations and communications agencies",
    metaDescription: "Generate PR agency leads and validate communications business ideas with AI calling. Research PR professionals.",
    leadsCount: 34000,
    countriesCount: 45,
    avgResponseRate: 27,
    painPoints: ["Proving value", "Media relationship building", "Crisis management", "Client retention"],
    useCases: ["Service validation", "Client preference surveys", "Industry specialization research", "Pricing analysis"],
    relatedIndustries: ["marketing-agencies", "event-planners", "social-media"],
    topLocations: ["new-york", "los-angeles", "chicago", "london", "washington-dc"],
    keywords: ["PR agency leads", "public relations leads", "communications agency leads"],
    icon: "megaphone"
  },

  "consulting-firms": {
    slug: "consulting-firms",
    name: "Consulting Firms",
    namePlural: "Consultants",
    description: "Business and management consulting firms",
    metaDescription: "Find consulting firm leads and validate consulting business ideas with AI research. Connect with business consultants.",
    leadsCount: 89000,
    countriesCount: 68,
    avgResponseRate: 25,
    painPoints: ["Client acquisition", "Project pipeline", "Utilization rates", "Competition"],
    useCases: ["Service validation", "Client satisfaction surveys", "Industry specialization research", "Pricing analysis"],
    relatedIndustries: ["accounting-firms", "law-firms", "it-services"],
    topLocations: ["new-york", "london", "chicago", "boston", "san-francisco"],
    keywords: ["consulting leads", "business consultant leads", "management consulting leads"],
    icon: "briefcase"
  },

  "translation-services": {
    slug: "translation-services",
    name: "Translation Services",
    namePlural: "Translators",
    description: "Translation and interpretation services",
    metaDescription: "Generate translation service leads and validate language business ideas with AI calling. Research translators.",
    leadsCount: 34000,
    countriesCount: 72,
    avgResponseRate: 32,
    painPoints: ["Rate pressure", "Specialization needs", "Technology disruption", "Quality assurance"],
    useCases: ["Service validation", "Client preference surveys", "Language pair demand", "Industry specialization"],
    relatedIndustries: ["language-schools", "legal-services", "marketing-agencies"],
    topLocations: ["new-york", "los-angeles", "london", "miami", "houston"],
    keywords: ["translation leads", "interpreter leads", "language service leads"],
    icon: "globe"
  },

  // Education
  "tutoring-services": {
    slug: "tutoring-services",
    name: "Tutoring Services",
    namePlural: "Tutors",
    description: "Private tutoring and academic support services",
    metaDescription: "Find tutoring leads and validate education business ideas with AI research. Connect with tutors and learning centers.",
    leadsCount: 89000,
    countriesCount: 65,
    avgResponseRate: 36,
    painPoints: ["Student acquisition", "Scheduling flexibility", "Subject expertise", "Online vs in-person"],
    useCases: ["Service validation", "Parent preference surveys", "Subject demand research", "Pricing analysis"],
    relatedIndustries: ["test-prep", "language-schools", "music-schools"],
    topLocations: ["new-york", "los-angeles", "chicago", "houston", "boston"],
    keywords: ["tutoring leads", "tutor leads", "academic support leads"],
    icon: "book"
  },

  "music-schools": {
    slug: "music-schools",
    name: "Music Schools",
    namePlural: "Music Instructors",
    description: "Music schools and instrument instruction",
    metaDescription: "Generate music school leads and validate music education business ideas with AI calling. Research music instructors.",
    leadsCount: 45000,
    countriesCount: 55,
    avgResponseRate: 37,
    painPoints: ["Student retention", "Instructor scheduling", "Instrument inventory", "Recital organization"],
    useCases: ["Program validation", "Student preference surveys", "Instrument demand research", "Pricing analysis"],
    relatedIndustries: ["dance-studios", "tutoring-services", "performing-arts"],
    topLocations: ["new-york", "los-angeles", "nashville", "chicago", "austin"],
    keywords: ["music school leads", "music lesson leads", "instrument instruction leads"],
    icon: "music"
  },

  "dance-studios": {
    slug: "dance-studios",
    name: "Dance Studios",
    namePlural: "Dance Instructors",
    description: "Dance studios and dance instruction",
    metaDescription: "Find dance studio leads and validate dance business ideas with AI research. Connect with dance instructors and studios.",
    leadsCount: 42000,
    countriesCount: 52,
    avgResponseRate: 36,
    painPoints: ["Student retention", "Recital costs", "Competition", "Instructor scheduling"],
    useCases: ["Class format validation", "Student preference surveys", "Dance style demand", "Pricing research"],
    relatedIndustries: ["music-schools", "fitness-centers", "performing-arts"],
    topLocations: ["los-angeles", "new-york", "miami", "chicago", "houston"],
    keywords: ["dance studio leads", "dance school leads", "dance instruction leads"],
    icon: "music"
  },

  "driving-schools": {
    slug: "driving-schools",
    name: "Driving Schools",
    namePlural: "Driving Instructors",
    description: "Driving schools and driver education",
    metaDescription: "Generate driving school leads and validate driver education business ideas with AI calling. Research driving instructors.",
    leadsCount: 28000,
    countriesCount: 45,
    avgResponseRate: 38,
    painPoints: ["Seasonal demand", "Vehicle maintenance", "Insurance costs", "Instructor availability"],
    useCases: ["Service validation", "Student preference surveys", "Pricing research", "Program format analysis"],
    relatedIndustries: ["auto-services", "insurance-agencies", "test-prep"],
    topLocations: ["los-angeles", "new-york", "houston", "chicago", "phoenix"],
    keywords: ["driving school leads", "driver education leads", "driving instruction leads"],
    icon: "car"
  },

  "language-schools": {
    slug: "language-schools",
    name: "Language Schools",
    namePlural: "Language Instructors",
    description: "Language schools and ESL programs",
    metaDescription: "Find language school leads and validate ESL business ideas with AI research. Connect with language instructors.",
    leadsCount: 34000,
    countriesCount: 72,
    avgResponseRate: 34,
    painPoints: ["Student acquisition", "Curriculum development", "Online competition", "Visa regulations"],
    useCases: ["Program validation", "Student preference surveys", "Language demand research", "Format preference analysis"],
    relatedIndustries: ["tutoring-services", "translation-services", "test-prep"],
    topLocations: ["new-york", "los-angeles", "miami", "san-francisco", "chicago"],
    keywords: ["language school leads", "ESL leads", "language learning leads"],
    icon: "globe"
  },

  "daycares": {
    slug: "daycares",
    name: "Daycare Centers",
    namePlural: "Daycare Owners",
    description: "Daycare centers and childcare services",
    metaDescription: "Generate daycare leads and validate childcare business ideas with AI calling. Research daycare centers and owners.",
    leadsCount: 78000,
    countriesCount: 42,
    avgResponseRate: 35,
    painPoints: ["Staff ratios", "Licensing compliance", "Parent communication", "Enrollment fluctuations"],
    useCases: ["Service validation", "Parent preference surveys", "Pricing research", "Program demand analysis"],
    relatedIndustries: ["preschools", "tutoring-services", "after-school"],
    topLocations: ["new-york", "los-angeles", "houston", "chicago", "dallas"],
    keywords: ["daycare leads", "childcare leads", "preschool leads"],
    icon: "baby"
  },

  "test-prep": {
    slug: "test-prep",
    name: "Test Prep Centers",
    namePlural: "Test Prep Instructors",
    description: "SAT, ACT, and standardized test preparation",
    metaDescription: "Find test prep leads and validate tutoring business ideas with AI research. Connect with test prep centers.",
    leadsCount: 28000,
    countriesCount: 38,
    avgResponseRate: 35,
    painPoints: ["Seasonal demand", "Score guarantees", "Online competition", "Curriculum updates"],
    useCases: ["Program validation", "Student preference surveys", "Test type demand", "Pricing analysis"],
    relatedIndustries: ["tutoring-services", "language-schools", "college-counseling"],
    topLocations: ["new-york", "los-angeles", "boston", "chicago", "san-francisco"],
    keywords: ["test prep leads", "SAT prep leads", "ACT prep leads"],
    icon: "clipboard"
  },

  // Retail
  "florists": {
    slug: "florists",
    name: "Florists",
    namePlural: "Florist Shop Owners",
    description: "Flower shops and floral design services",
    metaDescription: "Generate florist leads and validate flower shop business ideas with AI calling. Research florists and flower shops.",
    leadsCount: 56000,
    countriesCount: 62,
    avgResponseRate: 36,
    painPoints: ["Perishable inventory", "Seasonal demand", "Wire service fees", "Online competition"],
    useCases: ["Product validation", "Customer preference surveys", "Pricing research", "Event partnership opportunities"],
    relatedIndustries: ["wedding-planners", "event-venues", "gift-shops"],
    topLocations: ["new-york", "los-angeles", "chicago", "houston", "miami"],
    keywords: ["florist leads", "flower shop leads", "floral design leads"],
    icon: "flower"
  },

  "pet-stores": {
    slug: "pet-stores",
    name: "Pet Stores",
    namePlural: "Pet Store Owners",
    description: "Pet stores and pet supply retailers",
    metaDescription: "Find pet store leads and validate pet retail business ideas with AI research. Connect with pet store owners.",
    leadsCount: 45000,
    countriesCount: 42,
    avgResponseRate: 35,
    painPoints: ["Big box competition", "Inventory management", "Live animal care", "Online retail competition"],
    useCases: ["Product line validation", "Customer preference surveys", "Service expansion research", "Pricing analysis"],
    relatedIndustries: ["veterinarians", "pet-grooming", "pet-boarding"],
    topLocations: ["los-angeles", "new-york", "houston", "chicago", "phoenix"],
    keywords: ["pet store leads", "pet shop leads", "pet supply leads"],
    icon: "paw"
  },

  "jewelry-stores": {
    slug: "jewelry-stores",
    name: "Jewelry Stores",
    namePlural: "Jewelers",
    description: "Jewelry retailers and custom jewelers",
    metaDescription: "Generate jewelry store leads and validate jewelry business ideas with AI calling. Research jewelers and stores.",
    leadsCount: 38000,
    countriesCount: 52,
    avgResponseRate: 31,
    painPoints: ["Security concerns", "Inventory investment", "Online competition", "Custom order management"],
    useCases: ["Product validation", "Customer preference surveys", "Pricing research", "Service demand analysis"],
    relatedIndustries: ["wedding-planners", "gift-shops", "watch-repair"],
    topLocations: ["new-york", "los-angeles", "miami", "dallas", "chicago"],
    keywords: ["jewelry store leads", "jeweler leads", "jewelry shop leads"],
    icon: "gem"
  },

  "furniture-stores": {
    slug: "furniture-stores",
    name: "Furniture Stores",
    namePlural: "Furniture Retailers",
    description: "Furniture retailers and home furnishing stores",
    metaDescription: "Find furniture store leads and validate furniture business ideas with AI research. Connect with furniture retailers.",
    leadsCount: 52000,
    countriesCount: 45,
    avgResponseRate: 32,
    painPoints: ["Showroom costs", "Delivery logistics", "Online competition", "Inventory management"],
    useCases: ["Product validation", "Customer preference surveys", "Pricing research", "Delivery service analysis"],
    relatedIndustries: ["interior-designers", "home-decor", "mattress-stores"],
    topLocations: ["los-angeles", "new-york", "dallas", "houston", "chicago"],
    keywords: ["furniture store leads", "furniture retailer leads", "home furnishing leads"],
    icon: "sofa"
  },

  "clothing-boutiques": {
    slug: "clothing-boutiques",
    name: "Clothing Boutiques",
    namePlural: "Boutique Owners",
    description: "Fashion boutiques and clothing stores",
    metaDescription: "Generate clothing boutique leads and validate fashion retail business ideas with AI calling. Research boutique owners.",
    leadsCount: 89000,
    countriesCount: 65,
    avgResponseRate: 34,
    painPoints: ["Inventory selection", "Online competition", "Seasonal trends", "Customer retention"],
    useCases: ["Product validation", "Customer preference surveys", "Pricing research", "Style trend analysis"],
    relatedIndustries: ["jewelry-stores", "shoe-stores", "gift-shops"],
    topLocations: ["new-york", "los-angeles", "miami", "chicago", "dallas"],
    keywords: ["boutique leads", "clothing store leads", "fashion retail leads"],
    icon: "shirt"
  },

  // Events & Entertainment
  "event-venues": {
    slug: "event-venues",
    name: "Event Venues",
    namePlural: "Venue Managers",
    description: "Event venues, banquet halls, and conference centers",
    metaDescription: "Find event venue leads and validate venue business ideas with AI research. Connect with venue owners and managers.",
    leadsCount: 45000,
    countriesCount: 55,
    avgResponseRate: 33,
    painPoints: ["Booking seasonality", "Catering coordination", "Staff management", "Competition"],
    useCases: ["Service validation", "Client preference surveys", "Pricing research", "Event type demand"],
    relatedIndustries: ["wedding-planners", "catering-services", "photographers"],
    topLocations: ["new-york", "los-angeles", "chicago", "las-vegas", "miami"],
    keywords: ["event venue leads", "banquet hall leads", "conference venue leads"],
    icon: "building"
  },

  "djs-entertainment": {
    slug: "djs-entertainment",
    name: "DJs & Entertainment",
    namePlural: "DJs and Entertainers",
    description: "DJs, bands, and event entertainment services",
    metaDescription: "Generate DJ and entertainment leads and validate music business ideas with AI calling. Research DJs and entertainers.",
    leadsCount: 67000,
    countriesCount: 62,
    avgResponseRate: 36,
    painPoints: ["Booking consistency", "Equipment investment", "Travel logistics", "Competition"],
    useCases: ["Service validation", "Client preference surveys", "Pricing research", "Event type analysis"],
    relatedIndustries: ["event-venues", "wedding-planners", "photographers"],
    topLocations: ["los-angeles", "new-york", "miami", "las-vegas", "chicago"],
    keywords: ["DJ leads", "entertainment leads", "wedding DJ leads"],
    icon: "music"
  },

  "event-planners": {
    slug: "event-planners",
    name: "Event Planners",
    namePlural: "Event Planners",
    description: "Corporate and social event planning services",
    metaDescription: "Find event planner leads and validate event planning business ideas with AI research. Connect with event coordinators.",
    leadsCount: 42000,
    countriesCount: 55,
    avgResponseRate: 35,
    painPoints: ["Client acquisition", "Vendor management", "Budget constraints", "Last-minute changes"],
    useCases: ["Service validation", "Client preference surveys", "Vendor partnership research", "Pricing analysis"],
    relatedIndustries: ["wedding-planners", "catering-services", "event-venues"],
    topLocations: ["new-york", "los-angeles", "chicago", "miami", "dallas"],
    keywords: ["event planner leads", "event coordinator leads", "party planner leads"],
    icon: "calendar"
  },

  // Other Services
  "funeral-homes": {
    slug: "funeral-homes",
    name: "Funeral Homes",
    namePlural: "Funeral Directors",
    description: "Funeral homes and memorial services",
    metaDescription: "Generate funeral home leads and validate memorial service business ideas with AI calling. Research funeral directors.",
    leadsCount: 28000,
    countriesCount: 35,
    avgResponseRate: 29,
    painPoints: ["Pre-need sales", "Alternative service competition", "Family expectations", "Regulatory compliance"],
    useCases: ["Service validation", "Family preference surveys", "Pricing research", "Pre-planning demand"],
    relatedIndustries: ["cemeteries", "florists", "grief-counseling"],
    topLocations: ["new-york", "los-angeles", "chicago", "houston", "philadelphia"],
    keywords: ["funeral home leads", "mortuary leads", "memorial service leads"],
    icon: "heart"
  },

  "senior-care": {
    slug: "senior-care",
    name: "Senior Care Facilities",
    namePlural: "Senior Care Providers",
    description: "Assisted living and senior care facilities",
    metaDescription: "Find senior care leads and validate assisted living business ideas with AI research. Connect with senior care providers.",
    leadsCount: 45000,
    countriesCount: 32,
    avgResponseRate: 31,
    painPoints: ["Occupancy rates", "Staff retention", "Family communication", "Regulatory compliance"],
    useCases: ["Service validation", "Family preference surveys", "Amenity demand research", "Pricing analysis"],
    relatedIndustries: ["home-health", "medical-clinics", "pharmacies"],
    topLocations: ["new-york", "los-angeles", "phoenix", "houston", "dallas"],
    keywords: ["senior care leads", "assisted living leads", "nursing home leads"],
    icon: "heart"
  },

  "printing-services": {
    slug: "printing-services",
    name: "Printing Services",
    namePlural: "Print Shop Owners",
    description: "Commercial printing and print shops",
    metaDescription: "Generate printing service leads and validate print shop business ideas with AI calling. Research printers.",
    leadsCount: 42000,
    countriesCount: 48,
    avgResponseRate: 33,
    painPoints: ["Digital competition", "Equipment costs", "Rush orders", "Price pressure"],
    useCases: ["Service validation", "Customer preference surveys", "Product line expansion", "Pricing research"],
    relatedIndustries: ["marketing-agencies", "sign-shops", "promotional-products"],
    topLocations: ["new-york", "los-angeles", "chicago", "houston", "dallas"],
    keywords: ["printing leads", "print shop leads", "commercial printing leads"],
    icon: "printer"
  },

  "self-storage": {
    slug: "self-storage",
    name: "Self Storage",
    namePlural: "Storage Facility Owners",
    description: "Self storage facilities and mini storage",
    metaDescription: "Find self storage leads and validate storage business ideas with AI research. Connect with storage facility owners.",
    leadsCount: 38000,
    countriesCount: 35,
    avgResponseRate: 34,
    painPoints: ["Occupancy optimization", "Security concerns", "Climate control costs", "Competition"],
    useCases: ["Service validation", "Customer preference surveys", "Pricing research", "Amenity demand analysis"],
    relatedIndustries: ["moving-companies", "real-estate", "property-management"],
    topLocations: ["los-angeles", "new-york", "houston", "phoenix", "dallas"],
    keywords: ["self storage leads", "storage facility leads", "mini storage leads"],
    icon: "box"
  },

  "dry-cleaners": {
    slug: "dry-cleaners",
    name: "Dry Cleaners",
    namePlural: "Dry Cleaning Owners",
    description: "Dry cleaning and laundry services",
    metaDescription: "Generate dry cleaner leads and validate laundry business ideas with AI calling. Research dry cleaning services.",
    leadsCount: 52000,
    countriesCount: 45,
    avgResponseRate: 35,
    painPoints: ["Environmental regulations", "Equipment costs", "Competition", "Delivery service demand"],
    useCases: ["Service validation", "Customer preference surveys", "Pricing research", "Pickup/delivery demand"],
    relatedIndustries: ["tailors", "laundromats", "cleaning-services"],
    topLocations: ["new-york", "los-angeles", "chicago", "houston", "dallas"],
    keywords: ["dry cleaner leads", "laundry service leads", "dry cleaning leads"],
    icon: "shirt"
  },

  "travel-agencies": {
    slug: "travel-agencies",
    name: "Travel Agencies",
    namePlural: "Travel Agents",
    description: "Travel agencies and vacation planners",
    metaDescription: "Find travel agency leads and validate travel business ideas with AI research. Connect with travel agents.",
    leadsCount: 45000,
    countriesCount: 72,
    avgResponseRate: 32,
    painPoints: ["Online competition", "Commission compression", "Supplier relationships", "Travel disruptions"],
    useCases: ["Service validation", "Customer preference surveys", "Destination demand research", "Niche travel analysis"],
    relatedIndustries: ["tour-operators", "cruise-lines", "hotels"],
    topLocations: ["new-york", "los-angeles", "miami", "chicago", "atlanta"],
    keywords: ["travel agency leads", "travel agent leads", "vacation planner leads"],
    icon: "plane"
  },

  "pet-grooming": {
    slug: "pet-grooming",
    name: "Pet Grooming",
    namePlural: "Pet Groomers",
    description: "Pet grooming salons and mobile groomers",
    metaDescription: "Generate pet grooming leads and validate grooming business ideas with AI calling. Research pet groomers.",
    leadsCount: 67000,
    countriesCount: 45,
    avgResponseRate: 37,
    painPoints: ["Appointment scheduling", "Pet handling challenges", "Equipment maintenance", "Competition"],
    useCases: ["Service validation", "Customer preference surveys", "Pricing research", "Mobile service demand"],
    relatedIndustries: ["veterinarians", "pet-stores", "pet-boarding"],
    topLocations: ["los-angeles", "new-york", "houston", "chicago", "phoenix"],
    keywords: ["pet grooming leads", "dog grooming leads", "groomer leads"],
    icon: "scissors"
  },

  "pet-boarding": {
    slug: "pet-boarding",
    name: "Pet Boarding",
    namePlural: "Pet Boarding Owners",
    description: "Pet boarding kennels and pet hotels",
    metaDescription: "Find pet boarding leads and validate kennel business ideas with AI research. Connect with pet boarding facilities.",
    leadsCount: 34000,
    countriesCount: 38,
    avgResponseRate: 36,
    painPoints: ["Seasonal demand", "Staff reliability", "Facility maintenance", "Pet safety concerns"],
    useCases: ["Service validation", "Customer preference surveys", "Amenity demand research", "Pricing analysis"],
    relatedIndustries: ["veterinarians", "pet-grooming", "pet-stores"],
    topLocations: ["los-angeles", "new-york", "houston", "chicago", "dallas"],
    keywords: ["pet boarding leads", "kennel leads", "dog daycare leads"],
    icon: "home"
  },

  "security-services": {
    slug: "security-services",
    name: "Security Services",
    namePlural: "Security Companies",
    description: "Security guard services and patrol companies",
    metaDescription: "Generate security service leads and validate security business ideas with AI calling. Research security companies.",
    leadsCount: 52000,
    countriesCount: 48,
    avgResponseRate: 31,
    painPoints: ["Guard retention", "Contract competition", "Liability concerns", "Training costs"],
    useCases: ["Service validation", "Client preference surveys", "Pricing research", "Technology adoption analysis"],
    relatedIndustries: ["alarm-systems", "locksmiths", "property-management"],
    topLocations: ["new-york", "los-angeles", "chicago", "houston", "miami"],
    keywords: ["security service leads", "guard service leads", "patrol service leads"],
    icon: "shield"
  },

  "home-inspection": {
    slug: "home-inspection",
    name: "Home Inspection",
    namePlural: "Home Inspectors",
    description: "Home inspection and property inspection services",
    metaDescription: "Find home inspection leads and validate inspection business ideas with AI research. Connect with home inspectors.",
    leadsCount: 38000,
    countriesCount: 32,
    avgResponseRate: 35,
    painPoints: ["Realtor relationships", "Seasonal demand", "Liability concerns", "Report technology"],
    useCases: ["Service validation", "Agent preference surveys", "Pricing research", "Specialty inspection demand"],
    relatedIndustries: ["real-estate", "pest-control", "roofing-contractors"],
    topLocations: ["los-angeles", "houston", "phoenix", "dallas", "atlanta"],
    keywords: ["home inspection leads", "property inspection leads", "inspector leads"],
    icon: "clipboard"
  },

  "property-management": {
    slug: "property-management",
    name: "Property Management",
    namePlural: "Property Managers",
    description: "Residential and commercial property management",
    metaDescription: "Generate property management leads and validate PM business ideas with AI calling. Research property managers.",
    leadsCount: 67000,
    countriesCount: 42,
    avgResponseRate: 30,
    painPoints: ["Owner acquisition", "Tenant relations", "Maintenance coordination", "Fee pressure"],
    useCases: ["Service validation", "Owner preference surveys", "Pricing research", "Technology adoption"],
    relatedIndustries: ["real-estate", "maintenance-services", "cleaning-services"],
    topLocations: ["los-angeles", "new-york", "phoenix", "houston", "dallas"],
    keywords: ["property management leads", "property manager leads", "PM company leads"],
    icon: "building"
  },

  // Technology Services
  "web-development": {
    slug: "web-development",
    name: "Web Development",
    namePlural: "Web Developers",
    description: "Website development and web application services",
    metaDescription: "Generate web development leads and validate digital agency ideas with AI calling. Research web developers.",
    leadsCount: 156000,
    countriesCount: 85,
    avgResponseRate: 32,
    painPoints: ["Client acquisition", "Scope creep", "Technology changes", "Pricing pressure"],
    useCases: ["Service validation", "Developer preference surveys", "Pricing research", "Technology adoption"],
    relatedIndustries: ["seo-agencies", "it-services", "graphic-design"],
    topLocations: ["san-francisco", "new-york", "london", "berlin", "bangalore"],
    keywords: ["web development leads", "web developer leads", "website design leads"],
    icon: "code"
  },

  "graphic-design": {
    slug: "graphic-design",
    name: "Graphic Design",
    namePlural: "Graphic Designers",
    description: "Graphic design and visual branding services",
    metaDescription: "Generate graphic design leads and validate creative agency ideas with AI calling. Research graphic designers.",
    leadsCount: 134000,
    countriesCount: 78,
    avgResponseRate: 33,
    painPoints: ["Creative differentiation", "Client revisions", "Portfolio building", "Rate justification"],
    useCases: ["Service validation", "Designer preference surveys", "Pricing research", "Tool adoption"],
    relatedIndustries: ["web-development", "pr-agencies", "printing-services"],
    topLocations: ["new-york", "los-angeles", "london", "berlin", "tokyo"],
    keywords: ["graphic design leads", "designer leads", "branding agency leads"],
    icon: "palette"
  },

  // Healthcare - Additional
  "urgent-care": {
    slug: "urgent-care",
    name: "Urgent Care",
    namePlural: "Urgent Care Centers",
    description: "Walk-in clinics and urgent care medical facilities",
    metaDescription: "Generate urgent care leads and validate healthcare clinic ideas with AI calling. Research urgent care centers.",
    leadsCount: 42000,
    countriesCount: 28,
    avgResponseRate: 29,
    painPoints: ["Patient flow", "Staffing needs", "Insurance complexity", "Competition from hospitals"],
    useCases: ["Service validation", "Patient preference surveys", "Pricing research", "Technology adoption"],
    relatedIndustries: ["medical-practices", "pharmacies", "home-health"],
    topLocations: ["houston", "phoenix", "dallas", "los-angeles", "chicago"],
    keywords: ["urgent care leads", "walk-in clinic leads", "immediate care leads"],
    icon: "first-aid"
  }
};

// Get all industry slugs
export const getIndustrySlugs = (): string[] => Object.keys(INDUSTRIES);

// Get industry by slug
export const getIndustry = (slug: string): Industry | null => INDUSTRIES[slug] || null;

// Get related industries
export const getRelatedIndustries = (slug: string): Industry[] => {
  const industry = INDUSTRIES[slug];
  if (!industry) return [];
  return industry.relatedIndustries
    .map(s => INDUSTRIES[s])
    .filter(Boolean);
};

// Search industries
export const searchIndustries = (query: string): Industry[] => {
  const q = query.toLowerCase();
  return Object.values(INDUSTRIES).filter(ind =>
    ind.name.toLowerCase().includes(q) ||
    ind.namePlural.toLowerCase().includes(q) ||
    ind.keywords.some(k => k.includes(q))
  );
};
