import { FolderOpen, MessageSquare, Files, Zap, Clock, CheckCircle2, Circle, ArrowUpRight, BarChart3, HardDrive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, subDays, format, startOfDay } from "date-fns";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useEffect, useRef, useState } from "react";
import { OnboardingWizard } from "@/components/dashboard/OnboardingWizard";

function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 1, ease: "easeOut" });
    return controls.stop;
  }, [value, motionVal]);

  useEffect(() => {
    return rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = String(v);
    });
  }, [rounded]);

  return <span ref={ref}>0</span>;
}

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(() => {
    return localStorage.getItem("dataafro_onboarding_done") === "true";
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description, updated_at, created_at, project_files(count), chat_messages(count)")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Show onboarding for new users with 0 projects
  useEffect(() => {
    if (!onboardingDismissed && projects.length === 0 && user) {
      setShowOnboarding(true);
    }
  }, [projects, user, onboardingDismissed]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setOnboardingDismissed(true);
    localStorage.setItem("dataafro_onboarding_done", "true");
  };

  const { data: recentMessages = [] } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, content, created_at, role, project_id, projects(name)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Weekly activity data for sparkline
  const sevenDaysAgo = subDays(new Date(), 6).toISOString();
  const { data: weeklyMessages = [] } = useQuery({
    queryKey: ["weekly-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("created_at")
        .eq("user_id", user!.id)
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Bucket weekly messages into 7 days
  const sparklineData = Array.from({ length: 7 }, (_, i) => {
    const day = startOfDay(subDays(new Date(), 6 - i));
    const nextDay = startOfDay(subDays(new Date(), 5 - i));
    const count = weeklyMessages.filter((m: any) => {
      const d = new Date(m.created_at);
      return i < 6 ? d >= day && d < nextDay : d >= day;
    }).length;
    return { day: format(day, "EEE"), count };
  });
  const weekTotal = sparklineData.reduce((a, d) => a + d.count, 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.email?.split("@")[0] || "there";

  const totalFiles = projects.reduce((a: number, p: any) => a + (p.project_files?.[0]?.count ?? 0), 0);
  const totalMessages = projects.reduce((a: number, p: any) => a + (p.chat_messages?.[0]?.count ?? 0), 0);

  const stats = [
    { label: "Projects", value: projects.length, icon: FolderOpen, color: "text-primary" },
    { label: "Files", value: totalFiles, icon: Files, color: "text-accent-foreground" },
    { label: "AI Conversations", value: totalMessages, icon: MessageSquare, color: "text-primary" },
  ];

  // Getting started checklist
  const hasProjects = projects.length > 0;
  const hasFiles = totalFiles > 0;
  const hasMessages = totalMessages > 0;
  const completedSteps = [hasProjects, hasFiles, hasMessages].filter(Boolean).length;
  const allComplete = completedSteps === 3;

  const checklist = [
    { label: "Create your first project", done: hasProjects, action: () => navigate("/dashboard/projects") },
    { label: "Upload a file to analyze", done: hasFiles, action: () => navigate("/dashboard/projects") },
    { label: "Chat with AI about your data", done: hasMessages, action: () => navigate("/dashboard/projects") },
  ];

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4 },
  });

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Greeting */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading">
          {greeting}, <span className="text-gradient">{firstName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your workspace.</p>
      </motion.div>

      {/* Stats */}
      <motion.div className="grid grid-cols-3 gap-3 sm:gap-4" {...fadeUp(0.1)}>
        {stats.map((s) => (
          <Card key={s.label} className="shadow-soft hover:shadow-card transition-shadow">
            <CardContent className="p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none"><AnimatedCounter value={s.value} /></p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Activity Feed — takes 3 cols */}
        <motion.div className="lg:col-span-3 space-y-3" {...fadeUp(0.2)}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h2>

          {recentMessages.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No activity yet. Start a conversation in a project to see your timeline here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-1.5">
              {recentMessages.map((msg: any, i: number) => (
                <Card
                  key={msg.id}
                  className="shadow-soft hover:shadow-card transition-all cursor-pointer group"
                  onClick={() => navigate(`/dashboard/projects/${msg.project_id}`)}
                >
                  <CardContent className="p-3.5 flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === "assistant" ? "bg-primary/10" : "bg-muted"}`}>
                      {msg.role === "assistant" ? (
                        <Zap className="w-4 h-4 text-primary" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary/80">{(msg as any).projects?.name || "Project"}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 truncate mt-0.5">
                        {msg.role === "assistant" ? "AI: " : "You: "}
                        {msg.content.slice(0, 120)}{msg.content.length > 120 ? "…" : ""}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right column — takes 2 cols */}
        <motion.div className="lg:col-span-2 space-y-6" {...fadeUp(0.3)}>
          {/* Getting Started / Progress */}
          {!allComplete && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Getting Started</h2>
              <Card className="shadow-soft">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{completedSteps}/3 complete</span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-8 rounded-full transition-colors ${i < completedSteps ? "bg-primary" : "bg-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {checklist.map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                    >
                      {item.done ? (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Workspace Overview */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Workspace Overview</h2>
            <Card className="shadow-soft">
              <CardContent className="p-4 space-y-4">
                {/* Weekly Sparkline */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Weekly Activity</p>
                    <span className="text-xs text-muted-foreground">{weekTotal} messages</span>
                  </div>
                  <div className="h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparklineData}>
                        <defs>
                          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.55} />
                            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                          </linearGradient>
                          <filter id="sparkGlow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded-lg border bg-card px-3 py-1.5 shadow-md text-xs">
                                <p className="font-medium text-card-foreground">{label}</p>
                                <p className="text-muted-foreground">{payload[0].value} messages</p>
                              </div>
                            );
                          }}
                        />
                        <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#sparkFill)" activeDot={{ r: 4, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "hsl(var(--card))", filter: "url(#sparkGlow)" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="h-px bg-border" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Analysis Sessions</p>
                    <p className="text-xs text-muted-foreground">{totalMessages} total messages across {projects.length} projects</p>
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HardDrive className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Data Files</p>
                    <p className="text-xs text-muted-foreground">{totalFiles} files uploaded</p>
                  </div>
                </div>
                {projects.length > 0 && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Last Active</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(projects[0].updated_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHome;
