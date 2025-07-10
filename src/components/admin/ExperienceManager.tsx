
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Briefcase,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const experienceSchema = z.object({
  company: z.string().min(2, "Company name must be at least 2 characters"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  description: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  location: z.string().optional(),
  is_current: z.boolean().default(false),
});

type ExperienceForm = z.infer<typeof experienceSchema>;

interface Experience {
  id: string;
  company: string;
  position: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  is_current: boolean;
  sort_order: number;
}

export function ExperienceManager() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExperienceForm>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      is_current: false,
    },
  });

  const watchedIsCurrent = watch("is_current");

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    const { data } = await supabase
      .from("experiences")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (data) {
      setExperiences(data);
    }
  };

  const onSubmit = async (data: ExperienceForm) => {
    setIsLoading(true);
    
    try {
      const experienceData = {
        company: data.company,
        position: data.position,
        description: data.description || null,
        start_date: data.start_date,
        end_date: data.is_current ? null : data.end_date,
        location: data.location || null,
        is_current: data.is_current,
      };

      let result;
      if (editingExperience) {
        result = await supabase
          .from("experiences")
          .update(experienceData)
          .eq("id", editingExperience.id);
      } else {
        result = await supabase
          .from("experiences")
          .insert({
            ...experienceData,
            sort_order: experiences.length,
          });
      }

      if (result.error) throw result.error;

      toast({
        title: editingExperience ? "Experience updated" : "Experience added",
        description: `Experience has been ${editingExperience ? "updated" : "added"} successfully.`,
      });
      
      handleCloseDialog();
      fetchExperiences();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save experience.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    reset({
      company: experience.company,
      position: experience.position,
      description: experience.description || "",
      start_date: experience.start_date,
      end_date: experience.end_date || "",
      location: experience.location || "",
      is_current: experience.is_current,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (experienceId: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    
    try {
      const { error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", experienceId);

      if (error) throw error;

      toast({
        title: "Experience deleted",
        description: "Experience has been deleted successfully.",
      });
      
      fetchExperiences();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete experience.",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExperience(null);
    reset({
      company: "",
      position: "",
      description: "",
      start_date: "",
      end_date: "",
      location: "",
      is_current: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Work Experience</h2>
          <p className="text-muted-foreground">
            Manage your professional work experience and career history.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingExperience ? "Edit Experience" : "Add New Experience"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    {...register("company")}
                    placeholder="Google, Microsoft, etc."
                    className="mt-1"
                  />
                  {errors.company && (
                    <p className="text-sm text-destructive mt-1">{errors.company.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    {...register("position")}
                    placeholder="Software Engineer, Product Manager, etc."
                    className="mt-1"
                  />
                  {errors.position && (
                    <p className="text-sm text-destructive mt-1">{errors.position.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="San Francisco, CA / Remote"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your role, responsibilities, and achievements..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="month"
                    {...register("start_date")}
                    className="mt-1"
                  />
                  {errors.start_date && (
                    <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="month"
                    {...register("end_date")}
                    className="mt-1"
                    disabled={watchedIsCurrent}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_current"
                  {...register("is_current")}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_current">I currently work here</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Experience"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {experiences.map((experience) => (
          <Card key={experience.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{experience.position}</h3>
                  </div>
                  <p className="text-primary font-medium mb-1">{experience.company}</p>
                  {experience.location && (
                    <p className="text-sm text-muted-foreground mb-2">{experience.location}</p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(experience.start_date + '-01').toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })} - {
                        experience.is_current 
                          ? 'Present' 
                          : experience.end_date 
                            ? new Date(experience.end_date + '-01').toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })
                            : 'Present'
                      }
                    </span>
                  </div>
                  {experience.description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {experience.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(experience)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(experience.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {experiences.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No work experience yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your professional experience to showcase your career journey.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Experience
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
