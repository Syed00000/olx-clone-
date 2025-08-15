import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Eye, Clock, Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  location: {
    city: string;
    state?: string;
  };
  images: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  attributes: Record<string, any>;
  seller: {
    _id: string;
    username: string;
    avatar?: string;
    location?: {
      city?: string;
    };
    isVerified?: boolean;
  };
  isFeatured: boolean;
  isUrgent: boolean;
  status: string;
  views: number;
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProductCardProps {
  listing: Listing;
  isFeatured?: boolean;
  variant?: "grid" | "list" | "featured";
}

export default function ProductCard({ listing, isFeatured, variant = "grid" }: ProductCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isFavorited = user && listing.favorites?.includes(user.id);
  
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/listings/${listing._id}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to toggle favorite');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? "Item removed from your favorites." : "Item saved to your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to save favorites.",
        variant: "destructive",
      });
      return;
    }
    
    favoriteMutation.mutate();
  };

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

  const primaryImage = listing.images?.find(img => img.isPrimary) || listing.images?.[0];
  const imageUrl = primaryImage?.url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=400&h=300&fit=crop";

  if (variant === "list") {
    return (
      <Link href={`/listing/${listing._id}`}>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-cyan-400 cursor-pointer">
          <div className="flex">
            <div className="relative w-48 h-36 flex-shrink-0">
              <img 
                src={imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              {(listing.isFeatured || isFeatured) && (
                <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-blue-400 text-black text-xs font-bold">
                  FEATURED
                </Badge>
              )}
              {listing.isUrgent && (
                <Badge className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold">
                  URGENT
                </Badge>
              )}
            </div>
            
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(listing.price)}
                </div>
                <Button 
                  size="sm"
                  variant="ghost"
                  className={`p-1 transition-colors ${
                    isFavorited 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                  onClick={handleFavoriteClick}
                  disabled={favoriteMutation.isPending}
                >
                  <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {listing.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {listing.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {listing.location.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {listing.views}
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDate(listing.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/listing/${listing._id}`}>
      <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200 hover:border-cyan-400 hover:scale-105 cursor-pointer ${
        variant === "featured" ? "border-2 border-yellow-400 shadow-lg" : ""
      }`}>
        <div className="relative">
          <img 
            src={imageUrl}
            alt={listing.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {(listing.isFeatured || isFeatured) && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-blue-400 text-black text-xs font-bold">
                FEATURED
              </Badge>
            )}
            {listing.isUrgent && (
              <Badge className="bg-red-600 text-white text-xs font-bold">
                URGENT
              </Badge>
            )}
          </div>
          <Button 
            size="sm"
            variant="ghost"
            className={`absolute top-2 right-2 p-2 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full transition-colors ${
              isFavorited 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-white hover:text-red-500'
            }`}
            onClick={handleFavoriteClick}
            disabled={favoriteMutation.isPending}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            <Eye className="h-3 w-3" />
            <span>{listing.views}</span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {formatPrice(listing.price)}
          </div>
          
          {/* Category-specific attributes */}
          {listing.attributes && Object.keys(listing.attributes).length > 0 && (
            <div className="text-xs mb-2">
              {/* Mobile attributes */}
              {listing.category === 'Mobiles' && (
                <div className="flex flex-wrap gap-1">
                  {listing.attributes.brand && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{listing.attributes.brand}</span>}
                  {listing.attributes.ram && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{listing.attributes.ram}</span>}
                  {listing.attributes.storage && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">{listing.attributes.storage}</span>}
                  {listing.attributes.condition && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{listing.attributes.condition || listing.condition}</span>}
                </div>
              )}
              
              {/* Car attributes */}
              {listing.category === 'Cars' && (
                <div className="flex flex-wrap gap-1">
                  {listing.attributes.brand && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{listing.attributes.brand}</span>}
                  {listing.attributes.year && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{listing.attributes.year}</span>}
                  {listing.attributes.fuelType && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">{listing.attributes.fuelType}</span>}
                  {listing.attributes.kmDriven && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">{listing.attributes.kmDriven.toLocaleString()} km</span>}
                </div>
              )}
              
              {/* Property attributes */}
              {listing.category === 'Properties' && (
                <div className="flex flex-wrap gap-1">
                  {listing.attributes.propertyType && <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">{listing.attributes.propertyType}</span>}
                  {listing.attributes.bedrooms && <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">{listing.attributes.bedrooms} BHK</span>}
                  {listing.attributes.area && <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs">{listing.attributes.area} sq ft</span>}
                </div>
              )}
              
              {/* Bike attributes */}
              {listing.category === 'Bikes' && (
                <div className="flex flex-wrap gap-1">
                  {listing.attributes.brand && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{listing.attributes.brand}</span>}
                  {listing.attributes.year && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{listing.attributes.year}</span>}
                  {listing.attributes.engine && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">{listing.attributes.engine}cc</span>}
                  {listing.attributes.kmDriven && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">{listing.attributes.kmDriven.toLocaleString()} km</span>}
                </div>
              )}
              
              {/* Fashion attributes */}
              {listing.category === 'Fashion' && (
                <div className="flex flex-wrap gap-1">
                  {listing.attributes.brand && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">{listing.attributes.brand}</span>}
                  {listing.attributes.size && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Size {listing.attributes.size}</span>}
                  {listing.attributes.color && <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">{listing.attributes.color}</span>}
                  {listing.attributes.type && <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">{listing.attributes.type}</span>}
                </div>
              )}
              
              {/* Electronics attributes */}
              {listing.category === 'Electronics & Appliances' && (
                <div className="flex flex-wrap gap-1">
                  {listing.attributes.brand && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{listing.attributes.brand}</span>}
                  {listing.attributes.type && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{listing.attributes.type}</span>}
                  {listing.attributes.purchaseYear && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">{listing.attributes.purchaseYear}</span>}
                </div>
              )}
              
              {/* Jobs attributes */}
              {listing.category === 'Jobs' && (
                <div className="flex flex-wrap gap-1">
                  {listing.attributes.salaryPeriod && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{listing.attributes.salaryPeriod}</span>}
                  {listing.attributes.positionType && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{listing.attributes.positionType}</span>}
                  {(listing.attributes.salaryFrom || listing.attributes.salaryTo) && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                      ₹{listing.attributes.salaryFrom || 0}-{listing.attributes.salaryTo || 0}
                    </span>
                  )}
                </div>
              )}
              
              {/* General case - for categories without specific handling */}
              {!['Mobiles', 'Cars', 'Properties', 'Bikes', 'Fashion', 'Electronics & Appliances', 'Jobs'].includes(listing.category) && (
                <div className="text-gray-500">
                  {listing.attributes.brand && `${listing.attributes.brand} • `}
                  {listing.condition}
                </div>
              )}
            </div>
          )}
          
          <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
            {listing.title}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {listing.location.city}
              {listing.seller.isVerified && (
                <div className="flex items-center gap-1 ml-2">
                  <Star className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">Verified</span>
                </div>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(listing.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
