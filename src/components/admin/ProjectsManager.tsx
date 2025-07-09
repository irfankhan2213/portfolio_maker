import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Save, 
  X,
  ExternalLink,
  Github,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tech_stack: z.string(),
  live_url: z.string().url().optional().or(z.literal("")),
  github_url: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
});

type ProjectForm = z.infer<typeof projectSchema>;

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_url?: string;
  github_url?: string;
  image_urls: string[];
  featured: boolean;
  sort_order: number;
}

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      featured: false,
    },
  });

  const watchedFeatured = watch("featured");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (data) {
      setProjects(data);
    }
  };

  const onSubmit = async (data: ProjectForm) => {
    setIsLoading(true);
    
    try {
      const techStack = data.tech_stack
        .split(",")
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0);

      const projectData = {
        title: data.title, // Ensure title is always present
        description: data.description || null,
        tech_stack: techStack,
        live_url: data.live_url || null,
        github_url: data.github_url || null,
        featured: data.featured,
      };

      let result;
      if (editingProject) {
        result = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editingProject.id);
      } else {
        result = await supabase
          .from("projects")
          .insert({
            ...projectData,
            image_urls: [],
            sort_order: projects.length,
          });
      }

      if (result.error) throw result.error;

      toast({
        title: editingProject ? "Project updated" : "Project created",
        description: `Project has been ${editingProject ? "updated" : "created"} successfully.`,
      });
      
      handleCloseDialog();
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save project.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    reset({
      title: project.title,
      description: project.description,
      tech_stack: project.tech_stack.join(", "),
      live_url: project.live_url || "",
      github_url: project.github_url || "",
      featured: project.featured,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully.",
      });
      
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project.",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
    reset({
      title: "",
      description: "",
      tech_stack: "",
      live_url: "",
      github_url: "",
      featured: false,
    });
  };

  const handleImageUpload = async (projectId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploadingImages(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}-${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);
      
      // Get current project
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      // Update project with new images
      const updatedImageUrls = [...project.image_urls, ...imageUrls];
      
      const { error: updateError } = await supabase
        .from("projects")
        .update({ image_urls: updatedImageUrls })
        .eq("id", projectId);

      if (updateError) throw updateError;

      toast({
        title: "Images uploaded",
        description: "Project images have been uploaded successfully.",
      });
      
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images.",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-muted-foreground">
            Manage your portfolio projects and showcase your work.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "Add New Project"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="My Awesome Project"
                  className="mt-1"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe what this project does and what technologies you used..."
                  rows={4}
                  className="mt-1"
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="tech_stack">Tech Stack (comma separated) *</Label>
                <Input
                  id="tech_stack"
                  {...register("tech_stack")}
                  placeholder="React, TypeScript, Tailwind CSS, Supabase"
                  className="mt-1"
                />
                {errors.tech_stack && (
                  <p className="text-sm text-destructive mt-1">{errors.tech_stack.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="live_url">Live URL</Label>
                  <Input
                    id="live_url"
                    {...register("live_url")}
                    placeholder="https://myproject.com"
                    className="mt-1"
                  />
                  {errors.live_url && (
                    <p className="text-sm text-destructive mt-1">{errors.live_url.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="github_url">GitHub URL</Label>
                  <Input
                    id="github_url"
                    {...register("github_url")}
                    placeholder="https://github.com/user/repo"
                    className="mt-1"
                  />
                  {errors.github_url && (
                    <p className="text-sm text-destructive mt-1">{errors.github_url.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={watchedFeatured}
                  onCheckedChange={(checked) => setValue("featured", checked)}
                />
                <Label htmlFor="featured">Featured Project</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Project"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
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
                <Badge className="absolute top-2 left-2 bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-1">{project.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {project.tech_stack.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {project.tech_stack.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.tech_stack.length - 3}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {project.live_url && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {project.github_url && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(project)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <Label htmlFor={`images-${project.id}`} className="cursor-pointer">
                  <Button size="sm" variant="outline" asChild disabled={uploadingImages}>
                    <span>
                      <Upload className="h-3 w-3 mr-1" />
                      Add Images
                    </span>
                  </Button>
                </Label>
                <Input
                  id={`images-${project.id}`}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(project.id, e)}
                  disabled={uploadingImages}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {project.image_urls.length} images uploaded
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your portfolio by adding your first project.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
