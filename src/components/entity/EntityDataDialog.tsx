import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/table/DataTable";
import { useMDConnection, queryMDTable } from "@/hooks/useMDConnection";
import { Database, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EntityDataDialogProps {
  entity: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EntityDataDialog({ entity, open, onOpenChange }: EntityDataDialogProps) {
  const { connection, connect, ready } = useMDConnection();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ columns: string[]; rows: any[] }>({ columns: [], rows: [] });

  useEffect(() => {
    if (open && !ready && !connection) {
      connect();
    }
  }, [open, ready, connection, connect]);

  useEffect(() => {
    if (open && ready && connection && entity) {
      fetchData();
    }
  }, [open, ready, connection, entity]);

  const fetchData = async () => {
    if (!connection || !entity) return;

    setLoading(true);
    try {
      const namespace = entity.subjectarea.namespace.name;
      const subjectarea = entity.subjectarea.name;
      const entityName = entity.name;

      const result = await queryMDTable(connection, namespace, subjectarea, entityName);
      setData(result);
    } catch (error) {
      console.error("Error fetching entity data:", error);
      setData({ columns: [], rows: [] });
    } finally {
      setLoading(false);
    }
  };

  const columns = data.columns.map((col) => ({
    key: col,
    title: col,
    type: "text" as const,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            {entity?.name || "Entity Data"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {entity?.subjectarea?.namespace?.name}.{entity?.subjectarea?.name}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {!ready ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Connecting to database...</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading data...</p>
              </div>
            </div>
          ) : data.rows.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <Database className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No data found</p>
                <Button variant="outline" size="sm" onClick={fetchData}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data.rows}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
