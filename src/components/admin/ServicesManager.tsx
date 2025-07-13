import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2, Code, Palette, Zap, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon_name: z.string().min(1, "Icon is required"),
  sort_order: z.number().min(0),
});

type ServiceForm = z.infer<typeof serviceSchema>;

interface Service {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
}

const iconOptions = [
  { value: "Code", label: "Code", icon: Code },
  { value: "Palette", label: "Palette", icon: Palette },
  { value: "Zap", label: "Zap", icon: Zap },
  { value: "Monitor", label: "Monitor", icon: Monitor },
  { value: "Smartphone", label: "Smartphone", icon: Smartphone },
];

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      sort_order: 0,
    },
  });

  const selectedIcon = watch("icon_name");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data) {
      setServices(data);
    }
    setLoading(false);
  };

  const onSubmit = async (data: ServiceForm) => {
    try {
      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update(data)
          .eq("id", editingService.id);

        if (error) throw error;

        toast({
          title: "Service updated!",
          description: "The service has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from("services")
          .insert([data as any]);

        if (error) throw error;

        toast({
          title: "Service created!",
          description: "The service has been created successfully.",
        });
      }

      reset();
      setEditingService(null);
      fetchServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setValue("title", service.title);
    setValue("description", service.description);
    setValue("icon_name", service.icon_name);
    setValue("sort_order", service.sort_order);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Service deleted!",
        description: "The service has been deleted successfully.",
      });

      fetchServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingService(null);
    reset();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Services Management</h2>
      </div>

      {/* Service Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingService ? "Edit Service" : "Add New Service"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Service title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="icon_name">Icon</Label>
                <Select value={selectedIcon} onValueChange={(value) => setValue("icon_name", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.icon_name && (
                  <p className="text-sm text-destructive mt-1">{errors.icon_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Service description"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
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

            <div className="flex gap-2">
              <Button type="submit">
                {editingService ? "Update Service" : "Add Service"}
              </Button>
              {editingService && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{service.title}</h3>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {service.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Icon: {service.icon_name}</span>
                <span>Order: {service.sort_order}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}