-- Drop existing policies
drop policy if exists "Users can see their own documents" on documents;
drop policy if exists "Users can see documents shared with them" on documents;
drop policy if exists "Users can update their own documents" on documents;
drop policy if exists "Collaborators can update documents if they have editor role" on documents;
drop policy if exists "Users can delete their own documents" on documents;
drop policy if exists "Document owners can manage collaborators" on document_collaborators;
drop policy if exists "Users can see their own collaborator records" on document_collaborators;
drop policy if exists "Users can see relevant documents" on documents;
drop policy if exists "Users can update documents they own or can edit" on documents;
drop policy if exists "Users can see relevant collaborator records" on document_collaborators;
drop policy if exists "Document owners can modify collaborators" on document_collaborators;
drop policy if exists "Document owners can modify collaborators update" on document_collaborators;
drop policy if exists "Document owners can modify collaborators delete" on document_collaborators;

-- First disable RLS to reset
alter table documents disable row level security;
alter table document_collaborators disable row level security;

-- Re-enable RLS
alter table documents enable row level security;
alter table document_collaborators enable row level security;

-- Basic document policies
create policy "documents_select_policy"
  on documents for select
  to authenticated
  using (true);  -- Allow all authenticated users to read documents

create policy "documents_insert_policy"
  on documents for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "documents_update_policy"
  on documents for update
  to authenticated
  using (auth.uid() = user_id);

create policy "documents_delete_policy"
  on documents for delete
  to authenticated
  using (auth.uid() = user_id);

-- Basic collaborator policies
create policy "collaborators_select_policy"
  on document_collaborators for select
  to authenticated
  using (true);  -- Allow all authenticated users to read collaborators

create policy "collaborators_insert_policy"
  on document_collaborators for insert
  to authenticated
  with check (
    exists (
      select 1 from documents
      where id = document_id
      and user_id = auth.uid()
    )
  );

create policy "collaborators_update_policy"
  on document_collaborators for update
  to authenticated
  using (
    exists (
      select 1 from documents
      where id = document_id
      and user_id = auth.uid()
    )
  );

create policy "collaborators_delete_policy"
  on document_collaborators for delete
  to authenticated
  using (
    exists (
      select 1 from documents
      where id = document_id
      and user_id = auth.uid()
    )
  );
