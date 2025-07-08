import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  tagline: z.string().optional(),
  about: z.string().optional(),
  email: z.string().email().optional(),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  github_url: z.string().url().optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileManagerProps {
  userId: string;
}

export function ProfileManager({ userId }: ProfileManagerProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (data) {
      setProfile(data);
      reset({
        name: data.name || "",
        tagline: data.tagline || "",
        about: data.about || "",
        email: data.email || "",
        linkedin_url: data.linkedin_url || "",
        github_url: data.github_url || "",
      });
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    
    try {
      const profileData = {
        user_id: userId,
        ...data,
      };

      let result;
      if (profile) {
        result = await supabase
          .from("profiles")
          .update(profileData)
          .eq("user_id", userId);
      } else {
        result = await supabase
          .from("profiles")
          .insert(profileData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_photo_url: publicUrl })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been updated.",
      });
      
      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your portfolio profile information that will be displayed on your website.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
              {profile?.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <Button variant="outline" asChild disabled={uploadingPhoto}>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                  </span>
                </Button>
              </Label>
              <Input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Your full name"
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="your.email@example.com"
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                {...register("tagline")}
                placeholder="Full Stack Developer & Designer"
                className="mt-1"
              />
              {errors.tagline && (
                <p className="text-sm text-destructive mt-1">{errors.tagline.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                {...register("about")}
                placeholder="Tell visitors about yourself..."
                rows={4}
                className="mt-1"
              />
              {errors.about && (
                <p className="text-sm text-destructive mt-1">{errors.about.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  {...register("linkedin_url")}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="mt-1"
                />
                {errors.linkedin_url && (
                  <p className="text-sm text-destructive mt-1">{errors.linkedin_url.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  {...register("github_url")}
                  placeholder="https://github.com/yourusername"
                  className="mt-1"
                />
                {errors.github_url && (
                  <p className="text-sm text-destructive mt-1">{errors.github_url.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}