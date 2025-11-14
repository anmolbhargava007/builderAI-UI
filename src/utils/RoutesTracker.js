import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RouteTracker = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            localStorage.setItem("lastRoute", location.pathname + location.search);
        }
    }, [location]);

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === "token" && event.newValue === null) {
                // Token was removed → user logged out in another tab
                if (location.pathname !== "/login") {
                    navigate("/login", { replace: true });
                }

            }
        }


        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [navigate, location.pathname]);

    return null;
};

export default RouteTracker;

