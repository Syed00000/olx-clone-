import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Listing } from "@shared/schema";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/listings", { search: searchQuery, category: selectedCategory }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      
      const response = await fetch(`/api/listings?${params}`);
      if (!response.ok) throw new Error("Failed to fetch listings");
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings?.map((listing, index) => (
                <ProductCard 
                  key={listing.id} 
                  listing={listing}
                  isFeatured={listing.isFeatured === "true"}
                />
              ))}
              
              {/* Want to see your stuff here? Card */}
              <div className="bg-blue-500 rounded-lg p-6 text-white flex flex-col justify-center items-center text-center col-span-1 sm:col-span-2">
                <h3 className="text-lg font-bold mb-2">Want to see your stuff here?</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Make some extra cash by selling things in your community. Go on, it's quick and easy.
                </p>
                <Link href="/post">
                  <Button 
                    className="bg-white text-blue-500 font-bold px-6 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Start Selling
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="link" className="text-olx-primary font-medium">
              load more
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-olx-primary text-white mt-16">
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
