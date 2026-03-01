import StaticPageLayout from "@/components/landing/StaticPageLayout";

const entries = [
  { version: "2.1.0", date: "Feb 28, 2026", changes: ["Added batch processing for up to 500 files", "Improved OCR accuracy by 23%", "New dashboard analytics widgets"] },
  { version: "2.0.0", date: "Feb 1, 2026", changes: ["Complete UI redesign", "Real-time processing pipeline", "API v1 launch", "Team collaboration features"] },
  { version: "1.5.0", date: "Dec 15, 2025", changes: ["Added audio file support (MP3, WAV)", "Export to CSV and JSON", "Bug fixes and performance improvements"] },
];

const ChangelogPage = () => (
  <StaticPageLayout title="Changelog" subtitle="What's new in DataAfro.">
    <div className="space-y-8">
      {entries.map((entry) => (
        <div key={entry.version} className="rounded-xl border border-border bg-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">v{entry.version}</span>
            <span className="text-sm text-muted-foreground font-mono">{entry.date}</span>
          </div>
          <ul className="space-y-2">
            {entry.changes.map((c) => (
              <li key={c} className="flex items-start gap-2 text-muted-foreground">
                <span className="text-primary mt-1.5">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </StaticPageLayout>
);

export default ChangelogPage;
