export type UserSubscription = {
  id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'cancelled';
  plan_type: 'free' | 'pro' | 'enterprise';
  current_period_end: string;
  created_at: string;
  updated_at: string;
};

export interface Template {
  id: string
  name: string
  description: string
  content: string
  created_at: string
  updated_at: string
  category: string
  available_in_plan: string[]
  required_fields: Record<string, { label: string; type: string, required: boolean }>
  prompt_template: string
}

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
  user_id: string
}

export interface DocumentTag {
  document_id: string
  tag_id: string
  created_at: string
  tag: Tag
}

export interface Document {
  id: string
  title: string
  content: string
  user_id: string
  template_id: string | null
  input_data: Record<string, any>
  status: 'draft' | 'generated' | 'completed'
  created_at: string
  updated_at: string
  template?: Template
  tags?: Tag[]
}

export interface DocumentVersion {
  id: string
  document_id: string
  content: string
  created_at: string
  created_by: string
  version_number: number
  change_summary?: string
}

export interface DocumentInput {
  title: string
  template_id?: string
  input_data?: Record<string, any>
}

export type UserCredits = {
  id: string
  user_id: string
  amount: number
  created_at: string
  updated_at: string
};

export type PricingPlan = {
  id: string;
  name: string;
  price: number;
  features: string[];
  documentsPerMonth: number;
  isPopular?: boolean;
};
