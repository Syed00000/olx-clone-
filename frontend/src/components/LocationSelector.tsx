import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, ChevronDown, Search } from "lucide-react";

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationSelect: (location: string) => void;
  className?: string;
}

const popularCities = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", 
  "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur",
  "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad",
  "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik"
];

const states = [
  "Andaman & Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", 
  "Bihar", "Chandigarh", "Chhattisgarh", "Delhi", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function LocationSelector({ selectedLocation, onLocationSelect, className }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const filteredCities = popularCities.filter(city =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = (location: string) => {
    onLocationSelect(location);
    setIsOpen(false);
  };

  const displayLocation = selectedLocation || "All India";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className={`flex items-center space-x-2 ${className}`}>
          <MapPin className="h-4 w-4" />
          <span>{displayLocation}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search for a city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* All India Option */}
          <Button
            variant={selectedLocation === "" ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => handleLocationSelect("")}
          >
            <MapPin className="h-4 w-4 mr-2" />
            All India
          </Button>

          {/* Popular Cities */}
          {searchQuery === "" && (
            <div>
              <h3 className="font-medium text-sm text-gray-700 mb-2">Popular Cities</h3>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {popularCities.slice(0, 20).map((city) => (
                  <Button
                    key={city}
                    variant={selectedLocation === city ? "default" : "outline"}
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => handleLocationSelect(city)}
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery !== "" && (
            <div>
              <h3 className="font-medium text-sm text-gray-700 mb-2">Search Results</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <Button
                      key={city}
                      variant={selectedLocation === city ? "default" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => handleLocationSelect(city)}
                    >
                      {city}
                    </Button>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No cities found</p>
                    <p className="text-xs mt-1">Try searching with different keywords</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* State Selection */}
          {searchQuery === "" && (
            <div>
              <h3 className="font-medium text-sm text-gray-700 mb-2">Select by State</h3>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedState && (
                <Button
                  className="w-full mt-2"
                  onClick={() => handleLocationSelect(selectedState)}
                >
                  Select {selectedState}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
