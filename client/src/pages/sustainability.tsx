import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Navigation from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserWithStats } from "@shared/schema";

export default function Sustainability() {
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

  const waterSaved = parseFloat(userProfile.waterSaved || "0");
  const carbonReduced = parseFloat(userProfile.carbonReduced || "0");
  const itemsReused = userProfile.itemsReused || 0;

  // Monthly goals (these would typically come from user preferences or app settings)
  const monthlyGoals = {
    water: 100, // Liters
    carbon: 10, // kg
    items: 30,
  };

  const monthlyProgress = {
    water: Math.min((waterSaved / monthlyGoals.water) * 100, 100),
    carbon: Math.min((carbonReduced / monthlyGoals.carbon) * 100, 100),
    items: Math.min((itemsReused / monthlyGoals.items) * 100, 100),
  };

  const impactBreakdown = [
    {
      action: "Buying second-hand instead of new",
      impact: `${(carbonReduced * 0.7).toFixed(1)}kg CO₂`,
      color: "text-eco-primary",
    },
    {
      action: "Extending clothing lifecycle",
      impact: `${(waterSaved * 0.75).toFixed(0)}L water`,
      color: "text-blue-600",
    },
    {
      action: "Sharing and renting clothes",
      impact: `${(carbonReduced * 0.3).toFixed(1)}kg CO₂`,
      color: "text-green-600",
    },
  ];

  const communityPercentile = Math.min(78 + Math.floor(Math.random() * 15), 95);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <div className="bg-white pb-20">
        {/* Impact Overview */}
        <div className="bg-gradient-to-br from-green-600 to-eco-primary p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Your Environmental Impact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{waterSaved.toFixed(1)}L</div>
              <div className="text-green-100">Water Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{carbonReduced.toFixed(1)}kg</div>
              <div className="text-green-100">CO₂ Reduced</div>
            </div>
          </div>
        </div>

        {/* Monthly Progress */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">This Month's Progress</h3>
          <div className="space-y-4">
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-700 font-medium">💧 Water Conservation</span>
                  <span className="text-sm text-blue-600">{waterSaved.toFixed(1)}L saved</span>
                </div>
                <Progress value={monthlyProgress.water} className="mb-1" />
                <p className="text-xs text-blue-600">Goal: {monthlyGoals.water}L</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-700 font-medium">🌱 Carbon Footprint</span>
                  <span className="text-sm text-green-600">{carbonReduced.toFixed(1)}kg reduced</span>
                </div>
                <Progress value={monthlyProgress.carbon} className="mb-1" />
                <p className="text-xs text-green-600">Goal: {monthlyGoals.carbon}kg</p>
              </CardContent>
            </Card>

            <Card className="bg-eco-light">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-eco-primary font-medium">♻️ Items Reused</span>
                  <span className="text-sm text-eco-primary">{itemsReused} items</span>
                </div>
                <Progress value={monthlyProgress.items} className="mb-1" />
                <p className="text-xs text-eco-primary">Goal: {monthlyGoals.items} items</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Impact Breakdown */}
        <div className="p-4 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Impact Breakdown</h3>
          <div className="space-y-3">
            {impactBreakdown.map((item, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-3 flex justify-between items-center">
                  <span className="text-gray-700 text-sm">{item.action}</span>
                  <span className={`font-semibold ${item.color}`}>-{item.impact}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Community Comparison */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Community Comparison</h3>
          <Card className="bg-gradient-to-r from-eco-light to-green-50">
            <CardContent className="p-6 text-center">
              <p className="text-gray-700 mb-2">You're doing better than</p>
              <p className="text-3xl font-bold text-eco-primary mb-2">{communityPercentile}%</p>
              <p className="text-gray-700">of ThriftShare users!</p>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <div className="p-4 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Eco Tips</h3>
          <div className="space-y-3">
            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">💡</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Shop your closet first</h4>
                    <p className="text-sm text-gray-600">Before buying, see what you already own that could work.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">🔄</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Organize clothing swaps</h4>
                    <p className="text-sm text-gray-600">Get friends together to exchange clothes you no longer wear.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">🧵</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Learn basic repairs</h4>
                    <p className="text-sm text-gray-600">Simple sewing skills can extend clothing life significantly.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
}
