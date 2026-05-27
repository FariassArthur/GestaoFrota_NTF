import React, { useEffect, useMemo, useState } from 'react';

const MODULES = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Painel de controle inicial com status da API e navegação entre módulos.',
    endpoint: null,
    keyField: null,
    fields: []
  },
  {
    key: 'veiculos',
    label: 'Veículos',
    endpoint: '/api/veiculos',
    keyField: 'placa',
    fields: [
      { name: 'placa', label: 'Placa', type: 'text', required: true },
      { name: 'tipo', label: 'Tipo' },
      { name: 'fipeNameMarca', label: 'Marca FIPE' },
      { name: 'fipeModelo', label: 'Modelo FIPE' },
      { name: 'fipeNameAno', label: 'Ano FIPE' },
      { name: 'renavam', label: 'Renavam' },
      { name: 'chassi', label: 'Chassi' },
      { name: 'combustivel', label: 'Combustível', type: 'number' },
      { name: 'anoFab', label: 'Ano Fabricação' },
      { name: 'anoModelo', label: 'Ano Modelo' },
      { name: 'capacidade', label: 'Capacidade' },
      { name: 'cor', label: 'Cor' },
      { name: 'cidade', label: 'Cidade' },
      { name: 'uf', label: 'UF' },
      { name: 'cpfcnpj', label: 'CPF/CNPJ' },
      { name: 'categoria', label: 'Categoria' },
      { name: 'km', label: 'KM', type: 'number' },
      { name: 'nomeEndereco', label: 'Endereço' },
      { name: 'dataAquisicao', label: 'Data Aquisição', type: 'date' },
      { name: 'observacao', label: 'Observação', type: 'textarea' },
      { name: 'potencia', label: 'Potência' },
      { name: 'cultureInfo', label: 'Culture Info' },
      { name: 'medidasPneus', label: 'Medidas Pneus' },
      { name: 'codigoPostal', label: 'CEP' },
      { name: 'pathDocumentoPDF', label: 'Arquivo PDF', type: 'file' },
      { name: 'dataVencimentoIPVA', label: 'Vencimento IPVA', type: 'date' },
      { name: 'ativo', label: 'Ativo', type: 'checkbox' }
    ]
  },
  {
    key: 'cnhs',
    label: 'CNHs',
    endpoint: '/api/cnhs',
    keyField: 'numero_registro',
    fields: [
      { name: 'numero_registro', label: 'Número Registro', required: true },
      { name: 'nome', label: 'Nome' },
      { name: 'nascimento', label: 'Nascimento', type: 'date' },
      { name: 'categoria', label: 'Categoria' },
      { name: 'cpf', label: 'CPF' },
      { name: 'filiacao', label: 'Filiação' },
      { name: 'primeira_habilitacao', label: 'Primeira Habilitação', type: 'date' },
      { name: 'emissao', label: 'Emissão', type: 'date' },
      { name: 'validade', label: 'Validade', type: 'date' },
      { name: 'local', label: 'Local' },
      { name: 'path_documento_pdf', label: 'Arquivo CNH', type: 'file' },
      { name: 'aivo', label: 'Ativo', type: 'checkbox' }
    ]
  },
  {
    key: 'mecanicas',
    label: 'Mecânicas',
    endpoint: '/api/mecanicas',
    keyField: 'id',
    fields: [
      { name: 'nome', label: 'Nome' },
      { name: 'endereco', label: 'Endereço' },
      { name: 'numero', label: 'Número' },
      { name: 'complemento', label: 'Complemento' },
      { name: 'cep', label: 'CEP' },
      { name: 'bairro', label: 'Bairro' },
      { name: 'cidade', label: 'Cidade' },
      { name: 'uf', label: 'UF' },
      { name: 'site', label: 'Site' },
      { name: 'email', label: 'Email' },
      { name: 'telefone1', label: 'Telefone 1' },
      { name: 'telefone2', label: 'Telefone 2' },
      { name: 'celular1', label: 'Celular 1' },
      { name: 'celular1_operadora', label: 'Operadora 1' },
      { name: 'celular2', label: 'Celular 2' },
      { name: 'celular2_operadora', label: 'Operadora 2' },
      { name: 'contatos', label: 'Contatos' },
      { name: 'observacao', label: 'Observação', type: 'textarea' }
    ]
  },
  {
    key: 'manutencoes',
    label: 'Manutenções',
    endpoint: '/api/manutencoes',
    keyField: 'id',
    fields: [
      { name: 'data', label: 'Data', type: 'date' },
      { name: 'data_s', label: 'Data Texto' },
      { name: 'valor', label: 'Valor', type: 'number' },
      { name: 'descricao', label: 'Descrição', type: 'textarea' },
      { name: 'km', label: 'KM', type: 'number' },
      { name: 'path_comprovante_pdf', label: 'Comprovante PDF', type: 'file' },
      { name: 'veiculo_id', label: 'Placa do Veículo' },
      { name: 'mecanica_id', label: 'ID Mecânica', type: 'number' },
      { name: 'tipo_manutencao_id', label: 'Tipo Manutenção ID', type: 'number' }
    ]
  },
  {
    key: 'multas',
    label: 'Multas',
    endpoint: '/api/multas',
    keyField: 'id',
    fields: [
      { name: 'data_ocorrencia', label: 'Data Ocorrência', type: 'date' },
      { name: 'data_ocorrencia_s', label: 'Data Ocorrência Texto' },
      { name: 'local_ocorrencia', label: 'Local' },
      { name: 'data_vencimento', label: 'Data Vencimento', type: 'date' },
      { name: 'data_vencimento_s', label: 'Data Vencimento Texto' },
      { name: 'data_pagamento', label: 'Data Pagamento', type: 'date' },
      { name: 'data_pagamento_s', label: 'Data Pagamento Texto' },
      { name: 'valor', label: 'Valor', type: 'number' },
      { name: 'path_anexo_multa_pdf', label: 'Anexo Multa', type: 'file' },
      { name: 'pagamento_realizado', label: 'Pagamento Realizado', type: 'checkbox' },
      { name: 'veiculo_id', label: 'Placa do Veículo' }
    ]
  },
  {
    key: 'seguradoras',
    label: 'Seguradoras',
    endpoint: '/api/seguradoras',
    keyField: 'id',
    fields: [
      { name: 'nome', label: 'Nome' },
      { name: 'corretor', label: 'Corretor' },
      { name: 'endereco', label: 'Endereço' },
      { name: 'numero', label: 'Número' },
      { name: 'complemento', label: 'Complemento' },
      { name: 'cep', label: 'CEP' },
      { name: 'bairro', label: 'Bairro' },
      { name: 'cidade', label: 'Cidade' },
      { name: 'uf', label: 'UF' },
      { name: 'site', label: 'Site' },
      { name: 'email', label: 'Email' },
      { name: 'telefone1', label: 'Telefone 1' },
      { name: 'telefone2', label: 'Telefone 2' },
      { name: 'celular1', label: 'Celular 1' },
      { name: 'celular1_operadora', label: 'Operadora 1' },
      { name: 'celular2', label: 'Celular 2' },
      { name: 'celular2_operadora', label: 'Operadora 2' },
      { name: 'contatos', label: 'Contatos' }
    ]
  },
  {
    key: 'contratos-seguro',
    label: 'Contratos Seguro',
    endpoint: '/api/contratos-seguro',
    keyField: 'id',
    fields: [
      { name: 'numero_apolice', label: 'Número Apólice' },
      { name: 'data_inicial_contrato', label: 'Início', type: 'date' },
      { name: 'data_final_contrato', label: 'Fim', type: 'date' },
      { name: 'ativo', label: 'Ativo', type: 'checkbox' },
      { name: 'path_orcamento_pdf', label: 'Orçamento PDF', type: 'file' },
      { name: 'path_contrato_pdf', label: 'Contrato PDF', type: 'file' },
      { name: 'path_cartao_pdf', label: 'Cartão PDF', type: 'file' },
      { name: 'seguradora_id', label: 'Seguradora ID', type: 'number' },
      { name: 'veiculo_id', label: 'Placa do Veículo' }
    ]
  },
  {
    key: 'pagamentos-seguro',
    label: 'Pagamentos Seguro',
    endpoint: '/api/pagamentos-seguro',
    keyField: 'id',
    fields: [
      { name: 'data_pagamento', label: 'Data Pagamento', type: 'date' },
      { name: 'valor', label: 'Valor', type: 'number' },
      { name: 'path_pagamento_pdf', label: 'Comprovante PDF', type: 'file' },
      { name: 'contrato_seguro_id', label: 'Contrato Seguro ID', type: 'number' },
      { name: 'veiculo_id', label: 'Placa do Veículo' }
    ]
  },
  {
    key: 'pagamento-documentos',
    label: 'Pagamentos Documento',
    endpoint: '/api/pagamento-documentos',
    keyField: 'id',
    fields: [
      { name: 'data_pagamento', label: 'Data Pagamento', type: 'date' },
      { name: 'data_pagamento_s', label: 'Data Pagamento Texto' },
      { name: 'data_vencimento', label: 'Data Vencimento', type: 'date' },
      { name: 'data_vencimento_s', label: 'Data Vencimento Texto' },
      { name: 'valor', label: 'Valor', type: 'number' },
      { name: 'descricao', label: 'Descrição', type: 'textarea' },
      { name: 'veiculo_id', label: 'Placa do Veículo' }
    ]
  },
  {
    key: 'configuracoes',
    label: 'Configurações',
    endpoint: '/api/configuracoes',
    keyField: null,
    fields: [
      { name: 'codPais', label: 'País' },
      { name: 'idioma', label: 'Idioma' },
      { name: 'cultureInfo', label: 'Culture Info' }
    ]
  },
  {
    key: 'versao',
    label: 'Versão',
    endpoint: '/api/versao',
    keyField: null,
    fields: []
  }
];

