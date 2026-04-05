import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const featuresByProduct: Record<string, { title: string; description: string }[]> = {
  HRMS: [
    { title: "Employee Database", description: "Centralized storage for all employee records including personal details, documents, and employment history." },
    { title: "Payroll Management", description: "Automated salary calculations, tax deductions, and compliance with local labor laws." },
    { title: "Leave & Attendance", description: "Track employee attendance, manage leave requests, and generate timesheets automatically." },
    { title: "Performance Reviews", description: "Set goals, conduct 360° reviews, and manage appraisal cycles with customizable templates." },
    { title: "Recruitment Module", description: "Post jobs, track applicants, schedule interviews, and manage the entire hiring pipeline." },
    { title: "Employee Self-Service", description: "Employees can view payslips, apply for leave, update info, and access company policies." },
  ],
  "Job Portal": [
    { title: "Job Listings", description: "Create and publish job postings with detailed descriptions, requirements, and application forms." },
    { title: "Candidate Tracking", description: "Track candidates through every stage of the hiring process from application to offer." },
    { title: "Resume Parsing", description: "Automatically extract key information from resumes to speed up candidate screening." },
    { title: "Interview Scheduling", description: "Coordinate interviews with built-in calendar integration and automated reminders." },
    { title: "Analytics Dashboard", description: "Track hiring metrics like time-to-hire, cost-per-hire, and source effectiveness." },
  ],
  GMS: [
    { title: "Ticket Management", description: "Create, assign, and track grievance tickets with priority levels and SLA timers." },
    { title: "Escalation Workflows", description: "Automatic escalation rules based on time, severity, and department." },
    { title: "Anonymous Reporting", description: "Allow employees to submit grievances anonymously for sensitive issues." },
    { title: "Resolution Tracking", description: "Track resolution progress, add notes, and maintain a full audit trail." },
    { title: "Compliance Reports", description: "Generate compliance reports for internal audits and regulatory requirements." },
  ],
  POS: [
    { title: "Sales Processing", description: "Fast checkout with barcode scanning, multiple payment methods, and receipt generation." },
    { title: "Inventory Management", description: "Real-time stock tracking, low-stock alerts, and automated reorder points." },
    { title: "Customer Management", description: "Track customer purchase history, loyalty points, and preferences." },
    { title: "Reporting & Analytics", description: "Daily sales reports, product performance, and revenue analytics." },
  ],
};

const FeaturesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const product = searchParams.get("product") || "HRMS";
  const features = featuresByProduct[product] || featuresByProduct["HRMS"];

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">{product} Features</h1>
          <p className="text-xs text-muted-foreground">{features.length} features to learn</p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="space-y-3">
        {features.map(({ title, description }, i) => (
          <div
            key={title}
            className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all"
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesPage;
