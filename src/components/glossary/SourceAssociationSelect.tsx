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

    const glossaryEntityName = glossaryEntity.name;
    if (!glossaryEntityName) return [];

    return data.meta_entity.filter(
      (entity: Entity) =>
        entity.subjectarea?.namespace?.type === "staging" &&
        entity.primary_grain === glossaryEntityName
    );
  }, [data, glossaryEntity]);

  if (loading) {
    return (
      <div className="flex-start gap-sm text-sm text-muted-foreground">
        <Loader2 className="icon-sm animate-spin" />
        Loading associations...
      </div>
    );
  }

  if (sourceAssociations.length === 0) {
    return (
      <div className="text-muted">
        No source associations found for this entity
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Source Entity Association</label>
      <Select
        value={value}
        onValueChange={(val) => {
          const selected = sourceAssociations.find((e) => e.id === val);
          if (selected) onSelect(selected);
        }}
      >
        <SelectTrigger className="w-full rounded-xl">
          <SelectValue placeholder="Select a source entity to map from..." />
        </SelectTrigger>
        <SelectContent>
          {sourceAssociations.map((entity) => (
            <SelectItem key={entity.id} value={entity.id}>
              <span className="font-medium">
                {entity.subjectarea?.namespace?.name}
              </span>
              <span className="text-muted-foreground mx-1.5">/</span>
              <span className="font-medium">{entity.subjectarea?.name}</span>
              <span className="text-muted-foreground mx-1.5">/</span>
              <span>{entity.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}