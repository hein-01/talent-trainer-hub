import { useLocation, useNavigate } from "react-router-dom";
import { Building2, Briefcase, BarChart3, User } from "lucide-react";

const navItems = [
  { path: "/", label: "HRMS", icon: Building2 },
  { path: "/job-portal", label: "Job Portal", icon: Briefcase },
  { path: "/gms", label: "GMS", icon: BarChart3 },
  { path: "/profile", label: "Profile", icon: User },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-nav border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-nav-active scale-105"
                  : "text-nav-inactive hover:text-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] ${isActive ? "font-bold" : "font-semibold"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
