import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Circle } from "lucide-react";
import { useLocation } from "wouter";

export default function Header() {
  const [, navigate] = useLocation();

  const handleNewReport = () => {
    navigate("/chat");
  };

  return (
    <header className="flex-none h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-nhs-dark-grey">
          AI Radiology Agent
        </h1>
        <Badge variant="outline" className="flex items-center space-x-2">
          <Circle className="w-2 h-2 fill-nhs-green text-nhs-green" />
          <span className="text-xs">AI Models Active</span>
        </Badge>
      </div>
      <div className="flex items-center space-x-4">
        <Button 
          onClick={handleNewReport}
          className="bg-nhs-green hover:bg-nhs-green/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Report
        </Button>
      </div>
    </header>
  );
}
