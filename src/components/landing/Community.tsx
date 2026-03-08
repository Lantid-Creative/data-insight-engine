import { Users, MessageSquare, Award, ArrowRight, Heart, Flame, ThumbsUp, AtSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MessageSquare,
    title: "Threaded Discussions",
    description: "Organize conversations by topic with channels and nested threads. Never lose context.",
  },
  {
    icon: AtSign,
    title: "@Mention & Notify",
    description: "Tag collaborators directly in posts. They get instant notifications so nothing slips through.",
  },
  {
    icon: Award,
    title: "Expertise Profiles",
    description: "Showcase your skills with up to 5 expertise tags. Find the right expert in the Member Directory.",
  },
  {
    icon: Users,
    title: "Real-Time Activity",
    description: "See who's online, live channel indicators, and instant message delivery powered by real-time sync.",
  },
];

const Community = () => (
  <section id="community" className="py-24 bg-muted/30">
    <div className="container mx-auto px-6 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="inline-block font-mono text-xs tracking-widest uppercase text-primary mb-4 px-3 py-1 rounded-full bg-primary/10">
          Community
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Learn, Share &amp; Grow Together
        </h2>
        <p className="text-muted-foreground text-lg">
          Join a thriving community of data professionals, health-tech builders, and researchers exchanging ideas on the DataAfro forum.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>

      {/* Social proof strip */}
      <div className="flex flex-wrap items-center justify-center gap-8 mb-10 text-muted-foreground text-sm">
        <span className="flex items-center gap-1.5"><ThumbsUp className="h-4 w-4 text-primary" /> Upvotes &amp; Reactions</span>
        <span className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-destructive" /> Pinned Posts</span>
        <span className="flex items-center gap-1.5"><Flame className="h-4 w-4 text-orange-500" /> Announcements</span>
        <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> Member Directory</span>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link to="/register">
          <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            Join the Community <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default Community;
