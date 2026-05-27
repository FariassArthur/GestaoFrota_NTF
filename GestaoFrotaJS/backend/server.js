const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'gestaofrota.sqlite');
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_BASE = process.env.UPLOADS_BASE || path.join(PUBLIC_DIR, 'uploads');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_BASE, { recursive: true });

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/files', express.static(PUBLIC_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const moduleName = req.body?.module ? String(req.body.module) : 'uploads';
    const dest = path.join(UPLOADS_BASE, moduleName);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const original = file.originalname.replace(/[^a-z0-9\.\-_]/gi, '_');
    const ts = new Date().toISOString().replace(/[:]/g, '-');
    cb(null, `${ts}_${original}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    return upload.any()(req, res, next);
  }
  return next();
});

function openDb() {
  return new sqlite3.Database(DB_PATH);
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function parseBoolean(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
}

function parseInteger(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function filePathFor(fieldName, req) {
  if (!req.files || !Array.isArray(req.files)) return null;
  const file = req.files.find((item) => item.fieldname === fieldName);
  return file ? path.relative(process.cwd(), file.path) : null;
}

async function seedIfMissing(db, sql, params = []) {
  try {
    await run(db, sql, params);
  } catch (error) {
    console.warn('Seed skip or error', error.message || error);
  }
}

async function initDb() {
  const db = openDb();

  await run(db, `
    CREATE TABLE IF NOT EXISTS combustiveis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL UNIQUE
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS veiculos (
      placa TEXT PRIMARY KEY,
      tipo TEXT,
      fipe_name_marca TEXT,
      fipe_modelo TEXT,
      fipe_name_ano TEXT,
      renavam TEXT,
      chassi TEXT,
      combustivel INTEGER,
      ano_fab TEXT,
      ano_modelo TEXT,
      capacidade TEXT,
      cor TEXT,
      cidade TEXT,
      uf TEXT,
      cpfcnpj TEXT,
      categoria TEXT,
      km INTEGER,
      nome_endereco TEXT,
      data_aquisicao TEXT,
      observacao TEXT,
      potencia TEXT,
      culture_info TEXT,
      medidas_pneus TEXT,
      codigo_postal TEXT,
      path_documento_pdf TEXT,
      data_vencimento_ipva TEXT,
      ativo INTEGER
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS cnhs (
      numero_registro TEXT PRIMARY KEY,
      nome TEXT,
      nascimento TEXT,
      categoria TEXT,
      cpf TEXT,
      filiacao TEXT,
      primeira_habilitacao TEXT,
      emissao TEXT,
      validade TEXT,
      local TEXT,
      path_documento_pdf TEXT,
      aivo INTEGER
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS mecanicas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      endereco TEXT,
      numero TEXT,
      complemento TEXT,
      cep TEXT,
      bairro TEXT,
      cidade TEXT,
      uf TEXT,
      site TEXT,
      email TEXT,
      telefone1 TEXT,
      telefone2 TEXT,
      celular1 TEXT,
      celular1_operadora TEXT,
      celular2 TEXT,
      celular2_operadora TEXT,
      contatos TEXT,
      observacao TEXT
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS tipo_manutencao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS manutencoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT,
      data_s TEXT,
      valor REAL,
      descricao TEXT,
      km INTEGER,
      path_comprovante_pdf TEXT,
      veiculo_id TEXT,
      mecanica_id INTEGER,
      tipo_manutencao_id INTEGER,
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(placa) ON DELETE CASCADE,
      FOREIGN KEY (mecanica_id) REFERENCES mecanicas(id) ON DELETE SET NULL,
      FOREIGN KEY (tipo_manutencao_id) REFERENCES tipo_manutencao(id) ON DELETE SET NULL
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS multas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_ocorrencia TEXT,
      data_ocorrencia_s TEXT,
      local_ocorrencia TEXT,
      data_vencimento TEXT,
      data_vencimento_s TEXT,
      data_pagamento TEXT,
      data_pagamento_s TEXT,
      valor REAL,
      path_anexo_multa_pdf TEXT,
      pagamento_realizado INTEGER,
      veiculo_id TEXT,
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(placa) ON DELETE CASCADE
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS seguradoras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      corretor TEXT,
      endereco TEXT,
      numero TEXT,
      complemento TEXT,
      cep TEXT,
      bairro TEXT,
      cidade TEXT,
      uf TEXT,
      site TEXT,
      email TEXT,
      telefone1 TEXT,
      telefone2 TEXT,
      celular1 TEXT,
      celular1_operadora TEXT,
      celular2 TEXT,
      celular2_operadora TEXT,
      contatos TEXT
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS contratos_seguro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_apolice TEXT,
      data_inicial_contrato TEXT,
      data_final_contrato TEXT,
      ativo INTEGER,
      path_orcamento_pdf TEXT,
      path_contrato_pdf TEXT,
      path_cartao_pdf TEXT,
      seguradora_id INTEGER,
      veiculo_id TEXT,
      FOREIGN KEY (seguradora_id) REFERENCES seguradoras(id) ON DELETE SET NULL,
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(placa) ON DELETE CASCADE
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS pagamentos_seguro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_pagamento TEXT,
      valor REAL,
      path_pagamento_pdf TEXT,
      contrato_seguro_id INTEGER,
      veiculo_id TEXT,
      FOREIGN KEY (contrato_seguro_id) REFERENCES contratos_seguro(id) ON DELETE CASCADE,
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(placa) ON DELETE CASCADE
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS pagamento_documentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_pagamento TEXT,
      data_pagamento_s TEXT,
      data_vencimento TEXT,
      data_vencimento_s TEXT,
      valor REAL,
      descricao TEXT,
      veiculo_id TEXT,
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(placa) ON DELETE CASCADE
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS abastecimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quantidade REAL,
      combustivel_id INTEGER,
      valor REAL,
      km INTEGER,
      path_comprovante_pdf TEXT,
      data TEXT,
      data_s TEXT,
      veiculo_id TEXT,
      FOREIGN KEY (combustivel_id) REFERENCES combustiveis(id) ON DELETE SET NULL,
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(placa) ON DELETE CASCADE
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS versoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS configuracoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cod_pais TEXT NOT NULL,
      idioma TEXT NOT NULL,
      culture_info TEXT NOT NULL
    )
  `);

  await seedIfMissing(db, `INSERT OR IGNORE INTO combustiveis (tipo) VALUES (?), (?), (?), (?), (?), (?), (?), (?), (?), (?)`, [
    'Não definido',
    'Gasolina',
    'Alcool',
    'Flex',
    'GNV',
    'Gasolina/GNV',
    'Flex/GNV',
    'Diesel',
    'Tri-Combustivel',
    'Diesel/GNV'
  ]);

  await seedIfMissing(db, `INSERT OR IGNORE INTO tipo_manutencao (descricao) VALUES (?), (?), (?), (?)`, [
    'Revisão',
    'Troca de óleo',
    'Pneus',
    'Freios'
  ]);

  await seedIfMissing(db, `INSERT OR IGNORE INTO configuracoes (id, cod_pais, idioma, culture_info) VALUES (1, ?, ?, ?)`, [
    'BR',
    'pt-BR',
    'pt-BR'
  ]);

  await run(db, `INSERT OR IGNORE INTO versoes (id, version) VALUES (1, ?);`, [
    process.env.npm_package_version || '1.0.0'
  ]);

  db.close();
}

async function sendJson(res, promise) {
  try {
    const result = await promise;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: String(error.message || error) });
  }
}

function normalizeRecord(record) {
  if (!record || typeof record !== 'object') return record;
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (typeof value === 'number' && Number.isInteger(value)) {
        return [key, value];
      }
      return [key, value];
    })
  );
}

app.get('/api/health', async (req, res) => {
  res.json({
    ok: true,
    db: path.basename(DB_PATH),
    uploadsBase: path.relative(process.cwd(), UPLOADS_BASE),
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.get('/api/combustiveis', async (req, res) => {
  const db = openDb();
  try {
    const rows = await all(db, 'SELECT * FROM combustiveis ORDER BY id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: String(error.message || error) });
  } finally {
    db.close();
  }
});

app.get('/api/tipos-manutencao', async (req, res) => {
  const db = openDb();
  try {
    const rows = await all(db, 'SELECT * FROM tipo_manutencao ORDER BY id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: String(error.message || error) });
  } finally {
    db.close();
  }
});

app.get('/api/configuracoes', async (req, res) => {
  const db = openDb();
  try {
    const config = await get(db, 'SELECT * FROM configuracoes WHERE id = 1');
    res.json(config || {});
  } catch (error) {
    res.status(500).json({ error: String(error.message || error) });
  } finally {
    db.close();
  }
});

const upsertConfiguracoes = async (req, res) => {
  const db = openDb();
  const { codPais, idioma, cultureInfo } = req.body || {};
  try {
    if (!codPais || !idioma || !cultureInfo) {
      return res.status(400).json({ error: 'codPais, idioma e cultureInfo são obrigatórios' });
    }
    await run(
      db,
      `INSERT INTO configuracoes (id, cod_pais, idioma, culture_info)
       VALUES (1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET cod_pais = excluded.cod_pais, idioma = excluded.idioma, culture_info = excluded.culture_info`,
      [codPais, idioma, cultureInfo]
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error.message || error) });
  } finally {
    db.close();
  }
};

app.post('/api/configuracoes', upsertConfiguracoes);
app.put('/api/configuracoes', upsertConfiguracoes);


app.get('/api/versao', async (req, res) => {
  const db = openDb();
  try {
    const row = await get(db, 'SELECT * FROM versoes WHERE id = 1');
    res.json(row || { version: process.env.npm_package_version || '1.0.0' });
  } catch (error) {
    res.status(500).json({ error: String(error.message || error) });
  } finally {
    db.close();
  }
});

app.get('/api/veiculos', async (req, res) => {
  const db = openDb();
  try {
    const rows = await all(db, 'SELECT * FROM veiculos ORDER BY placa');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: String(error.message || error) });
  } finally {
    db.close();
  }
});

app.get('/api/veiculos/:placa', async (req, res) => {
  const db = openDb();
  try {
    const row = await get(db, 'SELECT * FROM veiculos WHERE placa = ?', [req.params.placa]);
    if (!row) return res.status(404).json({ error: 'Veículo não encontrado' });
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: String(error.message || error) });
  } finally {
    db.close();
  }
});

app.post('/api/veiculos', async (req, res) => {
  const db = openDb();
  const body = req.body || {};
  const { placa } = body;
  const pathDocumentoPDF = filePathFor('pathDocumentoPDF', req) || body.pathDocumentoPDF || null;
  try {
    if (!placa) return res.status(400).json({ error: 'placa é obrigatória' });
    const params = [
      placa,
      body.tipo || null,
      body.fipeNameMarca || null,
      body.fipeModelo || null,
      body.fipeNameAno || null,
      body.renavam || null,
      body.chassi || null,
      parseInteger(body.combustivel),
      body.anoFab || null,
      body.anoModelo || null,
      body.capacidade || null,
      body.cor || null,
      body.cidade || null,
      body.uf || null,
      body.cpfcnpj || null,
      body.categoria || null,
      parseInteger(body.km),
      body.nomeEndereco || null,
      body.dataAquisicao || null,
      body.observacao || null,
      body.potencia || null,
      body.cultureInfo || null,
      body.medidasPneus || null,
      body.codigoPostal || null,
      pathDocumentoPDF,
      body.dataVencimentoIPVA || null,
      parseBoolean(body.ativo) ? 1 : 0
    ];
    await run(
      db,
      `INSERT INTO veiculos
      (placa, tipo, fipe_name_marca, fipe_modelo, fipe_name_ano, renavam, chassi, combustivel, ano_fab, ano_modelo, capacidade, cor, cidade, uf, cpfcnpj, categoria, km, nome_endereco, data_aquisicao, observacao, potencia, culture_info, medidas_pneus, codigo_postal, path_documento_pdf, data_vencimento_ipva, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      params
    );
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error.message || error) });
  } finally {
    db.close();
  }
});

