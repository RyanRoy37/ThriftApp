import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Navigation from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { UserWithStats } from "@shared/schema";

export default function StyleScore() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: userProfile } = useQuery<UserWithStats>({
    queryKey: ["/api/auth/user"],
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

  if (isLoading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  const ecoPoints = userProfile.ecoPoints || 0;
  const nextLevelPoints = 3600;
  const pointsToNext = nextLevelPoints - ecoPoints;
  const progressPercentage = (ecoPoints / nextLevelPoints) * 100;

  const badges = [
    {
      id: "eco-star",
      name: "Eco Star",
      icon: "♻️",
      description: "50+ eco-friendly posts",
      progress: Math.min((userProfile.postsCount / 50) * 100, 100),
      earned: userProfile.badges.some(b => b.name === "Eco Star"),
    },
    {
      id: "green-icon",
      name: "Green Icon",
      icon: "💚",
      description: "1000+ eco points",
      progress: Math.min((ecoPoints / 1000) * 100, 100),
      earned: userProfile.badges.some(b => b.name === "Green Icon"),
    },
    {
      id: "water-saver",
      name: "Water Saver",
      icon: "💧",
      description: "200L+ water saved",
      progress: Math.min((parseFloat(userProfile.waterSaved || "0") / 200) * 100, 100),
      earned: userProfile.badges.some(b => b.name === "Water Saver"),
    },
    {
      id: "trendsetter",
      name: "Trendsetter",
      icon: "🌟",
      description: "100+ likes average",
      progress: 75, // Placeholder calculation
      earned: userProfile.badges.some(b => b.name === "Trendsetter"),
    },
  ];

  const nextBadges = [
    {
      name: "Thrift Champion",
      icon: "🏆",
      description: "Post 100 thrift finds",
      progress: Math.min((userProfile.postsCount / 100) * 100, 100),
      current: userProfile.postsCount,
      target: 100,
    },
    {
      name: "Planet Protector",
      icon: "🌍",
      description: "Save 100kg CO₂",
      progress: Math.min((parseFloat(userProfile.carbonReduced || "0") / 100) * 100, 100),
      current: parseFloat(userProfile.carbonReduced || "0"),
      target: 100,
    },
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <div className="bg-white pb-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-eco-primary to-eco-secondary p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Style Score</h2>
          <div className="text-4xl font-bold mb-2">{ecoPoints.toLocaleString()}</div>
          <p className="text-green-100">Eco Points Earned</p>
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm mt-2 text-green-100">
            {pointsToNext > 0 ? `${pointsToNext} points to next level` : "Max level reached!"}
          </p>
        </div>

        {/* Current Badges */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Your Badges</h3>
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge) => (
              <Card 
                key={badge.id} 
                className={badge.earned ? "bg-eco-light" : "bg-gray-50"}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2 opacity-100">{badge.icon}</div>
                  <h4 className={`font-semibold ${badge.earned ? "text-eco-primary" : "text-gray-500"}`}>
                    {badge.name}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                  <div className={`rounded-full h-2 ${badge.earned ? "bg-eco-secondary" : "bg-gray-200"}`}>
                    <div 
                      className={`rounded-full h-2 transition-all duration-300 ${
                        badge.earned ? "bg-eco-primary" : "bg-gray-400"
                      }`}
                      style={{ width: `${Math.min(badge.progress, 100)}%` }}
                    ></div>
                  </div>
                  {badge.earned && (
                    <Badge className="mt-2 bg-eco-primary text-white text-xs">
                      Earned!
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Next Badges to Unlock */}
        <div className="p-4 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Next to Unlock</h3>
          <div className="space-y-3">
            {nextBadges.map((badge) => (
              <Card key={badge.name} className="bg-white">
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="text-2xl opacity-50">{badge.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">{badge.name}</h4>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-eco-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${Math.min(badge.progress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {badge.current.toFixed(badge.name.includes("CO₂") ? 1 : 0)}/{badge.target} 
                      {badge.name.includes("CO₂") ? " kg" : badge.name.includes("posts") ? " posts" : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
}
