import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Building2 } from "lucide-react";

const mockLeads: Record<string, { id: string; company: string }[]> = {
  "Closed": [
    { id: "1", company: "Acme Corp" },
    { id: "2", company: "Globex Inc" },
    { id: "3", company: "Initech Ltd" },
  ],
  "Trial": [
    { id: "4", company: "Hooli Technologies" },
    { id: "5", company: "Pied Piper" },
    { id: "6", company: "Raviga Capital" },
    { id: "7", company: "Bachmanity" },
    { id: "8", company: "Endframe" },
    { id: "9", company: "Sliceline" },
    { id: "10", company: "Optimoji" },
    { id: "11", company: "RussFest Inc" },
    { id: "12", company: "SeeFood Tech" },
    { id: "13", company: "PiperChat" },
  ],
  "Meeting": [
    { id: "14", company: "Wayne Enterprises" },
    { id: "15", company: "Stark Industries" },
    { id: "16", company: "Oscorp" },
    { id: "17", company: "LexCorp" },
    { id: "18", company: "Umbrella Corp" },
    { id: "19", company: "Cyberdyne Systems" },
    { id: "20", company: "Tyrell Corp" },
    { id: "21", company: "Weyland-Yutani" },
    { id: "22", company: "Soylent Corp" },
    { id: "23", company: "Massive Dynamic" },
    { id: "24", company: "Abstergo Industries" },
    { id: "25", company: "Aperture Science" },
    { id: "26", company: "Black Mesa" },
  ],
  "Maybe Later": [
    { id: "27", company: "Dunder Mifflin" },
    { id: "28", company: "Wernham Hogg" },
  ],
};

const OutcomeLeadsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const product = searchParams.get("product") || "HRMS";
  const outcome = searchParams.get("outcome") || "Closed";
  const leads = mockLeads[outcome] || [];

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
          <h1 className="text-xl font-extrabold text-foreground">{outcome}</h1>
          <p className="text-xs text-muted-foreground">{product} · {leads.length} leads</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {leads.map((lead) => (
          <div
            key={lead.id}
            onClick={() =>
              navigate(`/lead-detail?product=${product}&outcome=${outcome}&leadId=${lead.id}&company=${encodeURIComponent(lead.company)}`)
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

export default OutcomeLeadsPage;
