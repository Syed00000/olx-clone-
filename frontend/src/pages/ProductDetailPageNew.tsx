import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, Share2, MapPin, User, Eye, Calendar, ChevronLeft, ChevronRight, Phone, MessageSquare, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import AuthModal from '@/components/AuthModal';

interface ListingData {
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
    phone?: string;
  };
  isFeatured: boolean;
  isUrgent: boolean;
  status: string;
  views: number;
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPageNew() {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [message, setMessage] = useState('');
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listing, isLoading, error } = useQuery<ListingData>({
    queryKey: ['listing', id],
    queryFn: async () => {
      const response = await fetch(`/api/listings/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listing');
      }
      return response.json();
    },
  });
  
  // Fetch similar listings
  const { data: similarListings } = useQuery({
    queryKey: ['similar-listings', listing?.category],
    queryFn: async () => {
      if (!listing?.category) return [];
      const response = await fetch(`/api/listings?category=${listing.category}&limit=6`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.listings?.filter((item: any) => item._id !== id) || [];
    },
    enabled: !!listing?.category,
  });
  
  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/listings/${id}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to toggle favorite');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: id,
          receiverId: listing?.seller._id,
          message: messageText,
        }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Your message has been sent to the seller.",
      });
      setShowContactModal(false);
      setMessage('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFavorite = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    favoriteMutation.mutate();
  };
  
  const handleContact = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setShowContactModal(true);
  };
  
  const handleSendMessage = () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message.",
        variant: "destructive",
      });
      return;
    }
    sendMessageMutation.mutate(message);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onSearch={() => {}} onCategorySelect={() => {}} />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="w-full h-96 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Listing not found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              The listing you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextImage = () => {
    if (listing?.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing?.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price).replace("₹", "₹ ");
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const isFavorited = user && listing?.favorites?.includes(user.id);
  const isOwner = user && listing?.seller._id === user.id;

  // Use image URL directly since it's already stored with /uploads/ prefix in database
  const currentImageData = listing.images?.[currentImageIndex];
  const imageUrl = currentImageData?.url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=800&h=600&fit=crop";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={() => {}} onCategorySelect={() => {}} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-cyan-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="capitalize">{listing.category}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 truncate">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <div className="w-full h-96 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={listing.title}
                    className="max-w-full max-h-full object-contain transition-opacity duration-300 ease-in-out"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=800&h=600&fit=crop";
                    }}
                  />
                </div>
                
                {/* Image Navigation */}
                {listing.images && listing.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    {/* Image indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {listing.images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/90 hover:bg-white"
                    onClick={() => {
                      navigator.share?.({
                        title: listing.title,
                        url: window.location.href,
                      }) || navigator.clipboard.writeText(window.location.href);
                      toast({ title: "Link copied to clipboard!" });
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`bg-white/90 hover:bg-white ${
                      isFavorited ? 'text-red-500' : ''
                    }`}
                    onClick={handleFavorite}
                    disabled={favoriteMutation.isPending}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {listing.isFeatured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-blue-400 text-black font-bold">
                      FEATURED
                    </Badge>
                  )}
                  {listing.isUrgent && (
                    <Badge className="bg-red-600 text-white font-bold">
                      URGENT
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Thumbnail strip */}
              {listing.images && listing.images.length > 1 && (
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                    {listing.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`${listing.title} ${index + 1}`}
                        className={`w-16 h-16 flex-shrink-0 object-cover rounded cursor-pointer border-2 transition-all duration-200 hover:opacity-75 ${
                          index === currentImageIndex ? 'border-cyan-400 ring-2 ring-cyan-200' : 'border-transparent hover:border-gray-300'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{listing.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.location.city}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(listing.createdAt)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{listing.views} views</span>
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                </div>
                
                {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(listing.attributes).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="font-medium">{value}</div>
                        </div>
                      ))}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Condition</div>
                        <div className="font-medium">{listing.condition}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similar Listings */}
            {similarListings && similarListings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {similarListings.slice(0, 4).map((item: any) => (
                      <ProductCard key={item._id} listing={item} variant="grid" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Price and Seller Info */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600 mb-6">
                  {formatPrice(listing.price)}
                </div>
                
                {!isOwner ? (
                  <div className="space-y-3">
                    <Button 
                      onClick={handleContact}
                      className="w-full bg-gradient-to-r from-yellow-400 to-blue-400 hover:from-yellow-500 hover:to-blue-500 text-black font-bold py-3"
                      size="lg"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Contact Seller
                    </Button>
                    
                    {listing.seller.phone && (
                      <Button
                        variant="outline"
                        className="w-full border-2 border-cyan-400 text-cyan-600 hover:bg-cyan-400 hover:text-white py-3"
                        size="lg"
                        onClick={() => {
                          if (isAuthenticated) {
                            window.open(`tel:${listing.seller.phone}`);
                          } else {
                            setShowAuthModal(true);
                          }
                        }}
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Call Now
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm font-medium">
                      This is your listing
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={listing.seller.avatar} alt={listing.seller.username} />
                    <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-blue-400 text-black font-bold">
                      {listing.seller.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold">{listing.seller.username}</h4>
                      {listing.seller.isVerified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    {listing.seller.location?.city && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {listing.seller.location.city}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-bold text-lg">★ 4.5</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-bold text-lg">12</div>
                    <div className="text-sm text-gray-600">Ads</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 text-lg">Safety Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-yellow-700 space-y-2">
                  <li>• Meet in a safe, public place</li>
                  <li>• Check the item before you buy</li>
                  <li>• Pay only after collecting the item</li>
                  <li>• Beware of unrealistic offers</li>
                  <li>• Report suspicious ads</li>
                </ul>
              </CardContent>
            </Card>

            {/* Report Ad */}
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">AD ID: {listing._id.slice(-6).toUpperCase()}</p>
              <Button variant="link" className="text-red-600 hover:text-red-700 p-0 h-auto">
                Report this ad
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Seller</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src={listing?.seller.avatar} alt={listing?.seller.username} />
                <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-blue-400 text-black font-bold">
                  {listing?.seller.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{listing?.seller.username}</p>
                <p className="text-sm text-gray-600">{listing?.title}</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Hi, I'm interested in this item. Is it still available?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-blue-400 hover:from-yellow-500 hover:to-blue-500 text-black font-bold"
              >
                {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowContactModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultTab="login"
      />
    </div>
  );
}
