-- Create document_collaborators table
CREATE TABLE document_collaborators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'owner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    UNIQUE(document_id, user_id)
);

-- Create document_comments table
CREATE TABLE document_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    parent_id UUID REFERENCES document_comments(id) ON DELETE CASCADE,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    position_start INTEGER, -- For inline comments
    position_end INTEGER -- For inline comments
);

-- Create document_presence table for real-time collaboration
CREATE TABLE document_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    cursor_position INTEGER,
    UNIQUE(document_id, user_id)
);

-- Add RLS policies for document_collaborators
ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaborators for documents they have access to"
    ON document_collaborators FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM documents d
            WHERE d.id = document_collaborators.document_id
            AND (
                d.user_id = auth.uid() OR
                document_collaborators.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Document owners can manage collaborators"
    ON document_collaborators FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM documents d
            WHERE d.id = document_collaborators.document_id
            AND d.user_id = auth.uid()
        )
    );

-- Add RLS policies for document_comments
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments for documents they have access to"
    ON document_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM documents d
            WHERE d.id = document_comments.document_id
            AND (
                d.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM document_collaborators dc
                    WHERE dc.document_id = document_comments.document_id
                    AND dc.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can create comments for documents they have access to"
    ON document_comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents d
            WHERE d.id = document_comments.document_id
            AND (
                d.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM document_collaborators dc
                    WHERE dc.document_id = document_comments.document_id
                    AND dc.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can update their own comments"
    ON document_comments FOR UPDATE
    USING (user_id = auth.uid());

-- Add RLS policies for document_presence
ALTER TABLE document_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update presence"
    ON document_presence FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM documents d
            WHERE d.id = document_presence.document_id
            AND (
                d.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM document_collaborators dc
                    WHERE dc.document_id = document_presence.document_id
                    AND dc.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can manage their own presence"
    ON document_presence FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Enable realtime for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE document_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE document_comments;

-- Add function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_document_collaborators_updated_at
    BEFORE UPDATE ON document_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_comments_updated_at
    BEFORE UPDATE ON document_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_document_collaborators_document_id ON document_collaborators(document_id);
CREATE INDEX idx_document_collaborators_user_id ON document_collaborators(user_id);
CREATE INDEX idx_document_comments_document_id ON document_comments(document_id);
CREATE INDEX idx_document_comments_user_id ON document_comments(user_id);
CREATE INDEX idx_document_comments_parent_id ON document_comments(parent_id);
CREATE INDEX idx_document_presence_document_id ON document_presence(document_id);
CREATE INDEX idx_document_presence_user_id ON document_presence(user_id);
