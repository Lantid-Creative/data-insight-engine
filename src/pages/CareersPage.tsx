import StaticPageLayout from "@/components/landing/StaticPageLayout";
import { Button } from "@/components/ui/button";

const openings = [
  { role: "Senior ML Engineer", location: "Remote", type: "Full-time" },
  { role: "Frontend Developer (React)", location: "Remote", type: "Full-time" },
  { role: "Product Designer", location: "Remote", type: "Full-time" },
  { role: "Developer Advocate", location: "Remote", type: "Contract" },
];

const CareersPage = () => (
  <StaticPageLayout title="Careers" subtitle="Join us in building the future of data intelligence.">
    <div className="rounded-xl border border-border bg-card p-8 mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">Why DataAfro?</h2>
      <p className="text-muted-foreground leading-relaxed">
        We're a remote-first team that values impact, creativity, and ownership. You'll work on hard problems with smart, kind people — and ship things that matter.
      </p>
    </div>
    <h2 className="text-2xl font-bold text-foreground mb-6">Open Positions</h2>
    <div className="space-y-4">
      {openings.map((job) => (
        <div key={job.role} className="flex items-center justify-between rounded-xl border border-border bg-card p-6">
          <div>
            <h3 className="font-bold text-foreground">{job.role}</h3>
            <p className="text-sm text-muted-foreground">{job.location} · {job.type}</p>
          </div>
          <Button variant="outline" size="sm">Apply</Button>
        </div>
      ))}
    </div>
  </StaticPageLayout>
);

export default CareersPage;
