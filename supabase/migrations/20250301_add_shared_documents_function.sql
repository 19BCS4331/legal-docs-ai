-- Create a function to get shared documents
CREATE OR REPLACE FUNCTION get_shared_documents(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id UUID,
  template_id UUID,
  role TEXT,
  template_name TEXT,
  template_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.content,
    d.status,
    d.created_at,
    d.updated_at,
    d.user_id,
    d.template_id,
    dc.role,
    dt.name as template_name,
    dt.description as template_description
  FROM documents d
  INNER JOIN document_collaborators dc ON d.id = dc.document_id
  LEFT JOIN document_templates dt ON d.template_id = dt.id
  WHERE dc.user_id = p_user_id
  AND d.user_id != p_user_id
  ORDER BY d.updated_at DESC;
END;
$$ LANGUAGE plpgsql;
