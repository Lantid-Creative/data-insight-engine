import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash, Sparkles, HelpCircle, Megaphone, Plus, Send,
  ThumbsUp, Heart, Flame, MessageCircle, Pin, ArrowLeft,
  Search, Clock, TrendingUp, ChevronRight, User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  hash: Hash,
  sparkles: Sparkles,
  "help-circle": HelpCircle,
  megaphone: Megaphone,
};

const REACTION_EMOJIS = [
  { emoji: "👍", icon: ThumbsUp, label: "Like" },
  { emoji: "❤️", icon: Heart, label: "Love" },
  { emoji: "🔥", icon: Flame, label: "Fire" },
];

type ForumPost = {
  id: string;
  channel_id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_announcement: boolean;
  file_url: string | null;
  created_at: string;
  updated_at: string;
};

type ForumReply = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  file_url: string | null;
  parent_reply_id: string | null;
  created_at: string;
};

type ForumChannel = {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  is_default: boolean;
  created_at: string;
  created_by: string;
};

type ForumReaction = {
  id: string;
  post_id: string | null;
  reply_id: string | null;
  user_id: string;
  emoji: string;
  created_at: string;
};

type Profile = {
  user_id: string;
  full_name: string | null;
  bio: string | null;
  expertise_tags: string[] | null;
};

