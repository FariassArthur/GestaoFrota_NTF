import React from 'react';
import { MODULES } from '../modules/config';

function canViewModule(moduleKey, user) {
  if (!user || user.role === 'root') return true;
  if (!user.permissoes) return true;
  if (user.permissoes === 'all') return true;
  try {
    const perms = typeof user.permissoes === 'string' ? JSON.parse(user.permissoes) : user.permissoes;
    return Array.isArray(perms) && perms.includes(moduleKey);
  } catch (_) {
    return true;
  }
}

export default function Sidebar({ currentKey, onModuleSelect, user }) {
  const visibleModules = MODULES.filter((m) => canViewModule(m.key, user));
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {visibleModules.map((module) => (
          <button
            key={module.key}
            className={`sidebar-btn${currentKey === module.key ? ' active' : ''}`}
            onClick={() => onModuleSelect(module.key)}
          >
            {module.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
