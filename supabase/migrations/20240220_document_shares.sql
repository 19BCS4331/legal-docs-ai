-- Create document_shares table
create table "public"."document_shares" (
    "id" uuid not null default gen_random_uuid(),
    "document_id" uuid not null references "public"."documents"("id") on delete cascade,
    "shared_with" uuid not null references "auth"."users"("id") on delete cascade,
    "shared_by" uuid not null references "auth"."users"("id") on delete cascade,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    primary key ("id")
);

-- Add RLS policies
alter table "public"."document_shares" enable row level security;

-- Allow users to view documents shared with them
create policy "Users can view documents shared with them"
    on "public"."document_shares"
    for select
    using (
        auth.uid() = shared_with
        or auth.uid() = shared_by
    );

-- Allow users to share their own documents
create policy "Users can share their own documents"
    on "public"."document_shares"
    for insert
    with check (
        exists (
            select 1 from documents
            where id = document_id
            and user_id = auth.uid()
        )
    );

-- Add unique constraint to prevent duplicate shares
create unique index document_shares_unique_idx
    on "public"."document_shares" (document_id, shared_with);

-- Add indexes for better query performance
create index document_shares_document_id_idx on "public"."document_shares" (document_id);
create index document_shares_shared_with_idx on "public"."document_shares" (shared_with);
create index document_shares_shared_by_idx on "public"."document_shares" (shared_by);
