import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hospital, Building } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const HMSRegisterPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
      <SEOHead title="Register Hospital | DataAfro HMS" description="Onboard your healthcare facility to DataAfro." />
      
      <div className="w-full max-w-xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/hms" className="flex items-center gap-2 mb-2">
            <Hospital className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">DataAfro HMS</span>
          </Link>
        </div>
        
        <Card className="border-2">
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
                <Label htmlFor="hospital_name">Hospital / Clinic Name</Label>
                <Input id="hospital_name" placeholder="General City Hospital" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration_number">Registration/License No.</Label>
                  <Input id="registration_number" placeholder="REG-12345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Bed Capacity</Label>
                  <Input id="capacity" type="number" placeholder="500" />
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
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_email">Admin Email (also used for main app)</Label>
                <Input id="admin_email" type="email" placeholder="admin@hospital.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>
            </div>
            
            <Button className="w-full mt-6" size="lg">Complete Registration</Button>
          </CardContent>
          <CardFooter className="flex flex-col border-t p-6 bg-muted/20">
            <p className="text-sm text-center text-muted-foreground">
              Already have a facility account?{" "}
              <Link to="/hms/login" className="text-primary hover:underline font-medium">
                Log in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default HMSRegisterPage;