import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Template } from "@shared/schema";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Save, X, FileText, Undo, Redo } from "lucide-react";

interface RichTextEditorProps {
  template?: Template;
  isOpen: boolean;
  onClose: () => void;
}

export default function RichTextEditor({ template, isOpen, onClose }: RichTextEditorProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [folder, setFolder] = useState("General");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const quillRef = useRef<ReactQuill>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Update form state when template changes
  useEffect(() => {
    if (isOpen) {
      if (template) {
        setName(template.name || "");
        // Handle both HTML and plain text content, clean any binary artifacts
        let cleanContent = template.content || "";
        
        // If content contains binary artifacts (from .doc files), clean it
        if (cleanContent.includes('��') || cleanContent.includes('\x00') || cleanContent.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/)) {
          // Extract readable text from corrupted content
          const textMatches = cleanContent.match(/[A-Za-z0-9\s\.\,\:\;\!\?\-\(\)\[\]]{8,}/g);
          if (textMatches && textMatches.length > 0) {
            cleanContent = textMatches
              .filter(match => match.trim().length > 5)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
          } else {
            cleanContent = "Please re-upload this template file for better text extraction.";
          }
        }
        
        setContent(cleanContent);
        setFolder(template.folder || "General");
      } else {
        setName("");
        setContent("");
        setFolder("General");
      }
    }
  }, [template, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const endpoint = template ? `/api/templates/${template.id}` : "/api/templates";
      const method = template ? "PUT" : "POST";
      const response = await apiRequest(method, endpoint, templateData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: template ? "Template updated successfully" : "Template created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Validation Error",
        description: "Template content is required",
        variant: "destructive",
      });
      return;
    }



    saveMutation.mutate({
      name: name.trim(),
      content: content.trim(),
      folder: folder.trim(),
    });
  };

  const handleClose = () => {
    setName(template?.name || "");
    setContent(template?.content || "");
    setFolder(template?.folder || "General");
    onClose();
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
    history: {
      delay: 1000,
      maxStack: 100,
      userOnly: true
    }
  };

  const handleUndo = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.history.undo();
      updateHistoryState();
    }
  };

  const handleRedo = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.history.redo();
      updateHistoryState();
    }
  };

  const updateHistoryState = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const history = quill.history;
      setCanUndo(history.stack.undo.length > 0);
      setCanRedo(history.stack.redo.length > 0);
    }
  };

  const handleTextChange = (value: string) => {
    setContent(value);
    // Update history state after text change
    setTimeout(updateHistoryState, 100);
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'script',
    'list', 'bullet', 'indent', 'link', 'color', 'background',
    'align'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] md:h-[85vh] flex flex-col mobile-dialog">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-sm md:text-base">
            <FileText className="h-4 w-4 md:h-5 md:w-5 text-nhs-blue" />
            {template ? "Edit Template" : "Create New Template"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 flex flex-col gap-3 md:gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-1 md:space-y-2">
              <Label htmlFor="name" className="text-xs md:text-sm">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter template name"
                className="w-full text-sm"
              />
            </div>
            
            <div className="space-y-1 md:space-y-2">
              <Label htmlFor="folder" className="text-xs md:text-sm">Folder</Label>
              <Input
                id="folder"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="Enter folder name"
                className="w-full text-sm"
              />
            </div>
          </div>

          <div className="space-y-2 flex-1 min-h-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Label className="text-xs md:text-sm">Template Content</Label>
              <div className="flex gap-1 md:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="flex items-center gap-1 text-xs md:text-sm"
                >
                  <Undo className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Undo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="flex items-center gap-1 text-xs md:text-sm"
                >
                  <Redo className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Redo</span>
                </Button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={handleTextChange}
                className="scrollable-editor h-full"
                style={{ height: '100%' }}
                modules={modules}
                formats={formats}
                onKeyDown={(e) => {
                  // Handle keyboard shortcuts
                  if (e.ctrlKey || e.metaKey) {
                    const key = e.key.toLowerCase();
                    if (key === 'z' && !e.shiftKey) {
                      e.preventDefault();
                      handleUndo();
                    } else if (key === 'z' && e.shiftKey || key === 'y') {
                      e.preventDefault();
                      handleRedo();
                    }
                  }
                }}
                onReady={() => {
                  // Update history state when editor is ready
                  setTimeout(updateHistoryState, 100);
                }}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-nhs-blue hover:bg-nhs-blue/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}