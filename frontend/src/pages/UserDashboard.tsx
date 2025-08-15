import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import { 
  User, 
  Settings, 
  Package, 
  Heart, 
  MessageSquare, 
  Plus,
  Edit3,
  Eye,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Shield,
  Trash2
} from 'lucide-react';

interface UserListing {
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
  status: string;
  views: number;
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

export default function UserDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch user's listings
  const { data: userListings, isLoading: loadingListings } = useQuery<UserListing[]>({
    queryKey: ['userListings'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/my-listings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch listings');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch user's favorites
  const { data: userFavorites, isLoading: loadingFavorites } = useQuery<UserListing[]>({
    queryKey: ['userFavorites'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/my-favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch favorites');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete listing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast({
        title: "Success!",
        description: "Your ad has been deleted successfully.",
      });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ad. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteListing = (listingId: string) => {
    if (deleteConfirmId === listingId) {
      deleteListingMutation.mutate(listingId);
    } else {
      setDeleteConfirmId(listingId);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Login Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Please login to access your dashboard.</p>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const activeListings = userListings?.filter(listing => listing.status === 'active') || [];
  const totalViews = userListings?.reduce((sum, listing) => sum + listing.views, 0) || 0;
  const totalFavorites = userListings?.reduce((sum, listing) => sum + listing.favorites.length, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={() => {}} onCategorySelect={() => {}} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback className="text-2xl bg-gradient-to-r from-yellow-400 to-blue-400 text-black font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
                  {user?.isVerified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4 text-sm text-gray-600">
                  {user?.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  
                  {user?.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  
                  {user?.location?.city && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location.city}{user.location.state && `, ${user.location.state}`}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{activeListings.length}</p>
                  <p className="text-sm text-gray-600">Active Ads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Eye className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Heart className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{totalFavorites}</p>
                  <p className="text-sm text-gray-600">Favorites Received</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">My Ads</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Listings ({userListings?.length || 0})</CardTitle>
                  <Link href="/post">
                    <Button className="bg-gradient-to-r from-yellow-400 to-blue-400 hover:from-yellow-500 hover:to-blue-500 text-black font-bold">
                      <Plus className="w-4 h-4 mr-2" />
                      Post New Ad
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingListings ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
                    ))}
                  </div>
                ) : userListings && userListings.length > 0 ? (
                  <div className="space-y-4">
                    {userListings.map((listing) => (
                      <div key={listing._id} className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <img
                          src={listing.images[0]?.url || 'https://via.placeholder.com/150'}
                          alt={listing.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                            <Badge className={getStatusColor(listing.status)}>
                              {listing.status}
                            </Badge>
                          </div>
                          
                          <p className="text-green-600 font-bold text-lg">
                            ₹ {listing.price.toLocaleString()}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                            <span className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{listing.views} views</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{listing.favorites.length} favorites</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(listing.createdAt)}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link href={`/listing/${listing._id}`}>
                            <Button variant="outline" size="sm" title="View Ad">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/edit/${listing._id}`}>
                            <Button variant="outline" size="sm" title="Edit Ad">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant={deleteConfirmId === listing._id ? "destructive" : "outline"} 
                            size="sm"
                            title={deleteConfirmId === listing._id ? "Click again to confirm delete" : "Delete Ad"}
                            onClick={() => handleDeleteListing(listing._id)}
                            disabled={deleteListingMutation.isPending}
                          >
                            {deleteListingMutation.isPending && deleteConfirmId === listing._id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No ads posted yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start selling by posting your first ad
                    </p>
                    <Link href="/post">
                      <Button className="bg-gradient-to-r from-yellow-400 to-blue-400 hover:from-yellow-500 hover:to-blue-500 text-black font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        Post Your First Ad
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Favorites ({userFavorites?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingFavorites ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
                    ))}
                  </div>
                ) : userFavorites && userFavorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userFavorites.map((listing) => (
                      <ProductCard key={listing._id} listing={listing as any} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-600 mb-4">
                      Save interesting items to view them later
                    </p>
                    <Link href="/">
                      <Button>Browse Listings</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600 mb-4">
                    Messages from buyers and sellers will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
