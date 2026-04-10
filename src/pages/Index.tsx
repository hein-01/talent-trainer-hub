import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import hrmsBanner from "@/assets/hrms-banner.jpg";

const productTabs = ["HRMS", "Job Portal", "GMS", "POS (F&B)", "GSMS", "POS(Phone)", "HMS"] as const;

type ProductTab = (typeof productTabs)[number];

const productFullNames: Record<ProductTab, string> = {
  HRMS: "Human Resource Management System",
  "Job Portal": "JobsYa Mobile App",
  GMS: "Gym Management System",
  "POS (F&B)": "Point of Sale for F&B (Coming Soon)",
  GSMS: "Gold Shop Management System (Coming Soon)",
  "POS(Phone)": "Point of Sale for Phone Shop (Coming Soon)",
  HMS: "Hotel & Guest House Management System (Coming Soon)",
};

const defaultMenuItems = (badge: string) => [
  { label: "Features" },
  { label: "Quiz for Features" },
  { label: "Sales Calls Training" },
  { label: "Quiz for Sales Calls" },
  { label: "Leads to Call", badge },
  { label: "Outcomes" },
];

const menuItemsByTab: Record<ProductTab, { label: string; badge?: string }[]> = {
  HRMS: defaultMenuItems("100"),
  "Job Portal": defaultMenuItems("75"),
  GMS: defaultMenuItems("50"),
  "POS (F&B)": defaultMenuItems("30"),
  GSMS: defaultMenuItems("0"),
  "POS(Phone)": defaultMenuItems("0"),
  HMS: defaultMenuItems("0"),
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<ProductTab>("HRMS");
  const navigate = useNavigate();
  const { displayName } = useAuth();
  const items = menuItemsByTab[activeTab];

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      {/* Welcome */}
      <h1 className="text-2xl font-extrabold text-foreground mb-4">
        မင်္ဂလာပါ, <span className="animate-gradient bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent">{displayName || "User"}</span> <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
      </h1>

      {/* Product Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {productTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Section Title */}
      <h2 className="text-lg font-bold text-foreground mb-2">{productFullNames[activeTab]}</h2>

      {activeTab === "HRMS" && (
        <img
          src={hrmsBanner}
          alt="HRMS Dashboard Preview"
          width={800}
          height={512}
          className="w-full rounded-2xl border border-border shadow-sm mb-4 object-cover"
        />
      )}

      {/* Menu Items */}
      <div className="space-y-2">
        {items.map(({ label, badge }) => (
          <button
            key={label}
            onClick={() => {
              if (label === "Features") navigate(`/features?product=${encodeURIComponent(activeTab)}`);
              else if (label === "Leads to Call") navigate(`/leads-to-call?product=${encodeURIComponent(activeTab)}`);
              else if (label === "Outcomes") navigate(`/outcomes?product=${encodeURIComponent(activeTab)}`);
            }}
            className="w-full flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-4 hover:shadow-md active:scale-[0.98] transition-all"
          >
            <span className="text-sm font-bold text-foreground">
              {label}
              {badge && (
                <span className="ml-2 text-xs font-semibold text-primary">
                  ({badge})
                </span>
              )}
            </span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Index;
