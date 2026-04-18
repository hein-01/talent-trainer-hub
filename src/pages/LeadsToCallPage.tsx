import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const mockLeadsToCall: { id: string; company: string }[] = [
  { id: "lc-1", company: "Vaultek Systems" },
  { id: "lc-2", company: "NexGen Solutions" },
  { id: "lc-3", company: "CloudBridge Inc" },
  { id: "lc-4", company: "DataPulse Analytics" },
  { id: "lc-5", company: "GreenLeaf Tech" },
];

type SavedOutcome = {
  leadId: string;
  company: string;
  outcome: string;
  notes?: string;
  product: string;
  savedAt: number;
};

const STORAGE_KEY = "lead_outcomes_local";

const readSavedOutcomes = (product: string): SavedOutcome[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as SavedOutcome[];
    return all.filter((o) => o.product === product);
  } catch {
    return [];
  }
};

const LeadsToCallPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const product = searchParams.get("product") || "HRMS";

  const [calledLeads, setCalledLeads] = useState<SavedOutcome[]>([]);

  useEffect(() => {
    setCalledLeads(readSavedOutcomes(product));
  }, [product]);

  const calledIds = new Set(calledLeads.map((c) => c.leadId));
  const callingLeads = mockLeadsToCall.filter((l) => !calledIds.has(l.id));

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
          <p className="text-xs text-muted-foreground">{product}</p>
        </div>
      </div>

      <Tabs defaultValue="calling" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl mb-4">
          <TabsTrigger value="calling" className="rounded-xl">
            Calling ({callingLeads.length})
          </TabsTrigger>
          <TabsTrigger value="called" className="rounded-xl">
            Called ({calledLeads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calling" className="mt-0">
          <div className="flex flex-col gap-3">
            {callingLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                All leads have been called.
              </p>
            ) : (
              callingLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() =>
                    navigate(
                      `/lead-detail?product=${product}&outcome=Leads to Call&leadId=${lead.id}&company=${encodeURIComponent(lead.company)}`,
                    )
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
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="called" className="mt-0">
          <div className="flex flex-col gap-3">
            {calledLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No leads called yet.
              </p>
            ) : (
              calledLeads.map((lead) => (
                <div
                  key={lead.leadId}
                  onClick={() =>
                    navigate(
                      `/lead-detail?product=${product}&outcome=Leads to Call&leadId=${lead.leadId}&company=${encodeURIComponent(lead.company)}`,
                    )
                  }
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md active:scale-[0.98] transition-all animate-fade-in"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                      <Building2 size={20} className="text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground truncate">{lead.company}</span>
                      <span className="text-xs text-muted-foreground truncate">{lead.outcome}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadsToCallPage;
