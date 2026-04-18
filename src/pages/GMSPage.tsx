import { BarChart3, Target, TrendingUp, Award } from "lucide-react";
import ModuleCard from "@/components/ModuleCard";

const modules = [
  { title: "GMS Fundamentals", description: "What is a Grievance Management System and why it matters.", progress: 50, icon: <BarChart3 size={22} /> },
  { title: "Key Features", description: "Ticket routing, escalation, SLA tracking, and reporting.", progress: 10, icon: <Target size={22} /> },
  { title: "Sales Strategies", description: "Positioning GMS to compliance-focused buyers.", progress: 0, icon: <TrendingUp size={22} /> },
  { title: "Case Studies", description: "Real success stories from GMS implementations.", progress: 0, locked: true, icon: <Award size={22} /> },
];

const GMSPage = () => {
  const totalProgress = Math.round(
    modules.filter((m) => !m.locked).reduce((acc, m) => acc + m.progress, 0) /
      modules.filter((m) => !m.locked).length
  );

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">GMS Training</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Grievance Management System sales training
        </p>
        <div className="mt-4 bg-card rounded-2xl p-4 border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-extrabold text-accent">{totalProgress}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700"
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

export default GMSPage;
