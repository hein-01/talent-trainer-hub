import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const productTabs = ["HRMS", "Job Portal", "GMS", "POS"] as const;

type ProductTab = (typeof productTabs)[number];

const menuItemsByTab: Record<ProductTab, { label: string; badge?: string }[]> = {
  HRMS: [
    { label: "Features" },
    { label: "Quiz for Features" },
    { label: "Sales Calls Training" },
    { label: "Quiz for Sales Calls" },
    { label: "Leads to Call", badge: "100" },
    { label: "Outcomes" },
  ],
  "Job Portal": [
    { label: "Features" },
    { label: "Quiz for Features" },
    { label: "Sales Calls Training" },
    { label: "Quiz for Sales Calls" },
    { label: "Leads to Call", badge: "75" },
    { label: "Outcomes" },
  ],
  GMS: [
    { label: "Features" },
    { label: "Quiz for Features" },
    { label: "Sales Calls Training" },
    { label: "Quiz for Sales Calls" },
    { label: "Leads to Call", badge: "50" },
    { label: "Outcomes" },
  ],
  POS: [
    { label: "Features" },
    { label: "Quiz for Features" },
    { label: "Sales Calls Training" },
    { label: "Quiz for Sales Calls" },
    { label: "Leads to Call", badge: "30" },
    { label: "Outcomes" },
  ],
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
        Mingalarbar, {displayName || "User"} 👋
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

      {/* Menu Items */}
      <div className="space-y-2">
        {items.map(({ label, badge }) => (
          <button
            key={label}
            onClick={() => label === "Features" ? navigate(`/features?product=${encodeURIComponent(activeTab)}`) : undefined}
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
