import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getLeadUuid, extractRescheduleAt } from "./LeadDetailPage";

const formatRescheduleAt = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

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
  const { user } = useAuth();

  const [calledLeads, setCalledLeads] = useState<SavedOutcome[]>([]);

  useEffect(() => {
    // Start with local copy for instant render.
    setCalledLeads(readSavedOutcomes(product));

    // If logged in, hydrate from the DB and merge into local mirror.
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        // Build a map from dbLeadId -> mock lead (id + company) for this product.
        const entries = await Promise.all(
          mockLeadsToCall.map(async (l) => [
            await getLeadUuid(user.id, product, l.id),
            l,
          ] as const),
        );
        const dbToMock = new Map(entries);

        const { data, error } = await supabase
          .from("lead_outcomes")
          .select("lead_id, outcome, notes, updated_at, leads!inner(product, company_name)")
          .eq("user_id", user.id)
          .eq("leads.product", product);
        if (error) throw error;
        if (cancelled || !data) return;

        const fromDb: SavedOutcome[] = data.map((row: any) => {
          const mock = dbToMock.get(row.lead_id);
          return {
            leadId: mock?.id ?? row.lead_id,
            company: mock?.company ?? row.leads?.company_name ?? "Unknown",
            outcome: row.outcome,
            notes: row.notes ?? "",
            product,
            savedAt: new Date(row.updated_at).getTime(),
          };
        });
        setCalledLeads(fromDb);

        // Mirror to localStorage (replace this product's entries).
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const all = raw ? (JSON.parse(raw) as SavedOutcome[]) : [];
          const others = all.filter((o) => o.product !== product);
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...others, ...fromDb]));
        } catch {
          // ignore
        }
      } catch (e) {
        console.error("Failed to load outcomes from DB:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product, user]);

  const stayInCallingOutcomes = new Set([
    // Follow-up
    "Callback Requested",
    "Send Information / Send Pricing",
    "Decision Maker Not Available",
    "Call Back Later (general)",
    "Not Now / Check Back Later",
    "Lead Nurturing (keep in sequence)",
    "Attempted Contact (no answer)",
    "Left Voicemail + Sent Email",
    // Contact Issues
    "Wrong Number",
    "No Answer / Voicemail Left",
    "Invalid Email",
    "Disconnected Number",
    "Left Voicemail (no callback yet)",
    "Gatekeeper Blocked",
    // Scheduling
    "Rescheduled by Prospect",
    "Rescheduled by Sales Rep",
    "Did Not Show (for scheduled call)",
    "Canceled by Prospect",
    "Bad Timing (company in freeze, end of quarter, etc.)",
  ]);

  const followUpLeads = calledLeads.filter((c) => stayInCallingOutcomes.has(c.outcome));
  const followUpIds = new Set(followUpLeads.map((c) => c.leadId));
  const trulyCalledLeads = calledLeads.filter((c) => !stayInCallingOutcomes.has(c.outcome));
  const trulyCalledIds = new Set(trulyCalledLeads.map((c) => c.leadId));

  const uncalledLeads = mockLeadsToCall.filter(
    (l) => !trulyCalledIds.has(l.id) && !followUpIds.has(l.id),
  );
  const callingLeads: { id: string; company: string; outcome?: string; notes?: string }[] = [
    ...uncalledLeads,
    ...followUpLeads.map((f) => ({ id: f.leadId, company: f.company, outcome: f.outcome, notes: f.notes })),
  ];

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
            Called ({trulyCalledLeads.length})
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
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-foreground truncate">{lead.company}</span>
                    {lead.outcome && (() => {
                      const { rescheduledAt } = extractRescheduleAt(lead.notes);
                      return (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-primary truncate">{lead.outcome}</span>
                          {rescheduledAt && (
                            <span className="text-xs font-medium text-primary whitespace-nowrap">
                              · {formatRescheduleAt(rescheduledAt)}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="called" className="mt-0">
          {(() => {
            const trialOutcomes = ["Trial Accepted / Trial Started"];
            const meetingOutcomes = ["Meeting Scheduled", "Demo Requested"];
            const dealWonOutcomes = ["Deal Won / Closed Won"];
            const categorized = new Set([...trialOutcomes, ...meetingOutcomes, ...dealWonOutcomes]);

            const trialLeads = trulyCalledLeads.filter((l) => trialOutcomes.includes(l.outcome));
            const meetingLeads = trulyCalledLeads.filter((l) => meetingOutcomes.includes(l.outcome));
            const dealWonLeads = trulyCalledLeads.filter((l) => dealWonOutcomes.includes(l.outcome));
            const otherLeads = trulyCalledLeads.filter((l) => !categorized.has(l.outcome));

            const formatTrialEndDate = (savedAt: number) => {
              const end = new Date(savedAt);
              end.setDate(end.getDate() + 21);
              return end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            };

            const renderList = (list: SavedOutcome[], emptyText: string) =>
              list.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{emptyText}</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {list.map((lead) => {
                    const isTrial = trialOutcomes.includes(lead.outcome);
                    return (
                      <div
                        key={lead.leadId}
                        onClick={() =>
                          navigate(
                            `/lead-detail?product=${product}&outcome=Leads to Call&leadId=${lead.leadId}&company=${encodeURIComponent(lead.company)}`,
                          )
                        }
                        className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md active:scale-[0.98] transition-all animate-fade-in"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-foreground truncate">{lead.company}</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground truncate">{lead.outcome}</span>
                            {isTrial && (
                              <span className="text-xs font-medium text-primary whitespace-nowrap">
                                · Ends on {formatTrialEndDate(lead.savedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                      </div>
                    );
                  })}
                </div>
              );

            return (
              <Tabs defaultValue="trial" className="w-full">
                <TabsList className="grid w-full grid-cols-4 rounded-2xl mb-4 h-auto">
                  <TabsTrigger value="trial" className="rounded-xl text-xs">
                    Trial ({trialLeads.length})
                  </TabsTrigger>
                  <TabsTrigger value="meeting" className="rounded-xl text-xs">
                    Meeting ({meetingLeads.length})
                  </TabsTrigger>
                  <TabsTrigger value="deal-won" className="rounded-xl text-xs">
                    Deal Won ({dealWonLeads.length})
                  </TabsTrigger>
                  <TabsTrigger value="others" className="rounded-xl text-xs">
                    Others ({otherLeads.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="trial" className="mt-0">
                  {renderList(trialLeads, "No trial leads yet.")}
                </TabsContent>
                <TabsContent value="meeting" className="mt-0">
                  {renderList(meetingLeads, "No meeting leads yet.")}
                </TabsContent>
                <TabsContent value="deal-won" className="mt-0">
                  {renderList(dealWonLeads, "No deals won yet.")}
                </TabsContent>
                <TabsContent value="others" className="mt-0">
                  {renderList(otherLeads, "No other leads yet.")}
                </TabsContent>
              </Tabs>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadsToCallPage;
