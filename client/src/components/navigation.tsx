import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, Plus, Award, User } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/rent", icon: RefreshCw, label: "Rent" },
    { path: "/post", icon: Plus, label: "Post", special: true },
    { path: "/style-score", icon: Award, label: "Score" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;

          if (item.special) {
            return (
              <Link key={item.path} href={item.path}>
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center py-2 px-4"
                >
                  <div className="bg-eco-primary rounded-full w-8 h-8 flex items-center justify-center mb-1">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs text-eco-primary font-medium">
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          }

          return (
            <Link key={item.path} href={item.path}>
              <Button 
                variant="ghost" 
                className="flex flex-col items-center py-2 px-4"
              >
                <Icon className={`h-5 w-5 mb-1 ${
                  isActive ? "text-eco-primary" : "text-gray-400"
                }`} />
                <span className={`text-xs ${
                  isActive 
                    ? "text-eco-primary font-medium" 
                    : "text-gray-400"
                }`}>
                  {item.label}
                </span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
