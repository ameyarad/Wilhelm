import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Template } from "@shared/schema";
import { Eye, Copy, Edit, FileText, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TemplateViewerProps {
  template: Template;
  onEdit?: (template: Template) => void;
}

export default function TemplateViewer({ template, onEdit }: TemplateViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template.content);
      toast({
        title: "Copied",
        description: "Template content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy template content",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(template);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-nhs-blue" />
            {template.name}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Badge variant="secondary">{template.category}</Badge>
            {template.folder && (
              <Badge variant="outline">{template.folder}</Badge>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-nhs-blue"
            >
              <Copy className="h-3 w-3 mr-2" />
              Copy
            </Button>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="text-nhs-blue"
              >
                <Edit className="h-3 w-3 mr-2" />
                Edit
              </Button>
            )}
          </div>
          
          <ScrollArea className="flex-1 border rounded-lg">
            <div className="p-4">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                  {template.content}
                </pre>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}