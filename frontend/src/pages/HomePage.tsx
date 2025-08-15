import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Grid, List, Search, Car, Smartphone, Home, Monitor, Bike, Shirt, Briefcase, Sofa } from "lucide-react";

// MongoDB Listing interface
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

interface ListingsResponse {
  listings: Listing[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface Category {
  _id: string;
  name: string;
  icon: string;
  subcategories: Array<{
    name: string;
  }>;
}

const categoryIcons: Record<string, any> = {
  'Mobiles': Smartphone,
  'Cars': Car,
  'Properties': Home,
  'Electronics & Appliances': Monitor,
  'Bikes': Bike,
  'Fashion': Shirt,
  'Jobs': Briefcase,
  'Furniture': Sofa,
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("createdAt");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedLocation) params.append('city', selectedLocation);
    if (priceRange.min) params.append('minPrice', priceRange.min);
    if (priceRange.max) params.append('maxPrice', priceRange.max);
    params.append('sortBy', sortBy);
    params.append('page', currentPage.toString());
    params.append('limit', '20');
    return params.toString();
  };

  const { data: listingsData, isLoading } = useQuery<ListingsResponse>({
    queryKey: ['listings', searchQuery, selectedCategory, selectedLocation, priceRange, sortBy, currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/listings?${buildQueryParams()}`);
      if (!response.ok) throw new Error("Failed to fetch listings");
      return response.json();
    },
  });

  const { data: featuredListings } = useQuery<Listing[]>({
    queryKey: ['featured-listings'],
    queryFn: async () => {
      const response = await fetch('/api/listings/featured');
      if (!response.ok) throw new Error('Failed to fetch featured listings');
      return response.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header 
        onSearch={setSearchQuery}
        onCategorySelect={setSelectedCategory}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 rounded-lg p-1 mb-8">
          <div className="bg-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">🎉 Freedom Day Celebration</h2>
                <p className="text-blue-100">Tricolour Treats Awaits You</p>
                <Button className="bg-blue-700 text-white px-6 py-2 rounded-lg mt-4 hover:bg-blue-800">
                  Learn More →
                </Button>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&w=200&h=120&fit=crop" 
                  alt="People celebrating Independence Day" 
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fresh Recommendations */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Fresh recommendations</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Categories Section */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categories && categories.slice(0, 12).map((category) => {
                    const IconComponent = categoryIcons[category.name] || Monitor;
                    return (
                      <Link key={category._id} href={`/category/${encodeURIComponent(category.name)}`}>
                        <Card 
                          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-white border-2 hover:border-cyan-400"
                        >
                          <CardContent className="p-6 text-center">
                            <IconComponent className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                            <h3 className="text-sm font-medium text-gray-900 leading-tight">
                              {category.name}
                            </h3>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* Featured Listings */}
              {featuredListings && featuredListings.length > 0 && (
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Featured Ads</h2>
                    <div className="bg-gradient-to-r from-yellow-400 to-blue-400 px-3 py-1 rounded-full">
                      <span className="text-black font-semibold text-sm">FEATURED</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredListings.slice(0, 6).map((listing) => (
                      <ProductCard key={listing._id} listing={listing} variant="featured" />
                    ))}
                  </div>
                </section>
              )}

              {/* All Listings */}
              <section>
                <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {listingsData ? `${listingsData.pagination.totalItems.toLocaleString()} ads found` : 'All ads'}
                    </h2>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48 border-2 focus:border-cyan-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Latest First</SelectItem>
                        <SelectItem value="price">Price: Low to High</SelectItem>
                        <SelectItem value="-price">Price: High to Low</SelectItem>
                        <SelectItem value="views">Most Viewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={viewMode === 'grid' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={viewMode === 'list' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {listingsData && listingsData.listings.length > 0 ? (
                    listingsData.listings.map((listing) => (
                      <ProductCard 
                        key={listing._id} 
                        listing={listing} 
                        variant={viewMode}
                      />
                    ))
                  ) : (
                    <div className="col-span-full">
                      <Card className="text-center py-12 bg-white shadow-sm border">
                        <CardContent>
                          <div className="mb-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                              <Search className="w-12 h-12 text-gray-400" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold mb-2 text-gray-900">No ads found</h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {searchQuery || selectedCategory || selectedLocation ? 
                              "No listings match your search criteria. Try adjusting your filters." :
                              "No listings available at the moment. Be the first to post an ad!"}
                          </p>
                          {(searchQuery || selectedCategory || selectedLocation) && (
                            <Button onClick={() => {
                              setSearchQuery("");
                              setSelectedCategory("");
                              setSelectedLocation("");
                              setPriceRange({ min: "", max: "" });
                              setCurrentPage(1);
                            }} className="bg-cyan-600 hover:bg-cyan-700 mr-4">
                              Clear All Filters
                            </Button>
                          )}
                          <Link href="/post">
                            <Button className="bg-gradient-to-r from-yellow-400 to-blue-400 hover:from-yellow-500 hover:to-blue-500 text-black font-bold">
                              Post the First Ad
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  
                  {/* Want to see your stuff here? Card */}
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white flex flex-col justify-center items-center text-center shadow-lg">
                    <h3 className="text-lg font-bold mb-2">Want to see your stuff here?</h3>
                    <p className="text-blue-100 text-sm mb-4">
                      Make some extra cash by selling things in your community. Go on, it's quick and easy.
                    </p>
                    <Link href="/post">
                      <Button 
                        className="bg-white text-blue-600 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 hover:scale-105 transition-all"
                      >
                        Start Selling
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Pagination */}
                {listingsData && listingsData.pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    <Button
                      variant="outline"
                      disabled={!listingsData.pagination.hasPrev}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="border-2 hover:border-cyan-400"
                    >
                      Previous
                    </Button>
                    
                    {[...Array(Math.min(5, listingsData.pagination.totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-2 hover:border-cyan-400'}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      disabled={!listingsData.pagination.hasNext}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="border-2 hover:border-cyan-400"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </section>
            </>
          )}

          <div className="text-center mt-8">
            <Button variant="link" className="text-olx-primary font-medium">
              load more
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">POPULAR CATEGORIES</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-olx-accent">Cars</a></li>
                <li><a href="#" className="hover:text-olx-accent">Flats for rent</a></li>
                <li><a href="#" className="hover:text-olx-accent">Mobile Phones</a></li>
                <li><a href="#" className="hover:text-olx-accent">Jobs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">TRENDING SEARCHES</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-olx-accent">Bikes</a></li>
                <li><a href="#" className="hover:text-olx-accent">Watches</a></li>
                <li><a href="#" className="hover:text-olx-accent">Books</a></li>
                <li><a href="#" className="hover:text-olx-accent">Dogs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">ABOUT US</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-olx-accent">About OLX Group</a></li>
                <li><a href="#" className="hover:text-olx-accent">Careers</a></li>
                <li><a href="#" className="hover:text-olx-accent">Contact Us</a></li>
                <li><a href="#" className="hover:text-olx-accent">OLXPeople</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">OLX</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-olx-accent">Help</a></li>
                <li><a href="#" className="hover:text-olx-accent">Sitemap</a></li>
                <li><a href="#" className="hover:text-olx-accent">Legal & Privacy info</a></li>
                <li><a href="#" className="hover:text-olx-accent">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 OLX. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
