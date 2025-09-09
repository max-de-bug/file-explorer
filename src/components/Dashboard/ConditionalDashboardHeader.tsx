import { useLocation } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";

const ConditionalDashboardHeader = () => {
  const location = useLocation();
  const routesWithHeader = [
    "/Downloads",
    "/Documents",
    "/Pictures",
    "/Videos",
    "/Music",
  ];

  return routesWithHeader.includes(location.pathname) ? (
    <DashboardHeader />
  ) : null;
};

export default ConditionalDashboardHeader;
