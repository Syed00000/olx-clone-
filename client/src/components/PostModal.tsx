import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CategorySelector from "./CategorySelector";
import CategoryForm from "./CategoryForm";
import { useToast } from "@/hooks/use-toast";
import type { InsertListing } from "@shared/schema";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostModal({ isOpen, onClose }: PostModalProps) {
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
      handleClose();
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

  const handleClose = () => {
    setStep("category");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {step === "form" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToCategories}
                className="mr-2 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            POST YOUR AD
            {step === "form" && selectedCategory && (
              <span className="ml-2 text-base font-normal capitalize">
                - {selectedCategory}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
