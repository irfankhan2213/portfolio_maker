
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FooterInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  href?: string;
  icon_name?: string;
  sort_order: number;
}

export function FooterManager() {
  const [footerItems, setFooterItems] = useState<FooterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FooterInfo | null>(null);
  const { toast } = useToast();

  const [newItem, setNewItem] = useState({
    type: "social",
    label: "",
    value: "",
    href: "",
    icon_name: "",
  });

  useEffect(() => {
    fetchFooterItems();
  }, []);

  const fetchFooterItems = async () => {
    try {
      const { data, error } = await supabase
        .from("footer_info")
        .select("*")
        .order("sort_order");

      if (error) throw error;
      setFooterItems(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load footer items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const maxOrder = Math.max(...footerItems.map(item => item.sort_order), 0);
      const { error } = await supabase.from("footer_info").insert({
        ...newItem,
        sort_order: maxOrder + 1,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Footer item added successfully",
      });

      setNewItem({
        type: "social",
        label: "",
        value: "",
        href: "",
        icon_name: "",
      });
      setIsAddDialogOpen(false);
      fetchFooterItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add footer item",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string, updates: Partial<FooterInfo>) => {
    try {
      const { error } = await supabase
        .from("footer_info")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Footer item updated successfully",
      });

      fetchFooterItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update footer item",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (id: string, field: keyof FooterInfo, value: string) => {
    setFooterItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleInputBlur = (id: string, field: keyof FooterInfo, value: string) => {
    const originalItem = footerItems.find(item => item.id === id);
    if (originalItem && originalItem[field] !== value) {
      handleUpdate(id, { [field]: value });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("footer_info")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Footer item deleted successfully",
      });

      fetchFooterItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete footer item",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading footer items...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Footer Management</CardTitle>
        <CardDescription>
          Manage your footer social links and copyright information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Footer Items</h3>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Footer Item</DialogTitle>
                <DialogDescription>
                  Add a new footer item (social link or copyright text)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newItem.type}
                    onValueChange={(value) => setNewItem({ ...newItem, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social">Social Link</SelectItem>
                      <SelectItem value="copyright">Copyright Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={newItem.label}
                    onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                    placeholder="e.g., GitHub"
                  />
                </div>
                <div>
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    value={newItem.value}
                    onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                    placeholder="e.g., GitHub or Your Name"
                  />
                </div>
                {newItem.type === "social" && (
                  <>
                    <div>
                      <Label htmlFor="href">URL</Label>
                      <Input
                        id="href"
                        value={newItem.href}
                        onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="icon_name">Icon Name</Label>
                      <Input
                        id="icon_name"
                        value={newItem.icon_name}
                        onChange={(e) => setNewItem({ ...newItem, icon_name: e.target.value })}
                        placeholder="Github, Linkedin, Mail, etc."
                      />
                    </div>
                  </>
                )}
                <Button onClick={handleAdd} className="w-full">
                  Add Footer Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {footerItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                  </div>
                  <div>
                    <Label>Label</Label>
                    <Input
                      value={item.label}
                      onChange={(e) => handleInputChange(item.id, 'label', e.target.value)}
                      onBlur={(e) => handleInputBlur(item.id, 'label', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Input
                      value={item.value}
                      onChange={(e) => handleInputChange(item.id, 'value', e.target.value)}
                      onBlur={(e) => handleInputBlur(item.id, 'value', e.target.value)}
                    />
                  </div>
                  {item.type === "social" && (
                    <>
                      <div>
                        <Label>URL</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={item.href || ""}
                            onChange={(e) => handleInputChange(item.id, 'href', e.target.value)}
                            onBlur={(e) => handleInputBlur(item.id, 'href', e.target.value)}
                          />
                          {item.href && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => window.open(item.href, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label>Icon Name</Label>
                        <Input
                          value={item.icon_name || ""}
                          onChange={(e) => handleInputChange(item.id, 'icon_name', e.target.value)}
                          onBlur={(e) => handleInputBlur(item.id, 'icon_name', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
