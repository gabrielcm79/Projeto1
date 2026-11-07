# 🚀 Como Rodar o Projeto Localmente

## Pré-requisitos

- [Node.js](https://nodejs.org/) instalado (versão 18 ou superior)
- Um terminal (Powershell, CMD, ou terminal do VS Code/Antigravity IDE)

---

## ▶️ Passo a Passo — Rodar pela Primeira Vez

### 1. Abra o terminal na pasta do projeto

No **Antigravity IDE**, clique no terminal integrado e navegue até a pasta:

```powershell
cd "C:\Users\Usuário\.gemini\antigravity-ide\scratch\projeto-1"
```

> **Dica:** Se você já está no diretório certo (a IDE geralmente define isso automaticamente), pule essa etapa.

---

### 2. Instale as dependências (só na primeira vez)

```powershell
npm install
```

Isso baixa todos os pacotes listados no `package.json`. Você só precisa rodar isso **uma vez** (ou sempre que adicionar novas dependências).

---

### 3. Inicie o servidor de desenvolvimento

```powershell
npm run dev
```

Após alguns segundos, você verá algo assim no terminal:

```
  VITE v8.x  ready in 400ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abra seu navegador e acesse: **[http://localhost:5173](http://localhost:5173)**

---

## ⚡ Comandos Úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor local (modo desenvolvimento com hot reload) |
| `npm run build` | Gera a versão de produção na pasta `/dist` |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Verifica erros de código com oxlint |

---

## 🔁 Próximas Vezes

Na próxima vez que quiser rodar o projeto, basta:

```powershell
npm run dev
```

As dependências já estão instaladas — não precisa rodar `npm install` novamente (a menos que o `package.json` mude).

---

## 🛑 Parar o servidor

No terminal onde o servidor está rodando, pressione:

```
Ctrl + C
```

---

## 💡 Dicas Extras

- **Hot Reload:** Qualquer mudança nos arquivos `.tsx`, `.ts` ou `.css` é refletida automaticamente no navegador, sem precisar recarregar.
- **Porta diferente:** Se a porta `5173` já estiver em uso, o Vite usa automaticamente a próxima disponível (ex: `5174`).
- **Abrir no navegador automaticamente:** Você pode configurar o Vite para abrir o browser automaticamente editando `vite.config.ts`:

```ts
export default defineConfig({
  server: {
    open: true, // ← abre o navegador ao iniciar
  }
})
```
