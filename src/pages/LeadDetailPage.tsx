import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

const mockLeadDetails: Record<string, { company: string; phones: { label: string; number: string }[] }> = {
  "1": { company: "Acme Corp", phones: [{ label: "Office", number: "+1234567890" }] },
  "2": { company: "Globex Inc", phones: [{ label: "Main", number: "+1987654321" }] },
  "3": { company: "Initech Ltd", phones: [{ label: "HQ", number: "+1122334455" }] },
  "4": { company: "Hooli Technologies", phones: [{ label: "Sales", number: "+1555000111" }] },
  "5": { company: "Pied Piper", phones: [{ label: "Richard", number: "+1555000222" }, { label: "Jared", number: "+1555000333" }] },
  "14": { company: "Wayne Enterprises", phones: [{ label: "Bruce", number: "+1555000444" }] },
  "27": { company: "Dunder Mifflin", phones: [{ label: "Michael", number: "+1555000555" }, { label: "Dwight", number: "+1555000666" }] },
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

  const [notes, setNotes] = useState(existing?.notes || "");
  const [selectedOutcome, setSelectedOutcome] = useState(existing?.outcome || (currentOutcome && currentOutcome !== "Leads to Call" ? currentOutcome : ""));
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const initialNotes = existing?.notes || "";
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

  const handleSave = () => {
    if (!selectedOutcome) {
      performNavigateBack();
      return;
    }
    try {
      const all = readAll();
      const filtered = all.filter((o) => !(o.leadId === leadId && o.product === product));
      filtered.push({
        leadId,
        company: companyName,
        outcome: selectedOutcome,
        notes,
        product,
        savedAt: Date.now(),
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
    performNavigateBack();
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

      {/* Outcome Dropdown */}
      <div className="mb-8">
        <label className="text-sm font-bold text-foreground mb-2 block">Outcome</label>
        <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder="Select outcome..." />
          </SelectTrigger>
          <SelectContent className="max-h-[60vh]">
            {outcomeGroups.map((group, idx) => (
              <div key={group.label}>
                {idx > 0 && <SelectSeparator />}
                <SelectGroup>
                  <SelectLabel className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </SelectLabel>
                  {group.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </div>
            ))}
          </SelectContent>
        </Select>
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
    </div>
  );
};

export default LeadDetailPage;
