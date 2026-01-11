import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { glossaryAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface CustomBlueprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  glossaryEntity: any;
  onSuccess: (standardizedMeta: any[], mappings: any[]) => void;
}

export function CustomBlueprintModal({
  open,
  onOpenChange,
  glossaryEntity,
  onSuccess,
}: CustomBlueprintModalProps) {
  const [topic, setTopic] = useState("");
  const [numFields, setNumFields] = useState<number | undefined>(undefined);
  const [exampleData, setExampleData] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim() && !exampleData.trim()) {
      toast({
        title: "Input required",
        description: "Please describe a topic or provide example data.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const targetNs = glossaryEntity.subjectarea?.namespace?.name || "";
      const targetSa = glossaryEntity.subjectarea?.name || "";
      const targetEn = glossaryEntity.name || "";

      const response = await glossaryAPI.generateCustomBlueprint({
        topic: topic.trim(),
        ...(numFields !== undefined && { num_fields: numFields }),
        example_data: exampleData.trim(),
        target_ns: targetNs,
        target_sa: targetSa,
        target_en: targetEn,
      }) as any;

      // Transform the response into the format needed for StandardizedMetaEditor
      const standardizedMetas = response.return_data?.standardized_metas || [];
      const transformedMeta = standardizedMetas.map((meta: any, index: number) => ({
        id: `temp-${index}`,
        type: meta.type,
        subtype: meta.subtype || "",
        name: meta.name,
        alias: meta.alias || "",
        description: meta.description || "",
        order: meta.order || index,
        length: meta.length || null,
        default: meta.default || null,
        nullable: meta.nullable ?? true,
        format: meta.format || null,
        is_primary_grain: meta.is_primary_grain ?? false,
        is_secondary_grain: false,
        is_tertiary_grain: false,
        tags: "",
        custom_props: [],
      }));

      // No mappings for custom blueprint since there's no source entity
      onSuccess(transformedMeta, []);
      onOpenChange(false);

      // Reset form
      setTopic("");
      setNumFields(undefined);
      setExampleData("");
    } catch (error) {
      console.error("Error generating custom blueprint:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate custom blueprint",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTopic("");
    setNumFields(undefined);
    setExampleData("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex-start gap-sm text-lg">
            <Wand2 className="icon-md icon-primary" />
            Generate Custom Blueprint
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Use AI to generate fields based on your topic or example data.
          </p>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="topic" className="text-sm">Describe your topic:</Label>
              <Input
                id="topic"
                placeholder='Examples: "flight logs", "social media", "stock trades"'
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="w-24 space-y-1.5">
              <Label htmlFor="numFields" className="text-sm"># Fields:</Label>
              <Input
                id="numFields"
                type="number"
                min={1}
                max={50}
                placeholder="Auto"
                value={numFields ?? ""}
                onChange={(e) => setNumFields(e.target.value ? parseInt(e.target.value) : undefined)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="flex-center gap-3 my-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exampleData" className="text-sm">Provide some example data:</Label>
            <Textarea
              id="exampleData"
              placeholder="Paste CSV, JSON, or XML here..."
              className="min-h-[120px] font-mono text-xs rounded-xl"
              value={exampleData}
              onChange={(e) => setExampleData(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={(!topic.trim() && !exampleData.trim()) || isGenerating}
            className="rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="icon-sm mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Fields"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}