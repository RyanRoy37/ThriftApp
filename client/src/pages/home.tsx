import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Navigation from "@/components/navigation";
import PostCard from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Bell, MessageCircle } from "lucide-react";
import { PostWithUser } from "@shared/schema";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: posts, isLoading: postsLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts"],
    enabled: isAuthenticated,
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-eco-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xs">♻</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">ThriftShare</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5 text-gray-700" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageCircle className="h-5 w-5 text-gray-700" />
            </Button>
          </div>
        </div>
      </header>

      {/* Stories Section */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex space-x-4 overflow-x-auto">
          <Link href="/post">
            <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-eco-primary to-eco-secondary rounded-full flex items-center justify-center border-2 border-white">
                <Plus className="text-white text-lg" />
              </div>
              <span className="text-xs text-gray-600">Your Story</span>
            </div>
          </Link>
          
          {/* Sample story avatars */}
          <div className="flex flex-col items-center space-y-1 flex-shrink-0">
            <div className="w-16 h-16 rounded-full border-2 border-eco-primary p-1">
              <Avatar className="w-full h-full">
                <AvatarImage src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" />
                <AvatarFallback>E</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-gray-600">Emma</span>
          </div>
          
          <div className="flex flex-col items-center space-y-1 flex-shrink-0">
            <div className="w-16 h-16 rounded-full border-2 border-eco-primary p-1">
              <Avatar className="w-full h-full">
                <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" />
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-gray-600">Sarah</span>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <main className="pb-20">
        {postsLoading ? (
          <div className="p-4">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-80 bg-gray-300 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-1">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-500 mb-4">No posts yet</div>
            <Link href="/post">
              <Button className="bg-eco-primary hover:bg-eco-primary/90">
                Share Your First Find
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Link href="/sustainability">
        <Button 
          size="icon"
          className="fixed bottom-24 right-4 bg-eco-secondary hover:bg-eco-secondary/90 text-white p-3 rounded-full shadow-lg"
        >
          <span className="text-lg">🌱</span>
        </Button>
      </Link>

      <Navigation />
    </div>
  );
}
