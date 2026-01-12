import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import {
    Play,
    Loader2,
    Database,
    Settings2,
    Zap,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowLeft,
    RefreshCw,
    Link2,
    Server,
    Layers,
    BarChart3,
    BookOpen,
    PanelRightOpen,
    Activity,
    TrendingUp,
    Timer,
    ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { API_CONFIG } from "@/config/api";

interface LoadedData {
    first_name: string;
    last_name: string;
    email: string;
    customer_id: string;
    phone_number: string;
    state: string;
    country: string;
}

const GlossaryLoader = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const configId = searchParams.get("config_id") || "gpc_demo123";

    // Simulated config data (would come from API based on configId)
    const glossaryEntity = "avalara.sales.transaction";
    const targetFqn = "avalara_publish.party_publish.customer_publish";

    // Loader Runtime (type/subtype come from connection profile)
    const [connectionName, setConnectionName] = useState("motherduck_model");
    const [strategy, setStrategy] = useState("delete_and_insert");

    // Loader Options
    const [materializeAs, setMaterializeAs] = useState("materialized_view");
    const [batchSize, setBatchSize] = useState("1000");
    const [parallelism, setParallelism] = useState("4");
    const [dryRun, setDryRun] = useState(false);
    const [commitInterval, setCommitInterval] = useState("");

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [optionsPanelOpen, setOptionsPanelOpen] = useState(false);
    const [loadResult, setLoadResult] = useState<{
        rows_loaded: number;
        duration_seconds: number;
        status: string;
        messages: string[];
    } | null>(null);

    // Sample loaded data
    const [loadedData, setLoadedData] = useState<LoadedData[]>([]);

    const sampleData: LoadedData[] = [
        { first_name: "John", last_name: "Smith", email: "john.smith@email.com", customer_id: "CUST001", phone_number: "+1-555-0101", state: "California", country: "USA" },
        { first_name: "Sarah", last_name: "Johnson", email: "sarah.j@company.com", customer_id: "CUST002", phone_number: "+1-555-0102", state: "New York", country: "USA" },
        { first_name: "Michael", last_name: "Williams", email: "m.williams@corp.net", customer_id: "CUST003", phone_number: "+1-555-0103", state: "Texas", country: "USA" },
        { first_name: "Emily", last_name: "Brown", email: "emily.brown@mail.com", customer_id: "CUST004", phone_number: "+1-555-0104", state: "Florida", country: "USA" },
        { first_name: "David", last_name: "Jones", email: "d.jones@business.org", customer_id: "CUST005", phone_number: "+1-555-0105", state: "Illinois", country: "USA" },
        { first_name: "Jessica", last_name: "Garcia", email: "jgarcia@enterprise.com", customer_id: "CUST006", phone_number: "+1-555-0106", state: "Arizona", country: "USA" },
        { first_name: "Christopher", last_name: "Miller", email: "c.miller@tech.io", customer_id: "CUST007", phone_number: "+1-555-0107", state: "Colorado", country: "USA" },
        { first_name: "Amanda", last_name: "Davis", email: "amanda.d@startup.co", customer_id: "CUST008", phone_number: "+1-555-0108", state: "Washington", country: "USA" },
    ];

    const handleExecuteLoad = async () => {
        setIsLoading(true);
        setLoadResult(null);
        setLoadedData([]);

        try {
            // Use values from dropdowns instead of hardcoded values
            const selectedConnection = connectionProfiles.find(p => p.name === connectionName);

            const payload = {
                publish_config_id: configId,
                connection_name: connectionName,
                load_strategy: strategy,
                materialize_as: materializeAs,
                runtime_options: {
                    type: selectedConnection?.type || "db",
                    subtype: selectedConnection?.subtype || "DuckDB / MotherDuck",
                    ...(batchSize && { batch_size: parseInt(batchSize) }),
                    ...(parallelism && { parallelism: parseInt(parallelism) }),
                    dry_run: dryRun
                },
                loader_config_name: `Glossary Loader - ${targetFqn}`,
                loader_config_description: `Loading glossary publish configuration from ${glossaryEntity} to ${targetFqn}`
            };

            console.log("Load payload:", payload);

            const response = await fetch(`${API_CONFIG.REST_ENDPOINT}/mwn/load_glossary_publish`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to execute load: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("Load result:", result);

            // Simulate result for demo
            setLoadResult({
                rows_loaded: 1247,
                duration_seconds: 2.3,
                status: "completed",
                messages: [
                    `Connected to connection '${connectionName}'`,
                    "Schema validated",
                    "1247 rows processed",
                    `Strategy: ${strategy.replace(/_/g, ' ')}`,
                    "Load completed successfully"
                ]
            });
            setLoadedData(sampleData);
            toast.success("Load executed successfully");
        } catch (error) {
            console.error("Error executing load:", error);
            toast.error(error instanceof Error ? error.message : "Failed to execute load");
        } finally {
            setIsLoading(false);
        }
    };

    const connectionProfiles = [
        { name: "motherduck_model", type: "db", subtype: "DuckDB / MotherDuck" },
        { name: "postgres_prod", type: "db", subtype: "PostgreSQL" },
        { name: "snowflake_dw", type: "db", subtype: "Snowflake" },
        { name: "s3_export", type: "file", subtype: "Parquet" },
    ];

    const selectedConnection = connectionProfiles.find(p => p.name === connectionName);

    return (
        <div className="min-h-screen bg-background">
            {/* Floating Header */}
            <div className="fixed top-4 left-4 right-4 z-50">
                <div className="mx-auto max-w-7xl">
                    <div className="backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl shadow-accent/5 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <Button variant="ghost" size="icon" onClick={() => navigate("/build-models")} className="rounded-xl h-10 w-10">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent via-accent to-primary flex items-center justify-center shadow-lg shadow-accent/30">
                                        <Zap className="w-6 h-6 text-accent-foreground" />
                                    </div>
                                    {isLoading && (
                                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary border-2 border-card animate-pulse" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-foreground tracking-tight">Glossary Loader</h1>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-muted-foreground">Runtime execution</span>
                                        <span className="text-muted-foreground/40">•</span>
                                        <Badge variant="outline" className="h-5 text-[10px] px-2 font-mono">
                                            {configId}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Loader Options Trigger */}
                                <Sheet open={optionsPanelOpen} onOpenChange={setOptionsPanelOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2 rounded-xl h-9">
                                            <Settings2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Options</span>
                                            <PanelRightOpen className="w-3.5 h-3.5 opacity-50" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent className="w-[400px] sm:w-[480px] p-0 border-l-border/50">
                                        <div className="h-full flex flex-col">
                                            <SheetHeader className="px-6 py-5 border-b border-border/50 bg-muted/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                                        <Settings2 className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <SheetTitle className="text-lg">Loader Options</SheetTitle>
                                                        <SheetDescription className="text-xs">Fine-tune execution parameters</SheetDescription>
                                                    </div>
                                                </div>
                                            </SheetHeader>

                                            <ScrollArea className="flex-1 px-6 py-6">
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Materialize As</Label>
                                                        <RadioGroup value={materializeAs} onValueChange={setMaterializeAs} className="flex flex-col gap-2">
                                                            {["table", "view", "materialized_view"].map((option) => (
                                                                <label
                                                                    key={option}
                                                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all border ${materializeAs === option
                                                                        ? "bg-primary/10 text-primary border-primary/30"
                                                                        : "bg-muted/30 hover:bg-muted/50 text-muted-foreground border-transparent"
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <RadioGroupItem value={option} className="sr-only" />
                                                                        <Database className="w-4 h-4" />
                                                                        {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                    </div>
                                                                    {materializeAs === option && <CheckCircle2 className="w-4 h-4" />}
                                                                </label>
                                                            ))}
                                                        </RadioGroup>
                                                    </div>

                                                    <Separator />

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Batch Size</Label>
                                                            <Input
                                                                type="number"
                                                                value={batchSize}
                                                                onChange={(e) => setBatchSize(e.target.value)}
                                                                className="h-11 bg-muted/30 border-border/50 rounded-xl"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parallelism</Label>
                                                            <Input
                                                                type="number"
                                                                value={parallelism}
                                                                onChange={(e) => setParallelism(e.target.value)}
                                                                className="h-11 bg-muted/30 border-border/50 rounded-xl"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commit Interval</Label>
                                                        <Input
                                                            value={commitInterval}
                                                            onChange={(e) => setCommitInterval(e.target.value)}
                                                            placeholder="Optional"
                                                            className="h-11 bg-muted/30 border-border/50 rounded-xl"
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-4 border border-border/50">
                                                        <div>
                                                            <Label className="text-sm font-medium">Dry Run</Label>
                                                            <p className="text-xs text-muted-foreground mt-0.5">Simulate without committing</p>
                                                        </div>
                                                        <Switch checked={dryRun} onCheckedChange={setDryRun} />
                                                    </div>
                                                </div>
                                            </ScrollArea>

                                            <div className="px-6 py-4 border-t border-border/50 bg-muted/20">
                                                <Button onClick={() => setOptionsPanelOpen(false)} className="w-full rounded-xl h-10">
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Apply Options
                                                </Button>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                <Button
                                    onClick={handleExecuteLoad}
                                    disabled={isLoading}
                                    className="gap-2 rounded-xl h-9 shadow-lg shadow-primary/20 min-w-[140px] px-5"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Executing...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4" />
                                            Execute Load
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-28 pb-8 px-4">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Entity Context Hero */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/10 via-primary/5 to-transparent border border-border/50 p-8">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-accent/10 to-transparent rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border border-accent/20">
                                        <BookOpen className="w-8 h-8 text-accent-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Loading From Glossary</div>
                                        <div className="text-2xl font-bold text-foreground">{glossaryEntity}</div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                                            <span className="text-sm text-muted-foreground font-mono">{targetFqn}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Runtime Config Inline - Simplified: Connection contains type/subtype */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Connection Profile</div>
                                        <Button variant="ghost" size="sm" className="h-5 px-2 text-[10px]" onClick={() => navigate("/connection-profiles")}>
                                            <Link2 className="w-3 h-3 mr-1" />
                                            Manage
                                        </Button>
                                    </div>
                                    <Select value={connectionName} onValueChange={setConnectionName}>
                                        <SelectTrigger className="h-10 bg-transparent border-border/50 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {connectionProfiles.map(profile => (
                                                <SelectItem key={profile.name} value={profile.name}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{profile.name}</span>
                                                        <Badge variant="secondary" className="text-[10px] h-4">{profile.subtype}</Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedConnection && (
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <Server className="w-3 h-3" />
                                            <span>{selectedConnection.type}</span>
                                            <span className="text-muted-foreground/30">•</span>
                                            <span>{selectedConnection.subtype}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/30">
                                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Strategy</div>
                                    <Select value={strategy} onValueChange={setStrategy}>
                                        <SelectTrigger className="h-10 bg-transparent border-border/50 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="delete_and_insert">Delete & Insert</SelectItem>
                                            <SelectItem value="insert_as_select">Insert as Select</SelectItem>
                                            <SelectItem value="merge">Merge (Upsert)</SelectItem>
                                            <SelectItem value="offline">Offline</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Execution Status */}
                    {(isLoading || loadResult) && (
                        <Card className={`rounded-3xl shadow-xl overflow-hidden border-border/50 animate-fade-in ${loadResult?.status === "completed" ? "" : ""}`}>
                            {loadResult?.status === "completed" && (
                                <div className="h-1 bg-gradient-to-r from-success via-success/70 to-success" />
                            )}
                            <CardContent className={`p-8 ${loadResult?.status === "completed" ? "bg-success/5" : ""}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-5">
                                        {isLoading ? (
                                            <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                                                <Loader2 className="w-7 h-7 text-primary animate-spin" />
                                            </div>
                                        ) : loadResult?.status === "completed" ? (
                                            <div className="h-14 w-14 rounded-2xl bg-success/20 flex items-center justify-center">
                                                <CheckCircle2 className="w-7 h-7 text-success" />
                                            </div>
                                        ) : (
                                            <div className="h-14 w-14 rounded-2xl bg-destructive/20 flex items-center justify-center">
                                                <XCircle className="w-7 h-7 text-destructive" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-xl font-bold text-foreground">
                                                {isLoading ? "Executing Load..." : `Load ${loadResult?.status?.charAt(0).toUpperCase()}${loadResult?.status?.slice(1)}`}
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {isLoading ? "Please wait while data is being loaded" : targetFqn}
                                            </div>
                                        </div>
                                    </div>

                                    {loadResult && (
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
                                                    <TrendingUp className="w-5 h-5 text-success" />
                                                    {loadResult.rows_loaded.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">rows loaded</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
                                                    <Timer className="w-5 h-5 text-primary" />
                                                    {loadResult.duration_seconds}s
                                                </div>
                                                <div className="text-xs text-muted-foreground">duration</div>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={handleExecuteLoad} className="gap-2 rounded-xl">
                                                <RefreshCw className="w-4 h-4" />
                                                Re-run
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {loadResult && (
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {loadResult.messages.map((msg, idx) => (
                                            <Badge key={idx} variant="secondary" className="rounded-full px-3 py-1 text-xs font-normal">
                                                {msg}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Data Preview */}
                    {loadedData.length > 0 && (
                        <Card className="rounded-3xl border-border/50 shadow-xl overflow-hidden animate-fade-in">
                            <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50 px-8 py-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Data Preview</CardTitle>
                                            <CardDescription>Sample of loaded data</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="font-mono text-xs px-4 py-1.5 rounded-full">
                                        {loadedData.length} rows shown
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                                                {Object.keys(loadedData[0]).map((key) => (
                                                    <TableHead key={key} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-4 first:pl-8 last:pr-8">
                                                        {key.replace(/_/g, ' ')}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loadedData.map((row, idx) => (
                                                <TableRow key={idx} className="border-b border-border/30 hover:bg-muted/20">
                                                    {Object.values(row).map((value, vidx) => (
                                                        <TableCell key={vidx} className="py-4 text-sm first:pl-8 last:pr-8 first:font-medium">
                                                            {value}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {!isLoading && !loadResult && (
                        <div className="text-center py-20">
                            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mx-auto mb-6 border border-border/50">
                                <Activity className="w-10 h-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Execute</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Configure your loader runtime settings above and click "Execute Load" to materialize your glossary publish configuration.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlossaryLoader;
