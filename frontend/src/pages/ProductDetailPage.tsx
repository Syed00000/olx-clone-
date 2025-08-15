import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
  Share2,
  Car,
  Bike,
  Home,
  Smartphone,
  Briefcase,
  Tv,
  Info,
  Settings,
  Clock,
  DollarSign,
  Users,
  Building,
  Zap
} from "lucide-react";
import type { Listing } from "@shared/schema";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  // Dynamic attributes display based on category
  const renderCategoryAttributes = () => {
    const attrs = listing.attributes || {};
    const category = listing.category;
    
    if (category === "bikes") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attrs.brand && (
            <div className="flex items-center">
              <Bike className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Brand</div>
                <div className="font-medium capitalize">{attrs.brand}</div>
              </div>
            </div>
          )}
          {attrs.model && (
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Model</div>
                <div className="font-medium">{attrs.model}</div>
              </div>
            </div>
          )}
          {attrs.year && (
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Year</div>
                <div className="font-medium">{attrs.year}</div>
              </div>
            </div>
          )}
          {attrs.kmDriven && (
            <div className="flex items-center">
              <Gauge className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">KM Driven</div>
                <div className="font-medium">{attrs.kmDriven.toLocaleString()} km</div>
              </div>
            </div>
          )}
          {attrs.engineCapacity && (
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Engine Capacity</div>
                <div className="font-medium">{attrs.engineCapacity} CC</div>
              </div>
            </div>
          )}
          {attrs.mileage && (
            <div className="flex items-center">
              <Gauge className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Mileage</div>
                <div className="font-medium">{attrs.mileage} kmpl</div>
              </div>
            </div>
          )}
          {attrs.ownerNumber && (
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Owner</div>
                <div className="font-medium capitalize">{attrs.ownerNumber.replace(/([A-Z])/g, ' $1')}</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (category === "cars") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attrs.brand && (
            <div className="flex items-center">
              <Car className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Brand</div>
                <div className="font-medium capitalize">{attrs.brand}</div>
              </div>
            </div>
          )}
          {attrs.model && (
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Model</div>
                <div className="font-medium">{attrs.model}</div>
              </div>
            </div>
          )}
          {attrs.year && (
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Year</div>
                <div className="font-medium">{attrs.year}</div>
              </div>
            </div>
          )}
          {attrs.fuelType && (
            <div className="flex items-center">
              <Gauge className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Fuel Type</div>
                <div className="font-medium capitalize">{attrs.fuelType}</div>
              </div>
            </div>
          )}
          {attrs.kmDriven && (
            <div className="flex items-center">
              <Gauge className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">KM Driven</div>
                <div className="font-medium">{attrs.kmDriven.toLocaleString()} km</div>
              </div>
            </div>
          )}
          {attrs.transmission && (
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Transmission</div>
                <div className="font-medium capitalize">{attrs.transmission}</div>
              </div>
            </div>
          )}
          {attrs.ownerNumber && (
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Owner</div>
                <div className="font-medium capitalize">{attrs.ownerNumber.replace(/([A-Z])/g, ' $1')}</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (category === "electronics") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attrs.brand && (
            <div className="flex items-center">
              <Tv className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Brand</div>
                <div className="font-medium capitalize">{attrs.brand}</div>
              </div>
            </div>
          )}
          {attrs.model && (
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Model</div>
                <div className="font-medium">{attrs.model}</div>
              </div>
            </div>
          )}
          {attrs.capacity && (
            <div className="flex items-center">
              <Info className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Capacity</div>
                <div className="font-medium">{attrs.capacity} Litres</div>
              </div>
            </div>
          )}
          {attrs.screenSize && (
            <div className="flex items-center">
              <Tv className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Screen Size</div>
                <div className="font-medium">{attrs.screenSize} inches</div>
              </div>
            </div>
          )}
          {attrs.displayType && (
            <div className="flex items-center">
              <Tv className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Display Type</div>
                <div className="font-medium">{attrs.displayType.toUpperCase()}</div>
              </div>
            </div>
          )}
          {attrs.processor && (
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Processor</div>
                <div className="font-medium">{attrs.processor}</div>
              </div>
            </div>
          )}
          {attrs.ram && (
            <div className="flex items-center">
              <Info className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">RAM</div>
                <div className="font-medium">{attrs.ram} GB</div>
              </div>
            </div>
          )}
          {attrs.storage && (
            <div className="flex items-center">
              <Info className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Storage</div>
                <div className="font-medium">{attrs.storage} GB</div>
              </div>
            </div>
          )}
          {attrs.energyRating && (
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Energy Rating</div>
                <div className="font-medium">{attrs.energyRating}</div>
              </div>
            </div>
          )}
          {attrs.ageOfAppliance && (
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Age</div>
                <div className="font-medium capitalize">{attrs.ageOfAppliance.replace(/-/g, ' ')}</div>
              </div>
            </div>
          )}
          {attrs.condition && (
            <div className="flex items-center">
              <Info className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Condition</div>
                <div className="font-medium capitalize">{attrs.condition}</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (category === "properties") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attrs.bhk && (
            <div className="flex items-center">
              <Home className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">BHK</div>
                <div className="font-medium">{attrs.bhk.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
              </div>
            </div>
          )}
          {attrs.furnishing && (
            <div className="flex items-center">
              <Home className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Furnishing</div>
                <div className="font-medium capitalize">{attrs.furnishing.replace(/([A-Z])/g, ' $1')}</div>
              </div>
            </div>
          )}
          {attrs.projectStatus && (
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Project Status</div>
                <div className="font-medium capitalize">{attrs.projectStatus.replace(/([A-Z])/g, ' $1')}</div>
              </div>
            </div>
          )}
          {attrs.carpetArea && (
            <div className="flex items-center">
              <Info className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Carpet Area</div>
                <div className="font-medium">{attrs.carpetArea} Sq ft</div>
              </div>
            </div>
          )}
          {attrs.plotArea && (
            <div className="flex items-center">
              <Info className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Plot Area</div>
                <div className="font-medium">{attrs.plotArea} Sq ft</div>
              </div>
            </div>
          )}
          {attrs.totalFloors && (
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Total Floors</div>
                <div className="font-medium">{attrs.totalFloors}</div>
              </div>
            </div>
          )}
          {attrs.floorNo && (
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Floor No</div>
                <div className="font-medium">{attrs.floorNo}</div>
              </div>
            </div>
          )}
          {attrs.ageOfConstruction && (
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Age of Construction</div>
                <div className="font-medium capitalize">{attrs.ageOfConstruction.replace(/-/g, ' ')}</div>
              </div>
            </div>
          )}
          {attrs.facing && (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Facing</div>
                <div className="font-medium capitalize">{attrs.facing.replace(/-/g, ' ')}</div>
              </div>
            </div>
          )}
          {attrs.boundaryWall && (
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Boundary Wall</div>
                <div className="font-medium capitalize">{attrs.boundaryWall}</div>
              </div>
            </div>
          )}
          {attrs.length && attrs.breadth && (
            <div className="flex items-center">
              <Info className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Dimensions</div>
                <div className="font-medium">{attrs.length} x {attrs.breadth} ft</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (category === "jobs") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attrs.salaryPeriod && (
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Salary Period</div>
                <div className="font-medium capitalize">{attrs.salaryPeriod}</div>
              </div>
            </div>
          )}
          {attrs.positionType && (
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Position Type</div>
                <div className="font-medium capitalize">{attrs.positionType.replace(/([A-Z])/g, ' $1')}</div>
              </div>
            </div>
          )}
          {attrs.salaryFrom && attrs.salaryTo && (
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Salary Range</div>
                <div className="font-medium">
                  ₹{attrs.salaryFrom.toLocaleString()} - ₹{attrs.salaryTo.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (category === "mobiles") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attrs.brand && (
            <div className="flex items-center">
              <Smartphone className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Brand</div>
                <div className="font-medium capitalize">{attrs.brand}</div>
              </div>
            </div>
          )}
          {attrs.model && (
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Model</div>
                <div className="font-medium">{attrs.model}</div>
              </div>
            </div>
          )}
          {attrs.condition && (
            <div className="flex items-center">
              <Info className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Condition</div>
                <div className="font-medium capitalize">{attrs.condition}</div>
              </div>
            </div>
          )}
          {attrs.warranty && (
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Warranty</div>
                <div className="font-medium">{attrs.warranty}</div>
              </div>
            </div>
          )}
          {attrs.storage && (
            <div className="flex items-center">
              <Info className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Storage</div>
                <div className="font-medium">{attrs.storage}</div>
              </div>
            </div>
          )}
          {attrs.ram && (
            <div className="flex items-center">
              <Info className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">RAM</div>
                <div className="font-medium">{attrs.ram}</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Default fallback for other categories
    if (Object.keys(attrs).length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(attrs).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <Info className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                <div className="font-medium">{value}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
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
            {/* Image Gallery */}
            <div className="space-y-4 mb-6">
              {/* Main Image */}
              <div className="bg-black rounded-lg overflow-hidden relative">
                <img 
                  src={listing.images && listing.images.length > 0 
                    ? listing.images[selectedImageIndex]
                    : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=600&h=400&fit=crop"
                  }
                  alt={listing.title}
                  className="w-full h-96 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=600&h=400&fit=crop";
                  }}
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button size="sm" variant="secondary" className="bg-white/90">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-white/90">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                {listing.images && listing.images.length > 1 && (
                  <div className="absolute bottom-4 right-4">
                    <Badge className="bg-black/70 text-white">
                      {selectedImageIndex + 1} / {listing.images.length}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {listing.images && listing.images.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {listing.images.map((image, index) => (
                    <div 
                      key={index} 
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                        selectedImageIndex === index 
                          ? 'border-olx-primary ring-2 ring-olx-primary/20' 
                          : 'border-transparent hover:border-olx-primary/50'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`${listing.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=200&h=200&fit=crop";
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4 capitalize">
              {listing.title}
            </h1>

            {/* Product Details */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium capitalize">{listing.location}</div>
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

              {/* Dynamic Category-Specific Attributes */}
              {Object.keys(listing.attributes || {}).length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h4 className="font-medium mb-4">Details</h4>
                    {renderCategoryAttributes()}
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
