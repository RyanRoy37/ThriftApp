import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from "lucide-react";
import { Link } from "wouter";
import { PostWithUser } from "@shared/schema";

interface PostCardProps {
  post: PostWithUser;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/posts/${post.id}/like`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", post.id] });
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
        postId: post.id,
        ownerId: post.userId,
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getUserBadge = () => {
    const ecoPoints = post.user.ecoPoints || 0;
    if (ecoPoints >= 1000) return { icon: "💚", name: "Green Icon" };
    if (ecoPoints >= 500) return { icon: "♻️", name: "Eco Star" };
    return null;
  };

  const userBadge = getUserBadge();

  return (
    <Card className="bg-white border-b border-gray-200 mb-1 rounded-none border-x-0 border-t-0">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
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
              {post.user.location || "Location"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {userBadge && (
            <Badge className="bg-eco-light text-eco-primary text-xs px-2 py-1 rounded-full font-medium">
              {userBadge.icon} {userBadge.name}
            </Badge>
          )}
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      </div>

      <Link href={`/post/${post.id}`}>
        <img 
          src={post.imageUrl} 
          alt="Thrift outfit post" 
          className="w-full h-80 object-cover cursor-pointer"
        />
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className="flex items-center space-x-1 p-0 hover:bg-transparent"
            >
              <Heart 
                className={`h-6 w-6 ${post.isLiked ? "fill-red-500 text-red-500" : "text-gray-700 hover:text-red-500"}`}
              />
            </Button>
            <Link href={`/post/${post.id}`}>
              <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                <MessageCircle className="h-6 w-6 text-gray-700" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
              <Share className="h-6 w-6 text-gray-700" />
            </Button>
            {post.availableForRent && (
              <Button 
                size="sm"
                className="bg-eco-secondary hover:bg-eco-secondary/90 text-white px-3 py-1 rounded-full text-xs font-medium"
                onClick={() => requestRentalMutation.mutate()}
                disabled={requestRentalMutation.isPending || post.userId === user?.id}
              >
                {requestRentalMutation.isPending 
                  ? "Requesting..." 
                  : post.userId === user?.id 
                    ? "Your Item" 
                    : "Rent This Look"
                }
              </Button>
            )}
          </div>
          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
            <Bookmark className="h-6 w-6 text-gray-700" />
          </Button>
        </div>

        <div className="mb-2">
          <span className="font-semibold text-gray-900">{post.likesCount || 0} likes</span>
        </div>

        <div className="mb-2">
          <span className="font-semibold text-gray-900">
            {post.user.username || post.user.firstName || "user"}
          </span>
          <span className="text-gray-900 ml-1">{post.caption}</span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-eco-light text-eco-primary text-xs px-2 py-1 rounded-full"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{post.tags.length - 3} more</span>
            )}
          </div>
        )}

        <div className="bg-eco-light p-3 rounded-lg mb-2">
          <div className="flex items-center justify-between">
            <span className="text-eco-primary font-medium text-sm">
              💧 Impact: Saved {post.waterSaved || "2.5"}L water
            </span>
            <span className="text-eco-primary font-medium text-sm">
              ♻️ +{post.ecoPoints || 50} Eco Points
            </span>
          </div>
        </div>

        <p className="text-gray-500 text-xs">{formatTime(post.createdAt)}</p>
      </div>
    </Card>
  );
}
