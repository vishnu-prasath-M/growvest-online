import logo from "@/assets/growvest-logo.png";

interface ZenvestLogoProps {
  size?: "sm" | "md" | "lg";
}

const heightMap = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
};

const ZenvestLogo = ({ size = "md" }: ZenvestLogoProps) => (
  <img
    src={logo}
    alt="Growvest"
    className={`${heightMap[size]} w-auto object-contain`}
  />
);

export default ZenvestLogo;
