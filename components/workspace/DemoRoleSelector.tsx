"use client";

import { useEffect, useState } from "react";
import { demoRoleCookieName, demoRoleLabels, demoRoles, normalizeDemoRole, type DemoRole } from "@/lib/demo-roles";

export function DemoRoleSelector({ role, zh }: { role: DemoRole; zh: boolean }) {
  const [selectedRole, setSelectedRole] = useState<DemoRole>(role);

  useEffect(() => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${demoRoleCookieName}=([^;]+)`));
    const cookieRole = normalizeDemoRole(match ? decodeURIComponent(match[1]) : undefined);
    if (cookieRole) setSelectedRole(cookieRole);
  }, []);

  function updateRole(nextRole: DemoRole) {
    document.cookie = `${demoRoleCookieName}=${encodeURIComponent(nextRole)}; path=/; max-age=31536000`;
    setSelectedRole(nextRole);
    window.location.reload();
  }

  return (
    <label
      style={{
        display: "grid",
        gap: 6,
        fontSize: 12,
        fontWeight: 850,
        color: "#5f554d",
        minWidth: 210,
      }}
    >
      {zh ? "当前角色" : "Current role"}
      <select
        value={selectedRole}
        onChange={(event) => updateRole(event.target.value as DemoRole)}
        aria-label="Demo role selector"
        style={{
          minHeight: 40,
          borderRadius: 10,
          border: "1px solid rgba(17,24,39,0.14)",
          background: "#fffdfa",
          color: "#171411",
          fontWeight: 850,
          padding: "0 10px",
        }}
      >
        {demoRoles.map((item) => (
          <option key={item} value={item}>
            {zh ? demoRoleLabels[item].zh : demoRoleLabels[item].en}
          </option>
        ))}
      </select>
    </label>
  );
}
