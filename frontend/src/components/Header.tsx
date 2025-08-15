import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import { Search, MapPin, ChevronDown, Plus, Heart, MessageSquare, Bell, User, LogOut, Settings, Package } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
  onCategorySelect: (category: string) => void;
}

export default function Header({ onSearch, onCategorySelect }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Andaman & Nicobar Islands");
  const [location, setLocation] = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  
  const { user, isAuthenticated, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSellClick = () => {
    if (isAuthenticated) {
      setLocation('/post');
    } else {
      setAuthModalTab('login');
      setShowAuthModal(true);
    }
  };

  const openAuthModal = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Main Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="bg-gradient-to-r from-yellow-400 via-blue-400 to-cyan-400 rounded-full p-2 mr-2">
                  <span className="text-black font-bold text-lg">olx</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Location Selector */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-sm font-medium border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  <Search className="w-4 h-4" />
                  <span className="max-w-48 truncate">{selectedCity}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuItem onClick={() => setSelectedCity("Mumbai")}>Mumbai</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCity("Delhi")}>Delhi</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCity("Bangalore")}>Bangalore</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCity("Hyderabad")}>Hyderabad</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCity("Chennai")}>Chennai</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCity("Pune")}>Pune</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <Input
                type="text"
                placeholder='Search "Properties"'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 h-12 border-2 border-gray-700 rounded-md focus:border-cyan-400 focus:ring-0"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-10 w-10 bg-gray-800 hover:bg-gray-700"
              >
                <Search className="w-5 h-5 text-white" />
              </Button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center space-x-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium flex items-center space-x-1">
                  <span>ENGLISH</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>हिंदी</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                    <Heart className="w-5 h-5" />
                  </Button>
                </Link>
                
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <MessageSquare className="w-5 h-5" />
                </Button>
                
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <Bell className="w-5 h-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.avatar} alt={user?.username} />
                        <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-blue-400 text-black font-bold">
                          {user?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        My Ads
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => openAuthModal('login')}>
                  Login
                </Button>
                <Button variant="outline" onClick={() => openAuthModal('register')}>
                  Register
                </Button>
              </div>
            )}

            {/* Sell Button - Exact OLX Style */}
            <Button 
              onClick={handleSellClick}
              className="bg-gradient-to-r from-yellow-400 to-blue-400 hover:from-yellow-500 hover:to-blue-500 text-black font-bold px-8 py-3 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              + SELL
            </Button>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />
    </header>
  );
}
