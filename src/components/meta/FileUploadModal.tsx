import { useState } from "react";
import { X, Upload, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  namespace: string;
  subjectArea: string;
  entity: string;
  namespaceType: string;
  primaryGrain: string;
  onSuccess: (draftRows?: any[]) => void;
}

export function FileUploadModal({
  open,
  onOpenChange,
  namespace,
  subjectArea,
  entity,
  namespaceType,
  primaryGrain,
  onSuccess,
}: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [createMeta, setCreateMeta] = useState(false);
  const [loadData, setLoadData] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid File",
          description: "Please upload a CSV file only",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setUploadProgress(100); // Show full progress when file is selected
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  const handleProcess = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const queryParams = new URLSearchParams({
        ns: namespace,
        sa: subjectArea,
        en: entity,
        ns_type: namespaceType,
        create_meta: String(createMeta),
        load_data: String(loadData),
        primary_grain: primaryGrain || '',
      });

      const response = await fetch(
        `http://localhost:8000/mwn/auto_detect_staging?${queryParams}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} - ${response.statusText}`);
      }

      const responseData = await response.json();

      // If both create_meta and load_data are false, pass the detected fields as draft rows
      const shouldReturnDraftRows = !createMeta && !loadData;

      toast({
        title: "Success",
        description: shouldReturnDraftRows 
          ? "Meta fields detected. Click Save to persist them."
          : "File processed successfully",
      });

      // Reset form
      setFile(null);
      setUploadProgress(0);
      setCreateMeta(false);
      setLoadData(false);
      onOpenChange(false);
      onSuccess(shouldReturnDraftRows ? responseData : undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to process file: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setUploadProgress(0);
    setCreateMeta(false);
    setLoadData(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload CSV File</DialogTitle>
          <DialogDescription>
            Upload a CSV file to auto-detect and create meta fields for {entity}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload Section */}
          <div className="space-y-2">
            <Label>CSV File</Label>
            {!file ? (
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload CSV file
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="flex-1 text-sm truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Upload Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-meta"
                checked={createMeta}
                onCheckedChange={(checked) => setCreateMeta(checked as boolean)}
                disabled={isUploading}
              />
              <Label
                htmlFor="create-meta"
                className="text-sm font-normal cursor-pointer"
              >
                Create Meta
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="load-data"
                checked={loadData}
                onCheckedChange={(checked) => setLoadData(checked as boolean)}
                disabled={isUploading}
              />
              <Label
                htmlFor="load-data"
                className="text-sm font-normal cursor-pointer"
              >
                Load Data
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleProcess}
            disabled={!file || isUploading}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Process
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
