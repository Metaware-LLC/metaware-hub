import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GET_SUBJECTAREAS } from "@/graphql/queries/subjectarea";
import { GET_ENTITIES } from "@/graphql/queries/entity";
import { Loader2, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { glossaryAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface GenerateBlueprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  namespaceId: string;
  glossaryEntity: any;
  onSuccess: (standardizedMeta: any[], mappings: any[]) => void;
}

export function GenerateBlueprintModal({
  open,
  onOpenChange,
  namespaceId,
  glossaryEntity,
  onSuccess,
}: GenerateBlueprintModalProps) {
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const { data: subjectAreasData, loading: subjectAreasLoading } = useQuery(GET_SUBJECTAREAS, {
    variables: { type: "staging" },
  });

  const { data: entitiesData, loading: entitiesLoading } = useQuery(GET_ENTITIES);

  const stagingEntities = entitiesData?.meta_entity?.filter(
    (entity: any) => entity.subjectarea?.namespace?.type === "staging"
  ) || [];

  const subjectAreasWithEntities = subjectAreasData?.meta_subjectarea
    ?.filter((sa: any) => sa.namespace?.type === "staging")
    .map((sa: any) => ({
      ...sa,
      entities: stagingEntities.filter((e: any) => e.sa_id === sa.id),
    }))
    .filter((sa: any) => sa.entities.length > 0) || [];

  const handleToggleEntity = (entityId: string) => {
    setSelectedEntityIds(prev =>
      prev.includes(entityId)
        ? prev.filter(id => id !== entityId)
        : [...prev, entityId]
    );
  };

  const handleToggleSubjectArea = (subjectAreaId: string) => {
    const subjectArea = subjectAreasWithEntities.find((sa: any) => sa.id === subjectAreaId);
    if (!subjectArea) return;

    const entityIds = subjectArea.entities.map((e: any) => e.id);
    const allSelected = entityIds.every(id => selectedEntityIds.includes(id));

    if (allSelected) {
      setSelectedEntityIds(prev => prev.filter(id => !entityIds.includes(id)));
    } else {
      setSelectedEntityIds(prev => [...new Set([...prev, ...entityIds])]);
    }
  };

  const handleGenerate = async () => {
    if (selectedEntityIds.length === 0) {
      toast({
        title: "No entities selected",
        description: "Please select at least one entity to generate conventions.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const targetNs = glossaryEntity.subjectarea?.namespace?.name || "";
      const targetSa = glossaryEntity.subjectarea?.name || "";
      
      const response = await glossaryAPI.generateSuggestions(selectedEntityIds, targetNs, targetSa) as any;
      onSuccess(response.standardized_meta || [], response.mappings || []);
      onOpenChange(false);
      setSelectedEntityIds([]);
    } catch (error) {
      console.error("Error generating blueprint:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate standardized conventions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isLoading = subjectAreasLoading || entitiesLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Standardized Blueprint
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {subjectAreasWithEntities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No staging entities found to generate conventions from.
                  </p>
                ) : (
                  subjectAreasWithEntities.map((subjectArea: any) => (
                    <div key={subjectArea.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={subjectArea.entities.every((e: any) =>
                            selectedEntityIds.includes(e.id)
                          )}
                          onCheckedChange={() => handleToggleSubjectArea(subjectArea.id)}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{subjectArea.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subjectArea.namespace?.name} • {subjectArea.entities.length} entities
                          </p>
                        </div>
                      </div>

                      <div className="ml-7 space-y-2">
                        {subjectArea.entities.map((entity: any) => (
                          <div key={entity.id} className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedEntityIds.includes(entity.id)}
                              onCheckedChange={() => handleToggleEntity(entity.id)}
                            />
                            <span className="text-sm">{entity.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={selectedEntityIds.length === 0 || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>Generate Standard Convention for {selectedEntityIds.length} Entities</>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
