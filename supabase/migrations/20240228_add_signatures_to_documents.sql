alter table documents
add column if not exists signatures jsonb default '{}'::jsonb;

-- Add an index for better query performance when filtering by signatures
create index if not exists idx_documents_signatures on documents using gin (signatures);
