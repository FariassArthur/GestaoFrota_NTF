const { openDb, run, all, get, parseBoolean, parseInteger } = require('../database/connection');
const { filePathFor } = require('../middleware/upload');

function registerVeiculosRoutes(app) {
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
        placa, body.tipo || null, body.fipeNameMarca || null, body.fipeModelo || null,
        body.fipeNameAno || null, body.renavam || null, body.chassi || null,
        parseInteger(body.combustivel), body.anoFab || null, body.anoModelo || null,
        body.capacidade || null, body.cor || null, body.cidade || null, body.uf || null,
        body.cpfcnpj || null, body.categoria || null, parseInteger(body.km),
        body.nomeEndereco || null, body.dataAquisicao || null, body.observacao || null,
        body.potencia || null, body.cultureInfo || null, body.medidasPneus || null,
        body.codigoPostal || null, pathDocumentoPDF, body.dataVencimentoIPVA || null,
        parseBoolean(body.ativo) ? 1 : 0
      ];
      await run(
        db,
        `INSERT INTO veiculos
        (placa, tipo, fipe_name_marca, fipe_modelo, fipe_name_ano, renavam, chassi, combustivel, ano_fab, ano_modelo, capacidade, cor, cidade, uf, cpfcnpj, categoria, km, nome_endereco, data_aquisicao, observacao, potencia, culture_info, medidas_pneus, codigo_postal, path_documento_pdf, data_vencimento_ipva, ativo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          body.tipo || null, body.fipeNameMarca || null, body.fipeModelo || null, body.fipeNameAno || null,
          body.renavam || null, body.chassi || null, parseInteger(body.combustivel),
          body.anoFab || null, body.anoModelo || null, body.capacidade || null, body.cor || null,
          body.cidade || null, body.uf || null, body.cpfcnpj || null, body.categoria || null,
          parseInteger(body.km), body.nomeEndereco || null, body.dataAquisicao || null,
          body.observacao || null, body.potencia || null, body.cultureInfo || null,
          body.medidasPneus || null, body.codigoPostal || null, pathDocumentoPDF,
          body.dataVencimentoIPVA || null, parseBoolean(body.ativo) ? 1 : 0, placa
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
}

module.exports = { registerVeiculosRoutes };
