import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_url?: string;
  github_url?: string;
  image_urls: string[];
}

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      
      setProject(data);
      setLoading(false);
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-24">
            <div className="container-portfolio">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </ThemeProvider>
    );
  }

  if (!project) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-24">
            <div className="container-portfolio text-center">
              <h1 className="text-2xl font-bold mb-4">Project not found</h1>
              <Link to="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24">
          <div className="container-portfolio">
            {/* Back Button */}
            <div className="mb-8">
              <Link to="/">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Project Header */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{project.title}</h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {project.live_url && (
                  <Button size="lg" asChild>
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
                {project.github_url && (
                  <Button variant="outline" size="lg" asChild>
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-5 w-5 mr-2" />
                      View Code
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Project Images */}
            {project.image_urls.length > 0 && (
              <div className="mb-12">
                <div className="grid grid-cols-1 gap-8">
                  {project.image_urls.map((imageUrl, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`${project.title} screenshot ${index + 1}`}
                        className="w-full h-auto"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Details */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Project Overview</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground">
                  This project showcases my skills in modern web development, focusing on 
                  creating user-friendly interfaces and robust functionality. The application 
                  demonstrates best practices in code organization, performance optimization, 
                  and responsive design.
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}