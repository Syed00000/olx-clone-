import { useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Share2, MessageSquare, Shield, MapPin, Eye, Clock, Phone, Star, ChevronLeft, ChevronRight, X, Flag, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// MongoDB Listing interface
interface Listing {
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

export default function ProductDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [message, setMessage] = useState("");
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  
  const { data: listing, isLoading } = useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: async () => {
      const response = await fetch(`/api/listings/${id}`);
      if (!response.ok) {
        throw new Error("Listing not found");
      }
      return response.json();
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/listings/${id}/favorite`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to update favorite");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Please login to add to favorites",
        variant: "destructive"
      });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { listingId: string; receiverId: string; message: string }) => {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message sent successfully!",
      });
      setMessage("");
      setIsMessageDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Please login to send messages",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <X className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h1>
          <p className="text-gray-600 mb-4">The listing you're looking for doesn't exist or has been removed.</p>
          <Link href="/">
            <Button className="bg-cyan-600 hover:bg-cyan-700">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price).replace("₹", "₹ ");
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const listingDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - listingDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return listingDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const primaryImage = listing.images?.find(img => img.isPrimary) || listing.images?.[0];
  const imageUrl = primaryImage?.url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=800&h=600&fit=crop";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out this ${listing.category} for ${formatPrice(listing.price)}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copied to clipboard!" });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const nextImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({
      listingId: listing._id,
      receiverId: listing.seller._id,
      message: message.trim()
    });
  };

  const currentImage = listing.images?.[currentImageIndex];
  const hasImages = listing.images && listing.images.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Results
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => favoriteMutation.mutate()}
                disabled={favoriteMutation.isPending}
                className="hover:bg-red-50 hover:border-red-300"
              >
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                {favoriteMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="hover:bg-blue-50 hover:border-blue-300">
                <Share2 className="h-4 w-4 mr-2 text-blue-500" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-red-50 hover:border-red-300">
                <Flag className="h-4 w-4 mr-2 text-red-500" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative group">
                  <img
                    src={hasImages ? currentImage?.url : imageUrl}
                    alt={listing.title}
                    className="w-full h-96 object-cover"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
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

                  {/* View counter */}
                  <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{listing.views.toLocaleString()} views</span>
                  </div>
                  
                  {/* Navigation arrows */}
                  {hasImages && listing.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                  
                  {/* Image counter */}
                  {hasImages && listing.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full">
                      {currentImageIndex + 1} / {listing.images.length}
                    </div>
                  )}
                </div>
                
                {/* Thumbnail strip */}
                {hasImages && listing.images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {listing.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex 
                            ? "border-cyan-500 shadow-lg" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${listing.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{listing.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {listing.location.city}
                        {listing.location.state && `, ${listing.location.state}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(listing.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatPrice(listing.price)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{listing.category}</Badge>
                  {listing.subcategory && (
                    <Badge variant="outline">{listing.subcategory}</Badge>
                  )}
                  <Badge variant="outline">Condition: {listing.condition}</Badge>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Description</h3>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                    {listing.description}
                  </div>
                </div>
                
                {/* Attributes */}
                {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(listing.attributes).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-gray-900 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Seller and Contact */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-4">
                  {formatPrice(listing.price)}
                </div>
                
                {/* Contact Buttons */}
                <div className="space-y-3 mb-6">
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold" 
                    size="lg"
                    onClick={() => setShowPhoneNumber(true)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {showPhoneNumber && listing.seller.phone ? 
                      listing.seller.phone : 
                      "Show Phone Number"
                    }
                  </Button>
                  
                  <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full border-2 hover:bg-blue-50 hover:border-blue-300" size="lg">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat with Seller
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Message to Seller</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900">{listing.title}</h4>
                          <p className="text-green-600 font-bold">{formatPrice(listing.price)}</p>
                        </div>
                        <Textarea
                          placeholder="Hi, is this item still available?"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={!message.trim() || sendMessageMutation.isPending}
                          className="w-full"
                        >
                          {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <Separator className="my-6" />
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{listing.views.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{listing.favorites?.length || 0}</div>
                    <div className="text-sm text-gray-600">Favorites</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {listing.seller.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg text-gray-900">
                        {listing.seller.username || 'Anonymous User'}
                      </span>
                      {listing.seller.isVerified && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 text-sm font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Member since 2024</div>
                    {listing.seller.location?.city && (
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {listing.seller.location.city}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="h-4 w-4" />
                    <span>Identity Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <MessageSquare className="h-4 w-4" />
                    <span>Usually responds quickly</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Shield className="h-5 w-5" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p>Meet in a safe, public place</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p>Check the item carefully before buying</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p>Don't share personal information</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p>Trust your instincts</p>
                </div>
              </CardContent>
            </Card>

            {/* Ad ID */}
            <div className="text-center text-sm text-gray-500 bg-white p-4 rounded-lg border">
              <strong>AD ID {listing._id.slice(-6).toUpperCase()}</strong>
              <br />
              <button className="text-red-500 hover:underline mt-2">
                Report this ad
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
