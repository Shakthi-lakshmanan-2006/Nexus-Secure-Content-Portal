-- ==============================================================================
-- NEXUS: SECURE CONTENT PORTAL SCHEMA
-- Supabase PostgreSQL Migration
-- Includes Role-Based Access Control (RBAC), Row Level Security (RLS),
-- Auditing, and Private Storage Enclave configurations
-- ==============================================================================

-- 1. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('ADMIN', 'VIEWER')) NOT NULL DEFAULT 'VIEWER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on email and role
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. Create Contents Table
CREATE TABLE IF NOT EXISTS public.contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  type TEXT CHECK (type IN ('VIDEO', 'PDF', 'HTML')) NOT NULL,
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content Indexes for high-performance searching and filtering
CREATE INDEX IF NOT EXISTS idx_contents_title ON public.contents USING gin (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_contents_category ON public.contents(category);
CREATE INDEX IF NOT EXISTS idx_contents_type ON public.contents(type);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON public.contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_tags ON public.contents USING gin (tags);

-- 3. Create Audit Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  action TEXT CHECK (action IN ('UPLOAD', 'EDIT', 'DELETE', 'VIEW', 'LOGIN', 'SECURITY_TEST')) NOT NULL,
  content_id UUID REFERENCES public.contents(id) ON DELETE SET NULL,
  content_title TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles:
-- Any authenticated user can view their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Contents:
-- Authenticated users (both ADMIN and VIEWER) can view published content metadata
CREATE POLICY "Authenticated users can view published contents"
  ON public.contents FOR SELECT
  TO authenticated
  USING (published = true);

-- Only ADMIN users can insert new content
CREATE POLICY "Only admins can insert content"
  ON public.contents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Only ADMIN users can update content
CREATE POLICY "Only admins can update content"
  ON public.contents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Only ADMIN users can delete content
CREATE POLICY "Only admins can delete content"
  ON public.contents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Activity Logs:
-- Only ADMIN users can read audit activity logs
CREATE POLICY "Only admins can read activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- System / Service Role can insert activity logs
CREATE POLICY "Authenticated users can insert activity logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 5. PRIVATE STORAGE BUCKET CONFIGURATION
-- ==============================================================================

-- Create Private bucket 'secure-content' (public = false)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'secure-content',
  'secure-content',
  false,
  262144000, -- 250 MB
  ARRAY['video/mp4', 'video/webm', 'application/pdf', 'text/html']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 262144000;

-- Storage RLS:
-- Deny all public / unauthenticated access to storage.objects in 'secure-content'
CREATE POLICY "Deny public access to secure-content"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id <> 'secure-content');

-- Only Admins can upload to 'secure-content'
CREATE POLICY "Admins can upload to secure-content"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'secure-content' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Only Admins can delete objects from 'secure-content'
CREATE POLICY "Admins can delete from secure-content"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'secure-content' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );
