import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery } from "@apollo/client";
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    ConnectionLineType,
    NodeTypes,
    ReactFlowInstance,
    MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { GET_ENTITY_RELATIONS } from "@/graphql/queries/entityrelation";
import { GET_META_FOR_ENTITY, GetMetaForEntityResponse, MetaField } from "@/graphql/queries/meta";
import type {
    GetEntityRelationsResponse,
    GetEntityRelationsVariables,
} from "@/graphql/queries/entityrelation";
import { Loader2, Database, Layers, Target, Key, ChevronsDown, ChevronsRight, Maximize } from "lucide-react";
import { ERDNode } from "./ERDNode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface EntityERDGraphProps {
    entityId: string;
    entityName: string;
}

// 1. Define custom Node Data
interface ERDNodeData {
    label: string;
    type: "staging" | "glossary" | "model";
    metaFields?: MetaField[];
    loading?: boolean;
    entity?: any;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    manual?: boolean; // Track if node was manually moved
}

// Helper to calculate layout based on node content height
const recalculateLayout = (nodes: Node<ERDNodeData>[]): Node<ERDNodeData>[] => {
    const GAP = 40;
    const HEADER_HEIGHT = 60;
    const ROW_HEIGHT = 36;
    const MAX_CONTENT_HEIGHT = 300;

    // Helper to estimate node height
    const getEstimatedHeight = (node: Node<ERDNodeData>) => {
        let h = HEADER_HEIGHT;
        if (!node.data.isCollapsed) {
            const rows = node.data.metaFields?.length || 0;
            const contentHeight = Math.min(rows * ROW_HEIGHT, MAX_CONTENT_HEIGHT);
            h += contentHeight + 20;
        }
        return h;
    };

    // 1. Separate Manual vs Auto nodes
    const manualNodes = nodes.filter(n => n.data.manual).map(n => {
        // Update height for manual nodes too
        return { ...n, height: getEstimatedHeight(n), width: 256 };
    });
    const autoNodes = nodes.filter(n => !n.data.manual);

    // 2. Layout Auto Nodes in Columns (Standard)
    const stagingNodes: Node<ERDNodeData>[] = [];
    const glossaryNodes: Node<ERDNodeData>[] = [];
    const modelNodes: Node<ERDNodeData>[] = [];

    autoNodes.forEach(node => {
        if (node.data.type === "staging") stagingNodes.push(node);
        else if (node.data.type === "glossary") glossaryNodes.push(node);
        else if (node.data.type === "model") modelNodes.push(node);
    });

    // Sort by Y to keep relative order
    const sorter = (a: Node, b: Node) => a.position.y - b.position.y;
    stagingNodes.sort(sorter);
    glossaryNodes.sort(sorter);
    modelNodes.sort(sorter);

    const layoutColumn = (columnNodes: Node<ERDNodeData>[], startX: number) => {
        let currentY = 50;
        columnNodes.forEach(node => {
            node.position = { x: startX, y: currentY };
            const estimatedHeight = getEstimatedHeight(node);
            node.height = estimatedHeight;
            node.width = 256;

            currentY += estimatedHeight + GAP;
        });
    };

    layoutColumn(stagingNodes, 50);
    layoutColumn(glossaryNodes, 400);
    layoutColumn(modelNodes, 850);

    // 3. Combine All
    let allNodes = [...manualNodes, ...stagingNodes, ...glossaryNodes, ...modelNodes];

    // 4. Collision Pass - Prevent Overlaps
    // Simple iterative solver: Check every pair, if overlap, move lower one down.
    // Repeat a few times to propagate changes.
    for (let i = 0; i < 3; i++) {
        allNodes.sort((a, b) => a.position.y - b.position.y); // sort by Y

        for (let j = 0; j < allNodes.length; j++) {
            const nodeA = allNodes[j];
            const nodeABottom = nodeA.position.y + (nodeA.height || 100);

            for (let k = j + 1; k < allNodes.length; k++) {
                const nodeB = allNodes[k];

                // Check X overlap (columns)
                const xOverlap = Math.abs(nodeA.position.x - nodeB.position.x) < 280; // 256 width + gap
                if (!xOverlap) continue;

                // Check Y overlap
                if (nodeB.position.y < nodeABottom + GAP) {
                    // Collision detected! Push Node B down
                    nodeB.position.y = nodeABottom + GAP;
                }
            }
        }
    }

    return allNodes;
};


