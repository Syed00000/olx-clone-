import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { categories, getCategoryById } from "@/lib/categories";

interface CategorySelectorProps {
  onCategorySelect: (categoryId: string, subcategoryId?: string) => void;
}

export default function CategorySelector({ onCategorySelect }: CategorySelectorProps) {
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>("jobs");

  const handleCategoryHover = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
  };

  const selectedCategory = getCategoryById(selectedMainCategory || "jobs");

  return (
    <div className="bg-white rounded-lg shadow-sm border max-w-4xl mx-auto">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">CHOOSE A CATEGORY</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
        {/* Left Column - Main Categories */}
        <div className="border-r">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              onClick={() => onCategorySelect(category.id)}
              onMouseEnter={() => handleCategoryHover(category.id)}
              className={`flex items-center justify-between p-4 h-auto text-left hover:bg-gray-50 w-full rounded-none border-b border-gray-100 ${
                selectedMainCategory === category.id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium text-gray-700">{category.name}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
          ))}
        </div>

        {/* Right Column - Subcategories */}
        <div className="p-4">
          {selectedCategory?.subcategories?.map((subcategory) => (
            <Button
              key={subcategory.id}
              variant="ghost"
              onClick={() => onCategorySelect(selectedMainCategory!, subcategory.id)}
              className="text-sm text-gray-600 p-3 justify-start hover:bg-gray-50 w-full rounded-none border-b border-gray-50"
            >
              {subcategory.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}