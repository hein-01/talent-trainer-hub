import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Trophy, Calendar, Clock, CheckCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const outcomeData = [
  { label: "Closed", count: 3, icon: CheckCircle, color: "bg-green-500", textColor: "text-green-600" },
  { label: "Trial", count: 10, icon: Trophy, color: "bg-yellow-400", textColor: "text-yellow-600" },
  { label: "Meeting", count: 13, icon: Calendar, color: "bg-blue-500", textColor: "text-blue-600" },
  { label: "Maybe Later", count: 2, icon: Clock, color: "bg-red-400", textColor: "text-red-500" },
];

const OutcomesPage = () => {
  const [searchParams] = useSearchParams();
  const product = searchParams.get("product") || "HRMS";
  const navigate = useNavigate();
  const total = outcomeData.reduce((sum, o) => sum + o.count, 0);

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft size={22} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Call Outcomes</h1>
          <p className="text-xs text-muted-foreground">{product}</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {outcomeData.map(({ label, count, icon: Icon, color, textColor }) => (
          <div
            key={label}
            onClick={() => navigate(`/outcome-leads?product=${product}&outcome=${label}`)}
            className="bg-card border border-border rounded-2xl p-4 flex flex-col items-start gap-2 animate-fade-in cursor-pointer hover:shadow-md active:scale-[0.98] transition-all"
          >
            <div className="flex items-center justify-between w-full">
              <div className={`p-2 rounded-xl ${color}/15`}>
                <Icon size={20} className={textColor} />
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </div>
            <span className="text-2xl font-extrabold text-foreground">{count}</span>
            <span className="text-xs font-semibold text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Overall Progress</h3>
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-muted">
          {outcomeData.map(({ label, count, color }) => (
            <div
              key={label}
              className={`${color} h-full transition-all duration-500`}
              style={{ width: `${(count / total) * 100}%` }}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
          {outcomeData.map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-xs text-muted-foreground font-medium">
                {label} ({Math.round((count / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutcomesPage;
