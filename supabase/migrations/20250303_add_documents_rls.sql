-- First drop existing policies
drop policy if exists "Users can view documents they own or are shared with" on "public"."documents";
drop policy if exists "Users can update documents they own or have editor access to" on "public"."documents";
drop policy if exists "Users can create documents" on "public"."documents";
drop policy if exists "Users can delete documents they own" on "public"."documents";
drop policy if exists "Enable all operations for document owners" on "public"."documents";
drop policy if exists "Enable viewing for collaborators" on "public"."documents";
drop policy if exists "Enable updates for editor collaborators" on "public"."documents";
drop policy if exists "Users can manage their own collaborations" on "public"."document_collaborators";
drop policy if exists "Users can view document collaborators" on "public"."document_collaborators";
drop policy if exists "Document owners can manage collaborators" on "public"."document_collaborators";
drop policy if exists "Users can view collaborations they're part of" on "public"."document_collaborators";

-- Drop all existing policies
drop policy if exists "Documents base policy" on "public"."documents";
drop policy if exists "Documents collaborator read policy" on "public"."documents";
drop policy if exists "Documents collaborator update policy" on "public"."documents";
drop policy if exists "Collaborators base policy" on "public"."document_collaborators";
drop policy if exists "Collaborators read policy" on "public"."document_collaborators";

-- First drop all existing policies
drop policy if exists "documents_owner_policy" on "public"."documents";
drop policy if exists "documents_viewer_policy" on "public"."documents"; 
drop policy if exists "documents_editor_policy" on "public"."documents"; 
drop policy if exists "collaborators_owner_policy" on "public"."document_collaborators";
drop policy if exists "collaborators_viewer_policy" on "public"."document_collaborators";

-- Enable RLS
alter table "public"."documents" enable row level security;
alter table "public"."document_collaborators" enable row level security;

-- Simple owner policy for documents
create policy "documents_owner_policy"
on "public"."documents"
as permissive
for all
to authenticated
using (
  user_id = auth.uid()
);

-- Simple read policy for documents
create policy "documents_read_policy"
on "public"."documents"
as permissive
for select
to authenticated
using (true);

-- Simple collaborators policy
create policy "collaborators_policy"
on "public"."document_collaborators"
as permissive
for all
to authenticated
using (
  user_id = auth.uid()
);
