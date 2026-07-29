import React, { useState, useEffect } from "react";
import { 
  Building2, Home, Hotel, ShieldAlert, DollarSign, Clock, TrendingUp, Search, 
  Sparkles, SlidersHorizontal, Calculator, PhoneCall, HelpCircle, Mail, MessageSquare, 
  Plus, Edit2, Trash2, CheckCircle, FileSpreadsheet, Send, FileText, ChevronDown, Check, X, ShieldCheck,
  ChevronLeft, ChevronRight
} from "lucide-react";

export interface Property {
  id: string;
  name: string;
  type: string;
  category: string;
  location: string;
  imageUrl: string;
  imageUrls?: string[];
  price: number;
  durationMonths: number;
  expectedMonthlyProfit: number;
  expectedAnnualProfit: number;
  roiPercentage: number;
  description: string;
  status: "Available" | "Limited" | "Sold Out";
  features: string[];
  riskLevel: "Low" | "Medium" | "High";
}

interface Inquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  investmentAmount: number;
  propertyName: string;
  message: string;
  createdAt: string;
  status: "New" | "Contacted" | "Approved";
}

export const INITIAL_PROPERTIES: Property[] = [
  // 1. Luxury Apartments (5 properties)
  {
    id: "prop-1",
    name: "The Luminary Penthouse at Hudson Yards",
    type: "Penthouse Apartment",
    category: "Luxury Apartments",
    location: "10 Park Drive, Canary Wharf, London, E14 9GG, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/02dbb59f765cf0206e5862ca1f9ae318-cc_ft_384.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/716fbe0022ef63f43144ec4afa1c1b41-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/db2161cc9f5bf8f2a42dc07aa2fde03d-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/ec17155b3f14d7722a30f8e795816737-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/5241924bcec6361dc95a981850083fc3-cc_ft_768.webp"
    ],
    price: 1101000.00,
    durationMonths: 12,
    expectedMonthlyProfit: 16500.00,
    expectedAnnualProfit: 198000.00,
    roiPercentage: 18,
    description: "Premier active-listing penthouse in London's financial district. Boasts gold-standard high-rise insulation, floor-to-ceiling glass paneling, Wolf double oven culinary suite, and biometric elevator entry.",
    status: "Available",
    features: ["Central Park View", "Chef's Kitchen", "Private Elevator Key"],
    riskLevel: "Low"
  },
  {
    id: "prop-2",
    name: "The Lecount Luxury Tower Suite",
    type: "Desirable waterfront location",
    category: "2bd 2ba 1,259sqft",
    location: "One Hyde Park, Knightsbridge, London, SW1X 7LJ, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/2e4c5abe42d3e9ce972b0c2f1b2db581-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/6204c2a998c098d287182a3a4f64f017-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/be4dbe440bbe2bf74cbda17511e16f6a-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/a3a8d99e870b350c8ae5633949e58dbe-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/5566188a37fc6541da7478473ca9e5fe-cc_ft_384.webp"
    ],
    price: 642000.00,
    durationMonths: 12,
    expectedMonthlyProfit: 7200.00,
    expectedAnnualProfit: 86400.00,
    roiPercentage: 14,
    description: "Premium high-rise tower residence with panoramic views of the River Thames. Features premium European chef's kitchen, custom walnut flooring, and concierge biometric service.",
    status: "Available",
    features: ["Concierge Valet", "Chef's Kitchen", "Sound Views"],
    riskLevel: "Low"
  },
  {
    id: "prop-3",
    name: "Skyline Duplex",
    type: "Sovereign Executive Loft",
    category: "Studio+,1+baths,338+sqft ",
    location: "Principal Tower, Shoreditch, London, EC2A 2BA, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/6ae2cee36afb862f8df1176e1ff28bde-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/94556ac74796fb46162f303ec5a73506-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/aac816e410c3af4b2c2af343a627a93d-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/51dfc7d989062aef9c34fa3390cd27e7-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/3d7c986bd98c82fc82e0019ff095933b-cc_ft_768.webp"
    ],
    price: 100000,
    durationMonths: 18,
    expectedMonthlyProfit: 1416.83,
    expectedAnnualProfit: 25500.06,
    roiPercentage: 17,
    description: "Stunning active urban loft tailored for corporate finance directors. Features high-retention leases, ultra-fast smart climate regulation, private integrated media lounge, and a complete secure keycard interface.",
    status: "Available",
    features: ["Integrated Media Lab", "Automated HVAC Climate", "24/7 Security Entry"],
    riskLevel: "Low"
  },
  {
    id: "prop-4",
    name: "Downtown Bellevue Highrise Vista",
    type: "Duplex Rooftop Skyloft",
    category: "Luxury Apartments",
    location: "The Corniche, Albert Embankment, London, SE1 7SP, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/4d3ae044391d2e7bf9fdbcf7775df104-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/e5d94eb79148967e2c9e4414c50acc78-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/057d10ab6d4ff753137a017c5854e1a6-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/df4239e3895cedfd97a6fa8ffd4c4050-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/78e20c43834bda1b1814a0e4d3067372-cc_ft_768.webp"
    ],
    price: 85000,
    durationMonths: 24,
    expectedMonthlyProfit: 1416.66,
    expectedAnnualProfit: 17000,
    roiPercentage: 20,
    description: "Sensational modern skyloft providing panoramic views of London and the River Thames. Complete with modern smart home mesh network, motorized custom shades, and immediate high-end dining links.",
    status: "Limited",
    features: ["Smart Home Mesh", "Motorized Drapery", "Mountain Views"],
    riskLevel: "Medium"
  },
  {
    id: "prop-5",
    name: "Monaco Harbor-front Residences",
    type: "Harbor Boulevard Flat",
    category: "Luxury Apartments",
    location: "La Condamine, Monaco",
    imageUrl: "https://photos.zillowstatic.com/fp/cf3d301abb5ba2bbbbe0f4d2ea05ef8e-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/153de29dfc06c388b619c088d4c6bc4c-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/be69e6820feb92bf608b9d2cdbd43d65-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/071d63c48d07bbd61022f393cd9d82b1-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/3ea13c8e3d92be98b0c5c54dc3ea844a-cc_ft_768.webp"
    ],
    price: 180000,
    durationMonths: 36,
    expectedMonthlyProfit: 3750,
    expectedAnnualProfit: 45000,
    roiPercentage: 25,
    description: "Premium Grand Prix trackside flat delivering premium annual returns. High-status asset with zero local tax liability on corporate property yields, pre-matched with luxury tenancy logs.",
    status: "Sold Out",
    features: ["Grand Prix Views", "Sovereign Tax Waiver", "Marble Suite Bath"],
    riskLevel: "Low"
  },

  // 2. Family Houses for Rent (10 different houses)
  {
    id: "prop-6",
    name: "Westlake Mid-Century Residence",
    type: "Modern Family Estate",
    category: "Family Houses for Rent",
    location: "Edgbaston, Birmingham, B15 2TR, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/e4a48712bbbf403bfd4f909b81e5f4af-cc_ft_384.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/01bda3dc58192b07a871ede52368c551-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/f84db8a7f198ca20e6d60a30d8d2b6dc-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/d494fa0749ccedeb7f7d9975fed59ccb-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/f74a1dfef1f935e9d9385df5cb8ef508-cc_ft_768.webp"
    ],
    price: 12000,
    durationMonths: 12,
    expectedMonthlyProfit: 140,
    expectedAnnualProfit: 1680,
    roiPercentage: 14,
    description: "Active family house located in Birmingham's renowned Edgbaston district. Includes a massive fenced backyard, energy-saving high efficiency solar array, modern stone patio, and master chef's marble kitchen.",
    status: "Available",
    features: ["Fenced Play Yard", "Tesla Solar Arrays", "Marble Chef Island"],
    riskLevel: "Low"
  },
  {
    id: "prop-7",
    name: "Queen Anne Skyline Contemporary",
    type: "Suburban View Estate",
    category: "Family Houses for Rent",
    location: "Didsbury, Manchester, M20 2RG, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/88f7f09bf601a123fb29544c12c73994-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/6bd54992373b5f4bd945d84de146d13c-cc_ft_1536.webp",
      "https://photos.zillowstatic.com/fp/7a32a740d4823805430fe54e7fc66dd3-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/bee34ebbbc38caf5d3ed3ab4bd9a1890-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/624db6465e220446719c782c451ad1bb-cc_ft_768.webp"
    ],
    price: 18500,
    durationMonths: 12,
    expectedMonthlyProfit: 231.25,
    expectedAnnualProfit: 2775,
    roiPercentage: 15,
    description: "Outstanding contemporary residence offering views of the Manchester skyline. Features high-quality geothermal heating loops, premium redwood deck patio, and Level 2 EV charging station.",
    status: "Available",
    features: ["Skyline Views", "Geothermal Pump", "EV Supercharger"],
    riskLevel: "Low"
  },
  {
    id: "prop-8",
    name: "Inman Park Craftsman Cottage",
    type: "Craftsman Rental Home",
    category: "Family Houses for Rent",
    location: "Clifton, Bristol, BS8 3EQ, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/1d3b74b29f8e2166a894746d97c71473-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/895a46e3b4e0963d5c1d6f86dfb89d0c-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/a38276be019dfb04776417024f658d03-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/5bfdbc4eab424a49963cf7508e1793d4-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/52a64366c1691112e513529c1284068f-cc_ft_384.webp"
    ],
    price: 11000,
    durationMonths: 12,
    expectedMonthlyProfit: 119.16,
    expectedAnnualProfit: 1430,
    roiPercentage: 13,
    description: "Classic English cottage meticulously updated to model active listings. Retains original hand-restored mahogany flooring, premium smart automation network, and cozy breakfast porch.",
    status: "Available",
    features: ["Restored Mahogany", "Breakfast Porch", "Security Gates"],
    riskLevel: "Low"
  },
  {
    id: "prop-9",
    name: "Stonebriar Creek Luxury Manor",
    type: "Gated Brick Estate",
    category: "Family Houses for Rent",
    location: "Solihull, West Midlands, B91 3SB, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/3b4217054f6219bacf67303015497403-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/5f0a81e4341ca7e513e0f2b3c758c728-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/d2fcc2ef4567125db17db10c4470dac6-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/7f6d50cd348d23aff6f1011db3809004-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/3d836c98281fde8ec1af7ed9a618e250-cc_ft_768.webp"
    ],
    price: 24000,
    durationMonths: 12,
    expectedMonthlyProfit: 320,
    expectedAnnualProfit: 3840,
    roiPercentage: 16,
    description: "Magnificent gated brick estate in Solihull's exclusive private corridor. Highlights include a custom heated saltwater swimming facility, secure motorized entry, and top-tier luxury kitchen design.",
    status: "Limited",
    features: ["Saltwater Heated Pool", "Motorized Entry Gate", "Chef's Dual Range"],
    riskLevel: "Low"
  },
  {
    id: "prop-10",
    name: "Aspen Timber Peaks Chalet",
    type: "Mountain Timber Lodge",
    category: "Family Houses for Rent",
    location: "Windermere, Cumbria, LA23 1AR, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/c0fe8b463c475bf4c4f0b706a2904efe-cc_ft_384.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/12bc8d9b9892dd432cfa0a66b3cc05de-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/156978582ebd705e49decc7ebd9e9ad5-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/00c8b12ddad7af4192329021dbe9805d-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/69332adc90a64b736c9edf0a2ae2ebdb-cc_ft_384.webp"
    ],
    price: 32000,
    durationMonths: 18,
    expectedMonthlyProfit: 480,
    expectedAnnualProfit: 5760,
    roiPercentage: 18,
    description: "Cozy cedar-wood alpine ski lodge offering unmatched panoramic mountain views. Features cathedral timber trusses, dual floor-to-ceiling stone fireplaces, and automatic thermodynamic path heaters.",
    status: "Available",
    features: ["Ski-in High Ski-out", "Dual Stone Hearth", "Snow-Melting Path"],
    riskLevel: "Medium"
  },
  {
    id: "prop-11",
    name: "Silver Creek Valley Mansion",
    type: "Modern Two-Story Estate",
    category: "Family Houses for Rent",
    location: "Chipping Campden, Cotswolds, GL55 6AL, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/6200c357b4c7eaffbd3ca057e665246d-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/a978d7110369b8a77ea196d0fb709639-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/ab5479aa06598945fd302c36e1c99ceb-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/32d1e2889377078e9383a2fe55520e59-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/a0cc996b073f461f27bca3ed037e5c17-cc_ft_384.webp"
    ],
    price: 19500,
    durationMonths: 12,
    expectedMonthlyProfit: 243.75,
    expectedAnnualProfit: 2925,
    roiPercentage: 15,
    description: "Stunning active listing property sitting custom in Silver Creek Valley. Offers beautifully finishes on solid wood beams, insulated vehicle garage, and stable high-performing rental cash flow.",
    status: "Available",
    features: ["Insulated Dual Garage", "Cathedral Timber", "Integrated AV Mesh"],
    riskLevel: "Low"
  },
  {
    id: "prop-12",
    name: "Tampa Beachfront Coastal Cottage",
    type: "Deepwater Beach Cottage",
    category: "Family Houses for Rent",
    location: "Sandbanks, Poole, Dorset, BH13 7QQ, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/2e6f7ad6dc1cb55849f578f64f9c3e06-cc_ft_384.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/5ede843f46bc38048c08fcfb48c6240d-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/d723fb60ac294cc75731f39a43b5237c-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/7fabcb077d56dd7eb44ec70a1a01ab78-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/21533855440f5114abd8adb40c4e2975-cc_ft_768.webp"
    ],
    price: 14000,
    durationMonths: 12,
    expectedMonthlyProfit: 163.33,
    expectedAnnualProfit: 1960,
    roiPercentage: 14,
    description: "Exceptional beachfront cottage on deepwater slip. Outfitted with highly rated impact protective glass pane windows, screened lounge deck patio, custom dock landing, and automated smart locks.",
    status: "Available",
    features: ["Deepwater Boat Landing", "Impact Wind Glass", "Screened Lanai Room"],
    riskLevel: "Low"
  },
  {
    id: "prop-13",
    name: "Myers Park Colonial Residence",
    type: "Colonial Brick Mansion",
    category: "Family Houses for Rent",
    location: "Harrogate, North Yorkshire, HG1 2RE, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/f768f704c4762592597886f264a58184-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/259e5aaf7806ad4feb100feb29f70645-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/34e3fb4d05f50d55ca20a5c2b1d736ad-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/fa58ded598b90b7b64f164fcd4138f3d-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/49e2137f40b8c716417d10d73ddaa4ea-cc_ft_768.webp"
    ],
    price: 16500,
    durationMonths: 12,
    expectedMonthlyProfit: 192.50,
    expectedAnnualProfit: 2310,
    roiPercentage: 14,
    description: "Magnificent traditional colonial brick manor in historic Charlotte neighborhood. Offers giant mature shade trees, fully integrated multi-zone smart climate controls, and high community zoning safety.",
    status: "Limited",
    features: ["Colonial Brick Hearth", "Multi-Zone HVAC Grid", "Private Play Yard"],
    riskLevel: "Low"
  },
  {
    id: "prop-14",
    name: "North Scottsdale Eco-Oasis",
    type: "Low-Irrigation Modern villa",
    category: "Family Houses for Rent",
    location: "Hale, Altrincham, Cheshire, WA15 9ST, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/e1003ea01ad5edd41d1a9dbcc9eecdc7-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/6f86d3c34ccca5a1baf4336dfb085da3-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/c0cbb1dadcc615de3673cc2cd3c4a829-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/155d530becf48d40240044c18d003cc0-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/fed764280c48c2fb9b573deb261f3c92-cc_ft_384.webp"
    ],
    price: 17000,
    durationMonths: 12,
    expectedMonthlyProfit: 212.50,
    expectedAnnualProfit: 2550,
    roiPercentage: 15,
    description: "Immaculate desert architecture featuring custom xeriscaped landscape beds, motorized central sliding walls, integrated power walls, covered pool patio, and beautiful Scottsdale peak views.",
    status: "Available",
    features: ["Xeriscaped Grounds", "Motorized Sliding Glass", "Dual Tesla Storage"],
    riskLevel: "Low"
  },
  {
    id: "prop-15",
    name: "Naperville Woodside Heritage Home",
    type: "Craftsman Woodside Home",
    category: "Family Houses for Rent",
    location: "St Albans, Hertfordshire, AL1 3NF, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/c9d2004ec7e312b154f662bcb15558af-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/f795a6f061226b7167fc7c32d374ca2d-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/2c05c5c1537e2fb5ff1321f809010d44-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/3ceac940c5e1fb1bbdfda969dfced663-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/cc5bd9873cf15d751f00b65cf971eb27-cc_ft_384.webp"
    ],
    price: 9500,
    durationMonths: 12,
    expectedMonthlyProfit: 102.91,
    expectedAnnualProfit: 1235,
    roiPercentage: 13,
    description: "Charming family cottage styled specifically to match high-status listings. Has massive rear porch area, fully state-compliant mechanical systems, built-in security, and elite school zone coding.",
    status: "Available",
    features: ["Wrap-around Deck Patio", "Dual Car Garage", "Premium School Zone"],
    riskLevel: "Low"
  },

  // 3. Commercial Buildings (2 properties)
  {
    id: "prop-16",
    name: "Frankfurt Financial Centra Plaza",
    type: "Professional Business Tower",
    category: "Commercial Buildings",
    location: "Frankfurt, Germany",
    imageUrl: "https://photos.zillowstatic.com/fp/9bd79c2f214c6aa103bf9a2674f92d32-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/39348c864d22c71df6701480f30f32ed-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/a2da6cda0393c49b74dfcbee43f20084-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/1dd3e5d495761e7b7fe485d2fe251925-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/960d7111ab571bbde4b7a39a9d9aaa31-cc_ft_768.webp"
    ],
    price: 50000,
    durationMonths: 24,
    expectedMonthlyProfit: 1041.66,
    expectedAnnualProfit: 12500,
    roiPercentage: 25,
    description: "Commanding AAA-class business tower in Frankfurt's core banking region. Features LEED Gold certifications, central fiber networks, biometric turnstiles, and robust structural safety underwritten by international entities.",
    status: "Limited",
    features: ["LEED Gold Badge", "Integrated Mainframe", "Speed Gate Turnstiles"],
    riskLevel: "Low"
  },
  {
    id: "prop-17",
    name: "Boston Clinical & Life-Science Plaza",
    type: "Medical Grade Laboratory Block",
    category: "Commercial Buildings",
    location: "Mayfair, London, W1K 2AL, UK",
    imageUrl: "https://photos.zillowstatic.com/fp/bd841c169a4112c60ce24b3bcae6658b-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/57019d270c41fab1c45208bf221b707b-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/58c4d3b2f79a0e3efcd360f2c3126a89-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/1dcd3354e811b9dbc33feaacc27cf317-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/81d467bdcff9c217c723b8105d03e7bf-cc_ft_768.webp"
    ],
    price: 110000,
    durationMonths: 24,
    expectedMonthlyProfit: 2475,
    expectedAnnualProfit: 29700,
    roiPercentage: 27,
    description: "Premium bio-technology laboratory hub. Vetted for maximum mechanical air filtration structures, double grid backup generators, medical cleanrooms, and long-term research tenancies.",
    status: "Available",
    features: ["Clean Air HVAC Units", "Premium Dual Generators", "Modern Executive Suites"],
    riskLevel: "Low"
  },

  // 4. Luxury Villas (1 property)
  {
    id: "prop-18",
    name: "Villa Bellissimo Belvedere",
    type: "Historic Tuscan Hilltop Villa",
    category: "Luxury Villas",
    location: "Siena, Tuscany, Italy",
    imageUrl: "https://photos.zillowstatic.com/fp/63d3d4599f5803ddc2e9d62db4427c2d-cc_ft_768.webp",
    imageUrls: [
      "https://photos.zillowstatic.com/fp/e232c2ff237c552bf57c486dd2a6fdd0-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/51ef4bdf5d95590eff35b2790f3b1652-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/0b5f6c283ed098f48fce90add265e7de-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/63ddbe5e706ae8741a13f86162300cdf-cc_ft_768.webp"
    ],
    price: 100000,
    durationMonths: 36,
    expectedMonthlyProfit: 2916.66,
    expectedAnnualProfit: 35000,
    roiPercentage: 35,
    description: "Magnificent hilltop Tuscan estate including fully certified olive orchards, high-capacity underground secure storage, state-of-the-art climate cellar, and panoramic skyline views.",
    status: "Available",
    features: ["Olive Yard Yields", "Wine Cellar Lounge", "Panoramic Courtyard View"],
    riskLevel: "Medium"
  },

  // 5. Vehicle Investment Assets (2 properties)
  {
    id: "prop-19",
    name: "Sovereign Executive Mobility Fleet",
    type: "Luxury EV Transportation Block",
    category: "Vehicle Investment Assets",
    location: "Richmond, Surrey, TW10 6RF, UK",
    imageUrl: "https://www.usnews.com/object/image/0000019c-8c3f-d017-ab9c-dcff9a5f0000/p90625400-highres-bmw-z4-final-edition.jpg?update-time=1771879504193&size=responsive640&format=webp",
    imageUrls: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0DXr8VcEfoNPqu0B32x3Ka8LeV5UpfmUkM-D-ExQIqPs9vsjiTu69eps&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5vclduLAfmk_gMz3w79zTS420laBzHUaJOeSCjAWcRpGSJ-XGIAyhc46_&s=10",
      "https://www.usnews.com/object/image/0000019d-bcb3-d1f6-a9dd-bcf31ffe0000/bmw-i7-xdrive60-front-view-ak.jpg?update-time=1776987348758&size=responsive640&format=webp",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRumf8XYPl8Md084TBU9Jl47mUGMjNoVrrCeAiR_eK82giUwLpQ7BWDveb3&s=10"
    ],
    price: 20000,
    durationMonths: 12,
    expectedMonthlyProfit: 266.66,
    expectedAnnualProfit: 3200,
    roiPercentage: 16,
    description: "Highly stable tokenized fleet of executive mobility electric vehicles and luxury performance saloons. Equipped with active telemetry, liability protection models, and automatic speed dampers.",
    status: "Available",
    features: ["Active GPS Telemetry", "Comprehensive Insurance", "Remote Speed Limiters"],
    riskLevel: "Medium"
  },
  {
    id: "prop-20",
    name: "Valora Premium Cold-Chain Fleet",
    type: "Refrigerated Logistics Truck Fleet",
    category: "Vehicle Investment Assets",
    location: "Deansgate, Manchester, M3 4FN, UK",
    imageUrl: "https://images.contentstack.io/v3/assets/blt841b4ca1af1e88c6/bltcd4b0ed96801e345/60d3349dae0d50495b4f93f3/is-buying-18-wheeler-good-investment.jpg?auto=webp&format=pjpg&width=767",
    imageUrls: [
      "https://commercialfleetfinancing.com/wp-content/uploads/2024/12/Why-Financing-a-Box-Truck-is-a-Smart-Move-for-Small-Businesses.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRPfwptHzVVNiw6PgxlEa_k1tbHHo_9QcDAuQdMT1WcXQdHD87IEKOr9C3&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQamHdSTJmglZZlBiUoGKX3XbNU0f-i9Z1THwR_07fD4KNPDL1zdJTP4MY&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvshtLu8u6zppa7PdGj8fpyv0kvmPLnrp84avqeaDeGY4id6ctfP5O6gY&s=10"
    ],
    price: 45000,
    durationMonths: 12,
    expectedMonthlyProfit: 675,
    expectedAnnualProfit: 8100,
    roiPercentage: 18,
    description: "Premium heavy-cargo refrigerated transportation vehicles leased exclusively to national pharmaceutical suppliers. Provides highly robust asset yields regardless of broader standard retail indexes.",
    status: "Available",
    features: ["Pharmaceutical Leases", "Active Thermal Telemetry", "Sovereign Bond Coverage"],
    riskLevel: "Low"
  }
];

