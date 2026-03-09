import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Activity, Building, Calendar, Settings, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEOHead from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddStaffDialog } from "@/components/hms/admin/AddStaffDialog";
import { AssignHeadDialog } from "@/components/hms/admin/AssignHeadDialog";
import HospitalBrandingSettings from "@/components/hms/admin/HospitalBrandingSettings";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();

  // Fetch user's hospital context (assuming they are hospital admin)
  const { data: staffContext, isLoading: contextLoading } = useQuery({
    queryKey: ["hms_staff_context", user?.id],
    queryFn: async () => {
      if (!user) return null;
      // Find the hospital where this user is admin
      const { data, error } = await supabase
        .from("hms_staff")
        .select("hospital_id, hms_hospitals(name)")
        .eq("user_id", user.id)
        .eq("role", "hospital_admin")
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Fallback: Check if they are the owner of a hospital
        const { data: hospital, error: hospError } = await supabase
          .from("hms_hospitals")
          .select("id, name")
          .eq("owner_id", user.id)
          .single();
        
        if (hospError && hospError.code !== 'PGRST116') throw hospError;
        if (hospital) {
          return { hospital_id: hospital.id, hospital_name: hospital.name };
        }
      }
      
      return data ? { hospital_id: data.hospital_id, hospital_name: data.hms_hospitals?.name } : null;
    },
    enabled: !!user,
  });

  const hospitalId = staffContext?.hospital_id;

  const { data: departments = [] } = useQuery({
    queryKey: ["hms_departments", hospitalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hms_departments")
        .select("*")
        .eq("hospital_id", hospitalId);
      if (error) throw error;
      return data;
    },
    enabled: !!hospitalId,
  });

  const { data: staffMembers = [], isLoading: staffLoading } = useQuery({
    queryKey: ["hms_staff", hospitalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hms_staff")
        .select(`
          *,
          hms_departments (name, head_staff_id)
        `)
        .eq("hospital_id", hospitalId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!hospitalId,
  });

  if (contextLoading || !staffContext) {
    return <div className="p-8">Loading dashboard context...</div>;
  }

  const activeStaff = staffMembers.filter(s => s.is_active).length;

  return (
    <div className="space-y-6">
      <SEOHead title="Admin Dashboard | HMS" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospital Administration</h1>
          <p className="text-muted-foreground">Manage operations for {staffContext.hospital_name || 'your hospital'}.</p>
        </div>
        <div className="flex gap-2">
          <AssignHeadDialog hospitalId={hospitalId} departments={departments} staff={staffMembers} />
          <AddStaffDialog hospitalId={hospitalId} departments={departments} />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="branding" className="gap-1.5"><Globe className="w-3.5 h-3.5" /> Branding & Domain</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staffMembers.length}</div>
                <p className="text-xs text-muted-foreground mt-1">{activeStaff} active members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departments.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Operational units</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">Real-time data coming soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">Real-time data coming soon</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>All registered staff members and their roles.</CardDescription>
            </CardHeader>
            <CardContent>
              {staffLoading ? (
                <div className="py-4 text-center">Loading staff...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Staff ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Head of Unit</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No staff members found. Add some to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      staffMembers.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell className="font-medium">
                            {staff.first_name} {staff.last_name}
                          </TableCell>
                          <TableCell>{staff.staff_id_number || '-'}</TableCell>
                          <TableCell className="capitalize">{staff.role.replace('_', ' ')}</TableCell>
                          <TableCell>{staff.hms_departments?.name || 'Unassigned'}</TableCell>
                          <TableCell>
                            {staff.hms_departments?.head_staff_id === staff.id ? (
                              <Badge variant="outline" className="bg-primary/10 text-primary">Unit Head</Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={staff.is_active ? "default" : "secondary"}>
                              {staff.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-4">
          <HospitalBrandingSettings hospitalId={hospitalId} hospitalName={staffContext.hospital_name || "Hospital"} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
