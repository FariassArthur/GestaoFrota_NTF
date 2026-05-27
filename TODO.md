# TODO - Migração GestaoFrota (WinForms/.NET) -> Node.js + React + SQLite

## Passo 1: Base JS (criar do zero)
- [ ] Criar `GestaoFrotaJS/backend` (Express + SQLite + REST + uploads)
- [ ] Criar `GestaoFrotaJS/frontend` (React + UI)
- [ ] Criar `GestaoFrotaJS/package.json` (root) para rodar backend+frontend em paralelo

## Passo 2: Portar domínio (tudo)
- [ ] Tabelas/Models SQLite: Veiculos, Abastecimento, Combustivel, Oleo/Manutencoes, Mecanica, Multa, CNH, Seguradora/Seguros, Pagamentos/Documentos
- [ ] CRUD no backend para cada entidade (com endpoints)
- [ ] UI React para cada módulo (lista + formulário + edição)
- [ ] Upload de anexos (comprovantes/documentos/multas/seguro)

## Passo 3: Executável/rodar sem travar terminal
- [ ] Scripts npm para iniciar tudo (sem travar terminal)
- [ ] Atualizar README com comando único

## Passo 4: Validação
- [ ] Testar fluxo completo: cadastro veículo -> anexar -> abastecer -> anexos -> relatórios

