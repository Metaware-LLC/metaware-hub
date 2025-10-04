import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG } from "@/config/api";

interface ImportConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const SHEET_OPTIONS = [
  { value: "namespace", label: "Namespace" },
  { value: "subjectarea", label: "Subject Area" },
  { value: "meta", label: "Meta" },
  { value: "entity", label: "Entity" },
  { value: "rules", label: "Rules" },
];

export function ImportConfigModal({
  open,
  onOpenChange,
  onSuccess,
}: ImportConfigModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [sheetName, setSheetName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file || !sheetName) {
      toast({
        title: "Missing Information",
        description: "Please select both a file and sheet name",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_CONFIG.REST_ENDPOINT}/mwn/import_configuration?sheet_name=${encodeURIComponent(sheetName)}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Upload failed");
      }

      toast({
        title: "Success",
        description: "Configuration imported successfully",
      });

      handleCancel();
      onSuccess?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to import configuration",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setSheetName("");
    setIsUploading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Configuration</DialogTitle>
          <DialogDescription>
            Upload a configuration file and select the sheet name to import
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sheet Name Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Sheet Name <span className="text-destructive">*</span>
            </label>
            <Select value={sheetName} onValueChange={setSheetName}>
              <SelectTrigger>
                <SelectValue placeholder="Select sheet name" />
              </SelectTrigger>
              <SelectContent>
                {SHEET_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              File <span className="text-destructive">*</span>
            </label>
            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-accent/50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !sheetName || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
