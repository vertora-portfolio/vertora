# Site da Vértora — portfólio digital

Site oficial do portfólio da **Vértora** (Gestão Patrimonial e Empresarial LTDA.), empresa **fictícia** criada para o *Shark Tank Jurídico* — Teoria da Empresa e Direito Societário, Centro Universitário AGES / Ânima Educação, 2026/2.

- **Endereço público:** https://vertora-portfolio.github.io/vertora/
- **QR Code e cartão para impressão:** pasta [`entregaveis/`](entregaveis/) (`qr-vertora.svg`, `qr-vertora.png`, `cartao-qr-a6.pdf`).

---

## Como editar os textos (sem mexer no código)

**Todo o conteúdo do site está em um único arquivo:** [`src/content.json`](src/content.json).

### Pelo navegador (mais fácil)

1. Abra o repositório no GitHub e clique em `src` → `content.json`.
2. Clique no **lápis** (✏️ *Edit this file*), no canto superior direito.
3. Altere **só o texto entre aspas**. Exemplo: `"title": "Patrimônio espalhado é patrimônio em risco."`
4. Desça a página e clique em **Commit changes**.
5. Pronto: em 1 a 2 minutos o site se atualiza sozinho (aba **Actions** mostra o andamento).

### Regras para não quebrar o arquivo

- Mantenha as **aspas** `"` no começo e no fim de cada texto, e as **vírgulas** entre os itens.
- Se precisar de aspas dentro do texto, use “aspas curvas” (como estas).
- `**palavra**` deixa a palavra em **negrito**.
- `[[CC, art. 1.052]]` vira um **chip de referência** que abre uma explicação ao toque. A explicação de cada chip fica na seção `"refs"` do mesmo arquivo.

### Onde está cada coisa em `content.json`

| Seção | O que contém |
|---|---|
| `site` | link do site, PDF, rodapé, selo acadêmico e a chave `showSimulator` |
| `socios` | nome completo, nome curto, função e responsabilidades de cada sócio (mude aqui a grafia de um nome e ela muda no site inteiro) |
| `home` | abertura: título, subtítulo e os 4 números |
| `stories` | as 7 telas do modo “Vértora em 60 segundos” |
| `refs` | explicações curtas dos chips de base legal |
| `chapters` | os 13 capítulos, cada um com `title`, `summary`, `highlight`, `owners` (ids dos sócios) e `blocks` (conteúdo) |
| `quorum` | tabela de quóruns e matérias do simulador “Essa decisão passa?” |
| `simulator` | parâmetros do simulador financeiro “E se?” |

### Simulador financeiro “E se?”

Está **desligado** até a aprovação da Diretoria Financeira. Para ligar, troque em `site`:

```json
"showSimulator": true
```

### Cores e fontes

Ficam no topo de [`src/style.css`](src/style.css), em variáveis (`--navy`, `--gold`, `--ivory` …).

---

## Como republicar

Não é preciso fazer nada além de salvar (*commit*) a alteração na branch `main`: o GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) gera o site e publica no GitHub Pages automaticamente.

### Rodar no computador (opcional)

Requer Node.js 20 ou mais novo.

```powershell
npm install
npm run dev
```

Para gerar a pasta final `dist/`:

```powershell
npm run build
```

**Plano B (sem GitHub):** arraste a pasta `dist/` em https://app.netlify.com/drop. Atenção: sem criar uma conta gratuita, o Netlify apaga o site em 1 hora. Se o endereço mudar, o QR Code precisa ser gerado de novo.

---

## Privacidade e cuidados

- Sem cookies, rastreadores ou formulários.
- **Não** publicar os `.docx` (Contrato Social, Acordo de Sócios, Manual): eles têm RG, CPF e endereços, mesmo fictícios.
- Não remover o aviso de “projeto acadêmico fictício”.
- Não alterar, recolorir ou distorcer a logo.
