import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Post, UserWithStats } from "@shared/schema";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: userProfile } = useQuery<UserWithStats>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  const { data: userPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts/user", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <div className="bg-white pb-20">
        {/* Profile Header */}
        <div className="p-6 text-center border-b border-gray-200">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src={userProfile.profileImageUrl || ""} />
            <AvatarFallback className="text-xl">
              {userProfile.firstName?.[0] || userProfile.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {userProfile.firstName && userProfile.lastName 
              ? `${userProfile.firstName} ${userProfile.lastName}`
              : userProfile.username || userProfile.email
            }
          </h2>
          
          <p className="text-gray-600 mb-2">
            {userProfile.bio || "Sustainable fashion advocate | Thrift enthusiast | Planet lover 🌱"}
          </p>
          
          {userProfile.location && (
            <p className="text-sm text-gray-500 mb-4">📍 {userProfile.location}</p>
          )}
          
          <div className="flex justify-center space-x-8 mb-4">
            <div className="text-center">
              <span className="block text-xl font-bold text-gray-900">
                {userProfile.postsCount}
              </span>
              <span className="text-sm text-gray-500">Posts</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-gray-900">
                {userProfile.followersCount}
              </span>
              <span className="text-sm text-gray-500">Followers</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-gray-900">
                {userProfile.followingCount}
              </span>
              <span className="text-sm text-gray-500">Following</span>
            </div>
          </div>
          
          <div className="flex space-x-2 justify-center mb-4">
            <Button className="bg-eco-primary hover:bg-eco-primary/90">
              Edit Profile
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/api/logout"}
            >
              Logout
            </Button>
          </div>
        </div>
        
        {/* Sustainability Stats */}
        <div className="p-4 bg-eco-light">
          <h3 className="font-semibold text-eco-primary mb-3">Your Eco Impact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg text-center">
              <div className="text-blue-500 text-xl mb-2">💧</div>
              <p className="text-lg font-bold text-gray-900">
                {parseFloat(userProfile.waterSaved || "0").toFixed(1)}L
              </p>
              <p className="text-xs text-gray-600">Water Saved</p>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <div className="text-green-500 text-xl mb-2">🌱</div>
              <p className="text-lg font-bold text-gray-900">
                {parseFloat(userProfile.carbonReduced || "0").toFixed(1)}kg
              </p>
              <p className="text-xs text-gray-600">CO₂ Reduced</p>
            </div>
          </div>
        </div>
        
        {/* Achievement Badges */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Achievement Badges</h3>
          <div className="flex flex-wrap gap-2">
            {userProfile.badges.length > 0 ? (
              userProfile.badges.map((badge) => (
                <Badge 
                  key={badge.id} 
                  className="bg-eco-primary text-white px-3 py-1 rounded-full text-sm"
                >
                  {badge.icon} {badge.name}
                </Badge>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No badges earned yet. Keep posting to earn your first badge!</p>
            )}
          </div>
        </div>
        
        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-1">
          {userPosts && userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div key={post.id} className="aspect-square">
                <img 
                  src={post.imageUrl} 
                  alt="Post" 
                  className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                />
              </div>
            ))
          ) : (
            <div className="col-span-3 p-8 text-center text-gray-500">
              <p>No posts yet</p>
              <p className="text-sm">Share your first thrift find!</p>
            </div>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
}