app.put('/api/veiculos/:placa', async (req, res) => {
  const db = openDb();
  const body = req.body || {};
  const pathDocumentoPDF = filePathFor('pathDocumentoPDF', req) || body.pathDocumentoPDF || null;
  try {
    const placa = req.params.placa;
    if (!placa) return res.status(400).json({ error: 'placa inválida' });
    const exists = await get(db, 'SELECT placa FROM veiculos WHERE placa = ?', [placa]);
    if (!exists) return res.status(404).json({ error: 'Veículo não encontrado' });
    await run(
      db,
      `UPDATE veiculos SET tipo = ?, fipe_name_marca = ?, fipe_modelo = ?, fipe_name_ano = ?, renavam = ?, chassi = ?, combustivel = ?, ano_fab = ?, ano_modelo = ?, capacidade = ?, cor = ?, cidade = ?, uf = ?, cpfcnpj = ?, categoria = ?, km = ?, nome_endereco = ?, data_aquisicao = ?, observacao = ?, potencia = ?, culture_info = ?, medidas_pneus = ?, codigo_postal = ?, path_documento_pdf = ?, data_vencimento_ipva = ?, ativo = ? WHERE placa = ?`,
      [
        body.tipo || null,
        body.fipeNameMarca || null,
        body.fipeModelo || null,
        body.fipeNameAno || null,
        body.renavam || null,
        body.chassi || null,
        parseInteger(body.combustivel),
        body.anoFab || null,
        body.anoModelo || null,
        body.capacidade || null,
        body.cor || null,
        body.cidade || null,
        body.uf || null,
        body.cpfcnpj || null,
        body.categoria || null,
        parseInteger(body.km),
        body.nomeEndereco || null,
        body.dataAquisicao || null,
        body.observacao || null,
        body.potencia || null,
        body.cultureInfo || null,
        body.medidasPneus || null,
        body.codigoPostal || null,
        pathDocumentoPDF,
        body.dataVencimentoIPVA || null,
        parseBoolean(body.ativo) ? 1 : 0,
        placa
      ]
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error.message || error) });
  } finally {
    db.close();
  }
});

