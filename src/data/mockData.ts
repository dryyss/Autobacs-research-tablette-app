// ═══════════════════════════════════════════════════════════
//  BASE DE DONNÉES — BORNE AUTOBACS
//  Catalogue fermé : uniquement AUTOBACS + BOSCH
// ═══════════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────

export interface Store {
  id: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  expertTip: string;
}

export interface SubCriterion {
  id: string;
  categoryId: string;
  name: string;
  description: string;
}

export type Brand = 'AUTOBACS' | 'BOSCH';

export interface Product {
  id: string;
  name: string;
  brand: Brand;
  reference: string;
  /** Code-barres EAN-13 (13 chiffres) */
  barcode: string;
  price: number;
  /** Prix promo si le produit est en promotion (sinon undefined) */
  promoPrice?: number;
  /** Description marketing courte (1-2 phrases, distincte du conseil expert) */
  description: string;
  image: string;
  categoryId: string;
  subcriteriaId: string;
  specTagline: string;
  expertAdvice: string;
  specs: { label: string; value: string }[];
  equivalentIds?: string[];
  /** Liste de compatibilités : constructeurs/modèles/motorisations.
   *  Formats possibles :
   *  - 'ALL' (universel, compatible tous véhicules)
   *  - 'BRAND' (ex: 'PEUGEOT')
   *  - 'BRAND:MODEL' (ex: 'PEUGEOT:208')
   *  - 'BRAND:MODEL:FUEL' (ex: 'PEUGEOT:208:DIESEL')
   *  - 'FUEL' (ex: 'DIESEL', 'ESSENCE', 'HYBRIDE', 'ELECTRIQUE')
   */
  compatibility?: string[];
}

export type StockStatus = 'in-stock' | 'last-unit' | 'on-order' | 'unavailable';

export interface StockEntry {
  productId: string;
  storeId: string;
  quantity: number;
  aisle?: string;
  onOrder?: boolean;
}

export interface Vehicle {
  plate: string;
  model: string;
}

export interface PromoCard {
  id: string;
  title: string;
  category: string;
  price: string;
  badge: string;
  image: string;
  categoryId: string;
  productId?: string;
}

// ─── Magasins Autobacs France ───────────────────────────

export const stores: Store[] = [
  { id: 'aubergenville', name: 'Autobacs Aubergenville', shortName: 'Aubergenville', address: 'Centre Commercial Family Village, Route de 40 Sous', city: 'Aubergenville', postalCode: '78410', lat: 48.9611, lng: 1.8542 },
  { id: 'bonneuil', name: 'Autobacs Bonneuil-sur-Marne', shortName: 'Bonneuil', address: '4 Avenue de la Convention, ZAC de la Fosse aux Moines', city: 'Bonneuil-sur-Marne', postalCode: '94380', lat: 48.7697, lng: 2.4781 },
  { id: 'bretigny', name: 'Autobacs Br\u00e9tigny-sur-Orge', shortName: 'Br\u00e9tigny', address: 'ZAC de la Maison Neuve, Avenue de la Maison Neuve', city: 'Br\u00e9tigny-sur-Orge', postalCode: '91220', lat: 48.6061, lng: 2.3036 },
  { id: 'claye', name: 'Autobacs Claye-Souilly', shortName: 'Claye-Souilly', address: 'Lieu-dit Les Sablons, Rue Jean Monnet', city: 'Claye-Souilly', postalCode: '77410', lat: 48.9458, lng: 2.6889 },
  { id: 'lognes', name: 'Autobacs Lognes', shortName: 'Lognes', address: 'Centre Commercial Valor\u00e9e, All\u00e9e des Palombes', city: 'Lognes', postalCode: '77185', lat: 48.8344, lng: 2.6322 },
  { id: 'pierrelaye', name: 'Autobacs Pierrelaye', shortName: 'Pierrelaye', address: '254 Boulevard du Havre, ZAC de la Patte d\'Oie', city: 'Pierrelaye', postalCode: '95480', lat: 49.0194, lng: 2.1561 },
  { id: 'rosny', name: 'Autobacs Rosny-sous-Bois', shortName: 'Rosny', address: '29 Rue Jules Ferry', city: 'Rosny-sous-Bois', postalCode: '93110', lat: 48.8719, lng: 2.4839 },
  { id: 'saint-brice', name: 'Autobacs Saint-Brice-sous-For\u00eat', shortName: 'Saint-Brice', address: 'Centre Commercial Carrefour, RN1 ZAE Les Perruches', city: 'Saint-Brice-sous-For\u00eat', postalCode: '95350', lat: 49.0306, lng: 2.3547 },
  { id: 'saint-maximin', name: 'Autobacs Saint-Maximin', shortName: 'Saint-Maximin', address: 'ZAC du Bois des Fen\u00eatres', city: 'Saint-Maximin', postalCode: '60740', lat: 49.2400, lng: 2.4447 },
  { id: 'villebon', name: 'Autobacs Villebon-sur-Yvette', shortName: 'Villebon', address: 'Centre Commercial Villebon 2, La Tournelle', city: 'Villebon-sur-Yvette', postalCode: '91140', lat: 48.6972, lng: 2.2408 },
];

// ─── 10 Catégories ──────────────────────────────────────

export const categories: Category[] = [
  {
    id: 'lighting',
    name: '\u00c9clairage',
    image: 'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?w=400&h=400&fit=crop',
    expertTip: 'V\u00e9rifiez le type de culot avant d\u2019acheter (H7, H4, W5W)',
  },
  {
    id: 'wipers',
    name: 'Essuie-glaces',
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&h=400&fit=crop',
    expertTip: 'Mesurez la longueur ou entrez votre plaque pour la dimension exacte',
  },
  {
    id: 'batteries',
    name: 'Batteries',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=400&fit=crop',
    expertTip: 'Pour les Start-Stop, AGM ou EFB sont obligatoires',
  },
  {
    id: 'fluids',
    name: 'Huiles & Fluides',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop',
    expertTip: 'V\u00e9rifiez la viscosit\u00e9 ET la norme constructeur dans votre carnet',
  },
  {
    id: 'tires',
    name: 'Pneus & Roues',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=400&fit=crop',
    expertTip: 'La dimension est sur le flanc de votre pneu : ex. 205/55 R16',
  },
  {
    id: 'brakes',
    name: 'Freinage',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
    expertTip: 'Les plaquettes avant s\u2019usent 2\u00d7 plus vite que les arri\u00e8re',
  },
  {
    id: 'filters',
    name: 'Filtration',
    image: 'https://images.unsplash.com/photo-1635784065790-8d4e0fa3c5a6?w=400&h=400&fit=crop',
    expertTip: 'Un filtre encrass\u00e9 augmente la consommation jusqu\u2019\u00e0 10 %',
  },
  {
    id: 'exhaust',
    name: '\u00c9chappement',
    image: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=400&h=400&fit=crop',
    expertTip: 'V\u00e9rifiez la conformit\u00e9 anti-pollution avant remplacement',
  },
  {
    id: 'distribution',
    name: 'Distribution',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=400&h=400&fit=crop',
    expertTip: 'Une courroie qui casse d\u00e9truit le moteur \u2014 respectez les intervalles',
  },
  {
    id: 'accessories',
    name: 'Accessoires & Entretien',
    image: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=400&h=400&fit=crop',
    expertTip: 'Tapis, d\u00e9givrants, entretien carrosserie, s\u00e9curit\u00e9\u2026',
  },
];

// ─── 60 Sous-critères (6 par catégorie) ─────────────────

export const subcriteria: SubCriterion[] = [
  // Éclairage
  { id: 'lighting-low', categoryId: 'lighting', name: 'Feux de croisement', description: 'H7, H11' },
  { id: 'lighting-high', categoryId: 'lighting', name: 'Feux de route', description: 'H1, HB3' },
  { id: 'lighting-position', categoryId: 'lighting', name: 'Feux de position', description: 'W5W, T10' },
  { id: 'lighting-turn', categoryId: 'lighting', name: 'Clignotants', description: 'P21W' },
  { id: 'lighting-stop', categoryId: 'lighting', name: 'Feux stop / AR', description: 'P21/5W' },
  { id: 'lighting-reverse', categoryId: 'lighting', name: 'Feux de recul', description: 'W16W' },

  // Essuie-glaces
  { id: 'wipers-front-driver', categoryId: 'wipers', name: 'Avant conducteur', description: 'C\u00f4t\u00e9 gauche' },
  { id: 'wipers-front-passenger', categoryId: 'wipers', name: 'Avant passager', description: 'C\u00f4t\u00e9 droit' },
  { id: 'wipers-rear', categoryId: 'wipers', name: 'Arri\u00e8re', description: 'Hayon / break' },
  { id: 'wipers-winter', categoryId: 'wipers', name: 'Hiver', description: 'R\u00e9sistant -30\u00b0C' },
  { id: 'wipers-beam', categoryId: 'wipers', name: 'Plats (beam)', description: 'Flat blade' },
  { id: 'wipers-adapters', categoryId: 'wipers', name: 'Adaptateurs', description: 'Connecteurs sp\u00e9cifiques' },

  // Batteries
  { id: 'bat-small', categoryId: 'batteries', name: '45-55 Ah', description: 'Citadines' },
  { id: 'bat-medium', categoryId: 'batteries', name: '60-70 Ah', description: 'Berlines' },
  { id: 'bat-large', categoryId: 'batteries', name: '80-100 Ah', description: 'SUV / Diesel' },
  { id: 'bat-agm', categoryId: 'batteries', name: 'AGM / EFB Start-Stop', description: 'Obligatoire Start-Stop' },
  { id: 'bat-accessories', categoryId: 'batteries', name: 'Accessoires', description: 'C\u00e2bles, chargeur' },
  { id: 'bat-recycle', categoryId: 'batteries', name: 'Reprise ancienne', description: 'Service gratuit' },

  // Huiles & Fluides
  { id: 'fluid-5w30', categoryId: 'fluids', name: '5W-30', description: 'Moteurs modernes' },
  { id: 'fluid-5w40', categoryId: 'fluids', name: '5W-40', description: 'Polyvalente' },
  { id: 'fluid-0w30', categoryId: 'fluids', name: '0W-30 / 0W-40', description: 'Constructeurs r\u00e9cents' },
  { id: 'fluid-10w40', categoryId: 'fluids', name: '10W-40', description: 'Moteurs anciens' },
  { id: 'fluid-additives', categoryId: 'fluids', name: 'Additifs & traitements', description: 'Injection, turbo' },
  { id: 'fluid-brake', categoryId: 'fluids', name: 'Liquide de frein DOT4', description: 'Tous v\u00e9hicules' },

  // Pneus & Roues
  { id: 'tire-15', categoryId: 'tires', name: '195/65 R15', description: 'Compactes' },
  { id: 'tire-16', categoryId: 'tires', name: '205/55 R16', description: 'Berlines' },
  { id: 'tire-17', categoryId: 'tires', name: '215/60 R17', description: 'SUV' },
  { id: 'tire-winter', categoryId: 'tires', name: 'Hiver (3PMSF)', description: 'Obligatoire en montagne' },
  { id: 'tire-allseason', categoryId: 'tires', name: '4 saisons', description: 'Marquage M+S' },
  { id: 'tire-chains', categoryId: 'tires', name: 'Cha\u00eenes & chaussettes', description: 'Neige' },

  // Freinage
  { id: 'brake-pads-front', categoryId: 'brakes', name: 'Plaquettes avant', description: 'Usure rapide' },
  { id: 'brake-pads-rear', categoryId: 'brakes', name: 'Plaquettes arri\u00e8re', description: 'Usure mod\u00e9r\u00e9e' },
  { id: 'brake-disc-front', categoryId: 'brakes', name: 'Disques avant', description: 'Ventil\u00e9s' },
  { id: 'brake-disc-rear', categoryId: 'brakes', name: 'Disques arri\u00e8re', description: 'Pleins' },
  { id: 'brake-fluid', categoryId: 'brakes', name: 'Liquide DOT4', description: 'Tous v\u00e9hicules' },
  { id: 'brake-kit', categoryId: 'brakes', name: 'Kit complet', description: 'Disques + plaquettes' },

  // Filtration
  { id: 'filter-air', categoryId: 'filters', name: 'Filtre air moteur', description: 'Admission' },
  { id: 'filter-oil', categoryId: 'filters', name: 'Filtre \u00e0 huile', description: 'R\u00e9vision' },
  { id: 'filter-cabin', categoryId: 'filters', name: 'Filtre habitacle', description: 'Charbon actif' },
  { id: 'filter-fuel', categoryId: 'filters', name: 'Filtre carburant', description: 'Diesel / essence' },
  { id: 'filter-kit', categoryId: 'filters', name: 'Kit r\u00e9vision', description: '3 ou 4 filtres' },
  { id: 'filter-special', categoryId: 'filters', name: 'Filtres sp\u00e9ciaux', description: 'Sport, haute perf.' },

  // Échappement
  { id: 'exhaust-rear', categoryId: 'exhaust', name: 'Silencieux arri\u00e8re', description: 'Dernier \u00e9l\u00e9ment' },
  { id: 'exhaust-mid', categoryId: 'exhaust', name: 'Silencieux interm\u00e9diaire', description: 'Centre ligne' },
  { id: 'exhaust-cat', categoryId: 'exhaust', name: 'Catalyseur', description: 'Anti-pollution' },
  { id: 'exhaust-fap', categoryId: 'exhaust', name: 'FAP / DPF', description: 'Diesel uniquement' },
  { id: 'exhaust-full', categoryId: 'exhaust', name: 'Ligne compl\u00e8te', description: 'Remplacement total' },
  { id: 'exhaust-parts', categoryId: 'exhaust', name: 'P\u00e2tes & colliers', description: 'Accessoires montage' },

  // Distribution
  { id: 'dist-belt', categoryId: 'distribution', name: 'Courroie accessoires', description: 'Alternateur, clim' },
  { id: 'dist-kit', categoryId: 'distribution', name: 'Kit distribution', description: 'Courroie + galets' },
  { id: 'dist-tensioner', categoryId: 'distribution', name: 'Galets tendeurs', description: 'Remplacement kit' },
  { id: 'dist-alternator', categoryId: 'distribution', name: 'Alternateur', description: 'Charge batterie' },
  { id: 'dist-starter', categoryId: 'distribution', name: 'D\u00e9marreur', description: 'Lancement moteur' },
  { id: 'dist-clutch', categoryId: 'distribution', name: 'Kit embrayage', description: 'Disque + m\u00e9canisme' },

  // Accessoires
  { id: 'acc-chargers', categoryId: 'accessories', name: 'Chargeurs & supports', description: 'Smartphone, USB-C' },
  { id: 'acc-dashcam', categoryId: 'accessories', name: 'Dash cam & GPS', description: 'Enregistrement route' },
  { id: 'acc-mats', categoryId: 'accessories', name: 'Tapis & housses', description: 'Protection habitacle' },
  { id: 'acc-carcare', categoryId: 'accessories', name: 'Entretien carrosserie', description: 'Shampoings, cires' },
  { id: 'acc-safety', categoryId: 'accessories', name: 'S\u00e9curit\u00e9', description: 'Triangle, gilet, extincteur' },
  { id: 'acc-tools', categoryId: 'accessories', name: 'Outillage', description: 'Cl\u00e9s, cric, compresseur' },
];

