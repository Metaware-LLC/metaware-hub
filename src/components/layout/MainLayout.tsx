import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useLayout } from "@/context/LayoutContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { sidebarWidth } = useLayout();

  return (
    <>
      <style>{`
        .main-layout-container {
          min-height: 100vh;
          background-color: hsl(var(--background));
        }

        .main-layout-content {
          display: flex;
        }

        .main-layout-main {
          flex: 1;
          margin-left: ${sidebarWidth};
          margin-top: 3.5rem;
          min-width: 0;
          padding: 1.5rem;
          transition: margin-left 300ms ease-in-out;
        }
      `}</style>

      <div className="main-layout-container">
        <Header />
        <div className="main-layout-content">
          <Sidebar />
          <main className="main-layout-main">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};