export function getPropertyImages(prop: Property): string[] {
  const defaultImages = [
    "https://photos.zillowstatic.com/fp/02dbb59f765cf0206e5862ca1f9ae318-cc_ft_384.webp",
    "https://photos.zillowstatic.com/fp/2e4c5abe42d3e9ce972b0c2f1b2db581-cc_ft_768.webp",
    "https://photos.zillowstatic.com/fp/e4a48712bbbf403bfd4f909b81e5f4af-cc_ft_384.webp",
    "https://photos.zillowstatic.com/fp/63d3d4599f5803ddc2e9d62db4427c2d-cc_ft_768.webp"
  ];
  if (!prop) {
    return defaultImages;
  }
  // If property explicitly has an array of imageUrls with at least 1 valid element, use that as base first, falling back to filling with default images
  const baseUrls = (prop.imageUrls || []).filter(url => url && url.trim().length > 0);
  if (baseUrls.length === 0 && prop.imageUrl && prop.imageUrl.trim().length > 0) {
    baseUrls.push(prop.imageUrl);
  }

  // Pools of high-quality images per category to guarantee each of the 20 properties has 4 unique stunning pictures!
  const categoryPools: Record<string, string[]> = {
    "Luxury Apartments": [
      "https://photos.zillowstatic.com/fp/02dbb59f765cf0206e5862ca1f9ae318-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/2e4c5abe42d3e9ce972b0c2f1b2db581-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/6ae2cee36afb862f8df1176e1ff28bde-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/4d3ae044391d2e7bf9fdbcf7775df104-cc_ft_768.webp"
    ],
    "Family Houses for Rent": [
      "https://photos.zillowstatic.com/fp/e4a48712bbbf403bfd4f909b81e5f4af-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/e1003ea01ad5edd41d1a9dbcc9eecdc7-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/c9d2004ec7e312b154f662bcb15558af-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/88f7f09bf601a123fb29544c12c73994-cc_ft_768.webp"
    ],
    "Commercial Buildings": [
      "https://photos.zillowstatic.com/fp/9bd79c2f214c6aa103bf9a2674f92d32-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/bd841c169a4112c60ce24b3bcae6658b-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/39348c864d22c71df6701480f30f32ed-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/1dd3e5d495761e7b7fe485d2fe251925-cc_ft_384.webp"
    ],
    "Luxury Villas": [
      "https://photos.zillowstatic.com/fp/63d3d4599f5803ddc2e9d62db4427c2d-cc_ft_768.webp",
      "https://photos.zillowstatic.com/fp/e232c2ff237c552bf57c486dd2a6fdd0-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/51ef4bdf5d95590eff35b2790f3b1652-cc_ft_384.webp",
      "https://photos.zillowstatic.com/fp/0b5f6c283ed098f48fce90add265e7de-cc_ft_384.webp"
    ],
    "Vehicle Investment Assets": [
      "https://www.usnews.com/object/image/0000019c-8c3f-d017-ab9c-dcff9a5f0000/p90625400-highres-bmw-z4-final-edition.jpg?update-time=1771879504193&size=responsive640&format=webp",
      "https://images.contentstack.io/v3/assets/blt841b4ca1af1e88c6/bltcd4b0ed96801e345/60d3349dae0d50495b4f93f3/is-buying-18-wheeler-good-investment.jpg?auto=webp&format=pjpg&width=767",
      "https://commercialfleetfinancing.com/wp-content/uploads/2024/12/Why-Financing-a-Box-Truck-is-a-Smart-Move-for-Small-Businesses.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0DXr8VcEfoNPqu0B32x3Ka8LeV5UpfmUkM-D-ExQIqPs9vsjiTu69eps&s=10"
    ]
  };

  const pool = categoryPools[prop.category] || categoryPools["Luxury Apartments"];

  // Merge baseUrls with pool elements to get exactly 4 images
  const finalUrls = [...baseUrls];
  for (let i = 0; i < 4; i++) {
    if (finalUrls.length >= 4) break;
    const poolImg = pool[i % pool.length];
    if (!finalUrls.includes(poolImg)) {
      finalUrls.push(poolImg);
    }
  }

  // Ensure exactly 4 items
  while (finalUrls.length < 4) {
    finalUrls.push(pool[finalUrls.length % pool.length]);
  }

  return finalUrls.slice(0, 4);
}

