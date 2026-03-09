import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Component that checks if the current hostname matches a hospital's custom_domain.
 * If matched, renders the hospital's public page. Otherwise renders children (normal app).
 */
export function useDomainResolution() {
  const [resolvedSlug, setResolvedSlug] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;

    // Skip resolution for known DataAfro domains
    const knownDomains = ["localhost", "dataafro.com", "www.dataafro.com", "lovable.app", "lovable.dev"];
    if (knownDomains.some(d => hostname.includes(d))) {
      setChecked(true);
      return;
    }

    // Check if this hostname matches a hospital's custom_domain
    supabase
      .from("hms_hospitals")
      .select("slug")
      .eq("custom_domain", hostname)
      .eq("is_public", true)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.slug) {
          setResolvedSlug(data.slug);
        }
        setChecked(true);
      });
  }, []);

  return { resolvedSlug, checked };
}

export function DomainRedirector() {
  const { resolvedSlug, checked } = useDomainResolution();
  const navigate = useNavigate();

  useEffect(() => {
    if (checked && resolvedSlug) {
      navigate(`/h/${resolvedSlug}`, { replace: true });
    }
  }, [checked, resolvedSlug, navigate]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return null;
}
