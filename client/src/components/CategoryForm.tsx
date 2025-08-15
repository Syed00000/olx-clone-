import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ImageUpload from "./ImageUpload";
import { getCategoryById } from "@/lib/categories";
import type { InsertListing } from "@shared/schema";

interface CategoryFormProps {
  category: string;
  subcategory: string | null;
  onSubmit: (data: InsertListing) => void;
  isSubmitting: boolean;
}

// Dynamic form schema based on category and subcategory
const createFormSchema = (category: string, subcategory?: string) => {
  const baseSchema = {
    title: z.string().min(1, "Ad title is required"),
    description: z.string().min(1, "Description is required"),
    price: z.number().min(1, "Price must be greater than 0"),
    location: z.string().min(1, "Location is required"),
    images: z.array(z.string()).min(1, "At least one image is required"),
  };

  // Cars & Vehicles
  if (category === "cars") {
    return z.object({
      ...baseSchema,
      brand: z.string().min(1, "Brand is required"),
      model: z.string().min(1, "Model is required"),
      year: z.number().min(1990, "Year must be valid"),
      fuelType: z.string().min(1, "Fuel type is required"),
      kmDriven: z.number().min(0, "KM driven is required"),
      transmission: z.string().min(1, "Transmission type is required"),
      ownerNumber: z.string().min(1, "Owner number is required"),
    });
  }

  // Bikes & Motorcycles
  if (category === "bikes") {
    return z.object({
      ...baseSchema,
      brand: z.string().min(1, "Brand is required"),
      model: z.string().min(1, "Model is required"),
      year: z.number().min(1990, "Year must be valid"),
      kmDriven: z.number().min(0, "KM driven is required"),
      ownerNumber: z.string().min(1, "Owner number is required"),
      engineCapacity: z.number().min(50, "Engine capacity is required"),
      mileage: z.number().min(10, "Mileage is required"),
    });
  }

  // Properties
  if (category === "properties") {
    if (subcategory?.includes("houses") || subcategory?.includes("apartments")) {
      return z.object({
        ...baseSchema,
        bhk: z.string().min(1, "BHK is required"),
        furnishing: z.string().min(1, "Furnishing status is required"),
        carpetArea: z.number().min(1, "Carpet area is required"),
        totalFloors: z.number().min(1, "Total floors is required"),
        floorNo: z.number().min(0, "Floor number is required"),
        ageOfConstruction: z.string().min(1, "Age of construction is required"),
        projectStatus: z.string().min(1, "Project status is required"),
        facing: z.string().optional(),
      });
    }
    if (subcategory?.includes("lands") || subcategory?.includes("plots")) {
      return z.object({
        ...baseSchema,
        plotArea: z.number().min(1, "Plot area is required"),
        length: z.number().min(1, "Length is required"),
        breadth: z.number().min(1, "Breadth is required"),
        boundaryWall: z.string().min(1, "Boundary wall status is required"),
      });
    }
  }

  // Electronics & Appliances  
  if (category === "electronics") {
    if (subcategory === "fridges") {
      return z.object({
        ...baseSchema,
        brand: z.string().min(1, "Brand is required"),
        model: z.string().min(1, "Model is required"),
        capacity: z.number().min(50, "Capacity is required"),
        energyRating: z.string().min(1, "Energy rating is required"),
        ageOfAppliance: z.string().min(1, "Age of appliance is required"),
        condition: z.string().min(1, "Condition is required"),
      });
    }
    if (subcategory?.includes("tvs")) {
      return z.object({
        ...baseSchema,
        brand: z.string().min(1, "Brand is required"),
        screenSize: z.number().min(10, "Screen size is required"),
        displayType: z.string().min(1, "Display type is required"),
        condition: z.string().min(1, "Condition is required"),
      });
    }
    if (subcategory?.includes("computers") || subcategory?.includes("laptops")) {
      return z.object({
        ...baseSchema,
        brand: z.string().min(1, "Brand is required"),
        processor: z.string().min(1, "Processor is required"),
        ram: z.number().min(2, "RAM is required"),
        storage: z.number().min(100, "Storage is required"),
        condition: z.string().min(1, "Condition is required"),
      });
    }
    // General electronics
    return z.object({
      ...baseSchema,
      brand: z.string().min(1, "Brand is required"),
      model: z.string().optional(),
      condition: z.string().min(1, "Condition is required"),
    });
  }

  // Jobs
  if (category === "jobs") {
    return z.object({
      ...baseSchema,
      salaryPeriod: z.string().min(1, "Salary period is required"),
      positionType: z.string().min(1, "Position type is required"),
      salaryFrom: z.number().min(0, "Salary from is required"),
      salaryTo: z.number().min(0, "Salary to is required"),
    });
  }

  // Mobiles
  if (category === "mobiles") {
    return z.object({
      ...baseSchema,
      brand: z.string().min(1, "Brand is required"),
      model: z.string().min(1, "Model is required"),
      condition: z.string().min(1, "Condition is required"),
      warranty: z.string().optional(),
      storage: z.string().optional(),
      ram: z.string().optional(),
    });
  }

  // Furniture
  if (category === "furniture") {
    return z.object({
      ...baseSchema,
      type: z.string().min(1, "Furniture type is required"),
      material: z.string().min(1, "Material is required"),
      condition: z.string().min(1, "Condition is required"),
      color: z.string().optional(),
    });
  }

  // Fashion
  if (category === "fashion") {
    return z.object({
      ...baseSchema,
      brand: z.string().min(1, "Brand is required"),
      size: z.string().min(1, "Size is required"),
      condition: z.string().min(1, "Condition is required"),
      gender: z.string().min(1, "Gender is required"),
      color: z.string().optional(),
    });
  }

  // Pets
  if (category === "pets") {
    return z.object({
      ...baseSchema,
      petType: z.string().min(1, "Pet type is required"),
      breed: z.string().min(1, "Breed is required"),
      age: z.string().min(1, "Age is required"),
      vaccinationStatus: z.string().min(1, "Vaccination status is required"),
      gender: z.string().min(1, "Gender is required"),
    });
  }

  // Commercial Vehicles
  if (category === "commercial") {
    return z.object({
      ...baseSchema,
      vehicleType: z.string().min(1, "Vehicle type is required"),
      brand: z.string().min(1, "Brand is required"),
      model: z.string().min(1, "Model is required"),
      year: z.number().min(1990, "Year must be valid"),
      fuelType: z.string().min(1, "Fuel type is required"),
      kmDriven: z.number().min(0, "KM driven is required"),
    });
  }

  // Books, Sports & Hobbies
  if (category === "books") {
    if (subcategory === "books") {
      return z.object({
        ...baseSchema,
        author: z.string().min(1, "Author is required"),
        subject: z.string().min(1, "Subject/Genre is required"),
        condition: z.string().min(1, "Condition is required"),
        language: z.string().optional(),
      });
    }
    return z.object({
      ...baseSchema,
      brand: z.string().optional(),
      condition: z.string().min(1, "Condition is required"),
      type: z.string().min(1, "Type is required"),
    });
  }

  // Services
  if (category === "services") {
    return z.object({
      ...baseSchema,
      serviceType: z.string().min(1, "Service type is required"),
      experience: z.string().min(1, "Experience is required"),
      availability: z.string().min(1, "Availability is required"),
    });
  }

  // Default schema for other categories
  return z.object(baseSchema);
};

