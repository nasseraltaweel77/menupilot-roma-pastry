export type AdminRole = "admin" | "accountant";

export const adminRouteAccess: Record<AdminRole, string[]> = {
  admin: ["/admin/dashboard", "/admin/categories", "/admin/items", "/admin/orders", "/admin/accounting"],
  accountant: ["/admin/accounting"],
};

export function canAccessAdminRoute(role: AdminRole, pathname: string) {
  return adminRouteAccess[role].some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function defaultRouteForRole(role: AdminRole) {
  return role === "accountant" ? "/admin/accounting" : "/admin/dashboard";
}
