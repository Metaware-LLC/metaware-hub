import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full bg-background">
        <Header />
        <div className="flex w-full">
          <Sidebar />
          <SidebarInset>
            <main className="flex-1 p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};