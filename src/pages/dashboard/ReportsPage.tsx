import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const ReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, chat_messages(count)")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const hasConversations = projects.some((p: any) => (p.chat_messages?.[0]?.count ?? 0) > 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-heading">Reports</h1>
        <p className="text-muted-foreground mt-1">Generate and download professional reports from your data analysis.</p>
      </div>

      {/* Empty state */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <motion.div
                className="absolute inset-0 rounded-[28px] bg-primary/15 blur-2xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div
                className="relative w-20 h-20 rounded-[22px] bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center"
                style={{ boxShadow: "0 8px 32px hsl(var(--primary) / 0.25)" }}
              >
                <FileText className="w-9 h-9 text-primary-foreground" />
                <div className="absolute inset-0 rounded-[22px] bg-gradient-to-b from-white/10 to-transparent" />
              </div>
            </div>

            {!hasConversations ? (
              <>
                <h3 className="text-lg font-bold mb-2">No reports yet</h3>
                <p className="text-muted-foreground max-w-sm mb-6 text-sm">
                  Reports are generated from your AI conversations. Start by creating a project, uploading data, and chatting with the AI analyst.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate("/dashboard/projects")}>
                    <FolderOpen className="w-4 h-4 mr-2" /> Go to Projects
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-2">Generate Your First Report</h3>
                <p className="text-muted-foreground max-w-sm mb-6 text-sm">
                  Open a project and ask the AI to generate a report from your analysis. It will appear here for download.
                </p>
                <Button
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                  onClick={() => navigate("/dashboard/projects")}
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Open a Project
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReportsPage;