// ─── Produits (Autobacs + Bosch uniquement) ─────────────

type RawProduct = Omit<Product, 'barcode' | 'description' | 'promoPrice'>;

const rawProducts: RawProduct[] = [
  // ══ ÉCLAIRAGE ══
  {
    id: 'p-h7-bosch', name: 'Ampoule H7 Pure Light', brand: 'BOSCH', reference: 'BO-1987302801', price: 9.90,
    image: 'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?w=400',
    categoryId: 'lighting', subcriteriaId: 'lighting-low',
    specTagline: 'H7 12V 55W \u2014 standard',
    expertAdvice: 'Ampoule halog\u00e8ne standard Bosch, parfaite pour un remplacement \u00e9conomique. Remplacez toujours par paire (gauche + droite) pour une luminosit\u00e9 homog\u00e8ne. Dur\u00e9e de vie moyenne : 500 heures.',
    specs: [
      { label: 'Type', value: 'H7' },
      { label: 'Puissance', value: '55W' },
      { label: 'Voltage', value: '12V' },
      { label: 'Culot', value: 'PX26d' },
    ],
    equivalentIds: ['p-h7-autobacs-plus'],
  },
  {
    id: 'p-h7-autobacs-plus', name: 'Ampoule H7 Vision Plus +90%', brand: 'AUTOBACS', reference: 'AB-H7VP90', price: 14.90,
    image: 'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?w=400',
    categoryId: 'lighting', subcriteriaId: 'lighting-low',
    specTagline: 'H7 12V 55W \u2014 +90% lumi\u00e8re',
    expertAdvice: 'Version premium Autobacs avec +90% de luminosit\u00e9 par rapport \u00e0 une halog\u00e8ne standard. Id\u00e9ale pour la conduite de nuit et les routes peu \u00e9clair\u00e9es. Ne d\u00e9grade pas l\u2019optique contrairement aux LED non homologu\u00e9es.',
    specs: [
      { label: 'Type', value: 'H7' },
      { label: 'Puissance', value: '55W' },
      { label: 'Luminosit\u00e9', value: '+90%' },
      { label: 'Port\u00e9e', value: '+35m' },
    ],
    equivalentIds: ['p-h7-bosch'],
  },
  {
    id: 'p-h4-bosch', name: 'Ampoule H4 Plus 90', brand: 'BOSCH', reference: 'BO-1987301107', price: 16.90,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
    categoryId: 'lighting', subcriteriaId: 'lighting-low',
    specTagline: 'H4 12V 60/55W \u2014 +90%',
    expertAdvice: 'L\u2019ampoule H4 combine feux de route et croisement. Cette version Plus 90 Bosch offre +90% de luminosit\u00e9. Indispensable sur les v\u00e9hicules \u00e9quip\u00e9s d\u2019un seul projecteur par c\u00f4t\u00e9.',
    specs: [
      { label: 'Type', value: 'H4' },
      { label: 'Puissance', value: '60/55W' },
      { label: 'Voltage', value: '12V' },
      { label: 'Luminosit\u00e9', value: '+90%' },
    ],
  },
  {
    id: 'p-h1-bosch', name: 'Ampoule H1 Pure Light', brand: 'BOSCH', reference: 'BO-1987302011', price: 7.90,
    image: 'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?w=400',
    categoryId: 'lighting', subcriteriaId: 'lighting-high',
    specTagline: 'H1 12V 55W \u2014 feux de route',
    expertAdvice: 'Ampoule H1 d\u00e9di\u00e9e aux feux de route longue port\u00e9e. Souvent situ\u00e9e dans un projecteur s\u00e9par\u00e9 ou interne. Le filament simple n\u00e9cessite un remplacement si le faisceau faiblit.',
    specs: [
      { label: 'Type', value: 'H1' },
      { label: 'Puissance', value: '55W' },
      { label: 'Voltage', value: '12V' },
      { label: 'Culot', value: 'P14.5s' },
    ],
  },
  {
    id: 'p-w5w-autobacs', name: 'Veilleuse LED W5W x2', brand: 'AUTOBACS', reference: 'AB-W5WLED', price: 11.90,
    image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400',
    categoryId: 'lighting', subcriteriaId: 'lighting-position',
    specTagline: 'W5W LED 6000K \u2014 blanc pur',
    expertAdvice: 'Remplacement LED des veilleuses W5W d\u2019origine. Lumi\u00e8re blanc pur 6000K, consommation divis\u00e9e par 10, dur\u00e9e de vie 50 000h. Fournies par paire.',
    specs: [
      { label: 'Type', value: 'W5W LED' },
      { label: 'Puissance', value: '1W' },
      { label: 'Temp\u00e9rature', value: '6000K' },
      { label: 'Paire', value: '2 ampoules' },
    ],
  },
  {
    id: 'p-p21w-bosch', name: 'Ampoule P21W Clignotant', brand: 'BOSCH', reference: 'BO-1987302201', price: 4.90,
    image: 'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?w=400',
    categoryId: 'lighting', subcriteriaId: 'lighting-turn',
    specTagline: 'P21W 12V 21W \u2014 ambre',
    expertAdvice: 'Ampoule \u00e0 ergot pour clignotants. Attention au d\u00e9tromp\u00e9 en insertion : le mauvais sens emp\u00eachera l\u2019ampoule de s\u2019allumer correctement. V\u00e9rifiez le relais si le clignotement s\u2019acc\u00e9l\u00e8re.',
    specs: [
      { label: 'Type', value: 'P21W' },
      { label: 'Puissance', value: '21W' },
      { label: 'Couleur', value: 'Ambre' },
      { label: 'Culot', value: 'BA15s' },
    ],
  },

  // ══ ESSUIE-GLACES ══
  {
    id: 'p-wiper-aerotwin-600', name: 'Balai AeroTwin A980S', brand: 'BOSCH', reference: 'BO-3397007297', price: 29.90,
    image: 'https://images.unsplash.com/photo-1449130015084-2ba19b2a011f?w=400',
    categoryId: 'wipers', subcriteriaId: 'wipers-front-driver',
    specTagline: '600mm \u2014 flat blade premium',
    expertAdvice: 'Balai flat blade Bosch haut de gamme, technologie AeroTwin avec lame en graphite. R\u00e9sistant aux UV et aux produits chimiques. Dur\u00e9e de vie estim\u00e9e : 2 ans ou 60 000 km. Remplacez syst\u00e9matiquement la paire.',
    specs: [
      { label: 'Longueur', value: '600mm' },
      { label: 'Type', value: 'Flat blade' },
      { label: 'Fixation', value: 'Sp\u00e9cifique' },
      { label: 'Technologie', value: 'AeroTwin' },
    ],
    equivalentIds: ['p-wiper-autobacs-600'],
  },
  {
    id: 'p-wiper-autobacs-600', name: 'Balai Autobacs Premium 600', brand: 'AUTOBACS', reference: 'AB-W600P', price: 22.90,
    image: 'https://images.unsplash.com/photo-1449130015084-2ba19b2a011f?w=400',
    categoryId: 'wipers', subcriteriaId: 'wipers-front-driver',
    specTagline: '600mm \u2014 flat universel',
    expertAdvice: 'Balai flat blade Autobacs avec adaptateurs multi-fixations pour 95% des v\u00e9hicules. Bon rapport qualit\u00e9/prix. Remplace les lames d\u2019origine sans outil en moins de 30 secondes.',
    specs: [
      { label: 'Longueur', value: '600mm' },
      { label: 'Type', value: 'Flat blade' },
      { label: 'Fixation', value: 'Universelle' },
      { label: 'Adaptateurs', value: '9 inclus' },
    ],
    equivalentIds: ['p-wiper-aerotwin-600'],
  },
  {
    id: 'p-wiper-aerotwin-475', name: 'Balai AeroTwin 475mm', brand: 'BOSCH', reference: 'BO-3397008843', price: 22.90,
    image: 'https://images.unsplash.com/photo-1449130015084-2ba19b2a011f?w=400',
    categoryId: 'wipers', subcriteriaId: 'wipers-front-passenger',
    specTagline: '475mm \u2014 passager',
    expertAdvice: 'Balai passager flat blade Bosch de dimension 475mm. Compl\u00e9mentaire au balai conducteur 600mm sur la plupart des berlines. Sur Peugeot 208, 308, Clio IV, Megane III.',
    specs: [
      { label: 'Longueur', value: '475mm' },
      { label: 'Type', value: 'Flat blade' },
      { label: 'Position', value: 'Passager' },
    ],
  },
  {
    id: 'p-wiper-rear-h301', name: 'Balai arri\u00e8re H301', brand: 'BOSCH', reference: 'BO-3397004629', price: 11.90,
    image: 'https://images.unsplash.com/photo-1449130015084-2ba19b2a011f?w=400',
    categoryId: 'wipers', subcriteriaId: 'wipers-rear',
    specTagline: '300mm \u2014 arri\u00e8re sp\u00e9cifique',
    expertAdvice: 'Balai arri\u00e8re sp\u00e9cifique pour hayons de break et SUV. Mod\u00e8le H301 compatible avec la majorit\u00e9 des v\u00e9hicules europ\u00e9ens. Souvent oubli\u00e9 lors de l\u2019entretien, remplacez-le tous les 2 ans.',
    specs: [
      { label: 'Longueur', value: '300mm' },
      { label: 'Type', value: 'Arri\u00e8re' },
      { label: 'Fixation', value: 'Sp\u00e9cifique' },
    ],
  },
  {
    id: 'p-wiper-winter', name: 'Balai Hiver Autobacs', brand: 'AUTOBACS', reference: 'AB-WWINT600', price: 26.90,
    image: 'https://images.unsplash.com/photo-1449130015084-2ba19b2a011f?w=400',
    categoryId: 'wipers', subcriteriaId: 'wipers-winter',
    specTagline: '600mm \u2014 r\u00e9sistant -30\u00b0C',
    expertAdvice: 'Balai hiver avec gaine caoutchouc qui emp\u00eache le gel et la neige de s\u2019accumuler sur l\u2019armature. R\u00e9sistant jusqu\u2019\u00e0 -30\u00b0C. Indispensable en montagne et pour les hivers rigoureux.',
    specs: [
      { label: 'Longueur', value: '600mm' },
      { label: 'Type', value: 'Hiver' },
      { label: 'Temp\u00e9rature', value: '-30\u00b0C' },
    ],
  },

  // ══ BATTERIES ══
  {
    id: 'p-bat-s3', name: 'Batterie Bosch S3 45Ah', brand: 'BOSCH', reference: 'BO-S3002', price: 79.90,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400',
    categoryId: 'batteries', subcriteriaId: 'bat-small',
    specTagline: '45Ah 400A \u2014 citadine',
    expertAdvice: 'Batterie 45Ah adapt\u00e9e aux citadines essence sans Start-Stop (Twingo, Fiat 500, C1, etc.). Ne convient PAS aux Start-Stop, qui n\u00e9cessitent une AGM ou EFB. Garantie 2 ans.',
    specs: [
      { label: 'Capacit\u00e9', value: '45Ah' },
      { label: 'CCA', value: '400A' },
      { label: 'Voltage', value: '12V' },
      { label: 'Borne', value: '+ \u00e0 droite' },
    ],
  },
  {
    id: 'p-bat-s4-autobacs', name: 'Batterie Autobacs 60Ah', brand: 'AUTOBACS', reference: 'AB-BAT60', price: 99.90,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400',
    categoryId: 'batteries', subcriteriaId: 'bat-medium',
    specTagline: '60Ah 540A \u2014 berline',
    expertAdvice: 'Batterie Autobacs 60Ah pour berlines essence standard (Peugeot 308, Megane, Golf sans Start-Stop). Rapport qualit\u00e9/prix optimal. Reprise gratuite de votre ancienne batterie en magasin.',
    specs: [
      { label: 'Capacit\u00e9', value: '60Ah' },
      { label: 'CCA', value: '540A' },
      { label: 'Voltage', value: '12V' },
      { label: 'Garantie', value: '2 ans' },
    ],
    equivalentIds: ['p-bat-s4-bosch'],
  },
  {
    id: 'p-bat-s4-bosch', name: 'Batterie Bosch S4 60Ah', brand: 'BOSCH', reference: 'BO-S4005', price: 119.00,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400',
    categoryId: 'batteries', subcriteriaId: 'bat-medium',
    specTagline: '60Ah 540A \u2014 berline premium',
    expertAdvice: 'Gamme S4 Bosch premium. Technologie \u00e0 grille \u00e9tir\u00e9e pour une meilleure durabilit\u00e9. Convient aux berlines essence et diesel standards. Garantie 3 ans contre 2 ans pour la gamme Autobacs.',
    specs: [
      { label: 'Capacit\u00e9', value: '60Ah' },
      { label: 'CCA', value: '540A' },
      { label: 'Voltage', value: '12V' },
      { label: 'Garantie', value: '3 ans' },
    ],
    equivalentIds: ['p-bat-s4-autobacs'],
  },
  {
    id: 'p-bat-s5-diesel', name: 'Batterie Bosch S5 80Ah', brand: 'BOSCH', reference: 'BO-S5010', price: 159.00,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400',
    categoryId: 'batteries', subcriteriaId: 'bat-large',
    specTagline: '80Ah 800A \u2014 diesel SUV',
    expertAdvice: 'Batterie 80Ah haute performance pour gros diesels et SUV. Fort courant de d\u00e9marrage \u00e0 froid (800A) indispensable pour les moteurs diesel > 2.0L. Ne convient PAS aux Start-Stop.',
    specs: [
      { label: 'Capacit\u00e9', value: '80Ah' },
      { label: 'CCA', value: '800A' },
      { label: 'Voltage', value: '12V' },
      { label: 'Type', value: 'SLI Premium' },
    ],
  },
  {
    id: 'p-bat-agm', name: 'Batterie AGM Start-Stop 70Ah', brand: 'BOSCH', reference: 'BO-S5A08', price: 229.00,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400',
    categoryId: 'batteries', subcriteriaId: 'bat-agm',
    specTagline: '70Ah 760A \u2014 AGM Start-Stop',
    expertAdvice: 'Technologie AGM (Absorbent Glass Mat) OBLIGATOIRE pour les v\u00e9hicules \u00e9quip\u00e9s Start-Stop avec r\u00e9cup\u00e9ration d\u2019\u00e9nergie. R\u00e9siste \u00e0 30 000 d\u00e9marrages (3\u00d7 plus qu\u2019une batterie standard). Ne JAMAIS remplacer par une SLI classique sur Start-Stop \u2014 risque de d\u00e9charge profonde et panne.',
    specs: [
      { label: 'Capacit\u00e9', value: '70Ah' },
      { label: 'CCA', value: '760A' },
      { label: 'Technologie', value: 'AGM' },
      { label: 'Cycles', value: '30 000' },
    ],
  },
  {
    id: 'p-bat-cables', name: 'C\u00e2bles de d\u00e9marrage 500A', brand: 'AUTOBACS', reference: 'AB-CABLE500', price: 29.90,
    image: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=400',
    categoryId: 'batteries', subcriteriaId: 'bat-accessories',
    specTagline: '500A 3m \u2014 25mm\u00b2',
    expertAdvice: 'C\u00e2bles de d\u00e9pannage 500A avec pinces isol\u00e9es et section de 25mm\u00b2 suffisante pour la plupart des v\u00e9hicules. Longueur 3m pour relier deux voitures nez \u00e0 nez. Attention : connecter dans l\u2019ordre + \u2192 +, puis \u2013 \u2192 masse.',
    specs: [
      { label: 'Intensit\u00e9', value: '500A' },
      { label: 'Longueur', value: '3m' },
      { label: 'Section', value: '25mm\u00b2' },
    ],
  },

  // ══ HUILES & FLUIDES ══
  {
    id: 'p-oil-5w30-bosch', name: 'Huile Bosch 5W-30 C3 5L', brand: 'BOSCH', reference: 'BO-OIL5W30', price: 42.90,
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400',
    categoryId: 'fluids', subcriteriaId: 'fluid-5w30',
    specTagline: '5W-30 5L \u2014 ACEA C3',
    expertAdvice: 'Huile synth\u00e9tique 5W-30 norme ACEA C3 compatible FAP. Conviendra \u00e0 la majorit\u00e9 des moteurs diesel r\u00e9cents (post-2005) \u00e9quip\u00e9s d\u2019un filtre \u00e0 particules. V\u00e9rifiez TOUJOURS la norme dans votre carnet d\u2019entretien.',
    specs: [
      { label: 'Viscosit\u00e9', value: '5W-30' },
      { label: 'Volume', value: '5L' },
      { label: 'Norme', value: 'ACEA C3' },
      { label: 'Type', value: 'Synth\u00e9tique' },
    ],
    equivalentIds: ['p-oil-5w30-autobacs'],
  },
  {
    id: 'p-oil-5w30-autobacs', name: 'Huile Autobacs 5W-30 LL 5L', brand: 'AUTOBACS', reference: 'AB-OIL5W30LL', price: 34.90,
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400',
    categoryId: 'fluids', subcriteriaId: 'fluid-5w30',
    specTagline: '5W-30 5L \u2014 Long Life',
    expertAdvice: 'Huile synth\u00e9tique Autobacs 5W-30 Long Life (intervalle de vidange allong\u00e9). Prix attractif pour une huile de qualit\u00e9 \u00e9quivalente aux marques premium. Conviendra aux VW/Audi/Seat/Skoda avec norme VW 504.00/507.00.',
    specs: [
      { label: 'Viscosit\u00e9', value: '5W-30' },
      { label: 'Volume', value: '5L' },
      { label: 'Norme', value: 'VW 504.00/507.00' },
      { label: 'Type', value: 'Long Life' },
    ],
    equivalentIds: ['p-oil-5w30-bosch'],
  },
  {
    id: 'p-oil-5w40', name: 'Huile Bosch 5W-40 A3/B4 5L', brand: 'BOSCH', reference: 'BO-OIL5W40', price: 45.90,
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400',
    categoryId: 'fluids', subcriteriaId: 'fluid-5w40',
    specTagline: '5W-40 5L \u2014 ACEA A3/B4',
    expertAdvice: 'Huile polyvalente 5W-40 adapt\u00e9e \u00e0 la plupart des moteurs essence et diesel sans FAP. Norme ACEA A3/B4 pour les sollicitations s\u00e9v\u00e8res (sport, remorquage). NE PAS utiliser sur v\u00e9hicule \u00e9quip\u00e9 FAP (utiliser 5W-30 C3 \u00e0 la place).',
    specs: [
      { label: 'Viscosit\u00e9', value: '5W-40' },
      { label: 'Volume', value: '5L' },
      { label: 'Norme', value: 'ACEA A3/B4' },
      { label: 'Type', value: 'Synth\u00e9tique' },
    ],
  },
  {
    id: 'p-oil-0w30', name: 'Huile Bosch 0W-30 5L', brand: 'BOSCH', reference: 'BO-OIL0W30', price: 52.90,
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400',
    categoryId: 'fluids', subcriteriaId: 'fluid-0w30',
    specTagline: '0W-30 5L \u2014 moteurs r\u00e9cents',
    expertAdvice: 'Huile 0W-30 ultra-fluide \u00e0 froid, id\u00e9ale pour les moteurs constructeurs r\u00e9cents (post-2015) exigeant une norme sp\u00e9cifique. Am\u00e9liore la consommation de 2 \u00e0 3% vs une 5W-30.',
    specs: [
      { label: 'Viscosit\u00e9', value: '0W-30' },
      { label: 'Volume', value: '5L' },
      { label: 'Norme', value: 'ACEA C3' },
    ],
  },
  {
    id: 'p-brake-fluid', name: 'Liquide de frein DOT 4 1L', brand: 'BOSCH', reference: 'BO-BF4', price: 12.90,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    categoryId: 'fluids', subcriteriaId: 'fluid-brake',
    specTagline: 'DOT 4 1L \u2014 260\u00b0C',
    expertAdvice: 'Liquide de frein DOT 4 Bosch. \u00c0 remplacer tous les 2 ans car il absorbe l\u2019humidit\u00e9 de l\u2019air (hygroscopique), ce qui r\u00e9duit le point d\u2019\u00e9bullition et provoque le \u00ab fading \u00bb des freins. NE JAMAIS m\u00e9langer DOT 3 / DOT 4 / DOT 5.1 et surtout PAS de DOT 5 (silicone).',
    specs: [
      { label: 'Type', value: 'DOT 4' },
      { label: 'Volume', value: '1L' },
      { label: 'Point \u00e9bull. sec', value: '260\u00b0C' },
      { label: 'Point \u00e9bull. humide', value: '165\u00b0C' },
    ],
  },

  // ══ PNEUS & ROUES ══
  {
    id: 'p-tire-autobacs-205', name: 'Pneu Autobacs 205/55 R16', brand: 'AUTOBACS', reference: 'AB-20555R16', price: 74.90,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400',
    categoryId: 'tires', subcriteriaId: 'tire-16',
    specTagline: '205/55 R16 91V \u2014 \u00e9t\u00e9',
    expertAdvice: 'Pneu \u00e9t\u00e9 Autobacs en 205/55 R16, dimension la plus vendue en France (berlines compactes). Bon compromis confort/durabilit\u00e9. Montage + \u00e9quilibrage inclus sur achat de 4 pneus en magasin. Attention : remplacez par 4 si possible, ou au minimum par essieu.',
    specs: [
      { label: 'Dimensions', value: '205/55 R16 91V' },
      { label: 'Saison', value: '\u00c9t\u00e9' },
      { label: 'Indice charge', value: '91 (615kg)' },
      { label: '\u00c9tiquette', value: 'B/B/70dB' },
    ],
    equivalentIds: ['p-tire-bosch-205'],
  },
  {
    id: 'p-tire-bosch-205', name: 'Pneu Bosch Performance 205/55 R16', brand: 'BOSCH', reference: 'BO-TR20555', price: 89.90,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400',
    categoryId: 'tires', subcriteriaId: 'tire-16',
    specTagline: '205/55 R16 91V \u2014 premium',
    expertAdvice: 'Pneu Bosch Performance, meilleur freinage sur sol mouill\u00e9 (\u00e9tiquette A) que la gamme Autobacs standard (B). Bruit r\u00e9duit gr\u00e2ce \u00e0 la sculpture asym\u00e9trique. Id\u00e9al pour usage intensif autoroute.',
    specs: [
      { label: 'Dimensions', value: '205/55 R16 91V' },
      { label: 'Saison', value: '\u00c9t\u00e9' },
      { label: '\u00c9tiquette', value: 'A/B/68dB' },
      { label: 'Type', value: 'Premium' },
    ],
    equivalentIds: ['p-tire-autobacs-205'],
  },
  {
    id: 'p-tire-195-15', name: 'Pneu Autobacs 195/65 R15', brand: 'AUTOBACS', reference: 'AB-19565R15', price: 64.90,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400',
    categoryId: 'tires', subcriteriaId: 'tire-15',
    specTagline: '195/65 R15 91H \u2014 \u00e9t\u00e9',
    expertAdvice: 'Pneu \u00e9t\u00e9 pour compactes (Clio, 208, Polo). Dimension 15 pouces \u00e9conomique par rapport aux 16/17 pouces, avec un meilleur confort sur route d\u00e9grad\u00e9e.',
    specs: [
      { label: 'Dimensions', value: '195/65 R15 91H' },
      { label: 'Saison', value: '\u00c9t\u00e9' },
      { label: '\u00c9tiquette', value: 'B/B/71dB' },
    ],
  },
  {
    id: 'p-tire-winter', name: 'Pneu Hiver Autobacs 205/55 R16', brand: 'AUTOBACS', reference: 'AB-W20555R16', price: 89.90,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400',
    categoryId: 'tires', subcriteriaId: 'tire-winter',
    specTagline: '205/55 R16 \u2014 3PMSF',
    expertAdvice: 'Pneu hiver certifi\u00e9 3PMSF (flocon), obligatoire dans les zones montagneuses du 1er novembre au 31 mars depuis la loi Montagne II. Sculpture lamell\u00e9e pour adh\u00e9rence sur neige et verglas. Meilleur \u00e0 partir de 7\u00b0C.',
    specs: [
      { label: 'Dimensions', value: '205/55 R16 91H' },
      { label: 'Saison', value: 'Hiver' },
      { label: 'Certification', value: '3PMSF (M+S)' },
    ],
  },

  // ══ FREINAGE ══
  {
    id: 'p-pads-bosch-front', name: 'Plaquettes avant Bosch', brand: 'BOSCH', reference: 'BO-0986494118', price: 39.90,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    categoryId: 'brakes', subcriteriaId: 'brake-pads-front',
    specTagline: '4 plaquettes \u2014 avant',
    expertAdvice: 'Plaquettes avant Bosch d\u2019origine constructeur. Les plaquettes avant s\u2019usent environ 2\u00d7 plus vite que les arri\u00e8re (70% du freinage). Remplacez syst\u00e9matiquement par paire (gauche + droite). V\u00e9rifiez l\u2019usure des disques en m\u00eame temps.',
    specs: [
      { label: 'Position', value: 'Avant' },
      { label: 'Quantit\u00e9', value: '4 plaquettes' },
      { label: 'Avec accessoires', value: 'Oui' },
    ],
    equivalentIds: ['p-pads-autobacs-front'],
  },
  {
    id: 'p-pads-autobacs-front', name: 'Plaquettes avant Autobacs', brand: 'AUTOBACS', reference: 'AB-PADF', price: 29.90,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    categoryId: 'brakes', subcriteriaId: 'brake-pads-front',
    specTagline: '4 plaquettes \u2014 low metal',
    expertAdvice: 'Plaquettes avant Autobacs au meilleur prix. Formulation low metal pour un freinage efficace \u00e0 toutes temp\u00e9ratures. Livr\u00e9es avec les ressorts et accessoires de montage.',
    specs: [
      { label: 'Position', value: 'Avant' },
      { label: 'Quantit\u00e9', value: '4 plaquettes' },
      { label: 'Formulation', value: 'Low Metal' },
    ],
    equivalentIds: ['p-pads-bosch-front'],
  },
  {
    id: 'p-disc-front', name: 'Disque avant ventil\u00e9 Bosch', brand: 'BOSCH', reference: 'BO-0986479115', price: 44.90,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    categoryId: 'brakes', subcriteriaId: 'brake-disc-front',
    specTagline: '283mm \u2014 ventil\u00e9',
    expertAdvice: 'Disque de frein avant ventil\u00e9 283mm. Les disques avant sont ventil\u00e9s pour dissiper la chaleur (30% du freinage \u00e9nergie sous forme thermique). Remplacez la paire et les plaquettes ensemble pour un freinage \u00e9quilibr\u00e9.',
    specs: [
      { label: 'Diam\u00e8tre', value: '283mm' },
      { label: '\u00c9paisseur', value: '26mm' },
      { label: 'Type', value: 'Ventil\u00e9' },
      { label: 'Vente', value: 'Unitaire' },
    ],
  },
  {
    id: 'p-brake-kit', name: 'Kit 2 disques + 4 plaquettes', brand: 'BOSCH', reference: 'BO-KIT2D4P', price: 129.00,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    categoryId: 'brakes', subcriteriaId: 'brake-kit',
    specTagline: 'Avant complet \u2014 Bosch',
    expertAdvice: 'Kit complet avant : 2 disques ventil\u00e9s + 4 plaquettes + accessoires. \u00c9conomique par rapport \u00e0 l\u2019achat s\u00e9par\u00e9. Id\u00e9al pour une r\u00e9vision compl\u00e8te. Montage professionnel recommand\u00e9 (2h de main d\u2019\u0153uvre).',
    specs: [
      { label: 'Contenu', value: '2 disques + 4 plaquettes' },
      { label: 'Position', value: 'Avant' },
      { label: 'Accessoires', value: 'Inclus' },
    ],
  },

  // ══ FILTRATION ══
  {
    id: 'p-filter-oil-bosch', name: 'Filtre \u00e0 huile Bosch', brand: 'BOSCH', reference: 'BO-F026407160', price: 9.90,
    image: 'https://images.unsplash.com/photo-1635784065790-8d4e0fa3c5a6?w=400',
    categoryId: 'filters', subcriteriaId: 'filter-oil',
    specTagline: 'Filtre huile \u2014 r\u00e9vision',
    expertAdvice: 'Filtre \u00e0 huile Bosch d\u2019origine constructeur. \u00c0 remplacer syst\u00e9matiquement lors de chaque vidange (tous les 15 000 km ou 1 an). Un filtre encrass\u00e9 r\u00e9duit la filtration et abime le moteur \u00e0 long terme.',
    specs: [
      { label: 'Type', value: 'Filtre \u00e0 huile' },
      { label: 'Filetage', value: 'M20x1.5' },
      { label: 'Compatibilit\u00e9', value: 'PSA/Ford' },
    ],
  },
  {
    id: 'p-filter-air-bosch', name: 'Filtre \u00e0 air Bosch', brand: 'BOSCH', reference: 'BO-F026400158', price: 16.90,
    image: 'https://images.unsplash.com/photo-1635784065790-8d4e0fa3c5a6?w=400',
    categoryId: 'filters', subcriteriaId: 'filter-air',
    specTagline: 'Filtre air \u2014 admission',
    expertAdvice: 'Filtre \u00e0 air moteur Bosch. \u00c0 remplacer tous les 30 000 km environ (plus souvent en environnement poussi\u00e9reux). Un filtre encrass\u00e9 augmente la consommation jusqu\u2019\u00e0 10% et r\u00e9duit les performances.',
    specs: [
      { label: 'Type', value: 'Filtre air moteur' },
      { label: 'Forme', value: 'Rectangulaire' },
    ],
  },
  {
    id: 'p-filter-cabin', name: 'Filtre habitacle charbon actif', brand: 'BOSCH', reference: 'BO-R2335', price: 19.90,
    image: 'https://images.unsplash.com/photo-1635784065790-8d4e0fa3c5a6?w=400',
    categoryId: 'filters', subcriteriaId: 'filter-cabin',
    specTagline: 'Habitacle \u2014 charbon actif',
    expertAdvice: 'Filtre d\u2019habitacle au charbon actif Bosch. Retient les particules fines, pollens et odeurs. Remplacement annuel recommand\u00e9 (ou tous les 15 000 km). Souvent oubli\u00e9 alors qu\u2019il a un impact direct sur la qualit\u00e9 de l\u2019air que vous respirez.',
    specs: [
      { label: 'Type', value: 'Habitacle' },
      { label: 'Technologie', value: 'Charbon actif' },
      { label: 'Filtration', value: '0.3 microns' },
    ],
  },
  {
    id: 'p-filter-kit', name: 'Kit 3 filtres r\u00e9vision Autobacs', brand: 'AUTOBACS', reference: 'AB-KIT3F', price: 39.90,
    image: 'https://images.unsplash.com/photo-1635784065790-8d4e0fa3c5a6?w=400',
    categoryId: 'filters', subcriteriaId: 'filter-kit',
    specTagline: 'Kit 3 filtres \u2014 huile + air + habitacle',
    expertAdvice: 'Kit r\u00e9vision compl\u00e8te : filtre huile + filtre air + filtre habitacle. \u00c9conomie de 25% par rapport \u00e0 l\u2019achat s\u00e9par\u00e9. Pour votre vidange annuelle ou tous les 15 000 km.',
    specs: [
      { label: 'Contenu', value: 'Huile + Air + Habitacle' },
      { label: '\u00c9conomie', value: '-25%' },
    ],
  },

  // ══ ÉCHAPPEMENT ══
  {
    id: 'p-exhaust-rear', name: 'Silencieux arri\u00e8re Bosch', brand: 'BOSCH', reference: 'BO-EX199', price: 129.00,
    image: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=400',
    categoryId: 'exhaust', subcriteriaId: 'exhaust-rear',
    specTagline: 'Acier aluminis\u00e9',
    expertAdvice: 'Silencieux arri\u00e8re en acier aluminis\u00e9 avec revêtement anti-corrosion. Dur\u00e9e de vie 5 \u00e0 8 ans selon l\u2019usage. Montage avec colliers et p\u00e2te d\u2019\u00e9tanch\u00e9it\u00e9 \u00e0 pr\u00e9voir. Homologu\u00e9 CE.',
    specs: [
      { label: 'Mat\u00e9riau', value: 'Acier aluminis\u00e9' },
      { label: 'Position', value: 'Arri\u00e8re' },
      { label: 'Homologation', value: 'CE' },
    ],
  },
  {
    id: 'p-exhaust-cat', name: 'Catalyseur universel', brand: 'BOSCH', reference: 'BO-CAT200', price: 289.00,
    image: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=400',
    categoryId: 'exhaust', subcriteriaId: 'exhaust-cat',
    specTagline: 'Homologu\u00e9 Euro 5/6',
    expertAdvice: 'Catalyseur 3 voies homologu\u00e9 Euro 5/6 avec CPSI optimis\u00e9. Indispensable pour passer le contr\u00f4le technique. Remplacement obligatoire si d\u00e9t\u00e9rior\u00e9 ou vol\u00e9 (vol fr\u00e9quent pour le rhodium/palladium).',
    specs: [
      { label: 'Type', value: '3 voies' },
      { label: 'Homologation', value: 'Euro 5/6' },
      { label: 'Entr\u00e9e/Sortie', value: '50mm' },
    ],
  },
  {
    id: 'p-exhaust-paste', name: 'P\u00e2te \u00e9chappement 170g', brand: 'AUTOBACS', reference: 'AB-PASTE170', price: 7.90,
    image: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=400',
    categoryId: 'exhaust', subcriteriaId: 'exhaust-parts',
    specTagline: 'P\u00e2te \u00e9tanch\u00e9it\u00e9 1200\u00b0C',
    expertAdvice: 'P\u00e2te \u00e9tanch\u00e9it\u00e9 haute temp\u00e9rature (jusqu\u2019\u00e0 1200\u00b0C) pour colmater les petites fuites et assurer l\u2019\u00e9tanch\u00e9it\u00e9 des raccords. S\u00e8che en 2h.',
    specs: [
      { label: 'Volume', value: '170g' },
      { label: 'Temp\u00e9rature', value: '1200\u00b0C' },
      { label: 'S\u00e9chage', value: '2h' },
    ],
  },

  // ══ DISTRIBUTION ══
  {
    id: 'p-belt-access', name: 'Courroie accessoires Bosch', brand: 'BOSCH', reference: 'BO-1987947834', price: 32.90,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=400',
    categoryId: 'distribution', subcriteriaId: 'dist-belt',
    specTagline: '6PK1822 \u2014 Poly-V',
    expertAdvice: 'Courroie Poly-V Bosch pour alternateur, climatisation et direction assist\u00e9e. \u00c0 remplacer tous les 60 000 km. Une courroie us\u00e9e siffle au d\u00e9marrage \u00e0 froid. Ne pas confondre avec la courroie de distribution (bien plus critique).',
    specs: [
      { label: 'R\u00e9f\u00e9rence', value: '6PK1822' },
      { label: 'Type', value: 'Poly-V' },
      { label: 'Longueur', value: '1822mm' },
    ],
  },
  {
    id: 'p-belt-kit', name: 'Kit distribution Bosch', brand: 'BOSCH', reference: 'BO-1987946473', price: 189.00,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=400',
    categoryId: 'distribution', subcriteriaId: 'dist-kit',
    specTagline: 'Courroie + galets + tendeur',
    expertAdvice: '\u26a0\ufe0f CRITIQUE : Une courroie de distribution qui casse d\u00e9truit le moteur (soupapes vs pistons). Respectez ABSOLUMENT l\u2019intervalle constructeur (60 000 \u00e0 240 000 km selon mod\u00e8le). Kit complet avec courroie, galet tendeur et galets enrouleurs. Montage professionnel OBLIGATOIRE (3-5h de main d\u2019\u0153uvre).',
    specs: [
      { label: 'Contenu', value: 'Courroie + 2 galets + tendeur' },
      { label: 'Marque', value: 'Bosch OE' },
      { label: 'Garantie', value: '2 ans' },
    ],
  },
  {
    id: 'p-alternator', name: 'Alternateur Bosch 120A', brand: 'BOSCH', reference: 'BO-0124525090', price: 289.00,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=400',
    categoryId: 'distribution', subcriteriaId: 'dist-alternator',
    specTagline: '120A \u2014 r\u00e9vis\u00e9',
    expertAdvice: 'Alternateur Bosch 120A remanufactur\u00e9 avec garantie 2 ans. Charge la batterie et alimente l\u2019\u00e9lectronique du v\u00e9hicule. Sympt\u00f4mes d\u2019alternateur HS : t\u00e9moin batterie allum\u00e9, feux qui faiblissent au ralenti.',
    specs: [
      { label: 'Intensit\u00e9', value: '120A' },
      { label: 'Voltage', value: '12V' },
      { label: 'Type', value: 'Remanufactur\u00e9' },
    ],
  },
  {
    id: 'p-starter', name: 'D\u00e9marreur Bosch 2.0kW', brand: 'BOSCH', reference: 'BO-0001107468', price: 239.00,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=400',
    categoryId: 'distribution', subcriteriaId: 'dist-starter',
    specTagline: '2.0kW \u2014 diesel',
    expertAdvice: 'D\u00e9marreur Bosch 2.0kW pour moteurs diesel. Forte puissance n\u00e9cessaire pour vaincre la compression \u00e9lev\u00e9e des diesels. Si le d\u00e9marreur tourne mollement, v\u00e9rifiez d\u2019abord la batterie et les cosses avant remplacement.',
    specs: [
      { label: 'Puissance', value: '2.0 kW' },
      { label: 'Voltage', value: '12V' },
      { label: 'Type', value: 'Diesel' },
    ],
  },

  // ══ ACCESSOIRES ══
  {
    id: 'p-acc-charger', name: 'Chargeur USB-C 45W', brand: 'AUTOBACS', reference: 'AB-USBC45', price: 19.90,
    image: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=400',
    categoryId: 'accessories', subcriteriaId: 'acc-chargers',
    specTagline: '2x USB-C \u2014 PD 45W',
    expertAdvice: 'Chargeur allume-cigare double USB-C Power Delivery 45W. Compatible tous smartphones et tablettes charge rapide. Recharge un iPhone de 0 \u00e0 50% en 30 minutes.',
    specs: [
      { label: 'Puissance', value: '45W PD' },
      { label: 'Ports', value: '2x USB-C' },
    ],
  },
  {
    id: 'p-acc-dashcam', name: 'Dash Cam Full HD', brand: 'AUTOBACS', reference: 'AB-DCAM-FHD', price: 79.90,
    image: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=400',
    categoryId: 'accessories', subcriteriaId: 'acc-dashcam',
    specTagline: '1080p \u2014 angle 170\u00b0',
    expertAdvice: 'Cam\u00e9ra embarqu\u00e9e Full HD avec enregistrement en boucle et d\u00e9tection de chocs. Utile en cas d\u2019accident pour prouver les circonstances. V\u00e9rifiez la l\u00e9gislation locale concernant l\u2019enregistrement des plaques et visages.',
    specs: [
      { label: 'R\u00e9solution', value: '1080p 30fps' },
      { label: 'Angle', value: '170\u00b0' },
      { label: 'Stockage', value: 'microSD 128Go max' },
    ],
  },
  {
    id: 'p-acc-mats', name: 'Tapis caoutchouc 4 pi\u00e8ces', brand: 'AUTOBACS', reference: 'AB-TAPIS4', price: 49.90,
    image: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=400',
    categoryId: 'accessories', subcriteriaId: 'acc-mats',
    specTagline: '4 pi\u00e8ces \u2014 caoutchouc',
    expertAdvice: 'Jeu de 4 tapis caoutchouc universels avec rebords. Prot\u00e8ge la moquette d\u2019origine de la boue et de l\u2019humidit\u00e9. Indispensable en hiver. Lavables \u00e0 l\u2019eau.',
    specs: [
      { label: 'Mati\u00e8re', value: 'Caoutchouc TPE' },
      { label: 'Pi\u00e8ces', value: '4 (AV + AR)' },
    ],
  },
  {
    id: 'p-acc-safety', name: 'Kit s\u00e9curit\u00e9 triangle + gilet', brand: 'AUTOBACS', reference: 'AB-KITSEC', price: 14.90,
    image: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=400',
    categoryId: 'accessories', subcriteriaId: 'acc-safety',
    specTagline: 'Obligatoire \u2014 homologu\u00e9',
    expertAdvice: '\u26a0\ufe0f OBLIGATOIRE dans chaque v\u00e9hicule en France (code de la route). Kit triangle de signalisation + gilet haute visibilit\u00e9 homologu\u00e9s. Amende de 135\u20ac en cas d\u2019absence lors d\u2019un contr\u00f4le.',
    specs: [
      { label: 'Contenu', value: 'Triangle + gilet' },
      { label: 'Homologation', value: 'CE / NF' },
    ],
  },
];

