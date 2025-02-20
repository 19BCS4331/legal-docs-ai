-- Drop existing objects
DROP TRIGGER IF EXISTS handle_updated_at ON public.tags;
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.get_tag_counts();
DROP TABLE IF EXISTS public.document_tags CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;

-- Create tags table
CREATE TABLE public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#000000',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tags
CREATE POLICY "Users can view their own tags"
    ON public.tags FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags"
    ON public.tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
    ON public.tags FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
    ON public.tags FOR DELETE
    USING (auth.uid() = user_id);

-- Create document_tags junction table
CREATE TABLE public.document_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(document_id, tag_id)
);

-- Enable RLS on document_tags
ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for document_tags
CREATE POLICY "Users can view document tags"
    ON public.document_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE id = document_tags.document_id
            AND (
                user_id = auth.uid()
                OR
                id IN (
                    SELECT document_id FROM public.document_shares
                    WHERE user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can insert document tags"
    ON public.document_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE id = document_tags.document_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete document tags"
    ON public.document_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE id = document_tags.document_id
            AND user_id = auth.uid()
        )
    );

-- Create function to get tag counts
CREATE OR REPLACE FUNCTION public.get_tag_counts()
RETURNS TABLE (tag_id UUID, count BIGINT)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT dt.tag_id, COUNT(*)::BIGINT
    FROM document_tags dt
    JOIN documents d ON d.id = dt.document_id
    WHERE d.user_id = auth.uid()
    GROUP BY dt.tag_id;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_document_tags_document_id ON public.document_tags(document_id);
CREATE INDEX idx_document_tags_tag_id ON public.document_tags(tag_id);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_tags_name ON public.tags(name);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tags
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
