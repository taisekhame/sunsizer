"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Command,
  X,
  Cpu,
  UserCog,
  DollarSign,
  Wrench,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  href?: string;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
  adminOnly?: boolean;
};

type NavGroupData = {
  heading?: string;
  items: NavItemData[];
  adminOnly?: boolean;
};

const navGroups: NavGroupData[] = [
  {
    items: [
      { id: "search", title: "Search", icon: Search, shortcut: "⌘K" },
      { id: "dashboard", title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { id: "new-quotation", title: "New Quotation", icon: PlusCircle, href: "/projects/new" },
      { id: "projects", title: "Projects", icon: FolderKanban, href: "/projects" },
      { id: "customers", title: "Customers", icon: Users, href: "/customers" },
      { id: "components", title: "Components", icon: Cpu, href: "/components" },
    ],
  },
  {
    heading: "Admin",
    adminOnly: true,
    items: [
      { id: "admin-users", title: "Users", icon: UserCog, href: "/admin/users", adminOnly: true },
      { id: "admin-components", title: "Components & Prices", icon: DollarSign, href: "/admin/components", adminOnly: true },
      { id: "admin-settings", title: "Settings", icon: Wrench, href: "/admin/settings", adminOnly: true },
    ],
  },
];

const bottomItems: NavItemData[] = [
  { id: "settings", title: "Settings", icon: Settings, href: "/admin/settings", shortcut: "⌘," },
  { id: "logout", title: "Log out", icon: LogOut },
];

function NavItem({
  item,
  pathname,
  collapsed,
  onSearchOpen,
}: {
  item: NavItemData;
  pathname: string;
  collapsed: boolean;
  onSearchOpen: () => void;
}) {
  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;
  const [childOpen, setChildOpen] = useState(false);
  const hasChildren = !!item.children?.length;

  const handleClick = () => {
    if (item.id === "search") {
      onSearchOpen();
      return;
    }
    if (hasChildren) {
      setChildOpen(!childOpen);
    }
  };

  const inner = (
    <div
      className={cn(
        "group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm font-[family-name:var(--font-ui)]",
        isActive
          ? "bg-accent/10 text-foreground font-medium border-l-2 border-accent"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      onClick={hasChildren || item.id === "search" ? handleClick : undefined}
    >
      <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} strokeWidth={1.5} />
      {!collapsed && (
        <>
          <span className="truncate flex-1">{item.title}</span>
          {item.badge && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full bg-accent text-accent-foreground">
              {item.badge}
            </span>
          )}
          {item.shortcut && (
            <kbd className="hidden lg:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-mono text-muted-foreground/60 bg-muted border border-border/50 rounded">
              {item.shortcut}
            </kbd>
          )}
          {hasChildren && (
            <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground/50 transition-transform", childOpen && "rotate-90")} />
          )}
        </>
      )}
    </div>
  );

  return (
    <div>
      {item.href && !hasChildren ? (
        <Link href={item.href}>{inner}</Link>
      ) : (
        inner
      )}
      {hasChildren && childOpen && !collapsed && (
        <div className="ml-6 mt-1 space-y-0.5 border-l border-border/30 pl-2">
          {item.children!.map((child) => (
            <NavItem key={child.id} item={child} pathname={pathname} collapsed={collapsed} onSearchOpen={onSearchOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AppSidebar({
  collapsed,
  onCollapse,
}: {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const isAdmin = true; // TODO: check actual role

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-card border-r border-border/50 transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Company header */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-border/50">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground shrink-0">
            S
          </div>
          {!collapsed && (
            <span className="text-sm font-[family-name:var(--font-heading)] text-foreground truncate">
              SunSizer
            </span>
          )}
        </div>

        {/* Nav groups */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {navGroups.map((group, idx) => {
            if (group.adminOnly && !isAdmin) return null;
            return (
              <div key={idx} className="space-y-0.5">
                {group.heading && !collapsed && (
                  <span className="px-3 mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground/50 uppercase font-[family-name:var(--font-ui)]">
                    {group.heading}
                  </span>
                )}
                {group.items.map((item) => {
                  if (item.adminOnly && !isAdmin) return null;
                  return (
                    <NavItem
                      key={item.id}
                      item={item}
                      pathname={pathname}
                      collapsed={collapsed}
                      onSearchOpen={() => setSearchOpen(true)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="border-t border-border/50 py-2 px-2 space-y-0.5">
          {bottomItems.map((item) => (
            <NavItem key={item.id} item={item} pathname={pathname} collapsed={collapsed} onSearchOpen={() => setSearchOpen(true)} />
          ))}
          {/* User profile */}
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
              <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-bold">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium font-[family-name:var(--font-ui)] text-foreground truncate">User</p>
                <p className="text-[10px] text-muted-foreground truncate">Admin</p>
              </div>
            </div>
          )}
        </div>

        {/* Collapse button */}
        <button
          onClick={() => onCollapse(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </aside>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-background/40 backdrop-blur-sm px-4">
          <div className="absolute inset-0" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-xl bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center px-4 border-b border-border/50">
              <Search className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
              <input
                autoFocus
                className="flex-1 bg-transparent py-4 outline-none text-sm text-foreground font-[family-name:var(--font-ui)] placeholder:text-muted-foreground/50"
                placeholder="Search projects, customers..."
              />
              <button onClick={() => setSearchOpen(false)} className="p-1 rounded text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center justify-center">
              <Command className="w-6 h-6 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground font-[family-name:var(--font-ui)]">Type to search...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = true;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">S</div>
                <span className="text-sm font-[family-name:var(--font-heading)]">SunSizer</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
              {navGroups.map((group, idx) => {
                if (group.adminOnly && !isAdmin) return null;
                return (
                  <div key={idx} className="space-y-0.5">
                    {group.heading && (
                      <span className="px-3 mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground/50 uppercase font-[family-name:var(--font-ui)]">
                        {group.heading}
                      </span>
                    )}
                    {group.items.map((item) => {
                      if (item.adminOnly && !isAdmin) return null;
                      return (
                        <div key={item.id} onClick={() => { if (item.href) setOpen(false); }}>
                          <NavItem item={item} pathname={pathname} collapsed={false} onSearchOpen={() => {}} />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border/50 py-2 px-2 space-y-0.5">
              {bottomItems.map((item) => (
                <NavItem key={item.id} item={item} pathname={pathname} collapsed={false} onSearchOpen={() => {}} />
              ))}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
