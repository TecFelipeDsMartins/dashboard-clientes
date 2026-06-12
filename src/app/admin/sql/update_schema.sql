-- Adicionar coluna post_type à tabela de projetos
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'static';

-- Atualizar o nome da coluna de copy na tabela de itens (se necessário, ou manter na projects)
-- No nosso novo fluxo, a copy será centralizada na tabela 'projects' para carrosséis e static.
