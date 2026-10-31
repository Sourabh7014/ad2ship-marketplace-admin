import { ReactNode, useState, useRef } from "react";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { usePathname } from "next/navigation";
import { NavCollapsible, NavItem, NavLink, NavSubCollapsible, NavSubItem, type NavGroup } from "./types";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NavGroup({ title, items }: NavGroup) {
  const { state, isMobile } = useSidebar();
  return (
    <SidebarGroup>
      {title ? (
        <SidebarGroupLabel className="px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500 select-none group-data-[collapsible=icon]:hidden">
          {title}
        </SidebarGroupLabel>
      ) : null}
      <SidebarMenu>
        {items.map((item: NavItem) => {
          const key = `${item.title}-${item.url}`;

          if (!item.items) {
            return <SidebarMenuLink key={key} item={item} />;
          }

          if (state === "collapsed" && !isMobile)
            return <SidebarMenuCollapsedDropdown key={key} item={item} />;

          return <SidebarMenuCollapsible key={key} item={item} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>
);

const SidebarMenuLink = ({ item }: { item: NavLink }) => {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const isActive = checkIsActive(pathname, item);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          "transition-all duration-150 rounded-xl font-medium",
          isActive
            ? "bg-blue-600 text-white font-bold hover:bg-blue-700 hover:text-white shadow-xs [&>svg]:text-white"
            : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60"
        )}
      >
        <Link
          href={item.onClick ? "#" : item.url}
          onClick={(e) => {
            if (item.onClick) {
              e.preventDefault();
              item.onClick();
            }
            setOpenMobile(false);
          }}
        >
          {item.icon && (
            <item.icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                isActive ? "text-white" : "text-zinc-500 dark:text-zinc-400"
              )}
            />
          )}
          <span className="font-semibold text-[13px]">{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarMenuSubCollapsible = ({ item }: { item: NavSubCollapsible }) => {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const isSubSectionActive = checkIsActive(pathname, item, true);

  return (
    <SidebarMenuSubItem>
      <Collapsible
        defaultOpen={isSubSectionActive}
        className="group/sub-collapsible"
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuSubButton
            className={cn(
              "justify-between transition-all duration-150 rounded-xl",
              isSubSectionActive
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold border-0"
                : "hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400"
            )}
            asChild={!!item.url}
          >
            {item.url ? (
              <Link href={item.url} onClick={() => setOpenMobile(false)}>
                <span className="flex items-center gap-2">
                  {item.icon && (
                    <item.icon
                      className={cn(
                        "size-3.5 shrink-0",
                        isSubSectionActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"
                      )}
                    />
                  )}
                  <span>{item.title}</span>
                </span>
                <ChevronRight
                  className={cn(
                    "ml-auto w-3 h-3 transition-transform duration-200 group-data-[state=open]/sub-collapsible:rotate-90",
                    isSubSectionActive ? "text-blue-600 dark:text-blue-400" : ""
                  )}
                />
              </Link>
            ) : (
              <>
                <span className="flex items-center gap-2">
                  {item.icon && (
                    <item.icon
                      className={cn(
                        "size-3.5 shrink-0",
                        isSubSectionActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"
                      )}
                    />
                  )}
                  <span>{item.title}</span>
                </span>
                <ChevronRight
                  className={cn(
                    "ml-auto w-3 h-3 transition-transform duration-200 group-data-[state=open]/sub-collapsible:rotate-90",
                    isSubSectionActive ? "text-blue-600 dark:text-blue-400" : ""
                  )}
                />
              </>
            )}
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="pl-4 border-l-2 border-blue-100 dark:border-blue-950/80 ml-2">
            {item.items.map((subItem) => {
              const isSubActive = checkIsActive(pathname, subItem);
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isSubActive}
                    className={cn(
                      "transition-all duration-150 rounded-xl px-2.5 py-1.5 text-[12.5px] border-0 border-transparent outline-none",
                      isSubActive
                        ? "bg-blue-50 text-blue-700 font-bold hover:bg-blue-100/70 dark:bg-blue-950/40 dark:text-blue-300 shadow-none border-0 border-transparent"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40 border-0 border-transparent"
                    )}
                  >
                    <Link href={subItem.url} onClick={() => setOpenMobile(false)} className="flex items-center gap-2">
                      {subItem.icon && (
                        <subItem.icon
                          className={cn("size-3.5 shrink-0", isSubActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400")}
                        />
                      )}
                      <span className="truncate">{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuSubItem>
  );
};

const SidebarMenuCollapsible = ({ item }: { item: NavCollapsible }) => {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const isSectionActive = checkIsActive(pathname, item, true);

  return (
    <SidebarMenuItem>
      <Collapsible
        defaultOpen={isSectionActive}
        className="group/collapsible"
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isSectionActive}
            asChild={!!item.url}
            className={cn(
              "transition-all duration-150 rounded-xl font-medium",
              isSectionActive
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold border-0"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60"
            )}
          >
            {item.url ? (
              <Link href={item.url} onClick={() => setOpenMobile(false)}>
                {item.icon && (
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isSectionActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"
                    )}
                  />
                )}
                <span className="font-semibold text-[13px]">{item.title}</span>
                {item.badge && <NavBadge>{item.badge}</NavBadge>}
                <ChevronRight
                  className={cn(
                    "ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90",
                    isSectionActive ? "text-blue-600 dark:text-blue-400 font-bold" : "text-zinc-400"
                  )}
                />
              </Link>
            ) : (
              <>
                {item.icon && (
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isSectionActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"
                    )}
                  />
                )}
                <span className="font-semibold text-[13px]">{item.title}</span>
                {item.badge && <NavBadge>{item.badge}</NavBadge>}
                <ChevronRight
                  className={cn(
                    "ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90",
                    isSectionActive ? "text-blue-600 dark:text-blue-400 font-bold" : "text-zinc-400"
                  )}
                />
              </>
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub className="pl-2 border-l-2 border-blue-100 dark:border-blue-950/80 ml-3.5 my-1 space-y-0.5">
            {item.items.map((subItem) => {
              if (subItem.items) {
                return (
                  <SidebarMenuSubCollapsible
                    key={subItem.title}
                    item={subItem as NavSubCollapsible}
                  />
                );
              }
              const isSubActive = checkIsActive(pathname, subItem);
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isSubActive}
                    className={cn(
                      "transition-all duration-150 rounded-xl px-2.5 py-1.5 text-[12.5px] border-0 border-transparent outline-none",
                      isSubActive
                        ? "bg-blue-50 text-blue-700 font-bold hover:bg-blue-100/70 dark:bg-blue-950/40 dark:text-blue-300 shadow-none border-0 border-transparent"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40 border-0 border-transparent"
                    )}
                  >
                    <Link href={subItem.url} onClick={() => setOpenMobile(false)} className="flex items-center gap-2">
                      {subItem.icon && (
                        <subItem.icon
                          className={cn("size-3.5 shrink-0", isSubActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400")}
                        />
                      )}
                      <span className="truncate">{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};

const SidebarMenuCollapsedDropdown = ({ item }: { item: NavCollapsible }) => {
  const pathname = usePathname();
  const isActive = checkIsActive(pathname, item, true);

  return (
    <SidebarMenuItem>
      <HoverCard openDelay={100} closeDelay={150}>
        <HoverCardTrigger asChild>
          <SidebarMenuButton
            isActive={isActive}
            className={cn(
              "transition-all duration-150 rounded-xl",
              isActive && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-xs [&>svg]:text-white"
            )}
          >
            {item.icon && <item.icon className={cn("size-4 shrink-0", isActive ? "text-white" : "")} />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
          </SidebarMenuButton>
        </HoverCardTrigger>

        <HoverCardContent
          side="right"
          align="start"
          sideOffset={8}
          className="p-0 w-auto min-w-[210px] overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-700/70 bg-white dark:bg-zinc-900 shadow-2xl shadow-black/20 z-[9999]"
        >
          {/* Header */}
          {item.url ? (
            <Link
              href={item.url}
              className="flex items-center gap-2.5 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-800 transition-colors"
            >
              {item.icon && (
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <item.icon className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div>
                <p className="text-[12px] font-extrabold text-zinc-800 dark:text-zinc-100 leading-none">{item.title}</p>
                {item.badge && (
                  <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">{item.badge}</span>
                )}
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800">
              {item.icon && (
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <item.icon className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div>
                <p className="text-[12px] font-extrabold text-zinc-800 dark:text-zinc-100 leading-none">{item.title}</p>
                {item.badge && (
                  <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">{item.badge}</span>
                )}
              </div>
            </div>
          )}

          {/* Sub items */}
          <div className="py-1.5 max-h-[350px] overflow-y-auto">
            {item.items.map((sub) => {
              if (sub.items) {
                return (
                  <div key={sub.title} className="px-4 py-1.5 border-t border-zinc-100 dark:border-zinc-800/50 mt-1 first:border-t-0 first:mt-0">
                    <p className="text-[11px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      {sub.title}
                    </p>
                    <div className="pl-2 flex flex-col gap-1">
                      {sub.items.map((nestedSub) => {
                        const nestedActive = checkIsActive(pathname, nestedSub);
                        return (
                          <Link
                            key={`${nestedSub.title}-${nestedSub.url}`}
                            href={nestedSub.url}
                            className={cn(
                              "flex items-center gap-2.5 py-1.5 text-[11.5px] font-semibold transition-colors duration-150 cursor-pointer",
                              nestedActive
                                ? "text-blue-600 dark:text-blue-400 font-bold"
                                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            )}
                          >
                            <span>{nestedSub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const subActive = checkIsActive(pathname, sub);
              return (
                <Link
                  key={`${sub.title}-${sub.url}`}
                  href={sub.url}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-[12.5px] font-semibold transition-colors duration-150 cursor-pointer rounded-none!",
                    subActive
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50! dark:hover:bg-zinc-800/60! hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  {sub.icon && (
                    <sub.icon
                      className={cn(
                        "w-3.5 h-3.5 shrink-0",
                        subActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-zinc-500"
                      )}
                    />
                  )}
                  <span>{sub.title}</span>
                  {sub.badge && (
                    <span className="ml-auto text-[9px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                      {sub.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </HoverCardContent>
      </HoverCard>
    </SidebarMenuItem>
  );
};

function checkIsActive(
  pathname: string,
  item: NavItem | NavSubItem,
  mainNav = false
): boolean {
  if (!pathname) {
    return false;
  }

  const cleanPath = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  if ("items" in item && item.items) {
    if (mainNav) {
      return item.items.some((subItem: NavSubItem) => {
        if ("items" in subItem && subItem.items) {
          return subItem.items.some((nestedItem: NavLink) => {
            if (!nestedItem.url) return false;
            return cleanPath === nestedItem.url || cleanPath.startsWith(nestedItem.url + "/");
          });
        }
        if (!subItem.url) return false;
        return cleanPath === subItem.url || cleanPath.startsWith(subItem.url + "/");
      });
    }
    return item.items.some((subItem: NavSubItem) => {
      if ("items" in subItem && subItem.items) {
        return subItem.items.some((nestedItem: NavLink) => nestedItem.url === cleanPath);
      }
      return subItem.url === cleanPath;
    });
  }

  if ("url" in item && item.url) {
    if (cleanPath === item.url) return true;
    if (
      item.url !== "/admin/dashboard" &&
      item.url !== "/seller/dashboard" &&
      item.url !== "/dashboard" &&
      item.url !== "/admin/cod-remittance" &&
      item.url !== "/admin/weight-reconciliation" &&
      cleanPath.startsWith(item.url + "/")
    ) {
      return true;
    }
  }

  return false;
}
