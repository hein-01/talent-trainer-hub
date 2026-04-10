import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Building2 } from "lucide-react";

const mockLeadsToCall: { id: string; company: string }[] = [
  { id: "lc-1", company: "Vaultek Systems" },
  { id: "lc-2", company: "NexGen Solutions" },
  { id: "lc-3", company: "CloudBridge Inc" },
  { id: "lc-4", company: "DataPulse Analytics" },
  { id: "lc-5", company: "GreenLeaf Tech" },
];

const LeadsToCallPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const product = searchParams.get("product") || "HRMS";

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft size={22} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Leads to Call</h1>
          <p className="text-xs text-muted-foreground">{product} · {mockLeadsToCall.length} leads</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {mockLeadsToCall.map((lead) => (
          <div
            key={lead.id}
            onClick={() =>
              navigate(`/lead-detail?product=${product}&outcome=Leads to Call&leadId=${lead.id}&company=${encodeURIComponent(lead.company)}`)
            }
            className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md active:scale-[0.98] transition-all animate-fade-in"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Building2 size={20} className="text-primary" />
              </div>
              <span className="font-semibold text-foreground">{lead.company}</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadsToCallPage;
