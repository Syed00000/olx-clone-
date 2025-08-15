export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  parent: string;
}

export const categories: Category[] = [
  {
    id: "cars",
    name: "Cars",
    icon: "🚗",
    subcategories: [
      { id: "cars", name: "Cars", parent: "cars" },
      { id: "used-cars", name: "Used Cars", parent: "cars" }
    ]
  },
  {
    id: "properties",
    name: "Properties",
    icon: "🏠",
    subcategories: [
      { id: "for-sale-houses", name: "For Sale: Houses & Apartments", parent: "properties" },
      { id: "for-rent-houses", name: "For Rent: Houses & Apartments", parent: "properties" },
      { id: "lands-plots", name: "Lands & Plots", parent: "properties" },
      { id: "for-rent-shops", name: "For Rent: Shops & Offices", parent: "properties" },
      { id: "for-sale-shops", name: "For Sale: Shops & Offices", parent: "properties" },
      { id: "pg-guest-houses", name: "PG & Guest Houses", parent: "properties" }
    ]
  },
  {
    id: "mobiles",
    name: "Mobiles",
    icon: "📱",
    subcategories: [
      { id: "mobile-phones", name: "Mobile Phones", parent: "mobiles" },
      { id: "accessories", name: "Accessories", parent: "mobiles" },
      { id: "tablets", name: "Tablets", parent: "mobiles" }
    ]
  },
  {
    id: "jobs",
    name: "Jobs",
    icon: "💼",
    subcategories: [
      { id: "data-entry", name: "Data entry & Back office", parent: "jobs" },
      { id: "sales-marketing", name: "Sales & Marketing", parent: "jobs" },
      { id: "bpo-telecaller", name: "BPO & Telecaller", parent: "jobs" },
      { id: "driver", name: "Driver", parent: "jobs" },
      { id: "office-assistant", name: "Office Assistant", parent: "jobs" },
      { id: "delivery-collection", name: "Delivery & Collection", parent: "jobs" },
      { id: "teacher", name: "Teacher", parent: "jobs" },
      { id: "cook", name: "Cook", parent: "jobs" },
      { id: "receptionist", name: "Receptionist & Front office", parent: "jobs" },
      { id: "operator-technician", name: "Operator & Technician", parent: "jobs" },
      { id: "it-engineer", name: "IT Engineer & Developer", parent: "jobs" },
      { id: "hotel-travel", name: "Hotel & Travel Executive", parent: "jobs" },
      { id: "accountant", name: "Accountant", parent: "jobs" },
      { id: "designer", name: "Designer", parent: "jobs" },
      { id: "other-jobs", name: "Other Jobs", parent: "jobs" }
    ]
  },
  {
    id: "bikes",
    name: "Bikes",
    icon: "🏍️",
    subcategories: [
      { id: "motorcycles", name: "Motorcycles", parent: "bikes" },
      { id: "scooters", name: "Scooters", parent: "bikes" },
      { id: "spare-parts", name: "Spare Parts", parent: "bikes" },
      { id: "bicycles", name: "Bicycles", parent: "bikes" }
    ]
  },
  {
    id: "electronics",
    name: "Electronics & Appliances",
    icon: "📺",
    subcategories: [
      { id: "tvs-video-audio", name: "TVs, Video - Audio", parent: "electronics" },
      { id: "kitchen-appliances", name: "Kitchen & Other Appliances", parent: "electronics" },
      { id: "computers-laptops", name: "Computers & Laptops", parent: "electronics" },
      { id: "cameras-lenses", name: "Cameras & Lenses", parent: "electronics" },
      { id: "games-entertainment", name: "Games & Entertainment", parent: "electronics" },
      { id: "fridges", name: "Fridges", parent: "electronics" },
      { id: "computer-accessories", name: "Computer Accessories", parent: "electronics" },
      { id: "hard-disks-printers", name: "Hard Disks, Printers & Monitors", parent: "electronics" },
      { id: "acs", name: "ACs", parent: "electronics" },
      { id: "washing-machines", name: "Washing Machines", parent: "electronics" }
    ]
  },
  {
    id: "commercial",
    name: "Commercial Vehicles & Spares",
    icon: "🚛",
    subcategories: [
      { id: "commercial-vehicles", name: "Commercial & Other Vehicles", parent: "commercial" },
      { id: "spare-parts-commercial", name: "Spare Parts", parent: "commercial" }
    ]
  },
  {
    id: "furniture",
    name: "Furniture",
    icon: "🛋️",
    subcategories: [
      { id: "sofa-dining", name: "Sofa & Dining", parent: "furniture" },
      { id: "beds-wardrobes", name: "Beds & Wardrobes", parent: "furniture" },
      { id: "home-decor", name: "Home Decor & Garden", parent: "furniture" },
      { id: "kids-furniture", name: "Kids Furniture", parent: "furniture" },
      { id: "other-household", name: "Other Household Items", parent: "furniture" }
    ]
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: "👕",
    subcategories: [
      { id: "men", name: "Men", parent: "fashion" },
      { id: "women", name: "Women", parent: "fashion" },
      { id: "kids", name: "Kids", parent: "fashion" }
    ]
  },
  {
    id: "pets",
    name: "Pets",
    icon: "🐕",
    subcategories: [
      { id: "fishes-aquarium", name: "Fishes & Aquarium", parent: "pets" },
      { id: "pet-food-accessories", name: "Pet Food & Accessories", parent: "pets" },
      { id: "dogs", name: "Dogs", parent: "pets" },
      { id: "other-pets", name: "Other Pets", parent: "pets" }
    ]
  },
  {
    id: "books",
    name: "Books, Sports & Hobbies",
    icon: "📚",
    subcategories: [
      { id: "books", name: "Books", parent: "books" },
      { id: "gym-fitness", name: "Gym & Fitness", parent: "books" },
      { id: "musical-instruments", name: "Musical Instruments", parent: "books" },
      { id: "sports-equipment", name: "Sports Equipment", parent: "books" },
      { id: "other-hobbies", name: "Other Hobbies", parent: "books" }
    ]
  },
  {
    id: "services",
    name: "Services",
    icon: "🔧",
    subcategories: [
      { id: "education-classes", name: "Education & Classes", parent: "services" },
      { id: "tours-travel", name: "Tours & Travel", parent: "services" },
      { id: "electronics-repair", name: "Electronics Repair & Services", parent: "services" },
      { id: "health-beauty", name: "Health & Beauty", parent: "services" },
      { id: "home-renovation", name: "Home Renovation & Repair", parent: "services" },
      { id: "cleaning-pest", name: "Cleaning & Pest Control", parent: "services" },
      { id: "legal-documentation", name: "Legal & Documentation Services", parent: "services" },
      { id: "packers-movers", name: "Packers & Movers", parent: "services" },
      { id: "other-services", name: "Other Services", parent: "services" }
    ]
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getSubcategoriesByCategory = (categoryId: string): Subcategory[] => {
  const category = getCategoryById(categoryId);
  return category?.subcategories || [];
};