export const EntityERDGraph = ({ entityId, entityName }: EntityERDGraphProps) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNodeData, setSelectedNodeData] = useState<ERDNodeData | null>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

    const nodeTypes = useMemo<NodeTypes>(() => ({ erd: ERDNode }), []);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNodeData(node.data as ERDNodeData);
    }, []);

    const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
        setNodes((nds) => {
            const updated = nds.map((n) => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        position: node.position, // Keep drag position
                        data: { ...n.data, manual: true } // Mark as manual
                    };
                }
                return n;
            });

            // PERSISTENCE: Save new position
            const savedPositionsKey = `METAHUB_ERD_POS_${entityId}`;
            const currentSaved = JSON.parse(localStorage.getItem(savedPositionsKey) || "{}");
            currentSaved[node.id] = node.position;
            localStorage.setItem(savedPositionsKey, JSON.stringify(currentSaved));

            // Re-run layout to fix potential overlaps created by drag
            return recalculateLayout(updated);
        });
    }, [setNodes, entityId]);

    const onPaneClick = useCallback(() => {
        setSelectedNodeData(null);
    }, []);

    // Helper to trigger fit view with animation
    const handleFitView = useCallback(() => {
        if (reactFlowInstance) {
            setTimeout(() => {
                reactFlowInstance.fitView({ duration: 300, padding: 0.2 });
            }, 50); // Small delay to allow state updates/DOM reflow
        }
    }, [reactFlowInstance]);

    // Trigger fit view when side panel opens/closes
    useEffect(() => {
        handleFitView();
    }, [selectedNodeData, handleFitView]);

    const toggleNodeCollapse = useCallback((nodeId: string) => {
        setNodes((nds) => {
            const updatedNodes = nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            isCollapsed: !node.data.isCollapsed
                        }
                    };
                }
                return node;
            });
            return recalculateLayout(updatedNodes);
        });
        // Trigger fit view after layout update
        handleFitView();
    }, [setNodes, handleFitView]);

    const expandAll = useCallback(() => {
        setNodes((nds) => {
            const updatedNodes = nds.map(n => ({ ...n, data: { ...n.data, isCollapsed: false } }));
            return recalculateLayout(updatedNodes);
        });
        handleFitView();
    }, [setNodes, handleFitView]);

    const collapseAll = useCallback(() => {
        setNodes((nds) => {
            const updatedNodes = nds.map(n => ({ ...n, data: { ...n.data, isCollapsed: true } }));
            return recalculateLayout(updatedNodes);
        });
        handleFitView();
    }, [setNodes, handleFitView]);

    // 1. Fetch Relationships
    const { data: relationData, loading: relationLoading } = useQuery<GetEntityRelationsResponse, GetEntityRelationsVariables>(
        GET_ENTITY_RELATIONS,
        {
            variables: { targetEnId: entityId },
            fetchPolicy: "network-only",
        }
    );

    // 2. Fetch Glossary Meta directly
    const { data: glossaryMetaData, loading: glossaryMetaLoading } = useQuery<GetMetaForEntityResponse>(
        GET_META_FOR_ENTITY,
        {
            variables: { enid: entityId },
            fetchPolicy: "network-only",
            skip: !entityId
        }
    );

    useEffect(() => {
        if (!relationData?.entity_relation) return;

        const nodeMap = new Map<string, boolean>();

        // PERSISTENCE: Check local storage
        const savedPositionsKey = `METAHUB_ERD_POS_${entityId}`;
        const savedPositions = JSON.parse(localStorage.getItem(savedPositionsKey) || "{}");

        // Helper to generate initial nodes
        const generateNodes = () => {
            const newNodes: Node<ERDNodeData>[] = [];
            const newEdges: Edge[] = [];

            // Helper to create node with persistence check
            const createNode = (id: string, type: "glossary" | "staging" | "model", position: { x: number, y: number }, data: any) => {
                const savedPos = savedPositions[id];
                return {
                    id,
                    type: "erd",
                    position: savedPos || position,
                    style: { width: 256 },
                    data: {
                        ...data,
                        manual: !!savedPos // If saved pos exists, mark as manual
                    }
                };
            };

            // --- Glossary Node (Center) ---
            const glossaryNodeId = `glossary-${entityId}`;
            const glossaryEntityData = { id: entityId, name: entityName, type: "glossary", description: "Glossary Term" };
            const glossaryMetas = glossaryMetaData?.meta_meta;

            newNodes.push(createNode(
                glossaryNodeId,
                "glossary",
                { x: 400, y: 300 },
                {
                    label: entityName,
                    type: "glossary",
                    metaFields: glossaryMetas,
                    loading: glossaryMetaLoading,
                    entity: glossaryEntityData,
                    isCollapsed: true,
                    onToggleCollapse: () => toggleNodeCollapse(glossaryNodeId)
                }
            ));
            nodeMap.set(glossaryNodeId, true);

            // --- Related Nodes ---
            relationData.entity_relation.forEach((relation) => {
                if (relation.target_en_id !== entityId) return;
                relation.related_entity.forEach((entity) => {

                    const embeddedMetas = (entity.metas && entity.metas.length > 0) ? (entity.metas as MetaField[]) : undefined;

                    if (relation.relation_type === "GLOSSARY-SOURCE") {
                        const sourceId = `staging-${entity.id}`;
                        if (!nodeMap.has(sourceId)) {
                            newNodes.push(createNode(
                                sourceId,
                                "staging",
                                { x: 50, y: 50 },
                                {
                                    label: entity.name,
                                    type: "staging",
                                    metaFields: embeddedMetas,
                                    loading: false,
                                    entity: entity,
                                    isCollapsed: true,
                                    onToggleCollapse: () => toggleNodeCollapse(sourceId)
                                }
                            ));
                            nodeMap.set(sourceId, true);
                        }
                        newEdges.push({
                            id: `e-${sourceId}-${glossaryNodeId}`,
                            source: sourceId,
                            target: glossaryNodeId,
                            type: ConnectionLineType.SmoothStep,
                            animated: true,
                            style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--primary))" },
                        });
                    } else if (relation.relation_type === "GLOSSARY-MODEL") {
                        const modelId = `model-${entity.id}`;
                        if (!nodeMap.has(modelId)) {
                            newNodes.push(createNode(
                                modelId,
                                "model",
                                { x: 850, y: 50 },
                                {
                                    label: entity.name,
                                    type: "model",
                                    metaFields: embeddedMetas,
                                    loading: false,
                                    entity: entity,
                                    isCollapsed: true,
                                    onToggleCollapse: () => toggleNodeCollapse(modelId)
                                }
                            ));
                            nodeMap.set(modelId, true);
                        }
                        newEdges.push({
                            id: `e-${glossaryNodeId}-${modelId}`,
                            source: glossaryNodeId,
                            target: modelId,
                            type: ConnectionLineType.SmoothStep,
                            animated: true,
                            style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--primary))" },
                        });
                    }
                });
            });
            return { nodes: newNodes, edges: newEdges };
        }

        setNodes((prevNodes) => {
            const { nodes: freshNodes } = generateNodes();

            if (prevNodes.length === 0) {
                // Initial load fit view
                setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 100);
                return recalculateLayout(freshNodes);
            }

            // Merge logic + Re-layout
            const mergedNodes = freshNodes.map(fresh => {
                const prev = prevNodes.find(p => p.id === fresh.id);
                if (prev) {
                    return {
                        ...fresh,
                        // Keep width and collapse state
                        width: prev.width,
                        height: prev.height,
                        style: prev.style,
                        data: {
                            ...fresh.data,
                            isCollapsed: prev.data.isCollapsed,
                            onToggleCollapse: () => toggleNodeCollapse(fresh.id)
                        }
                    };
                }
                return fresh;
            });

            return recalculateLayout(mergedNodes);
        });

        setEdges((prev) => {
            const { edges: freshEdges } = generateNodes();
            return freshEdges;
        });

    }, [relationData, entityId, entityName, glossaryMetaData, glossaryMetaLoading, reactFlowInstance]); // Added instance dep


    if (relationLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="h-full flex gap-4 relative group">
            <div className="flex-1 border rounded-lg overflow-hidden bg-muted/5 relative min-h-[500px]">
                {/* Global Controls */}
                <div className="absolute top-4 right-4 z-10 flex gap-2 bg-background/80 backdrop-blur p-1 rounded-md border shadow-sm">
                    <Button variant="ghost" size="sm" onClick={expandAll} className="h-8 px-2 text-xs" title="Expand All">
                        <ChevronsDown className="w-3 h-3 mr-1" />
                        Expand
                    </Button>
                    <Button variant="ghost" size="sm" onClick={collapseAll} className="h-8 px-2 text-xs" title="Collapse All">
                        <ChevronsRight className="w-3 h-3 mr-1" />
                        Collapse
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleFitView} className="h-8 px-2 text-xs" title="Fit to Screen">
                        <Maximize className="w-3 h-3 mr-1" />
                        Fit
                    </Button>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    onNodeDragStop={onNodeDragStop}
                    onPaneClick={onPaneClick}
                    onInit={setReactFlowInstance} // Capture instance
                    connectionLineType={ConnectionLineType.SmoothStep}
                    fitView
                >
                    <Background gap={16} size={1} />
                    <Controls />
                    <MiniMap
                        nodeColor={(node) => {
                            return node.type === 'erd' ? '#e2e8f0' : '#f1f5f9';
                        }}
                        className="bg-card border"
                    />
                </ReactFlow>
            </div>

            {selectedNodeData && (
                <Card className="w-96 overflow-hidden h-full flex flex-col border-l shadow-xl animate-in slide-in-from-right duration-300">
                    <CardHeader className="pb-3 flex-none bg-muted/30">
                        <div className="flex-start gap-sm">
                            {selectedNodeData.type === "staging" && <Database className="icon-md text-secondary-foreground" />}
                            {selectedNodeData.type === "glossary" && <Layers className="icon-md text-primary" />}
                            {selectedNodeData.type === "model" && <Target className="icon-md text-accent-foreground" />}
                            <CardTitle className="text-lg truncate" title={selectedNodeData.label}>{selectedNodeData.label}</CardTitle>
                        </div>
                        <Badge variant={selectedNodeData.type === "glossary" ? "default" : "secondary"} className="w-fit mt-2 uppercase">
                            {selectedNodeData.type}
                        </Badge>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                        <ScrollArea className="flex-1 p-6">
                            <div className="stack-md">
                                <div>
                                    <p className="text-sm font-medium mb-1">Description</p>
                                    <p className="text-muted-foreground text-sm">
                                        {selectedNodeData.entity?.description || "No description available"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-3 rounded-lg">
                                    <div>
                                        <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Type</p>
                                        <p className="font-medium">{selectedNodeData.entity?.type || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Subtype</p>
                                        <p className="">{selectedNodeData.entity?.subtype || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Grain</p>
                                        <p className="">{selectedNodeData.entity?.primary_grain || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Runtime</p>
                                        <p className="">{selectedNodeData.entity?.runtime || "N/A"}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium mb-3">Attributes ({selectedNodeData.metaFields?.length || 0})</p>
                                    {selectedNodeData.loading ? (
                                        <div className="flex-center py-4">
                                            <Loader2 className="icon-lg animate-spin text-muted-foreground" />
                                        </div>
                                    ) : selectedNodeData.metaFields && selectedNodeData.metaFields.length > 0 ? (
                                        <div className="border rounded-md overflow-hidden">
                                            <Table>
                                                <TableHeader className="bg-muted/50">
                                                    <TableRow>
                                                        <TableHead className="h-8 py-2 px-3 text-xs">Name</TableHead>
                                                        <TableHead className="h-8 py-2 px-3 text-xs w-[80px]">Type</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedNodeData.metaFields.map((meta: MetaField) => (
                                                        <TableRow key={meta.id} className="hover:bg-muted/30">
                                                            <TableCell className="py-2 px-3 font-medium text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    {meta.is_primary_grain && <Key className="w-3 h-3 text-yellow-500" />}
                                                                    {meta.name}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-2 px-3 text-xs font-mono text-muted-foreground">{meta.type}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm italic">No attributes found</p>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
