import {
  LayoutGrid,
  UserCog,
  Contact,
  Wallet,
  Banknote,
  ReceiptText,
  Scale,
  ListChecks,
  Palette,
  Settings,
  LifeBuoy,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavGroupItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  items?: NavSubItem[];
}

export function buildAdminNavItems(user: any): NavGroupItem[] {
  if (!user) return [{ title: "Dashboard", url: "/admin/dashboard", icon: LayoutGrid }];

  const dept = String(user?.department || user?.role || "").toLowerCase().trim();
  const perms: string[] = Array.isArray(user?.permissions) ? user.permissions : [];
  const caps = user?.capabilities || {};
  const isSuper = caps.isSuperAdmin === true || perms.includes("*") || dept === "superadmin" || dept === "super_admin";
  const isAdmin = isSuper || dept === "admin" || dept === "administrator";

  const hasPerm = (required: string | string[]): boolean => {
    if (isAdmin) return true;
    const reqArray = Array.isArray(required) ? required : [required];
    return reqArray.some((p) => perms.includes(p));
  };

  const navItems: (NavGroupItem | false | null | undefined)[] = [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutGrid },

    // Admin User Module
    (isSuper || caps.canViewAdminModule || hasPerm(["admin.manage", "admin.view", "admin.roles", "admin_users.view", "admin_users.create", "admin_users.edit", "admin_users.manage", "roles.view", "roles.manage"])) && {
      title: "Admin User",
      icon: UserCog,
      items: [
        (isSuper || hasPerm(["admin_users.view", "admin_users.create", "admin_users.edit", "admin_users.manage"])) && { title: "All Admins", url: "/admin/admins" },
        (isSuper || caps.canViewRolesPage || hasPerm(["roles.view", "roles.manage", "admin.roles"])) && { title: "Roles & Permissions", url: "/admin/roles" },
      ].filter(Boolean) as NavSubItem[],
    },

    // CRM Management Module
    (isSuper || caps.canViewCRMModule || hasPerm(["crm.view", "crm.order_report", "crm.sellers", "sellers.view", "seller.view", "crm.contacts"])) && {
      title: "CRM Management",
      icon: Contact,
      items: [
        (isSuper || hasPerm(["crm.order_report", "crm.view"])) && { title: "Order Report", url: "/admin/crm/order-report" },
        (isSuper || hasPerm(["crm.sellers", "sellers.view", "seller.view"])) && { title: "Seller", url: "/admin/sellers" },
        (isSuper || hasPerm(["crm.contacts", "crm.view"])) && { title: "Contact Us", url: "/admin/crm/contacts" },
      ].filter(Boolean) as NavSubItem[],
    },

    // Finance Module
    (isSuper || caps.canViewFinanceModule || hasPerm(["finance.view", "finance.shipping_rates", "shipping_rates.view", "finance.recharge", "finance.credit_notes"])) && {
      title: "Finance",
      icon: Wallet,
      items: [
        (isSuper || hasPerm(["finance.shipping_rates", "shipping_rates.view", "finance.view"])) && { title: "Seller Shipping Rates", url: "/admin/finance/shipping-rates" },
        (isSuper || hasPerm(["finance.recharge", "finance.view"])) && { title: "Seller Recharge", url: "/admin/finance/recharge" },
        (isSuper || hasPerm(["finance.credit_notes", "finance.view"])) && { title: "Seller Credit Notes", url: "/admin/finance/credit-notes" },
      ].filter(Boolean) as NavSubItem[],
    },

    // COD Remittance Module
    (isSuper || caps.canViewCODModule || hasPerm(["cod.view", "cod_remittance.view", "remittance.view", "cod.remittance", "cod.logs", "cod.courier", "cod.seller_remittance", "seller_remittance.view"])) && {
      title: "COD Remittance",
      icon: Banknote,
      items: [
        (isSuper || hasPerm(["cod.view", "cod_remittance.view"])) && { title: "View Seller COD", url: "/admin/cod-remittance" },
        (isSuper || hasPerm(["cod.remittance", "remittance.view"])) && { title: "COD Remittance", url: "/admin/cod-remittance/remittance" },
        (isSuper || hasPerm(["cod.logs"])) && { title: "COD Remittance Logs", url: "/admin/cod-remittance/logs" },
        (isSuper || hasPerm(["cod.courier"])) && { title: "Courier COD Remittance", url: "/admin/cod-remittance/courier" },
        (isSuper || hasPerm(["cod.seller_remittance", "seller_remittance.view"])) && { title: "Seller Remittance", url: "/admin/cod-remittance/seller-remittance" },
      ].filter(Boolean) as NavSubItem[],
    },

    // Billing Module
    (isSuper || caps.canViewBillingModule || hasPerm(["billing.view", "billing.manage", "billing.seller_invoice", "billing.commission_invoice"])) && {
      title: "Billing",
      icon: ReceiptText,
      items: [
        (isSuper || hasPerm(["billing.seller_invoice", "billing.view"])) && { title: "Seller Invoice", url: "/admin/billing/seller-invoice" },
        (isSuper || hasPerm(["billing.commission_invoice", "billing.view", "billing.manage"])) && { title: "Commission Invoice", url: "/admin/billing/commission-invoice" },
      ].filter(Boolean) as NavSubItem[],
    },

    // Weight Reconciliation Module
    (isSuper || caps.canViewWeightRecoModule || hasPerm(["weightreco.view", "weight.reco", "weight.settlement", "weight.logs", "weight.disputes"])) && {
      title: "Weight Reconciliation",
      icon: Scale,
      items: [
        (isSuper || hasPerm(["weight.reco", "weightreco.view"])) && { title: "Weight Reconciliation", url: "/admin/weight-reconciliation" },
        (isSuper || hasPerm(["weight.settlement"])) && { title: "Settled Weight Reco", url: "/admin/weight-reconciliation/settled" },
        (isSuper || hasPerm(["weight.logs"])) && { title: "Weight Reco Logs", url: "/admin/weight-reconciliation/logs" },
        (isSuper || hasPerm(["weight.disputes", "weight_dispute.action.view", "weight_dispute.action.close"])) && { title: "Weight Dispute", url: "/admin/weight-reconciliation/disputes" },
      ].filter(Boolean) as NavSubItem[],
    },

    // Customer Support Module
    (isSuper || caps.canViewSupportModule || hasPerm(["support.view", "support.manage", "customer_support.view", "support"])) && {
      title: "Customer Support",
      icon: LifeBuoy,
      url: "/admin/support",
    },

    // Seller Feedback Module (website support-ticket form)
    (isSuper || hasPerm(["seller_feedback.view", "seller_feedback.export", "seller_feedback.resolve", "seller_feedback.close", "seller_feedback.escalate"])) && {
      title: "Seller Feedback",
      icon: MessageSquareText,
      url: "/admin/seller-feedback",
    },

    // Manage / Logistics Module
    (isSuper || caps.canViewManageModule || hasPerm(["manage.tracking_status", "manage.tracking", "courier.view", "courier.manage"])) && {
      title: "Manage",
      icon: ListChecks,
      items: [
        (isSuper || hasPerm(["manage.tracking_status", "manage.tracking"])) && { title: "Tracking Status", url: "/admin/manage/tracking-status" },
      ].filter(Boolean) as NavSubItem[],
    },

    // Theme & Stores Module
    (isSuper || caps.canViewThemeModule || hasPerm(["theme.manage", "theme.stores", "theme.themes", "stores.view", "inventory.dashboard", "inventory.list", "inventory.history"])) && {
      title: "Theme",
      icon: Palette,
      items: [
        (isSuper || hasPerm(["theme.stores", "stores.view"])) && { title: "Stores", url: "/admin/stores" },
        (isSuper || hasPerm(["theme.themes", "theme.manage"])) && { title: "Themes", url: "/admin/themes" },
        (isSuper || hasPerm(["inventory.dashboard"])) && { title: "Inventory Dashboard", url: "/admin/inventory/dashboard" },
        (isSuper || hasPerm(["inventory.list"])) && { title: "Inventory List", url: "/admin/inventory/list" },
        (isSuper || hasPerm(["inventory.history"])) && { title: "Inventory History", url: "/admin/inventory/history" },
      ].filter(Boolean) as NavSubItem[],
    },

    // Settings Module
    (isSuper || caps.canViewSettingsModule || hasPerm(["settings.view", "settings.manage", "settings.payment_gateway", "payment_gateway.view", "payment_gateway.manage"])) && {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ];

  return navItems.filter(Boolean) as NavGroupItem[];
}
const SIDEBAR_VISIBLE_TITLES: string[] = [
  "Dashboard",
  "Admin User",
  "CRM Management",
  "Finance",
  "COD Remittance",
  "Billing",
  "Weight Reconciliation",
  "Customer Support",
  "Seller Feedback",
  //"Manage",
  "Theme",
  // "Settings",
];

/** Nav items for the admin sidebar only (see SIDEBAR_VISIBLE_TITLES). */
export function buildAdminSidebarNavItems(user: any): NavGroupItem[] {
  return buildAdminNavItems(user).filter((item) =>
    SIDEBAR_VISIBLE_TITLES.includes(item.title)
  );
}
