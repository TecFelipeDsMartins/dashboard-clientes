# AprovaDash - Marketing Client Approval Dashboard

## 1. Visão Geral
O AprovaDash é uma plataforma simples e eficiente para profissionais de marketing gerenciarem a aprovação de materiais (carrosséis, vídeos, legendas) com seus clientes. Ele elimina a necessidade de gerenciar aprovações via aplicativos de mensagens, centralizando o histórico e o status de cada ativo.

## 2. Stack Tecnológica
- **Frontend:** Next.js (App Router), Tailwind CSS.
- **Backend/Database:** Supabase (PostgreSQL, Storage).
- **Hospedagem:** Vercel.
- **Utilitários:** `lucide-react` (ícones), `uuid` (geração de IDs).

## 3. Estrutura do Banco de Dados (Supabase)

### Tabela: `projects`
- `id` (uuid, PK)
- `client_name` (text)
- `project_name` (text)
- `copy_text` (text)
- `status` (text, default 'pending')
- `created_at` (timestamp)

### Tabela: `project_items`
- `id` (uuid, PK)
- `project_id` (uuid, FK references projects)
- `media_url` (text)
- `media_type` (text - 'image' ou 'video')
- `status` (text, default 'pending')
- `feedback` (text)
- `created_at` (timestamp)

### Storage
- Bucket: `materials` (Público)

## 4. Fluxo de Trabalho
1. **Admin (`/admin`):** O usuário faz upload de múltiplos arquivos e preenche o nome do cliente/projeto e a legenda. O sistema cria o registro no banco e sobe os arquivos para o storage.
2. **Cliente (`/approve/[id]`):** O cliente acessa um link único gerado pelo sistema. Lá, ele pode visualizar o material, solicitar ajustes (comentando) ou aprovar item por item.
3. **Status:** O status é atualizado em tempo real no banco de dados para consulta do admin.

## 5. Configuração e Variáveis de Ambiente
Para rodar o projeto localmente ou na Vercel, certifique-se de configurar:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
