import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Save, Download, FileText } from "lucide-react";

interface ReportEditorProps {
  content: string;
  title: string;
  template?: string;
  onSave?: (content: string) => void;
}

export default function ReportEditor({ 
  content, 
  title, 
  template, 
  onSave 
}: ReportEditorProps) {
  const [editableContent, setEditableContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableContent);
      toast({
        title: "Copied",
        description: "Report content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy report content",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editableContent);
      setIsEditing(false);
      toast({
        title: "Saved",
        description: "Report has been saved successfully",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([editableContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <FileText className="w-5 h-5 text-nhs-blue" />
            <span>{title}</span>
          </CardTitle>
          {template && (
            <Badge variant="outline" className="text-xs">
              {template}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-nhs-blue"
          >
            {isEditing ? "Preview" : "Edit"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-nhs-green"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-nhs-light-blue"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          {isEditing && (
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-nhs-green hover:bg-nhs-green/90"
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {isEditing ? (
          <Textarea
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
            placeholder="Enter report content..."
          />
        ) : (
          <div className="bg-white border rounded-lg p-4 min-h-[400px]">
            <pre className="whitespace-pre-wrap text-sm text-nhs-dark-grey">
              {editableContent}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
