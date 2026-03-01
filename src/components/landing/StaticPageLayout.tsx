import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface StaticPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const StaticPageLayout = ({ title, subtitle, children }: StaticPageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">{title}</h1>
            {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StaticPageLayout;
