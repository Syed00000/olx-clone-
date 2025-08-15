import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, ChevronDown, Plus } from "lucide-react";
import { categories } from "@/lib/categories";

interface HeaderProps {
  onSearch: (query: string) => void;
  onCategorySelect: (category: string) => void;
}

export default function Header({ onSearch, onCategorySelect }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-olx-primary text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <img 
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&w=120&h=40&fit=crop" 
                alt="OLX Logo" 
                className="h-8 w-20 object-contain cursor-pointer"
              />
            </Link>
            
            {/* Location Selector */}
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">India</span>
              <ChevronDown className="h-3 w-3" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Find Cars, Mobile Phones and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 text-gray-900 bg-white rounded-lg border-2 border-transparent focus:border-olx-accent focus:outline-none"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Button 
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-olx-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Select defaultValue="en">
              <SelectTrigger className="w-[100px] bg-transparent border border-white border-opacity-30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">ENGLISH</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="link" className="text-white text-sm hover:underline p-0">
              Login
            </Button>
            
            <Link href="/post">
              <Button 
                className="bg-olx-accent text-olx-primary font-bold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                SELL
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="bg-white text-gray-700 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-8 h-12 overflow-x-auto">
            <Button 
              variant="link" 
              className="text-sm font-medium whitespace-nowrap text-gray-700 hover:text-olx-primary p-0"
              onClick={() => onCategorySelect("")}
            >
              ALL CATEGORIES
            </Button>
            {categories.slice(0, 7).map((category) => (
              <Button 
                key={category.id}
                variant="link"
                className="text-sm whitespace-nowrap text-gray-700 hover:text-olx-primary p-0"
                onClick={() => onCategorySelect(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
