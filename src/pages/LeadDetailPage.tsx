import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RESCHEDULE_OUTCOME = "Rescheduled by Sales Rep";
const RESCHEDULE_PREFIX_RE = /^\[RESCHEDULED_AT:([^\]]+)\]\s*\n?/;

export const extractRescheduleAt = (notes?: string | null): { rescheduledAt: string | null; cleanNotes: string } => {
  if (!notes) return { rescheduledAt: null, cleanNotes: "" };
  const m = notes.match(RESCHEDULE_PREFIX_RE);
  if (!m) return { rescheduledAt: null, cleanNotes: notes };
  return { rescheduledAt: m[1], cleanNotes: notes.replace(RESCHEDULE_PREFIX_RE, "") };
};

// Deterministic UUID v4-shaped id derived from a string, so the same mock
// lead always maps to the same DB uuid for a given user+product.
const stringToUuid = async (input: string): Promise<string> => {
  const bytes = new TextEncoder().encode(input);
  const hashBuf = await crypto.subtle.digest("SHA-256", bytes);
  const h = Array.from(new Uint8Array(hashBuf)).slice(0, 16);
  h[6] = (h[6] & 0x0f) | 0x40;
  h[8] = (h[8] & 0x3f) | 0x80;
  const hex = h.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export const getLeadUuid = (userId: string, product: string, mockLeadId: string) =>
  stringToUuid(`${userId}::${product}::${mockLeadId}`);

const mockLeadDetails: Record<string, { company: string; brief?: string; phones: { label: string; number: string }[] }> = {
  "1": { company: "Acme Corp", brief: "Manufacturing company (~200 employees). Decision maker: John Smith (HR Director). Currently using spreadsheets for payroll.", phones: [{ label: "Office", number: "+1234567890" }] },
  "2": { company: "Globex Inc", brief: "Logistics firm. Decision maker: Sarah Lee (COO). Looking to digitize attendance tracking.", phones: [{ label: "Main", number: "+1987654321" }] },
  "3": { company: "Initech Ltd", brief: "Mid-size IT services. Decision maker: Peter Gibbons (Ops Manager). Frustrated with current TPS reports.", phones: [{ label: "HQ", number: "+1122334455" }] },
  "4": { company: "Hooli Technologies", brief: "Tech enterprise. Decision maker: Gavin Belson (CEO). Evaluating multiple HRMS vendors.", phones: [{ label: "Sales", number: "+1555000111" }] },
  "5": { company: "Pied Piper", brief: "Startup, ~30 employees. Decision makers: Richard Hendricks (CEO), Jared Dunn (COO).", phones: [{ label: "Richard", number: "+1555000222" }, { label: "Jared", number: "+1555000333" }] },
  "14": { company: "Wayne Enterprises", brief: "Large conglomerate. Decision maker: Bruce Wayne (Owner). Looking for enterprise-grade solution.", phones: [{ label: "Bruce", number: "+1555000444" }] },
  "27": { company: "Dunder Mifflin", brief: "Paper distribution, regional branch ~25 employees. Decision makers: Michael Scott (Regional Mgr), Dwight Schrute (Asst. to RM).", phones: [{ label: "Michael", number: "+1555000555" }, { label: "Dwight", number: "+1555000666" }] },
};

const outcomeGroups: { label: string; options: string[] }[] = [
  {
    label: "Positive",
    options: [
      "Meeting Scheduled",
      "Demo Requested",
      "Trial Accepted / Trial Started",
      "Proposal Sent",
      "Verbal Commitment",
      "Contract Sent",
      "Deal Won / Closed Won",
      "Referral Given",
    ],
  },
  {
    label: "Follow-up",
    options: [
      "Callback Requested",
      "Send Information / Send Pricing",
      "Decision Maker Not Available",
      "Call Back Later (general)",
      "Not Now / Check Back Later",
      "Lead Nurturing (keep in sequence)",
      "Attempted Contact (no answer)",
      "Left Voicemail + Sent Email",
    ],
  },
  {
    label: "Negative",
    options: [
      "Not Interested",
      "Already Using Competitor",
      "No Budget",
      "No Authority (wrong contact)",
      "No Need / No Use Case",
      "Just Browsing / Researching",
      "Not a Fit",
      "Deal Lost (to competitor or status quo)",
      "Unqualified (BANT failure)",
    ],
  },
  {
    label: "Contact Issues",
    options: [
      "Wrong Number",
      "No Answer / Voicemail Left",
      "Invalid Email",
      "Disconnected Number",
      "Left Voicemail (no callback yet)",
      "Gatekeeper Blocked",
    ],
  },
  {
    label: "Scheduling",
    options: [
      "Rescheduled by Prospect",
      "Rescheduled by Sales Rep",
      "Did Not Show (for scheduled call)",
      "Canceled by Prospect",
      "Bad Timing (company in freeze, end of quarter, etc.)",
    ],
  },
];


const LeadDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const product = searchParams.get("product") || "HRMS";
  const leadId = searchParams.get("leadId") || "";
  const companyName = searchParams.get("company") || "Unknown";
  const currentOutcome = searchParams.get("outcome") || "";

  const detail = mockLeadDetails[leadId];
  const phones = detail?.phones || [{ label: "Main", number: "+0000000000" }];
  const brief = detail?.brief || "No brief available for this lead yet. Add company business type, decision maker name, and key context here.";

  const STORAGE_KEY = "lead_outcomes_local";

  type SavedOutcome = {
    leadId: string;
    company: string;
    outcome: string;
    notes?: string;
    product: string;
    savedAt: number;
  };

  const readAll = (): SavedOutcome[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedOutcome[]) : [];
    } catch {
      return [];
    }
  };

  const existing = readAll().find((o) => o.leadId === leadId && o.product === product);

  const existingExtract = extractRescheduleAt(existing?.notes);
  const [notes, setNotes] = useState(existingExtract.cleanNotes);
  const [selectedOutcome, setSelectedOutcome] = useState(existing?.outcome || (currentOutcome && currentOutcome !== "Leads to Call" ? currentOutcome : ""));
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleAt, setRescheduleAt] = useState(existingExtract.rescheduledAt || "");

  const initialNotes = existingExtract.cleanNotes;
  const initialOutcome = existing?.outcome || (currentOutcome && currentOutcome !== "Leads to Call" ? currentOutcome : "");
  const hasUnsavedChanges = notes !== initialNotes || selectedOutcome !== initialOutcome;

  const performNavigateBack = () => {
    if (currentOutcome === "Leads to Call") {
      navigate(`/leads-to-call?product=${product}`);
    } else {
      navigate(`/outcome-leads?product=${product}&outcome=${encodeURIComponent(currentOutcome)}`);
    }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      performNavigateBack();
    }
  };

  const { user } = useAuth();

  const persistOutcome = async (finalNotes: string) => {
    try {
      const all = readAll();
      const filtered = all.filter((o) => !(o.leadId === leadId && o.product === product));
      filtered.push({
        leadId,
        company: companyName,
        outcome: selectedOutcome,
        notes: finalNotes,
        product,
        savedAt: Date.now(),
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }

    if (user) {
      try {
        const dbLeadId = await getLeadUuid(user.id, product, leadId);

        const { error: leadErr } = await supabase
          .from("leads")
          .upsert(
            {
              id: dbLeadId,
              product,
              company_name: companyName,
              assigned_user_id: user.id,
              phone_numbers: phones,
            },
            { onConflict: "id" },
          );
        if (leadErr) throw leadErr;

        const { error: delErr } = await supabase
          .from("lead_outcomes")
          .delete()
          .eq("lead_id", dbLeadId)
          .eq("user_id", user.id);
        if (delErr) throw delErr;

        const { error: outErr } = await supabase.from("lead_outcomes").insert({
          lead_id: dbLeadId,
          user_id: user.id,
          outcome: selectedOutcome,
          notes: finalNotes,
        });
        if (outErr) throw outErr;

        toast.success("Outcome saved");
      } catch (e: any) {
        console.error("Failed to save outcome to DB:", e);
        toast.error(`Saved locally. DB save failed: ${e?.message || "unknown error"}`);
      }
    } else {
      toast.message("Saved locally. Sign in to sync to the database.");
    }

    performNavigateBack();
  };

  const handleSave = async () => {
    if (!selectedOutcome) {
      toast.warning("Please select an outcome before saving.");
      return;
    }
    if (selectedOutcome === RESCHEDULE_OUTCOME) {
      setShowRescheduleDialog(true);
      return;
    }
    await persistOutcome(notes);
  };

  const handleRescheduleConfirm = async () => {
    if (!rescheduleAt) {
      toast.warning("Please pick a new date and time.");
      return;
    }
    setShowRescheduleDialog(false);
    await persistOutcome(`[RESCHEDULED_AT:${rescheduleAt}]\n${notes}`);
  };

  const handleSaveFromDialog = () => {
    setShowConfirmDialog(false);
    handleSave();
  };

  const handleDiscard = () => {
    setShowConfirmDialog(false);
    performNavigateBack();
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleBackClick}
          className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft size={22} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">{companyName}</h1>
          <p className="text-xs text-muted-foreground">{product}</p>
        </div>
      </div>

      {/* Brief */}
      <div className="mb-6">
        <label className="text-sm font-bold text-foreground mb-2 block">Brief</label>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{brief}</p>
        </div>
      </div>

      {/* Phone Numbers */}
      <div className="flex flex-col gap-3 mb-6">
        {phones.map((phone) => (
          <a
            key={phone.number}
            href={`tel:${phone.number}`}
            className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-md active:scale-[0.98] transition-all"
          >
            <div className="p-2 rounded-xl bg-green-500/15">
              <Phone size={20} className="text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">{phone.label}</span>
              <span className="font-semibold text-foreground">{phone.number}</span>
            </div>
          </a>
        ))}
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="text-sm font-bold text-foreground mb-2 block">Notes</label>
        <Textarea
          placeholder="Add notes about this call..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-2xl min-h-[120px]"
        />
      </div>

      {/* Outcome Cards */}
      <div className="mb-8">
        <label className="text-sm font-bold text-foreground mb-3 block">Outcome</label>
        <div className="flex flex-col gap-5">
          {outcomeGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                {group.label}
              </p>
              <div
                className="-mx-4 px-4 overflow-x-auto snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="flex gap-2 pb-1">
                  {group.options.map((option) => {
                    const isSelected = selectedOutcome === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedOutcome(option)}
                        className={`shrink-0 snap-start w-32 text-left rounded-xl border p-3 text-xs font-medium transition-all active:scale-[0.97] ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full rounded-2xl h-12 text-base font-bold">
        Save
      </Button>

      {/* Unsaved Changes Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Would you like to save them before leaving, or discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="rounded-xl mt-0">Cancel</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={handleDiscard}
              className="rounded-xl"
            >
              Discard
            </Button>
            <AlertDialogAction onClick={handleSaveFromDialog} className="rounded-xl">
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Reschedule call</DialogTitle>
            <DialogDescription>Enter the new scheduled date and time</DialogDescription>
          </DialogHeader>
          <Input
            type="datetime-local"
            value={rescheduleAt}
            onChange={(e) => setRescheduleAt(e.target.value)}
            className="rounded-xl"
          />
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleRescheduleConfirm} className="rounded-xl">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadDetailPage;
