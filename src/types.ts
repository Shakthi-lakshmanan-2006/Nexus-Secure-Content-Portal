export type UserRole = 'ADMIN' | 'VIEWER';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

export type ContentType = 'VIDEO' | 'PDF' | 'HTML';
export type SubmissionStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  type: ContentType;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  created_by: string;
  created_by_name?: string;
  created_by_email?: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  status: SubmissionStatus;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  view_count: number;
  last_viewed_at: string | null;
  duration?: string; // For videos
  page_count?: number; // For PDFs
  rating?: number;
  rating_count?: number;
  is_favorite?: boolean;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: 'UPLOAD' | 'EDIT' | 'DELETE' | 'VIEW' | 'LOGIN' | 'SECURITY_TEST' | 'SUBMIT' | 'APPROVE' | 'REJECT';
  content_id?: string;
  content_title?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AdminStats {
  total_content: number;
  total_videos: number;
  total_pdfs: number;
  total_html: number;
  total_views: number;
  pending_reviews: number;
}

export interface SecurityTestResult {
  id: string;
  name: string;
  description: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  details: string;
  timestamp: string;
}

export interface AuthSessionResponse {
  authenticated: boolean;
  user: UserProfile | null;
}
