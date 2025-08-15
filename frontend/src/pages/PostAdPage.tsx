import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X, Plus, Camera, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";

interface Category {
  _id: string;
  name: string;
  icon: string;
  subcategories: Array<{
    name: string;
    attributes: Array<{
      name: string;
      type: string;
      options?: string[];
      required?: boolean;
    }>;
  }>;
}

interface FormData {
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  condition: string;
  location: {
    city: string;
    state: string;
  };
  images: File[];
  attributes: Record<string, any>;
  isUrgent: boolean;
}

export default function PostAdPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"category" | "form">("category");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: 0,
    category: "",
    subcategory: "",
    condition: "Good",
    location: {
      city: "",
      state: ""
    },
    images: [],
    attributes: {},
    isUrgent: false
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (listingData: FormData) => {
      const formDataObj = new FormData();
      
      // Add text fields
      formDataObj.append('title', listingData.title);
      formDataObj.append('description', listingData.description);
      formDataObj.append('price', listingData.price.toString());
      formDataObj.append('category', listingData.category);
      formDataObj.append('subcategory', listingData.subcategory);
      formDataObj.append('condition', listingData.condition);
      formDataObj.append('location', JSON.stringify(listingData.location));
      formDataObj.append('attributes', JSON.stringify(listingData.attributes));
      formDataObj.append('isUrgent', listingData.isUrgent.toString());
      
      // Add images
      listingData.images.forEach((image, index) => {
        formDataObj.append('images', image);
      });

      const token = localStorage.getItem('token');
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataObj,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create listing");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast({
        title: "Success!",
        description: "Your ad has been posted successfully.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post your ad. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCategorySelect = (category: Category, subcategory?: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory || "");
    setFormData(prev => ({
      ...prev,
      category: category.name,
      subcategory: subcategory || ""
    }));
    setStep("form");
  };

  const handleBackToCategories = () => {
    setStep("category");
    setSelectedCategory(null);
    setSelectedSubcategory("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.images.length + files.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 10 images",
        variant: "destructive"
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price || !formData.location.city) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.images.length === 0) {
      toast({
        title: "No images",
        description: "Please upload at least one image",
        variant: "destructive"
      });
      return;
    }

    createListingMutation.mutate(formData);
  };

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <Lock className="w-6 h-6" />
              <span>Login Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You need to be logged in to post an ad.
            </p>
            <div className="space-y-2">
              <Button onClick={() => setShowAuthModal(true)} className="w-full bg-gradient-to-r from-yellow-400 to-blue-400 hover:from-yellow-500 hover:to-blue-500 text-black font-bold">
                Login / Register
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Go to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          defaultTab="login"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">POST YOUR AD</h1>
            </div>
            {step === "form" && selectedCategory && (
              <Button
                variant="ghost"
                onClick={handleBackToCategories}
                className="text-olx-primary hover:underline"
              >
                Change
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {step === "category" ? (
          // Category Selection - Exact OLX Style
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">CHOOSE A CATEGORY</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                  {/* Left Column - Main Categories */}
                  <div className="border-r border-gray-200">
                    {categories?.map((category, index) => {
                      const isSelected = selectedCategory?.name === category.name;
                      return (
                        <div 
                          key={category._id}
                          className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                          onClick={() => {
                            if (category.subcategories.length === 0) {
                              handleCategorySelect(category);
                            } else {
                              setSelectedCategory(category);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 text-gray-600">
                                {category.name === 'Cars' && <span>🚗</span>}
                                {category.name === 'Properties' && <span>🏠</span>}
                                {category.name === 'Mobiles' && <span>📱</span>}
                                {category.name === 'Jobs' && <span>💼</span>}
                                {category.name === 'Bikes' && <span>🏍️</span>}
                                {category.name === 'Electronics & Appliances' && <span>📺</span>}
                                {category.name === 'Fashion' && <span>👕</span>}
                                {!['Cars', 'Properties', 'Mobiles', 'Jobs', 'Bikes', 'Electronics & Appliances', 'Fashion'].includes(category.name) && <span>📦</span>}
                              </div>
                              <span className={`font-medium ${
                                isSelected ? 'text-blue-700' : 'text-gray-900'
                              }`}>{category.name}</span>
                            </div>
                            {category.subcategories.length > 0 && (
                              <span className="text-gray-400">›</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Right Column - Subcategories */}
                  <div className="">
                    {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 ? (
                      selectedCategory.subcategories.map((sub, index) => (
                        <div 
                          key={sub.name}
                          className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleCategorySelect(selectedCategory, sub.name)}
                        >
                          <span className="text-gray-700">{sub.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p>Select a category to see options</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Ad Form
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            {/* Category Info */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Category</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {selectedCategory?.name} {selectedSubcategory && `> ${selectedSubcategory}`}
                </p>
              </CardContent>
            </Card>

            {/* Category-specific form fields */}
            {selectedCategory?.name === 'Cars' ? (
              // Cars Form - OLX Style
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>CAR DETAILS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Car Brand */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Brand *</Label>
                      <Select 
                        value={formData.attributes.brand || ""} 
                        onValueChange={(value) => setFormData(prev => ({
                          ...prev,
                          attributes: { ...prev.attributes, brand: value }
                        }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Maruti Suzuki">Maruti Suzuki</SelectItem>
                          <SelectItem value="Hyundai">Hyundai</SelectItem>
                          <SelectItem value="Tata">Tata</SelectItem>
                          <SelectItem value="Mahindra">Mahindra</SelectItem>
                          <SelectItem value="Honda">Honda</SelectItem>
                          <SelectItem value="Toyota">Toyota</SelectItem>
                          <SelectItem value="Renault">Renault</SelectItem>
                          <SelectItem value="Ford">Ford</SelectItem>
                          <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                          <SelectItem value="Skoda">Skoda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Year */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="year">Year *</Label>
                        <Select 
                          value={formData.attributes.year || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, year: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 25}, (_, i) => {
                              const year = 2024 - i;
                              return (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="fuelType">Fuel Type *</Label>
                        <Select 
                          value={formData.attributes.fuelType || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, fuelType: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Fuel Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Petrol">Petrol</SelectItem>
                            <SelectItem value="Diesel">Diesel</SelectItem>
                            <SelectItem value="CNG">CNG</SelectItem>
                            <SelectItem value="Electric">Electric</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* KM Driven */}
                    <div>
                      <Label htmlFor="kmDriven">KM driven *</Label>
                      <Input
                        id="kmDriven"
                        placeholder="e.g., 25000 km, 1.2 lakh km, 50000"
                        value={formData.attributes.kmDriven || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          attributes: { ...prev.attributes, kmDriven: e.target.value }
                        }))}
                        className="mt-1"
                        required
                      />
                    </div>

                    {/* Car Title */}
                    <div>
                      <Label htmlFor="carTitle">Ad title *</Label>
                      <Input
                        id="carTitle"
                        placeholder="Mention the key features (e.g. brand, model, year)"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                        required
                      />
                    </div>

                    {/* Car Description */}
                    <div>
                      <Label htmlFor="carDescription">Description *</Label>
                      <Textarea
                        id="carDescription"
                        placeholder="Include condition, features and reason for selling"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        className="mt-1"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Car Price */}
                <Card>
                  <CardHeader>
                    <CardTitle>SET A PRICE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="carPrice">Price *</Label>
                      <Input
                        id="carPrice"
                        placeholder="e.g., 5 lakh, 750000, 12.5 lakh"
                        value={formData.price || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="mt-1"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : selectedCategory?.name === 'Properties' ? (
              // Properties Form - OLX Style
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>PROPERTY DETAILS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Property Type */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Property Type *</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Apartment', 'Independent House', 'Builder Floor', 'Studio Apartment', 'Villa'].map((type) => (
                          <Button
                            key={type}
                            type="button"
                            variant={formData.attributes.propertyType === type ? "default" : "outline"}
                            className="text-sm px-4 py-2"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              attributes: { ...prev.attributes, propertyType: type }
                            }))}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Bedrooms & Bathrooms */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bedrooms">Bedrooms *</Label>
                        <Select 
                          value={formData.attributes.bedrooms || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, bedrooms: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Bedrooms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 BHK</SelectItem>
                            <SelectItem value="2">2 BHK</SelectItem>
                            <SelectItem value="3">3 BHK</SelectItem>
                            <SelectItem value="4">4 BHK</SelectItem>
                            <SelectItem value="5+">5+ BHK</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="bathrooms">Bathrooms *</Label>
                        <Select 
                          value={formData.attributes.bathrooms || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, bathrooms: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Bathrooms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5+">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Area */}
                    <div>
                      <Label htmlFor="area">Carpet Area (sq ft) *</Label>
                      <Input
                        id="area"
                        placeholder="e.g., 1200 sq ft, 850, 2000 sq ft"
                        value={formData.attributes.area || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          attributes: { ...prev.attributes, area: e.target.value }
                        }))}
                        className="mt-1"
                        required
                      />
                    </div>

                    {/* Property Title */}
                    <div>
                      <Label htmlFor="propertyTitle">Ad title *</Label>
                      <Input
                        id="propertyTitle"
                        placeholder="Mention the key features (e.g. 2 BHK, Furnished, Parking)"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                        required
                      />
                    </div>

                    {/* Property Description */}
                    <div>
                      <Label htmlFor="propertyDescription">Description *</Label>
                      <Textarea
                        id="propertyDescription"
                        placeholder="Include amenities, nearby landmarks, furnishing details"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        className="mt-1"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Property Price */}
                <Card>
                  <CardHeader>
                    <CardTitle>SET A PRICE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="propertyPrice">Price *</Label>
                      <Input
                        id="propertyPrice"
                        placeholder="e.g., 50 lakh, 1.2 crore, 75 lakh"
                        value={formData.price || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="mt-1"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : selectedCategory?.name === 'Mobiles' ? (
              // Mobiles Form - OLX Style
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>MOBILE DETAILS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Brand */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Brand *</Label>
                      <Select 
                        value={formData.attributes.brand || ""} 
                        onValueChange={(value) => setFormData(prev => ({
                          ...prev,
                          attributes: { ...prev.attributes, brand: value }
                        }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Apple">Apple</SelectItem>
                          <SelectItem value="Samsung">Samsung</SelectItem>
                          <SelectItem value="OnePlus">OnePlus</SelectItem>
                          <SelectItem value="Xiaomi">Xiaomi</SelectItem>
                          <SelectItem value="Vivo">Vivo</SelectItem>
                          <SelectItem value="Oppo">Oppo</SelectItem>
                          <SelectItem value="Realme">Realme</SelectItem>
                          <SelectItem value="Google">Google</SelectItem>
                          <SelectItem value="Huawei">Huawei</SelectItem>
                          <SelectItem value="Motorola">Motorola</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Model & Storage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mobileModel">Model *</Label>
                        <Input
                          id="mobileModel"
                          placeholder="e.g., iPhone 14 Pro, Galaxy S23, OnePlus 11"
                          value={formData.attributes.model || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, model: e.target.value }
                          }))}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="storage">Storage *</Label>
                        <Select 
                          value={formData.attributes.storage || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, storage: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Storage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="32GB">32GB</SelectItem>
                            <SelectItem value="64GB">64GB</SelectItem>
                            <SelectItem value="128GB">128GB</SelectItem>
                            <SelectItem value="256GB">256GB</SelectItem>
                            <SelectItem value="512GB">512GB</SelectItem>
                            <SelectItem value="1TB">1TB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* RAM & Color */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ram">RAM *</Label>
                        <Select 
                          value={formData.attributes.ram || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, ram: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select RAM" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2GB">2GB</SelectItem>
                            <SelectItem value="3GB">3GB</SelectItem>
                            <SelectItem value="4GB">4GB</SelectItem>
                            <SelectItem value="6GB">6GB</SelectItem>
                            <SelectItem value="8GB">8GB</SelectItem>
                            <SelectItem value="12GB">12GB</SelectItem>
                            <SelectItem value="16GB">16GB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="color">Color *</Label>
                        <Select 
                          value={formData.attributes.color || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, color: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Black">Black</SelectItem>
                            <SelectItem value="White">White</SelectItem>
                            <SelectItem value="Blue">Blue</SelectItem>
                            <SelectItem value="Red">Red</SelectItem>
                            <SelectItem value="Gold">Gold</SelectItem>
                            <SelectItem value="Silver">Silver</SelectItem>
                            <SelectItem value="Green">Green</SelectItem>
                            <SelectItem value="Purple">Purple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Battery & Age */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="battery">Battery Health</Label>
                        <Input
                          id="battery"
                          placeholder="e.g., 85%, Good, Excellent"
                          value={formData.attributes.battery || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, battery: e.target.value }
                          }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Age of Phone *</Label>
                        <Select 
                          value={formData.attributes.age || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, age: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Age" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Less than 6 months">Less than 6 months</SelectItem>
                            <SelectItem value="6 months to 1 year">6 months to 1 year</SelectItem>
                            <SelectItem value="1 to 2 years">1 to 2 years</SelectItem>
                            <SelectItem value="2 to 3 years">2 to 3 years</SelectItem>
                            <SelectItem value="3 to 4 years">3 to 4 years</SelectItem>
                            <SelectItem value="More than 4 years">More than 4 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <Label htmlFor="mobileTitle">Ad title *</Label>
                      <Input
                        id="mobileTitle"
                        placeholder="e.g., iPhone 14 Pro 128GB Space Black - Excellent Condition"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="mobileDescription">Description *</Label>
                      <Textarea
                        id="mobileDescription"
                        placeholder="Include details like accessories included, warranty status, any issues, etc."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        className="mt-1"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SET A PRICE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="mobilePrice">Price *</Label>
                      <Input
                        id="mobilePrice"
                        placeholder="e.g., 45000, 1.2 lakh, 25000"
                        value={formData.price || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="mt-1"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : selectedCategory?.name === 'Electronics & Appliances' ? (
              // Electronics Form
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>ELECTRONICS DETAILS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Type & Brand */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Type *</Label>
                        <Select 
                          value={formData.attributes.type || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, type: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Laptop">Laptop</SelectItem>
                            <SelectItem value="Desktop">Desktop</SelectItem>
                            <SelectItem value="TV">TV</SelectItem>
                            <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                            <SelectItem value="Washing Machine">Washing Machine</SelectItem>
                            <SelectItem value="AC">Air Conditioner</SelectItem>
                            <SelectItem value="Microwave">Microwave</SelectItem>
                            <SelectItem value="Gaming Console">Gaming Console</SelectItem>
                            <SelectItem value="Camera">Camera</SelectItem>
                            <SelectItem value="Speaker">Speaker</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Brand *</Label>
                        <Input
                          placeholder="e.g., Dell, Samsung, LG, Sony, HP"
                          value={formData.attributes.brand || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, brand: e.target.value }
                          }))}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>

                    {/* Model & Year */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="electronicsModel">Model *</Label>
                        <Input
                          id="electronicsModel"
                          placeholder="e.g., Dell Inspiron 15 3000, MacBook Air M2"
                          value={formData.attributes.model || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, model: e.target.value }
                          }))}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="purchaseYear">Purchase Year</Label>
                        <Select 
                          value={formData.attributes.purchaseYear || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, purchaseYear: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 10}, (_, i) => {
                              const year = 2024 - i;
                              return (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Specifications */}
                    <div>
                      <Label htmlFor="specifications">Specifications</Label>
                      <Textarea
                        id="specifications"
                        placeholder="e.g., Intel i5, 8GB RAM, 256GB SSD, 15.6 inch display"
                        value={formData.attributes.specifications || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          attributes: { ...prev.attributes, specifications: e.target.value }
                        }))}
                        rows={3}
                      />
                    </div>

                    {/* Title & Description */}
                    <div>
                      <Label htmlFor="electronicsTitle">Ad title *</Label>
                      <Input
                        id="electronicsTitle"
                        placeholder="e.g., Dell Laptop i5 8GB RAM - Excellent Condition"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="electronicsDescription">Description *</Label>
                      <Textarea
                        id="electronicsDescription"
                        placeholder="Include warranty status, accessories, any defects, etc."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SET A PRICE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="electronicsPrice">Price *</Label>
                      <Input
                        id="electronicsPrice"
                        placeholder="e.g., 35000, 1.5 lakh, 65000"
                        value={formData.price || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="mt-1"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : selectedCategory?.name === 'Fashion' ? (
              // Fashion Form
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>FASHION ITEM DETAILS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Type & Brand */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Type *</Label>
                        <Select 
                          value={formData.attributes.type || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, type: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="T-Shirt">T-Shirt</SelectItem>
                            <SelectItem value="Shirt">Shirt</SelectItem>
                            <SelectItem value="Jeans">Jeans</SelectItem>
                            <SelectItem value="Dress">Dress</SelectItem>
                            <SelectItem value="Jacket">Jacket</SelectItem>
                            <SelectItem value="Shoes">Shoes</SelectItem>
                            <SelectItem value="Watch">Watch</SelectItem>
                            <SelectItem value="Bag">Bag</SelectItem>
                            <SelectItem value="Saree">Saree</SelectItem>
                            <SelectItem value="Kurta">Kurta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="fashionBrand">Brand *</Label>
                        <Input
                          id="fashionBrand"
                          placeholder="e.g., Nike, Adidas, Zara, H&M, Uniqlo"
                          value={formData.attributes.brand || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, brand: e.target.value }
                          }))}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>

                    {/* Size & Color */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Size *</Label>
                        <Select 
                          value={formData.attributes.size || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, size: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="XS">XS</SelectItem>
                            <SelectItem value="S">S</SelectItem>
                            <SelectItem value="M">M</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="XL">XL</SelectItem>
                            <SelectItem value="XXL">XXL</SelectItem>
                            <SelectItem value="XXXL">XXXL</SelectItem>
                            <SelectItem value="Free Size">Free Size</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Color *</Label>
                        <Input
                          placeholder="e.g., Red, Blue, Multi-color, Black, White"
                          value={formData.attributes.color || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, color: e.target.value }
                          }))}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>

                    {/* Style Details */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Style Details</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Full Sleeve', 'Half Sleeve', 'Sleeveless', 'Casual', 'Formal', 'Ethnic', 'Western', 'Party Wear'].map((style) => (
                          <Button
                            key={style}
                            type="button"
                            variant={(formData.attributes.styleDetails || []).includes(style) ? "default" : "outline"}
                            className="text-sm px-3 py-1"
                            onClick={() => {
                              const currentStyles = formData.attributes.styleDetails || [];
                              const newStyles = currentStyles.includes(style)
                                ? currentStyles.filter((s: string) => s !== style)
                                : [...currentStyles, style];
                              setFormData(prev => ({
                                ...prev,
                                attributes: { ...prev.attributes, styleDetails: newStyles }
                              }));
                            }}
                          >
                            {style}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <Label htmlFor="fashionTitle">Ad title *</Label>
                      <Input
                        id="fashionTitle"
                        placeholder="e.g., Nike T-Shirt Size L Blue - Like New"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="fashionDescription">Description *</Label>
                      <Textarea
                        id="fashionDescription"
                        placeholder="Include material, fit, occasions suitable for, any defects, etc."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SET A PRICE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="fashionPrice">Price *</Label>
                      <Input
                        id="fashionPrice"
                        placeholder="e.g., 2500, 5000, 1200"
                        value={formData.price || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="mt-1"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : selectedCategory?.name === 'Bikes' ? (
              // Bikes Form
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>BIKE DETAILS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Brand & Model */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Brand *</Label>
                        <Select 
                          value={formData.attributes.brand || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, brand: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Honda">Honda</SelectItem>
                            <SelectItem value="Bajaj">Bajaj</SelectItem>
                            <SelectItem value="TVS">TVS</SelectItem>
                            <SelectItem value="Hero">Hero</SelectItem>
                            <SelectItem value="Yamaha">Yamaha</SelectItem>
                            <SelectItem value="Royal Enfield">Royal Enfield</SelectItem>
                            <SelectItem value="KTM">KTM</SelectItem>
                            <SelectItem value="Suzuki">Suzuki</SelectItem>
                            <SelectItem value="Kawasaki">Kawasaki</SelectItem>
                            <SelectItem value="Harley Davidson">Harley Davidson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="bikeModel">Model *</Label>
                        <Input
                          id="bikeModel"
                          placeholder="e.g., Activa 6G, Pulsar 150, Apache RTR, Classic 350"
                          value={formData.attributes.model || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, model: e.target.value }
                          }))}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>

                    {/* Year & KM Driven */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bikeYear">Year *</Label>
                        <Select 
                          value={formData.attributes.year || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, year: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 20}, (_, i) => {
                              const year = 2024 - i;
                              return (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="bikeKm">KM driven *</Label>
                        <Input
                          id="bikeKm"
                          placeholder="e.g., 15000 km, 1.5 lakh km, 25000"
                          value={formData.attributes.kmDriven || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, kmDriven: e.target.value }
                          }))}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>

                    {/* Engine & Mileage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="engine">Engine (CC) *</Label>
                        <Input
                          id="engine"
                          placeholder="e.g., 150cc, 200 cc, 350cc"
                          value={formData.attributes.engine || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, engine: e.target.value }
                          }))}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="mileage">Mileage (km/l)</Label>
                        <Input
                          id="mileage"
                          placeholder="e.g., 45 km/l, 60 kmpl, 50"
                          value={formData.attributes.mileage || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, mileage: e.target.value }
                          }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Color & Owner */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bikeColor">Color *</Label>
                        <Input
                          id="bikeColor"
                          placeholder="e.g., Red, Black, Blue, White, Silver"
                          value={formData.attributes.color || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, color: e.target.value }
                          }))}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">No. of Owners *</Label>
                        <Select 
                          value={formData.attributes.owners || ""} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, owners: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Owners" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1st Owner">1st Owner</SelectItem>
                            <SelectItem value="2nd Owner">2nd Owner</SelectItem>
                            <SelectItem value="3rd Owner">3rd Owner</SelectItem>
                            <SelectItem value="4th Owner">4th Owner</SelectItem>
                            <SelectItem value="More than 4">More than 4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <Label htmlFor="bikeTitle">Ad title *</Label>
                      <Input
                        id="bikeTitle"
                        placeholder="e.g., Honda Activa 6G 2022 - Excellent Condition"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="bikeDescription">Description *</Label>
                      <Textarea
                        id="bikeDescription"
                        placeholder="Include service history, any accidents, modifications, etc."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SET A PRICE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="bikePrice">Price *</Label>
                      <Input
                        id="bikePrice"
                        placeholder="e.g., 85000, 1.2 lakh, 45000"
                        value={formData.price || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="mt-1"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : selectedCategory?.name === 'Jobs' ? (
              // Jobs Form - Exact OLX Style
              <>
                {/* Include Some Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>INCLUDE SOME DETAILS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Salary Period */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Salary period *</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Hourly', 'Monthly', 'Weekly', 'Yearly'].map((period) => (
                          <Button
                            key={period}
                            type="button"
                            variant={formData.attributes.salaryPeriod === period ? "default" : "outline"}
                            className="text-sm px-4 py-2"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              attributes: { ...prev.attributes, salaryPeriod: period }
                            }))}
                          >
                            {period}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Position Type */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Position type *</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Contract', 'Full-time', 'Part-time', 'Temporary'].map((type) => (
                          <Button
                            key={type}
                            type="button"
                            variant={formData.attributes.positionType === type ? "default" : "outline"}
                            className="text-sm px-4 py-2"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              attributes: { ...prev.attributes, positionType: type }
                            }))}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Salary Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salaryFrom">Salary from</Label>
                        <Input
                          id="salaryFrom"
                          placeholder="e.g., 25000, 3 lakh, 50000"
                          value={formData.attributes.salaryFrom || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, salaryFrom: e.target.value }
                          }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="salaryTo">Salary to</Label>
                        <Input
                          id="salaryTo"
                          placeholder="e.g., 45000, 5 lakh, 80000"
                          value={formData.attributes.salaryTo || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, salaryTo: e.target.value }
                          }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Job Title */}
                    <div>
                      <Label htmlFor="jobTitle">Ad title *</Label>
                      <Input
                        id="jobTitle"
                        placeholder="Mention the key features of your item (e.g. brand, model, age, type)"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Mention the key features of your item (e.g. brand, model, age, type)</p>
                    </div>

                    {/* Job Description */}
                    <div>
                      <Label htmlFor="jobDescription">Description *</Label>
                      <Textarea
                        id="jobDescription"
                        placeholder="Include condition, features and reason for selling"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        className="mt-1"
                        required
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Include condition, features and reason for selling</span>
                        <span>0 / 4096</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Set a price */}
                <Card>
                  <CardHeader>
                    <CardTitle>SET A PRICE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="jobPrice">Price *</Label>
                      <Input
                        id="jobPrice"
                        placeholder="e.g., 35000, 4.5 lakh, 60000"
                        value={formData.price || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="mt-1"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              // General Form for other categories
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Ad Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter a clear and descriptive title"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your item in detail"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        value={formData.price || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="e.g., 5000, 25000, 1 lakh"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="condition">Condition *</Label>
                      <Select 
                        value={formData.condition} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Like New">Like New</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                          <SelectItem value="Poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Images - OLX Style */}
            <Card>
              <CardHeader>
                <CardTitle>UPLOAD UP TO 10 PHOTOS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {/* First slot - Main photo */}
                  {formData.images.length === 0 ? (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors bg-gray-50">
                      <Camera className="h-8 w-8 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600 text-center">Add Photo</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="aspect-square relative border rounded-lg overflow-hidden">
                      <img 
                        src={URL.createObjectURL(formData.images[0])} 
                        alt="Main photo"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 p-1 h-6 w-6"
                        onClick={() => removeImage(0)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Additional photo slots */}
                  {Array.from({ length: 9 }, (_, index) => {
                    const imageIndex = index + 1;
                    const hasImage = formData.images[imageIndex];
                    
                    return hasImage ? (
                      <div key={imageIndex} className="aspect-square relative border rounded-lg overflow-hidden">
                        <img 
                          src={URL.createObjectURL(formData.images[imageIndex])} 
                          alt={`Photo ${imageIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 p-1 h-6 w-6"
                          onClick={() => removeImage(imageIndex)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : formData.images.length > imageIndex - 1 && formData.images.length < 10 ? (
                      <label key={imageIndex} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors">
                        <Plus className="h-6 w-6 text-gray-400 mb-1" />
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div key={imageIndex} className="aspect-square border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Plus className="h-6 w-6 text-gray-300" />
                      </div>
                    );
                  })}
                </div>
                {formData.images.length > 0 && (
                  <p className="text-xs text-green-600 mt-2">{formData.images.length}/10 photos uploaded</p>
                )}
                {formData.images.length === 0 && (
                  <p className="text-xs text-red-600 mt-2">At least 1 photo is required</p>
                )}
              </CardContent>
            </Card>

            {/* Location - OLX Style */}
            <Card>
              <CardHeader>
                <CardTitle>CONFIRM YOUR LOCATION</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Location Tabs */}
                  <div className="flex border-b">
                    <button 
                      type="button"
                      className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium text-sm"
                    >
                      LIST
                    </button>
                    <button 
                      type="button"
                      className="px-4 py-2 text-gray-500 text-sm"
                    >
                      CURRENT LOCATION
                    </button>
                  </div>
                  
                  {/* State Selection */}
                  <div>
                    <Label htmlFor="state-select" className="text-sm font-medium text-gray-700">State *</Label>
                    <Select 
                      value={formData.location.state} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, state: value }
                      }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Andaman & Nicobar Islands">Andaman & Nicobar Islands</SelectItem>
                        <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                        <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                        <SelectItem value="Assam">Assam</SelectItem>
                        <SelectItem value="Bihar">Bihar</SelectItem>
                        <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                        <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Goa">Goa</SelectItem>
                        <SelectItem value="Gujarat">Gujarat</SelectItem>
                        <SelectItem value="Haryana">Haryana</SelectItem>
                        <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                        <SelectItem value="Jammu & Kashmir">Jammu & Kashmir</SelectItem>
                        <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                        <SelectItem value="Karnataka">Karnataka</SelectItem>
                        <SelectItem value="Kerala">Kerala</SelectItem>
                        <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                        <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="Manipur">Manipur</SelectItem>
                        <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                        <SelectItem value="Mizoram">Mizoram</SelectItem>
                        <SelectItem value="Nagaland">Nagaland</SelectItem>
                        <SelectItem value="Odisha">Odisha</SelectItem>
                        <SelectItem value="Punjab">Punjab</SelectItem>
                        <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                        <SelectItem value="Sikkim">Sikkim</SelectItem>
                        <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                        <SelectItem value="Telangana">Telangana</SelectItem>
                        <SelectItem value="Tripura">Tripura</SelectItem>
                        <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                        <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                        <SelectItem value="West Bengal">West Bengal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* City Input */}
                  <div>
                    <Label htmlFor="city-input" className="text-sm font-medium text-gray-700">City *</Label>
                    <Input
                      id="city-input"
                      value={formData.location.city}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, city: e.target.value }
                      }))}
                      placeholder="Enter your city"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Options */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Options</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isUrgent}
                    onChange={(e) => setFormData(prev => ({ ...prev, isUrgent: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Mark as urgent (₹20 extra)</span>
                </label>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button 
                type="submit" 
                size="lg" 
                className="bg-gradient-to-r from-yellow-400 to-blue-400 hover:from-yellow-500 hover:to-blue-500 text-black font-bold px-12 py-4 text-lg"
                disabled={createListingMutation.isPending}
              >
                {createListingMutation.isPending ? "Posting..." : "Post My Ad"}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}