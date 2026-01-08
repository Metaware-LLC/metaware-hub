import React, { createContext, useContext, useState, useEffect } from "react";

interface LayoutContextType {
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
    setSidebarCollapsed: (value: boolean) => void;
    sidebarWidth: string; // '16rem' or '4rem'

    // Sub Sidebar State
    isSubSidebarCollapsed: boolean;
    toggleSubSidebar: () => void;
    setSubSidebarCollapsed: (value: boolean) => void;

    // Page Registration
    hasSubSidebar: boolean;
    setHasSubSidebar: (value: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
    // Main Sidebar
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem("METAHUB_SIDEBAR_COLLAPSED");
        return saved === "true";
    });

    // Sub Sidebar
    const [isSubSidebarCollapsed, setIsSubSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem("METAHUB_SUB_SIDEBAR_COLLAPSED");
        return saved === "true";
    });

    const [hasSubSidebar, setHasSubSidebar] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem("METAHUB_SIDEBAR_COLLAPSED", String(newState));
            return newState;
        });
    };

    const setSidebarCollapsed = (value: boolean) => {
        setIsSidebarCollapsed(value);
        localStorage.setItem("METAHUB_SIDEBAR_COLLAPSED", String(value));
    };

    const toggleSubSidebar = () => {
        setIsSubSidebarCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem("METAHUB_SUB_SIDEBAR_COLLAPSED", String(newState));
            return newState;
        });
    };

    const setSubSidebarCollapsed = (value: boolean) => {
        setIsSubSidebarCollapsed(value);
        localStorage.setItem("METAHUB_SUB_SIDEBAR_COLLAPSED", String(value));
    };

    const sidebarWidth = isSidebarCollapsed ? "4rem" : "16rem";

    return (
        <LayoutContext.Provider value={{
            isSidebarCollapsed,
            toggleSidebar,
            setSidebarCollapsed,
            sidebarWidth,
            isSubSidebarCollapsed,
            toggleSubSidebar,
            setSubSidebarCollapsed,
            hasSubSidebar,
            setHasSubSidebar
        }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error("useLayout must be used within a LayoutProvider");
    }
    return context;
};
