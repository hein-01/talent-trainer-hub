import { Globe, Search, FileCheck, Users, Zap, MessageSquare } from "lucide-react";
import ModuleCard from "@/components/ModuleCard";

const modules = [
  { title: "Job Portal Overview", description: "What is a job portal and how does it generate revenue?", progress: 100, icon: <Globe size={22} /> },
  { title: "Job Posting & Search", description: "How employers post jobs and candidates find them.", progress: 45, icon: <Search size={22} /> },
  { title: "Resume Database", description: "Selling the resume search & database access feature.", progress: 0, icon: <FileCheck size={22} /> },
  { title: "Employer Branding", description: "Premium employer profiles and branding solutions.", progress: 0, icon: <Users size={22} /> },
  { title: "AI Matching", description: "AI-powered candidate-job matching and recommendations.", progress: 0, locked: true, icon: <Zap size={22} /> },
  { title: "Pitch Practice", description: "Role-play scenarios for selling to HR managers.", progress: 0, locked: true, icon: <MessageSquare size={22} /> },
];

const JobPortalPage = () => {
  const totalProgress = Math.round(
    modules.filter((m) => !m.locked).reduce((acc, m) => acc + m.progress, 0) /
      modules.filter((m) => !m.locked).length
  );

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Job Portal Training</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Learn to sell job portal solutions confidently
        </p>
        <div className="mt-4 bg-card rounded-2xl p-4 border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-extrabold text-secondary">{totalProgress}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-700"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {modules.map((mod) => (
          <ModuleCard key={mod.title} {...mod} />
        ))}
      </div>
    </div>
  );
};

export default JobPortalPage;
