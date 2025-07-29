import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Recycle, Leaf, Heart, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-light to-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Recycle className="h-8 w-8 text-eco-primary" />
            <h1 className="text-3xl font-bold text-gray-900">ThriftShare</h1>
          </div>
          <p className="text-lg text-gray-600">
            Sustainable Fashion Community
          </p>
        </div>

        {/* Features */}
        <Card>
          <CardContent className="pt-6 pb-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center space-y-2">
                <Leaf className="h-8 w-8 text-eco-secondary mx-auto" />
                <p className="text-sm text-gray-600">Eco-Friendly</p>
              </div>
              <div className="text-center space-y-2">
                <Heart className="h-8 w-8 text-red-500 mx-auto" />
                <p className="text-sm text-gray-600">Share Styles</p>
              </div>
              <div className="text-center space-y-2">
                <Users className="h-8 w-8 text-blue-500 mx-auto" />
                <p className="text-sm text-gray-600">Community</p>
              </div>
              <div className="text-center space-y-2">
                <Recycle className="h-8 w-8 text-eco-accent mx-auto" />
                <p className="text-sm text-gray-600">Rent & Share</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Join the sustainable fashion revolution
              </h3>
              <p className="text-gray-600">
                Share your thrift finds, earn eco points, and connect with fellow sustainable fashion enthusiasts.
              </p>
            </div>

            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="w-full bg-eco-primary hover:bg-eco-primary/90 text-white"
              size="lg"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-eco-primary">10K+</div>
            <div className="text-sm text-gray-600">Thrift Finds</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-eco-secondary">5K L</div>
            <div className="text-sm text-gray-600">Water Saved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-eco-accent">2K kg</div>
            <div className="text-sm text-gray-600">CO₂ Reduced</div>
          </div>
        </div>
      </div>
    </div>
  );
}
