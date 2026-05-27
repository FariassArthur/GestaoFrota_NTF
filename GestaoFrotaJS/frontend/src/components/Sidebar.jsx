import React from 'react';
import { MODULES } from '../modules/config';

export default function Sidebar({ currentKey, onModuleSelect }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {MODULES.map((module) => (
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
