import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FileText, X, Copy, Save, Undo, Redo } from "lucide-react";

interface GeneratedReportViewerProps {
  report: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function GeneratedReportViewer({ report, isOpen, onClose }: GeneratedReportViewerProps) {
  const [content, setContent] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const quillRef = useRef<ReactQuill>(null);

  // Update content when report changes
  useEffect(() => {
    if (isOpen && report) {
      setContent(report);
    }
  }, [report, isOpen]);

  // Check undo/redo state
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      
      const handleHistoryChange = () => {
        const history = editor.getModule('history');
        if (history) {
          setCanUndo(history.stack.undo.length > 0);
          setCanRedo(history.stack.redo.length > 0);
        }
      };

      editor.on('text-change', handleHistoryChange);
      
      return () => {
        editor.off('text-change', handleHistoryChange);
      };
    }
  }, [isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await apiRequest("POST", "/api/reports", reportData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Report saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!content.trim()) {
      toast({
        title: "Validation Error",
        description: "Report content is required",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const reportData = {
      title: `Generated Report - ${now.toLocaleDateString()}`,
      content: content,
      status: "draft" as const,
      metadata: {
        generatedAt: now.toISOString(),
        source: "AI Generated",
        type: "Generated Report"
      }
    };

    saveMutation.mutate(reportData);
  };

  const handleCopy = async () => {
    try {
      // Create a temporary element to extract plain text from HTML
      const tempElement = document.createElement('div');
      tempElement.innerHTML = content;
      const plainText = tempElement.textContent || tempElement.innerText || content;
      
      await navigator.clipboard.writeText(plainText);
      toast({
        title: "Copied",
        description: "Report copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy report",
        variant: "destructive",
      });
    }
  };

  const handleUndo = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.history.undo();
    }
  };

  const handleRedo = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.history.redo();
    }
  };

  // Rich text editor configuration
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
    history: {
      delay: 1000,
      maxStack: 100,
      userOnly: true
    },
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script', 'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'align', 'direction',
    'link', 'image', 'video'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden" aria-describedby="report-viewer-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-nhs-blue" />
            <span>Generated Report</span>
          </DialogTitle>
          <div id="report-viewer-description" className="text-sm text-muted-foreground">
            Edit and format your generated report using the rich text editor below
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="p-2 h-8"
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="p-2 h-8"
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300" />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="text-nhs-green"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="bg-nhs-blue hover:bg-nhs-blue/90 text-white"
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <ReactQuill
                  ref={quillRef}
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  theme="snow"
                  style={{
                    height: '450px'
                  }}
                  placeholder="Generated report content will appear here..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}