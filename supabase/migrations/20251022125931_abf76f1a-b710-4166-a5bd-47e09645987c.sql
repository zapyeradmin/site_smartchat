-- Fix Critical Security Issues: Proper Role Management and RLS Policies
-- This version handles existing NULL data

-- ============================================================================
-- 1. CRITICAL: Implement Proper Role Management System
-- ============================================================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create separate roles table with strict RLS
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can only view their own roles (read-only)
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Create security definer function for role checks (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Remove insecure role column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- ============================================================================
-- 2. Fix Clients Table RLS - Owner-Scoped Access
-- ============================================================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage clients" ON public.clients;

-- Get first admin user or any user to assign existing clients
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Get the first user from auth.users
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  -- Update NULL created_by values to first user
  IF first_user_id IS NOT NULL THEN
    UPDATE public.clients 
    SET created_by = first_user_id 
    WHERE created_by IS NULL;
  END IF;
END $$;

-- Now make created_by required and set default
ALTER TABLE public.clients ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.clients ALTER COLUMN created_by SET NOT NULL;

-- Add owner-scoped policies
CREATE POLICY "Users can view their own clients"
ON public.clients FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own clients"
ON public.clients FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own clients"
ON public.clients FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own clients"
ON public.clients FOR DELETE
USING (auth.uid() = created_by);

-- ============================================================================
-- 3. Fix Deals Table RLS - Assignment-Based Access
-- ============================================================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage deals" ON public.deals;

-- Users can view deals they're assigned to or deals for their clients
CREATE POLICY "Users can view assigned deals"
ON public.deals FOR SELECT
USING (
  auth.uid() = assigned_to 
  OR auth.uid() IN (
    SELECT created_by FROM public.clients WHERE id = deals.client_id
  )
);

-- Users can insert deals only for their own clients
CREATE POLICY "Users can insert deals for their clients"
ON public.deals FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT created_by FROM public.clients WHERE id = client_id
  )
);

-- Users can update deals they're assigned to or own the client
CREATE POLICY "Users can update assigned deals"
ON public.deals FOR UPDATE
USING (
  auth.uid() = assigned_to 
  OR auth.uid() IN (
    SELECT created_by FROM public.clients WHERE id = deals.client_id
  )
);

-- Users can delete deals they're assigned to
CREATE POLICY "Users can delete assigned deals"
ON public.deals FOR DELETE
USING (auth.uid() = assigned_to);

-- ============================================================================
-- 4. Fix Integrations Table RLS - Owner-Scoped Access
-- ============================================================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage integrations" ON public.integrations;

-- Handle existing NULL created_by values
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    UPDATE public.integrations 
    SET created_by = first_user_id 
    WHERE created_by IS NULL;
  END IF;
END $$;

-- Make created_by required and set default
ALTER TABLE public.integrations ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.integrations ALTER COLUMN created_by SET NOT NULL;

-- Add owner-scoped policies
CREATE POLICY "Users can view own integrations"
ON public.integrations FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can create integrations"
ON public.integrations FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own integrations"
ON public.integrations FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own integrations"
ON public.integrations FOR DELETE
USING (auth.uid() = created_by);