// ─── Génération produits "filler" (≈50 par sous-critère) ───────────────

/** Hash déterministe simple — pour seedés stables id/stock/prix */
function seedHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

/** Variantes par catégorie : suffixe nom + tagline court + multiplicateur de prix */
interface Variant { name: string; tag: string; priceMul: number; }

const VARIANTS_BY_CATEGORY: Record<string, Variant[]> = {
  lighting: [
    { name: 'Pure Light', tag: 'Halogène standard', priceMul: 1.0 },
    { name: 'Long Life', tag: 'Durée x4', priceMul: 1.3 },
    { name: 'Plus 90', tag: '+90% luminosité', priceMul: 1.6 },
    { name: 'Vision', tag: '+50% lumière blanche', priceMul: 1.4 },
    { name: 'Night Breaker', tag: '+150% performance', priceMul: 2.2 },
    { name: 'Xenon White', tag: '4000K teinte Xénon', priceMul: 1.8 },
    { name: 'Cool Blue', tag: 'Blanc pur 4200K', priceMul: 1.5 },
    { name: 'LED Ultra', tag: 'LED 6000K homologuée', priceMul: 4.5 },
    { name: 'Eco', tag: 'Prix mini — usage standard', priceMul: 0.7 },
    { name: 'Performance', tag: 'Sport — +120% lumière', priceMul: 2.6 },
  ],
  wipers: [
    { name: 'AeroTwin', tag: 'Flat blade premium', priceMul: 1.2 },
    { name: 'Twin Spoiler', tag: 'Cadre + spoiler aéro', priceMul: 1.0 },
    { name: 'Silicone', tag: 'Caoutchouc silicone', priceMul: 1.4 },
    { name: 'Hybrid', tag: 'Flat + cadre hybride', priceMul: 1.3 },
    { name: 'Eco', tag: 'Entrée de gamme', priceMul: 0.7 },
    { name: 'Hiver', tag: '-40°C anti-givre', priceMul: 1.5 },
    { name: 'Graphite', tag: 'Lame graphite longue durée', priceMul: 1.25 },
    { name: 'Sport', tag: 'Double lame sport', priceMul: 1.6 },
  ],
  batteries: [
    { name: 'Classic', tag: 'Plomb-acide standard', priceMul: 1.0 },
    { name: 'Premium', tag: '+30% démarrages à froid', priceMul: 1.3 },
    { name: 'Calcium+', tag: 'Sans entretien 3 ans', priceMul: 1.2 },
    { name: 'Heavy Duty', tag: 'Utilitaires / gros moteurs', priceMul: 1.5 },
    { name: 'Silver', tag: 'Plaques argentées -50% corrosion', priceMul: 1.4 },
    { name: 'AGM Start-Stop', tag: 'Technologie Start-Stop', priceMul: 1.9 },
    { name: 'EFB', tag: 'EFB Start-Stop éco', priceMul: 1.6 },
    { name: 'Gel', tag: 'Technologie Gel marine', priceMul: 2.2 },
  ],
  fluids: [
    { name: 'Synthétique 5L', tag: 'Bidon 5L ACEA A3/B4', priceMul: 1.0 },
    { name: 'Synthétique 1L', tag: 'Bidon 1L appoint', priceMul: 0.25 },
    { name: 'Long Life 5L', tag: 'Vidange 30 000 km', priceMul: 1.1 },
    { name: 'Racing 5L', tag: 'Haute performance', priceMul: 1.4 },
    { name: 'Turbo+ 5L', tag: 'Protection turbo renforcée', priceMul: 1.3 },
    { name: 'Eco 5L', tag: 'Économique', priceMul: 0.7 },
    { name: 'FAP Compatible 5L', tag: 'Spécial FAP diesel', priceMul: 1.2 },
  ],
  tires: [
    { name: 'Summer', tag: 'Pneu été', priceMul: 1.0 },
    { name: '4 Saisons', tag: 'Marquage M+S', priceMul: 1.1 },
    { name: 'Hiver', tag: 'Marquage 3PMSF', priceMul: 1.15 },
    { name: 'Performance', tag: 'Haute adhérence', priceMul: 1.3 },
    { name: 'Comfort', tag: 'Silence et confort', priceMul: 1.2 },
    { name: 'Eco', tag: 'Faible résistance roulement', priceMul: 0.9 },
    { name: 'Run-Flat', tag: 'Technologie anti-crevaison', priceMul: 1.7 },
  ],
  brakes: [
    { name: 'Standard', tag: 'Homologation ECE R90', priceMul: 1.0 },
    { name: 'Premium', tag: 'Céramique — faible poussière', priceMul: 1.4 },
    { name: 'Sport', tag: 'Haute performance — usage intensif', priceMul: 1.6 },
    { name: 'Eco', tag: 'Entrée de gamme', priceMul: 0.8 },
    { name: 'Ventilés', tag: 'Dissipation thermique renforcée', priceMul: 1.25 },
    { name: 'Traité', tag: 'Anti-corrosion zingués', priceMul: 1.15 },
  ],
  filters: [
    { name: 'Standard', tag: 'Filtration OEM', priceMul: 1.0 },
    { name: 'Premium', tag: 'Charbon actif', priceMul: 1.4 },
    { name: 'Sport', tag: 'Débit d\u2019air optimisé', priceMul: 1.8 },
    { name: 'Long Life', tag: 'Durée prolongée', priceMul: 1.2 },
    { name: 'Eco', tag: 'Entrée de gamme', priceMul: 0.75 },
    { name: 'Anti-Pollen', tag: 'Blocage allergènes', priceMul: 1.3 },
  ],
  exhaust: [
    { name: 'Inox', tag: 'Acier inoxydable', priceMul: 1.2 },
    { name: 'Acier', tag: 'Acier aluminié', priceMul: 1.0 },
    { name: 'Sport', tag: 'Son sportif homologué', priceMul: 1.7 },
    { name: 'Titane', tag: 'Ligne titane légère', priceMul: 2.8 },
    { name: 'Standard', tag: 'Remplacement OEM', priceMul: 1.0 },
  ],
  distribution: [
    { name: 'Standard', tag: 'Courroie OEM', priceMul: 1.0 },
    { name: 'Kit complet', tag: '+ tendeur + galet', priceMul: 1.6 },
    { name: 'Pro', tag: 'Durée 120 000 km', priceMul: 1.3 },
    { name: 'Reinforcée', tag: 'Moteurs hautes sollicitations', priceMul: 1.5 },
    { name: 'Eco', tag: 'Entrée de gamme', priceMul: 0.8 },
  ],
  accessories: [
    { name: 'Standard', tag: 'Usage quotidien', priceMul: 1.0 },
    { name: 'Premium', tag: 'Finition renforcée', priceMul: 1.4 },
    { name: 'Sport', tag: 'Design sport', priceMul: 1.3 },
    { name: 'Compact', tag: 'Format réduit', priceMul: 0.85 },
    { name: 'Kit complet', tag: '+ accessoires montage', priceMul: 1.5 },
  ],
};

/** Prix de base par sous-critère (centre du range) */
const BASE_PRICE_BY_CAT: Record<string, number> = {
  lighting: 12, wipers: 22, batteries: 110, fluids: 38, tires: 85,
  brakes: 55, filters: 18, exhaust: 130, distribution: 80, accessories: 35,
};

/** Nom-type par sous-critère (pour construire "Ampoule H7 {variant}") */
const SUBCAT_TYPE_NAME: Record<string, string> = {
  'lighting-low': 'Ampoule H7', 'lighting-high': 'Ampoule H1', 'lighting-position': 'Veilleuse W5W',
  'lighting-turn': 'Ampoule P21W', 'lighting-stop': 'Ampoule P21/5W', 'lighting-reverse': 'Ampoule W16W',
  'wipers-front-driver': 'Balai avant', 'wipers-front-passenger': 'Balai passager', 'wipers-rear': 'Balai arrière',
  'wipers-winter': 'Balai hiver', 'wipers-beam': 'Balai plat', 'wipers-adapters': 'Adaptateur essuie-glace',
  'bat-small': 'Batterie 50Ah', 'bat-medium': 'Batterie 65Ah', 'bat-large': 'Batterie 90Ah',
  'bat-agm': 'Batterie AGM 70Ah', 'bat-accessories': 'Câble batterie', 'bat-recycle': 'Consigne batterie',
  'fluid-5w30': 'Huile 5W-30', 'fluid-5w40': 'Huile 5W-40', 'fluid-0w30': 'Huile 0W-30',
  'fluid-10w40': 'Huile 10W-40', 'fluid-additives': 'Additif moteur', 'fluid-brake': 'Liquide de frein DOT4',
  'tire-15': 'Pneu 195/65 R15', 'tire-16': 'Pneu 205/55 R16', 'tire-17': 'Pneu 215/60 R17',
  'tire-winter': 'Pneu hiver 205/55 R16', 'tire-allseason': 'Pneu 4 saisons 205/55 R16', 'tire-chains': 'Chaînes neige',
  'brake-pads-front': 'Plaquettes avant', 'brake-pads-rear': 'Plaquettes arrière',
  'brake-disc-front': 'Disque avant', 'brake-disc-rear': 'Disque arrière',
  'brake-fluid': 'Liquide frein DOT4', 'brake-kit': 'Kit freinage avant',
  'filter-air': 'Filtre à air', 'filter-oil': 'Filtre à huile', 'filter-cabin': 'Filtre habitacle',
  'filter-fuel': 'Filtre carburant', 'filter-kit': 'Kit 3 filtres', 'filter-special': 'Filtre sport',
  'exhaust-rear': 'Silencieux arrière', 'exhaust-mid': 'Silencieux central', 'exhaust-cat': 'Catalyseur',
  'exhaust-fap': 'FAP', 'exhaust-full': 'Ligne complète', 'exhaust-parts': 'Collier échappement',
  'dist-belt': 'Courroie accessoires', 'dist-kit': 'Kit distribution', 'dist-tensioner': 'Galet tendeur',
  'dist-alternator': 'Alternateur', 'dist-starter': 'Démarreur', 'dist-clutch': 'Kit embrayage',
  'acc-chargers': 'Chargeur USB', 'acc-dashcam': 'Dashcam', 'acc-mats': 'Tapis auto',
  'acc-carcare': 'Kit nettoyage', 'acc-safety': 'Kit sécurité', 'acc-tools': 'Kit outils',
};

