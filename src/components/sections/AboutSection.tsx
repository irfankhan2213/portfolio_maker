import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Palette, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  about: string;
}

export function AboutSection() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("about")
        .single();
      
      if (data) {
        setProfile(data);
      } else {
        // Default data for demo
        setProfile({
          about: "I'm a passionate full-stack developer with over 5 years of experience creating beautiful, functional, and user-centered digital experiences. I love turning complex problems into simple, elegant solutions that users enjoy."
        });
      }
    };

    fetchProfile();
  }, []);

  const skills = [
    {
      icon: Code,
      title: "Development",
      description: "Full-stack development with modern frameworks like React, Next.js, and Node.js."
    },
    {
      icon: Palette,
      title: "Design",
      description: "Creating beautiful, intuitive user interfaces with attention to detail and user experience."
    },
    {
      icon: Zap,
      title: "Performance",
      description: "Building fast, scalable applications optimized for performance and accessibility."
    }
  ];

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
          {skills.map((skill, index) => (
            <Card key={index} className="text-center card-hover">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <skill.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{skill.title}</h3>
                <p className="text-muted-foreground">{skill.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">50+</div>
            <div className="text-sm text-muted-foreground">Projects Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">5+</div>
            <div className="text-sm text-muted-foreground">Years Experience</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">30+</div>
            <div className="text-sm text-muted-foreground">Happy Clients</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}