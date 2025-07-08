import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_url?: string;
  github_url?: string;
  image_urls: string[];
  featured: boolean;
}

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (data) {
        setProjects(data);
      } else {
        // Demo data
        setProjects([
          {
            id: "1",
            title: "E-Commerce Platform",
            description: "A full-stack e-commerce solution with React, Node.js, and Stripe integration.",
            tech_stack: ["React", "Node.js", "PostgreSQL", "Stripe"],
            live_url: "https://example.com",
            github_url: "https://github.com",
            image_urls: [],
            featured: true
          },
          {
            id: "2",
            title: "Task Management App",
            description: "A collaborative task management application with real-time updates.",
            tech_stack: ["Next.js", "TypeScript", "Supabase"],
            live_url: "https://example.com",
            github_url: "https://github.com",
            image_urls: [],
            featured: true
          },
          {
            id: "3",
            title: "Weather Dashboard",
            description: "A beautiful weather dashboard with location-based forecasts.",
            tech_stack: ["React", "Tailwind CSS", "OpenWeather API"],
            live_url: "https://example.com",
            github_url: "https://github.com",
            image_urls: [],
            featured: false
          }
        ]);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section id="projects" className="section-padding bg-section-background">
        <div className="container-portfolio">
          <div className="text-center">
            <div className="h-8 bg-muted rounded w-48 mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section-padding">
      <div className="container-portfolio">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Here are some of my recent projects that showcase my skills and passion for creating exceptional digital experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card key={project.id} className="card-hover overflow-hidden">
              <div className="aspect-video bg-muted relative overflow-hidden">
                {project.image_urls.length > 0 ? (
                  <img
                    src={project.image_urls[0]}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {project.title.split(' ').map(word => word[0]).join('')}
                    </span>
                  </div>
                )}
                {project.featured && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    Featured
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech_stack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  {project.live_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                  {project.github_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-1" />
                        Code
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Projects
          </Button>
        </div>
      </div>
    </section>
  );
}