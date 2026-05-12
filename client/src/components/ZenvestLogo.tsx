import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/growvest-logo.png";

interface ZenvestLogoProps {
  size?: "sm" | "md" | "lg";
}

const heightMap = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
};

const ZenvestLogo = ({ size = "md" }: ZenvestLogoProps) => {
  const { token } = useAuth();
  
  return (
    <Link to={token ? "/" : "/login"} className="block shrink-0">
      <img
        src={logo}
        alt="Growvest"
        className={`${heightMap[size]} w-auto object-contain`}
      />
    </Link>
  );
};

export default ZenvestLogo;
