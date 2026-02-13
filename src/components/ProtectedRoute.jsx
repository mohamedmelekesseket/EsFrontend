import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/Seconnect" replace />;

  if (adminOnly && user.role !== "Admin" && user.role !== "Owner") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
