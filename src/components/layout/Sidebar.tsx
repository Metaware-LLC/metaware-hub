import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  BarChart3,
  Database,
  Archive,
  Layers,
  BookOpen,
  Shield,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  children?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Start Here",
    href: "/start-here",
    icon: Home,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Metadata",
    href: "/metadata",
    icon: Database,
    children: [
      { title: "NameSpace", href: "/metadata/namespace" },
      { title: "Subject Area", href: "/metadata/subject-area" },
      { title: "Entity", href: "/metadata/entity" },
      { title: "Meta", href: "/metadata/meta" },
    ],
  },
  {
    title: "Staging",
    href: "/staging",
    icon: Archive,
  },
  {
    title: "Glossary",
    href: "/glossary",
    icon: BookOpen,
  },
  {
    title: "Model",
    href: "/model",
    icon: Layers,
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Shield,
  },
];

export const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['Metadata']);
  const location = useLocation();
  const { state } = useSidebar();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const isExpanded = navItems.some((item) => 
    item.children?.some((child) => isActive(child.href))
  );

  return (
    <SidebarUI collapsible="icon" className="top-14 border-sidebar-border bg-sidebar-background">
      <div className="flex items-center justify-end p-2">
        <SidebarTrigger />
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              item.children ? (
                <Collapsible
                  key={item.title}
                  open={expandedItems.includes(item.title)}
                  onOpenChange={() => {
                    setExpandedItems(prev =>
                      prev.includes(item.title)
                        ? prev.filter(i => i !== item.title)
                        : [...prev, item.title]
                    );
                  }}
                  defaultOpen={isExpanded}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive(item.href)}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight className={cn(
                          "ml-auto transition-transform duration-200",
                          expandedItems.includes(item.title) && "rotate-90"
                        )} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive(child.href)}
                            >
                              <NavLink to={child.href}>
                                <span>{child.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.href)}
                  >
                    <NavLink to={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </SidebarUI>
  );
};