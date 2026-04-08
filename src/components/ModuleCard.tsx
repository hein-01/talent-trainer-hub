import { Lock, CheckCircle2, Play } from "lucide-react";

interface ModuleCardProps {
  title: string;
  description: string;
  progress: number;
  locked?: boolean;
  icon: React.ReactNode;
}

const ModuleCard = ({ title, description, progress, locked = false, icon }: ModuleCardProps) => {
  const isComplete = progress === 100;

  return (
    <div
      className={`relative bg-card rounded-2xl p-4 border border-border shadow-sm transition-all duration-200 ${
        locked ? "opacity-60" : "hover:shadow-md active:scale-[0.98]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isComplete
              ? "bg-success/10 text-success"
              : locked
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-foreground truncate">{title}</h3>
            {locked && <Lock size={14} className="text-muted-foreground shrink-0" />}
            {isComplete && <CheckCircle2 size={16} className="text-success shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
          {!locked && (
            <div className="mt-2.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {progress}% complete
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isComplete ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        {!locked && !isComplete && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 self-center">
            <Play size={14} className="text-primary-foreground ml-0.5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleCard;
