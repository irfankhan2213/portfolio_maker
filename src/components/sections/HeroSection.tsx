
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, MapPin, Clock, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  name: string;
  tagline: string;
  profile_photo_url: string;
  location?: string;
  years_of_experience?: string;
  availability_status?: string;
  phone?: string;
  resume_url?: string;
  website_url?: string;
}

export function HeroSection() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, tagline, profile_photo_url, location, years_of_experience, availability_status, phone, resume_url, website_url")
        .single();
      
      if (data && !error) {
        setProfile(data);
      } else {
        // Default data for demo
        setProfile({
          name: "Your Name",
          tagline: "Full Stack Developer & Designer",
          profile_photo_url: ""
        });
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return null;

  return (
    <section className="min-h-screen flex items-center justify-center relative">
      <div className="container-portfolio text-center space-y-8">
        {/* Profile Photo */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/60 p-1">
            <div className="w-full h-full rounded-full overflow-hidden bg-background">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Name and Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Hi, I'm <span className="text-gradient">{profile.name}</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            {profile.tagline}
          </p>
          
          {/* Additional Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.years_of_experience && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{profile.years_of_experience}</span>
              </div>
            )}
            {profile.availability_status && (
              <div className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs">
                {profile.availability_status}
              </div>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button size="lg" className="btn-primary">
            <a href="#projects">View My Work</a>
          </Button>
          <Button variant="outline" size="lg">
            <a href="#contact">Get In Touch</a>
          </Button>
          {profile.resume_url && (
            <Button variant="outline" size="lg" asChild>
              <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download Resume
              </a>
            </Button>
          )}
          {profile.website_url && (
            <Button variant="ghost" size="lg" asChild>
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Website
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  );
}