export default function CategoryForm({ category, subcategory, onSubmit, isSubmitting }: CategoryFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<"details" | "photos" | "location">("details");
  
  const formSchema = createFormSchema(category, subcategory || undefined);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      location: "",
      images: [],
    },
  });

  const categoryData = getCategoryById(category);
  const subcategoryData = categoryData?.subcategories?.find(sub => sub.id === subcategory);

  const handleSubmit = (data: any) => {
    const listingData: InsertListing = {
      ...data,
      category,
      subcategory: subcategory || category,
      images: uploadedImages,
      attributes: {},
      status: "active",
      isFeatured: "false",
    };

    // Add category-specific attributes
    const { title, description, price, location, images, ...categoryFields } = data;
    listingData.attributes = categoryFields;
    
    // Special price handling for jobs
    if (category === "jobs" && data.salaryFrom && data.salaryTo) {
      listingData.price = Math.round((data.salaryFrom + data.salaryTo) / 2);
    }

    onSubmit(listingData);
  };

  // Bikes Form (with range, mileage, ownership as requested)
  const renderBikesForm = () => (
    <div className="space-y-6">
      {/* Selected Category */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SELECTED CATEGORY</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            {categoryData?.name} / {subcategoryData?.name || "General"}
          </span>
          <Button variant="link" className="text-olx-primary p-0">
            Change
          </Button>
        </div>
      </div>

      {/* Include Some Details */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">INCLUDE SOME DETAILS</h3>
        
        <div className="space-y-6">
          {/* Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Brand *</Label>
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero">Hero</SelectItem>
                          <SelectItem value="honda">Honda</SelectItem>
                          <SelectItem value="bajaj">Bajaj</SelectItem>
                          <SelectItem value="tvs">TVS</SelectItem>
                          <SelectItem value="yamaha">Yamaha</SelectItem>
                          <SelectItem value="royal-enfield">Royal Enfield</SelectItem>
                          <SelectItem value="ktm">KTM</SelectItem>
                          <SelectItem value="suzuki">Suzuki</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Model *</Label>
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter model" {...field} className="mt-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Year and Engine Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Year *</Label>
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 2020"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Engine Capacity (CC) *</Label>
              <FormField
                control={form.control}
                name="engineCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 150"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* KM Driven and Mileage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">KM Driven *</Label>
              <FormField
                control={form.control}
                name="kmDriven"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 25000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Mileage (kmpl) *</Label>
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 45"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Owner Number (Ownership) */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Owner Number *</Label>
            <FormField
              control={form.control}
              name="ownerNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-wrap gap-4">
                      {["1st Owner", "2nd Owner", "3rd Owner", "4th Owner"].map((owner) => (
                        <Button
                          key={owner}
                          type="button"
                          variant={field.value === owner.toLowerCase().replace(" ", "") ? "default" : "outline"}
                          onClick={() => field.onChange(owner.toLowerCase().replace(" ", ""))}
                          className="px-4 py-2"
                        >
                          {owner}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Price */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Set a price *</Label>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="₹ 0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ad Title */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Ad title *</Label>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Mention the key features (e.g. Hero Splendor Plus, 2020 model)"
                      {...field}
                      className="mt-1"
                      maxLength={70}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 text-right mt-1">0 / 70</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Description *</Label>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Include condition, features and reason for selling"
                      {...field}
                      rows={4}
                      className="mt-1 resize-none"
                      maxLength={4096}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 text-right mt-1">0 / 4096</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Photo Upload */}
      <ImageUpload 
        onImagesChange={setUploadedImages}
        maxImages={12}
      />

      {/* Location */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CONFIRM YOUR LOCATION</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">State *</Label>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                        <SelectItem value="rajasthan">Rajasthan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || uploadedImages.length === 0}
          className="bg-olx-accent text-olx-primary font-bold px-8 py-3 rounded-lg hover:bg-yellow-400"
        >
          {isSubmitting ? "Posting..." : "Post now"}
        </Button>
      </div>
    </div>
  );

  // Electronics Forms (Fridges, TVs, Computers)
  const renderElectronicsForm = () => (
    <div className="space-y-6">
      {/* Selected Category */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SELECTED CATEGORY</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            {categoryData?.name} / {subcategoryData?.name || "General"}
          </span>
          <Button variant="link" className="text-olx-primary p-0">
            Change
          </Button>
        </div>
      </div>

      {/* Include Some Details */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">INCLUDE SOME DETAILS</h3>
        
        <div className="space-y-6">
          {/* Brand */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Brand *</Label>
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategory === "fridges" && [
                          <SelectItem key="lg" value="lg">LG</SelectItem>,
                          <SelectItem key="samsung" value="samsung">Samsung</SelectItem>,
                          <SelectItem key="whirlpool" value="whirlpool">Whirlpool</SelectItem>,
                          <SelectItem key="godrej" value="godrej">Godrej</SelectItem>,
                          <SelectItem key="haier" value="haier">Haier</SelectItem>,
                          <SelectItem key="panasonic" value="panasonic">Panasonic</SelectItem>
                        ]}
                        {subcategory?.includes("tvs") && [
                          <SelectItem key="sony" value="sony">Sony</SelectItem>,
                          <SelectItem key="lg" value="lg">LG</SelectItem>,
                          <SelectItem key="samsung" value="samsung">Samsung</SelectItem>,
                          <SelectItem key="mi" value="mi">Mi</SelectItem>,
                          <SelectItem key="onida" value="onida">Onida</SelectItem>,
                          <SelectItem key="videocon" value="videocon">Videocon</SelectItem>
                        ]}
                        {(subcategory?.includes("computers") || subcategory?.includes("laptops")) && [
                          <SelectItem key="hp" value="hp">HP</SelectItem>,
                          <SelectItem key="dell" value="dell">Dell</SelectItem>,
                          <SelectItem key="lenovo" value="lenovo">Lenovo</SelectItem>,
                          <SelectItem key="acer" value="acer">Acer</SelectItem>,
                          <SelectItem key="asus" value="asus">Asus</SelectItem>,
                          <SelectItem key="apple" value="apple">Apple</SelectItem>
                        ]}
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Model */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Model {subcategory === "fridges" ? "*" : ""}</Label>
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter model" {...field} className="mt-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Category-specific fields */}
          {subcategory === "fridges" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Capacity (Litres) *</Label>
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 190"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Energy Rating *</Label>
                  <FormField
                    control={form.control}
                    name="energyRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select Rating" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5-star">5 Star</SelectItem>
                              <SelectItem value="4-star">4 Star</SelectItem>
                              <SelectItem value="3-star">3 Star</SelectItem>
                              <SelectItem value="2-star">2 Star</SelectItem>
                              <SelectItem value="1-star">1 Star</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Age of Appliance *</Label>
                <FormField
                  control={form.control}
                  name="ageOfAppliance"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select Age" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="less-than-1-year">Less than 1 year</SelectItem>
                            <SelectItem value="1-2-years">1-2 years</SelectItem>
                            <SelectItem value="2-5-years">2-5 years</SelectItem>
                            <SelectItem value="5-10-years">5-10 years</SelectItem>
                            <SelectItem value="more-than-10-years">More than 10 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          {subcategory?.includes("tvs") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Screen Size (inches) *</Label>
                <FormField
                  control={form.control}
                  name="screenSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 55"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Display Type *</Label>
                <FormField
                  control={form.control}
                  name="displayType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select Display Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="led">LED</SelectItem>
                            <SelectItem value="oled">OLED</SelectItem>
                            <SelectItem value="qled">QLED</SelectItem>
                            <SelectItem value="lcd">LCD</SelectItem>
                            <SelectItem value="plasma">Plasma</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {(subcategory?.includes("computers") || subcategory?.includes("laptops")) && (
            <>
              <div>
                <Label className="text-sm font-medium text-gray-700">Processor *</Label>
                <FormField
                  control={form.control}
                  name="processor"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="e.g. Intel Core i5 10th Gen" {...field} className="mt-1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">RAM (GB) *</Label>
                  <FormField
                    control={form.control}
                    name="ram"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 8"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Storage (GB) *</Label>
                  <FormField
                    control={form.control}
                    name="storage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 512"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </>
          )}

          {/* Condition - common for all electronics */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Condition *</Label>
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-wrap gap-4">
                      {["New", "Excellent", "Good", "Fair", "Poor"].map((condition) => (
                        <Button
                          key={condition}
                          type="button"
                          variant={field.value === condition.toLowerCase() ? "default" : "outline"}
                          onClick={() => field.onChange(condition.toLowerCase())}
                          className="px-4 py-2"
                        >
                          {condition}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Price */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Set a price *</Label>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="₹ 0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ad Title */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Ad title *</Label>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Mention the key features (e.g. Samsung 190L 5-Star Fridge)"
                      {...field}
                      className="mt-1"
                      maxLength={70}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 text-right mt-1">0 / 70</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Description *</Label>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Include condition, features and reason for selling"
                      {...field}
                      rows={4}
                      className="mt-1 resize-none"
                      maxLength={4096}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 text-right mt-1">0 / 4096</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Photo Upload */}
      <ImageUpload 
        onImagesChange={setUploadedImages}
        maxImages={12}
      />

      {/* Location */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CONFIRM YOUR LOCATION</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">State *</Label>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                        <SelectItem value="rajasthan">Rajasthan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || uploadedImages.length === 0}
          className="bg-olx-accent text-olx-primary font-bold px-8 py-3 rounded-lg hover:bg-yellow-400"
        >
          {isSubmitting ? "Posting..." : "Post now"}
        </Button>
      </div>
    </div>
  );

  // Properties Form (BHK, Furnishing, Project Status)
  const renderPropertiesForm = () => (
    <div className="space-y-6">
      {/* Selected Category */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SELECTED CATEGORY</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            {categoryData?.name} / {subcategoryData?.name || "General"}
          </span>
          <Button variant="link" className="text-olx-primary p-0">
            Change
          </Button>
        </div>
      </div>

      {/* Include Some Details */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">INCLUDE SOME DETAILS</h3>
        
        <div className="space-y-6">
          {(subcategory?.includes("houses") || subcategory?.includes("apartments")) && (
            <>
              {/* BHK */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">BHK *</Label>
                <FormField
                  control={form.control}
                  name="bhk"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-wrap gap-4">
                          {["1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"].map((bhk) => (
                            <Button
                              key={bhk}
                              type="button"
                              variant={field.value === bhk.toLowerCase().replace(" ", "") ? "default" : "outline"}
                              onClick={() => field.onChange(bhk.toLowerCase().replace(" ", ""))}
                              className="px-4 py-2"
                            >
                              {bhk}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Furnishing */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Furnishing *</Label>
                <FormField
                  control={form.control}
                  name="furnishing"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-wrap gap-4">
                          {["Furnished", "Semi-Furnished", "Unfurnished"].map((furnish) => (
                            <Button
                              key={furnish}
                              type="button"
                              variant={field.value === furnish.toLowerCase().replace("-", "") ? "default" : "outline"}
                              onClick={() => field.onChange(furnish.toLowerCase().replace("-", ""))}
                              className="px-4 py-2"
                            >
                              {furnish}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Project Status */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Project Status *</Label>
                <FormField
                  control={form.control}
                  name="projectStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-wrap gap-4">
                          {["Ready to Move", "Under Construction", "New Launch"].map((status) => (
                            <Button
                              key={status}
                              type="button"
                              variant={field.value === status.toLowerCase().replace(" ", "") ? "default" : "outline"}
                              onClick={() => field.onChange(status.toLowerCase().replace(" ", ""))}
                              className="px-4 py-2"
                            >
                              {status}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Carpet Area (Sq ft) *</Label>
                  <FormField
                    control={form.control}
                    name="carpetArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 1200"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Total Floors *</Label>
                  <FormField
                    control={form.control}
                    name="totalFloors"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Floor No *</Label>
                  <FormField
                    control={form.control}
                    name="floorNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 5"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Age of Construction and Facing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Age of Construction *</Label>
                  <FormField
                    control={form.control}
                    name="ageOfConstruction"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select Age" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new-construction">New Construction</SelectItem>
                              <SelectItem value="less-than-5-years">Less than 5 years</SelectItem>
                              <SelectItem value="5-10-years">5-10 years</SelectItem>
                              <SelectItem value="10-20-years">10-20 years</SelectItem>
                              <SelectItem value="more-than-20-years">More than 20 years</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Facing</Label>
                  <FormField
                    control={form.control}
                    name="facing"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select Facing" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="north">North</SelectItem>
                              <SelectItem value="south">South</SelectItem>
                              <SelectItem value="east">East</SelectItem>
                              <SelectItem value="west">West</SelectItem>
                              <SelectItem value="north-east">North-East</SelectItem>
                              <SelectItem value="north-west">North-West</SelectItem>
                              <SelectItem value="south-east">South-East</SelectItem>
                              <SelectItem value="south-west">South-West</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </>
          )}

          {(subcategory?.includes("lands") || subcategory?.includes("plots")) && (
            <>
              {/* Plot Area */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Plot Area (Sq ft) *</Label>
                <FormField
                  control={form.control}
                  name="plotArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 2400"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Length and Breadth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Length (Ft) *</Label>
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 60"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Breadth (Ft) *</Label>
                  <FormField
                    control={form.control}
                    name="breadth"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 40"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Boundary Wall */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Boundary Wall *</Label>
                <FormField
                  control={form.control}
                  name="boundaryWall"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-wrap gap-4">
                          {["Yes", "No", "Partial"].map((wall) => (
                            <Button
                              key={wall}
                              type="button"
                              variant={field.value === wall.toLowerCase() ? "default" : "outline"}
                              onClick={() => field.onChange(wall.toLowerCase())}
                              className="px-4 py-2"
                            >
                              {wall}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          {/* Price */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Set a price *</Label>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="₹ 0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ad Title */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Ad title *</Label>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Mention the key features (e.g. 3 BHK Furnished Flat for Sale)"
                      {...field}
                      className="mt-1"
                      maxLength={70}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 text-right mt-1">0 / 70</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Description *</Label>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Include condition, features and reason for selling"
                      {...field}
                      rows={4}
                      className="mt-1 resize-none"
                      maxLength={4096}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 text-right mt-1">0 / 4096</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Photo Upload */}
      <ImageUpload 
        onImagesChange={setUploadedImages}
        maxImages={12}
      />

      {/* Location */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CONFIRM YOUR LOCATION</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">State *</Label>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                        <SelectItem value="rajasthan">Rajasthan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || uploadedImages.length === 0}
          className="bg-olx-accent text-olx-primary font-bold px-8 py-3 rounded-lg hover:bg-yellow-400"
        >
          {isSubmitting ? "Posting..." : "Post now"}
        </Button>
      </div>
    </div>
  );

  const renderJobsForm = () => (
    <div className="space-y-6">
      {/* Selected Category */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SELECTED CATEGORY</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            {categoryData?.name} / {subcategoryData?.name || "General"}
          </span>
          <Button variant="link" className="text-olx-primary p-0">
            Change
          </Button>
        </div>
      </div>

      {/* Include Some Details */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">INCLUDE SOME DETAILS</h3>
        
        <div className="space-y-6">
          {/* Salary Period */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Salary period *</Label>
            <FormField
              control={form.control}
              name="salaryPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-wrap gap-4">
                      {["Hourly", "Monthly", "Weekly", "Yearly"].map((period) => (
                        <Button
                          key={period}
                          type="button"
                          variant={field.value === period.toLowerCase() ? "default" : "outline"}
                          onClick={() => field.onChange(period.toLowerCase())}
                          className="px-4 py-2"
                        >
                          {period}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Position Type */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Position type *</Label>
            <FormField
              control={form.control}
              name="positionType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-wrap gap-4">
                      {["Contract", "Full-time", "Part-time", "Temporary"].map((type) => (
                        <Button
                          key={type}
                          type="button"
                          variant={field.value === type.toLowerCase().replace("-", "") ? "default" : "outline"}
                          onClick={() => field.onChange(type.toLowerCase().replace("-", ""))}
                          className="px-4 py-2"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Salary from</Label>
              <FormField
                control={form.control}
                name="salaryFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Salary to</Label>
              <FormField
                control={form.control}
                name="salaryTo"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Ad Title */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Ad title *</Label>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Mention the key features of your item (e.g. brand, model, age, type)"
                      {...field}
                      className="mt-1"
                      maxLength={70}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 text-right mt-1">0 / 70</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Description *</Label>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Include condition, features and reason for selling"
                      {...field}
                      rows={4}
                      className="mt-1 resize-none"
                      maxLength={4096}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 text-right mt-1">0 / 4096</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Photo Upload */}
      <ImageUpload 
        onImagesChange={setUploadedImages}
        maxImages={12}
      />

      {/* Location */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CONFIRM YOUR LOCATION</h3>
        <div className="space-y-4">
          <div className="flex border-b">
            <Button variant="ghost" className="border-b-2 border-olx-primary">LIST</Button>
            <Button variant="ghost" className="ml-4">CURRENT LOCATION</Button>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">State *</Label>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                        <SelectItem value="rajasthan">Rajasthan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || uploadedImages.length === 0}
          className="bg-olx-accent text-olx-primary font-bold px-8 py-3 rounded-lg hover:bg-yellow-400"
        >
          {isSubmitting ? "Posting..." : "Post now"}
        </Button>
      </div>
    </div>
  );

  const renderDefaultForm = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">SELECTED CATEGORY</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            {categoryData?.name} / {subcategoryData?.name || "General"}
          </span>
          <Button variant="link" className="text-olx-primary p-0">
            Change
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">INCLUDE SOME DETAILS</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₹) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter price" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea 
                    rows={5} 
                    placeholder="Describe your item in detail..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Mumbai, Maharashtra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <ImageUpload 
        onImagesChange={setUploadedImages}
        maxImages={12}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || uploadedImages.length === 0}
          className="bg-olx-accent text-olx-primary font-bold px-8 py-3 rounded-lg hover:bg-yellow-400"
        >
          {isSubmitting ? "Posting..." : "Post now"}
        </Button>
      </div>
    </div>
  );

  // Enhanced Mobiles Form
  const renderMobilesForm = () => (
    <div className="space-y-6">
      {/* Selected Category */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SELECTED CATEGORY</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            {categoryData?.name} / {subcategoryData?.name || "General"}
          </span>
          <Button variant="link" className="text-olx-primary p-0">
            Change
          </Button>
        </div>
      </div>

      {/* Include Some Details */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">INCLUDE SOME DETAILS</h3>
        
        <div className="space-y-6">
          {/* Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Brand *</Label>
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apple">Apple</SelectItem>
                          <SelectItem value="samsung">Samsung</SelectItem>
                          <SelectItem value="xiaomi">Xiaomi</SelectItem>
                          <SelectItem value="oneplus">OnePlus</SelectItem>
                          <SelectItem value="oppo">Oppo</SelectItem>
                          <SelectItem value="vivo">Vivo</SelectItem>
                          <SelectItem value="realme">Realme</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Model *</Label>
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter model" {...field} className="mt-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Condition */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Condition *</Label>
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-wrap gap-4">
                      {["New", "Excellent", "Good", "Fair", "Poor"].map((condition) => (
                        <Button
                          key={condition}
                          type="button"
                          variant={field.value === condition.toLowerCase() ? "default" : "outline"}
                          onClick={() => field.onChange(condition.toLowerCase())}
                          className="px-4 py-2"
                        >
                          {condition}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Storage and RAM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Storage</Label>
              <FormField
                control={form.control}
                name="storage"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Storage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="32GB">32 GB</SelectItem>
                          <SelectItem value="64GB">64 GB</SelectItem>
                          <SelectItem value="128GB">128 GB</SelectItem>
                          <SelectItem value="256GB">256 GB</SelectItem>
                          <SelectItem value="512GB">512 GB</SelectItem>
                          <SelectItem value="1TB">1 TB</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">RAM</Label>
              <FormField
                control={form.control}
                name="ram"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select RAM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2GB">2 GB</SelectItem>
                          <SelectItem value="3GB">3 GB</SelectItem>
                          <SelectItem value="4GB">4 GB</SelectItem>
                          <SelectItem value="6GB">6 GB</SelectItem>
                          <SelectItem value="8GB">8 GB</SelectItem>
                          <SelectItem value="12GB">12 GB</SelectItem>
                          <SelectItem value="16GB">16 GB</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Warranty */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Warranty</Label>
            <FormField
              control={form.control}
              name="warranty"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="e.g. 6 months remaining" {...field} className="mt-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Price */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Set a price *</Label>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="₹ 0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ad Title */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Ad title *</Label>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Mention the key features (e.g. iPhone 14 128GB Excellent condition)"
                      {...field}
                      className="mt-1"
                      maxLength={70}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 text-right mt-1">0 / 70</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Description *</Label>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Include condition, features and reason for selling"
                      {...field}
                      rows={4}
                      className="mt-1 resize-none"
                      maxLength={4096}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 text-right mt-1">0 / 4096</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Photo Upload */}
      <ImageUpload 
        onImagesChange={setUploadedImages}
        maxImages={12}
      />

      {/* Location */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CONFIRM YOUR LOCATION</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">State *</Label>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                        <SelectItem value="rajasthan">Rajasthan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || uploadedImages.length === 0}
          className="bg-olx-accent text-olx-primary font-bold px-8 py-3 rounded-lg hover:bg-yellow-400"
        >
          {isSubmitting ? "Posting..." : "Post now"}
        </Button>
      </div>
    </div>
  );

  // Enhanced form selection logic
  const renderCategoryForm = () => {
    if (category === "jobs") {
      return renderJobsForm();
    } else if (category === "bikes") {
      return renderBikesForm();
    } else if (category === "electronics") {
      return renderElectronicsForm();
    } else if (category === "properties") {
      return renderPropertiesForm();
    } else if (category === "mobiles") {
      return renderMobilesForm();
    } else if (category === "cars") {
      return renderCarsForm();
    } else {
      return renderDefaultForm();
    }
  };

  // Enhanced Cars Form
  const renderCarsForm = () => (
    <div className="space-y-6">
      {/* Selected Category */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SELECTED CATEGORY</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            {categoryData?.name} / {subcategoryData?.name || "General"}
          </span>
          <Button variant="link" className="text-olx-primary p-0">
            Change
          </Button>
        </div>
      </div>

      {/* Include Some Details */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">INCLUDE SOME DETAILS</h3>
        
        <div className="space-y-6">
          {/* Brand and Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Brand *</Label>
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maruti-suzuki">Maruti Suzuki</SelectItem>
                          <SelectItem value="hyundai">Hyundai</SelectItem>
                          <SelectItem value="tata">Tata</SelectItem>
                          <SelectItem value="mahindra">Mahindra</SelectItem>
                          <SelectItem value="honda">Honda</SelectItem>
                          <SelectItem value="toyota">Toyota</SelectItem>
                          <SelectItem value="kia">Kia</SelectItem>
                          <SelectItem value="volkswagen">Volkswagen</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Model *</Label>
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter model" {...field} className="mt-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Year and KM Driven */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Year *</Label>
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 2020"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">KM Driven *</Label>
              <FormField
                control={form.control}
                name="kmDriven"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 45000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Fuel Type and Transmission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Fuel Type *</Label>
              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Fuel Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="petrol">Petrol</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="cng">CNG</SelectItem>
                          <SelectItem value="lpg">LPG</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Transmission *</Label>
              <FormField
                control={form.control}
                name="transmission"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Transmission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="cvt">CVT</SelectItem>
                          <SelectItem value="amt">AMT</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Owner Number */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Owner Number *</Label>
            <FormField
              control={form.control}
              name="ownerNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-wrap gap-4">
                      {["1st Owner", "2nd Owner", "3rd Owner", "4th Owner"].map((owner) => (
                        <Button
                          key={owner}
                          type="button"
                          variant={field.value === owner.toLowerCase().replace(" ", "") ? "default" : "outline"}
                          onClick={() => field.onChange(owner.toLowerCase().replace(" ", ""))}
                          className="px-4 py-2"
                        >
                          {owner}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Price */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Set a price *</Label>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="₹ 0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ad Title */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Ad title *</Label>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Mention the key features (e.g. Maruti Swift VXi 2020 Model)"
                      {...field}
                      className="mt-1"
                      maxLength={70}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 text-right mt-1">0 / 70</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Description *</Label>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Include condition, features and reason for selling"
                      {...field}
                      rows={4}
                      className="mt-1 resize-none"
                      maxLength={4096}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 text-right mt-1">0 / 4096</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Photo Upload */}
      <ImageUpload 
        onImagesChange={setUploadedImages}
        maxImages={12}
      />

      {/* Location */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CONFIRM YOUR LOCATION</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">State *</Label>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                        <SelectItem value="rajasthan">Rajasthan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || uploadedImages.length === 0}
          className="bg-olx-accent text-olx-primary font-bold px-8 py-3 rounded-lg hover:bg-yellow-400"
        >
          {isSubmitting ? "Posting..." : "Post now"}
        </Button>
      </div>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {renderCategoryForm()}
      </form>
    </Form>
  );
}