// ─── Pools de référence pour les règles de compatibilité ─────────
const FRENCH_BRANDS = ['PEUGEOT', 'CITROEN', 'RENAULT', 'DACIA'];
const EU_BRANDS = ['VOLKSWAGEN', 'TOYOTA'];
const ALL_BRANDS = [...FRENCH_BRANDS, ...EU_BRANDS];
const COMPACT_MODELS = ['PEUGEOT:208', 'CITROEN:C3', 'RENAULT:CLIO', 'VOLKSWAGEN:POLO', 'DACIA:SANDERO'];
const BERLINE_MODELS = ['PEUGEOT:308', 'RENAULT:MEGANE', 'VOLKSWAGEN:GOLF', 'CITROEN:C4'];

/** Sous-ensemble déterministe : prend `count` items distincts via `seed`. */
function pickFromArray<T>(arr: T[], seed: number, count: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  let h = seed >>> 0;
  for (let i = 0; i < count && pool.length > 0; i++) {
    h = (h * 31 + i) >>> 0;
    out.push(pool.splice(h % pool.length, 1)[0]);
  }
  return out;
}

/** Règles de compatibilité réalistes par sous-catégorie + hash produit. */
function pickCompatibility(seed: number, sc: SubCriterion): string[] {
  const cat = sc.categoryId;

  // Universels naturels
  if (cat === 'lighting') return ['ALL']; // ampoules normalisées (H7/H4/W5W…)
  if (cat === 'accessories') return ['ALL'];
  if (sc.id === 'wipers-rear') return ['ALL'];
  if (sc.id === 'tire-winter' || sc.id === 'tire-allseason' || sc.id === 'tire-chains') return ['ALL'];
  if (sc.id === 'bat-agm' || sc.id === 'bat-accessories' || sc.id === 'bat-recycle') return ['ALL'];
  if (sc.id === 'dist-belt') return ['ALL']; // courroie accessoires souvent universelle
  if (sc.id === 'brake-fluid' || sc.id === 'fluid-brake') return ['ALL'];
  if (sc.id === 'fluid-additives') return ['ALL'];
  if (cat === 'fluids' && sc.id !== 'fluid-0w30') return ['ALL'];
  if (sc.id === 'fluid-0w30') return ['VOLKSWAGEN', 'PEUGEOT', 'CITROEN', 'RENAULT', 'TOYOTA'];

  // Pneus selon la dimension de la sous-catégorie
  if (sc.id === 'tire-15') return COMPACT_MODELS;
  if (sc.id === 'tire-16') return BERLINE_MODELS;
  if (sc.id === 'tire-17') return BERLINE_MODELS;

  // Batteries selon le format
  if (sc.id === 'bat-small') return COMPACT_MODELS;
  if (sc.id === 'bat-medium') return BERLINE_MODELS;
  if (sc.id === 'bat-large') return ['DIESEL', ...BERLINE_MODELS];

  // Distribution — par modèle / motorisation
  if (sc.id === 'dist-kit' || sc.id === 'dist-tensioner') {
    return pickFromArray([...COMPACT_MODELS, ...BERLINE_MODELS], seed, 2 + (seed % 2));
  }
  if (sc.id === 'dist-starter') return ['DIESEL', ...pickFromArray(FRENCH_BRANDS, seed, 2)];
  if (sc.id === 'dist-alternator') return pickFromArray(ALL_BRANDS, seed, 3);
  if (sc.id === 'dist-clutch') return pickFromArray(ALL_BRANDS, seed, 2);

  // Essuie-glaces avant — par constructeur (longueur lame variable selon modèle)
  if (cat === 'wipers') return pickFromArray(ALL_BRANDS, seed, 2 + (seed % 3));

  // Freinage — par constructeur
  if (cat === 'brakes') return pickFromArray(ALL_BRANDS, seed, 2 + (seed % 3));

  // Filtration — par constructeur, plus strict pour filtre carburant
  if (sc.id === 'filter-fuel') return pickFromArray(ALL_BRANDS, seed, 2);
  if (sc.id === 'filter-special') return pickFromArray(ALL_BRANDS, seed, 1 + (seed % 2));
  if (cat === 'filters') return pickFromArray(ALL_BRANDS, seed, 3 + (seed % 2));

  // Échappement — par constructeur
  if (cat === 'exhaust') return pickFromArray(ALL_BRANDS, seed, 2 + (seed % 3));

  return ['ALL'];
}

/** Génère N produits filler pour une sous-catégorie */
function generateProductsFor(sc: SubCriterion, count: number): RawProduct[] {
  const variants = VARIANTS_BY_CATEGORY[sc.categoryId] || VARIANTS_BY_CATEGORY.accessories;
  const basePrice = BASE_PRICE_BY_CAT[sc.categoryId] || 25;
  const typeName = SUBCAT_TYPE_NAME[sc.id] || sc.name;
  const result: RawProduct[] = [];
  for (let i = 0; i < count; i++) {
    const v = variants[i % variants.length];
    const id = `gen-${sc.id}-${i + 1}`;
    const seed = seedHash(id);
    const brand: Brand = (seed % 2 === 0) ? 'BOSCH' : 'AUTOBACS';
    // Variation fine du prix (±10%) pour éviter les prix identiques
    const priceVariation = 0.9 + ((seed % 20) / 100); // 0.90 - 1.09
    const price = Math.round(basePrice * v.priceMul * priceVariation * 10) / 10;
    const refPrefix = brand === 'BOSCH' ? 'BO' : 'AB';
    const refCode = sc.id.replace(/-/g, '').toUpperCase().slice(0, 5);
    const reference = `${refPrefix}-${refCode}-${String(i + 1).padStart(3, '0')}`;
    result.push({
      id,
      name: `${typeName} ${v.name}`,
      brand,
      reference,
      price,
      image: '',
      categoryId: sc.categoryId,
      subcriteriaId: sc.id,
      specTagline: v.tag,
      expertAdvice: `Gamme ${v.name.toLowerCase()} : ${v.tag.toLowerCase()}. Référence ${reference}, remplacement conseillé selon préconisations constructeur. Pose possible en atelier Autobacs.`,
      specs: [
        { label: 'Marque', value: brand === 'BOSCH' ? 'Bosch' : 'Autobacs' },
        { label: 'Gamme', value: v.name },
        { label: 'Référence', value: reference },
      ],
      compatibility: pickCompatibility(seed, sc),
    });
  }
  return result;
}

/** Ajout de 50 produits par sous-critère au catalogue brut */
for (const sc of subcriteria) {
  rawProducts.push(...generateProductsFor(sc, 50));
}

// ─── Enrichissement produits : code-barres, description, promo ──────────

/** EAN-13 déterministe à partir de l'id produit (préfixe France 376) */
function computeEAN13(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const body = '376' + String(h).padStart(9, '0').slice(0, 9);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = parseInt(body[i], 10);
    sum += i % 2 === 0 ? d : d * 3;
  }
  return body + ((10 - (sum % 10)) % 10);
}

