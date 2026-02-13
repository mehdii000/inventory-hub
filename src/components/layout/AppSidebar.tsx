import { Cog, History, BarChart3, Globe } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/contexts/LanguageContext";
import { UpdateChecker } from "@/components/layout/UpdateChecker";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

const navItems = [
  { titleKey: "nav.processors", url: "/", icon: Cog },
  { titleKey: "nav.history", url: "/history", icon: History },
  { titleKey: "nav.analytics", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { t, language, setLanguage } = useLanguage();
  const [version, setVersion] = useState<string>("...");
  const collapsed = state === "collapsed";

  useEffect(() => {
    const fetchVersion = async () => {
      if (window.electronAPI?.getAppVersion) {
        const v = await window.electronAPI.getAppVersion();
        setVersion(v);
      }
    };
    fetchVersion();
  }, []);
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cog className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground tracking-wide">
              {t("nav.brand")}
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{!collapsed ? "Navigation" : ""}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={t(item.titleKey)}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <button
          onClick={() => setLanguage(language === "en" ? "fr" : "en")}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Globe className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <span className="uppercase font-mono text-xs tracking-widest">
              {language === "en" ? "EN" : "FR"}
            </span>
          )}
        </button>

        <UpdateChecker />

        {/* App Version - Now using dynamic version state */}
        <div className="flex items-center gap-3 px-3 py-2">
          {!collapsed ? (
            <span className="text-[10px] font-mono text-muted-foreground/60 tracking-wide">
              {t("nav.version")} {version}
            </span>
          ) : (
            <span className="text-[9px] font-mono text-muted-foreground/50 w-full text-center">
              v{version}
            </span>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
