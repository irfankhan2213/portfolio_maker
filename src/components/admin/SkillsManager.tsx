
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
  Code,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const skillSchema = z.object({
  name: z.string().min(2, "Skill name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  proficiency: z.string().min(1, "Proficiency level is required"),
});

type SkillForm = z.infer<typeof skillSchema>;

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: string;
  sort_order: number;
}

const categories = [
  "Programming Languages",
  "Frameworks & Libraries",
  "Databases",
  "Tools & Platforms",
  "Cloud Services",
  "Design",
  "Soft Skills",
  "Other"
];

const proficiencyLevels = [
  { value: "beginner", label: "Beginner", stars: 1 },
  { value: "intermediate", label: "Intermediate", stars: 2 },
  { value: "advanced", label: "Advanced", stars: 3 },
  { value: "expert", label: "Expert", stars: 4 },
];

export function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SkillForm>({
    resolver: zodResolver(skillSchema),
  });

  const watchedCategory = watch("category");
  const watchedProficiency = watch("proficiency");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    const { data } = await supabase
      .from("skills")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });
    
    if (data) {
      setSkills(data);
    }
  };

  const onSubmit = async (data: SkillForm) => {
    setIsLoading(true);
    
    try {
      const skillData = {
        name: data.name,
        category: data.category,
        proficiency: data.proficiency,
      };

      let result;
      if (editingSkill) {
        result = await supabase
          .from("skills")
          .update(skillData)
          .eq("id", editingSkill.id);
      } else {
        result = await supabase
          .from("skills")
          .insert({
            ...skillData,
            sort_order: skills.filter(s => s.category === data.category).length,
          });
      }

      if (result.error) throw result.error;

      toast({
        title: editingSkill ? "Skill updated" : "Skill added",
        description: `Skill has been ${editingSkill ? "updated" : "added"} successfully.`,
      });
      
      handleCloseDialog();
      fetchSkills();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save skill.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    reset({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (skillId: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    
    try {
      const { error } = await supabase
        .from("skills")
        .delete()
        .eq("id", skillId);

      if (error) throw error;

      toast({
        title: "Skill deleted",
        description: "Skill has been deleted successfully.",
      });
      
      fetchSkills();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete skill.",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSkill(null);
    reset({
      name: "",
      category: "",
      proficiency: "",
    });
  };

  const getStarsForProficiency = (proficiency: string) => {
    const level = proficiencyLevels.find(p => p.value === proficiency);
    return level ? level.stars : 1;
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Skills & Technologies</h2>
          <p className="text-muted-foreground">
            Manage your technical and professional skills with proficiency levels.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSkill ? "Edit Skill" : "Add New Skill"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Skill Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="React, Python, UI/UX Design, etc."
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={watchedCategory} onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="proficiency">Proficiency Level *</Label>
                <Select value={watchedProficiency} onValueChange={(value) => setValue("proficiency", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select proficiency level" />
                  </SelectTrigger>
                  <SelectContent>
                    {proficiencyLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <span>{level.label}</span>
                          <div className="flex">
                            {[...Array(4)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < level.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.proficiency && (
                  <p className="text-sm text-destructive mt-1">{errors.proficiency.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Skill"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categorySkills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{skill.name}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(4)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < getStarsForProficiency(skill.proficiency) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {proficiencyLevels.find(p => p.value === skill.proficiency)?.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(skill)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(skill.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {skills.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Code className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No skills added yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your technical and professional skills to showcase your expertise.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Skill
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
