import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin, applicationStatus } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin routes
  if (requireAdmin) {
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
  }

  // Regular user routes — check if approved
  if (isAdmin) {
    // Admins can also access regular dashboard
    return <>{children}</>;
  }

  if (applicationStatus !== "approved") {
    return <Navigate to="/pending" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
