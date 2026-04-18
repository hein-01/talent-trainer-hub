import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Factory, Building2, ShieldCheck, Shirt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Hardcoded fallback (same as before)
const fallbackDetails: Record<string, Record<string, {
  overview: string;
  useCases: { industry: string; icon: string; description: string }[];
}>> = {
  HRMS: {
    "Employee Database": {
      overview: "A centralized, secure repository for all employee information — personal details, employment history, documents, and compliance records — accessible anytime from any device.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Track thousands of floor workers across shifts, storing their skill certifications, machine assignments, and contract details in one place." },
        { industry: "Manufacturing Company", icon: "factory", description: "Maintain records for operators, engineers, and supervisors across multiple plants with department-wise filtering and bulk imports." },
        { industry: "Insurance Company", icon: "shield", description: "Store agent licenses, compliance documents, and training certifications with automatic expiry alerts." },
      ],
    },
    "Payroll Management": {
      overview: "Automate salary calculations, tax deductions, overtime, bonuses, and compliance with local labor laws — eliminating manual spreadsheet errors.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Calculate piece-rate wages, overtime for seasonal rush orders, and deductions for thousands of workers with one click." },
        { industry: "Manufacturing Company", icon: "factory", description: "Handle complex shift differentials, hazard pay, and multi-location payroll with automatic tax filing." },
        { industry: "Insurance Company", icon: "shield", description: "Process commission-based salaries, performance bonuses, and statutory deductions for agents across regions." },
      ],
    },
    "Leave & Attendance": {
      overview: "Track employee attendance via biometric, mobile, or manual entry. Manage leave balances, approvals, and generate timesheets automatically.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Monitor shift attendance for floor workers using biometric integration, flag absenteeism patterns, and auto-calculate overtime." },
        { industry: "Manufacturing Company", icon: "factory", description: "Track attendance across 3-shift operations, manage compensatory offs, and integrate with access control systems." },
        { industry: "Insurance Company", icon: "shield", description: "Enable field agents to mark attendance via mobile GPS check-in, with flexible leave policies per region." },
      ],
    },
    "Performance Reviews": {
      overview: "Set goals, conduct 360° reviews, and manage appraisal cycles with customizable templates and real-time progress tracking.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Evaluate line supervisors on production targets, quality metrics, and team management with simple rating scales." },
        { industry: "Manufacturing Company", icon: "factory", description: "Run quarterly reviews linking individual KPIs to plant-level OKRs, with peer and manager feedback." },
        { industry: "Insurance Company", icon: "shield", description: "Assess agents on policy sales targets, customer satisfaction scores, and compliance adherence." },
      ],
    },
    "Recruitment Module": {
      overview: "Post jobs, track applicants, schedule interviews, and manage the entire hiring pipeline from requisition to offer letter.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Bulk-hire seasonal workers with simplified application forms, skill-based screening, and quick onboarding." },
        { industry: "Manufacturing Company", icon: "factory", description: "Manage technical hiring with multi-round interviews, skill assessments, and panel scheduling." },
        { industry: "Insurance Company", icon: "shield", description: "Recruit agents with license verification, background checks, and territory assignment during onboarding." },
      ],
    },
    "Employee Self-Service": {
      overview: "Empower employees to view payslips, apply for leave, update personal info, and access company policies — reducing HR workload.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Workers can check pay breakdowns, request leave from their phone, and download employment letters without visiting HR." },
        { industry: "Manufacturing Company", icon: "factory", description: "Engineers submit expense claims, view training schedules, and update emergency contacts through the portal." },
        { industry: "Insurance Company", icon: "shield", description: "Agents access commission statements, submit travel reimbursements, and enroll in training programs independently." },
      ],
    },
  },
};

const iconMap: Record<string, typeof Factory> = {
  shirt: Shirt,
  factory: Factory,
  shield: ShieldCheck,
  building: Building2,
};

interface DetailData {
  overview: string;
  useCases: { industry: string; icon: string; description: string }[];
  imageUrl?: string;
}

const FeatureDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const product = searchParams.get("product") || "HRMS";
  const feature = searchParams.get("feature") || "";
  const [details, setDetails] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      // Find the feature by product + title
      const { data: featureRow } = await supabase
        .from("features")
        .select("id, image_url, description")
        .eq("product", product)
        .eq("title", feature)
        .maybeSingle();

      let imageUrl = featureRow?.image_url || "";

      if (featureRow) {
        const { data: detailRow } = await supabase
          .from("feature_details")
          .select("*")
          .eq("feature_id", featureRow.id)
          .maybeSingle();

        if (detailRow) {
          setDetails({
            overview: detailRow.overview,
            useCases: (detailRow.use_cases as unknown as { industry: string; icon: string; description: string }[]) || [],
            imageUrl,
          });
          setLoading(false);
          return;
        }

        // No feature_details row — use the feature's own description
        setDetails({
          overview: featureRow.description || "No detailed description available yet.",
          useCases: [],
          imageUrl,
        });
        setLoading(false);
        return;
      }

      // Fallback to hardcoded
      const fallback = fallbackDetails[product]?.[feature];
      setDetails(fallback ? { ...fallback, imageUrl } : null);
      setLoading(false);
    };
    fetchDetails();
  }, [product, feature]);

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary mb-4">
          <ArrowLeft size={18} /> Back
        </button>
        <p className="text-muted-foreground">Feature details not found.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(`/features?product=${encodeURIComponent(product)}`)}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">{feature}</h1>
          <p className="text-xs text-muted-foreground">Written by Hein Htet Aung</p>
        </div>
      </div>

      {/* Feature Image */}
      {details.imageUrl && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-border">
          <img
            src={details.imageUrl}
            alt={`${feature} screenshot`}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Overview */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-bold text-foreground mb-2">Overview</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{details.overview}</p>
      </div>

      {/* Industry Use Cases */}
      {details.useCases.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-foreground mb-3">Real-World Use Cases</h2>
          <div className="space-y-3">
            {details.useCases.map(({ industry, icon, description }) => {
              const IconComponent = iconMap[icon] || Building2;
              return (
                <div
                  key={industry}
                  className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <IconComponent size={18} />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">{industry}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-12">
                    {description}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default FeatureDetailPage;
