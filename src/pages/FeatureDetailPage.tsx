import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Factory, Building2, ShieldCheck, Shirt } from "lucide-react";

const featureDetails: Record<string, Record<string, {
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
  "Job Portal": {
    "Job Listings": {
      overview: "Create and publish detailed job postings with requirements, descriptions, and application forms to attract the right candidates.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Post bulk openings for stitchers, cutters, and quality checkers with skill requirements and shift preferences." },
        { industry: "Manufacturing Company", icon: "factory", description: "List specialized roles like CNC operators and quality engineers with certification requirements." },
        { industry: "Insurance Company", icon: "shield", description: "Advertise agent positions by territory with license requirements and commission structure details." },
      ],
    },
    "Candidate Tracking": {
      overview: "Track candidates through every stage — application, screening, interview, offer — with a visual pipeline board.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Move hundreds of applicants through skill tests and trial shifts with batch actions and status updates." },
        { industry: "Manufacturing Company", icon: "factory", description: "Track engineering candidates through technical rounds, plant visits, and offer negotiations." },
        { industry: "Insurance Company", icon: "shield", description: "Monitor agent recruitment pipeline with license verification status and training completion tracking." },
      ],
    },
    "Resume Parsing": {
      overview: "Automatically extract key information from resumes to speed up screening and reduce manual data entry.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Extract years of experience, machine skills, and previous factory names from bulk applications." },
        { industry: "Manufacturing Company", icon: "factory", description: "Parse technical qualifications, certifications, and project experience from engineering resumes." },
        { industry: "Insurance Company", icon: "shield", description: "Extract license numbers, sales experience, and territory preferences from agent applications." },
      ],
    },
    "Interview Scheduling": {
      overview: "Coordinate interviews with calendar integration, automated reminders, and panel availability matching.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Schedule group skill assessments and trial shifts without disrupting production floor operations." },
        { industry: "Manufacturing Company", icon: "factory", description: "Coordinate multi-round technical interviews across different plant locations and time zones." },
        { industry: "Insurance Company", icon: "shield", description: "Schedule field interviews with regional managers and auto-send location details to candidates." },
      ],
    },
    "Analytics Dashboard": {
      overview: "Track hiring metrics like time-to-hire, cost-per-hire, source effectiveness, and pipeline conversion rates.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Measure seasonal hiring efficiency, identify best recruitment sources, and track retention rates." },
        { industry: "Manufacturing Company", icon: "factory", description: "Analyze engineering talent pipeline, compare hiring costs across plants, and forecast staffing needs." },
        { industry: "Insurance Company", icon: "shield", description: "Track agent recruitment ROI, onboarding time, and early attrition rates by territory." },
      ],
    },
  },
  GMS: {
    "Ticket Management": {
      overview: "Create, assign, and track grievance tickets with priority levels, SLA timers, and department routing.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Workers report safety hazards, wage disputes, or harassment — each auto-assigned to the right department with SLA tracking." },
        { industry: "Manufacturing Company", icon: "factory", description: "Track equipment complaints, shift disputes, and facility issues with priority-based routing to maintenance or HR." },
        { industry: "Insurance Company", icon: "shield", description: "Handle agent commission disputes, customer escalations, and policy grievances with audit trails." },
      ],
    },
    "Escalation Workflows": {
      overview: "Automatic escalation rules based on time elapsed, severity level, and department — ensuring nothing falls through the cracks.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Safety complaints auto-escalate to plant manager if unresolved in 24 hours; wage issues escalate to finance head." },
        { industry: "Manufacturing Company", icon: "factory", description: "Equipment failures escalate from floor supervisor to plant director based on downtime duration." },
        { industry: "Insurance Company", icon: "shield", description: "Customer complaints escalate through branch → regional → head office based on policy value and time." },
      ],
    },
    "Anonymous Reporting": {
      overview: "Allow employees to submit grievances anonymously for sensitive issues like harassment, fraud, or safety violations.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Workers report unsafe conditions or supervisor misconduct without fear of retaliation, with anonymous follow-up messaging." },
        { industry: "Manufacturing Company", icon: "factory", description: "Employees flag environmental violations or safety shortcuts anonymously, triggering confidential investigations." },
        { industry: "Insurance Company", icon: "shield", description: "Staff report fraudulent claims or unethical sales practices through a secure anonymous channel." },
      ],
    },
    "Resolution Tracking": {
      overview: "Track resolution progress, add investigation notes, attach evidence, and maintain a complete audit trail.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Document each step of a workplace dispute resolution — from complaint to investigation to final action." },
        { industry: "Manufacturing Company", icon: "factory", description: "Track corrective actions for safety incidents with photo evidence, inspector notes, and compliance sign-offs." },
        { industry: "Insurance Company", icon: "shield", description: "Maintain detailed resolution logs for regulatory audits, with timestamps and responsible party tracking." },
      ],
    },
    "Compliance Reports": {
      overview: "Generate compliance reports for internal audits, regulatory submissions, and board reviews.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Generate labor compliance reports for international brand audits, showing grievance resolution rates and timelines." },
        { industry: "Manufacturing Company", icon: "factory", description: "Produce OSHA-ready safety incident reports with trend analysis and corrective action summaries." },
        { industry: "Insurance Company", icon: "shield", description: "Create regulatory compliance reports showing complaint handling metrics and resolution benchmarks." },
      ],
    },
  },
  POS: {
    "Sales Processing": {
      overview: "Fast checkout with barcode scanning, multiple payment methods, split bills, and instant receipt generation.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Process bulk fabric and accessory purchases from suppliers with purchase orders and goods receipt notes." },
        { industry: "Manufacturing Company", icon: "factory", description: "Handle spare parts sales to contractors with tax invoicing, credit terms, and delivery tracking." },
        { industry: "Insurance Company", icon: "shield", description: "Process premium payments at branch offices with multiple payment modes and instant policy receipts." },
      ],
    },
    "Inventory Management": {
      overview: "Real-time stock tracking, low-stock alerts, automated reorder points, and multi-location inventory sync.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Track raw materials like fabric rolls, buttons, and threads with minimum stock alerts and supplier auto-reordering." },
        { industry: "Manufacturing Company", icon: "factory", description: "Monitor spare parts inventory across warehouses, track consumption rates, and forecast procurement needs." },
        { industry: "Insurance Company", icon: "shield", description: "Manage branch office supplies, marketing materials, and policy document inventory with auto-replenishment." },
      ],
    },
    "Customer Management": {
      overview: "Track customer purchase history, loyalty points, preferences, and communication history.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Maintain buyer profiles with order history, fabric preferences, and credit terms for repeat wholesale customers." },
        { industry: "Manufacturing Company", icon: "factory", description: "Track B2B customer accounts with contract pricing, order patterns, and relationship management notes." },
        { industry: "Insurance Company", icon: "shield", description: "Store policyholder profiles with coverage history, claim records, and renewal preferences for personalized service." },
      ],
    },
    "Reporting & Analytics": {
      overview: "Daily sales reports, product performance analysis, revenue trends, and custom dashboards.",
      useCases: [
        { industry: "Garment Factory", icon: "shirt", description: "Analyze fabric consumption trends, supplier pricing changes, and seasonal demand patterns for better procurement." },
        { industry: "Manufacturing Company", icon: "factory", description: "Track spare parts sales by category, identify fast-moving items, and optimize warehouse stocking levels." },
        { industry: "Insurance Company", icon: "shield", description: "Monitor branch-wise premium collection, policy mix analysis, and agent performance dashboards." },
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

const FeatureDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const product = searchParams.get("product") || "HRMS";
  const feature = searchParams.get("feature") || "";
  const details = featureDetails[product]?.[feature];

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

      {/* Overview */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-bold text-foreground mb-2">Overview</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{details.overview}</p>
      </div>

      {/* Industry Use Cases */}
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
    </div>
  );
};

export default FeatureDetailPage;
