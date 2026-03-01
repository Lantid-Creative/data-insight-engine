import StaticPageLayout from "@/components/landing/StaticPageLayout";

const AboutPage = () => (
  <StaticPageLayout title="About DataAfro" subtitle="AI-powered data intelligence, built for the modern world.">
    <section className="space-y-8 text-muted-foreground">
      <div className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
        <p className="leading-relaxed">
          DataAfro was founded with a simple but powerful idea: data should work for everyone. We believe that extracting insights from documents, images, and files shouldn't require a team of engineers or expensive enterprise software. Our AI-powered platform makes data intelligence accessible, fast, and affordable.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">What We Do</h2>
        <p className="leading-relaxed">
          We use cutting-edge artificial intelligence to transform unstructured data into structured, actionable insights. Upload any file — PDFs, images, spreadsheets, audio — and our platform extracts, classifies, and organizes the information you need in seconds.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Our Team</h2>
        <p className="leading-relaxed">
          We're a diverse team of engineers, data scientists, and designers passionate about making technology inclusive and impactful. Based across multiple continents, we bring a global perspective to solving local and universal data challenges.
        </p>
      </div>
    </section>
  </StaticPageLayout>
);

export default AboutPage;
