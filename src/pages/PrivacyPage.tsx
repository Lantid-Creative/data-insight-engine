import StaticPageLayout from "@/components/landing/StaticPageLayout";

const PrivacyPage = () => (
  <StaticPageLayout title="Privacy Policy" subtitle="Last updated: March 1, 2026">
    <div className="space-y-8 text-muted-foreground">
      <section className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-xl font-bold text-foreground mb-3">1. Information We Collect</h2>
        <p className="leading-relaxed">We collect information you provide directly (name, email, uploaded files) and usage data (page views, feature usage, device info). We never sell your personal data to third parties.</p>
      </section>
      <section className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-xl font-bold text-foreground mb-3">2. How We Use Your Data</h2>
        <p className="leading-relaxed">Your data is used to provide and improve our services, process your files, communicate with you, and ensure platform security. Uploaded files are processed by our AI and stored securely until you delete them.</p>
      </section>
      <section className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-xl font-bold text-foreground mb-3">3. Data Retention</h2>
        <p className="leading-relaxed">We retain your account data for as long as your account is active. Processed files are retained for 90 days after processing unless you choose to delete them earlier. You can request full data deletion at any time.</p>
      </section>
      <section className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-xl font-bold text-foreground mb-3">4. Your Rights</h2>
        <p className="leading-relaxed">You have the right to access, correct, or delete your personal data. You can export your data at any time from the dashboard settings. Contact us at privacy@dataafro.com for any requests.</p>
      </section>
    </div>
  </StaticPageLayout>
);

export default PrivacyPage;
