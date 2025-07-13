import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const statSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value is required"),
  sort_order: z.number().min(0),
});

type StatForm = z.infer<typeof statSchema>;

interface Stat {
  id: string;
  label: string;
  value: string;
  sort_order: number;
}

export function StatsManager() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StatForm>({
    resolver: zodResolver(statSchema),
    defaultValues: {
      sort_order: 0,
    },
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase
      .from("stats")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data) {
      setStats(data);
    }
    setLoading(false);
  };

  const onSubmit = async (data: StatForm) => {
    try {
      if (editingStat) {
        const { error } = await supabase
          .from("stats")
          .update(data)
          .eq("id", editingStat.id);

        if (error) throw error;

        toast({
          title: "Statistic updated!",
          description: "The statistic has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from("stats")
          .insert([data as any]);

        if (error) throw error;

        toast({
          title: "Statistic created!",
          description: "The statistic has been created successfully.",
        });
      }

      reset();
      setEditingStat(null);
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save statistic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (stat: Stat) => {
    setEditingStat(stat);
    setValue("label", stat.label);
    setValue("value", stat.value);
    setValue("sort_order", stat.sort_order);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("stats")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Statistic deleted!",
        description: "The statistic has been deleted successfully.",
      });

      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete statistic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingStat(null);
    reset();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Statistics Management</h2>
      </div>

      {/* Stat Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingStat ? "Edit Statistic" : "Add New Statistic"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  {...register("label")}
                  placeholder="Projects Completed"
                />
                {errors.label && (
                  <p className="text-sm text-destructive mt-1">{errors.label.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  {...register("value")}
                  placeholder="50+"
                />
                {errors.value && (
                  <p className="text-sm text-destructive mt-1">{errors.value.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  {...register("sort_order", { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.sort_order && (
                  <p className="text-sm text-destructive mt-1">{errors.sort_order.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingStat ? "Update Statistic" : "Add Statistic"}
              </Button>
              {editingStat && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.id}>
            <CardContent className="p-4 text-center">
              <div className="flex justify-end gap-1 mb-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(stat)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(stat.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-muted-foreground mt-2">
                Order: {stat.sort_order}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}