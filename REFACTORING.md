# Gestão de Frota - Documentação de Refatoração

## Estrutura do Projeto

O projeto foi refatorado para uma arquitetura modular e escalável, separando frontend e backend em componentes independentes.

### Backend (`/GestaoFrotaJS/backend/`)

```
backend/
├── server.js              # Entrada principal Express, definição de rotas
├── db.js                  # Utilitários de banco de dados centralizados
├── entityRoutes.js        # Gerador de rotas CRUD genéricas
├── data/
│   └── gestaofrota.sqlite # Banco de dados SQLite
└── public/
    └── uploads/           # Armazenamento de arquivos
```

**Responsabilidades:**

- **server.js**: Inicializa Express, define middleware (auth, cors, helmet), registra rotas de entidades via `createEntityRoutes()`
- **db.js**: Exporta funções utilitárias (`openDb()`, `run()`, `all()`, `get()`, `parseBoolean()`, `filePathFor()`, etc.)
- **entityRoutes.js**: Define `createRoutesFor(config)` que gera automaticamente rotas GET/POST/PUT/DELETE para uma entidade

**Segurança:**

- JWT com expiração de 8 horas
- Senhas com bcryptjs (hash + salt)
- CORS configurado
- Helmet para headers de segurança
- Foreign key constraints habilitadas

### Frontend (`/GestaoFrotaJS/frontend/src/`)

```
src/
├── api/
│   └── client.js               # Cliente HTTP com suporte a autenticação
├── modules/
│   └── config.js               # Configuração centralizada de módulos
├── components/
│   ├── LoginForm.jsx           # Formulário de login
│   ├── Header.jsx              # Cabeçalho com info do usuário
│   ├── Sidebar.jsx             # Menu de navegação de módulos
│   ├── EntityForm.jsx          # Renderizador genérico de formulários
│   ├── EntityTable.jsx         # Renderizador genérico de tabelas
│   └── GenericModule.jsx       # Gerenciador unificado de entidades (CRUD)
└── App.jsx                     # Componente raiz
```

**Responsabilidades:**

- **api/client.js**: Centraliza todas as chamadas HTTP, headers de autenticação, getHeaders(), buildRequest()
- **modules/config.js**: Define array MODULES com configuração de cada entidade (endpoint, keyField, fields, etc.)
- **components/LoginForm.jsx**: Tela de autenticação com JWT
- **components/Header.jsx**: Cabeçalho com nome do usuário e botão logout
- **components/Sidebar.jsx**: Menu lateral para navegação entre módulos
- **components/EntityForm.jsx**: Renderiza formulários dinamicamente (input, select, textarea, checkbox, file)
- **components/EntityTable.jsx**: Renderiza tabelas com primeiros 8 campos e botões de ação
- **components/GenericModule.jsx**: Orquestra load/create/edit/delete de entidades
- **App.jsx**: Router principal com Dashboard e integração de componentes

## Fluxo de Dados

### Autenticação
1. Usuário entra username/password no LoginForm
2. POST `/api/login` → backend valida com bcryptjs
3. Backend retorna JWT token
4. Frontend armazena em localStorage + headers Authorization

### CRUD Genérico
1. GenericModule.jsx carrega dados via `fetchList()` em useEffect
2. EntityTable.jsx exibe registros
3. Usuário clica em "Editar" → EntityForm.jsx popula com dados
4. Usuário modifica campos → handleFieldChange() atualiza state
5. Usuário clica "Atualizar" → EntityForm.jsx envia PUT
6. GenericModule.jsx re-executa fetchList() para sincronizar UI

### Relacionamentos
- CNHs possui `veiculo_id` (TEXT, FK → veiculos.placa)
- Manutenções, Multas, etc. também possem `veiculo_id` e/ou IDs de outras entidades
- Frontend renderiza dropdown de `veiculo_id` via EntityForm.jsx

## Como Adicionar um Novo Módulo

### 1. Backend (Automático)
Basta chamar em server.js:
```javascript
createEntityRoutes({
  name: 'novo-modulo',
  tableName: 'novo_modulo',
  keyField: 'id',
  fields: ['id', 'nome', 'descricao'],
  fileFields: []
});
```

### 2. Frontend
Adicionar entrada em `/modules/config.js`:
```javascript
{
  key: 'novo-modulo',
  label: 'Novo Módulo',
  endpoint: '/api/novo-modulo',
  keyField: 'id',
  fields: [
    { name: 'id', label: 'ID', type: 'number' },
    { name: 'nome', label: 'Nome' },
    { name: 'descricao', label: 'Descrição', type: 'textarea' }
  ]
}
```

GenericModule.jsx automaticamente:
- Renderiza formulário com os campos
- Carrega dados via `/api/novo-modulo`
- Cria/edita/deleta via POST/PUT/DELETE

## Tipos de Campo Suportados

No EntityForm.jsx:
- **text** (padrão): `<input type="text">`
- **number**: `<input type="number">`
- **date**: `<input type="date">`
- **checkbox**: `<input type="checkbox">` (boolean)
- **textarea**: `<textarea>` para textos longos
- **file**: `<input type="file">` → upload Multer
- **veiculo_id** especial: `<select>` com dropdown de veículos

## Autenticação

- Endpoint: POST `/api/login`
- Payload: `{ username, password }`
- Response: `{ token, user }`
- Validade: 8 horas

Token JWT é validado no middleware `verifyAuth()` para todas as rotas `/api/*`.

## Upload de Arquivos

Multer está configurado para:
- Limite: 25MB por arquivo
- Caminho: `/backend/public/uploads/{modulo}/{arquivo}`
- Headers: `Authorization: Bearer {token}`

No formulário, campo com `type: 'file'` é enviado como FormData em vez de JSON.

## Estrutura de Dados Exemplo

```javascript
// modules/config.js - Módulo de Veículos
{
  key: 'veiculos',
  label: 'Veículos',
  endpoint: '/api/veiculos',
  keyField: 'placa',
  fields: [
    { name: 'placa', label: 'Placa', type: 'text', required: true },
    { name: 'tipo', label: 'Tipo' },
    { name: 'km', label: 'KM', type: 'number' },
    { name: 'pathDocumentoPDF', label: 'Documentação', type: 'file' },
    { name: 'ativo', label: 'Ativo', type: 'checkbox' }
  ]
}
```

## Instalação e Execução

### Backend
```bash
cd GestaoFrotaJS/backend
npm install
npm start  # Inicia na porta 3001
```

### Frontend
```bash
cd GestaoFrotaJS/frontend
npm install
npm run dev  # Inicia na porta 5174 via Vite
```

Login padrão: **admin / admin**

## Próximos Passos (Opcional)

- [ ] Criar módulos específicos para customização (VehiclesModule, CNHsModule, etc.)
- [ ] Adicionar paginação/filtros nas tabelas
- [ ] Documentação Swagger para API
- [ ] Testes unitários (Jest, Vitest)
- [ ] Validação de campos no backend (joi, zod)
- [ ] Backup automático do banco de dados
- [ ] Painel de relatórios
