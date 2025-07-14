
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AdminSettingsProps {
  user: SupabaseUser | null;
}

export function AdminSettings({ user }: AdminSettingsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your account settings and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {user ? (
            <>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">Account Information</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Email: {user.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  Account created: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="p-4 border border-destructive/20 rounded-lg">
                <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you sign out, you'll need to sign in again to access the admin panel.
                </p>
                <Button variant="destructive" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">Not Authenticated</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You are accessing the admin panel without authentication. Some features may be limited.
              </p>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign In for Full Access
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