app.delete('/api/veiculos/:placa', async (req, res) => {
  const db = openDb();
  try {
    await run(db, 'DELETE FROM veiculos WHERE placa = ?', [req.params.placa]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error.message || error) });
  } finally {
    db.close();
  }
});

function createEntityRoutes({ name, tableName, keyField, fields, fileFields = [] }) {
  app.get(`/api/${name}`, async (req, res) => {
    const db = openDb();
    try {
      const rows = await all(db, `SELECT * FROM ${tableName} ORDER BY ${keyField}`);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: String(error.message || error) });
    } finally {
      db.close();
    }
  });

  app.get(`/api/${name}/:${keyField}`, async (req, res) => {
    const db = openDb();
    try {
      const row = await get(db, `SELECT * FROM ${tableName} WHERE ${keyField} = ?`, [req.params[keyField]]);
      if (!row) return res.status(404).json({ error: `${name} não encontrado` });
      res.json(row);
    } catch (error) {
      res.status(500).json({ error: String(error.message || error) });
    } finally {
      db.close();
    }
  });

  app.post(`/api/${name}`, async (req, res) => {
    const db = openDb();
    const body = req.body || {};
    const values = fields.map((field) => {
      if (fileFields.includes(field)) {
        return filePathFor(field, req) || body[field] || null;
      }
      if (field.endsWith('_id') || field === 'id' || field.includes('km')) return parseInteger(body[field]);
      if (field === 'ativo' || field === 'pagamento_realizado') return parseBoolean(body[field]) ? 1 : 0;
      return body[field] || null;
    });

    try {
      await run(
        db,
        `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
        values
      );
      res.status(201).json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: String(error.message || error) });
    } finally {
      db.close();
    }
  });

  app.put(`/api/${name}/:${keyField}`, async (req, res) => {
    const db = openDb();
    const body = req.body || {};
    const existing = await get(db, `SELECT * FROM ${tableName} WHERE ${keyField} = ?`, [req.params[keyField]]);
    if (!existing) {
      db.close();
      return res.status(404).json({ error: `${name} não encontrado` });
    }

    const values = fields.map((field) => {
      if (fileFields.includes(field)) {
        return filePathFor(field, req) || body[field] || existing[field] || null;
      }
      if (field.endsWith('_id') || field === 'id' || field.includes('km')) return parseInteger(body[field]) ?? existing[field] ?? null;
      if (field === 'ativo' || field === 'pagamento_realizado') {
        const boolValue = body[field] !== undefined ? parseBoolean(body[field]) : existing[field];
        return boolValue ? 1 : 0;
      }
      return body[field] !== undefined ? body[field] : existing[field];
    });

    try {
      await run(
        db,
        `UPDATE ${tableName} SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE ${keyField} = ?`,
        [...values, req.params[keyField]]
      );
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: String(error.message || error) });
    } finally {
      db.close();
    }
  });

  app.delete(`/api/${name}/:${keyField}`, async (req, res) => {
    const db = openDb();
    try {
      await run(db, `DELETE FROM ${tableName} WHERE ${keyField} = ?`, [req.params[keyField]]);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: String(error.message || error) });
    } finally {
      db.close();
    }
  });
}

createEntityRoutes({
  name: 'cnhs',
  tableName: 'cnhs',
  keyField: 'numero_registro',
  fields: [
    'numero_registro',
    'nome',
    'nascimento',
    'categoria',
    'cpf',
    'filiacao',
    'primeira_habilitacao',
    'emissao',
    'validade',
    'local',
    'path_documento_pdf',
    'aivo'
  ],
  fileFields: ['path_documento_pdf']
});

createEntityRoutes({
  name: 'mecanicas',
  tableName: 'mecanicas',
  keyField: 'id',
  fields: [
    'nome',
    'endereco',
    'numero',
    'complemento',
    'cep',
    'bairro',
    'cidade',
    'uf',
    'site',
    'email',
    'telefone1',
    'telefone2',
    'celular1',
    'celular1_operadora',
    'celular2',
    'celular2_operadora',
    'contatos',
    'observacao'
  ]
});

createEntityRoutes({
  name: 'tipo-manutencao',
  tableName: 'tipo_manutencao',
  keyField: 'id',
  fields: ['descricao']
});

createEntityRoutes({
  name: 'manutencoes',
  tableName: 'manutencoes',
  keyField: 'id',
  fields: [
    'data',
    'data_s',
    'valor',
    'descricao',
    'km',
    'path_comprovante_pdf',
    'veiculo_id',
    'mecanica_id',
    'tipo_manutencao_id'
  ],
  fileFields: ['path_comprovante_pdf']
});

createEntityRoutes({
  name: 'multas',
  tableName: 'multas',
  keyField: 'id',
  fields: [
    'data_ocorrencia',
    'data_ocorrencia_s',
    'local_ocorrencia',
    'data_vencimento',
    'data_vencimento_s',
    'data_pagamento',
    'data_pagamento_s',
    'valor',
    'path_anexo_multa_pdf',
    'pagamento_realizado',
    'veiculo_id'
  ],
  fileFields: ['path_anexo_multa_pdf']
});

createEntityRoutes({
  name: 'seguradoras',
  tableName: 'seguradoras',
  keyField: 'id',
  fields: [
    'nome',
    'corretor',
    'endereco',
    'numero',
    'complemento',
    'cep',
    'bairro',
    'cidade',
    'uf',
    'site',
    'email',
    'telefone1',
    'telefone2',
    'celular1',
    'celular1_operadora',
    'celular2',
    'celular2_operadora',
    'contatos'
  ]
});

createEntityRoutes({
  name: 'contratos-seguro',
  tableName: 'contratos_seguro',
  keyField: 'id',
  fields: [
    'numero_apolice',
    'data_inicial_contrato',
    'data_final_contrato',
    'ativo',
    'path_orcamento_pdf',
    'path_contrato_pdf',
    'path_cartao_pdf',
    'seguradora_id',
    'veiculo_id'
  ],
  fileFields: ['path_orcamento_pdf', 'path_contrato_pdf', 'path_cartao_pdf']
});

createEntityRoutes({
  name: 'pagamentos-seguro',
  tableName: 'pagamentos_seguro',
  keyField: 'id',
  fields: [
    'data_pagamento',
    'valor',
    'path_pagamento_pdf',
    'contrato_seguro_id',
    'veiculo_id'
  ],
  fileFields: ['path_pagamento_pdf']
});

createEntityRoutes({
  name: 'pagamento-documentos',
  tableName: 'pagamento_documentos',
  keyField: 'id',
  fields: [
    'data_pagamento',
    'data_pagamento_s',
    'data_vencimento',
    'data_vencimento_s',
    'valor',
    'descricao',
    'veiculo_id'
  ]
});

createEntityRoutes({
  name: 'abastecimentos',
  tableName: 'abastecimentos',
  keyField: 'id',
  fields: [
    'quantidade',
    'combustivel_id',
    'valor',
    'km',
    'path_comprovante_pdf',
    'data',
    'data_s',
    'veiculo_id'
  ],
  fileFields: ['path_comprovante_pdf']
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: String(err.message || err) });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`GestaoFrota backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('DB init failed:', error);
    process.exit(1);
  });
