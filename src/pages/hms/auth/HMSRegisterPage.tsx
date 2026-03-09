import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hospital, Building, Loader2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

const HMSRegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: "",
    registrationNumber: "",
    capacity: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Sign up the user
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
          },
        },
      });

      if (signUpError) throw signUpError;

      // In a real flow with email confirmation disabled, they are logged in automatically.
      // We can grab the session to get the user ID
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.success("Registration successful! Please check your email to verify your account.");
        navigate("/hms/login");
        return;
      }

      // 2. Create the hospital
      const { data: hospital, error: hospitalError } = await supabase
        .from("hms_hospitals")
        .insert({
          name: formData.hospitalName,
          registration_number: formData.registrationNumber,
          capacity: parseInt(formData.capacity) || 0,
          contact_email: formData.email,
          owner_id: session.user.id
        })
        .select()
        .single();

      if (hospitalError) throw hospitalError;

      // 3. Create the staff profile for the admin
      const { error: staffError } = await supabase
        .from("hms_staff")
        .insert({
          user_id: session.user.id,
          hospital_id: hospital.id,
          role: "hospital_admin",
          first_name: formData.firstName,
          last_name: formData.lastName,
          staff_id_number: "ADMIN-001"
        });

      if (staffError) throw staffError;

      toast.success("Hospital registered successfully!");
      navigate("/dashboard");

    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12 relative">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <SEOHead title="Register Hospital | DataAfro HMS" description="Onboard your healthcare facility to DataAfro." />
      
      <div className="w-full max-w-xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/hms" className="flex items-center gap-2 mb-2">
            <Hospital className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">DataAfro HMS</span>
          </Link>
        </div>
        
        <Card className="border-2">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Onboard Facility</CardTitle>
              <CardDescription>Register your hospital and create the admin account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Facility Details</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital / Clinic Name</Label>
                  <Input id="hospitalName" value={formData.hospitalName} onChange={handleChange} required placeholder="General City Hospital" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration/License No.</Label>
                    <Input id="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required placeholder="REG-12345" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Bed Capacity</Label>
                    <Input id="capacity" type="number" value={formData.capacity} onChange={handleChange} required placeholder="500" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Hospital className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Admin Account Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={handleChange} required placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="admin@hospital.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} />
                </div>
              </div>
              
              <Button type="submit" className="w-full mt-6" size="lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Complete Registration
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col border-t p-6 bg-muted/20">
              <p className="text-sm text-center text-muted-foreground">
                Already have a facility account?{" "}
                <Link to="/hms/login" className="text-primary hover:underline font-medium">
                  Log in here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default HMSRegisterPage;