/** Descriptions marketing courtes (fallback : specTagline) */
const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  'p-h7-bosch': 'Ampoule halogène H7 55W, format standard pour feux de croisement. Éclairage fiable et durée de vie éprouvée.',
  'p-h7-autobacs-plus': 'Halogène H7 nouvelle génération avec +90% de luminosité et +35m de portée, sans modification de l\u2019optique.',
  'p-h4-bosch': 'Ampoule H4 bi-filament (route + croisement) avec +90% de luminosité, idéale pour véhicules à projecteur unique.',
  'p-h1-bosch': 'Ampoule H1 55W pour feux de route longue portée, filament renforcé anti-vibrations.',
  'p-w5w-autobacs': 'Paire de veilleuses LED W5W 6000K blanc pur, consommation 10x réduite et durée 50 000h.',
  'p-p21w-bosch': 'Ampoule P21W 21W ambre pour clignotants avant ou arrière, culot à baïonnette standard.',
  'p-wiper-aerotwin-600': 'Balai flat-blade AeroTwin 600mm Bosch, lame graphite, résistant UV et produits chimiques.',
  'p-wiper-autobacs-600': 'Balai Premium Autobacs 600mm avec raclage silencieux et rail aluminium anti-corrosion.',
  'p-wiper-aerotwin-475': 'Balai flat-blade 475mm pour essuie-glace passager, fixation multi-adaptateurs.',
  'p-wiper-rear-h301': 'Balai arrière spécifique 300mm, fixation dédiée, raclage silencieux.',
  'p-wiper-winter': 'Balai hiver protégé contre le givre, lame caoutchouc naturel -40°C.',
  'p-bat-s3': 'Batterie Bosch S3 45Ah 400A, technologie plomb-acide pour citadines essence récentes.',
  'p-bat-s4-autobacs': 'Batterie Autobacs 60Ah 540A, 3 ans de garantie, sans entretien.',
  'p-bat-s4-bosch': 'Batterie Bosch S4 60Ah 540A, longue durée de vie et excellente résistance au froid.',
  'p-bat-s5-diesel': 'Batterie Bosch S5 80Ah 740A renforcée pour motorisations diesel et gros équipements.',
  'p-bat-agm': 'Batterie AGM Start-Stop 70Ah 760A pour véhicules récents avec récupération d\u2019énergie au freinage.',
  'p-bat-cables': 'Câbles de démarrage 500A section 16mm², 3m, pinces isolées, idéal batterie à plat.',
  'p-oil-5w30-bosch': 'Huile synthétique Bosch 5W-30 ACEA C3, bidon 5L, compatible FAP diesel essence.',
  'p-oil-5w30-autobacs': 'Huile synthétique Autobacs 5W-30 Long Life, bidon 5L, vidange jusqu\u2019à 30 000 km.',
  'p-oil-5w40': 'Huile 5W-40 A3/B4 haute performance, protection moteur hautes sollicitations, 5L.',
  'p-oil-0w30': 'Huile 0W-30 ultra-fluide, démarrage à froid facilité, économie de carburant, 5L.',
  'p-brake-fluid': 'Liquide de frein DOT 4 haut point d\u2019ébullition, 1L, changement conseillé tous les 2 ans.',
  'p-tire-autobacs-205': 'Pneu été Autobacs 205/55 R16 91V, excellent rapport qualité/prix, étiquetage C-B-71dB.',
  'p-tire-bosch-205': 'Pneu Bosch Performance 205/55 R16 91V, adhérence optimale sur sol mouillé.',
  'p-tire-195-15': 'Pneu été Autobacs 195/65 R15 91V, confort et longévité pour citadines et compactes.',
  'p-tire-winter': 'Pneu hiver Autobacs 205/55 R16 marquage 3PMSF, adhérence neige et températures <7°C.',
  'p-pads-bosch-front': 'Plaquettes avant Bosch pré-testées, freinage progressif et faible poussière.',
  'p-pads-autobacs-front': 'Plaquettes avant Autobacs homologuées ECE R90, excellent rapport qualité/prix.',
  'p-disc-front': 'Disque de frein avant ventilé Ø280mm, traitement anti-corrosion, paire recommandée.',
  'p-brake-kit': 'Kit complet 2 disques ventilés + 4 plaquettes Bosch, remplacement freinage avant.',
  'p-filter-oil-bosch': 'Filtre à huile Bosch haute capacité, élément filtrant multicouches, à changer à chaque vidange.',
  'p-filter-air-bosch': 'Filtre à air Bosch, média synthétique haute efficacité, préserve la puissance moteur.',
  'p-filter-cabin': 'Filtre habitacle charbon actif, bloque particules fines et odeurs, à changer 1x/an.',
  'p-filter-kit': 'Kit 3 filtres révision Autobacs : huile + air + habitacle. Économie 20% vs achat séparé.',
  'p-exhaust-rear': 'Silencieux arrière Bosch inox, son sportif maîtrisé, fixations et joints inclus.',
  'p-exhaust-cat': 'Catalyseur universel homologué Euro 4, longueur ajustable, norme CE.',
  'p-exhaust-paste': 'Pâte d\u2019échappement 170g, étanchéité haute température jusqu\u2019à 1100°C.',
  'p-belt-access': 'Courroie accessoires Bosch multicôtes 6PK, entraînement alternateur et pompe de direction.',
  'p-belt-kit': 'Kit distribution Bosch complet : courroie + tendeur + galet. Intervention périodique 100 000 km.',
  'p-alternator': 'Alternateur Bosch 120A neuf, compatibilité multi-véhicules, garantie 2 ans.',
  'p-starter': 'Démarreur Bosch 2.0kW reconditionné, couple de démarrage renforcé, moteurs diesel.',
  'p-acc-charger': 'Chargeur USB-C 45W Power Delivery, compatible smartphones et tablettes, 2 ports.',
  'p-acc-dashcam': 'Dashcam Full HD 1080p, grand-angle 140°, détection chocs et enregistrement boucle.',
  'p-acc-mats': 'Jeu 4 tapis caoutchouc universels, rebords surélevés, imperméables, découpables.',
  'p-acc-safety': 'Kit sécurité obligatoire : triangle pliable + gilet haute visibilité, pochette de rangement.',
};

/** Prix promo déterministes (appliqués aux produits mis en avant dans promoCards) */
const PRODUCT_PROMO_PRICES: Record<string, number> = {
  'p-bat-agm': 194.65,         // -15%
  'p-filter-kit': 35.91,       // -10%
  'p-oil-5w30-autobacs': 26.18, // -25%
  'p-h7-autobacs-plus': 13.41,  // -10%
  'p-wiper-aerotwin-600': 23.92, // -20%
  'p-pads-bosch-front': 35.91,   // -10%
  'p-tire-bosch-205': 80.91,     // -10%
  'p-belt-kit': 170.10,          // -10%
  'p-exhaust-rear': 116.10,      // -10%
};

export const products: Product[] = rawProducts.map((p) => ({
  ...p,
  barcode: computeEAN13(p.id),
  description: PRODUCT_DESCRIPTIONS[p.id] ?? p.specTagline,
  promoPrice: PRODUCT_PROMO_PRICES[p.id],
}));

/** Index O(1) sur l'id (utile pour 3000+ produits, évite des .find linéaires). */
const productById = new Map<string, Product>(products.map((p) => [p.id, p]));

export function getProductById(id: string): Product | undefined {
  return productById.get(id);
}

// ─── Carte fidélité Autobacs Card ──────────────────────────────────────

/** Pourcentage de remise carte fidélité (par défaut 5 %) — appliqué sur les
 *  produits qui ne sont pas déjà en promo. Ne se cumule jamais avec une promo. */
export const LOYALTY_DISCOUNT_RATE = 0.05;

/** Retourne le prix avec carte fidélité, ou null si non applicable
 *  (produit déjà en promo → on garde la promo, pas de cumul). */
export function getLoyaltyPrice(product: Product): number | null {
  if (product.promoPrice != null) return null;
  return Math.round(product.price * (1 - LOYALTY_DISCOUNT_RATE) * 100) / 100;
}

// ─── Promotions d\u2019accueil ─────────────────────────────

export const promoCards: PromoCard[] = [
  { id: 'promo-1', title: 'Batterie AGM Start-Stop 70Ah', category: 'BATTERIES', price: '194,65 \u20ac', badge: '-15%', image: '', categoryId: 'batteries', productId: 'p-bat-agm' },
  { id: 'promo-2', title: 'Kit 3 filtres r\u00e9vision', category: 'FILTRATION', price: '35,91 \u20ac', badge: '-10%', image: '', categoryId: 'filters', productId: 'p-filter-kit' },
  { id: 'promo-3', title: 'Huile Autobacs 5W-30 LL 5L', category: 'HUILES', price: '26,18 \u20ac', badge: '-25%', image: '', categoryId: 'fluids', productId: 'p-oil-5w30-autobacs' },
  { id: 'promo-4', title: 'Ampoule H7 Vision Plus +90%', category: 'ÉCLAIRAGE', price: '13,41 \u20ac', badge: '-10%', image: '', categoryId: 'lighting', productId: 'p-h7-autobacs-plus' },
  { id: 'promo-5', title: 'Balai AeroTwin A980S', category: 'ESSUIE-GLACES', price: '23,92 \u20ac', badge: '-20%', image: '', categoryId: 'wipers', productId: 'p-wiper-aerotwin-600' },
  { id: 'promo-6', title: 'Plaquettes avant Bosch', category: 'FREINAGE', price: '35,91 \u20ac', badge: '-10%', image: '', categoryId: 'brakes', productId: 'p-pads-bosch-front' },
  { id: 'promo-7', title: 'Pneu Bosch 205/55 R16', category: 'PNEUS', price: '80,91 \u20ac', badge: '-10%', image: '', categoryId: 'tires', productId: 'p-tire-bosch-205' },
  { id: 'promo-8', title: 'Kit distribution Bosch', category: 'DISTRIBUTION', price: '170,10 \u20ac', badge: '-10%', image: '', categoryId: 'distribution', productId: 'p-belt-kit' },
  { id: 'promo-9', title: 'Silencieux arri\u00e8re Bosch', category: 'ÉCHAPPEMENT', price: '116,10 \u20ac', badge: '-10%', image: '', categoryId: 'exhaust', productId: 'p-exhaust-rear' },
];

// ─── Bandeau promo d\u00e9filant ────────────────────────────

export const promoTickerItems: string[] = [
  '\u26a1 Montage pneus gratuit d\u00e8s 4 achet\u00e9s',
  '\ud83d\udee2\ufe0f Vidange \u00e0 partir de 49\u20ac - toutes marques',
  '\ud83d\udd0b Diagnostic batterie offert en atelier',
  '\ud83c\udf89 -20% sur les kits r\u00e9vision Autobacs',
  '\u2744\ufe0f Pr\u00e9parez l\u2019hiver : pneus 4 saisons disponibles',
];

// ─── Stock par magasin ──────────────────────────────────
// Format : [qty, aisle?] par magasin dans l'ordre storeOrder
// qty = 0 + onOrder true → "Sur commande" (sinon "Indisponible")

const storeOrder = ['aubergenville','bonneuil','bretigny','claye','lognes','pierrelaye','rosny','saint-brice','saint-maximin','villebon'];

type StockRow = [number, string?, boolean?]; // [qty, aisle, onOrder]

