# 🌐 Guia de Hospedagem e Conexão Supabase

Este guia explica como hospedar o aplicativo para acessá-lo de qualquer dispositivo (celular, tablet, notebook) e como conectá-lo a um banco de dados gratuito na nuvem (Supabase).

---

## 1. Conexão com o Supabase (Banco de Dados na Nuvem)

### Passo 1: Criar conta e projeto no Supabase
1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta gratuita.
2. Clique em **"New Project"**, defina um nome (ex: `meu-notion`) e uma senha para o banco de dados.
3. Escolha uma região próxima (ex: `South America (São Paulo)`).

### Passo 2: Executar o Schema SQL
1. No menu lateral do Supabase, clique em **SQL Editor** (ícone `>_`).
2. Clique em **"New query"**.
3. Abra o arquivo `supabase-schema.sql` deste projeto, copie todo o conteúdo e cole no editor do Supabase.
4. Clique no botão **"Run"** (ou aperte `Ctrl + Enter`).
5. Pronto! A tabela `workspaces` com Row Level Security (RLS) já está criada.

### Passo 3: Obter as chaves de API
1. No Supabase, vá em **Project Settings** (ícone de engrenagem) -> **API**.
2. Copie os valores:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon public key** (uma chave longa que começa com `ey...`)

### Passo 4: Configurar no Projeto Local
Crie um arquivo chamado `.env.local` na pasta raiz do projeto com o seguinte conteúdo:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon
```

O aplicativo detectará automaticamente essas variáveis e salvará os dados em tempo real no Supabase, permitindo que qualquer alteração seja sincronizada na nuvem!

---

## 2. Como Hospedar Gratuitamente (Acesso de Qualquer Dispositivo)

A forma mais rápida e recomendada é através da **Vercel** ou **Netlify**:

### Opção A: Vercel (Recomendado)
1. Crie uma conta em [https://vercel.com](https://vercel.com).
2. Suba este projeto para o seu GitHub (ou use a CLI da Vercel: `npx vercel`).
3. No painel da Vercel, clique em **"Add New Project"** e selecione o repositório.
4. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL` = seu URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua anon key do Supabase
5. Clique em **"Deploy"**.
6. Em menos de 1 minuto seu site estará online com um link seguro HTTPS (ex: `meu-app.vercel.app`) pronto para usar no celular, tablet e computador!

### Opção B: Netlify
1. Crie uma conta em [https://netlify.com](https://netlify.com).
2. Arraste a pasta `dist` gerada por `npm run build` ou conecte ao repositório GitHub.
3. Adicione as variáveis de ambiente em **Site settings > Environment variables**.
4. Clique em **Deploy site**.

---

## 3. Instalar no Celular como Aplicativo (PWA / Adicionar à Tela Inicial)
Quando o site estiver hospedado com HTTPS:
- **No iPhone / Safari:** Toque no botão de Compartilhar e selecione **"Adicionar à Tela de Início"**.
- **No Android / Chrome:** Toque nos 3 pontinhos no topo e selecione **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.

O app funcionará em tela cheia como um aplicativo nativo no seu celular!