export default function CommunityForumPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "trending">("recent");

  // Fetch channels
  const { data: channels = [] } = useQuery({
    queryKey: ["forum-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_channels")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");
      if (error) throw error;
      return data as ForumChannel[];
    },
  });

  // Set default channel
  useEffect(() => {
    if (channels.length > 0 && !activeChannel) {
      setActiveChannel(channels[0].id);
    }
  }, [channels, activeChannel]);

  const currentChannel = channels.find((c) => c.id === activeChannel);

  // Fetch posts for active channel
  const { data: posts = [] } = useQuery({
    queryKey: ["forum-posts", activeChannel],
    queryFn: async () => {
      if (!activeChannel) return [];
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*")
        .eq("channel_id", activeChannel)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ForumPost[];
    },
    enabled: !!activeChannel,
  });

  // Fetch all profiles for display
  const { data: profiles = [] } = useQuery({
    queryKey: ["forum-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, full_name, bio, expertise_tags");
      if (error) throw error;
      return data as Profile[];
    },
  });

  const profileMap = useMemo(() => {
    const map: Record<string, Profile> = {};
    profiles.forEach((p) => (map[p.user_id] = p));
    return map;
  }, [profiles]);

  // Fetch reactions for posts in the active channel
  const postIds = posts.map((p) => p.id);
  const { data: reactions = [] } = useQuery({
    queryKey: ["forum-reactions", postIds],
    queryFn: async () => {
      if (postIds.length === 0) return [];
      const { data, error } = await supabase
        .from("forum_reactions")
        .select("*")
        .in("post_id", postIds);
      if (error) throw error;
      return data as ForumReaction[];
    },
    enabled: postIds.length > 0,
  });

  // Fetch replies for active post
  const { data: replies = [] } = useQuery({
    queryKey: ["forum-replies", activePost],
    queryFn: async () => {
      if (!activePost) return [];
      const { data, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("post_id", activePost)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ForumReply[];
    },
    enabled: !!activePost,
  });

  // Reply reactions
  const replyIds = replies.map((r) => r.id);
  const { data: replyReactions = [] } = useQuery({
    queryKey: ["forum-reply-reactions", replyIds],
    queryFn: async () => {
      if (replyIds.length === 0) return [];
      const { data, error } = await supabase
        .from("forum_reactions")
        .select("*")
        .in("reply_id", replyIds);
      if (error) throw error;
      return data as ForumReaction[];
    },
    enabled: replyIds.length > 0,
  });

  // Reply count per post
  const { data: replyCounts = {} } = useQuery({
    queryKey: ["forum-reply-counts", postIds],
    queryFn: async () => {
      if (postIds.length === 0) return {};
      const counts: Record<string, number> = {};
      // Fetch counts in batches
      const { data, error } = await supabase
        .from("forum_replies")
        .select("post_id")
        .in("post_id", postIds);
      if (error) throw error;
      data.forEach((r: { post_id: string }) => {
        counts[r.post_id] = (counts[r.post_id] || 0) + 1;
      });
      return counts;
    },
    enabled: postIds.length > 0,
  });

  // Create post
  const createPost = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("forum_posts").insert({
        channel_id: activeChannel!,
        user_id: user!.id,
        title: postTitle.trim(),
        content: postContent.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      setCreatePostOpen(false);
      setPostTitle("");
      setPostContent("");
      toast.success("Post created!");
    },
    onError: () => toast.error("Failed to create post"),
  });

  // Create reply
  const createReply = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("forum_replies").insert({
        post_id: activePost!,
        user_id: user!.id,
        content: replyContent.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies"] });
      queryClient.invalidateQueries({ queryKey: ["forum-reply-counts"] });
      setReplyContent("");
      toast.success("Reply posted!");
    },
    onError: () => toast.error("Failed to post reply"),
  });

  // Toggle reaction
  const toggleReaction = useMutation({
    mutationFn: async ({ postId, replyId, emoji }: { postId?: string; replyId?: string; emoji: string }) => {
      const existing = [...reactions, ...replyReactions].find(
        (r) => r.user_id === user!.id && r.emoji === emoji && (postId ? r.post_id === postId : r.reply_id === replyId)
      );
      if (existing) {
        await supabase.from("forum_reactions").delete().eq("id", existing.id);
      } else {
        await supabase.from("forum_reactions").insert({
          post_id: postId || null,
          reply_id: replyId || null,
          user_id: user!.id,
          emoji,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-reactions"] });
      queryClient.invalidateQueries({ queryKey: ["forum-reply-reactions"] });
    },
  });

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("forum-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_posts" }, () => {
        queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_replies" }, () => {
        queryClient.invalidateQueries({ queryKey: ["forum-replies"] });
        queryClient.invalidateQueries({ queryKey: ["forum-reply-counts"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Filtered & sorted posts
  const filteredPosts = useMemo(() => {
    let filtered = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortBy === "trending") {
      filtered = [...filtered].sort((a, b) => {
        const aReactions = reactions.filter((r) => r.post_id === a.id).length;
        const bReactions = reactions.filter((r) => r.post_id === b.id).length;
        const aReplies = (replyCounts as Record<string, number>)[a.id] || 0;
        const bReplies = (replyCounts as Record<string, number>)[b.id] || 0;
        return bReactions + bReplies - (aReactions + aReplies);
      });
    }
    return filtered;
  }, [posts, searchQuery, sortBy, reactions, replyCounts]);

  const activePostData = posts.find((p) => p.id === activePost);

  const getInitials = (userId: string) => {
    const profile = profileMap[userId];
    if (profile?.full_name) {
      return profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "U";
  };

  const getName = (userId: string) => {
    return profileMap[userId]?.full_name || "Anonymous";
  };

  const ReactionBar = ({ postId, replyId }: { postId?: string; replyId?: string }) => {
    const targetReactions = postId
      ? reactions.filter((r) => r.post_id === postId)
      : replyReactions.filter((r) => r.reply_id === replyId);

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {REACTION_EMOJIS.map(({ emoji, label }) => {
          const count = targetReactions.filter((r) => r.emoji === emoji).length;
          const hasReacted = targetReactions.some((r) => r.emoji === emoji && r.user_id === user?.id);
          return (
            <button
              key={emoji}
              onClick={() => toggleReaction.mutate({ postId, replyId, emoji })}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                hasReacted
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
              }`}
              title={label}
            >
              <span>{emoji}</span>
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-0 overflow-hidden">
      {/* Channel Sidebar */}
      <div className={`w-full md:w-60 lg:w-64 border-r border-border bg-muted/30 flex flex-col ${activePost ? "hidden md:flex" : "flex"}`}>
        <div className="p-3 border-b border-border">
          <h2 className="text-sm font-bold text-foreground mb-2">Community</h2>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search posts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs pl-7"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {channels.map((ch) => {
              const Icon = CHANNEL_ICONS[ch.icon] || Hash;
              const isActive = ch.id === activeChannel;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChannel(ch.id);
                    setActivePost(null);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{ch.name}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {activePost && activePostData ? (
            /* Thread View */
            <motion.div
              key="thread"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Thread header */}
              <div className="p-3 border-b border-border flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActivePost(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold truncate text-foreground">{activePostData.title}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {getName(activePostData.user_id)} · {formatDistanceToNow(new Date(activePostData.created_at), { addSuffix: true })}
                  </p>
                </div>
                {activePostData.is_pinned && (
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Pin className="w-3 h-3" /> Pinned
                  </Badge>
                )}
              </div>

              {/* Thread content */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {/* Original post */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                          {getInitials(activePostData.user_id)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground">{getName(activePostData.user_id)}</span>
                          {profileMap[activePostData.user_id]?.expertise_tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] h-4">{tag}</Badge>
                          ))}
                        </div>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{activePostData.content}</p>
                        <div className="mt-2">
                          <ReactionBar postId={activePostData.id} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Replies */}
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">{replies.length} {replies.length === 1 ? "reply" : "replies"}</p>
                    {replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-3">
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarFallback className="text-[10px] bg-muted font-bold">
                            {getInitials(reply.user_id)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-foreground">{getName(reply.user_id)}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{reply.content}</p>
                          <div className="mt-1">
                            <ReactionBar replyId={reply.id} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              {/* Reply input */}
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Write a reply…"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && replyContent.trim() && createReply.mutate()}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 bg-primary text-primary-foreground"
                    disabled={!replyContent.trim() || createReply.isPending}
                    onClick={() => createReply.mutate()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Post List View */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Channel header */}
              <div className="p-3 border-b border-border flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    {currentChannel && (() => { const I = CHANNEL_ICONS[currentChannel.icon] || Hash; return <I className="w-4 h-4" />; })()}
                    {currentChannel?.name || "Community"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground truncate">{currentChannel?.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="hidden sm:flex items-center bg-muted rounded-md p-0.5">
                    <button
                      onClick={() => setSortBy("recent")}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                        sortBy === "recent" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      <Clock className="w-3 h-3" /> Recent
                    </button>
                    <button
                      onClick={() => setSortBy("trending")}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                        sortBy === "trending" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      <TrendingUp className="w-3 h-3" /> Trending
                    </button>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1 bg-primary text-primary-foreground"
                    onClick={() => setCreatePostOpen(true)}
                  >
                    <Plus className="w-3.5 h-3.5" /> New Post
                  </Button>
                </div>
              </div>

              {/* Post list */}
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-16">
                      <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No posts yet. Start the conversation!</p>
                    </div>
                  ) : (
                    filteredPosts.map((post) => {
                      const postReactions = reactions.filter((r) => r.post_id === post.id);
                      const replyCount = (replyCounts as Record<string, number>)[post.id] || 0;
                      return (
                        <Card
                          key={post.id}
                          className="p-3 cursor-pointer hover:bg-muted/40 transition-colors border-border/60"
                          onClick={() => setActivePost(post.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                {getInitials(post.user_id)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                {post.is_pinned && <Pin className="w-3 h-3 text-primary flex-shrink-0" />}
                                {post.is_announcement && (
                                  <Badge variant="default" className="text-[10px] h-4 bg-primary/15 text-primary border-0">
                                    Announcement
                                  </Badge>
                                )}
                                <h4 className="text-sm font-semibold text-foreground truncate">{post.title}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.content}</p>
                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                <span className="font-medium text-foreground/70">{getName(post.user_id)}</span>
                                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" /> {replyCount}
                                </span>
                                {postReactions.length > 0 && (
                                  <span className="flex items-center gap-0.5">
                                    {[...new Set(postReactions.map((r) => r.emoji))].slice(0, 3).map((e) => (
                                      <span key={e}>{e}</span>
                                    ))}
                                    <span className="ml-0.5">{postReactions.length}</span>
                                  </span>
                                )}
                                <ChevronRight className="w-3 h-3 ml-auto" />
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Post in #{currentChannel?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              placeholder="Post title"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
            />
            <Textarea
              placeholder="Share your thoughts, insights, or questions…"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePostOpen(false)}>Cancel</Button>
            <Button
              disabled={!postTitle.trim() || !postContent.trim() || createPost.isPending}
              onClick={() => createPost.mutate()}
              className="bg-primary text-primary-foreground"
            >
              {createPost.isPending ? "Posting…" : "Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
