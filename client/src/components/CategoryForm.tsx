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
    title: z.string().min(1, "Title is required"),
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
      company: z.string().min(1, "Company name is required"),
      jobType: z.string().min(1, "Job type is required"),
      experience: z.string().min(1, "Experience is required"),
      salaryRange: z.string().min(1, "Salary range is required"),
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
        company: data.company,
        jobType: data.jobType,
        experience: data.experience,
        salaryRange: data.salaryRange,
      };
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

  const renderCategorySpecificFields = () => {
    if (category === "cars") {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="maruti-suzuki">Maruti Suzuki</SelectItem>
                      <SelectItem value="hyundai">Hyundai</SelectItem>
                      <SelectItem value="tata">Tata</SelectItem>
                      <SelectItem value="mahindra">Mahindra</SelectItem>
                      <SelectItem value="honda">Honda</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Swift Dzire" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g. 2020" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Fuel Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="cng">CNG</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kmDriven"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KM Driven *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g. 50000" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      );
    }

    if (category === "jobs") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. ABC Technologies" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salaryRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select salary range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="8000-15000">₹ 8,000 - ₹ 15,000</SelectItem>
                    <SelectItem value="15000-25000">₹ 15,000 - ₹ 25,000</SelectItem>
                    <SelectItem value="25000-50000">₹ 25,000 - ₹ 50,000</SelectItem>
                    <SelectItem value="50000+">₹ 50,000+</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fresher">Fresher</SelectItem>
                    <SelectItem value="1-2">1-2 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5+">5+ years</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    if (category === "mobiles") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="samsung">Samsung</SelectItem>
                    <SelectItem value="vivo">Vivo</SelectItem>
                    <SelectItem value="oppo">Oppo</SelectItem>
                    <SelectItem value="xiaomi">Xiaomi</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. iPhone 15" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like-new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="warranty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warranty</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 6 months" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category Specific Fields */}
        {renderCategorySpecificFields()}

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

        {/* Image Upload */}
        <div>
          <Label className="text-sm font-medium">Add Photos *</Label>
          <ImageUpload 
            onImagesChange={setUploadedImages}
            maxImages={12}
          />
          {uploadedImages.length === 0 && (
            <p className="text-sm text-red-500 mt-1">At least one image is required</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end pt-6 border-t">
          <Button 
            type="submit" 
            disabled={isSubmitting || uploadedImages.length === 0}
            className="px-8 py-3 bg-olx-accent text-olx-primary font-bold rounded-lg hover:bg-yellow-400"
          >
            {isSubmitting ? "Posting..." : "Post now"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
