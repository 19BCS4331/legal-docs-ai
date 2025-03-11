-- Create the ai_memoization table
create table if not exists ai_memoization (
  id uuid default uuid_generate_v4() primary key,
  hash text not null,
  content text not null,
  prompt text not null,
  model text not null,
  type text not null check (type in ('summary', 'risk_analysis', 'document_generation')),
  document_id uuid references documents(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  unique(hash, document_id, type)
);

-- Create an index for faster lookups
create index if not exists idx_ai_memoization_lookup 
on ai_memoization(hash, document_id, type);

-- Create an index for expiration cleanup
create index if not exists idx_ai_memoization_expiry 
on ai_memoization(expires_at);

-- Add RLS policies
alter table ai_memoization enable row level security;

create policy "Users can view their own document's AI content"
on ai_memoization for select
using (
  exists (
    select 1 from documents
    where documents.id = ai_memoization.document_id
    and (
      documents.user_id = auth.uid() 
      or exists (
        select 1 from document_shares
        where document_shares.document_id = documents.id
        and document_shares.shared_with = auth.uid()
      )
    )
  )
);

create policy "Users can create AI content for their own documents"
on ai_memoization for insert
with check (
  exists (
    select 1 from documents
    where documents.id = ai_memoization.document_id
    and documents.user_id = auth.uid()
  )
);

create policy "Users can update AI content for their own documents"
on ai_memoization for update
using (
  exists (
    select 1 from documents
    where documents.id = ai_memoization.document_id
    and documents.user_id = auth.uid()
  )
);

create policy "Users can delete AI content for their own documents"
on ai_memoization for delete
using (
  exists (
    select 1 from documents
    where documents.id = ai_memoization.document_id
    and documents.user_id = auth.uid()
  )
);
