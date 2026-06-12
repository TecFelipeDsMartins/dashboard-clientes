# AprovaDash - Marketing Client Approval Dashboard

## 1. Visão Geral
O AprovaDash é uma plataforma para profissionais de marketing gerenciarem a aprovação de materiais (carrosséis, vídeos, imagens estáticas) com seus clientes. Permite o upload, visualização, aprovação e edição de legendas (copy) com rastreamento de alterações.

## 2. Stack Tecnológica
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS.
- **Backend/Database:** Supabase (PostgreSQL, Storage).
- **Hospedagem:** Vercel.
- **Utilitários:** `lucide-react`, `uuid`, `diff` (rastreamento de texto).

## 3. Estrutura do Banco de Dados (Supabase)

### Tabela: `projects`
- `id` (uuid, PK)
- `client_name` (text)
- `project_name` (text)
- `copy_text` (text)
- `post_type` (text - 'static' | 'carousel' | 'video')
- `status` (text)
- `created_at` (timestamp)

### Tabela: `project_items`
- `id` (uuid, PK)
- `project_id` (uuid, FK references projects)
- `media_url` (text)
- `media_type` (text)
- `status` (text)
- `feedback` (text)

## 4. Funcionalidades Atuais
- **Dashboard Admin:**
  - Listagem de todos os projetos ativos.
  - Criação de novos projetos com seleção de tipo de post (estático/carrossel/vídeo).
  - Upload de múltiplos arquivos simultaneamente.
  - Exclusão de projetos e seus itens associados.
- **Interface de Aprovação do Cliente:**
  - Visualização de itens com player de vídeo/imagem.
  - Edição de legenda com "Diff View" (rastreamento de texto adicionado/excluído).
  - Botões para "Aprovar" ou "Solicitar Ajuste" por item.
  - Persistência de feedback em tempo real.

## 5. Variáveis de Ambiente Necessárias
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
