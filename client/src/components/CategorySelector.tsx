import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { categories, getCategoryById } from "@/lib/categories";

interface CategorySelectorProps {
  onCategorySelect: (categoryId: string, subcategoryId?: string) => void;
}

export default function CategorySelector({ onCategorySelect }: CategorySelectorProps) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">CHOOSE A CATEGORY</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - Main Categories */}
        <div className="space-y-3">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              onClick={() => onCategorySelect(category.id)}
              className="flex items-center justify-between p-4 h-auto text-left hover:bg-gray-50 w-full"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
          ))}
        </div>

        {/* Right Column - Subcategories for Jobs (as shown in design) */}
        <div className="space-y-3">
          {getCategoryById("jobs")?.subcategories?.map((subcategory) => (
            <Button
              key={subcategory.id}
              variant="ghost"
              onClick={() => onCategorySelect("jobs", subcategory.id)}
              className="text-sm text-gray-600 p-4 justify-start hover:bg-gray-50 w-full"
            >
              {subcategory.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
