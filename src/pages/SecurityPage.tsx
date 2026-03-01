import StaticPageLayout from "@/components/landing/StaticPageLayout";
import { Shield, Lock, Eye, Server } from "lucide-react";

const features = [
  { icon: Shield, title: "Enterprise-grade Encryption", desc: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Your files are protected at every step." },
  { icon: Lock, title: "Access Controls", desc: "Role-based access control, API key management, and audit logs ensure only authorized users access your data." },
  { icon: Eye, title: "Privacy by Design", desc: "We follow GDPR and data minimization principles. Your data is never used to train our models without explicit consent." },
  { icon: Server, title: "Secure Infrastructure", desc: "Hosted on SOC 2 compliant infrastructure with automated backups, DDoS protection, and 99.9% uptime SLA." },
];

const SecurityPage = () => (
  <StaticPageLayout title="Security" subtitle="Your data's safety is our top priority.">
    <div className="grid md:grid-cols-2 gap-6">
      {features.map((f) => (
        <div key={f.title} className="rounded-xl border border-border bg-card p-8">
          <f.icon className="w-8 h-8 text-primary mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">{f.title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  </StaticPageLayout>
);

export default SecurityPage;
