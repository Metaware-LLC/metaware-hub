import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/DataTable";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { entityAPI } from "@/services/api";

interface StandardizedMetaEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  glossaryEntity: any;
  standardizedMeta: any[];
  onSuccess: (mappings: any[], savedMeta: any[]) => void;
  mappings: any[];
}

export function StandardizedMetaEditor({
  open,
  onOpenChange,
  glossaryEntity,
  standardizedMeta,
  onSuccess,
  mappings,
}: StandardizedMetaEditorProps) {
  const [editedData, setEditedData] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (standardizedMeta.length > 0) {
      setEditedData(standardizedMeta.map((meta, index) => ({
        ...meta,
        id: meta.id || `temp-${index}`,
      })));
    }
  }, [standardizedMeta]);

  const columns = [
    { key: "name", title: "Name", type: "text" as const },
    { key: "alias", title: "Alias", type: "text" as const },
    { key: "type", title: "Type", type: "text" as const },
    { key: "subtype", title: "Subtype", type: "text" as const },
    { key: "description", title: "Description", type: "text" as const },
    { key: "order", title: "Order", type: "number" as const },
    { key: "length", title: "Length", type: "number" as const },
    { key: "nullable", title: "Nullable", type: "checkbox" as const },
    { key: "format", title: "Format", type: "text" as const },
    { key: "is_primary_grain", title: "Primary Grain", type: "checkbox" as const },
    { key: "is_secondary_grain", title: "Secondary Grain", type: "checkbox" as const },
    { key: "is_tertiary_grain", title: "Tertiary Grain", type: "checkbox" as const },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entityRequest = {
        id: glossaryEntity.id,
        type: glossaryEntity.type,
        subtype: glossaryEntity.subtype || "",
        name: glossaryEntity.name,
        description: glossaryEntity.description || "",
        is_delta: false,
        runtime: "",
        tags: glossaryEntity.tags || "",
        custom_props: glossaryEntity.custom_props || [],
        dependency: "",
        primary_grain: glossaryEntity.primary_grain || "",
        secondary_grain: glossaryEntity.secondary_grain || "",
        tertiary_grain: glossaryEntity.tertiary_grain || "",
        sa_id: glossaryEntity.sa_id,
        update_strategy_: "I",
        ns: glossaryEntity.subjectarea?.namespace?.name || "",
        sa: glossaryEntity.subjectarea?.name || "",
        ns_type: "glossary",
      };

      const metaRequests = editedData.map((meta) => ({
        id: meta.id.startsWith('temp-') ? crypto.randomUUID() : meta.id,
        type: meta.type,
        subtype: meta.subtype || "",
        name: meta.name,
        description: meta.description || "",
        order: meta.order || 0,
        alias: meta.alias || "",
        length: meta.length || null,
        default: meta.default || null,
        nullable: meta.nullable ?? true,
        format: meta.format || null,
        is_primary_grain: meta.is_primary_grain ?? false,
        is_secondary_grain: meta.is_secondary_grain ?? false,
        is_tertiary_grain: meta.is_tertiary_grain ?? false,
        tags: meta.tags || "",
        custom_props: meta.custom_props || [],
        entity_id: glossaryEntity.id,
        ns: glossaryEntity.subjectarea?.namespace?.name || "",
        sa: glossaryEntity.subjectarea?.name || "",
        en: glossaryEntity.name,
        entity_core: {
          ns: glossaryEntity.subjectarea?.namespace?.name || "",
          sa: glossaryEntity.subjectarea?.name || "",
          en: glossaryEntity.name,
          ns_type: "glossary",
          ns_id: glossaryEntity.subjectarea?.namespace?.id || "",
          sa_id: glossaryEntity.sa_id,
          en_id: glossaryEntity.id,
        },
      }));

      await entityAPI.createWithMeta(entityRequest, metaRequests);

      toast({
        title: "Success",
        description: "Standardized metadata saved successfully",
      });

      // Return the saved meta with IDs so mappings can be enriched
      onSuccess(mappings, metaRequests);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving metadata:", error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save metadata",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Review Standardized Metadata</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <DataTable
            data={editedData}
            columns={columns}
            externalEditedData={editedData}
            onEditedDataChange={setEditedData}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Metadata
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
