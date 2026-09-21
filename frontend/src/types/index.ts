export type User = {
  id: number;
  email: string;
  full_name: string;
  is_active?: boolean;
};

export type Requirement = {
  id: number;
  title: string;
  requirement_text: string;
  product: string;
  product_category: string;
  application: string;
  industry: string;
  quantity: string;
  technical_requirements: string;
  status: string;
  extracted_data: Record<string, unknown>;
  user_id: number;
  project_id?: number | null;
  created_at: string;
  updated_at: string;
};

export type Standard = {
  id: number;
  is_number: string;
  title: string;
  description: string;
  scope: string;
  category: string;
  industry: string;
  product_type: string;
  application: string;
  status: string;
  current_version: string;
  year: number | null;
  review_year: number | null;
  keywords: string;
  technical_parameters: string;
  source: string;
  source_url: string;
  last_verified_at?: string | null;
};

export type Recommendation = {
  id: number;
  standard_id: number;
  score: number;
  why_it_matches: string;
  relevant_elements: string;
  explanation: string;
  standard?: Standard;
};

export type AuditLog = {
  id: number;
  action: string;
  object_type: string;
  details: string;
  created_at: string;
};
