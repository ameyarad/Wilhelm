import { useState, useRef } from "react";
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
import { Save, X, FileText } from "lucide-react";

interface RichTextEditorProps {
  template?: Template;
  isOpen: boolean;
  onClose: () => void;
}

export default function RichTextEditor({ template, isOpen, onClose }: RichTextEditorProps) {
  const [name, setName] = useState(template?.name || "");
  const [content, setContent] = useState(template?.content || "");
  const [category, setCategory] = useState(template?.category || "");
  const [folder, setFolder] = useState(template?.folder || "General");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const quillRef = useRef<ReactQuill>(null);

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

    if (!category.trim()) {
      toast({
        title: "Validation Error",
        description: "Template category is required",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      name: name.trim(),
      content: content.trim(),
      category: category.trim(),
      folder: folder.trim(),
    });
  };

  const handleClose = () => {
    setName(template?.name || "");
    setContent(template?.content || "");
    setCategory(template?.category || "");
    setFolder(template?.folder || "General");
    onClose();
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'link'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-nhs-blue" />
            {template ? "Edit Template" : "Create New Template"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter template name"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chest Imaging">Chest Imaging</SelectItem>
                  <SelectItem value="CT Imaging">CT Imaging</SelectItem>
                  <SelectItem value="MRI Imaging">MRI Imaging</SelectItem>
                  <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                  <SelectItem value="X-ray">X-ray</SelectItem>
                  <SelectItem value="Mammography">Mammography</SelectItem>
                  <SelectItem value="Nuclear Medicine">Nuclear Medicine</SelectItem>
                  <SelectItem value="Interventional">Interventional</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Input
              id="folder"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="Enter folder name"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2 flex-1 min-h-0">
            <Label>Template Content</Label>
            <div className="border rounded-lg overflow-hidden flex-1 min-h-0">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                className="h-full"
                style={{ height: '300px' }}
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