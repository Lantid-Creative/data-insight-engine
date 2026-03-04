import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  FolderOpen,
  FileText,
  Users,
  Activity,
  Settings,
  Upload,
  BarChart3,
  CreditCard,
  Key,
  Bell,
  Home,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: "project" | "file" | "team" | "activity";
  link: string;
}

const quickActions = [
  { label: "Dashboard", icon: Home, link: "/dashboard" },
  { label: "Upload Files", icon: Upload, link: "/dashboard/upload" },
  { label: "Projects", icon: FolderOpen, link: "/dashboard/projects" },
  { label: "Reports", icon: BarChart3, link: "/dashboard/reports" },
  { label: "Teams", icon: Users, link: "/dashboard/teams" },
  { label: "Billing", icon: CreditCard, link: "/dashboard/billing" },
  { label: "API Access", icon: Key, link: "/dashboard/api" },
  { label: "Settings", icon: Settings, link: "/dashboard/settings" },
  { label: "Notifications", icon: Bell, link: "/dashboard/notifications" },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Cmd+K / Ctrl+K handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const search = useCallback(
    async (q: string) => {
      if (!q.trim() || !user) {
        setResults([]);
        return;
      }
      setLoading(true);
      const pattern = `%${q}%`;

      const [projectsRes, filesRes, teamsRes, activityRes] = await Promise.all([
        supabase
          .from("projects")
          .select("id, name, description")
          .or(`name.ilike.${pattern},description.ilike.${pattern}`)
          .limit(5),
        supabase
          .from("project_files")
          .select("id, file_name, project_id, mime_type")
          .ilike("file_name", pattern)
          .limit(5),
        supabase
          .from("teams")
          .select("id, name")
          .ilike("name", pattern)
          .limit(5),
        supabase
          .from("activity_log")
          .select("id, action, project_id, created_at")
          .ilike("action", pattern)
          .limit(5),
      ]);

      const all: SearchResult[] = [];

      projectsRes.data?.forEach((p) =>
        all.push({
          id: p.id,
          title: p.name,
          subtitle: p.description || undefined,
          type: "project",
          link: `/dashboard/projects/${p.id}`,
        })
      );

      filesRes.data?.forEach((f) =>
        all.push({
          id: f.id,
          title: f.file_name,
          subtitle: f.mime_type || undefined,
          type: "file",
          link: `/dashboard/projects/${f.project_id}`,
        })
      );

      teamsRes.data?.forEach((t) =>
        all.push({
          id: t.id,
          title: t.name,
          type: "team",
          link: "/dashboard/teams",
        })
      );

      activityRes.data?.forEach((a) =>
        all.push({
          id: a.id,
          title: a.action.replace(/_/g, " "),
          subtitle: new Date(a.created_at).toLocaleDateString(),
          type: "activity",
          link: a.project_id ? `/dashboard/projects/${a.project_id}` : "/dashboard",
        })
      );

      setResults(all);
      setLoading(false);
    },
    [user]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 250);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (link: string) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    navigate(link);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "project": return <FolderOpen className="h-4 w-4 text-muted-foreground" />;
      case "file": return <FileText className="h-4 w-4 text-muted-foreground" />;
      case "team": return <Users className="h-4 w-4 text-muted-foreground" />;
      case "activity": return <Activity className="h-4 w-4 text-muted-foreground" />;
      default: return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const typeBadge = (type: string) => {
    const colors: Record<string, string> = {
      project: "bg-primary/10 text-primary",
      file: "bg-accent/60 text-accent-foreground",
      team: "bg-secondary text-secondary-foreground",
      activity: "bg-muted text-muted-foreground",
    };
    return (
      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colors[type] || ""}`}>
        {type}
      </Badge>
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-8 px-3 rounded-md border border-input bg-background text-muted-foreground text-sm hover:bg-accent transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Search…</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search projects, files, teams, activity…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Searching…" : "No results found."}
          </CommandEmpty>

          {/* Search results */}
          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((r) => (
                <CommandItem
                  key={`${r.type}-${r.id}`}
                  onSelect={() => handleSelect(r.link)}
                  className="flex items-center gap-3"
                >
                  {typeIcon(r.type)}
                  <div className="flex-1 min-w-0">
                    <span className="block truncate text-sm">{r.title}</span>
                    {r.subtitle && (
                      <span className="block truncate text-xs text-muted-foreground">{r.subtitle}</span>
                    )}
                  </div>
                  {typeBadge(r.type)}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Quick actions when no query */}
          {!query.trim() && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Quick Navigation">
                {quickActions.map((action) => (
                  <CommandItem
                    key={action.link}
                    onSelect={() => handleSelect(action.link)}
                    className="flex items-center gap-3"
                  >
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{action.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
