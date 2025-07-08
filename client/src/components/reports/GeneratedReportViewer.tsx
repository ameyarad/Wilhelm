import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const quillRef = useRef<ReactQuill>(null);

  // Update content when report changes and preserve formatting
  useEffect(() => {
    if (isOpen && report) {
      // Preserve HTML formatting if present, otherwise convert plain text to HTML
      let formattedContent = report;
      
      // If content doesn't contain HTML tags, convert line breaks to HTML
      if (!report.includes('<') && !report.includes('>')) {
        formattedContent = report
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>')
          .replace(/^/, '<p>')
          .replace(/$/, '</p>')
          .replace(/<p><\/p>/g, ''); // Remove empty paragraphs
        
        // Handle common formatting patterns
        formattedContent = formattedContent
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
          .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
          .replace(/__(.*?)__/g, '<u>$1</u>'); // Underline
      }
      
      setContent(formattedContent);
    }
  }, [report, isOpen]);

  // Check undo/redo state and add keyboard shortcuts
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

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey || event.metaKey) {
          if (event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            handleUndo();
          } else if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
            event.preventDefault();
            handleRedo();
          }
        }
      };

      editor.on('text-change', handleHistoryChange);
      document.addEventListener('keydown', handleKeyDown);
      
      // Initial check
      handleHistoryChange();
      
      return () => {
        editor.off('text-change', handleHistoryChange);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await apiRequest("POST", "/api/reports", reportData);
      return response.json();
    },
    onSuccess: () => {
      setError("");
      console.log("Report saved successfully");
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      onClose();
    },
    onError: (error) => {
      setError("Failed to save report");
      console.error("Save error:", error);
    },
  });

  const handleSave = () => {
    if (!content.trim()) {
      setError("Report content is required");
      return;
    }

    const now = new Date();
    const reportData = {
      title: now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      content: content,
      status: "draft" as const,
      templateId: null, // No template association for generated reports
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
      // Safely extract plain text from HTML content without XSS risk
      const tempElement = document.createElement('div');
      
      // Sanitize HTML by removing script tags and other dangerous elements
      const sanitizedContent = content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        .replace(/javascript:/gi, '');
      
      tempElement.innerHTML = sanitizedContent;
      const plainText = tempElement.textContent || tempElement.innerText || content;
      
      await navigator.clipboard.writeText(plainText);
      setError("");
      console.log("Report copied to clipboard");
    } catch (error) {
      setError("Failed to copy report");
      console.error("Copy failed:", error);
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
      <DialogContent className="w-[95vw] max-w-6xl h-[90vh] md:h-[85vh] flex flex-col overflow-hidden mobile-dialog" aria-describedby="report-viewer-description">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-nhs-blue" />
            <span>Your Report</span>
          </DialogTitle>
          <div id="report-viewer-description" className="text-sm text-muted-foreground">Edit, Copy And Save Reports</div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden min-h-0">
          <Card className="border-0 shadow-none h-full flex flex-col">
            <CardHeader className="pb-2 px-2 md:px-4 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-1 md:space-x-2 overflow-x-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="p-2 h-8 hover:bg-nhs-light-blue/20 flex-shrink-0"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="p-2 h-8 hover:bg-nhs-light-blue/20 flex-shrink-0"
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300 mx-1 md:mx-2 flex-shrink-0" />
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="text-nhs-green text-xs md:text-sm"
                  >
                    <Copy className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                    <span className="hidden sm:inline">Copy</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="bg-nhs-blue hover:bg-nhs-blue/90 text-white text-xs md:text-sm"
                    size="sm"
                  >
                    <Save className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                    <span className="hidden sm:inline">Save Report</span>
                    <span className="sm:hidden">Save</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 md:p-4 flex-1 overflow-hidden min-h-0">
              <div className="h-full">
                <ReactQuill
                  ref={quillRef}
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  theme="snow"
                  style={{
                    height: '100%',
                    minHeight: '200px'
                  }}
                  className="scrollable-editor"
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