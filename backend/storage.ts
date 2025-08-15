import { type User, type InsertUser, type Listing, type InsertListing } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getListings(filters?: {
    category?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Listing[]>;
  getListing(id: string): Promise<Listing | undefined>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: string, listing: Partial<InsertListing>): Promise<Listing | undefined>;
  deleteListing(id: string): Promise<boolean>;
  getFeaturedListings(): Promise<Listing[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private listings: Map<string, Listing>;

  constructor() {
    this.users = new Map();
    this.listings = new Map();
    this.seedData();
  }

  private seedData() {
    // Add some initial listings to match the design
    const mockListings: InsertListing[] = [
      {
        title: "Maruti Eeco 2024 10 months old 15500 Km single owner Driven Excellent",
        description: "Well maintained car with all original documents",
        price: 585000,
        category: "cars",
        subcategory: "cars",
        location: "Maninagaram, Cumbum",
        images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&w=300&h=200&fit=crop"],
        attributes: { year: 2024, kmDriven: 15500, fuelType: "Petrol", brand: "Maruti Suzuki" },
        isFeatured: "true",
        status: "active"
      },
      {
        title: "Huawei Watch 4 Pro Going Lowest at 29900",
        description: "Latest smartwatch with all features",
        price: 29900,
        category: "electronics",
        subcategory: "accessories",
        location: "MG Road, Pune",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&w=300&h=200&fit=crop"],
        attributes: { brand: "Huawei", condition: "New" },
        isFeatured: "true",
        status: "active"
      },
      {
        title: "Urgent sell",
        description: "Mobile phone in good condition",
        price: 9500,
        category: "mobiles",
        subcategory: "mobile-phones",
        location: "Samudrapur, Maharashtra",
        images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&w=300&h=200&fit=crop"],
        attributes: { brand: "Other", condition: "Used" },
        status: "active"
      },
      {
        title: "Vivo V40 Pro 5G",
        description: "Latest smartphone with 5G connectivity",
        price: 4500,
        category: "mobiles",
        subcategory: "mobile-phones",
        location: "Samudrapur, Maharashtra",
        images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&w=300&h=200&fit=crop"],
        attributes: { brand: "Vivo", condition: "Used" },
        status: "active"
      },
      {
        title: "Maruti Suzuki Swift Dzire 2015 Diesel 63000 Km Driven",
        description: "Well maintained diesel car",
        price: 170000,
        category: "cars",
        subcategory: "cars",
        location: "Samudrapur MIDC, Maharashtra",
        images: ["https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&w=300&h=200&fit=crop"],
        attributes: { year: 2015, kmDriven: 63000, fuelType: "Diesel", brand: "Maruti Suzuki" },
        status: "active"
      },
      {
        title: "We have new latest collection ultra slim watches online order book",
        description: "Premium watch collection available",
        price: 2000,
        category: "fashion",
        subcategory: "accessories",
        location: "Samudrapur, Maharashtra",
        images: ["https://images.unsplash.com/photo-1594534475808-b18fc33b045e?ixlib=rb-4.0.3&w=300&h=200&fit=crop"],
        attributes: { brand: "Various", condition: "New" },
        status: "active"
      }
    ];

    mockListings.forEach(listing => {
      this.createListing(listing);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getListings(filters?: {
    category?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Listing[]> {
    let listings = Array.from(this.listings.values()).filter(
      listing => listing.status === "active"
    );

    if (filters?.category) {
      listings = listings.filter(listing => listing.category === filters.category);
    }

    if (filters?.location) {
      listings = listings.filter(listing => 
        listing.location.toLowerCase().includes(filters.location!.toLowerCase())
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

  async getListing(id: string): Promise<Listing | undefined> {
    return this.listings.get(id);
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = randomUUID();
    const now = new Date();
    const listing: Listing = {
      ...insertListing,
      id,
      subcategory: insertListing.subcategory || null,
      images: insertListing.images || [],
      attributes: insertListing.attributes || {},
      createdAt: now,
      updatedAt: now,
    };
    this.listings.set(id, listing);
    return listing;
  }

  async updateListing(id: string, updateData: Partial<InsertListing>): Promise<Listing | undefined> {
    const listing = this.listings.get(id);
    if (!listing) return undefined;

    const updatedListing: Listing = {
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

  async getFeaturedListings(): Promise<Listing[]> {
    return Array.from(this.listings.values()).filter(
      listing => listing.isFeatured === "true" && listing.status === "active"
    );
  }
}

export const storage = new MemStorage();
