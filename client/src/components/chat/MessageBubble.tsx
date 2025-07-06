import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Copy, Edit, FileText, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: ChatMessage;
  user: User | null;
}

export default function MessageBubble({ message, user }: MessageBubbleProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  const isUser = message.role === "user";
  const isReport = message.messageType === "report";

  return (
    <div className={cn("flex items-start space-x-4", isUser && "justify-end")}>
      {!isUser && (
        <div className="w-10 h-10 bg-nhs-blue rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={cn("flex-1", isUser && "max-w-2xl")}>
        <div
          className={cn(
            "rounded-lg p-4",
            isUser 
              ? "bg-nhs-blue text-white ml-auto" 
              : "bg-nhs-light-grey text-nhs-dark-grey"
          )}
        >
          {isReport && message.metadata?.templateUsed && (
            <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-current/20">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">
                Generated using: {message.metadata.templateUsed}
              </span>
              {message.metadata.confidence && (
                <Badge variant="secondary" className="text-xs">
                  {Math.round(message.metadata.confidence * 100)}% confidence
                </Badge>
              )}
            </div>
          )}
          
          <div className="whitespace-pre-wrap text-sm">
            {message.content}
          </div>
          
          {isReport && (
            <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-current/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className={cn(
                  "text-xs h-8",
                  isUser 
                    ? "text-white hover:bg-white/20" 
                    : "text-nhs-green hover:bg-nhs-green/10"
                )}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy Report
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs h-8",
                  isUser 
                    ? "text-white hover:bg-white/20" 
                    : "text-nhs-light-blue hover:bg-nhs-light-blue/10"
                )}
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit Report
              </Button>
            </div>
          )}
        </div>
        
        <div className={cn("text-xs text-gray-500 mt-2", isUser && "text-right")}>
          {isUser ? (
            <>
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email || "You"
              } • {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </>
          ) : (
            <>
              AI Assistant • {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </>
          )}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
          <AvatarFallback className="bg-nhs-green text-white">
            {user?.firstName?.[0] || user?.email?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
