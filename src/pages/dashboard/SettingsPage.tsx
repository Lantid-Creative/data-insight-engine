import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { capitalizeName } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Plus, User, MessageSquare } from "lucide-react";

const SettingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [expertiseTags, setExpertiseTags] = useState<string[]>([]);

  // Fetch profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio((profile as any).bio || "");
      setExpertiseTags((profile as any).expertise_tags || []);
    }
  }, [profile]);

  // Save profile
  const saveProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: capitalizeName(fullName),
          bio: bio.trim(),
          expertise_tags: expertiseTags,
        } as any)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["forum-profiles"] });
      toast.success("Profile updated!");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const addTag = () => {
    const tag = expertiseInput.trim();
    if (tag && !expertiseTags.includes(tag) && expertiseTags.length < 5) {
      setExpertiseTags([...expertiseTags, tag]);
      setExpertiseInput("");
    }
  };

  const removeTag = (tag: string) => {
    setExpertiseTags(expertiseTags.filter((t) => t !== tag));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences.</p>
      </div>

      {/* Basic Profile */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} type="email" disabled className="opacity-60" />
            <p className="text-[11px] text-muted-foreground">Email cannot be changed here.</p>
          </div>
        </CardContent>
      </Card>

      {/* Community Profile */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Community Profile
          </CardTitle>
          <p className="text-sm text-muted-foreground">This info is visible to other members in the community forum.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself, your role, or your interests…"
              rows={3}
              maxLength={300}
            />
            <p className="text-[11px] text-muted-foreground text-right">{bio.length}/300</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Expertise Tags</Label>
            <p className="text-[11px] text-muted-foreground">Add up to 5 tags that represent your areas of expertise. These appear next to your name in forum posts.</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {expertiseTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {expertiseTags.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No expertise tags added yet.</p>
              )}
            </div>
            {expertiseTags.length < 5 && (
              <div className="flex gap-2">
                <Input
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="e.g. Epidemiology, Data Science…"
                  className="flex-1"
                  maxLength={30}
                />
                <Button variant="outline" size="sm" onClick={addTag} disabled={!expertiseInput.trim()}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={() => saveProfile.mutate()}
        disabled={saveProfile.isPending || isLoading}
        className="bg-gradient-primary text-primary-foreground hover:opacity-90"
      >
        {saveProfile.isPending ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
};

export default SettingsPage;