const stockMap: Record<string, StockRow[]> = {
  // Éclairage
  'p-h7-bosch':         [[12,'A1'],[8,'A1'],[15,'A2'],[6,'A1'],[10,'A2'],[5,'A1'],[18,'A2'],[9,'A1'],[0,undefined,true],[11,'A1']],
  'p-h7-autobacs-plus': [[8,'A1'],[5,'A2'],[0,undefined,true],[4,'A1'],[6,'A2'],[2,'A1'],[10,'A2'],[7,'A1'],[3,'A2'],[8,'A1']],
  'p-h4-bosch':         [[6,'A2'],[0,undefined,true],[4,'A1'],[5,'A2'],[0,undefined,true],[3,'A1'],[7,'A2'],[2,'A1'],[0],[6,'A1']],
  'p-h1-bosch':         [[10,'A1'],[12,'A1'],[8,'A2'],[0,undefined,true],[9,'A1'],[6,'A2'],[0,undefined,true],[5,'A1'],[4,'A2'],[8,'A1']],
  'p-w5w-autobacs':     [[20,'A2'],[15,'A1'],[18,'A2'],[12,'A1'],[16,'A2'],[10,'A1'],[22,'A2'],[14,'A1'],[11,'A2'],[17,'A1']],
  'p-p21w-bosch':       [[25,'A2'],[20,'A1'],[18,'A2'],[15,'A1'],[22,'A2'],[12,'A1'],[28,'A2'],[16,'A1'],[14,'A2'],[20,'A1']],

  // Essuie-glaces
  'p-wiper-aerotwin-600': [[5,'A5'],[8,'A6'],[0,undefined,true],[6,'A5'],[4,'A6'],[0,undefined,true],[12,'A5'],[3,'A6'],[7,'A5'],[2,'A6']],
  'p-wiper-autobacs-600': [[10,'A6'],[12,'A5'],[8,'A6'],[0,undefined,true],[9,'A5'],[6,'A6'],[14,'A5'],[8,'A6'],[5,'A5'],[9,'A6']],
  'p-wiper-aerotwin-475': [[6,'A5'],[4,'A6'],[0,undefined,true],[5,'A5'],[0],[8,'A6'],[10,'A5'],[2,'A6'],[6,'A5'],[3,'A6']],
  'p-wiper-rear-h301':    [[8,'A6'],[5,'A5'],[6,'A6'],[0,undefined,true],[7,'A5'],[4,'A6'],[0,undefined,true],[6,'A5'],[3,'A6'],[9,'A5']],
  'p-wiper-winter':       [[4,'A6'],[2,'A5'],[0,undefined,true],[3,'A6'],[0],[5,'A5'],[6,'A6'],[1,'A5'],[2,'A6'],[0,undefined,true]],

  // Batteries
  'p-bat-s3':           [[4,'FC'],[6,'F1'],[0,undefined,true],[3,'FC'],[5,'F1'],[0,undefined,true],[8,'FC'],[2,'F1'],[4,'FC'],[0,undefined,true]],
  'p-bat-s4-autobacs':  [[3,'FC'],[5,'F1'],[4,'FC'],[0,undefined,true],[6,'F1'],[2,'FC'],[7,'F1'],[0,undefined,true],[3,'FC'],[5,'F1']],
  'p-bat-s4-bosch':     [[2,'FC'],[0,undefined,true],[3,'F1'],[2,'FC'],[0],[4,'F1'],[5,'FC'],[0,undefined,true],[2,'F1'],[3,'FC']],
  'p-bat-s5-diesel':    [[1,'FC'],[2,'F1'],[0,undefined,true],[0],[3,'FC'],[0,undefined,true],[4,'F1'],[1,'FC'],[0],[2,'F1']],
  'p-bat-agm':          [[2,'FC'],[0,undefined,true],[3,'F1'],[1,'FC'],[0],[2,'F1'],[4,'FC'],[0,undefined,true],[2,'F1'],[0,undefined,true]],
  'p-bat-cables':       [[15,'C10'],[12,'C11'],[10,'C10'],[8,'C11'],[14,'C10'],[11,'C11'],[18,'C10'],[9,'C11'],[13,'C10'],[10,'C11']],

  // Fluides
  'p-oil-5w30-bosch':    [[15,'D8'],[12,'D9'],[0,undefined,true],[10,'D8'],[8,'D9'],[18,'D8'],[0,undefined,true],[9,'D8'],[6,'D9'],[12,'D8']],
  'p-oil-5w30-autobacs': [[20,'D9'],[16,'D8'],[14,'D9'],[12,'D8'],[18,'D9'],[10,'D8'],[22,'D9'],[15,'D8'],[13,'D9'],[17,'D8']],
  'p-oil-5w40':          [[8,'D8'],[10,'D9'],[6,'D8'],[0,undefined,true],[12,'D9'],[5,'D8'],[9,'D9'],[0,undefined,true],[7,'D8'],[6,'D9']],
  'p-oil-0w30':          [[3,'D9'],[0,undefined,true],[5,'D8'],[4,'D9'],[0],[6,'D8'],[0,undefined,true],[5,'D9'],[3,'D8'],[0]],
  'p-brake-fluid':       [[12,'D8'],[15,'D9'],[10,'D8'],[8,'D9'],[14,'D8'],[9,'D9'],[16,'D8'],[11,'D9'],[7,'D8'],[13,'D9']],

  // Pneus
  'p-tire-autobacs-205': [[16,'G1'],[12,'G1'],[0,undefined,true],[8,'G1'],[10,'G1'],[14,'G1'],[20,'G1'],[11,'G1'],[6,'G1'],[15,'G1']],
  'p-tire-bosch-205':    [[4,'G1'],[6,'G1'],[0,undefined,true],[0],[8,'G1'],[3,'G1'],[0,undefined,true],[5,'G1'],[2,'G1'],[6,'G1']],
  'p-tire-195-15':       [[8,'G1'],[10,'G1'],[6,'G1'],[12,'G1'],[0,undefined,true],[9,'G1'],[14,'G1'],[7,'G1'],[0,undefined,true],[11,'G1']],
  'p-tire-winter':       [[4,'G1'],[0,undefined,true],[6,'G1'],[0],[3,'G1'],[5,'G1'],[0,undefined,true],[4,'G1'],[0],[5,'G1']],

  // Freinage
  'p-pads-bosch-front':   [[6,'E3'],[0,undefined,true],[4,'E4'],[3,'E3'],[0,undefined,true],[5,'E4'],[8,'E3'],[2,'E4'],[0],[4,'E3']],
  'p-pads-autobacs-front':[[10,'E3'],[8,'E4'],[12,'E3'],[6,'E4'],[9,'E3'],[7,'E4'],[14,'E3'],[5,'E4'],[8,'E3'],[11,'E4']],
  'p-disc-front':         [[4,'E3'],[6,'E4'],[0,undefined,true],[5,'E3'],[3,'E4'],[0,undefined,true],[7,'E3'],[0,undefined,true],[4,'E4'],[2,'E3']],
  'p-brake-kit':          [[2,'E4'],[0,undefined,true],[3,'E3'],[0],[4,'E4'],[2,'E3'],[0,undefined,true],[3,'E4'],[0],[2,'E3']],

  // Filtres
  'p-filter-oil-bosch':  [[20,'B7'],[18,'B8'],[15,'B7'],[12,'B8'],[22,'B7'],[14,'B8'],[25,'B7'],[16,'B8'],[13,'B7'],[19,'B8']],
  'p-filter-air-bosch':  [[12,'B8'],[10,'B7'],[14,'B8'],[8,'B7'],[11,'B8'],[9,'B7'],[16,'B8'],[7,'B7'],[10,'B8'],[13,'B7']],
  'p-filter-cabin':      [[8,'B7'],[6,'B8'],[0,undefined,true],[7,'B7'],[5,'B8'],[9,'B7'],[11,'B8'],[4,'B7'],[6,'B8'],[8,'B7']],
  'p-filter-kit':        [[5,'B8'],[3,'B7'],[4,'B8'],[0,undefined,true],[6,'B7'],[2,'B8'],[8,'B7'],[3,'B8'],[5,'B7'],[4,'B8']],

  // Échappement
  'p-exhaust-rear': [[2,'E3'],[0,undefined,true],[3,'E4'],[1,'E3'],[0],[2,'E4'],[4,'E3'],[0,undefined,true],[1,'E4'],[2,'E3']],
  'p-exhaust-cat':  [[1,'E4'],[0,undefined,true],[2,'E3'],[0],[1,'E4'],[0,undefined,true],[2,'E3'],[0],[1,'E4'],[0]],
  'p-exhaust-paste':[[15,'C12'],[12,'C11'],[10,'C12'],[8,'C11'],[14,'C12'],[11,'C11'],[18,'C12'],[9,'C11'],[13,'C12'],[10,'C11']],

  // Distribution
  'p-belt-access': [[6,'E3'],[4,'E4'],[5,'E3'],[0,undefined,true],[7,'E4'],[3,'E3'],[8,'E4'],[2,'E3'],[0,undefined,true],[6,'E4']],
  'p-belt-kit':    [[2,'E4'],[0,undefined,true],[3,'E3'],[0],[4,'E4'],[2,'E3'],[0,undefined,true],[3,'E4'],[0],[2,'E3']],
  'p-alternator':  [[1,'FC'],[0,undefined,true],[2,'F1'],[0],[1,'FC'],[0,undefined,true],[2,'F1'],[0],[1,'FC'],[0]],
  'p-starter':     [[1,'FC'],[0,undefined,true],[0],[1,'F1'],[0],[2,'FC'],[0,undefined,true],[1,'F1'],[0],[2,'FC']],

  // Accessoires
  'p-acc-charger':  [[15,'C10'],[18,'C11'],[12,'C10'],[14,'C11'],[16,'C10'],[10,'C11'],[20,'C10'],[13,'C11'],[11,'C10'],[17,'C11']],
  'p-acc-dashcam':  [[5,'C12'],[3,'C10'],[6,'C12'],[0,undefined,true],[4,'C10'],[2,'C12'],[7,'C10'],[3,'C12'],[5,'C10'],[4,'C12']],
  'p-acc-mats':     [[8,'C11'],[10,'C12'],[6,'C11'],[5,'C12'],[9,'C11'],[4,'C12'],[12,'C11'],[7,'C12'],[6,'C11'],[8,'C12']],
  'p-acc-safety':   [[20,'C12'],[25,'C11'],[18,'C12'],[15,'C11'],[22,'C12'],[14,'C11'],[28,'C12'],[16,'C11'],[13,'C12'],[19,'C11']],
};

const aisleNames: Record<string, string> = {
  'A1': 'All\u00e9e A - Rayon 1', 'A2': 'All\u00e9e A - Rayon 2',
  'A5': 'All\u00e9e A - Rayon 5', 'A6': 'All\u00e9e A - Rayon 6',
  'B7': 'All\u00e9e B - Rayon 7', 'B8': 'All\u00e9e B - Rayon 8',
  'C10': 'All\u00e9e C - Rayon 10', 'C11': 'All\u00e9e C - Rayon 11', 'C12': 'All\u00e9e C - Rayon 12',
  'D8': 'All\u00e9e D - Rayon 8', 'D9': 'All\u00e9e D - Rayon 9',
  'E3': 'All\u00e9e E - Rayon 3', 'E4': 'All\u00e9e E - Rayon 4',
  'F1': 'All\u00e9e F - Rayon 1', 'FC': 'All\u00e9e F - Comptoir',
  'G1': 'All\u00e9e G - Zone pneus',
};

export const stockEntries: StockEntry[] = Object.entries(stockMap).flatMap(([productId, rows]) =>
  rows.map((row, i) => ({
    productId,
    storeId: storeOrder[i],
    quantity: row[0],
    aisle: row[1] ? aisleNames[row[1]] : undefined,
    onOrder: row[2],
  }))
);

// ─── Helpers ────────────────────────────────────────────

/** Stock dynamique déterministe pour les produits générés (hors stockMap).
 *  Chaque couple (productId, storeId) a un état stable entre rafraîchissements. */
function computeDynamicStock(productId: string, storeId: string): StockEntry {
  const h = seedHash(productId + '|' + storeId);
  const roll = h % 100;
  // Distribution : 55% en stock, 15% dernières unités, 10% sur commande, 20% indisponible
  let quantity = 0;
  let onOrder: boolean | undefined;
  if (roll < 55) quantity = 3 + (h % 18); // 3 à 20
  else if (roll < 70) quantity = 1 + (h % 2); // 1 ou 2
  else if (roll < 80) { quantity = 0; onOrder = true; }
  else quantity = 0;
  // Allée aléatoire déterministe
  const aisleCode = ['A1', 'A2', 'B7', 'B8', 'C10', 'C11', 'D8', 'D9', 'E3', 'E4', 'F1', 'FC', 'G1'][h % 13];
  return {
    productId,
    storeId,
    quantity,
    aisle: quantity > 0 ? aisleCode : undefined,
    onOrder,
  };
}

export function getStockForProduct(productId: string, storeId: string): StockEntry | undefined {
  const entry = stockEntries.find((s) => s.productId === productId && s.storeId === storeId);
  if (entry) return entry;
  // Fallback : stock généré à la volée pour les produits filler
  return computeDynamicStock(productId, storeId);
}

export function getProductStock(productId: string, storeId: string): { status: StockStatus; quantity: number; aisle?: string } {
  const entry = getStockForProduct(productId, storeId);
  const qty = entry?.quantity ?? 0;
  if (qty === 0) {
    if (entry?.onOrder) return { status: 'on-order', quantity: 0 };
    return { status: 'unavailable', quantity: 0 };
  }
  if (qty <= 2) return { status: 'last-unit', quantity: qty, aisle: entry?.aisle };
  return { status: 'in-stock', quantity: qty, aisle: entry?.aisle };
}

