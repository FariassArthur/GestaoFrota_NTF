import React, { useEffect, useState, useMemo } from 'react';
import { fetchList } from '../api/client';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MODULE_ORDER = [
  'veiculos', 'cnhs', 'manutencoes', 'multas', 'abastecimentos',
  'contratos_seguro', 'pagamentos_seguro', 'pagamento_documentos',
  'mecanicas', 'seguradoras', 'combustiveis', 'tipo_manutencao'
];

const MODULE_LABELS = {
  veiculos: 'Veículos', cnhs: 'CNHs', manutencoes: 'Manutenções',
  multas: 'Multas', abastecimentos: 'Abastecimentos',
  contratos_seguro: 'Contratos Seguro', pagamentos_seguro: 'Pagamentos Seguro',
  pagamento_documentos: 'Pagamentos Documento', mecanicas: 'Mecânicas',
  seguradoras: 'Seguradoras', combustiveis: 'Combustíveis',
  tipo_manutencao: 'Tipos Manutenção',
};

const SENSITIVE_PREFIXES = ['password', 'path_'];

function formatCellValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
  const s = String(val);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s + 'T00:00:00');
    if (!isNaN(d)) return d.toLocaleDateString('pt-BR');
  }
  return s;
}

function sanitizeRows(rows) {
  return rows.map((r) => {
    const copy = { ...r };
    for (const key of Object.keys(copy)) {
      if (SENSITIVE_PREFIXES.some((p) => key === p || key.startsWith(p))) {
        delete copy[key];
      }
    }
    return copy;
  });
}

function formatHeader(key) {
  return key
    .replace(/^id$/i, 'ID')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace(/\bId\b/g, 'ID')
    .replace(/\bPdf\b/g, 'PDF')
    .replace(/\bCpf\b/g, 'CPF')
    .replace(/\bCnpj\b/g, 'CNPJ')
    .replace(/\bKm\b/g, 'KM')
    .replace(/\bCep\b/g, 'CEP')
    .replace(/\bUf\b/g, 'UF')
    .replace(/\bIpva\b/g, 'IPVA');
}

export default function Dashboard({ token }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(null);
  const [search, setSearch] = useState('');

  const tabs = useMemo(() => {
    return MODULE_ORDER
      .filter((k) => data[k] && data[k].columns && data[k].columns.length > 0)
      .map((k) => ({ key: k, ...data[k] }));
  }, [data]);

  useEffect(() => {
    if (tabs.length > 0 && !activeTab) setActiveTab(tabs[0].key);
  }, [tabs]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchList('/api/dashboard', token);
      setData(result);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally { setLoading(false); }
  };

  const activeSection = tabs.find((t) => t.key === activeTab);
  const displayCols = useMemo(() => {
    if (!activeSection) return [];
    return activeSection.columns.filter((c) => !SENSITIVE_PREFIXES.some((p) => c === p || c.startsWith(p)));
  }, [activeSection]);

  const filteredRows = useMemo(() => {
    if (!activeSection || !search) return activeSection?.rows || [];
    const q = search.toLowerCase();
    return activeSection.rows.filter((row) =>
      displayCols.some((col) => String(row[col] ?? '').toLowerCase().includes(q))
    );
  }, [activeSection, search, displayCols]);

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    for (const tab of tabs) {
      const rows = sanitizeRows(tab.rows);
      const ws = XLSX.utils.json_to_sheet(rows);
      const colWidths = (tab.columns || []).map((c) => {
        const maxLen = Math.max(
          c.length,
          ...rows.map((r) => String(r[c] ?? '').length)
        );
        return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
      });
      ws['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(wb, ws, tab.label || tab.key);
    }
    XLSX.writeFile(wb, 'gestao_frota_completo.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    let first = true;
    for (const tab of tabs) {
      const rows = sanitizeRows(tab.rows);
      const cols = tab.columns.filter((c) => !SENSITIVE_PREFIXES.some((p) => c === p || c.startsWith(p)));
      const headers = cols.map(formatHeader);
      const body = rows.map((r) => cols.map((c) => formatCellValue(r[c])));

      if (!first) doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(255, 127, 30);
      doc.text(tab.label || tab.key, 14, 18);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.text(`Total: ${tab.count} registro(s)`, 14, 23);
      doc.autoTable({
        head: [headers],
        body,
        startY: 27,
        styles: { fontSize: 6.5, cellPadding: 1.2 },
        headStyles: { fillColor: [255, 127, 30], fontSize: 7, halign: 'center' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 30, left: 10, right: 10 },
        tableWidth: 'auto',
      });
      first = false;
    }
    doc.save('gestao_frota_completo.pdf');
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header"><h2>Dashboard</h2></div>
        <p className="dashboard-loading">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard — Planilha Geral</h2>
        <div className="dashboard-export-buttons">
          <button className="btn btn-primary" onClick={exportExcel}>
            ⬇ Excel (.xlsx)
          </button>
          <button className="btn btn-primary" onClick={exportPDF}>
            ⬇ PDF
          </button>
        </div>
      </div>

      {error && <div className="module-error">{error}</div>}

      <div className="stats-grid">
        {tabs.map((t) => (
          <div key={t.key} className="stat-card">
            <h3>{t.count}</h3>
            <p>{t.label}</p>
          </div>
        ))}
      </div>

      <div className="spreadsheet-container">
        <div className="sheet-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`sheet-tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              <span className="sheet-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="sheet-toolbar">
          <input
            className="sheet-search"
            type="text"
            placeholder="Pesquisar nesta planilha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="sheet-info">
            {filteredRows.length} de {activeSection?.count || 0} registro(s)
            {search && ` — filtrado`}
          </span>
        </div>

        {activeSection && (
          <div className="sheet-table-wrapper">
            <table className="sheet-table">
              <thead>
                <tr>
                  <th className="row-num">#</th>
                  {displayCols.map((col) => (
                    <th key={col}>{formatHeader(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr><td colSpan={displayCols.length + 1} className="sheet-empty">Nenhum registro encontrado</td></tr>
                ) : filteredRows.map((row, i) => (
                  <tr key={i}>
                    <td className="row-num">{i + 1}</td>
                    {displayCols.map((col) => (
                      <td key={col}>{formatCellValue(row[col])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
