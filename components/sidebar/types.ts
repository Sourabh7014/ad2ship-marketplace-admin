interface BaseNavItem {
  title: string;
  badge?: string;
  icon?: React.ElementType;
  onClick?: () => void;
  /** entitlement module key (see lib/entitlements). Absent = shared/always-visible. */
  module?: string;
}

type NavLink = BaseNavItem & {
  url: string;
  items?: never;
};

type NavSubCollapsible = BaseNavItem & {
  items: NavLink[];
  url?: string;
};

type NavSubItem = NavSubCollapsible | NavLink;

type NavCollapsible = BaseNavItem & {
  items: NavSubItem[];
  url?: string;
};

type NavItem = NavCollapsible | NavLink;

interface NavGroup {
  title: string;
  items: NavItem[];
}

export type { NavGroup, NavItem, NavCollapsible, NavLink, NavSubCollapsible, NavSubItem, BaseNavItem };

