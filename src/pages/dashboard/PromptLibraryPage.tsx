import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Sparkles, Star, StarOff, Copy, Trash2, Pencil,
  BarChart3, TrendingUp, FileText, Wand2, PieChart, Shield,
  Stethoscope, Globe, LayoutDashboard, Calculator, ClipboardList,
  DollarSign, Calendar, GitCompare, BookOpen, ArrowRight,
  Heart, Zap, Eye, Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { id: "all", label: "All Prompts", icon: BookOpen },
  { id: "analysis", label: "Analysis", icon: BarChart3 },
  { id: "visualization", label: "Visualization", icon: PieChart },
  { id: "reporting", label: "Reporting", icon: FileText },
  { id: "data-cleaning", label: "Data Cleaning", icon: Wand2 },
  { id: "artifacts", label: "Build Tools", icon: LayoutDashboard },
  { id: "clinical", label: "Clinical", icon: Stethoscope },
  { id: "custom", label: "My Prompts", icon: Star },
];

const ICON_MAP: Record<string, any> = {
  "bar-chart-3": BarChart3, "trending-up": TrendingUp, "git-compare": GitCompare,
  "search": Search, "layout-dashboard": LayoutDashboard, "pie-chart": PieChart,
  "presentation": Eye, "file-text": FileText, "calendar": Calendar,
  "shield-check": Shield, "sparkles": Sparkles, "wand-2": Wand2,
  "calculator": Calculator, "kanban": LayoutDashboard, "clipboard-list": ClipboardList,
  "dollar-sign": DollarSign, "stethoscope": Stethoscope, "globe": Globe,
};

const PromptLibraryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState<any>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPromptText, setFormPromptText] = useState("");
  const [formCategory, setFormCategory] = useState("analysis");

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ["prompt-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompt_library")
        .select("*")
        .order("is_curated", { ascending: false })
        .order("use_count", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createPrompt = useMutation({
    mutationFn: async (vals: { title: string; description: string; prompt_text: string; category: string }) => {
      const { error } = await supabase.from("prompt_library").insert({
        ...vals,
        user_id: user!.id,
        is_curated: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompt-library"] });
      toast.success("Prompt saved!");
      resetForm();
    },
    onError: () => toast.error("Failed to save prompt"),
  });

  const updatePrompt = useMutation({
    mutationFn: async ({ id, ...vals }: { id: string; title: string; description: string; prompt_text: string; category: string }) => {
      const { error } = await supabase.from("prompt_library").update(vals).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompt-library"] });
      toast.success("Prompt updated!");
      resetForm();
    },
    onError: () => toast.error("Failed to update prompt"),
  });

  const deletePrompt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prompt_library").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompt-library"] });
      toast.success("Prompt deleted");
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { error } = await supabase.from("prompt_library").update({ is_favorite: !is_favorite }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prompt-library"] }),
  });

  const resetForm = () => {
    setCreateOpen(false);
    setEditPrompt(null);
    setFormTitle("");
    setFormDescription("");
    setFormPromptText("");
    setFormCategory("analysis");
  };

  const openEdit = (p: any) => {
    setEditPrompt(p);
    setFormTitle(p.title);
    setFormDescription(p.description);
    setFormPromptText(p.prompt_text);
    setFormCategory(p.category);
    setCreateOpen(true);
  };

  const handleSave = () => {
    if (!formTitle.trim() || !formPromptText.trim()) {
      toast.error("Title and prompt text are required");
      return;
    }
    const vals = { title: formTitle, description: formDescription, prompt_text: formPromptText, category: formCategory };
    if (editPrompt) {
      updatePrompt.mutate({ id: editPrompt.id, ...vals });
    } else {
      createPrompt.mutate(vals);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied to clipboard");
  };

  const filtered = prompts.filter((p: any) => {
    const matchesCategory = category === "all" ? true : category === "custom" ? !p.is_curated : p.category === category;
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const favorites = prompts.filter((p: any) => p.is_favorite);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
                style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.25)" }}
              >
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              Prompt Library
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Curated and custom prompts to get the most out of your data
            </p>
          </div>
          <Button
            onClick={() => { resetForm(); setCreateOpen(true); }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Prompt
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                category === cat.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
              }`}
              style={category === cat.id ? { boxShadow: "0 4px 12px hsl(var(--primary) / 0.2)" } : undefined}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Favorites section */}
        {favorites.length > 0 && category === "all" && !search && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-primary" />
              Favorites
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {favorites.map((p: any) => (
                <PromptCard
                  key={p.id}
                  prompt={p}
                  userId={user?.id}
                  onCopy={copyToClipboard}
                  onEdit={openEdit}
                  onDelete={(id) => deletePrompt.mutate(id)}
                  onToggleFav={(id, fav) => toggleFavorite.mutate({ id, is_favorite: fav })}
                  onUse={(text) => navigate("/dashboard/projects", { state: { promptText: text } })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p: any) => (
              <PromptCard
                key={p.id}
                prompt={p}
                userId={user?.id}
                onCopy={copyToClipboard}
                onEdit={openEdit}
                onDelete={(id) => deletePrompt.mutate(id)}
                onToggleFav={(id, fav) => toggleFavorite.mutate({ id, is_favorite: fav })}
                onUse={(text) => navigate("/dashboard/projects", { state: { promptText: text } })}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground mb-1">No prompts found</p>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or create a custom prompt</p>
            <Button variant="outline" onClick={() => { resetForm(); setCreateOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Prompt
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editPrompt ? "Edit Prompt" : "Create Custom Prompt"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
              <Input placeholder="e.g. Revenue Trend Analysis" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
              <Input placeholder="Brief description of what this prompt does" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="visualization">Visualization</SelectItem>
                  <SelectItem value="reporting">Reporting</SelectItem>
                  <SelectItem value="data-cleaning">Data Cleaning</SelectItem>
                  <SelectItem value="artifacts">Build Tools</SelectItem>
                  <SelectItem value="clinical">Clinical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Prompt Text</label>
              <Textarea
                placeholder="Enter the full prompt text..."
                value={formPromptText}
                onChange={(e) => setFormPromptText(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formTitle.trim() || !formPromptText.trim()}>
              {editPrompt ? "Update" : "Save Prompt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ─── Prompt Card ─── */
function PromptCard({ prompt, userId, onCopy, onEdit, onDelete, onToggleFav, onUse }: {
  prompt: any;
  userId?: string;
  onCopy: (text: string) => void;
  onEdit: (p: any) => void;
  onDelete: (id: string) => void;
  onToggleFav: (id: string, fav: boolean) => void;
  onUse: (text: string) => void;
}) {
  const Icon = ICON_MAP[prompt.icon] || Sparkles;
  const isOwn = prompt.user_id === userId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden hover:border-primary/30 transition-all duration-300 h-full">
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: "0 2px 8px hsl(var(--primary) / 0.15)" }}
            >
              <Icon className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-1">
              {prompt.is_curated && (
                <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0.5">CURATED</Badge>
              )}
              {isOwn && (
                <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.5">CUSTOM</Badge>
              )}
            </div>
          </div>

          <h3 className="text-sm font-bold text-foreground mb-1">{prompt.title}</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-2">{prompt.description}</p>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleFav(prompt.id, prompt.is_favorite)}
                className={`p-1.5 rounded-lg transition-all ${
                  prompt.is_favorite ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {prompt.is_favorite ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onCopy(prompt.prompt_text)}
                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {isOwn && (
                <>
                  <button
                    onClick={() => onEdit(prompt)}
                    className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(prompt.id)}
                    className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => onUse(prompt.prompt_text)}
            >
              Use <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PromptLibraryPage;
