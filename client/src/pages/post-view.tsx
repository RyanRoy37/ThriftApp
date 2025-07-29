import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from "lucide-react";
import { useLocation } from "wouter";
import { PostWithUser } from "@shared/schema";

export default function PostView() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery<PostWithUser>({
    queryKey: ["/api/posts", id],
    enabled: !!id && isAuthenticated,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/posts/${id}/like`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
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
        description: "Failed to like post",
        variant: "destructive",
      });
    },
  });

  const requestRentalMutation = useMutation({
    mutationFn: async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const response = await apiRequest("POST", "/api/rentals/request", {
        postId: id,
        ownerId: post?.userId,
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        message: `Hi! I'd love to rent this item. Would it be available?`,
        totalPrice: "0",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rental request sent! The owner will be notified.",
      });
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
        description: "Failed to send rental request",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Post not found</h2>
          <Button onClick={() => setLocation("/")}>Go back to feed</Button>
        </div>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-gray-900">Post</h2>
        <Button variant="ghost" size="icon">
          <Share className="h-5 w-5" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="bg-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.user.profileImageUrl || ""} />
              <AvatarFallback>
                {post.user.firstName?.[0] || post.user.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {post.user.firstName && post.user.lastName 
                  ? `${post.user.firstName} ${post.user.lastName}`
                  : post.user.username || post.user.email
                }
              </h3>
              <p className="text-xs text-gray-500">
                {post.user.location && `${post.user.location} • `}
                {formatTime(post.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-eco-light text-eco-primary text-xs px-2 py-1 rounded-full font-medium">
              ♻️ Eco Star
            </Badge>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Full Size Image */}
        <img 
          src={post.imageUrl} 
          alt="Thrift outfit post" 
          className="w-full h-96 object-cover"
        />

        {/* Post Details */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
                className="flex items-center space-x-2 p-0"
              >
                <Heart 
                  className={`h-6 w-6 ${post.isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`}
                />
                <span className="text-sm text-gray-700">{post.likesCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 p-0">
                <MessageCircle className="h-6 w-6 text-gray-700" />
                <span className="text-sm text-gray-700">{post.commentsCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="p-0">
                <Share className="h-6 w-6 text-gray-700" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="p-0">
              <Bookmark className="h-6 w-6 text-gray-700" />
            </Button>
          </div>

          <div className="mb-4">
            <span className="font-semibold text-gray-900">
              {post.user.username || post.user.firstName || "user"}
            </span>
            <span className="text-gray-900 ml-2">{post.caption}</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-eco-light text-eco-primary text-sm px-3 py-1 rounded-full"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </Badge>
              ))}
            </div>
          )}

          {/* Thrift Details */}
          {(post.thriftStore || post.pricePaid || post.originalBrand) && (
            <Card className="bg-eco-light mb-4">
              <CardContent className="p-4">
                <h4 className="font-semibold text-eco-primary mb-2">Thrift Details</h4>
                <div className="space-y-2 text-sm">
                  {post.thriftStore && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Store:</span>
                      <span className="text-gray-900">{post.thriftStore}</span>
                    </div>
                  )}
                  {post.pricePaid && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price Paid:</span>
                      <span className="text-gray-900">${post.pricePaid}</span>
                    </div>
                  )}
                  {post.originalBrand && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Brand:</span>
                      <span className="text-gray-900">{post.originalBrand}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Environmental Impact */}
          <Card className="bg-green-50 mb-4">
            <CardContent className="p-4">
              <h4 className="font-semibold text-green-700 mb-2">Environmental Impact</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {post.waterSaved || "2.5"}L
                  </div>
                  <div className="text-gray-600">Water Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {post.carbonReduced || "1.2"}kg
                  </div>
                  <div className="text-gray-600">CO₂ Reduced</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rental Option */}
          {post.availableForRent && (
            <Card className="border border-eco-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-eco-primary">Available for Rent</h4>
                    <p className="text-sm text-gray-600">
                      ${post.rentPrice || "12"}/day
                      {post.size && ` • Size ${post.size}`}
                    </p>
                  </div>
                  <Button 
                    className="bg-eco-primary hover:bg-eco-primary/90"
                    onClick={() => requestRentalMutation.mutate()}
                    disabled={requestRentalMutation.isPending || post.userId === user?.id}
                  >
                    {requestRentalMutation.isPending 
                      ? "Requesting..." 
                      : post.userId === user?.id 
                        ? "Your Item" 
                        : "Rent This"
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
