
import { useState, useEffect } from "react";
import { Github, Linkedin, Mail, Facebook, Twitter, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FooterInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  href?: string;
  icon_name?: string;
  sort_order: number;
}

const iconMap: Record<string, any> = {
  Github,
  Linkedin,
  Mail,
  Facebook,
  Twitter,
  Instagram,
};

export function Footer() {
  const [footerItems, setFooterItems] = useState<FooterInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooterItems();
  }, []);

  const fetchFooterItems = async () => {
    try {
      const { data, error } = await supabase
        .from("footer_info")
        .select("*")
        .order("sort_order");

      if (error) throw error;
      setFooterItems(data || []);
    } catch (error) {
      console.error("Error fetching footer items:", error);
      // Fallback to default items if database fetch fails
      setFooterItems([
        {
          id: "1",
          type: "social",
          label: "GitHub",
          value: "GitHub",
          href: "https://github.com",
          icon_name: "Github",
          sort_order: 1,
        },
        {
          id: "2",
          type: "social",
          label: "LinkedIn",
          value: "LinkedIn",
          href: "https://linkedin.com",
          icon_name: "Linkedin",
          sort_order: 2,
        },
        {
          id: "3",
          type: "social",
          label: "Email",
          value: "Email",
          href: "mailto:hello@example.com",
          icon_name: "Mail",
          sort_order: 3,
        },
        {
          id: "4",
          type: "copyright",
          label: "Copyright Text",
          value: "Your Name. All rights reserved.",
          href: undefined,
          icon_name: undefined,
          sort_order: 4,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = footerItems.filter(item => item.type === "social");
  const copyrightItem = footerItems.find(item => item.type === "copyright");

  if (loading) {
    return (
      <footer className="bg-secondary/50 py-12">
        <div className="container-portfolio">
          <div className="flex flex-col items-center space-y-6">
            <div className="animate-pulse h-6 w-48 bg-muted rounded"></div>
            <div className="animate-pulse h-4 w-64 bg-muted rounded"></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-secondary/50 py-12">
      <div className="container-portfolio">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center space-x-6">
            {socialLinks.map((item) => {
              const IconComponent = item.icon_name ? iconMap[item.icon_name] : null;
              
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={item.label}
                >
                  {IconComponent ? (
                    <IconComponent className="h-6 w-6" />
                  ) : (
                    <span className="text-sm">{item.value}</span>
                  )}
                </a>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {copyrightItem?.value || "Your Name. All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