const apiBase = window.location.protocol === 'file:' ? 'http://localhost:3001' : '';

const getByKey = (key) => MODULES.find((item) => item.key === key) || MODULES[0];

const createItem = (fields) => {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.type === 'checkbox' ? false : '';
    return acc;
  }, {});
};

function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [veiculoTab, setVeiculoTab] = useState('geral');
  const [items, setItems] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [formData, setFormData] = useState({});
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const module = useMemo(() => getByKey(activeModule), [activeModule]);

  useEffect(() => {
    fetch(`${apiBase}/api/health`)
      .then((response) => response.json())
      .then((data) => setHealth(data))
      .catch((err) => setError(String(err.message || err)));
  }, []);

  useEffect(() => {
    if (!module.endpoint || module.keyField === null && module.key === 'dashboard') {
      setItems([]);
      setFormData(createItem(module.fields));
      setSelectedKey(null);
      return;
    }

    setLoading(true);
    fetch(`${apiBase}${module.endpoint}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setFormData(createItem(module.fields));
        setSelectedKey(null);
      })
      .catch((err) => setError(String(err.message || err)))
      .finally(() => setLoading(false));
  }, [module.endpoint, module.fields, module.key, activeModule]);

  const selectItem = (item) => {
    setSelectedKey(item[module.keyField]);
    setFormData(
      module.fields.reduce((form, field) => {
        form[field.name] = item[field.name] ?? (field.type === 'checkbox' ? false : '');
        return form;
      }, {})
    );
    setMessage(null);
  };

  const handleFieldChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const clearForm = () => {
    setSelectedKey(null);
    setFormData(createItem(module.fields));
    setMessage(null);
  };

  const formControlClass = 'mt-2 block w-full rounded-[1rem] border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200';

  const buildRequest = () => {
    const form = new FormData();
    let hasFile = false;

    Object.entries(formData).forEach(([key, value]) => {
      if (value instanceof File) {
        hasFile = true;
        form.append(key, value);
      } else if (typeof value === 'boolean') {
        form.append(key, String(value));
      } else if (value !== undefined && value !== null) {
        form.append(key, value);
      }
    });

    if (hasFile) {
      return { body: form, headers: {} };
    }

    return { body: JSON.stringify(formData), headers: { 'Content-Type': 'application/json' } };
  };

  const save = () => {
    if (!module.endpoint) return;

    const { body, headers } = buildRequest();
    const method = selectedKey ? 'PUT' : 'POST';
    const url = selectedKey ? `${apiBase}${module.endpoint}/${selectedKey}` : `${apiBase}${module.endpoint}`;

    setLoading(true);
    fetch(url, { method, body, headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setMessage(`${module.label} salvo com sucesso.`);
        setSelectedKey(null);
        setFormData(createItem(module.fields));
          return fetch(`${apiBase}${module.endpoint}`);
      })
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setError(String(err.message || err)))
      .finally(() => setLoading(false));
  };

  const remove = () => {
    if (!selectedKey || !module.endpoint) return;
    setLoading(true);
    fetch(`${apiBase}${module.endpoint}/${selectedKey}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setMessage(`${module.label} excluído com sucesso.`);
        setSelectedKey(null);
        setFormData(createItem(module.fields));
          return fetch(`${apiBase}${module.endpoint}`);
      })
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setError(String(err.message || err)))
      .finally(() => setLoading(false));
  };

  const renderField = (field) => {
    const value = formData[field.name];
    const commonProps = {
      id: field.name,
      value: value === null || value === undefined ? '' : value,
      onChange: (event) => {
        if (field.type === 'checkbox') {
          handleFieldChange(field.name, event.target.checked);
        } else if (field.type === 'file') {
          handleFieldChange(field.name, event.target.files[0]);
        } else {
          handleFieldChange(field.name, event.target.value);
        }
      }
    };

    if (field.type === 'textarea') {
      return <textarea {...commonProps} rows={4} className={formControlClass} />;
    }

    if (field.type === 'checkbox') {
      return <input type="checkbox" checked={Boolean(value)} {...commonProps} className="h-4 w-4 text-orange-500" />;
    }

    if (field.type === 'file') {
      return <input type="file" onChange={(event) => handleFieldChange(field.name, event.target.files[0])} className="mt-2 block w-full text-sm text-slate-700" />;
    }

    return <input type={field.type || 'text'} {...commonProps} className={formControlClass} />;
  };

  const renderDashboard = () => (
    <div className="card">
      <h2>Gestão de Frota WEB</h2>
      <p>Versão do backend: {health?.version || 'não disponível'}</p>
      <p>Base de dados: {health?.db || 'não disponível'}</p>
      <p>Uploads: {health?.uploadsBase || 'não disponível'}</p>
      <p>
        Este painel mostra os módulos portados do projeto C# para JS. Selecione um menu para criar,
        editar e excluir registros.
      </p>
      <div>
        <strong>Endpoints disponíveis:</strong>
        <ul>
          <li>GET /api/veiculos</li>
          <li>GET /api/abastecimentos</li>
          <li>GET /api/cnhs</li>
          <li>GET /api/mecanicas</li>
          <li>GET /api/manutencoes</li>
          <li>GET /api/multas</li>
          <li>GET /api/seguradoras</li>
          <li>GET /api/contratos-seguro</li>
          <li>GET /api/pagamentos-seguro</li>
          <li>GET /api/pagamento-documentos</li>
          <li>GET /api/combustiveis</li>
          <li>GET /api/tipos-manutencao</li>
          <li>GET /api/configuracoes</li>
          <li>GET /api/versao</li>
        </ul>
      </div>
    </div>
  );

  const renderTable = () => {
    if (!items.length) {
      return <p>Não há registros para este módulo.</p>;
    }

    const headers = Object.keys(items[0]).slice(0, 8);
    return (
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item[module.keyField] || JSON.stringify(item)}
              style={{ cursor: 'pointer', background: item[module.keyField] === selectedKey ? '#eef4ff' : 'transparent' }}
              onClick={() => selectItem(item)}
            >
              {headers.map((header) => (
                <td key={header}>{String(item[header] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderVeiculosLayout = () => {
    const tabs = [
      { key: 'geral', label: 'Geral', fields: ['placa','tipo','fipeNameMarca','fipeModelo','fipeNameAno','renavam','chassi','combustivel','anoFab','anoModelo','capacidade','cor','cidade','uf','cpfcnpj','categoria','nomeEndereco'] },
      { key: 'tecnico', label: 'Técnico', fields: ['km','potencia','medidasPneus','codigoPostal','dataAquisicao','dataVencimentoIPVA','ativo'] },
      { key: 'documentos', label: 'Documentos', fields: ['pathDocumentoPDF','observacao','cultureInfo'] }
    ];

    const currentTab = tabs.find(t => t.key === veiculoTab) || tabs[0];

    return (
      <div className="card entity-vehicle space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 rounded-2xl bg-orange-50 p-3">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${t.key === veiculoTab ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-200/50' : 'bg-white text-slate-700 ring-1 ring-orange-100 hover:bg-orange-50'}`}
                onClick={() => setVeiculoTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {currentTab.fields.map((fname) => {
              const field = module.fields.find((f) => f.name === fname);
              if (!field) return null;
              return (
                <label key={field.name} htmlFor={field.name} className="space-y-2 text-sm text-slate-800">
                  <span className="font-semibold">{field.label}{field.required ? ' *' : ''}</span>
                  {renderField(field)}
                </label>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/50 transition hover:bg-orange-600" onClick={clearForm}>+ Adicionar</button>
            {selectedKey && <button type="button" className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600" onClick={remove}>Excluir</button>}
            <button type="button" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800" onClick={save}>{selectedKey ? 'Atualizar' : 'Salvar'}</button>
          </div>
        </div>

        <div className="vehicle-list-wrapper rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <h3 className="text-lg font-semibold text-slate-900">Lista de Veículos</h3>
          {renderTable()}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="flex flex-col gap-3 rounded-[1.5rem] bg-gradient-to-r from-[#ff7f1e] to-[#ffa22e] p-6 text-white shadow-[0_20px_40px_rgba(255,127,30,0.18)] sm:flex-row sm:items-center sm:justify-between">
        <div className="text-2xl font-extrabold tracking-[0.12em]">NETFACIL</div>
        <div className="text-sm opacity-95">Gestão de Frota - Web e Desktop • v1.0 Beta</div>
      </header>

      <div className="layout flex flex-col gap-5 lg:flex-row lg:items-start">
        <aside className="sidebar w-full lg:w-64 flex-shrink-0 flex flex-col gap-3">
          <div className="flex justify-center">
            <button className="rounded-2xl bg-orange-100 px-4 py-3 text-sm font-semibold text-orange-700 ring-1 ring-orange-200 transition hover:bg-orange-200" onClick={() => setActiveModule('veiculos')}>+ Adicionar Veículo</button>
          </div>

          <div className="treebox card">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Menu</h4>
            <ul className="space-y-2">
              {MODULES.filter((m) => m.key !== 'dashboard').map((m) => (
                <li
                  key={m.key}
                  className={`cursor-pointer rounded-2xl px-3 py-2 text-sm transition ${m.key === activeModule ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-slate-700 hover:bg-orange-50'}`}
                  onClick={() => setActiveModule(m.key)}
                >
                  {m.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="notices card">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Avisos</h4>
            <ul className="text-sm text-slate-700">
              <li>Nenhum aviso novo</li>
            </ul>
          </div>

          <div className="sidebar-icons flex justify-center gap-3">
            <button title="Documentos" onClick={() => setActiveModule('pagamento-documentos')} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-lg transition hover:bg-slate-50">📄</button>
            <button title="Suporte" onClick={() => window.open('mailto:noc@netfacilbandalarga.com.br')} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-lg transition hover:bg-slate-50">💬</button>
            <button title="Segurança" onClick={() => alert('Segurança')} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-lg transition hover:bg-slate-50">🔒</button>
          </div>
        </aside>

        <main className="main-content flex-1">
          <nav className="module-nav mb-4 flex flex-wrap gap-2">
            {MODULES.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${item.key === activeModule ? 'bg-orange-500 text-white shadow-lg shadow-orange-200/50' : 'bg-white text-slate-700 ring-1 ring-orange-100 hover:bg-orange-50'}`}
                onClick={() => setActiveModule(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {error && <div className="alert bg-orange-50 border-orange-200 text-orange-900">Erro: {error}</div>}
          {message && <div className="card bg-white border-orange-100 text-slate-900"><strong>{message}</strong></div>}

          {activeModule === 'dashboard' ? (
            renderDashboard()
          ) : module.key === 'veiculos' ? (
            renderVeiculosLayout()
          ) : (
            <div className="card space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">{module.label}</h2>
              {module.fields.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="rounded-2xl bg-orange-100 px-5 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-200" onClick={clearForm}>+ Adicionar</button>
                  {selectedKey && (
                    <button type="button" className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600" onClick={remove}>Excluir</button>
                  )}
                  <button type="button" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800" onClick={save}>{selectedKey ? 'Atualizar' : 'Salvar'}</button>
                </div>
              )}

              {loading && <p className="text-sm text-slate-600">Carregando...</p>}

              {module.fields.length > 0 && (
                <div className="form-grid mt-4 grid gap-6 sm:grid-cols-2">
                  {module.fields.map((field) => (
                    <label key={field.name} htmlFor={field.name} className="space-y-2 text-sm text-slate-800">
                      <span className="font-semibold">{field.label}{field.required ? ' *' : ''}</span>
                      {renderField(field)}
                    </label>
                  ))}
                </div>
              )}

              {module.endpoint && <div className="mt-6">{renderTable()}</div>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
