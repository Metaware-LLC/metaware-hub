import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GET_ENTITIES, type Entity } from "@/graphql/queries/entity";

interface SourceAssociationSelectProps {
  glossaryEntity: Entity;
  value?: string;
  onSelect: (entity: Entity) => void;
}

export function SourceAssociationSelect({
  glossaryEntity,
  value,
  onSelect,
}: SourceAssociationSelectProps) {
  const { data, loading } = useQuery(GET_ENTITIES);

  const sourceAssociations = useMemo(() => {
    if (!data?.meta_entity || !glossaryEntity) return [];

    // Get the primary grain from the glossary entity
    const glossaryGrain = glossaryEntity.primary_grain;
    if (!glossaryGrain) return [];

    // Find staging entities that match this grain
    return data.meta_entity.filter(
      (entity: Entity) =>
        entity.subjectarea.namespace.type === "staging" &&
        entity.primary_grain === glossaryGrain
    );
  }, [data, glossaryEntity]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading associations...
      </div>
    );
  }

  if (sourceAssociations.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No source associations found for this entity
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={(val) => {
        const selected = sourceAssociations.find((e) => e.id === val);
        if (selected) onSelect(selected);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Association" />
      </SelectTrigger>
      <SelectContent>
        {sourceAssociations.map((entity) => (
          <SelectItem key={entity.id} value={entity.id}>
            <span className="font-medium">
              {entity.subjectarea.namespace.name}
            </span>
            <span className="text-muted-foreground mx-1.5">/</span>
            <span className="font-medium">{entity.subjectarea.name}</span>
            <span className="text-muted-foreground mx-1.5">/</span>
            <span>{entity.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
