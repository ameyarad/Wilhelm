import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CloudUpload, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateUploadProps {
  compact?: boolean;
  defaultFolder?: string;
}

export default function TemplateUpload({ compact = false, defaultFolder }: TemplateUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("Custom");
  const [folder, setFolder] = useState(defaultFolder || "General");
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (data: { formData: FormData; folder?: string }) => {
      const response = await apiRequest("POST", "/api/templates/upload", data.formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template uploaded successfully",
      });
      setFile(null);
      setCategory("");
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Upload Failed",
        description: "Failed to upload template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a .docx, .doc, or .txt file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file || !category) {
      toast({
        title: "Missing Information",
        description: "Please select a file and category",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('template', file);
    formData.append('category', category);
    formData.append('folder', folder);

    uploadMutation.mutate({ formData, folder });
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
            dragOver 
              ? "border-nhs-blue bg-nhs-blue/5" 
              : "border-gray-300 hover:border-nhs-blue"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <CloudUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500 mb-1">
            {file ? file.name : "Drop files or click to browse"}
          </p>
          <p className="text-xs text-gray-400">
            .docx, .doc, .txt files
          </p>
        </div>

        <input
          id="file-input"
          type="file"
          accept=".docx,.doc,.txt"
          onChange={handleFileChange}
          className="hidden"
          multiple
        />

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Chest Imaging">Chest Imaging</SelectItem>
            <SelectItem value="CT Imaging">CT Imaging</SelectItem>
            <SelectItem value="MRI Imaging">MRI Imaging</SelectItem>
            <SelectItem value="Ultrasound">Ultrasound</SelectItem>
            <SelectItem value="Custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          onClick={handleUpload} 
          disabled={!file || !category || uploadMutation.isPending}
          className="w-full bg-nhs-light-blue hover:bg-nhs-light-blue/90 text-white h-8 text-sm"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              <Upload className="w-3 h-3 mr-1" />
              Upload
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload Custom Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            dragOver 
              ? "border-nhs-blue bg-nhs-blue/5" 
              : "border-gray-300 hover:border-nhs-blue"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input-full')?.click()}
        >
          <CloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500 mb-2">
            {file ? file.name : "Drop files here or click to browse"}
          </p>
          <p className="text-xs text-gray-400">
            Supports .docx, .doc, .txt files
          </p>
        </div>

        <input
          id="file-input-full"
          type="file"
          accept=".docx,.doc,.txt"
          onChange={handleFileChange}
          className="hidden"
          multiple
        />

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Chest Imaging">Chest Imaging</SelectItem>
              <SelectItem value="CT Imaging">CT Imaging</SelectItem>
              <SelectItem value="MRI Imaging">MRI Imaging</SelectItem>
              <SelectItem value="Ultrasound">Ultrasound</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!file || !category || uploadMutation.isPending}
          className="w-full bg-nhs-light-blue hover:bg-nhs-light-blue/90 text-white"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          Upload Template
        </Button>
      </CardContent>
    </Card>
  );
}