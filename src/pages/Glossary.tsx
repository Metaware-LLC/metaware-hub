import { useState } from "react";
import { SubSidebar } from "@/components/layout/SubSidebar";
import { EntityGrid } from "@/components/entity/EntityGrid";
import { EntityDataDialog } from "@/components/entity/EntityDataDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export default function Glossary() {
  const [selectedSubjectAreaId, setSelectedSubjectAreaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] fixed left-64 right-0 top-14">
      <SubSidebar
        namespaceType="glossary"
        onSubjectAreaSelect={setSelectedSubjectAreaId}
        selectedSubjectAreaId={selectedSubjectAreaId || undefined}
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Glossary Management</h1>
            <p className="text-muted-foreground">
              Manage business terms and definitions
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSearchQuery("");
                setSelectedSubjectAreaId(null);
              }}
              title="Reset search and filters"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <EntityGrid
            subjectAreaId={selectedSubjectAreaId || undefined}
            namespaceType="glossary"
            searchQuery={searchQuery}
            onEntityClick={(entity) => {
              setSelectedEntity(entity);
              setDialogOpen(true);
            }}
          />
        </div>
      </div>

      <EntityDataDialog
        entity={selectedEntity}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}