interface PropertyImageSliderProps {
  property: Property;
  statusTag?: React.ReactNode;
  roiTag?: React.ReactNode;
  titleOverlay?: React.ReactNode;
}

export function PropertyImageSlider({ property, statusTag, roiTag, titleOverlay }: PropertyImageSliderProps) {
  const images = getPropertyImages(property);
  const [activeIndex, setActiveIndex] = useState(0);

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex(index);
  };

  return (
    <div className="relative h-full w-full group/slider overflow-hidden">
      {/* Active Image */}
      <img
        src={images[activeIndex]}
        alt={`${property.name} - Image ${activeIndex + 1}`}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover transition-transform duration-500 group-hover/slider:scale-105"
      />

      {/* Hover Navigation arrows */}
      <button
        onClick={prevImage}
        type="button"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 border border-slate-800 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 focus:opacity-100 hover:bg-slate-900 transition-opacity duration-200 z-20 cursor-pointer shadow-lg"
        aria-label="Previous photo"
      >
        <ChevronLeft size={16} className="text-white" />
      </button>
      <button
        onClick={nextImage}
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 border border-slate-800 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 focus:opacity-100 hover:bg-slate-900 transition-opacity duration-200 z-20 cursor-pointer shadow-lg"
        aria-label="Next photo"
      >
        <ChevronRight size={16} className="text-white" />
      </button>

      {/* Bottom overlay & Gradient */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none z-10" />

      {/* Dot Indicators */}
      <div className="absolute bottom-3 right-4 flex items-center gap-1 z-20">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => goToImage(idx, e)}
            type="button"
            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
              idx === activeIndex
                ? "bg-brand-red w-3 shadow-md"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to photo ${idx + 1}`}
          />
        ))}
      </div>

      {/* Counter Tag */}
      <div className="absolute bottom-3 left-4 bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-slate-800/80 text-[8px] font-mono font-black text-slate-300 tracking-wider z-20 shadow">
        {activeIndex + 1} / {images.length}
      </div>

      {/* Slots */}
      {statusTag && <div className="absolute z-20">{statusTag}</div>}
      {roiTag && <div className="absolute z-20">{roiTag}</div>}
      {titleOverlay && <div className="absolute z-20 pointer-events-none">{titleOverlay}</div>}
    </div>
  );
}

export function InvestmentProperties({ dark }: { dark?: boolean }) {
  // Persistence state hooks Load with robust schema validation and error resilience
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem("valora_properties");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validated = parsed.filter(p => p && typeof p === "object" && p.id && p.name && typeof p.price === "number");
          if (validated.length > 0) {
            // Keep custom props created by the user (not in INITIAL_PROPERTIES)
            const customProperties = validated.filter(p => !INITIAL_PROPERTIES.some(ip => ip.id === p.id));
            // For core properties in INITIAL_PROPERTIES, merge them but prioritize codebase updates
            const mergedCoreProperties = INITIAL_PROPERTIES.map(coreProp => {
              const matchedProp = validated.find(p => p.id === coreProp.id);
              if (matchedProp) {
                return {
                  ...matchedProp,
                  name: coreProp.name,
                  type: coreProp.type,
                  category: coreProp.category,
                  location: coreProp.location,
                  imageUrl: coreProp.imageUrl,
                  imageUrls: coreProp.imageUrls,
                  price: coreProp.price,
                  durationMonths: coreProp.durationMonths,
                  expectedMonthlyProfit: coreProp.expectedMonthlyProfit,
                  expectedAnnualProfit: coreProp.expectedAnnualProfit,
                  roiPercentage: coreProp.roiPercentage,
                  description: coreProp.description,
                  features: coreProp.features,
                  riskLevel: coreProp.riskLevel
                };
              }
              return coreProp;
            });
            return [...mergedCoreProperties, ...customProperties];
          }
        }
      }
    } catch (e) {
      console.error("Valora: Failed core properties parse, falling back to default ledger deeds", e);
    }
    return INITIAL_PROPERTIES;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    try {
      const saved = localStorage.getItem("valora_property_inquiries");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(i => i && typeof i === "object" && i.id && (i.propertyName || i.propertyId || i.fullName));
        }
      }
    } catch (e) {
      console.error("Valora: Failed core inquiries parse, resetting local logs", e);
    }
    return [];
  });

  // State sync
  useEffect(() => {
    localStorage.setItem("valora_properties", JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem("valora_property_inquiries", JSON.stringify(inquiries));
  }, [inquiries]);

  // Dashboard Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "roi" | "duration">("roi");

  // Interaction Modals State
  const [selectedPropForInquiry, setSelectedPropForInquiry] = useState<Property | null>(null);
  const [selectedPropForCare, setSelectedPropForCare] = useState<Property | null>(null);
  const [inquiryFullName, setInquiryFullName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryAmount, setInquiryAmount] = useState<number>(0);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Yield Calculator Widget State
  const [calcProperty, setCalcProperty] = useState<Property | null>(null);
  const [customCalcAmount, setCustomCalcAmount] = useState<string>("");
  const [calcTermOverride, setCalcTermOverride] = useState<number>(12);

  // Administrative Panel Unlock State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPassphrase, setAdminPassphrase] = useState("");
  const [adminError, setAdminError] = useState("");

  // Create Property state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  
  // New/Edit Temp Form
  const [newPropName, setNewPropName] = useState("");
  const [newPropType, setNewPropType] = useState("");
  const [newPropCategory, setNewPropCategory] = useState<Property["category"]>("Luxury Apartments");
  const [newPropLocation, setNewPropLocation] = useState("");
  const [newPropImg, setNewPropImg] = useState("");
  const [newPropImg2, setNewPropImg2] = useState("");
  const [newPropImg3, setNewPropImg3] = useState("");
  const [newPropImg4, setNewPropImg4] = useState("");
  const [newPropPrice, setNewPropPrice] = useState("15000");
  const [newPropDuration, setNewPropDuration] = useState("12");
  const [newPropROI, setNewPropROI] = useState("15");
  const [newPropDesc, setNewPropDesc] = useState("");
  const [newPropStatus, setNewPropStatus] = useState<Property["status"]>("Available");
  const [newPropFeatures, setNewPropFeatures] = useState("");
  const [newPropRisk, setNewPropRisk] = useState<Property["riskLevel"]>("Low");

  // Auto-Fill Calculation helper inside the Form
  const tempPrice = parseFloat(newPropPrice) || 0;
  const tempROI = parseFloat(newPropROI) || 0;
  const computedAnnual = Math.round(tempPrice * (tempROI / 100));
  const computedMonthly = Math.round(computedAnnual / 12);

  const resetCreateForm = () => {
    setNewPropName("");
    setNewPropType("");
    setNewPropCategory("Luxury Apartments");
    setNewPropLocation("");
    setNewPropImg("");
    setNewPropImg2("");
    setNewPropImg3("");
    setNewPropImg4("");
    setNewPropPrice("15000");
    setNewPropDuration("12");
    setNewPropROI("15");
    setNewPropDesc("");
    setNewPropStatus("Available");
    setNewPropFeatures("");
    setNewPropRisk("Low");
    setEditingProperty(null);
  };

  const handleOpenEdit = (prop: Property) => {
    setEditingProperty(prop);
    setNewPropName(prop.name);
    setNewPropType(prop.type);
    setNewPropCategory(prop.category);
    setNewPropLocation(prop.location);
    const resolvedImgs = getPropertyImages(prop);
    setNewPropImg(resolvedImgs[0] || prop.imageUrl || "");
    setNewPropImg2(resolvedImgs[1] || "");
    setNewPropImg3(resolvedImgs[2] || "");
    setNewPropImg4(resolvedImgs[3] || "");
    setNewPropPrice(prop.price.toString());
    setNewPropDuration(prop.durationMonths.toString());
    setNewPropROI(prop.roiPercentage.toString());
    setNewPropDesc(prop.description);
    setNewPropStatus(prop.status);
    setNewPropFeatures(prop.features.join(", "));
    setNewPropRisk(prop.riskLevel);
    setShowCreateModal(true);
  };

  // Save/Create handler
  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const priceVal = parseFloat(newPropPrice) || 10000;
    const durationVal = parseInt(newPropDuration) || 12;
    const roiVal = parseFloat(newPropROI) || 10;
    const annualVal = Math.round(priceVal * (roiVal / 100));
    const monthlyVal = Math.round(annualVal / 12);

    const imageUrlFallback = newPropImg.trim() || "https://photos.zillowstatic.com/fp/02dbb59f765cf0206e5862ca1f9ae318-cc_ft_384.webp";

    const featuresArr = newPropFeatures
      .split(",")
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const updatedProperty: Property = {
      id: editingProperty ? editingProperty.id : `prop-${Date.now()}`,
      name: newPropName,
      type: newPropType || "Premium Asset",
      category: newPropCategory,
      location: newPropLocation || "Sovereign Custody",
      imageUrl: imageUrlFallback,
      imageUrls: [
        imageUrlFallback,
        newPropImg2.trim() || "",
        newPropImg3.trim() || "",
        newPropImg4.trim() || ""
      ].filter(u => u.length > 0),
      price: priceVal,
      durationMonths: durationVal,
      expectedMonthlyProfit: monthlyVal,
      expectedAnnualProfit: annualVal,
      roiPercentage: roiVal,
      description: newPropDesc || "A secure sovereign backing asset tailored by Valora Financial.",
      status: newPropStatus,
      features: featuresArr.length > 0 ? featuresArr : ["Dynamic Yield", "Tax Insulated", "Premium Custody"],
      riskLevel: newPropRisk
    };

    if (editingProperty) {
      setProperties(prev => prev.map(p => p.id === editingProperty.id ? updatedProperty : p));
    } else {
      setProperties(prev => [updatedProperty, ...prev]);
    }

    setShowCreateModal(false);
    resetCreateForm();
  };

  // Delete property
  const handleDeleteProperty = (id: string) => {
    if (window.confirm("Are you sure you want to retire this property asset?")) {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  // Admin Verification
  const handleVerifyAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassphrase.toLowerCase() === "valora2026" || adminPassphrase.trim() === "admin") {
      setIsAdminUnlocked(true);
      setAdminError("");
    } else {
      setAdminError("Invalid sovereign administrator keycode.");
    }
  };

  // Handle inquiry submit
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropForInquiry) return;

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      fullName: inquiryFullName,
      email: inquiryEmail,
      phone: inquiryPhone,
      investmentAmount: inquiryAmount || selectedPropForInquiry.price,
      propertyName: selectedPropForInquiry.name,
      message: inquiryMessage,
      createdAt: new Date().toLocaleString(),
      status: "New"
    };

    setInquiries(prev => [newInquiry, ...prev]);
    setInquirySuccess(true);

    // Dispatch custom automated emailing protocol
    console.log(`SECURE OUTBOX INTERFACE: Sending premium notifications directly to investments@valorafinancialbank.com regarding Property: ${selectedPropForInquiry.name}`);

    setTimeout(() => {
      setInquirySuccess(false);
      setSelectedPropForInquiry(null);
      // Clear inputs
      setInquiryFullName("");
      setInquiryEmail("");
      setInquiryPhone("");
      setInquiryAmount(0);
      setInquiryMessage("");
    }, 2500);
  };

  // Custom yield parameters compute
  const selectedCalculatorAsset = calcProperty || properties[0] || null;
  const userPrincipalInput = customCalcAmount ? parseFloat(customCalcAmount) : selectedCalculatorAsset ? selectedCalculatorAsset.price : 10000;
  
  const estimatedAnnualYield = selectedCalculatorAsset 
    ? userPrincipalInput * (selectedCalculatorAsset.roiPercentage / 100) 
    : userPrincipalInput * 0.15;
  const estimatedMonthlyYield = estimatedAnnualYield / 12;
  const totalMaturityValue = userPrincipalInput + (estimatedAnnualYield * ((calcTermOverride || (selectedCalculatorAsset ? selectedCalculatorAsset.durationMonths : 12)) / 12));

  // CSV Export Trigger
  const exportInquiryCSV = () => {
    if (inquiries.length === 0) {
      alert("No inquiry records to export.");
      return;
    }
    const headers = ["ID", "Client Name", "Email", "Phone", "Target Property", "Investment Capital Required", "Date Created", "Status"];
    const rows = inquiries.map(i => [
      i.id,
      i.fullName,
      i.email,
      i.phone,
      i.propertyName,
      `$${i.investmentAmount}`,
      i.createdAt,
      i.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `valora_inquiries_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sync / select template properties for widget
  const handleSelectToCalculate = (prop: Property) => {
    setCalcProperty(prop);
    setCustomCalcAmount(prop.price.toString());
    setCalcTermOverride(prop.durationMonths);
    
    // Smooth scroll down to the calculator widget
    const element = document.getElementById("yield-estimator-panel");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Filtering filter logic
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesRisk = riskFilter === "All" || p.riskLevel === riskFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesRisk;
  });

  // Sort logic order
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "roi") return b.roiPercentage - a.roiPercentage;
    if (sortBy === "duration") return a.durationMonths - b.durationMonths;
    return 0;
  });

  // Category tags count for counters
  const getCategoryCount = (catName: string) => {
    if (catName === "All") return properties.length;
    return properties.filter(p => p.category === catName).length;
  };

  return (
    <div className={`py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 ${dark ? "text-slate-100" : "text-slate-800"}`}>
      
      {/* HEADER HERO */}
      <div className={`relative rounded-[2.5rem] overflow-hidden border ${
        dark 
          ? "bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-brand-red/30" 
          : "bg-gradient-to-br from-slate-50 via-white to-slate-50 border-slate-200"
      } shadow-2xl`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(192,57,43,0.12),transparent_50%)]" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/10 border border-brand-red/30 text-[10px] font-black uppercase tracking-[0.15em] text-brand-red">
            <Sparkles size={12} className="animate-pulse" /> Custom Sovereign Marketplace
          </span>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"} leading-[1.1]`}>
            Valora Property <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C0392B] via-red-500 to-[#A93226]">Investment Portal</span>
          </h1>
          <p className={`text-xs sm:text-sm ${dark ? "text-slate-300" : "text-slate-650 text-slate-600"} leading-relaxed font-semibold max-w-2xl`}>
            Acquire fractional corporate rights or full custody real estate assets with pre-vetted legal routes, triple-net guarantees, and continuous USD yield disbursement mapped directly to your sovereign banking ledger checks.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl ${dark ? "bg-slate-900/40 border-slate-800" : "bg-slate-100 border-slate-200"} backdrop-blur-sm`}>
              <TrendingUp size={16} className="text-emerald-500 dark:text-emerald-400" />
              <div className="text-left">
                <span className={`text-[8px] uppercase font-bold ${dark ? "text-slate-400" : "text-slate-500"} block tracking-wider`}>Average Portfolio ROI</span>
                <span className={`text-xs font-black font-mono ${dark ? "text-white" : "text-slate-900"}`}>18.42% Net APR</span>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl ${dark ? "bg-slate-900/40 border-slate-800" : "bg-slate-100 border-slate-200"} backdrop-blur-sm`}>
              <ShieldCheck size={16} className="text-brand-red" />
              <div className="text-left">
                <span className={`text-[8px] uppercase font-bold ${dark ? "text-slate-400" : "text-slate-500"} block tracking-wider`}>Custody Integrity</span>
                <span className={`text-xs font-black font-mono ${dark ? "text-white" : "text-slate-900"}`}>UK FSCS Gilt Cover</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED / HOT DEALS HIGHLIGHTS */}
      <div className="space-y-4">
        <div className={`flex flex-wrap items-end justify-between gap-4 border-b ${dark ? "border-slate-800" : "border-slate-200"} pb-3`}>
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Yield Spotlights</span>
            <h2 className={`text-xl sm:text-2xl font-black uppercase ${dark ? "text-white" : "text-slate-900"}`}>Featured High-ROI Placements</h2>
          </div>
          <span className={`text-[10px] uppercase font-mono font-black ${dark ? "text-slate-400" : "text-slate-500"}`}>Sovereign Clearance Category A</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.slice(0, 3).map((fProp) => (
            <div 
              key={`feat-${fProp.id}`}
              className={`group relative rounded-3xl border p-5 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-md ${
                dark 
                  ? "border-brand-red/20 bg-slate-950 hover:border-brand-red/40" 
                  : "border-slate-200 bg-white hover:border-brand-red/30"
              }`}
            >
              <div className="absolute top-0 right-0 py-1.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-bl-2xl shadow-md z-10">
                ⭐ {fProp.roiPercentage}% APY Focus
              </div>
              
              <div className="space-y-4">
                <div className="h-64 sm:h-44 w-full rounded-2xl overflow-hidden relative">
                  <PropertyImageSlider 
                    property={fProp}
                    titleOverlay={
                      <div className="absolute bottom-4 left-4 text-left">
                        <span className="px-2.5 py-1 bg-brand-red text-white rounded-lg text-[8.5px] uppercase font-black">{fProp.category}</span>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight mt-1">{fProp.name}</h3>
                      </div>
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-left">
                  <div className={`p-2.5 rounded-xl border ${dark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className={`text-[8px] ${dark ? "text-slate-400" : "text-slate-500"} uppercase tracking-wider block`}>Custody Cost</span>
                    <span className="font-extrabold text-brand-red">${fProp.price.toLocaleString()}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${dark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className={`text-[8px] ${dark ? "text-slate-400" : "text-slate-500"} uppercase tracking-wider block`}>Lock Duration</span>
                    <span className={`font-extrabold ${dark ? "text-emerald-400" : "text-emerald-600"}`}>{fProp.durationMonths} Months</span>
                  </div>
                </div>
              </div>

              <div className={`pt-4 mt-4 border-t ${dark ? "border-slate-800" : "border-slate-100"} flex items-center justify-between`}>
                <button
                  type="button"
                  onClick={() => handleSelectToCalculate(fProp)}
                  className="px-3.5 py-2 text-[10px] uppercase font-black rounded-lg border border-brand-red/40 text-brand-red hover:bg-[#C0392B]/10 cursor-pointer transition-all"
                >
                  Project ROI
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPropForInquiry(fProp)}
                  className="px-3.5 py-2 text-[10px] uppercase font-black rounded-lg bg-brand-red hover:bg-[#A93226] text-white shadow-md shadow-red-500/10 cursor-pointer transition-all"
                >
                  Quick Inquiry
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DASHBOARD CONTROLS */}
      <div id="marketplace-search-area" className={`p-6 sm:p-8 rounded-[2rem] border ${dark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200 shadow-sm"} space-y-6`}>
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[#C0392B]" />
            <h3 className="text-sm font-black uppercase tracking-wider">Search & Filter Ledger Assets</h3>
          </div>
          <span className="font-mono text-[10.5px] font-bold text-brand-red">Total Cleared Properties: {sortedProperties.length} of {properties.length}</span>
        </div>

        {/* Filters Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Query Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search Manhattan, Luxury Villa, Car Fleet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full p-2.5 pl-10 rounded-xl outline-none font-bold text-xs border ${
                dark ? "bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-brand-red" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-brand-red"
              }`}
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black text-slate-400 shrink-0">Sort</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className={`w-full p-2.5 rounded-xl border font-bold text-xs outline-none ${
                dark ? "bg-slate-950 border-slate-800 text-white focus:border-brand-red" : "bg-slate-50 border-slate-200 text-slate-905 text-slate-900 focus:border-brand-red"
              }`}
            >
              <option value="roi">ROI Percentage (Highest)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="duration">Lock Duration (Shortest)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black text-slate-400 shrink-0">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full p-2.5 rounded-xl border font-bold text-xs outline-none ${
                dark ? "bg-slate-950 border-slate-800 text-white focus:border-brand-red" : "bg-slate-50 border-slate-200 text-slate-905 text-slate-900 focus:border-brand-red"
              }`}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available Only</option>
              <option value="Limited">Limited Remaining</option>
              <option value="Sold Out">Sold Out</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black text-slate-400 shrink-0">Risk</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className={`w-full p-2.5 rounded-xl border font-bold text-xs outline-none ${
                dark ? "bg-slate-950 border-slate-800 text-white focus:border-brand-red" : "bg-slate-50 border-slate-200 text-slate-905 text-slate-900 focus:border-brand-red"
              }`}
            >
              <option value="All">All Risk Indexes</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">Sovereign Vault High</option>
            </select>
          </div>

        </div>

        {/* Category horizontal scrolling filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/30 dark:border-slate-800/30">
          <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-400 mr-2">Property Category:</span>
          {[
            { label: "All Assets", id: "All" },
            { label: "Luxury Apartments", id: "Luxury Apartments" },
            { label: "Houses for Rent", id: "Family Houses for Rent" },
            { label: "Commercial plazas", id: "Commercial Buildings" },
            { label: "Luxury Villas", id: "Luxury Villas" },
            { label: "Vehicle Fleets", id: "Vehicle Investment Assets" }
          ].map((catTab) => (
            <button
              key={catTab.id}
              onClick={() => setCategoryFilter(catTab.id)}
              className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                categoryFilter === catTab.id
                  ? "bg-brand-red text-white shadow-md"
                  : dark
                    ? "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-850"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {catTab.label} <span className="text-[8px] opacity-70">({getCategoryCount(catTab.id)})</span>
            </button>
          ))}
        </div>

      </div>

      {/* INVESTMENT PROPERTIES LISTING GRID - Displays 20 properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedProperties.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 space-y-2 border border-dashed border-slate-800 rounded-3xl">
            <HelpCircle size={32} className="mx-auto text-slate-600 animate-bounce" />
            <p className="font-extrabold uppercase text-xs tracking-wider">No Sovereign Property Matches Found</p>
            <p className="text-[10px] text-slate-500 max-w-sm mx-auto">Modify your filters or searching parameters inside the digital dashboard to view archived bank clearing deeds.</p>
          </div>
        ) : (
          sortedProperties.map((prop) => {
            const riskColors = {
              Low: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[8px]",
              Medium: "bg-amber-500/10 border-amber-500/30 text-amber-400 text-[8px]",
              High: "bg-rose-500/10 border-rose-500/30 text-rose-400 text-[8px]"
            };

            const statusColors = {
              Available: "bg-brand-red text-white",
              Limited: "bg-amber-500 text-slate-950",
              "Sold Out": "bg-slate-800 text-slate-400"
            };

            return (
              <div 
                key={prop.id} 
                className={`flex flex-col justify-between overflow-hidden rounded-[2rem] border transition-all duration-300 hover:-translate-y-1.5 group ${
                  dark 
                    ? "bg-slate-900/60 border-slate-850 hover:border-brand-red/40" 
                    : "bg-white border-slate-200 shadow-md hover:shadow-xl"
                }`}
              >
                {/* Image Section */}
                <div className="relative h-64 sm:h-48 w-full overflow-hidden">
                  <PropertyImageSlider 
                    property={prop}
                    statusTag={
                      <span className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-md ${statusColors[prop.status]}`}>
                        {prop.status}
                      </span>
                    }
                    roiTag={
                      <div className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur-md border border-[#C0392B]/40 px-3 py-1 rounded-xl text-center shadow-lg">
                        <span className="text-[8px] text-brand-red uppercase font-black block tracking-widest leading-none">Net ROI</span>
                        <span className="font-mono text-xs font-black text-white">{prop.roiPercentage}%</span>
                      </div>
                    }
                    titleOverlay={
                      <div className="absolute bottom-4 left-4 text-left">
                        <span className="text-[10px] text-brand-red uppercase font-extrabold tracking-wider">{prop.type}</span>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1">{prop.name}</h3>
                      </div>
                    }
                  />
                </div>

                {/* Info Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3.5 text-left">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" /> {prop.location}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border font-mono ${riskColors[prop.riskLevel]}`}>
                        {prop.riskLevel} Risk
                      </span>
                    </div>

                    <p className={`text-xs leading-normal font-medium line-clamp-3 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                      {prop.description}
                    </p>

                    {/* Features block */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(prop.features || []).map((feat, fIdx) => (
                        <span key={fIdx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950/80 border border-slate-205/30 dark:border-slate-850/60 text-[9px] font-bold text-slate-400 uppercase">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Calculations breakdown block */}
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-200/50 dark:border-slate-800/60 pt-4 font-mono">
                    <div className="text-left bg-slate-100/30 dark:bg-slate-950 p-2 rounded-xl border border-slate-200/30 dark:border-slate-850">
                      <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-normal">Buy Price</span>
                      <strong className="text-xs font-black text-brand-red">${(prop.price || 0).toLocaleString()}</strong>
                    </div>
                    <div className="text-left bg-slate-100/30 dark:bg-slate-950 p-2 rounded-xl border border-slate-200/30 dark:border-slate-850">
                      <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-normal">Est. Monthly</span>
                      <strong className="text-xs font-black text-emerald-400">${(prop.expectedMonthlyProfit || 0).toLocaleString()}</strong>
                    </div>
                    <div className="text-left bg-slate-100/30 dark:bg-slate-950 p-2 rounded-xl border border-slate-200/30 dark:border-slate-850">
                      <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-normal">Annual Return</span>
                      <strong className="text-xs font-black text-indigo-400">${(prop.expectedAnnualProfit || 0).toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/10 dark:border-slate-800/10">
                    <button
                      type="button"
                      onClick={() => handleSelectToCalculate(prop)}
                      className="w-full py-2.5 rounded-xl border border-[#C0392B]/30 text-brand-red hover:bg-[#C0392B]/10 text-[10.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Calculator size={12} /> Evaluate
                    </button>
                    <button
                      type="button"
                      disabled={prop.status === "Sold Out"}
                      onClick={() => setSelectedPropForInquiry(prop)}
                      className="w-full py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] disabled:bg-slate-800 disabled:text-slate-500 text-white text-[10.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
                    >
                      <Mail size={12} /> Inquiry
                    </button>
                  </div>
                  
                  {/* Customer care direct button */}
                  <button
                    type="button"
                    onClick={() => setSelectedPropForCare(prop)}
                    className="w-full py-1 text-center text-[9px] font-bold text-brand-red/70 hover:text-brand-red flex items-center justify-center gap-1 uppercase tracking-widest cursor-pointer transition-colors"
                  >
                    <PhoneCall size={9} /> Alternate Contact Methods
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DYNAMIC PROFIT ESTIMATOR / CALCULATOR WIDGET */}
      <div id="yield-estimator-panel" className={`relative rounded-[2.5rem] border p-6 sm:p-10 md:p-12 shadow-2xl overflow-hidden ${
        dark 
          ? "border-brand-red/30 bg-gradient-to-br from-slate-900 to-slate-950 text-white" 
          : "border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-800 shadow-md"
      }`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(192,57,43,0.06),transparent_40%)]" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Inputs panel */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-red block">Yield Projection Calculator</span>
              <h3 className={`text-2xl font-black uppercase ${dark ? "text-white" : "text-slate-900"} leading-tight mt-1`}>
                Calculate Projected Real Estate Dividends
              </h3>
            </div>

            <div className="space-y-4">
              {/* Select target property */}
              <div className="space-y-1.5">
                <label className={`text-[9.5px] uppercase font-black ${dark ? "text-slate-400" : "text-slate-500"}`}>Target sovereign Asset reference</label>
                <select
                  value={selectedCalculatorAsset?.id || ""}
                  onChange={(e) => {
                    const found = properties.find(p => p.id === e.target.value);
                    if (found) {
                      setCalcProperty(found);
                      setCustomCalcAmount(found.price.toString());
                      setCalcTermOverride(found.durationMonths);
                    }
                  }}
                  className={`w-full p-3 rounded-xl border font-bold text-xs outline-none focus:border-brand-red ${
                    dark 
                      ? "bg-slate-900 border-slate-800 text-white" 
                      : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  {properties.map(p => (
                    <option key={`opt-${p.id}`} value={p.id}>{p.name} (${p.price.toLocaleString()} Buy Price - {p.roiPercentage}% ROI)</option>
                  ))}
                </select>
              </div>

              {/* Custom principal input */}
              <div className="space-y-1.5">
                <label className={`text-[9.5px] uppercase font-black ${dark ? "text-slate-400" : "text-slate-500"}`}>Custom Investment Capital (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-brand-red font-extrabold">$</span>
                  <input 
                    type="number"
                    value={customCalcAmount}
                    onChange={(e) => setCustomCalcAmount(e.target.value)}
                    placeholder="Enter Custom capital..."
                    className={`w-full p-3 pl-8 rounded-xl border font-mono text-sm font-extrabold outline-none focus:border-brand-red ${
                      dark 
                        ? "bg-slate-900 border-slate-800 text-white" 
                        : "bg-white border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Custom Term input override */}
              <div className="space-y-1.5">
                <div className={`flex justify-between text-[9.5px] uppercase font-black ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  <span>Investment lock commitment</span>
                  <span className="text-brand-red font-mono font-black">{calcTermOverride} Months</span>
                </div>
                <input 
                  type="range"
                  min="3"
                  max="36"
                  step="3"
                  value={calcTermOverride}
                  onChange={(e) => setCalcTermOverride(parseInt(e.target.value))}
                  className="w-full accent-[#C0392B] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Projection Metrics Visualization panel */}
          <div className={`lg:col-span-7 p-6 md:p-8 rounded-3xl border backdrop-blur-md ${
            dark 
              ? "bg-slate-900/60 border-slate-800/80" 
              : "bg-white border-slate-200 shadow-sm"
          }`}>
            <h4 className={`text-[10px] font-black uppercase tracking-widest ${dark ? "text-slate-400" : "text-slate-500"} text-left mb-6 border-b ${dark ? "border-slate-850" : "border-slate-150"} pb-2`}>Estimated Yield Statement Output</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-2xl border text-left space-y-1 ${dark ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"}`}>
                <span className={`text-[8px] uppercase font-bold ${dark ? "text-slate-500" : "text-slate-400"}`}>Committed Capital</span>
                <span className="text-base font-mono font-black text-brand-red">${userPrincipalInput.toLocaleString()} USD</span>
              </div>
              <div className={`p-4 rounded-2xl border text-left space-y-1 ${dark ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"}`}>
                <span className={`text-[8px] uppercase font-bold ${dark ? "text-slate-500" : "text-slate-400"}`}>Est. Monthly Profit</span>
                <span className={`text-base font-mono font-black ${dark ? "text-emerald-400" : "text-emerald-650 text-emerald-600"}`}>+${Math.round(estimatedMonthlyYield).toLocaleString()} USD</span>
              </div>
              <div className={`p-4 rounded-2xl border text-left space-y-1 ${dark ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"}`}>
                <span className={`text-[8px] uppercase font-bold ${dark ? "text-slate-500" : "text-slate-400"}`}>Est. Annual Profit</span>
                <span className="text-base font-mono font-black text-[#C0392B]">+${Math.round(estimatedAnnualYield).toLocaleString()} USD</span>
              </div>
            </div>

            {/* Maturity balance bar */}
            <div className={`p-5 rounded-2xl border text-left space-y-3 ${dark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex justify-between items-center text-xs">
                <span className={`uppercase font-black ${dark ? "text-slate-400" : "text-slate-650 text-slate-600"} tracking-wider`}>Total Projected Balance at Maturity</span>
                <span className="font-mono text-base font-black text-brand-red">${Math.round(totalMaturityValue).toLocaleString()} USD</span>
              </div>
              
              {/* Dynamic progress bar showing gain proportion */}
              <div className={`h-3 rounded-full overflow-hidden flex ${dark ? "bg-slate-900" : "bg-slate-200"}`}>
                <div 
                  className="h-full bg-brand-red transition-all duration-300" 
                  style={{ width: `${(userPrincipalInput / totalMaturityValue) * 100}%` }}
                  title="Your Seed Capital"
                />
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-[#C0392B] transition-all duration-300 animate-pulse" 
                  style={{ width: `${((totalMaturityValue - userPrincipalInput) / totalMaturityValue) * 100}%` }}
                  title="Accumulated Yield Interest"
                />
              </div>

              <div className={`flex justify-between text-[8px] uppercase font-black ${dark ? "text-slate-500" : "text-slate-400"} font-mono mt-1`}>
                <span>⚡ Principal Initial: ${userPrincipalInput.toLocaleString()}</span>
                <span>📈 Yield Profit Growth: +${Math.round(totalMaturityValue - userPrincipalInput).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-5 flex flex-wrap gap-4 items-center justify-between">
              <p className="text-[9.5px] text-slate-500 italic max-w-xs text-left">
                Formulas backed by Valora Corporate Treasury Bond reserve clearance parameters. Real performance indicators are underwritten.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (selectedCalculatorAsset) {
                    setSelectedPropForInquiry(selectedCalculatorAsset);
                  }
                }}
                className="px-5 py-2.5 bg-[#C0392B] hover:bg-[#A93226] text-white font-black text-xs uppercase rounded-xl tracking-wider cursor-pointer transition-all"
              >
                Apply for this Yield Rate
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SECURE ADMINISTRATIVE ACCESS CONSOLE BUTTON */}
      <div id="admin-management-gateway" className="pt-4 border-t border-slate-200/40 dark:border-slate-805/40 text-center">
        {isAdminUnlocked && (
          <div className="p-6 md:p-8 rounded-[2rem] bg-slate-900 border border-emerald-500/30 space-y-6 text-left">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black uppercase text-emerald-400">
                  <ShieldCheck size={11} /> Admin Active
                </span>
                <h3 className="text-lg font-black uppercase text-white mt-1">Sovereign Properties Console</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetCreateForm();
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Create Deed
                </button>
                <button
                  type="button"
                  onClick={exportInquiryCSV}
                  className="px-4 py-2.5 bg-[#C0392B] hover:bg-[#A93226] text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet size={14} /> Export CSV Inquiries ({inquiries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdminUnlocked(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-350 font-bold text-xs uppercase cursor-pointer"
                >
                  Relock Console
                </button>
              </div>
            </div>

            {/* Admin sub view tabs: Properties List & Inquiries List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Properties Grid Manager List */}
              <div className="lg:col-span-6 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Archived Deeds List ({properties.length})</h4>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {properties.map(p => (
                    <div key={`adm-${p.id}`} className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <div className="text-left font-mono">
                          <span className="text-[10px] font-black text-white block truncate max-w-[180px]">{p.name}</span>
                          <span className="text-[8px] text-slate-500 block uppercase">{p.category} | ${(p.price || 0).toLocaleString()} | {p.roiPercentage}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-brand-red hover:bg-[#C0392B]/20"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProperty(p.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-450 text-rose-400 hover:bg-rose-500/20"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inquiries log List */}
              <div className="lg:col-span-6 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Interactive Inquiry Logs ({inquiries.length})</h4>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 font-mono">
                  {inquiries.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-[10.5px] uppercase border border-dashed border-slate-850 rounded-2xl">
                      No Inquiry Transactions Logged Yet.
                    </div>
                  ) : (
                    inquiries.map((inq) => (
                      <div key={inq.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-left space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-black text-emerald-400">{inq.fullName}</span>
                          <span className="text-slate-500">{inq.createdAt}</span>
                        </div>
                        <div className="text-[9.5px] leading-relaxed text-slate-300">
                          <p>📧 Email: <span className="text-white">{inq.email}</span></p>
                          <p>📞 Phone: <span className="text-white">{inq.phone}</span></p>
                          <p>🏦 Target: <span className="text-brand-red font-extrabold uppercase">{inq.propertySelected || inq.propertyName || "Unspecified asset"}</span></p>
                          <p>💰 Capital: <span className="text-emerald-450 text-emerald-400">${(inq.investmentAmount || 0).toLocaleString()}</span></p>
                          <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-805 text-slate-400 max-h-20 overflow-y-auto text-[9px] font-sans">
                            {inq.message}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* DIALOG POPUP: REQUEST MORE INFORMATION FORM MODAL - OPTION 1 */}
      {selectedPropForInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className={`relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border p-6 sm:p-8 shadow-2xl ${
            dark 
              ? "border-brand-red/40 bg-slate-950 text-slate-100" 
              : "border-slate-200 bg-white text-slate-800"
          }`}>
            <button 
              onClick={() => setSelectedPropForInquiry(null)}
              className={`absolute top-5 right-5 p-2 rounded-xl border transition-colors ${
                dark 
                  ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white" 
                  : "bg-slate-100 border-slate-200 text-slate-550 hover:text-slate-900"
              }`}
            >
              <X size={16} />
            </button>

            <div className="space-y-6 text-left">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-brand-red/30 text-[8.5px] font-black uppercase text-brand-red">
                  <Mail size={12} /> Authorized Inquiry Core
                </span>
                <h3 className={`text-xl font-black uppercase ${dark ? "text-white" : "text-slate-900"} mt-2`}>
                  Request Investment Details
                </h3>
                <p className={`text-[10px] ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  Target: <strong className="text-brand-red uppercase">{selectedPropForInquiry.name}</strong> • Minimum Buy In: ${selectedPropForInquiry.price.toLocaleString()}
                </p>
              </div>

              {inquirySuccess ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle size={44} className="mx-auto text-emerald-400 animate-bounce" />
                  <h4 className={`text-sm font-black uppercase tracking-wider ${dark ? "text-white" : "text-slate-900"}`}>Interactive Transmission cleared</h4>
                  <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"} max-w-sm mx-auto leading-relaxed`}>
                    Sovereign message ledger registered. All records dispatching directly to <strong className="text-brand-red font-mono text-[10.5px]">investments@valorafinancialbank.com</strong>. Complete portfolio risk packets will arrive inside 3 administrative core cycles.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={`text-[8.5px] uppercase font-black ${dark ? "text-slate-400" : "text-slate-500"}`}>Client Full name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="John Doe"
                        value={inquiryFullName}
                        onChange={(e) => setInquiryFullName(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none focus:border-brand-red ${
                          dark 
                            ? "bg-slate-900 border-slate-800 text-white" 
                            : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`text-[8.5px] uppercase font-black ${dark ? "text-slate-400" : "text-slate-500"}`}>Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="john@example.com"
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none focus:border-brand-red ${
                          dark 
                            ? "bg-slate-900 border-slate-800 text-white" 
                            : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={`text-[8.5px] uppercase font-black ${dark ? "text-slate-400" : "text-slate-500"}`}>Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="+1 (555) 000-0000"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none focus:border-brand-red ${
                          dark 
                            ? "bg-slate-900 border-slate-800 text-white" 
                            : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`text-[8.5px] uppercase font-black ${dark ? "text-slate-400" : "text-slate-500"}`}>Capital Required (USD)</label>
                      <input 
                        type="number" 
                        value={inquiryAmount || selectedPropForInquiry.price}
                        onChange={(e) => setInquiryAmount(parseFloat(e.target.value) || 0)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold text-brand-red outline-none focus:border-brand-red ${
                          dark 
                            ? "bg-slate-900 border-slate-800" 
                            : "bg-slate-50 border-slate-200"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[8.5px] uppercase font-black ${dark ? "text-slate-400" : "text-slate-500"}`}>Inquiry Custom Message</label>
                    <textarea
                      rows={3}
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder={`Hello Valora Financial Bank,\n\nI am interested in receiving more information regarding the investment property listed as ${selectedPropForInquiry.name}.\n\nPlease provide investment details, expected returns, risks, and requirements.`}
                      className={`w-full p-3 rounded-xl border text-xs font-bold outline-none focus:border-brand-red resize-none ${
                        dark 
                          ? "bg-slate-900 border-slate-800 text-white" 
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#C0392B] hover:bg-[#A93226] text-white font-black text-xs uppercase rounded-xl tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/15"
                  >
                    <Send size={13} /> Submit Sovereign clearance inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DIALOG POPUP: CUSTOMER CARE CONTACT MODEL - OPTION 2 */}
      {selectedPropForCare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className={`relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border p-6 sm:p-8 shadow-2xl ${
            dark 
              ? "border-brand-red/40 bg-slate-950 text-slate-100" 
              : "border-slate-200 bg-white text-slate-800"
          }`}>
            <button 
              onClick={() => setSelectedPropForCare(null)}
              className={`absolute top-5 right-5 p-2 rounded-xl border transition-colors ${
                dark 
                  ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white" 
                  : "bg-slate-100 border-slate-200 text-slate-550 hover:text-slate-900"
              }`}
            >
              <X size={16} />
            </button>

            <div className="space-y-6 text-left">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[8.5px] font-black uppercase text-emerald-400">
                  <PhoneCall size={12} /> Immediate Routing Channels
                </span>
                <h3 className={`text-xl font-black uppercase ${dark ? "text-white" : "text-slate-900"} mt-2`}>
                  Customer Care Hub
                </h3>
                <p className={`text-[10px] ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  Access live support nodes for <strong className="text-brand-red uppercase">{selectedPropForCare.name}</strong>. Mapped under Sovereign clearance.
                </p>
              </div>

              {/* Routing channels list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-[10.5px]">
                
                {/* Email Direct link with template pre-filled block */}
                <a 
                  href={`mailto:support@valorafinancialbank.com?subject=Investment%20Inquiry%20%E2%80%93%20${encodeURIComponent(selectedPropForCare.name)}&body=Hello%20Valora%20Financial%20Bank%2C%0D%0A%0D%0AI%20am%20interested%20in%20receiving%20more%20information%20regarding%20the%20investment%20property%25%20listed%20as%20${encodeURIComponent(selectedPropForCare.name)}.%0D%0A%0D%0APlease%20provide%20investment%20details%2C%20expected%20returns%2C%20risks%2C%20and%20investment%20requirements.%0D%0A%0D%0AThank%20you.`}
                  className={`p-4 rounded-2xl border cursor-pointer text-left block space-y-1.5 transition-all group ${
                    dark 
                      ? "bg-slate-900 border-slate-800 hover:border-brand-red/40" 
                      : "bg-slate-50 border-slate-200 hover:border-brand-red/30"
                  }`}
                >
                  <Mail size={18} className="text-brand-red group-hover:scale-110 transition-transform" />
                  <span className={`font-extrabold uppercase text-[9.5px] ${dark ? "text-white" : "text-slate-900"} block`}>Email Dispatch Router</span>
                  <span className={`text-[8.5px] ${dark ? "text-slate-500" : "text-slate-400"} block truncate`}>support@valorafinancialbank.com</span>
                  <span className="text-[8px] text-brand-red underline block font-bold pt-1">Open client template</span>
                </a>

                {/* WhatsApp Chat template generator */}
                <a 
                  href={`https://wa.me/18005550199?text=Hello%20Valora%20Financial%20Bank%2C%20I%20am%20interested%20in%20receiving%20more%20information%20regarding%20the%20investment%20property%20listed%20as%20${encodeURIComponent(selectedPropForCare.name)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-4 rounded-2xl border cursor-pointer text-left block space-y-1.5 transition-all group ${
                    dark 
                      ? "bg-slate-900 border-slate-800 hover:border-emerald-500/40" 
                      : "bg-slate-50 border-slate-200 hover:border-emerald-500/30"
                  }`}
                >
                  <MessageSquare size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className={`font-extrabold uppercase text-[9.5px] ${dark ? "text-white" : "text-slate-900"} block`}>WhatsApp instant Chat</span>
                  <span className={`text-[8.5px] ${dark ? "text-slate-500" : "text-slate-400"} block truncate`}>Direct Secure Message API</span>
                  <span className="text-[8px] text-emerald-500 underline block font-bold pt-1">Launch Messenger Node</span>
                </a>

                {/* Secure Hot-line Support dialing */}
                <a 
                  href="tel:+18005550199"
                  className={`p-4 rounded-2xl border cursor-pointer text-left block space-y-1.5 transition-all group ${
                    dark 
                      ? "bg-slate-900 border-slate-800 hover:border-brand-red/40" 
                      : "bg-slate-50 border-slate-200 hover:border-brand-red/30"
                  }`}
                >
                  <PhoneCall size={18} className="text-brand-red group-hover:scale-110 transition-transform" />
                  <span className={`font-extrabold uppercase text-[9.5px] ${dark ? "text-white" : "text-slate-900"} block`}>24/7 Telephone Node</span>
                  <span className={`text-[8.5px] ${dark ? "text-slate-500" : "text-slate-400"} block`}>1-800-VALORA (Direct Line)</span>
                  <span className="text-[8px] text-brand-red underline block font-bold pt-1">Call Sovereign Clearinghouse</span>
                </a>

                {/* Live Reception Assistant */}
                <div 
                  onClick={() => {
                    setSelectedPropForCare(null);
                    // Open the chat screen in support or general website chat
                    alert("Support node mapped. Please click the supportive Chat icon at bottom right of page to initiate secure receptionist handshakes directly.");
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer text-left block space-y-1.5 transition-all group ${
                    dark 
                      ? "bg-slate-900 border-slate-850 hover:border-brand-red/30" 
                      : "bg-slate-50 border-slate-200 hover:border-brand-red/20"
                  }`}
                >
                  <HelpCircle size={18} className="text-brand-red group-hover:scale-110 transition-transform" />
                  <span className={`font-extrabold uppercase text-[9.5px] ${dark ? "text-white" : "text-slate-900"} block`}>Interactive Live Assistant</span>
                  <span className={`text-[8.5px] ${dark ? "text-slate-500" : "text-slate-400"} block`}>Immediate algorithmic chat</span>
                  <span className="text-[8px] text-brand-red underline block font-bold pt-1">Navigate to Chat Box</span>
                </div>
              </div>

            </div>

              <div className="pt-2 text-center text-[9px] text-slate-500 italic">
                Incoming communications are highly audited of transaction tracking codes matching sovereign records.
              </div>
            </div>
          </div>
        )}

      {/* CREATE / EDIT PROPERTY ADMIN MODEL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-slate-950 p-6 sm:p-8 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setShowCreateModal(false);
                resetCreateForm();
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <form onSubmit={handleSaveProperty} className="space-y-6 text-left">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Deed Custody Framework</span>
                <h3 className="text-xl font-black uppercase text-white mt-1">
                  {editingProperty ? "Alter Sovereign Asset Deed" : "Charter New Property investment Deed"}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Property Name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-slate-400">Property Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Aetheria Heights Block A"
                    value={newPropName}
                    onChange={(e) => setNewPropName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white outline-none focus:border-brand-red"
                  />
                </div>

                {/* Property Type */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-slate-400">Property Type Label</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Penthouse Suite"
                    value={newPropType}
                    onChange={(e) => setNewPropType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-slate-400">Asset Category Type</label>
                  <select
                    value={newPropCategory}
                    onChange={(e: any) => setNewPropCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white outline-none "
                  >
                    <option value="Luxury Apartments">Luxury Apartments</option>
                    <option value="Family Houses for Rent">Family Houses for Rent</option>
                    <option value="Commercial Buildings">Commercial Buildings</option>
                    <option value="Luxury Villas">Luxury Villas</option>
                    <option value="Vehicle Investment Assets">Vehicle Investment Assets</option>
                  </select>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-slate-400">Geographic Node Location</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Manhattan, NY"
                    value={newPropLocation}
                    onChange={(e) => setNewPropLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white outline-none focus:border-brand-red"
                  />
                </div>

                {/* Risk Level */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-slate-400">Underwritten Risk Metric</label>
                  <select
                    value={newPropRisk}
                    onChange={(e: any) => setNewPropRisk(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white outline-none"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium font-medium">Medium Risk</option>
                    <option value="High font-semibold">High Sovereignty Vault</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Purchase Cost */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-slate-400">Buy Price (USD)</label>
                  <input 
                    type="number"
                    value={newPropPrice}
                    onChange={(e) => setNewPropPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-brand-red text-white outline-none focus:border-brand-red"
                  />
                </div>

                {/* Duration Months */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-slate-400">Lock Period Months</label>
                  <input 
                    type="number"
                    value={newPropDuration}
                    onChange={(e) => setNewPropDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-white outline-none focus:border-brand-red"
                  />
                </div>

                {/* Net ROI */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-slate-400">Expected ROI %</label>
                  <input 
                    type="number"
                    value={newPropROI}
                    onChange={(e) => setNewPropROI(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-white outline-none focus:border-brand-red"
                  />
                </div>

                {/* Rental Status */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-slate-400">Rental status</label>
                  <select
                    value={newPropStatus}
                    onChange={(e: any) => setNewPropStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Limited">Limited Remaining</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
              </div>

              {/* Automatic precomputes feedback for confidence */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 font-mono text-[9px] text-slate-400 space-y-1">
                <span className="uppercase font-black text-brand-red">Deed Yield Estimate computes (Auto-calculated):</span>
                <p>💸 Computed Expected Monthly Yield: <strong className="text-white">${computedMonthly.toLocaleString()} USD</strong></p>
                <p>📈 Computed Expected Annual Return: <strong className="text-white">${computedAnnual.toLocaleString()} USD</strong></p>
                <p>📊 Expected Total return on lock period: <strong className="text-emerald-400">${Math.round(computedAnnual * (parseInt(newPropDuration || "12") / 12)).toLocaleString()} USD</strong></p>
              </div>

              {/* Multiple Image URLs */}
              <div className="space-y-2.5">
                <label className="text-[9.5px] uppercase font-black text-brand-red tracking-wider">Asset Presentation Pictures (Up to 4 Images for Swipe/Carousel)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <span className="text-[8.5px] font-mono text-slate-500 uppercase block">Picture 1 (Primary Hub Cover)</span>
                    <input 
                      type="url"
                      placeholder="https://photos.zillowstatic.com/fp/..."
                      value={newPropImg}
                      onChange={(e) => setNewPropImg(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-brand-red font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8.5px] font-mono text-slate-500 uppercase block">Picture 2 (Alternative View)</span>
                    <input 
                      type="url"
                      placeholder="https://photos.zillowstatic.com/fp/..."
                      value={newPropImg2}
                      onChange={(e) => setNewPropImg2(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-brand-red font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8.5px] font-mono text-slate-500 uppercase block">Picture 3 (Interior / Extra View)</span>
                    <input 
                      type="url"
                      placeholder="https://photos.zillowstatic.com/fp/..."
                      value={newPropImg3}
                      onChange={(e) => setNewPropImg3(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-brand-red font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8.5px] font-mono text-slate-500 uppercase block">Picture 4 (Highlight Detail View)</span>
                    <input 
                      type="url"
                      placeholder="https://photos.zillowstatic.com/fp/..."
                      value={newPropImg4}
                      onChange={(e) => setNewPropImg4(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-brand-red font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Features wrapper */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-black text-slate-400">Bullet Features (Separate with Comma)</label>
                <input 
                  type="text"
                  placeholder="Concierge, Biometric Entry, Smart Lockers"
                  value={newPropFeatures}
                  onChange={(e) => setNewPropFeatures(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white outline-none focus:border-brand-red"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-black text-slate-400">Deed Description Vetting details</label>
                <textarea
                  rows={3}
                  value={newPropDesc}
                  onChange={(e) => setNewPropDesc(e.target.value)}
                  placeholder="Insert premium property or assets background descriptions details..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white outline-none focus:border-brand-red resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="px-4 py-2 text-slate-450 hover:text-white transition-colors text-xs font-extrabold uppercase tracking-wider"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {editingProperty ? "Save Deed Customizations" : "Launch & Publish Deed"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
