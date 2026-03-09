import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Globe, Link as LinkIcon, Palette, Copy, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HospitalBranding {
  slug: string | null;
  logo_url: string | null;
  tagline: string | null;
  about: string | null;
  primary_color: string | null;
  custom_domain: string | null;
  is_public: boolean | null;
  address: string | null;
  phone: string | null;
}

interface Props {
  hospitalId: string;
  hospitalName: string;
}

export default function HospitalBrandingSettings({ hospitalId, hospitalName }: Props) {
  const [branding, setBranding] = useState<HospitalBranding>({
    slug: null,
    logo_url: null,
    tagline: null,
    about: null,
    primary_color: "#2563eb",
    custom_domain: null,
    is_public: false,
    address: null,
    phone: null,
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("hms_hospitals")
      .select("slug, logo_url, tagline, about, primary_color, custom_domain, is_public, address, phone")
      .eq("id", hospitalId)
      .single()
      .then(({ data }) => {
        if (data) {
          setBranding({
            slug: data.slug,
            logo_url: data.logo_url,
            tagline: data.tagline,
            about: data.about,
            primary_color: data.primary_color || "#2563eb",
            custom_domain: data.custom_domain,
            is_public: data.is_public ?? false,
            address: data.address,
            phone: data.phone,
          });
        }
        setLoaded(true);
      });
  }, [hospitalId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate slug
      if (branding.slug && !/^[a-z0-9-]+$/.test(branding.slug)) {
        toast.error("Slug must only contain lowercase letters, numbers, and hyphens");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("hms_hospitals")
        .update({
          slug: branding.slug || null,
          logo_url: branding.logo_url || null,
          tagline: branding.tagline || null,
          about: branding.about || null,
          primary_color: branding.primary_color || "#2563eb",
          custom_domain: branding.custom_domain || null,
          is_public: branding.is_public,
          address: branding.address || null,
          phone: branding.phone || null,
        })
        .eq("id", hospitalId);

      if (error) {
        if (error.message.includes("unique") || error.message.includes("duplicate")) {
          toast.error("This slug or domain is already taken");
        } else {
          throw error;
        }
      } else {
        toast.success("Branding settings saved!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
    setSaving(false);
  };

  if (!loaded) return null;

  const publicUrl = branding.slug ? `${window.location.origin}/h/${branding.slug}` : null;

  return (
    <div className="space-y-6">
      {/* Public Page Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Public Hospital Page
          </CardTitle>
          <CardDescription>
            Enable a public-facing landing page for your hospital with contact info, departments, and a staff login link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Make hospital page public</Label>
              <p className="text-xs text-muted-foreground mt-1">Visitors can see your hospital info without logging in</p>
            </div>
            <Switch
              checked={branding.is_public ?? false}
              onCheckedChange={(checked) => setBranding(prev => ({ ...prev, is_public: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Page Slug</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">/h/</span>
                <Input
                  value={branding.slug || ""}
                  onChange={(e) => setBranding(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                  placeholder="my-hospital"
                  className="pl-10"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, and hyphens</p>
          </div>

          {publicUrl && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              <code className="text-xs flex-1 truncate">{publicUrl}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("URL copied!"); }}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Custom Domain
          </CardTitle>
          <CardDescription>
            Point your own domain to your hospital page. You'll need to configure a CNAME record pointing to dataafro.com.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Domain Name</Label>
            <Input
              value={branding.custom_domain || ""}
              onChange={(e) => setBranding(prev => ({ ...prev, custom_domain: e.target.value.toLowerCase().trim() }))}
              placeholder="hospital.example.com"
            />
          </div>
          {branding.custom_domain && (
            <div className="p-4 rounded-lg border bg-muted/50 space-y-2">
              <p className="text-sm font-medium">DNS Configuration Required</p>
              <p className="text-xs text-muted-foreground">Add a CNAME record at your domain registrar:</p>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono mt-2">
                <div><Badge variant="outline">Type</Badge> CNAME</div>
                <div><Badge variant="outline">Name</Badge> {branding.custom_domain.split(".")[0]}</div>
                <div><Badge variant="outline">Value</Badge> dataafro.com</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                value={branding.logo_url || ""}
                onChange={(e) => setBranding(prev => ({ ...prev, logo_url: e.target.value }))}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label>Brand Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={branding.primary_color || "#2563eb"}
                  onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={branding.primary_color || "#2563eb"}
                  onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input
              value={branding.tagline || ""}
              onChange={(e) => setBranding(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder="Excellence in healthcare since 1990"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={branding.address || ""}
                onChange={(e) => setBranding(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Medical Drive, City"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={branding.phone || ""}
                onChange={(e) => setBranding(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>About</Label>
            <Textarea
              value={branding.about || ""}
              onChange={(e) => setBranding(prev => ({ ...prev, about: e.target.value }))}
              placeholder="Tell visitors about your hospital..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Saving..." : "Save Branding Settings"}
        </Button>
      </div>
    </div>
  );
}
