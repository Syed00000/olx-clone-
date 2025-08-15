import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Gauge, 
  Phone, 
  User, 
  Heart,
  Share2
} from "lucide-react";
import type { Listing } from "@shared/schema";

export default function ProductDetailPage() {
  const { id } = useParams();

  const { data: listing, isLoading, error } = useQuery<Listing>({
    queryKey: ["/api/listings", id],
    queryFn: async () => {
      const response = await fetch(`/api/listings/${id}`);
      if (!response.ok) throw new Error("Failed to fetch listing");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-300 rounded-lg mb-6"></div>
                <div className="h-64 bg-gray-300 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-300 rounded-lg"></div>
                <div className="h-48 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h1>
          <p className="text-gray-600 mb-4">The listing you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Go back to homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit"
    }).toUpperCase();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price).replace("₹", "₹ ");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-olx-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-olx-accent hover:underline">
            ← Back to listings
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-olx-primary">Home</Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="capitalize">{listing.category}</span>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-gray-700">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="bg-black rounded-lg overflow-hidden mb-6 relative">
              <img 
                src={listing.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=600&h=400&fit=crop"} 
                alt={listing.title}
                className="w-full h-96 object-contain"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button size="sm" variant="secondary" className="bg-white/90">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary" className="bg-white/90">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Product Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4 capitalize">
              {listing.title}
            </h1>

            {/* Product Details */}
            <div className="bg-white rounded-lg border p-6">
              {listing.attributes?.fuelType && (
                <div className="flex items-center mb-4">
                  <Gauge className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-medium">{listing.attributes.fuelType}</span>
                </div>
              )}
              
              <h3 className="text-lg font-semibold mb-4">Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {listing.attributes?.kmDriven && (
                  <div className="flex items-center">
                    <Gauge className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Mileage</div>
                      <div className="font-medium">{listing.attributes.kmDriven.toLocaleString()} km</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">{listing.location}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Posting date</div>
                    <div className="font-medium">{formatDate(listing.createdAt)}</div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-700">{listing.description}</p>
              </div>

              {/* Additional Attributes */}
              {Object.keys(listing.attributes || {}).length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h4 className="font-medium mb-4">Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(listing.attributes || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Price & Seller */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-lg border p-6">
              <div className="text-3xl font-bold text-gray-900 mb-4">
                {formatPrice(listing.price)}
              </div>
              <Button className="w-full bg-olx-primary text-white py-3 rounded-lg font-medium hover:bg-olx-primary/90 mb-3">
                Make offer
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-olx-primary text-olx-primary py-3 rounded-lg font-medium hover:bg-olx-primary hover:text-white"
              >
                <Phone className="mr-2 h-4 w-4" />
                Show phone number
              </Button>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">OLX User</div>
                  <div className="text-sm text-gray-500">Member since Feb 2025</div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-500">
                <div className="font-bold text-lg text-gray-900">1</div>
                <div>Items listed</div>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Safety tips</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Meet in a public place</li>
                <li>• Check the item before buying</li>
                <li>• Pay only after collecting item</li>
              </ul>
            </div>

            {/* Ad ID */}
            <div className="text-center text-sm text-gray-500">
              <strong>AD ID {listing.id.slice(-6).toUpperCase()}</strong>
              <br />
              <button className="text-red-500 hover:underline mt-1">
                Report this ad
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
