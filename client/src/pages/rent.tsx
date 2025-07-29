import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, MapPin } from "lucide-react";
import { PostWithUser } from "@shared/schema";

export default function Rent() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const { data: rentablePosts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/rentals"],
    enabled: isAuthenticated,
  });

  const requestRentalMutation = useMutation({
    mutationFn: async (data: { postId: string; ownerId: string; startDate: string; endDate: string; message: string }) => {
      const response = await apiRequest("POST", "/api/rentals/request", {
        postId: data.postId,
        ownerId: data.ownerId,
        startDate: data.startDate,
        endDate: data.endDate,
        message: data.message,
        totalPrice: "0", // Would calculate based on rental duration and price
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rental request sent! The owner will be notified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals/my-requests"] });
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
        description: "Failed to send rental request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filters = ["All", "Dresses", "Jackets", "Vintage", "Size S", "Size M", "Size L"];

  const filteredPosts = rentablePosts?.filter((post) => {
    const matchesSearch = !searchQuery || 
      post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = activeFilter === "All" || 
      post.tags?.some(tag => tag.toLowerCase().includes(activeFilter.toLowerCase())) ||
      post.size?.toLowerCase().includes(activeFilter.toLowerCase().replace("size ", ""));

    return matchesSearch && matchesFilter;
  }) || [];

  const handleRentalRequest = (post: PostWithUser) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    requestRentalMutation.mutate({
      postId: post.id,
      ownerId: post.userId,
      startDate: tomorrow.toISOString(),
      endDate: nextWeek.toISOString(),
      message: `Hi! I'd love to rent this ${post.tags?.[0] || "item"} for a special occasion. Would you be available for rental?`,
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <div className="bg-white pb-20">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search rentals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Tags */}
          <div className="flex space-x-2 overflow-x-auto">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                className={`whitespace-nowrap ${
                  activeFilter === filter 
                    ? "bg-eco-primary hover:bg-eco-primary/90" 
                    : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Rental Listings */}
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-300 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Card key={post.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src={post.imageUrl} 
                    alt="Rental item" 
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-eco-primary text-white">
                    Available
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {post.caption?.split('.')[0] || "Vintage Item"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {post.size && `Size ${post.size} • `}
                        {post.tags?.[0] && post.tags[0].replace('#', '')}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-bold text-eco-primary">
                        ${post.rentPrice || "15"}/day
                      </p>
                      <p className="text-xs text-gray-500">Min. 2 days</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={post.user.profileImageUrl || ""} />
                      <AvatarFallback className="text-xs">
                        {post.user.firstName?.[0] || post.user.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">
                      {post.user.firstName || post.user.username || "User"}
                    </span>
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {post.user.location || "2.3 miles away"}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 bg-eco-primary hover:bg-eco-primary/90"
                      onClick={() => handleRentalRequest(post)}
                      disabled={requestRentalMutation.isPending}
                    >
                      {requestRentalMutation.isPending ? "Requesting..." : "Request to Rent"}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                {searchQuery || activeFilter !== "All" 
                  ? "No rentals match your search" 
                  : "No rentals available yet"
                }
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("All");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
}
