import { memo } from "react";
import { Handle, Position, NodeResizer } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Layers, Target, Key, ChevronDown, ChevronRight } from "lucide-react";

interface MetaField {
    id: string;
    name: string;
    type: string;
    is_primary_grain?: boolean;
}

interface ERDNodeData {
    label: string;
    type: "staging" | "glossary" | "model";
    metaFields?: MetaField[];
    loading?: boolean;
    // Lifted state
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export const ERDNode = memo(({ data, selected }: { data: ERDNodeData; selected?: boolean }) => {
    const getIcon = () => {
        switch (data.type) {
            case "staging": return <Database className="w-4 h-4" />;
            case "glossary": return <Layers className="w-4 h-4" />;
            case "model": return <Target className="w-4 h-4" />;
            default: return <Database className="w-4 h-4" />;
        }
    };

    const getColor = () => {
        switch (data.type) {
            case "staging": return "border-secondary bg-secondary/5";
            case "glossary": return "border-primary bg-primary/5";
            case "model": return "border-accent bg-accent/5";
            default: return "border-border";
        }
    };

    const getHeaderColor = () => {
        switch (data.type) {
            case "staging": return "bg-secondary text-secondary-foreground";
            case "glossary": return "bg-primary text-primary-foreground";
            case "model": return "bg-accent text-accent-foreground";
            default: return "bg-muted";
        }
    };

    return (
        <>
            <NodeResizer
                minWidth={200}
                isVisible={selected}
                lineClassName="border-primary"
                handleClassName="h-3 w-3 bg-primary border-2 border-background rounded"
            />

            <Card className={`w-full min-h-full shadow-md ${getColor()} overflow-hidden transition-all duration-300`}>
                <div className={`px-3 py-2 flex items-center gap-2 ${getHeaderColor()} relative`}>
                    {/* Handles for connections */}
                    <Handle
                        type="target"
                        position={Position.Left}
                        className="!bg-muted-foreground !border-background w-2.5 h-2.5"
                        style={{ left: -5, top: '50%' }}
                    />

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            data.onToggleCollapse?.();
                        }}
                        className="hover:bg-black/10 rounded p-0.5 transition-colors"
                        title={data.isCollapsed ? "Expand" : "Collapse"}
                    >
                        {data.isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {getIcon()}

                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate" title={data.label}>
                            {data.label}
                        </div>
                        <div className="text-[10px] opacity-80 font-mono tracking-wider uppercase">
                            {data.type}
                        </div>
                    </div>

                    <Handle
                        type="source"
                        position={Position.Right}
                        className="!bg-muted-foreground !border-background w-2.5 h-2.5"
                        style={{ right: -5, top: '50%' }}
                    />
                </div>

                {!data.isCollapsed && (
                    <CardContent className="p-0 text-xs animate-in slide-in-from-top-2 duration-200">
                        {data.loading ? (
                            <div className="p-4 text-center text-muted-foreground">Loading schema...</div>
                        ) : data.metaFields && data.metaFields.length > 0 ? (
                            <div className="divide-y divide-border/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {data.metaFields.map((field) => (
                                    <div key={field.id} className="px-3 py-1.5 flex items-center justify-between hover:bg-muted/30 group">
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            {field.is_primary_grain ? (
                                                <Key className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                                            ) : (
                                                <div className="w-3 h-3" />
                                            )}
                                            <span className="truncate group-hover:text-foreground/80">{field.name}</span>
                                        </div>
                                        <span className="text-muted-foreground font-mono text-[10px] ml-2 shrink-0">
                                            {field.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-muted-foreground italic">No fields defined</div>
                        )}
                    </CardContent>
                )}
            </Card>
        </>
    );
});

ERDNode.displayName = "ERDNode";
