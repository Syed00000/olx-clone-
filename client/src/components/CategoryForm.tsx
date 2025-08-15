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

// Dynamic form schema based on category
const createFormSchema = (category: string) => {
  const baseSchema = {
    title: z.string().min(1, "Ad title is required"),
    description: z.string().min(1, "Description is required"),
    price: z.number().min(1, "Price must be greater than 0"),
    location: z.string().min(1, "Location is required"),
    images: z.array(z.string()).min(1, "At least one image is required"),
  };

  if (category === "cars") {
    return z.object({
      ...baseSchema,
      brand: z.string().min(1, "Brand is required"),
      model: z.string().min(1, "Model is required"),
      year: z.number().min(1990, "Year must be valid"),
      fuelType: z.string().min(1, "Fuel type is required"),
      kmDriven: z.number().min(0, "KM driven is required"),
    });
  }

  if (category === "jobs") {
    return z.object({
      ...baseSchema,
      salaryPeriod: z.string().min(1, "Salary period is required"),
      positionType: z.string().min(1, "Position type is required"),
      salaryFrom: z.number().min(0, "Salary from is required"),
      salaryTo: z.number().min(0, "Salary to is required"),
    });
  }

  if (category === "mobiles") {
    return z.object({
      ...baseSchema,
      brand: z.string().min(1, "Brand is required"),
      model: z.string().min(1, "Model is required"),
      condition: z.string().min(1, "Condition is required"),
      warranty: z.string().optional(),
    });
  }

  // Default schema for other categories
  return z.object(baseSchema);
};

export default function CategoryForm({ category, subcategory, onSubmit, isSubmitting }: CategoryFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<"details" | "photos" | "location">("details");
  
  const formSchema = createFormSchema(category);
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
    if (category === "cars") {
      listingData.attributes = {
        brand: data.brand,
        model: data.model,
        year: data.year,
        fuelType: data.fuelType,
        kmDriven: data.kmDriven,
      };
    } else if (category === "jobs") {
      listingData.attributes = {
        salaryPeriod: data.salaryPeriod,
        positionType: data.positionType,
        salaryFrom: data.salaryFrom,
        salaryTo: data.salaryTo,
      };
      // For jobs, price is the average salary
      listingData.price = Math.round((data.salaryFrom + data.salaryTo) / 2);
    } else if (category === "mobiles") {
      listingData.attributes = {
        brand: data.brand,
        model: data.model,
        condition: data.condition,
        warranty: data.warranty,
      };
    }

    onSubmit(listingData);
  };

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {category === "jobs" ? renderJobsForm() : renderDefaultForm()}
      </form>
    </Form>
  );
}