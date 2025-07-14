
-- Create footer_info table to store editable footer data
CREATE TABLE public.footer_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'social' or 'copyright'
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  href TEXT, -- for social media links
  icon_name TEXT, -- for social media icons
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.footer_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Footer info is viewable by everyone" 
  ON public.footer_info FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage footer info" 
  ON public.footer_info FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER footer_info_updated_at
  BEFORE UPDATE ON public.footer_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default footer data
INSERT INTO public.footer_info (type, label, value, href, icon_name, sort_order) VALUES
('social', 'GitHub', 'GitHub', 'https://github.com', 'Github', 1),
('social', 'LinkedIn', 'LinkedIn', 'https://linkedin.com', 'Linkedin', 2),
('social', 'Email', 'Email', 'mailto:hello@example.com', 'Mail', 3),
('copyright', 'Copyright Text', 'Your Name. All rights reserved.', NULL, NULL, 1);
