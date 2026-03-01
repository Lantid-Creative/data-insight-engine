import StaticPageLayout from "@/components/landing/StaticPageLayout";

const TermsPage = () => (
  <StaticPageLayout title="Terms of Service" subtitle="Last updated: March 1, 2026">
    <div className="space-y-8 text-muted-foreground">
      <section className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
        <p className="leading-relaxed">By accessing or using DataAfro, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
      </section>
      <section className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-xl font-bold text-foreground mb-3">2. Use of Service</h2>
        <p className="leading-relaxed">You may use DataAfro for lawful purposes only. You are responsible for all content you upload and must ensure you have the right to process it. Misuse, including uploading malicious content, will result in account termination.</p>
      </section>
      <section className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-xl font-bold text-foreground mb-3">3. Intellectual Property</h2>
        <p className="leading-relaxed">You retain ownership of all data you upload. DataAfro retains ownership of the platform, its AI models, and all proprietary technology. We do not claim ownership of your processed results.</p>
      </section>
      <section className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-xl font-bold text-foreground mb-3">4. Limitation of Liability</h2>
        <p className="leading-relaxed">DataAfro is provided "as is." We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
      </section>
    </div>
  </StaticPageLayout>
);

export default TermsPage;
