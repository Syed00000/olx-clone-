import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CategorySelector from "@/components/CategorySelector";
import CategoryForm from "@/components/CategoryForm";
import { useToast } from "@/hooks/use-toast";
import type { InsertListing } from "@shared/schema";

export default function PostAdPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"category" | "form">("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createListingMutation = useMutation({
    mutationFn: async (listingData: InsertListing) => {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(listingData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create listing");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Success!",
        description: "Your ad has been posted successfully.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post your ad. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCategorySelect = (categoryId: string, subcategoryId?: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId || null);
    setStep("form");
  };

  const handleBackToCategories = () => {
    setStep("category");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleFormSubmit = (formData: InsertListing) => {
    createListingMutation.mutate(formData);
  };

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
          <CategorySelector onCategorySelect={handleCategorySelect} />
        ) : (
          <CategoryForm
            category={selectedCategory!}
            subcategory={selectedSubcategory}
            onSubmit={handleFormSubmit}
            isSubmitting={createListingMutation.isPending}
          />
        )}
      </main>
    </div>
  );
}