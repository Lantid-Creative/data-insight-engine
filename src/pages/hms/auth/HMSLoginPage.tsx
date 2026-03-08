import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hospital } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const HMSLoginPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEOHead title="Staff Login | DataAfro HMS" description="Login portal for hospital staff and departments." />
      
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/hms" className="flex items-center gap-2 mb-4">
            <Hospital className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">DataAfro HMS</span>
          </Link>
        </div>
        
        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Department Portal</CardTitle>
            <CardDescription>Enter your credentials to access your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Staff ID</Label>
              <Input id="email" type="email" placeholder="doctor@hospital.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" />
            </div>
            <div className="space-y-2 pt-2">
              <Label htmlFor="department">Department</Label>
              <select 
                id="department" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="admin">Hospital Admin</option>
                <option value="doctor">Doctor/Physician</option>
                <option value="nurse">Nursing Station</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="lab">Laboratory</option>
                <option value="reception">Front Desk / Reception</option>
                <option value="billing">Billing & Insurance</option>
              </select>
            </div>
            <Button className="w-full mt-4" size="lg">Sign In</Button>
          </CardContent>
          <CardFooter className="flex flex-col border-t p-6 bg-muted/20">
            <p className="text-sm text-center text-muted-foreground">
              Need to register a new hospital facility?{" "}
              <Link to="/hms/register" className="text-primary hover:underline font-medium">
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default HMSLoginPage;