import React, { useCallback, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    MarkerType,
    Panel,
    MiniMap,
    ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ZoomIn, Maximize2, GitBranch, Database, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import { MetaField } from "@/graphql/queries/meta";
import { GlossaryRelation } from "@/graphql/queries/glossaryrelation";
import { Entity } from "@/graphql/queries/entity";

interface GlossaryModelGraphProps {
    glossaryEntity: Entity;
    metaFields: MetaField[];
    relations: GlossaryRelation[];
    onBack: () => void;
}

interface GraphTerm {
    id: string;
    name: string;
    domain: string;
    namespace?: string;
    attributes: string[];
    properties?: Record<string, any>;
}

import { Handle, Position } from 'reactflow';

const GlossaryNode = ({ data }: { data: any }) => {
    return (
        <div style={data.style} className="relative group">
            {/* Handles on all 4 sides */}
            {/* Source Handles */}
            <Handle type="source" position={Position.Top} id="top" className="!w-2 !h-2 !bg-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Left} id="left" className="!w-2 !h-2 !bg-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-2 !bg-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2 !h-2 !bg-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Target Handles - for incoming connections */}
            <Handle type="target" position={Position.Top} id="top-target" className="!w-2 !h-2 !bg-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="target" position={Position.Left} id="left-target" className="!w-2 !h-2 !bg-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="target" position={Position.Right} id="right-target" className="!w-2 !h-2 !bg-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-2 !h-2 !bg-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="px-3 py-2 text-left">
                <div className="text-[10px] text-muted-foreground/80 mb-0.5 truncate flex items-center gap-1">
                    <span>{data.namespace || "Global"}</span>
                    <span>/</span>
                    <span>{data.domain}</span>
                </div>
                <div className="font-bold text-sm mb-2 truncate text-foreground/90" title={data.name}>{data.name}</div>
                {data.attributes && data.attributes.length > 0 && (
                    <div className="border-t pt-2 mt-1 space-y-1">
                        {data.attributes.slice(0, 3).map((attr: string, idx: number) => (
                            <div key={idx} className="text-[10px] text-muted-foreground truncate" title={attr}>{attr}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Layout Helper for Glossary Graph
const recalculateGlossaryLayout = (nodes: Node[], domains: string[]): Node[] => {
    const GAP = 40;
    const HEADER_HEIGHT = 80; // Estimated
    const ROW_HEIGHT = 20; // Smaller font for attributes

    // 1. Separate Manual vs Auto
    const manualNodes = nodes.filter(n => n.data.manual);
    const autoNodes = nodes.filter(n => !n.data.manual);

    // 2. Group by Domain
    const domainGroups: { [key: string]: Node[] } = {};
    domains.forEach(d => domainGroups[d] = []);

    autoNodes.forEach(node => {
        const d = node.data.domain;
        if (domainGroups[d]) domainGroups[d].push(node);
        else {
            // Fallback for unknown domains
            if (!domainGroups["Other"]) domainGroups["Other"] = [];
            domainGroups["Other"].push(node);
        }
    });

    // 3. Layout Columns
    Object.keys(domainGroups).forEach((domain, idx) => {
        const group = domainGroups[domain];
        // Sort by Y to maintain relative order
        group.sort((a, b) => a.position.y - b.position.y);

        const startX = 100 + (idx * 400);
        let currentY = 100;

        group.forEach(node => {
            node.position = { x: startX, y: currentY };

            // Estimate Height
            let h = HEADER_HEIGHT;
            if (node.data.attributes) {
                h += Math.min(node.data.attributes.length, 3) * ROW_HEIGHT + 10;
            }
            node.height = h;
            node.width = 220;

            currentY += h + GAP;
        });
    });

    // 4. Combine & Collision Pass
    let allNodes = [...manualNodes, ...Object.values(domainGroups).flat()];

    for (let i = 0; i < 3; i++) {
        allNodes.sort((a, b) => a.position.y - b.position.y);

        for (let j = 0; j < allNodes.length; j++) {
            const nodeA = allNodes[j];
            const nodeABottom = nodeA.position.y + (nodeA.height || 100);

            for (let k = j + 1; k < allNodes.length; k++) {
                const nodeB = allNodes[k];

                // Check X Overlap (Column width approx 250)
                const xOverlap = Math.abs(nodeA.position.x - nodeB.position.x) < 250;
                if (!xOverlap) continue;

                // Check Y Overlap
                if (nodeB.position.y < nodeABottom + GAP) {
                    nodeB.position.y = nodeABottom + GAP;
                }
            }
        }
    }

    return allNodes;
};

export const GlossaryModelGraph = ({ glossaryEntity, metaFields, relations, onBack }: GlossaryModelGraphProps) => {

    const getEdgeColor = (type: string) => {
        switch (type) {
            case "EXACT": return "#10b981"; // green
            case "RELATED": return "#3b82f6"; // blue
            case "SUBSET": return "#a855f7"; // purple
            case "LINK": return "#f97316"; // orange
            default: return "#64748b"; // gray
        }
    };

    // 1. Process Data into Nodes and Relations
    const { initialNodes, initialEdges, glossaryData, domains } = useMemo(() => {
        const termMap = new Map<string, GraphTerm>();

        // Create a set of all term IDs involved in relations
        const involvedTermIds = new Set<string>();
        relations.forEach(rel => {
            involvedTermIds.add(rel.drivingGlossaryId);
            involvedTermIds.add(rel.relatedGlossaryId);
        });

        // Add local terms ONLY if they are involved in a relation
        const localDomain = glossaryEntity.subjectarea?.name || "Unknown";
        metaFields.forEach(meta => {
            if (involvedTermIds.has(meta.id)) {
                const attrs = [];
                if (meta.type) attrs.push(`type: ${meta.type}`);
                if (meta.nullable !== undefined) attrs.push(`nullable: ${meta.nullable}`);
                if (meta.description) attrs.push(meta.description.substring(0, 30) + (meta.description.length > 30 ? "..." : ""));

                termMap.set(meta.id, {
                    id: meta.id,
                    name: meta.alias || meta.name,
                    domain: localDomain,
                    namespace: glossaryEntity.subjectarea?.namespace?.name,
                    attributes: attrs,
                    properties: (meta as any).map || {}
                });
            }
        });

        // Add related terms
        relations.forEach(rel => {
            // Ensure driving term (local) is in map - it should be if metaFields is complete, but purely for safety:
            if (!termMap.has(rel.drivingGlossaryId)) {
                // In case local meta list is partial? 
                // We'll skip or add partial. Let's assume metaFields covers it.
            }

            // Add related term (remote)
            if (rel.related_meta && rel.related_entity && !termMap.has(rel.relatedGlossaryId)) {
                const attrs = [];
                if (rel.related_meta.description) attrs.push(rel.related_meta.description.substring(0, 30));

                termMap.set(rel.relatedGlossaryId, {
                    id: rel.relatedGlossaryId,
                    name: rel.related_meta.name,
                    domain: rel.related_entity.subjectarea?.name || "External",
                    namespace: rel.related_entity.subjectarea?.namespace?.name,
                    attributes: attrs,
                    properties: (rel.related_meta as any).map || {}
                });
            }
        });

        const uniqueDomains = Array.from(new Set(Array.from(termMap.values()).map(t => t.domain)));

        // Position logic
        const domainPositions: { [key: string]: { x: number; y: number; count: number } } = {};
        uniqueDomains.forEach((d, idx) => {
            domainPositions[d] = { x: 100 + (idx * 400), y: 100, count: 0 };
        });

        // PERSISTENCE: Check local storage
        const savedPositionsKey = `METAHUB_GLOSSARY_POS_${glossaryEntity.id}`;
        const savedPositions = JSON.parse(localStorage.getItem(savedPositionsKey) || "{}");

        const rawNodes: Node[] = Array.from(termMap.values()).map(term => {
            const savedPos = savedPositions[term.id];
            return {
                id: term.id,
                type: 'glossaryNode',
                position: savedPos || { x: 0, y: 0 }, // Use saved or placeholder
                data: {
                    name: term.name,
                    domain: term.domain,
                    namespace: term.namespace,
                    attributes: term.attributes,
                    manual: !!savedPos, // Mark as manual if loaded from storage
                    style: {
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        width: 220,
                        fontSize: '12px',
                        padding: 0,
                        textAlign: 'left',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    }
                },
            };
        });

        // Initial Layout Run
        const generatedNodes = recalculateGlossaryLayout(rawNodes, uniqueDomains);


        const generatedEdges: Edge[] = relations.map((rel, idx) => {
            let sourceHandle = "right";
            let targetHandle = "left-target";

            switch (rel.relationTypeCode) {
                case "EXACT":
                    sourceHandle = "right";
                    targetHandle = "left-target";
                    break;
                case "RELATED":
                    sourceHandle = "top";
                    targetHandle = "bottom-target";
                    break;
                case "SUBSET":
                    sourceHandle = "bottom";
                    targetHandle = "top-target";
                    break;
                case "LINK":
                    sourceHandle = "left";
                    targetHandle = "right-target";
                    break;
                default:
                    sourceHandle = "right";
                    targetHandle = "left-target";
            }

            return {
                id: `e-${rel.id}`,
                source: rel.drivingGlossaryId,
                target: rel.relatedGlossaryId,
                sourceHandle: sourceHandle,
                targetHandle: targetHandle,
                label: rel.relationTypeCode,
                type: 'default',
                animated: rel.relationTypeCode === "LINK",
                style: { stroke: getEdgeColor(rel.relationTypeCode), strokeWidth: 2 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: getEdgeColor(rel.relationTypeCode)
                },
                labelStyle: {
                    fill: getEdgeColor(rel.relationTypeCode),
                    fontWeight: 600,
                    fontSize: 10
                },
                labelBgStyle: {
                    fill: 'hsl(var(--background))',
                    fillOpacity: 0.8
                }
            };
        });

        return {
            initialNodes: generatedNodes,
            initialEdges: generatedEdges,
            glossaryData: Array.from(termMap.values()),
            domains: uniqueDomains
        };
    }, [glossaryEntity, metaFields, relations]);


    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

    // Update nodes if props change
    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);


    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
        setNodes((nds) => {
            const updated = nds.map((n) => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        position: node.position,
                        data: { ...n.data, manual: true }
                    };
                }
                return n;
            });

            // PERSISTENCE: Save new position
            const savedPositionsKey = `METAHUB_GLOSSARY_POS_${glossaryEntity.id}`;
            const currentSaved = JSON.parse(localStorage.getItem(savedPositionsKey) || "{}");
            currentSaved[node.id] = node.position;
            localStorage.setItem(savedPositionsKey, JSON.stringify(currentSaved));

            return recalculateGlossaryLayout(updated, domains);
        });
    }, [setNodes, domains, glossaryEntity.id]);

    const handleExport = () => {
        toast.success("Model exported successfully!");
    };

    const relationTypes = [
        { type: "EXACT", color: "#10b981", label: "Exact Match" },
        { type: "RELATED", color: "#3b82f6", label: "Related Term" },
        { type: "SUBSET", color: "#a855f7", label: "Subset" },
        { type: "LINK", color: "#f97316", label: "Link/Foreign Key" }
    ];

    // Assign colors to domains for Minimap
    const domainColors = ["#3b82f6", "#10b981", "#f97316", "#a855f7", "#ef4444", "#eab308"];

    const nodeTypes = useMemo(() => ({ glossaryNode: GlossaryNode }), []);

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="flex flex-1 min-h-0">
                {/* Main Canvas */}
                <div className="flex-1 border-r relative bg-muted/5">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onNodeDragStop={onNodeDragStop}
                        onNodeDoubleClick={(e, node) => {
                            if (rfInstance) {
                                rfInstance.fitView({ nodes: [node], duration: 400, padding: 0.5 });
                            }
                        }}
                        nodesConnectable={false}
                        fitView
                        attributionPosition="bottom-left"
                        onInit={setRfInstance}
                    >
                        <Background gap={16} size={1} />
                        <Controls />
                        <MiniMap
                            nodeColor={(node) => {
                                const term = glossaryData.find(t => t.id === node.id);
                                const domainIdx = domains.indexOf(term?.domain || "");
                                return domainColors[domainIdx % domainColors.length] || "#64748b";
                            }}
                            className="bg-card border"
                        />

                        {/* X Close Button Panel */}
                        <Panel position="top-left">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onBack}
                                className="rounded-full bg-card/90 backdrop-blur border hover:bg-card shadow-lg"
                                title="Close graph"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </Panel>

                        {/* Legend Panel */}
                        <Panel position="top-right" className="bg-card/80 backdrop-blur border rounded-lg p-3 shadow-lg max-w-[200px]">
                            <h3 className="font-semibold text-xs mb-2 flex items-center gap-2">
                                <GitBranch className="w-3 h-3" />
                                Relation Types
                            </h3>
                            <div className="space-y-1.5">
                                {relationTypes.map(rt => (
                                    <div key={rt.type} className="flex items-center gap-2 text-[10px]">
                                        <div
                                            className="w-3 h-0.5 rounded"
                                            style={{ backgroundColor: rt.color }}
                                        />
                                        <span className="text-muted-foreground">{rt.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 pt-2 border-t space-y-1.5">
                                <h4 className="font-semibold text-xs">Domains</h4>
                                {domains.map((d, idx) => (
                                    <div key={d} className="flex items-center gap-2 text-[10px]">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: domainColors[idx % domainColors.length] }} />
                                        <span className="text-muted-foreground truncate">{d}</span>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </ReactFlow>
                </div>

                {/* Right Sidebar - Details */}
                {selectedNode && (
                    <div className="w-80 bg-card p-6 overflow-y-auto border-l animate-in slide-in-from-right duration-200">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold mb-1">
                                    {glossaryData.find(g => g.id === selectedNode.id)?.name}
                                </h3>
                                <p className="text-xs text-muted-foreground font-mono mb-2">
                                    {selectedNode.id}
                                </p>
                                <Badge variant="secondary">{glossaryData.find(g => g.id === selectedNode.id)?.domain}</Badge>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Attributes</h4>
                                <div className="space-y-1">
                                    {(() => {
                                        const term = glossaryData.find(g => g.id === selectedNode.id);
                                        if (!term?.properties) return <p className="text-xs text-muted-foreground italic">No properties available</p>;

                                        return Object.entries(term.properties).map(([key, value], idx) => (
                                            <div key={idx} className="text-xs p-2 bg-muted/50 rounded border flex flex-col gap-0.5">
                                                <span className="font-semibold text-muted-foreground uppercase text-[10px]">{key}</span>
                                                <span className="truncate" title={String(value)}>{String(value)}</span>
                                            </div>
                                        ));
                                    })()}
                                    {glossaryData.find(g => g.id === selectedNode.id)?.attributes.length === 0 && (
                                        <p className="text-xs text-muted-foreground italic">No attributes available</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Relations</h4>
                                <div className="space-y-2">
                                    {relations
                                        .filter(r => r.drivingGlossaryId === selectedNode.id || r.relatedGlossaryId === selectedNode.id)
                                        .map((rel, idx) => {
                                            const isSource = rel.drivingGlossaryId === selectedNode.id;
                                            const otherId = isSource ? rel.relatedGlossaryId : rel.drivingGlossaryId;
                                            const otherTerm = glossaryData.find(g => g.id === otherId);

                                            return (
                                                <Card key={idx} className="p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge
                                                            className="text-[10px] px-1 py-0 h-5"
                                                            style={{
                                                                backgroundColor: `${getEdgeColor(rel.relationTypeCode)}15`,
                                                                color: getEdgeColor(rel.relationTypeCode),
                                                                border: `1px solid ${getEdgeColor(rel.relationTypeCode)}40`
                                                            }}
                                                            variant="outline"
                                                        >
                                                            {rel.relationTypeCode}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm font-medium">
                                                        {isSource ? "→" : "←"} {otherTerm?.name || "Unknown"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate" title={otherId}>
                                                        {otherId}
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    {relations.filter(r => r.drivingGlossaryId === selectedNode.id || r.relatedGlossaryId === selectedNode.id).length === 0 && (
                                        <p className="text-xs text-muted-foreground italic">No relations found</p>
                                    )}
                                </div>
                            </div>


                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
