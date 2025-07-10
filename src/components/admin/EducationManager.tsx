
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
  GraduationCap,
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

const educationSchema = z.object({
  institution: z.string().min(2, "Institution name must be at least 2 characters"),
  degree: z.string().min(2, "Degree must be at least 2 characters"),
  field_of_study: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  gpa: z.string().optional(),
  description: z.string().optional(),
  is_current: z.boolean().default(false),
});

type EducationForm = z.infer<typeof educationSchema>;

interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
  description?: string;
  is_current: boolean;
  sort_order: number;
}

export function EducationManager() {
  const [educations, setEducations] = useState<Education[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EducationForm>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      is_current: false,
    },
  });

  const watchedIsCurrent = watch("is_current");

  useEffect(() => {
    fetchEducations();
  }, []);

  const fetchEducations = async () => {
    const { data } = await supabase
      .from("educations")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (data) {
      setEducations(data);
    }
  };

  const onSubmit = async (data: EducationForm) => {
    setIsLoading(true);
    
    try {
      const educationData = {
        institution: data.institution,
        degree: data.degree,
        field_of_study: data.field_of_study || null,
        start_date: data.start_date,
        end_date: data.is_current ? null : data.end_date,
        gpa: data.gpa || null,
        description: data.description || null,
        is_current: data.is_current,
      };

      let result;
      if (editingEducation) {
        result = await supabase
          .from("educations")
          .update(educationData)
          .eq("id", editingEducation.id);
      } else {
        result = await supabase
          .from("educations")
          .insert({
            ...educationData,
            sort_order: educations.length,
          });
      }

      if (result.error) throw result.error;

      toast({
        title: editingEducation ? "Education updated" : "Education added",
        description: `Education has been ${editingEducation ? "updated" : "added"} successfully.`,
      });
      
      handleCloseDialog();
      fetchEducations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save education.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (education: Education) => {
    setEditingEducation(education);
    reset({
      institution: education.institution,
      degree: education.degree,
      field_of_study: education.field_of_study || "",
      start_date: education.start_date,
      end_date: education.end_date || "",
      gpa: education.gpa || "",
      description: education.description || "",
      is_current: education.is_current,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (educationId: string) => {
    if (!confirm("Are you sure you want to delete this education?")) return;
    
    try {
      const { error } = await supabase
        .from("educations")
        .delete()
        .eq("id", educationId);

      if (error) throw error;

      toast({
        title: "Education deleted",
        description: "Education has been deleted successfully.",
      });
      
      fetchEducations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete education.",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEducation(null);
    reset({
      institution: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
      gpa: "",
      description: "",
      is_current: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Education</h2>
          <p className="text-muted-foreground">
            Manage your educational background and qualifications.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEducation ? "Edit Education" : "Add New Education"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="institution">Institution *</Label>
                  <Input
                    id="institution"
                    {...register("institution")}
                    placeholder="Harvard University, MIT, etc."
                    className="mt-1"
                  />
                  {errors.institution && (
                    <p className="text-sm text-destructive mt-1">{errors.institution.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="degree">Degree *</Label>
                  <Input
                    id="degree"
                    {...register("degree")}
                    placeholder="Bachelor of Science, Master of Arts, etc."
                    className="mt-1"
                  />
                  {errors.degree && (
                    <p className="text-sm text-destructive mt-1">{errors.degree.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="field_of_study">Field of Study</Label>
                <Input
                  id="field_of_study"
                  {...register("field_of_study")}
                  placeholder="Computer Science, Business Administration, etc."
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    {...register("gpa")}
                    placeholder="3.8/4.0"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Relevant coursework, achievements, activities, etc."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_current"
                  {...register("is_current")}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_current">Currently studying here</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Education"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {educations.map((education) => (
          <Card key={education.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{education.degree}</h3>
                  </div>
                  <p className="text-primary font-medium mb-1">{education.institution}</p>
                  {education.field_of_study && (
                    <p className="text-sm text-muted-foreground mb-2">{education.field_of_study}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(education.start_date + '-01').toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })} - {
                          education.is_current 
                            ? 'Present' 
                            : education.end_date 
                              ? new Date(education.end_date + '-01').toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  year: 'numeric' 
                                })
                              : 'Present'
                        }
                      </span>
                    </div>
                    {education.gpa && (
                      <span>GPA: {education.gpa}</span>
                    )}
                  </div>
                  {education.description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {education.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(education)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(education.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {educations.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No education added yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your educational background to showcase your qualifications.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Education
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
