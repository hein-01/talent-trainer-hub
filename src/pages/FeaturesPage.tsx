import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronRight, X, ZoomIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import hrmsEmployeeDb from "@/assets/features/hrms-employee-database.jpg";
import hrmsPayroll from "@/assets/features/hrms-payroll.jpg";
import hrmsLeave from "@/assets/features/hrms-leave-attendance.jpg";
import hrmsPerformance from "@/assets/features/hrms-performance.jpg";
import hrmsRecruitment from "@/assets/features/hrms-recruitment.jpg";
import hrmsSelfService from "@/assets/features/hrms-self-service.jpg";

// Fallback hardcoded features (used when DB is empty)
const fallbackFeatures: Record<string, { title: string; description: string; image: string }[]> = {
  HRMS: [
    { title: "Employee Database", description: "Centralized storage for all employee records including personal details, documents, and employment history.", image: hrmsEmployeeDb },
    { title: "Payroll Management", description: "Automated salary calculations, tax deductions, and compliance with local labor laws.", image: hrmsPayroll },
    { title: "Leave & Attendance", description: "Track employee attendance, manage leave requests, and generate timesheets automatically.", image: hrmsLeave },
    { title: "Performance Reviews", description: "Set goals, conduct 360° reviews, and manage appraisal cycles with customizable templates.", image: hrmsPerformance },
    { title: "Recruitment Module", description: "Post jobs, track applicants, schedule interviews, and manage the entire hiring pipeline.", image: hrmsRecruitment },
    { title: "Employee Self-Service", description: "Employees can view payslips, apply for leave, update info, and access company policies.", image: hrmsSelfService },
  ],
  "Job Portal": [
    { title: "Job Listings", description: "Create and publish job postings with detailed descriptions, requirements, and application forms.", image: hrmsRecruitment },
    { title: "Candidate Tracking", description: "Track candidates through every stage of the hiring process from application to offer.", image: hrmsEmployeeDb },
    { title: "Resume Parsing", description: "Automatically extract key information from resumes to speed up candidate screening.", image: hrmsSelfService },
    { title: "Interview Scheduling", description: "Coordinate interviews with built-in calendar integration and automated reminders.", image: hrmsLeave },
    { title: "Analytics Dashboard", description: "Track hiring metrics like time-to-hire, cost-per-hire, and source effectiveness.", image: hrmsPerformance },
  ],
  GMS: [
    { title: "Ticket Management", description: "Create, assign, and track grievance tickets with priority levels and SLA timers.", image: hrmsEmployeeDb },
    { title: "Escalation Workflows", description: "Automatic escalation rules based on time, severity, and department.", image: hrmsPayroll },
    { title: "Anonymous Reporting", description: "Allow employees to submit grievances anonymously for sensitive issues.", image: hrmsSelfService },
    { title: "Resolution Tracking", description: "Track resolution progress, add notes, and maintain a full audit trail.", image: hrmsLeave },
    { title: "Compliance Reports", description: "Generate compliance reports for internal audits and regulatory requirements.", image: hrmsPerformance },
  ],
  POS: [
    { title: "Sales Processing", description: "Fast checkout with barcode scanning, multiple payment methods, and receipt generation.", image: hrmsPayroll },
    { title: "Inventory Management", description: "Real-time stock tracking, low-stock alerts, and automated reorder points.", image: hrmsEmployeeDb },
    { title: "Customer Management", description: "Track customer purchase history, loyalty points, and preferences.", image: hrmsSelfService },
    { title: "Reporting & Analytics", description: "Daily sales reports, product performance, and revenue analytics.", image: hrmsPerformance },
  ],
};

const FeaturesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const product = searchParams.get("product") || "HRMS";
  const [features, setFeatures] = useState<{ title: string; description: string; image: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("features")
        .select("*")
        .eq("product", product)
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        setFeatures(
          data.map((f) => ({
            title: f.title,
            description: f.description,
            image: f.image_url || "",
          }))
        );
      } else {
        // Fallback to hardcoded data
        setFeatures(fallbackFeatures[product] || fallbackFeatures["HRMS"]);
      }
      setLoading(false);
    };
    fetchFeatures();
  }, [product]);

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
        <p className="text-muted-foreground text-sm">Loading features...</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">{product} Features</h1>
          <p className="text-xs text-muted-foreground">{features.length} screens to learn</p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="space-y-3">
        {features.map(({ title, description, image }, i) => (
          <div
            key={title}
            onClick={() => navigate(`/feature-detail?product=${encodeURIComponent(product)}&feature=${encodeURIComponent(title)}`)}
            className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-bold">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">{title}</h3>
                  <CheckCircle2 size={14} className="text-muted-foreground/30 shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 mt-1 rainbow-animate">
                <span className="text-[10px] font-semibold">ဖတ်ရန်</span>
                <ChevronRight size={24} />
              </div>
            </div>
            {/* Feature Screenshot */}
            {image && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxImage(image); }}
                className="relative mt-3 w-full rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-colors cursor-zoom-in group"
              >
                <img
                  src={image}
                  alt={`${title} screenshot`}
                  loading="lazy"
                  width={1280}
                  height={720}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={14} className="text-foreground" />
                </div>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X size={20} className="text-foreground" />
          </button>
          <img
            src={lightboxImage}
            alt="Feature screenshot"
            className="relative z-10 max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default FeaturesPage;
