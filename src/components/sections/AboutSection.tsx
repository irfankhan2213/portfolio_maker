import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Palette, Zap, Monitor, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  about: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
}

interface Stat {
  id: string;
  label: string;
  value: string;
  sort_order: number;
}

export function AboutSection() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("about")
        .single();
      
      if (profileData) {
        setProfile(profileData);
      } else {
        setProfile({
          about: "I'm a passionate full-stack developer with over 5 years of experience creating beautiful, functional, and user-centered digital experiences. I love turning complex problems into simple, elegant solutions that users enjoy."
        });
      }

      // Fetch services
      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });

      if (servicesData) {
        setServices(servicesData);
      }

      // Fetch stats
      const { data: statsData } = await supabase
        .from("stats")
        .select("*")
        .order("sort_order", { ascending: true });

      if (statsData) {
        setStats(statsData);
      }
    };

    fetchData();
  }, []);

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Code,
      Palette,
      Zap,
      Monitor,
      Smartphone,
    };
    return iconMap[iconName] || Code;
  };

  if (!profile) return null;

  return (
    <section id="about" className="section-padding">
      <div className="container-portfolio">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            About <span className="text-gradient">Me</span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {profile.about}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = getIcon(service.icon_name);
            return (
              <Card key={service.id} className="text-center card-hover">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.id}>
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}