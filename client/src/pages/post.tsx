import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Post() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    caption: "",
    thriftStore: "",
    pricePaid: "",
    originalBrand: "",
    size: "",
    tags: "",
    availableForRent: false,
    rentPrice: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const createPostMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/posts", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your thrift find has been shared!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setLocation("/");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image",
        variant: "destructive",
      });
      return;
    }

    const submitData = new FormData();
    submitData.append("image", selectedImage);
    submitData.append("caption", formData.caption);
    submitData.append("thriftStore", formData.thriftStore);
    submitData.append("pricePaid", formData.pricePaid);
    submitData.append("originalBrand", formData.originalBrand);
    submitData.append("size", formData.size);
    submitData.append("tags", formData.tags);
    submitData.append("availableForRent", formData.availableForRent.toString());
    if (formData.availableForRent && formData.rentPrice) {
      submitData.append("rentPrice", formData.rentPrice);
    }

    createPostMutation.mutate(submitData);
  };

  const suggestedTags = ["#vintage", "#denim", "#sustainable", "#thrifted", "#eco", "#secondhand"];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <div className="bg-white pb-20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Share Your Find</h2>
          <div className="w-10" />
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Upload Photos
            </Label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-eco-primary transition-colors block"
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Camera className="text-gray-400 text-3xl mb-2 mx-auto" />
                    <p className="text-gray-500">Tap to add photos</p>
                    <p className="text-xs text-gray-400 mt-1">Share up to 10 photos</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Caption */}
          <div>
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="Tell us about your thrift find..."
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              rows={4}
            />
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedTags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant={formData.tags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  className={formData.tags.includes(tag) ? "bg-eco-primary hover:bg-eco-primary/90" : ""}
                  onClick={() => {
                    const currentTags = formData.tags.split(",").filter(t => t.trim());
                    if (currentTags.includes(tag)) {
                      setFormData({
                        ...formData,
                        tags: currentTags.filter(t => t !== tag).join(",")
                      });
                    } else {
                      setFormData({
                        ...formData,
                        tags: [...currentTags, tag].join(",")
                      });
                    }
                  }}
                >
                  {tag}
                </Button>
              ))}
            </div>
            <Input
              id="tags"
              placeholder="Add custom tags..."
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          {/* Rental Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="availableForRent"
              checked={formData.availableForRent}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, availableForRent: !!checked })
              }
            />
            <Label htmlFor="availableForRent" className="text-sm font-medium">
              Available for rent
            </Label>
          </div>

          {formData.availableForRent && (
            <div>
              <Label htmlFor="rentPrice">Rental Price (per day)</Label>
              <Input
                id="rentPrice"
                type="number"
                placeholder="15.00"
                value={formData.rentPrice}
                onChange={(e) => setFormData({ ...formData, rentPrice: e.target.value })}
              />
            </div>
          )}

          {/* Thrift Details */}
          <Card className="bg-eco-light">
            <CardContent className="pt-4">
              <h3 className="font-semibold text-eco-primary mb-3">Thrift Details</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="thriftStore" className="text-xs text-gray-600">
                    Store/Location
                  </Label>
                  <Input
                    id="thriftStore"
                    placeholder="Where did you find this?"
                    value={formData.thriftStore}
                    onChange={(e) => setFormData({ ...formData, thriftStore: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pricePaid" className="text-xs text-gray-600">
                    Price Paid
                  </Label>
                  <Input
                    id="pricePaid"
                    type="number"
                    placeholder="8.00"
                    value={formData.pricePaid}
                    onChange={(e) => setFormData({ ...formData, pricePaid: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="originalBrand" className="text-xs text-gray-600">
                    Original Brand
                  </Label>
                  <Input
                    id="originalBrand"
                    placeholder="Levi's, H&M, etc."
                    value={formData.originalBrand}
                    onChange={(e) => setFormData({ ...formData, originalBrand: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="size" className="text-xs text-gray-600">
                    Size
                  </Label>
                  <Input
                    id="size"
                    placeholder="M, L, XL, etc."
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-eco-primary hover:bg-eco-primary/90"
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending ? "Sharing..." : "Share Your Find"}
          </Button>
        </form>
      </div>

      <Navigation />
    </div>
  );
}
