import { Users, Shield, Clock, FileText, Settings, Database } from "lucide-react";
import ModuleCard from "@/components/ModuleCard";

const modules = [
  { title: "What is HRMS?", description: "Introduction to Human Resource Management Systems and why companies need them.", progress: 100, icon: <Database size={22} /> },
  { title: "Core HR Features", description: "Employee records, org charts, and employee lifecycle management.", progress: 65, icon: <Users size={22} /> },
  { title: "Payroll & Compliance", description: "Salary processing, tax calculations, and statutory compliance.", progress: 30, icon: <FileText size={22} /> },
  { title: "Attendance & Leave", description: "Time tracking, leave management, and shift scheduling.", progress: 0, icon: <Clock size={22} /> },
  { title: "Performance Mgmt", description: "Goal setting, reviews, and appraisal workflows.", progress: 0, locked: true, icon: <Shield size={22} /> },
  { title: "Handling Objections", description: "Common objections buyers raise and how to counter them.", progress: 0, locked: true, icon: <Settings size={22} /> },
];

const HRMSPage = () => {
  const totalProgress = Math.round(
    modules.filter((m) => !m.locked).reduce((acc, m) => acc + m.progress, 0) /
      modules.filter((m) => !m.locked).length
  );

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">HRMS Training</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Master HRMS sales in bite-sized lessons
        </p>
        <div className="mt-4 bg-card rounded-2xl p-4 border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-extrabold text-primary">{totalProgress}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            🔥 Keep going! You're doing great.
          </p>
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

export default HRMSPage;
