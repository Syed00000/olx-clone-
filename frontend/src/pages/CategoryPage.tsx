import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Heart, ChevronDown, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  location: {
    city: string;
    state: string;
  };
  category: string;
  subcategory: string;
  condition: string;
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  isUrgent: boolean;
}

export default function CategoryPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Extract category from URL params or use "All Categories" as default
  const currentCategory = decodeURIComponent(params.category || "");
  const currentSubcategory = decodeURIComponent(params.subcategory || "");

  const { data: listingsResponse, isLoading } = useQuery({
    queryKey: ['listings', currentCategory, currentSubcategory, searchQuery, sortBy, priceRange, selectedLocation],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (currentCategory) queryParams.append('category', currentCategory);
      if (currentSubcategory) queryParams.append('subcategory', currentSubcategory);
      if (searchQuery) queryParams.append('search', searchQuery);
      if (sortBy !== 'newest') queryParams.append('sort', sortBy);
      if (priceRange.min) queryParams.append('minPrice', priceRange.min);
      if (priceRange.max) queryParams.append('maxPrice', priceRange.max);
      if (selectedLocation) queryParams.append('location', selectedLocation);

      const response = await fetch(`/api/listings?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch listings');
      return response.json();
    },
  });

  // Extract listings from response - handle both array and object structures
  const listings = Array.isArray(listingsResponse) 
    ? listingsResponse 
    : listingsResponse?.listings || [];

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled automatically by the query dependencies
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search Bar */}
          <div className="flex items-center justify-between py-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-olx-primary">OLX</h1>
            </Link>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Find Cars, Mobile Phones and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 rounded-md"
                />
              </div>
            </form>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>All India</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              <Link href="/post">
                <Button className="bg-gradient-to-r from-yellow-400 to-blue-400 hover:from-yellow-500 hover:to-blue-500 text-black font-bold px-6">
                  + SELL
                </Button>
              </Link>
            </div>
          </div>

          {/* Breadcrumb */}
          {currentCategory && (
            <div className="pb-4 flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-olx-primary">Home</Link>
              <span>›</span>
              <span className="font-medium text-gray-900">{currentCategory}</span>
              {currentSubcategory && (
                <>
                  <span>›</span>
                  <span className="font-medium text-gray-900">{currentSubcategory}</span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Title & Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentCategory ? `${currentCategory} in All India` : "All Categories in All India"}
            </h2>
            <p className="text-gray-600 mt-1">
              {listings.length || 0} ads • View all results
            </p>
          </div>
          
          {/* Sort & Filter Controls */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Date published</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      type="number"
                    />
                    <Input
                      placeholder="Max" 
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      type="number"
                    />
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All locations</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Chennai">Chennai</SelectItem>
                      <SelectItem value="Kolkata">Kolkata</SelectItem>
                      <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                      <SelectItem value="Pune">Pune</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter (if not already filtered) */}
                {!currentCategory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <Select onValueChange={(value) => setLocation(`/category/${value}`)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category: any) => (
                          <SelectItem key={category._id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setPriceRange({ min: "", max: "" });
                      setSelectedLocation("");
                      setSearchQuery("");
                    }}
                    className="w-full"
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <div className="space-x-4">
              <Button onClick={() => setSearchQuery("")}>Clear search</Button>
              <Button variant="outline" onClick={() => {
                setPriceRange({ min: "", max: "" });
                setSelectedLocation("");
                setShowFilters(false);
              }}>
                Remove all filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ProductCard 
                key={listing._id} 
                listing={listing} 
                variant="grid"
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {listings.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load more ads
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
