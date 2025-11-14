import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ redirectTo, children }) => {
  const accessToken = localStorage.getItem("token");
  return accessToken ? <>{children}</> : <Navigate to={redirectTo} />;
};

export default ProtectedRoute;