-- Create table for service/skill cards
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for statistics/metrics
CREATE TABLE public.stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for contact information
CREATE TABLE public.contact_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'email', 'phone', 'location'
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  href TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(type)
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- Create policies for public viewing
CREATE POLICY "Services are viewable by everyone" 
ON public.services 
FOR SELECT 
USING (true);

CREATE POLICY "Stats are viewable by everyone" 
ON public.stats 
FOR SELECT 
USING (true);

CREATE POLICY "Contact info is viewable by everyone" 
ON public.contact_info 
FOR SELECT 
USING (true);

-- Create policies for authenticated management
CREATE POLICY "Authenticated users can manage services" 
ON public.services 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage stats" 
ON public.stats 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage contact info" 
ON public.contact_info 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stats_updated_at
BEFORE UPDATE ON public.stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_info_updated_at
BEFORE UPDATE ON public.contact_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data
INSERT INTO public.services (title, description, icon_name, sort_order) VALUES
('Development', 'Full-stack development with modern frameworks like React, Next.js, and Node.js.', 'Code', 1),
('Design', 'Creating beautiful, intuitive user interfaces with attention to detail and user experience.', 'Palette', 2),
('Performance', 'Building fast, scalable applications optimized for performance and accessibility.', 'Zap', 3);

INSERT INTO public.stats (label, value, sort_order) VALUES
('Projects Completed', '50+', 1),
('Years Experience', '5+', 2),
('Happy Clients', '30+', 3),
('Support', '24/7', 4);

INSERT INTO public.contact_info (type, label, value, href) VALUES
('email', 'Email', 'hello@example.com', 'mailto:hello@example.com'),
('phone', 'Phone', '+1 (555) 123-4567', 'tel:+15551234567'),
('location', 'Location', 'San Francisco, CA', '#');