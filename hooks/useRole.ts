import { useState, useEffect } from "react";

type Role = "ADMIN" | "STAFF" | "SUPERADMIN" | null;

let cachedRole: Role = undefined as any;
let fetchPromise: Promise<void> | null = null;

export function useRole() {
  const [role, setRole] = useState<Role>(cachedRole ?? null);

  useEffect(() => {
    if (cachedRole !== undefined) {
      setRole(cachedRole);
      return;
    }
    if (!fetchPromise) {
      fetchPromise = fetch("/api/auth/me")
        .then((r) => r.json())
        .then((d) => {
          cachedRole = d.role ?? null;
        })
        .catch(() => {
          cachedRole = null;
        });
    }
    fetchPromise.then(() => setRole(cachedRole));
  }, []);

  const isAdmin = role === "ADMIN" || role === "SUPERADMIN";
  const isStaff = role === "STAFF";

  return { role, isAdmin, isStaff };
}
