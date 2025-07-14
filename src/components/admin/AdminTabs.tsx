
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  FolderOpen, 
  MessageSquare, 
  Settings, 
  Shield,
  Briefcase,
  Code,
  GraduationCap,
  Zap,
  BarChart3,
  Phone
} from "lucide-react";
import { ProfileManager } from "@/components/admin/ProfileManager";
import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { ContactMessages } from "@/components/admin/ContactMessages";
import { ExperienceManager } from "@/components/admin/ExperienceManager";
import { SkillsManager } from "@/components/admin/SkillsManager";
import { EducationManager } from "@/components/admin/EducationManager";
import { ServicesManager } from "@/components/admin/ServicesManager";
import { StatsManager } from "@/components/admin/StatsManager";
import { ContactInfoManager } from "@/components/admin/ContactInfoManager";
import { FooterManager } from "@/components/admin/FooterManager";
import { AdminSettings } from "@/components/admin/AdminSettings";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AdminTabsProps {
  user: SupabaseUser | null;
}

export function AdminTabs({ user }: AdminTabsProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-5 lg:grid-cols-11">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="services" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Services
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Stats
        </TabsTrigger>
        <TabsTrigger value="contact-info" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Contact
        </TabsTrigger>
        <TabsTrigger value="experience" className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Experience
        </TabsTrigger>
        <TabsTrigger value="skills" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          Skills
        </TabsTrigger>
        <TabsTrigger value="education" className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Education
        </TabsTrigger>
        <TabsTrigger value="projects" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Projects
        </TabsTrigger>
        <TabsTrigger value="messages" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Messages
        </TabsTrigger>
        <TabsTrigger value="footer" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Footer
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <div className="mt-8">
        <TabsContent value="profile">
          <ProfileManager userId={user?.id || 'anonymous'} />
        </TabsContent>

        <TabsContent value="services">
          <ServicesManager />
        </TabsContent>

        <TabsContent value="stats">
          <StatsManager />
        </TabsContent>

        <TabsContent value="contact-info">
          <ContactInfoManager />
        </TabsContent>

        <TabsContent value="experience">
          <ExperienceManager />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsManager />
        </TabsContent>

        <TabsContent value="education">
          <EducationManager />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsManager />
        </TabsContent>

        <TabsContent value="messages">
          <ContactMessages />
        </TabsContent>

        <TabsContent value="footer">
          <FooterManager />
        </TabsContent>

        <TabsContent value="settings">
          <AdminSettings user={user} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
