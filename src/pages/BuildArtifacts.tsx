import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Database,
    FileCode,
    Target,
    Layers,
    ArrowRight,
    CheckCircle2,
    Copy,
    Download,
    Sparkles,
    BookOpen,
    ArrowUpRight,
    Save,
    RotateCcw,
    Settings,
    ChevronRight,
    ChevronDown,
    Zap,
    Code2,
    PanelRightOpen,
    X
} from "lucide-react";
import { toast } from "sonner";

interface PublishColumn {
    target: string;
    glossary: string;
    description: string;
    selected: boolean;
    ruleExpression: string;
}

interface RuleRequest {
    name: string;
    alias: string | null;
    description: string;
    rule_expression: string;
    meta: string;
}

const BuildArtifacts = () => {
    const navigate = useNavigate();

    // Publish Config Request
    const [glossaryEntity, setGlossaryEntity] = useState("avalara.sales.transaction");
    const [targetNamespace, setTargetNamespace] = useState("avalara_publish");
    const [targetSchema, setTargetSchema] = useState("party_publish");
    const [targetEntity, setTargetEntity] = useState("customer_publish");
    const [configStatus, setConfigStatus] = useState("draft");
    const [configVersion, setConfigVersion] = useState(1);

    // Ruleset Request
    const [rulesetName, setRulesetName] = useState("customer_publish_ruleset");
    const [rulesetDescription, setRulesetDescription] = useState("Column selection and transforms for customer publish");

    // UI State
    const [buildOutput, setBuildOutput] = useState<string | null>(null);
    const [publishConfigId, setPublishConfigId] = useState<string | null>(null);
    const [targetPanelOpen, setTargetPanelOpen] = useState(false);
    const [rulesetExpanded, setRulesetExpanded] = useState(false);

    const [columns, setColumns] = useState<PublishColumn[]>([
        { target: "first_name", glossary: "first_name", description: "First name of the customer", selected: true, ruleExpression: "first_name" },
        { target: "last_name", glossary: "last_name", description: "Last name of the customer", selected: true, ruleExpression: "last_name" },
        { target: "email", glossary: "email", description: "Email address", selected: true, ruleExpression: "email" },
        { target: "customer_id", glossary: "customer_id", description: "Unique identifier", selected: true, ruleExpression: "customer_id" },
        { target: "phone_number", glossary: "phone_number", description: "Contact phone number", selected: true, ruleExpression: "phone_number" },
        { target: "gender", glossary: "gender", description: "Gender of the customer", selected: false, ruleExpression: "gender" },
        { target: "state", glossary: "state", description: "State of residence", selected: true, ruleExpression: "state" },
        { target: "country", glossary: "country", description: "Country of residence", selected: true, ruleExpression: "country" },
    ]);

    const handleColumnChange = (index: number, field: keyof PublishColumn, value: string | boolean) => {
        const newColumns = [...columns];
        newColumns[index] = { ...newColumns[index], [field]: value };
        setColumns(newColumns);
    };

    const selectedColumns = columns.filter(col => col.selected);

    const generateRuleRequests = (): RuleRequest[] => {
        return selectedColumns.map(col => ({
            name: `${col.target}_rule`,
            alias: null,
            description: col.description,
            rule_expression: col.ruleExpression,
            meta: col.glossary
        }));
    };

    const handleBuildArtifacts = () => {
        if (selectedColumns.length === 0) {
            toast.error("Please select at least one column");
            return;
        }

        const requestPayload = {
            publish_config_request: {
                glossary_entity_fqn: glossaryEntity,
                target_namespace: targetNamespace,
                target_schema: targetSchema,
                target_name: targetEntity,
                status: configStatus,
                version: configVersion
            },
            publish_columns: selectedColumns.map(col => ({
                target: col.target,
                glossary: col.glossary
            })),
            ruleset_request: {
                id: null,
                type: "glossary_publish",
                name: rulesetName,
                description: rulesetDescription,
                rule_requests: generateRuleRequests()
            }
        };

        setBuildOutput(JSON.stringify(requestPayload, null, 2));
        setPublishConfigId(`gpc_${Math.random().toString(36).substr(2, 9)}`);
        toast.success("Build artifacts created successfully");
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const handleGoToLoader = () => {
        if (publishConfigId) {
            navigate(`/glossary-loader?config_id=${publishConfigId}`);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Floating Header */}
            <div className="fixed top-4 left-4 right-4 z-50">
                <div className="mx-auto max-w-7xl">
                    <div className="backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl shadow-primary/5 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                                        <Sparkles className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-card" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-foreground tracking-tight">Glossary Build</h1>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-muted-foreground">Design-time configuration</span>
                                        <span className="text-muted-foreground/40">•</span>
                                        <Badge variant="outline" className="h-5 text-[10px] px-2 font-medium">
                                            v{configVersion}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Target Config Trigger */}
                                <Sheet open={targetPanelOpen} onOpenChange={setTargetPanelOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2 rounded-xl h-9">
                                            <Target className="w-4 h-4" />
                                            <span className="hidden sm:inline">Target Config</span>
                                            <PanelRightOpen className="w-3.5 h-3.5 opacity-50" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent className="w-[400px] sm:w-[480px] p-0 border-l-border/50">
                                        <div className="h-full flex flex-col">
                                            <SheetHeader className="px-6 py-5 border-b border-border/50 bg-muted/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                                                        <Target className="w-5 h-5 text-accent-foreground" />
                                                    </div>
                                                    <div>
                                                        <SheetTitle className="text-lg">Target Configuration</SheetTitle>
                                                        <SheetDescription className="text-xs">Define where the published entity lives</SheetDescription>
                                                    </div>
                                                </div>
                                            </SheetHeader>

                                            <ScrollArea className="flex-1 px-6 py-6">
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Namespace</Label>
                                                            <Input
                                                                value={targetNamespace}
                                                                onChange={(e) => setTargetNamespace(e.target.value)}
                                                                className="h-11 font-mono text-sm bg-muted/30 border-border/50 rounded-xl"
                                                                placeholder="e.g., avalara_publish"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject Area</Label>
                                                            <Input
                                                                value={targetSchema}
                                                                onChange={(e) => setTargetSchema(e.target.value)}
                                                                className="h-11 font-mono text-sm bg-muted/30 border-border/50 rounded-xl"
                                                                placeholder="e.g., party_publish"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entity Name</Label>
                                                            <Input
                                                                value={targetEntity}
                                                                onChange={(e) => setTargetEntity(e.target.value)}
                                                                className="h-11 font-mono text-sm bg-muted/30 border-border/50 rounded-xl"
                                                                placeholder="e.g., customer_publish"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-transparent p-5 border border-border/50">
                                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Target FQN Preview</div>
                                                        <div className="font-mono text-sm text-foreground font-medium break-all bg-card/50 rounded-xl p-3 border border-border/30">
                                                            {targetNamespace}.{targetSchema}.{targetEntity}
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    {/* Ruleset Section */}
                                                    <Collapsible open={rulesetExpanded} onOpenChange={setRulesetExpanded}>
                                                        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
                                                            <div className="flex items-center gap-2">
                                                                <Layers className="w-4 h-4 text-muted-foreground" />
                                                                <span className="text-sm font-medium">Ruleset Configuration</span>
                                                            </div>
                                                            {rulesetExpanded ? (
                                                                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform" />
                                                            )}
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent className="pt-4 space-y-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ruleset Name</Label>
                                                                <Input
                                                                    value={rulesetName}
                                                                    onChange={(e) => setRulesetName(e.target.value)}
                                                                    className="h-10 font-mono text-sm bg-muted/30 border-border/50 rounded-xl"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</Label>
                                                                <Input
                                                                    value={rulesetDescription}
                                                                    onChange={(e) => setRulesetDescription(e.target.value)}
                                                                    className="h-10 text-sm bg-muted/30 border-border/50 rounded-xl"
                                                                />
                                                            </div>
                                                            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                                                                <span className="text-sm text-muted-foreground">Rules Generated</span>
                                                                <Badge variant="secondary" className="font-mono">{selectedColumns.length}</Badge>
                                                            </div>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                </div>
                                            </ScrollArea>

                                            <div className="px-6 py-4 border-t border-border/50 bg-muted/20">
                                                <Button onClick={() => setTargetPanelOpen(false)} className="w-full rounded-xl h-10">
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Apply Configuration
                                                </Button>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                <Button variant="ghost" size="sm" className="gap-2 rounded-xl h-9">
                                    <RotateCcw className="w-4 h-4" />
                                    <span className="hidden sm:inline">Reset</span>
                                </Button>

                                <Button onClick={handleBuildArtifacts} className="gap-2 rounded-xl h-9 shadow-lg shadow-primary/20 px-5">
                                    <FileCode className="w-4 h-4" />
                                    Build Artifacts
                                </Button>

                                {/* Quick access to loader */}
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/glossary-loader")}
                                    className="gap-2 rounded-xl h-9"
                                >
                                    <Zap className="w-4 h-4" />
                                    <span className="hidden sm:inline">Go to Loader</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-28 pb-8 px-4">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Source Entity Hero */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-border/50 p-8">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                                    <BookOpen className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Source Glossary Entity</div>
                                    <Select value={glossaryEntity} onValueChange={setGlossaryEntity}>
                                        <SelectTrigger className="h-12 text-lg font-semibold bg-transparent border-0 p-0 shadow-none focus:ring-0 w-auto gap-3">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="avalara.party.customer">avalara.party.customer</SelectItem>
                                            <SelectItem value="avalara.party.supplier">avalara.party.supplier</SelectItem>
                                            <SelectItem value="avalara.sales.transaction">avalara.sales.transaction</SelectItem>
                                            <SelectItem value="avalara.inventory.product">avalara.inventory.product</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-foreground">{selectedColumns.length}</div>
                                    <div className="text-xs text-muted-foreground">columns selected</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground/40" />
                                <div className="text-right">
                                    <div className="text-sm font-medium text-foreground font-mono">{targetNamespace}.{targetSchema}.{targetEntity}</div>
                                    <div className="text-xs text-muted-foreground">target entity</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column Mapping */}
                    <Card className="rounded-3xl border-border/50 shadow-xl shadow-primary/5 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50 px-8 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Column Mapping</CardTitle>
                                        <CardDescription>Map glossary columns to target with optional transformations</CardDescription>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="font-mono text-xs px-4 py-1.5 rounded-full">
                                    {selectedColumns.length} / {columns.length} selected
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                                            <TableHead className="w-12 pl-8"></TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-4">Glossary Source</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Column</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rule Expression</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pr-8">Description</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {columns.map((column, index) => (
                                            <TableRow
                                                key={index}
                                                className={`transition-all duration-200 border-b border-border/30 ${column.selected ? "bg-primary/[0.03] hover:bg-primary/[0.06]" : "opacity-40 hover:opacity-60"}`}
                                            >
                                                <TableCell className="py-4 pl-8">
                                                    <Checkbox
                                                        checked={column.selected}
                                                        onCheckedChange={(checked) => handleColumnChange(index, "selected", checked as boolean)}
                                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-md"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <code className="px-3 py-1.5 bg-muted/50 rounded-lg text-xs font-mono border border-border/30">{column.glossary}</code>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Input
                                                        value={column.target}
                                                        onChange={(e) => handleColumnChange(index, "target", e.target.value)}
                                                        className="h-9 text-xs font-mono bg-background/50 rounded-lg border-border/50"
                                                        disabled={!column.selected}
                                                    />
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Input
                                                        value={column.ruleExpression}
                                                        onChange={(e) => handleColumnChange(index, "ruleExpression", e.target.value)}
                                                        className="h-9 text-xs font-mono bg-background/50 rounded-lg border-border/50"
                                                        disabled={!column.selected}
                                                    />
                                                </TableCell>
                                                <TableCell className="py-4 pr-8">
                                                    <Input
                                                        value={column.description}
                                                        onChange={(e) => handleColumnChange(index, "description", e.target.value)}
                                                        className="h-9 text-xs bg-background/50 rounded-lg border-border/50"
                                                        disabled={!column.selected}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Build Output */}
                    {buildOutput && (
                        <Card className="rounded-3xl border-border/50 shadow-xl overflow-hidden animate-fade-in">
                            <div className="h-1 bg-gradient-to-r from-success via-success/70 to-success" />
                            <CardHeader className="bg-success/5 border-b border-success/20 px-8 py-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-success/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-success" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-3">
                                                Build Artifacts Generated
                                                <Badge variant="outline" className="font-mono text-xs">{publishConfigId}</Badge>
                                            </CardTitle>
                                            <CardDescription>Ready to execute load</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(buildOutput)} className="gap-2 rounded-xl">
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </Button>
                                        <Button onClick={handleGoToLoader} className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                                            <Zap className="w-4 h-4" />
                                            Go to Loader
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-80">
                                    <pre className="p-6 text-xs font-mono text-foreground/80 leading-relaxed">{buildOutput}</pre>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuildArtifacts;
