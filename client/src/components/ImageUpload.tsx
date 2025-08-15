import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Plus } from "lucide-react";

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ onImagesChange, maxImages = 12 }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    let processed = 0;
    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            processed++;
            
            if (processed === filesToProcess) {
              const updatedImages = [...images, ...newImages];
              setImages(updatedImages);
              onImagesChange(updatedImages);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Create array of 12 slots
  const slots = Array.from({ length: maxImages }, (_, index) => {
    const hasImage = images[index];
    
    return (
      <div
        key={index}
        className="aspect-square border border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors relative bg-gray-50"
        onClick={!hasImage ? openFileSelector : undefined}
      >
        {hasImage ? (
          <>
            <img
              src={images[index]}
              alt={`Upload ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                removeImage(index);
              }}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-xs"
            >
              ×
            </Button>
          </>
        ) : index === 0 ? (
          <div className="text-center">
            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <div className="text-xs text-gray-500 font-medium">Add Photo</div>
          </div>
        ) : (
          <Plus className="h-6 w-6 text-gray-400" />
        )}
      </div>
    );
  });

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">UPLOAD UP TO 12 PHOTOS</h3>
      
      {/* Grid of 12 slots (4 columns x 3 rows) */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {slots}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-red-500">You need at least 1 image(s).</p>
    </div>
  );
}