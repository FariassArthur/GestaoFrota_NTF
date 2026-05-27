import React from 'react';
import { getFileUrl, getItemValue } from '../api/client';

export default function EntityTable({ items, fields, onSelect, onDelete }) {
  const displayFields = fields.slice(0, 8);

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {displayFields.map((field) => (
              <th key={field.name}>{field.label}</th>
            ))}
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {items && items.length > 0 ? (
            items.map((item, idx) => (
              <tr key={idx}>
                {displayFields.map((field) => {
                  const val = getItemValue(item, field.name);
                  return (
                    <td key={field.name}>
                      {field.type === 'file' && val ? (
                        <a
                          href={getFileUrl(val)}
                          className="file-link"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📎 Visualizar
                        </a>
                      ) : (
                        String(val || '').substring(0, 30)
                      )}
                    </td>
                  );
                })}
                <td>
                  <button className="btn-edit" onClick={() => onSelect(item)} style={{ marginRight: 6 }}>
                    Editar
                  </button>
                  <button className="btn-delete" onClick={() => onDelete(item)}>
                    Deletar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="table-empty" colSpan={displayFields.length + 1}>
                Nenhum registro encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
