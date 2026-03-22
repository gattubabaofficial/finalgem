import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null) return "₹0.00";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    IN_STOCK: "In Stock",
    IN_PROCESS: "In Process",
    READY: "Ready",
    PARTIALLY_SOLD: "Partially Sold",
    SOLD: "Sold",
    CLOSED: "Closed",
    RETURNED: "Returned",
    PENDING: "Pending",
    REJECTED: "Rejected",
    COMPLETED: "Completed"
  };
  return map[status] || status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    IN_STOCK: "success",
    IN_PROCESS: "warning",
    READY: "primary",
    PARTIALLY_SOLD: "info",
    SOLD: "secondary",
    CLOSED: "secondary",
    RETURNED: "danger",
    PENDING: "warning",
    REJECTED: "danger",
    COMPLETED: "success"
  };
  return map[status] || "secondary";
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    ROUGH: "Rough",
    SEMI_FINISHED: "Semi-Finished",
    FINISHED: "Finished",
    MEMO: "Memo"
  };
  return map[category] || category;
}

export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

