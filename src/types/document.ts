export interface Document {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  user_id: string
  versions?: DocumentVersion[]
  signatures?: { [key: string]: string }
  metadata?: {
    type?: string
    status?: string
    jurisdiction?: string
    [key: string]: any
  }
}

export interface DocumentVersion {
  id: string
  document_id: string
  content: string
  created_at: string
  user_id: string
  version: number
  metadata?: {
    changes?: string[]
    [key: string]: any
  }
}
