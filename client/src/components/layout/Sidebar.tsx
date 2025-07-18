import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileText, 
  History, 
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  Menu,
  HelpCircle,
  Code,
  Info,
  Mail
} from "lucide-react";
// Using public folder path since the logo is served as static asset
import { cn } from "@/lib/utils";
import { useState } from "react";
import { User } from "@shared/schema";

export default function Sidebar() {
  const [location] = useLocation();
  const { user: userData } = useAuth();
  const user = userData as User;
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigation = [
    { name: "Report", href: "/", icon: Home },
    { name: "My Templates", href: "/templates", icon: FileText },
    { name: "Saved Reports", href: "/reports", icon: History },
  ];

  const bottomLinks = [
    { name: "How To Use", href: "/how-to-use", icon: HelpCircle },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  return (
    <div className={cn(
      "flex-none bg-nhs-blue text-white border-r border-gray-200 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-48 md:w-64"
    )}>
      {/* More Features Button */}
      <div className="p-4 border-b border-nhs-light-blue/20">
        
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full bg-nhs-accent-blue hover:bg-nhs-dark-blue text-white transition-all flex items-center justify-center",
            isCollapsed ? "px-2" : "px-4"
          )}
          size={isCollapsed ? "sm" : "default"}
        >
          <Menu className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">More Features</span>}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center rounded-lg transition-colors cursor-pointer",
                  isCollapsed ? "px-3 py-2 justify-center" : "px-3 py-2 space-x-3",
                  isActive 
                    ? "bg-nhs-light-blue/20 text-white" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Links */}
      <div className="px-4 py-2 border-t border-nhs-light-blue/20 space-y-1">
        {bottomLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center rounded-lg transition-colors cursor-pointer text-sm",
                  isCollapsed ? "px-2 py-1.5 justify-center" : "px-2 py-1.5 space-x-2",
                  isActive 
                    ? "bg-nhs-light-blue/20 text-white" 
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4" />
                {!isCollapsed && <span className="text-xs">{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-nhs-light-blue/20">
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "space-x-3"
        )}>
          <Avatar>
            <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
            <AvatarFallback className="bg-nhs-accent-blue text-white">
              {(user?.firstName?.[0] || user?.email?.[0] || "U")}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email
                  }
                </div>

              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white/70 hover:text-white hover:bg-white/10 p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
        {isCollapsed && (
          <div className="mt-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