/** Distance haversine en km entre deux points */
export function haversineKm(latA: number, lngA: number, latB: number, lngB: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(latB - latA);
  const dLng = toRad(lngB - lngA);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Distance entre deux magasins (km, arrondi à 1 décimale) */
export function distanceBetweenStores(storeIdA: string, storeIdB: string): number {
  const a = stores.find((s) => s.id === storeIdA);
  const b = stores.find((s) => s.id === storeIdB);
  if (!a || !b) return Infinity;
  return Math.round(haversineKm(a.lat, a.lng, b.lat, b.lng) * 10) / 10;
}

export function getOtherStoresWithStock(
  productId: string,
  excludeStoreId: string
): (Store & { quantity: number; distanceKm: number })[] {
  return stores
    .filter((s) => s.id !== excludeStoreId)
    .map((store) => {
      const entry = getStockForProduct(productId, store.id);
      return {
        ...store,
        quantity: entry?.quantity ?? 0,
        distanceKm: distanceBetweenStores(excludeStoreId, store.id),
      };
    })
    .filter((s) => s.quantity > 0)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function getEquivalentProducts(productId: string): Product[] {
  const product = products.find((p) => p.id === productId);
  if (!product?.equivalentIds) return [];
  return product.equivalentIds.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
}

export function getAvailableEquivalentsInStore(productId: string, storeId: string): Product[] {
  return getEquivalentProducts(productId).filter((p) => {
    const stock = getProductStock(p.id, storeId);
    return stock.status === 'in-stock' || stock.status === 'last-unit';
  });
}

export function getSubcriteriaForCategory(categoryId: string): SubCriterion[] {
  return subcriteria.filter((sc) => sc.categoryId === categoryId);
}

export function getProductsForSubcriteria(subcriteriaId: string): Product[] {
  return products.filter((p) => p.subcriteriaId === subcriteriaId);
}

export function countProductsInCategory(categoryId: string): number {
  return products.filter((p) => p.categoryId === categoryId).length;
}

export const mockVehicle: Vehicle = {
  plate: 'AB-123-CD',
  model: 'Peugeot 208 (2019)',
};

// ═══════════════════════════════════════════════════════════
//  IMAGES PRODUITS — SVG locaux
// ═══════════════════════════════════════════════════════════

/** Map explicite produit → SVG local */
const PRODUCT_SVG: Record<string, string> = {
  // Ampoules
  'p-h7-bosch': '/ampoule-h7.svg',
  'p-h7-autobacs-plus': '/ampoule-h7.svg',
  'p-h4-bosch': '/ampoule-h7.svg',
  'p-h1-bosch': '/ampoule-h7.svg',
  'p-w5w-autobacs': '/ampoule-w5w.svg',
  'p-p21w-bosch': '/ampoule-w5w.svg',

  // Essuie-glaces
  'p-wiper-aerotwin-600': '/essuie-glace.svg',
  'p-wiper-autobacs-600': '/essuie-glace.svg',
  'p-wiper-aerotwin-475': '/essuie-glace.svg',
  'p-wiper-rear-h301': '/essuie-glace.svg',
  'p-wiper-winter': '/essuie-glace.svg',

  // Batteries
  'p-bat-s3': '/batterie.svg',
  'p-bat-s4-autobacs': '/batterie.svg',
  'p-bat-s4-bosch': '/batterie.svg',
  'p-bat-s5-diesel': '/batterie.svg',
  'p-bat-agm': '/batterie-agm.svg',
  'p-bat-cables': '/batterie.svg',

  // Huiles & fluides
  'p-oil-5w30-bosch': '/huile-moteur.svg',
  'p-oil-5w30-autobacs': '/huile-moteur.svg',
  'p-oil-5w40': '/huile-moteur.svg',
  'p-oil-0w30': '/huile-moteur.svg',
  'p-brake-fluid': '/huile-moteur.svg',

  // Pneus
  'p-tire-autobacs-205': '/pneu.svg',
  'p-tire-bosch-205': '/pneu.svg',
  'p-tire-195-15': '/pneu.svg',
  'p-tire-winter': '/pneu.svg',

  // Freinage
  'p-pads-bosch-front': '/plaquette-frein.svg',
  'p-pads-autobacs-front': '/plaquette-frein.svg',
  'p-disc-front': '/disque-frein.svg',
  'p-brake-kit': '/disque-frein.svg',

  // Filtres
  'p-filter-oil-bosch': '/filtre-huile.svg',
  'p-filter-air-bosch': '/filtre-air.svg',
  'p-filter-cabin': '/filtre-habitacle.svg',
  'p-filter-kit': '/kit-revision.svg',

  // Échappement
  'p-exhaust-rear': '/silencieux.svg',
  'p-exhaust-cat': '/silencieux.svg',
  'p-exhaust-paste': '/silencieux.svg',

  // Distribution
  'p-belt-access': '/courroie-distribution.svg',
  'p-belt-kit': '/courroie-distribution.svg',
  'p-alternator': '/courroie-distribution.svg',
  'p-starter': '/courroie-distribution.svg',
};

/** SVG par défaut par catégorie (si le produit n'a pas de map explicite) */
const CATEGORY_FALLBACK_SVG: Record<string, string> = {
  lighting: '/ampoule-h7.svg',
  wipers: '/essuie-glace.svg',
  batteries: '/batterie.svg',
  fluids: '/huile-moteur.svg',
  tires: '/pneu.svg',
  brakes: '/disque-frein.svg',
  filters: '/filtre-huile.svg',
  exhaust: '/silencieux.svg',
  distribution: '/courroie-distribution.svg',
  accessories: '/autobacs-logo.svg',
};

/** Silhouettes SVG par catégorie — chaque produit hérite, la couleur change selon la marque */
const CATEGORY_SHAPES: Record<string, string> = {
  lighting: `<path d="M100 50 Q78 68 78 95 Q78 117 94 127 L94 142 L106 142 L106 127 Q122 117 122 95 Q122 68 100 50Z" fill="{af}" stroke="{ac}" stroke-width="2.5"/><rect x="90" y="142" width="20" height="8" fill="{ac}"/>`,
  batteries: `<rect x="52" y="62" width="96" height="78" rx="5" fill="{af}" stroke="{ac}" stroke-width="2.5"/><rect x="68" y="52" width="16" height="12" fill="{ac}"/><rect x="116" y="52" width="16" height="12" fill="{ac}"/><text x="80" y="112" fill="{ac}" font-size="26" font-family="Arial" font-weight="bold">+</text><text x="114" y="112" fill="{ac}" font-size="26" font-family="Arial" font-weight="bold">−</text>`,
  wipers: `<line x1="45" y1="75" x2="160" y2="135" stroke="{af2}" stroke-width="10" stroke-linecap="round"/><line x1="42" y1="72" x2="158" y2="132" stroke="{ac}" stroke-width="2.5"/><circle cx="42" cy="72" r="4" fill="{ac}"/>`,
  fluids: `<rect x="72" y="58" width="56" height="96" rx="5" fill="{af}" stroke="{ac}" stroke-width="2.5"/><rect x="88" y="46" width="24" height="14" fill="{ac}"/><rect x="78" y="90" width="44" height="22" fill="#fff" fill-opacity="0.04" stroke="{ac}" stroke-width="1"/><text x="100" y="106" text-anchor="middle" fill="{ac}" font-size="10" font-family="Arial" font-weight="bold">5W-30</text>`,
  tires: `<circle cx="100" cy="100" r="50" fill="none" stroke="{ac}" stroke-width="10"/><circle cx="100" cy="100" r="22" fill="{af}" stroke="{ac}" stroke-width="2"/><circle cx="100" cy="100" r="6" fill="{ac}"/><g stroke="{ac}" stroke-width="2" opacity="0.6"><line x1="100" y1="60" x2="100" y2="70"/><line x1="100" y1="130" x2="100" y2="140"/><line x1="60" y1="100" x2="70" y2="100"/><line x1="130" y1="100" x2="140" y2="100"/></g>`,
  brakes: `<circle cx="100" cy="100" r="48" fill="none" stroke="{ac}" stroke-width="3"/><circle cx="100" cy="100" r="20" fill="{af}" stroke="{ac}" stroke-width="2"/><g stroke="{ac}" stroke-width="1.5" opacity="0.55"><line x1="100" y1="56" x2="100" y2="72"/><line x1="100" y1="128" x2="100" y2="144"/><line x1="56" y1="100" x2="72" y2="100"/><line x1="128" y1="100" x2="144" y2="100"/><line x1="71" y1="71" x2="82" y2="82"/><line x1="118" y1="82" x2="129" y2="71"/><line x1="71" y1="129" x2="82" y2="118"/><line x1="118" y1="118" x2="129" y2="129"/></g>`,
  filters: `<rect x="70" y="55" width="60" height="100" rx="28" fill="{af}" stroke="{ac}" stroke-width="2.5"/><g stroke="{ac}" stroke-width="1.2"><line x1="78" y1="70" x2="78" y2="140"/><line x1="90" y1="70" x2="90" y2="140"/><line x1="102" y1="70" x2="102" y2="140"/><line x1="114" y1="70" x2="114" y2="140"/><line x1="122" y1="70" x2="122" y2="140"/></g>`,
  exhaust: `<rect x="40" y="92" width="100" height="22" rx="11" fill="{af}" stroke="{ac}" stroke-width="2"/><rect x="132" y="82" width="42" height="42" rx="8" fill="{af}" stroke="{ac}" stroke-width="2.5"/><circle cx="153" cy="103" r="7" fill="{ac}" opacity="0.3"/>`,
  distribution: `<circle cx="70" cy="100" r="26" fill="none" stroke="{ac}" stroke-width="3"/><circle cx="130" cy="100" r="26" fill="none" stroke="{ac}" stroke-width="3"/><path d="M48 92 Q100 66 152 92 L152 108 Q100 134 48 108 Z" fill="{af}" stroke="{ac}" stroke-width="2"/><circle cx="70" cy="100" r="4" fill="{ac}"/><circle cx="130" cy="100" r="4" fill="{ac}"/>`,
  accessories: `<rect x="58" y="64" width="84" height="64" rx="6" fill="{af}" stroke="{ac}" stroke-width="2.5"/><circle cx="100" cy="96" r="14" fill="none" stroke="{ac}" stroke-width="2"/><circle cx="100" cy="96" r="4" fill="{ac}"/>`,
};

const CATEGORY_LABELS: Record<string, string> = {
  lighting: 'ÉCLAIRAGE', wipers: 'ESSUIE-GLACE', batteries: 'BATTERIE', fluids: 'FLUIDES',
  tires: 'PNEU', brakes: 'FREINAGE', filters: 'FILTRE', exhaust: 'ÉCHAPPEMENT',
  distribution: 'DISTRIBUTION', accessories: 'ACCESSOIRE',
};

function escapeSvgText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Génère un SVG data URI unique par produit (marque + catégorie + nom + réf) */
function buildProductImage(product: Product): string {
  const isAutobacs = product.brand === 'AUTOBACS';
  const ac = isAutobacs ? '#D9782D' : '#EA0016';
  const af = isAutobacs ? 'rgba(217,120,45,0.18)' : 'rgba(234,0,22,0.15)';
  const af2 = isAutobacs ? 'rgba(217,120,45,0.28)' : 'rgba(234,0,22,0.22)';
  const shape = (CATEGORY_SHAPES[product.categoryId] || CATEGORY_SHAPES.accessories)
    .replace(/\{ac\}/g, ac).replace(/\{af2\}/g, af2).replace(/\{af\}/g, af);
  const catLabel = CATEGORY_LABELS[product.categoryId] || 'PRODUIT';
  const name = escapeSvgText(product.name.length > 24 ? product.name.slice(0, 22) + '…' : product.name);
  const ref = escapeSvgText(product.reference);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<rect width="200" height="200" fill="#141414"/>
<rect x="0" y="0" width="200" height="22" fill="${ac}"/>
<text x="10" y="15" fill="#fff" font-family="Arial,sans-serif" font-size="11" font-weight="700">${product.brand}</text>
<text x="190" y="15" text-anchor="end" fill="#fff" font-family="Arial,sans-serif" font-size="9" opacity="0.8">${catLabel}</text>
${shape}
<rect x="0" y="158" width="200" height="42" fill="#0a0a0a"/>
<text x="100" y="174" text-anchor="middle" fill="#e5e5e5" font-family="Arial,sans-serif" font-size="11" font-weight="700">${name}</text>
<text x="100" y="190" text-anchor="middle" fill="${ac}" font-family="monospace" font-size="9" font-weight="600">${ref}</text>
</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Cache : on génère chaque SVG une seule fois au démarrage
const PRODUCT_IMAGE_CACHE: Record<string, string> = {};

/** Retourne le SVG data URI du produit (unique par marque+catégorie+nom+réf) */
export function getProductImage(productId: string): string {
  if (PRODUCT_IMAGE_CACHE[productId]) return PRODUCT_IMAGE_CACHE[productId];
  const product = products.find((p) => p.id === productId);
  if (!product) return '/autobacs-logo.svg';
  const img = buildProductImage(product);
  PRODUCT_IMAGE_CACHE[productId] = img;
  return img;
}

/** SVG d'une catégorie (pour accueil, navigation) */
export function getCategoryImage(categoryId: string): string {
  return CATEGORY_FALLBACK_SVG[categoryId] || '/autobacs-logo.svg';
}

// ═══════════════════════════════════════════════════════════
//  COMPATIBILITÉ PRODUITS ↔ VÉHICULES
// ═══════════════════════════════════════════════════════════

export interface VehicleInfo {
  brand: string;
  model?: string;
  fuelType?: string;
  year?: number;
}

/**
 * Mapping explicite : produit → critères de compatibilité
 * Si absent du map, le produit est considéré UNIVERSEL (compatible avec tous véhicules)
 */
const compatibilityMap: Record<string, string[]> = {
  // Batteries — par taille : citadines (45-60Ah) vs compactes (60-80Ah) vs diesel (80Ah+)
  'p-bat-s3':           ['PEUGEOT:208', 'CITROEN:C3', 'RENAULT:CLIO', 'VOLKSWAGEN:POLO', 'DACIA:SANDERO'],
  'p-bat-s4-autobacs':  ['PEUGEOT:308', 'RENAULT:MEGANE', 'VOLKSWAGEN:GOLF', 'CITROEN:C4', 'PEUGEOT:208', 'CITROEN:C3'],
  'p-bat-s4-bosch':     ['PEUGEOT:308', 'RENAULT:MEGANE', 'VOLKSWAGEN:GOLF', 'CITROEN:C4'],
  'p-bat-s5-diesel':    ['DIESEL'],
  'p-bat-agm':          ['ALL'],           // Start-Stop universel
  'p-bat-cables':       ['ALL'],           // accessoire universel

  // Huiles — par motorisation et gamme
  'p-oil-5w30-bosch':    ['ESSENCE', 'DIESEL'],
  'p-oil-5w30-autobacs': ['ESSENCE', 'DIESEL'],
  'p-oil-5w40':          ['ESSENCE', 'DIESEL'],
  'p-oil-0w30':          ['PEUGEOT', 'CITROEN', 'RENAULT', 'VOLKSWAGEN'],
  'p-brake-fluid':       ['ALL'],

  // Pneus — dimensions propres au modèle
  'p-tire-autobacs-205': ['PEUGEOT:308', 'RENAULT:MEGANE', 'VOLKSWAGEN:GOLF', 'CITROEN:C4'],
  'p-tire-bosch-205':    ['PEUGEOT:308', 'RENAULT:MEGANE', 'VOLKSWAGEN:GOLF', 'CITROEN:C4'],
  'p-tire-195-15':       ['PEUGEOT:208', 'RENAULT:CLIO', 'CITROEN:C3', 'VOLKSWAGEN:POLO', 'DACIA:SANDERO'],
  'p-tire-winter':       ['PEUGEOT:308', 'RENAULT:MEGANE', 'VOLKSWAGEN:GOLF'],

  // Freinage — par constructeur / modèle
  'p-pads-bosch-front':   ['PEUGEOT', 'CITROEN', 'RENAULT', 'DACIA'],
  'p-pads-autobacs-front':['ALL'],
  'p-disc-front':         ['PEUGEOT', 'CITROEN'],
  'p-brake-kit':          ['PEUGEOT', 'CITROEN'],

  // Filtres — l'habitacle/air/huile change selon constructeur
  'p-filter-oil-bosch':   ['ALL'],
  'p-filter-air-bosch':   ['PEUGEOT', 'CITROEN', 'RENAULT', 'VOLKSWAGEN'],
  'p-filter-cabin':       ['ALL'],
  'p-filter-kit':         ['PEUGEOT', 'CITROEN', 'RENAULT'],

  // Distribution — spécifique moteur
  'p-belt-access':        ['ALL'],
  'p-belt-kit':           ['PEUGEOT:208', 'RENAULT:CLIO', 'CITROEN:C3', 'PEUGEOT:308'],
  'p-alternator':         ['PEUGEOT', 'CITROEN', 'RENAULT'],
  'p-starter':            ['DIESEL'],

  // Échappement — par constructeur
  'p-exhaust-rear':       ['PEUGEOT', 'CITROEN', 'RENAULT'],
  'p-exhaust-cat':        ['ALL'],
  'p-exhaust-paste':      ['ALL'],

  // Ampoules / essuie-glaces / accessoires / sécurité → universel (non listés = ALL)
};

/**
 * Vérifie si un produit est compatible avec un véhicule donné.
 * Ordre de priorité : règle portée par le produit > règle dans compatibilityMap > universel.
 */
export function isProductCompatibleWithVehicle(productId: string, vehicle: VehicleInfo | null): boolean {
  if (!vehicle) return true;

  const product = productById.get(productId);
  // 1. Lire d'abord la règle portée par le produit (pour les produits générés)
  // 2. Sinon la règle explicite du compatibilityMap (pour les handcrafted)
  // 3. Sinon → universel par défaut
  const criteria = product?.compatibility ?? compatibilityMap[productId];
  if (!criteria || criteria.length === 0) return true;
  if (criteria.includes('ALL')) return true;

  const brand = vehicle.brand.toUpperCase();
  const model = vehicle.model?.toUpperCase();
  const fuel = vehicle.fuelType?.toUpperCase();

  return criteria.some((c) => {
    const parts = c.split(':');
    if (parts.length === 1) return parts[0] === brand || parts[0] === fuel;
    if (parts.length === 2) return parts[0] === brand && parts[1] === model;
    if (parts.length === 3) return parts[0] === brand && parts[1] === model && parts[2] === fuel;
    return false;
  });
}

/**
 * Retourne tous les produits compatibles avec un véhicule
 */
export function getProductsForVehicle(vehicle: VehicleInfo | null): Product[] {
  return products.filter((p) => isProductCompatibleWithVehicle(p.id, vehicle));
}

/**
 * Retourne les produits d'une catégorie compatibles avec un véhicule
 */
export function getCompatibleProductsInCategory(categoryId: string, vehicle: VehicleInfo | null): Product[] {
  return products.filter(
    (p) => p.categoryId === categoryId && isProductCompatibleWithVehicle(p.id, vehicle)
  );
}

// ═══════════════════════════════════════════════════════════
//  RECHERCHE D'ARTICLES
// ═══════════════════════════════════════════════════════════

/**
 * Recherche d'articles par nom, marque, référence, spec ou catégorie
 * @param query — chaîne de recherche
 * @param options — limiter à certaines catégories ou filtrer par véhicule
 */
export function searchProducts(
  query: string,
  options?: { categoryId?: string; vehicle?: VehicleInfo | null; limit?: number }
): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const keywords = q.split(/\s+/);

  let results = products.filter((p) => {
    const haystack = [
      p.name,
      p.brand,
      p.reference,
      p.specTagline,
      ...p.specs.map((s) => `${s.label} ${s.value}`),
    ]
      .join(' ')
      .toLowerCase();

    // Tous les mots-clés doivent être présents
    return keywords.every((kw) => haystack.includes(kw));
  });

  if (options?.categoryId) {
    results = results.filter((p) => p.categoryId === options.categoryId);
  }

  if (options?.vehicle) {
    results = results.filter((p) => isProductCompatibleWithVehicle(p.id, options.vehicle!));
  }

  if (options?.limit) {
    results = results.slice(0, options.limit);
  }

  return results;
}

/**
 * Suggestions rapides pour autocomplétion
 */
export function getSearchSuggestions(query: string, limit = 6): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const suggestions = new Set<string>();

  // Noms de produits
  products.forEach((p) => {
    if (p.name.toLowerCase().includes(q)) suggestions.add(p.name);
  });

  // Références
  products.forEach((p) => {
    if (p.reference.toLowerCase().includes(q)) suggestions.add(p.reference);
  });

  // Marques
  if ('autobacs'.includes(q)) suggestions.add('Autobacs');
  if ('bosch'.includes(q)) suggestions.add('Bosch');

  return Array.from(suggestions).slice(0, limit);
}

export function findProductByReference(reference: string): Product | undefined {
  const ref = reference.trim().toUpperCase();
  return products.find((p) => p.reference.toUpperCase() === ref);
}

