import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import type { Listing } from "@shared/schema";

interface ProductCardProps {
  listing: Listing;
  isFeatured?: boolean;
}

export default function ProductCard({ listing, isFeatured }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price).replace("₹", "₹ ");
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short"
    });
  };

  return (
    <Link href={`/listing/${listing.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative">
          <img 
            src={listing.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=300&h=200&fit=crop"} 
            alt={listing.title}
            className="w-full h-48 object-cover"
          />
          {isFeatured && (
            <Badge className="absolute top-2 left-2 bg-olx-accent text-olx-primary text-xs font-bold">
              FEATURED
            </Badge>
          )}
          <Button 
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 text-white hover:text-red-500 p-1"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="text-lg font-bold text-gray-900 mb-1">
            {formatPrice(listing.price)}
          </div>
          
          {listing.attributes?.year && listing.attributes?.kmDriven && (
            <div className="text-xs text-gray-500 mb-2">
              {listing.attributes.year} - {listing.attributes.kmDriven.toLocaleString()} km
            </div>
          )}
          
          <div className="text-sm text-gray-700 mb-3 line-clamp-2">
            {listing.title}
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{listing.location}</span>
            <span>{formatDate(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
