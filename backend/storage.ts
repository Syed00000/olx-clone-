import { randomUUID } from "crypto";

// Define in-memory types that mirror the Mongoose schema types but without Mongoose.Document
interface UserInMemory {
  _id: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ListingInMemory {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  condition: string;
  location: {
    city: string;
    state?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  attributes: Map<string, any>;
  seller: string; // Changed from mongoose.Types.ObjectId to string
  isFeatured: boolean;
  isUrgent: boolean;
  status: string;
  views: number;
  favorites: string[]; // Changed from mongoose.Types.ObjectId[] to string[]
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IStorage {
  getUser(id: string): Promise<UserInMemory | undefined>;
  getUserByUsername(username: string): Promise<UserInMemory | undefined>;
  createUser(user: Omit<UserInMemory, "_id" | "createdAt" | "updatedAt">): Promise<UserInMemory>;
  
  getListings(filters?: {
    category?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ListingInMemory[]>;
  getListing(id: string): Promise<ListingInMemory | undefined>;
  createListing(listing: Omit<ListingInMemory, "_id" | "createdAt" | "updatedAt">): Promise<ListingInMemory>;
  updateListing(id: string, listing: Partial<Omit<ListingInMemory, "_id" | "createdAt" | "updatedAt">>): Promise<ListingInMemory | undefined>;
  deleteListing(id: string): Promise<boolean>;
  getFeaturedListings(): Promise<ListingInMemory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, UserInMemory>;
  private listings: Map<string, ListingInMemory>;

  constructor() {
    this.users = new Map();
    this.listings = new Map();
    this.seedData();
  }

  private seedData() {
    // Add some initial listings to match the design
    const mockListings: Partial<Omit<ListingInMemory, "_id" | "createdAt" | "updatedAt">>[] = [
      {
        title: "Maruti Eeco 2024 10 months old 15500 Km single owner Driven Excellent",
        description: "Well maintained car with all original documents",
        price: 585000,
        category: "cars",
        subcategory: "cars",
        location: { city: "Maninagaram", country: "India" },
        images: [{ url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&w=300&h=200&fit=crop", isPrimary: true }],
        attributes: new Map(Object.entries({ year: 2024, kmDriven: 15500, fuelType: "Petrol", brand: "Maruti Suzuki" })),
        isFeatured: true,
        status: "active",
        seller: "mockSellerId1" // Add a mock seller ID
      },
      {
        title: "Huawei Watch 4 Pro Going Lowest at 29900",
        description: "Latest smartwatch with all features",
        price: 29900,
        category: "electronics",
        subcategory: "accessories",
        location: { city: "Pune", country: "India" },
        images: [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&w=300&h=200&fit=crop", isPrimary: true }],
        attributes: new Map(Object.entries({ brand: "Huawei", condition: "New" })),
        isFeatured: true,
        status: "active",
        seller: "mockSellerId2"
      },
      {
        title: "Urgent sell",
        description: "Mobile phone in good condition",
        price: 9500,
        category: "mobiles",
        subcategory: "mobile-phones",
        location: { city: "Samudrapur", country: "India" },
        images: [{ url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&w=300&h=200&fit=crop", isPrimary: true }],
        attributes: new Map(Object.entries({ brand: "Other", condition: "Used" })),
        status: "active",
        seller: "mockSellerId3"
      },
      {
        title: "Vivo V40 Pro 5G",
        description: "Latest smartphone with 5G connectivity",
        price: 4500,
        category: "mobiles",
        subcategory: "mobile-phones",
        location: { city: "Samudrapur", country: "India" },
        images: [{ url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&w=300&h=200&fit=crop", isPrimary: true }],
        attributes: new Map(Object.entries({ brand: "Vivo", condition: "Used" })),
        status: "active",
        seller: "mockSellerId4"
      },
      {
        title: "Maruti Suzuki Swift Dzire 2015 Diesel 63000 Km Driven",
        description: "Well maintained diesel car",
        price: 170000,
        category: "cars",
        subcategory: "cars",
        location: { city: "Samudrapur MIDC", country: "India" },
        images: [{ url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&w=300&h=200&fit=crop", isPrimary: true }],
        attributes: new Map(Object.entries({ year: 2015, kmDriven: 63000, fuelType: "Diesel", brand: "Maruti Suzuki" })),
        status: "active",
        seller: "mockSellerId5"
      },
      {
        title: "We have new latest collection ultra slim watches online order book",
        description: "Premium watch collection available",
        price: 2000,
        category: "fashion",
        subcategory: "accessories",
        location: { city: "Samudrapur", country: "India" },
        images: [{ url: "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?ixlib=rb-4.0.3&w=300&h=200&fit=crop", isPrimary: true }],
        attributes: new Map(Object.entries({ brand: "Various", condition: "New" })),
        status: "active",
        seller: "mockSellerId6"
      }
    ];

    mockListings.forEach(listing => {
      this.createListing(listing as Omit<ListingInMemory, "_id" | "createdAt" | "updatedAt">);
    });
  }

  async getUser(id: string): Promise<UserInMemory | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<UserInMemory | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: Omit<UserInMemory, "_id" | "createdAt" | "updatedAt">): Promise<UserInMemory> {
    const id = randomUUID();
    const now = new Date();
    const user: UserInMemory = {
      ...insertUser,
      _id: id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async getListings(filters?: {
    category?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ListingInMemory[]> {
    let listings = Array.from(this.listings.values()).filter(
      listing => listing.status === "active"
    );

    if (filters?.category) {
      listings = listings.filter(listing => listing.category === filters.category);
    }

    if (filters?.location) {
      listings = listings.filter(listing =>
        listing.location.city.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      listings = listings.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.description.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by creation date, newest first
    listings.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    
    return listings.slice(offset, offset + limit);
  }

  async getListing(id: string): Promise<ListingInMemory | undefined> {
    return this.listings.get(id);
  }

  async createListing(insertListing: Omit<ListingInMemory, "_id" | "createdAt" | "updatedAt">): Promise<ListingInMemory> {
    const id = randomUUID();
    const now = new Date();
    const listing: ListingInMemory = {
      ...insertListing,
      _id: id,
      subcategory: insertListing.subcategory || undefined,
      images: insertListing.images || [],
      attributes: insertListing.attributes || new Map(),
      createdAt: now,
      updatedAt: now,
      condition: insertListing.condition || 'Good',
      isFeatured: insertListing.isFeatured || false,
      isUrgent: insertListing.isUrgent || false,
      status: insertListing.status || 'active',
      views: insertListing.views || 0,
      favorites: insertListing.favorites || [],
      tags: insertListing.tags || [],
      seller: insertListing.seller || "defaultSellerId" // Ensure seller is always present
    };
    this.listings.set(id, listing);
    return listing;
  }

  async updateListing(id: string, updateData: Partial<Omit<ListingInMemory, "_id" | "createdAt" | "updatedAt">>): Promise<ListingInMemory | undefined> {
    const listing = this.listings.get(id);
    if (!listing) return undefined;

    const updatedListing: ListingInMemory = {
      ...listing,
      ...updateData,
      subcategory: updateData.subcategory || listing.subcategory,
      images: updateData.images || listing.images,
      attributes: updateData.attributes || listing.attributes,
      updatedAt: new Date(),
    };
    
    this.listings.set(id, updatedListing);
    return updatedListing;
  }

  async deleteListing(id: string): Promise<boolean> {
    return this.listings.delete(id);
  }

  async getFeaturedListings(): Promise<ListingInMemory[]> {
    return Array.from(this.listings.values()).filter(
      listing => listing.isFeatured === true && listing.status === "active"
    );
  }
}

export const storage = new MemStorage();
