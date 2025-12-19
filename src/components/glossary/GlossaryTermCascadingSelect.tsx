import { useState, useMemo } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import { ChevronRight, Database, Table as TableIcon, Columns } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GET_NAMESPACES } from "@/graphql/queries/namespace";
import { GET_SUBJECTAREAS } from "@/graphql/queries/subjectarea";
import { GET_ENTITIES, Entity } from "@/graphql/queries/entity";
import { GET_META_FOR_ENTITY, MetaField } from "@/graphql/queries/meta";
import type { Namespace } from "@/graphql/queries/namespace";
import type { SubjectArea } from "@/graphql/queries/subjectarea";

interface GlossaryTermCascadingSelectProps {
    value?: string;
    onSelect: (entity: Entity, meta: MetaField) => void;
    placeholder?: string;
    excludeEntityId?: string; // To prevent circular references within the same entity if needed, or exclude current entity
}

export function GlossaryTermCascadingSelect({
    value,
    onSelect,
    placeholder = "Select Related Term...",
    excludeEntityId,
}: GlossaryTermCascadingSelectProps) {
    const [open, setOpen] = useState(false);
    const [expandedEntityId, setExpandedEntityId] = useState<string | null>(null);

    const { data: namespacesData, loading: namespacesLoading } = useQuery(GET_NAMESPACES);
    const { data: subjectAreasData, loading: subjectAreasLoading } = useQuery(GET_SUBJECTAREAS);
    const { data: entitiesData, loading: entitiesLoading } = useQuery(GET_ENTITIES);

    // Local cache for meta fields to prevent re-fetching on hover
    const [metaCache, setMetaCache] = useState<Record<string, MetaField[]>>({});

    // Lazy query to fetch meta fields
    const [fetchMeta, { loading: metaLoading }] = useLazyQuery(GET_META_FOR_ENTITY, {
        onCompleted: (data) => {
            if (data?.meta_meta && expandedEntityId) {
                setMetaCache(prev => ({
                    ...prev,
                    [expandedEntityId]: data.meta_meta
                }));
            }
        },
        fetchPolicy: "cache-first" // Reliance on Apollo cache as well, but local state avoids flicker
    });

    // Filter for glossary type namespaces
    const glossaryNamespaces = useMemo(() => {
        if (!namespacesData?.meta_namespace) return [];
        return namespacesData.meta_namespace.filter(
            (ns: Namespace) => ns.type === "glossary"
        );
    }, [namespacesData]);

    // Group subject areas by namespace
    const subjectAreasByNamespace = useMemo(() => {
        if (!subjectAreasData?.meta_subjectarea) return {};
        const grouped: Record<string, SubjectArea[]> = {};
        subjectAreasData.meta_subjectarea.forEach((sa: SubjectArea) => {
            if (!sa.namespace?.id) return;
            const nsId = sa.namespace.id;
            if (!grouped[nsId]) {
                grouped[nsId] = [];
            }
            grouped[nsId].push(sa);
        });
        return grouped;
    }, [subjectAreasData]);

    // Group entities by subject area
    const entitiesBySubjectArea = useMemo(() => {
        if (!entitiesData?.meta_entity) return {};
        const grouped: Record<string, Entity[]> = {};
        entitiesData.meta_entity.forEach((entity: Entity) => {
            if (!entity.sa_id) return;

            // Exclude specific entity if requested
            if (excludeEntityId && entity.id === excludeEntityId) return;

            const saId = entity.sa_id;
            if (!grouped[saId]) {
                grouped[saId] = [];
            }
            // Only include entities from glossary type namespaces
            if (entity.subjectarea?.namespace?.type === "glossary") {
                grouped[saId].push(entity);
            }
        });
        return grouped;
    }, [entitiesData, excludeEntityId]);

    const handleEntityInteraction = (entityId: string) => {
        setExpandedEntityId(entityId);
        // Only fetch if not already in cache
        if (!metaCache[entityId]) {
            fetchMeta({ variables: { enid: entityId } });
        }
    };

    const handleSelect = (entity: Entity, meta: MetaField) => {
        onSelect(entity, meta);
        setOpen(false);
    };

    const loading = namespacesLoading || subjectAreasLoading || entitiesLoading;

    // Find selected item details for display
    // Note: This is a bit tricky since we don't have all meta loaded up front. 
    // We might just show the ID or need to fetch the specific meta details if value is provided.
    // For now, if value is provided, we assume the parent component handles the display of the selected item's name
    // OR we rely on the placeholder.
    // Actually, the requirement says "Select Business Glossary (Blueprint) ... cascading dropdown".
    // The trigger button usually shows the selected value.
    // Since `value` is likely the glossary ID (meta ID), we can't easily look up the hierarchy without searching everything.
    // I will just show the selected value ID if I can't find name, or let the parent pass the display name if needed.
    // But typically `value` is just the ID.
    // I'll leave the trigger simple for now.

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <span className="truncate">
                        {value ? (
                            // Ideally we should look up the name, but we might not have it loaded.
                            // We can try to find it in the currently loaded metaData if it matches, 
                            // otherwise just show the ID or "Selected Term"
                            // Better UX: Parent passes the full object or name, but props only have `value` (ID).
                            // I'll just show value for now, or "Term selected".
                            // Wait, the User Request mock code used `selectedGlossary` state.
                            value
                        ) : (
                            placeholder
                        )}
                    </span>
                    <ChevronRight className="ml-2 icon-sm shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px]" align="start">
                {loading ? (
                    <div className="p-2 space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ) : glossaryNamespaces.length === 0 ? (
                    <div className="p-2 text-muted-foreground text-center text-sm">
                        No glossary namespaces found
                    </div>
                ) : (
                    glossaryNamespaces.map((namespace: Namespace) => {
                        const subjectAreas = subjectAreasByNamespace[namespace.id] || [];

                        if (subjectAreas.length === 0) return null;

                        return (
                            <DropdownMenuSub key={namespace.id}>
                                <DropdownMenuSubTrigger className="gap-2">
                                    <Database className="w-4 h-4 shrink-0" />
                                    <span>{namespace.name}</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {subjectAreas.map((sa: SubjectArea) => {
                                        const entities = entitiesBySubjectArea[sa.id] || [];

                                        if (entities.length === 0) return null;

                                        return (
                                            <DropdownMenuSub key={sa.id}>
                                                <DropdownMenuSubTrigger className="gap-2">
                                                    <TableIcon className="w-4 h-4 shrink-0" />
                                                    <span>{sa.name}</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                    {entities.map((entity: Entity) => (
                                                        <DropdownMenuSub key={entity.id}>
                                                            <DropdownMenuSubTrigger
                                                                className="gap-2"
                                                                onMouseEnter={() => handleEntityInteraction(entity.id)}
                                                                // For touch devices, click might be needed
                                                                onClick={(e) => {
                                                                    e.preventDefault(); // Prevent closing
                                                                    handleEntityInteraction(entity.id);
                                                                }}
                                                            >
                                                                <Columns className="w-4 h-4 shrink-0" />
                                                                <span>{entity.name}</span>
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                                                                {metaLoading && expandedEntityId === entity.id && !metaCache[entity.id] ? (
                                                                    <div className="p-2">
                                                                        <Skeleton className="h-6 w-full mb-1" />
                                                                        <Skeleton className="h-6 w-full" />
                                                                    </div>
                                                                ) : (
                                                                    metaCache[entity.id] ? (
                                                                        metaCache[entity.id].length > 0 ? (
                                                                            metaCache[entity.id].map((meta: MetaField) => (
                                                                                <DropdownMenuItem
                                                                                    key={meta.id}
                                                                                    onClick={() => handleSelect(entity, meta)}
                                                                                    className="cursor-pointer"
                                                                                >
                                                                                    <span className="truncate">{meta.name}</span>
                                                                                    {meta.alias && <span className="ml-2 text-xs text-muted-foreground font-mono">({meta.alias})</span>}
                                                                                </DropdownMenuItem>
                                                                            ))
                                                                        ) : (
                                                                            <div className="p-2 text-xs text-muted-foreground text-center">No terms found</div>
                                                                        )
                                                                    ) : (
                                                                        // If data isn't loaded yet (or different entity loaded), show generic loader or nothing
                                                                        // But since we trigger on mouse enter, it should be loading or loaded.
                                                                        // Unless we moved mouse fast.
                                                                        <div className="p-2 text-xs text-muted-foreground text-center">Hover to load terms</div>
                                                                    )
                                                                )}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                    ))}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                        );
                                    })}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        );
                    })
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
