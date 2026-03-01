import StaticPageLayout from "@/components/landing/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ContactPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <StaticPageLayout title="Contact Us" subtitle="We'd love to hear from you.">
      <div className="grid md:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" required placeholder="Your name" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required placeholder="you@company.com" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" required placeholder="How can we help?" rows={5} className="mt-1" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send Message"}
          </Button>
        </form>
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 flex items-start gap-4">
            <Mail className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-bold text-foreground">Email</h3>
              <p className="text-sm text-muted-foreground">hello@dataafro.com</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 flex items-start gap-4">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-bold text-foreground">Location</h3>
              <p className="text-sm text-muted-foreground">Remote-first, worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default ContactPage;
