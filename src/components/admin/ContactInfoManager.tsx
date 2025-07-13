import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Phone, MapPin, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value is required"),
  href: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  href?: string;
}

const contactTypes = [
  { type: "email", icon: Mail, label: "Email" },
  { type: "phone", icon: Phone, label: "Phone" },
  { type: "location", icon: MapPin, label: "Location" },
];

export function ContactInfoManager() {
  const [contactInfos, setContactInfos] = useState<ContactInfo[]>([]);
  const [editingContact, setEditingContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    fetchContactInfos();
  }, []);

  const fetchContactInfos = async () => {
    const { data } = await supabase
      .from("contact_info")
      .select("*")
      .order("type", { ascending: true });

    if (data) {
      setContactInfos(data);
    }
    setLoading(false);
  };

  const onSubmit = async (data: ContactForm) => {
    if (!editingContact) return;

    try {
      const { error } = await supabase
        .from("contact_info")
        .update(data)
        .eq("id", editingContact.id);

      if (error) throw error;

      toast({
        title: "Contact info updated!",
        description: "The contact information has been updated successfully.",
      });

      reset();
      setEditingContact(null);
      fetchContactInfos();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact info. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (contact: ContactInfo) => {
    setEditingContact(contact);
    setValue("label", contact.label);
    setValue("value", contact.value);
    setValue("href", contact.href || "");
  };

  const cancelEdit = () => {
    setEditingContact(null);
    reset();
  };

  const getIcon = (type: string) => {
    const contactType = contactTypes.find(ct => ct.type === type);
    return contactType?.icon || Mail;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contact Information</h2>
      </div>

      {editingContact && (
        <Card>
          <CardHeader>
            <CardTitle>Edit {editingContact.type} Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    {...register("label")}
                    placeholder="Email"
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
                    placeholder="hello@example.com"
                  />
                  {errors.value && (
                    <p className="text-sm text-destructive mt-1">{errors.value.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="href">Link (href)</Label>
                <Input
                  id="href"
                  {...register("href")}
                  placeholder="mailto:hello@example.com"
                />
                {errors.href && (
                  <p className="text-sm text-destructive mt-1">{errors.href.message}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit">Update Contact Info</Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Contact Info List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contactInfos.map((contact) => {
          const IconComponent = getIcon(contact.type);
          return (
            <Card key={contact.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(contact)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                <h4 className="font-medium mb-1">{contact.label}</h4>
                <p className="text-sm text-muted-foreground mb-2">{contact.value}</p>
                {contact.href && (
                  <p className="text-xs text-muted-foreground">Link: {contact.href}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}