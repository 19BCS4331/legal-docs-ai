-- Enable RLS on document_comments
alter table "public"."document_comments" enable row level security;

-- Create policy for inserting comments
-- Users can add comments if:
-- 1. They are the document owner
-- 2. They are a collaborator with editor or commenter role
create policy "Users can add comments if they have permission"
on "public"."document_comments"
for insert
to authenticated
with check (
  exists (
    select 1 from documents d
    left join document_collaborators dc on dc.document_id = d.id
    where d.id = document_comments.document_id
    and (
      d.user_id = auth.uid() -- Document owner
      or (
        dc.user_id = auth.uid() -- Collaborator
        and dc.role in ('editor', 'commenter') -- With appropriate role
      )
    )
  )
);

-- Create policy for viewing comments
-- Users can view comments if:
-- 1. They are the document owner
-- 2. They are a collaborator (any role)
create policy "Users can view comments if they have access to the document"
on "public"."document_comments"
for select
to authenticated
using (
  exists (
    select 1 from documents d
    left join document_collaborators dc on dc.document_id = d.id
    where d.id = document_comments.document_id
    and (
      d.user_id = auth.uid() -- Document owner
      or dc.user_id = auth.uid() -- Any collaborator
    )
  )
);

-- Create policy for updating comments
-- Users can update comments if:
-- 1. They created the comment
-- 2. They are the document owner
-- 3. They are a collaborator with editor role
create policy "Users can update their own comments or if they have editor access"
on "public"."document_comments"
for update
to authenticated
using (
  auth.uid() = user_id -- Comment creator
  or exists (
    select 1 from documents d
    left join document_collaborators dc on dc.document_id = d.id
    where d.id = document_comments.document_id
    and (
      d.user_id = auth.uid() -- Document owner
      or (
        dc.user_id = auth.uid() -- Collaborator
        and dc.role = 'editor' -- With editor role
      )
    )
  )
);

-- Create policy for deleting comments
-- Users can delete comments if:
-- 1. They created the comment
-- 2. They are the document owner
-- 3. They are a collaborator with editor role
create policy "Users can delete their own comments or if they have editor access"
on "public"."document_comments"
for delete
to authenticated
using (
  auth.uid() = user_id -- Comment creator
  or exists (
    select 1 from documents d
    left join document_collaborators dc on dc.document_id = d.id
    where d.id = document_comments.document_id
    and (
      d.user_id = auth.uid() -- Document owner
      or (
        dc.user_id = auth.uid() -- Collaborator
        and dc.role = 'editor' -- With editor role
      )
    )
  )
);
