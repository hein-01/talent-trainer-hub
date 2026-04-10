import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const mockLeadDetails: Record<string, { company: string; phones: { label: string; number: string }[] }> = {
  "1": { company: "Acme Corp", phones: [{ label: "Office", number: "+1234567890" }] },
  "2": { company: "Globex Inc", phones: [{ label: "Main", number: "+1987654321" }] },
  "3": { company: "Initech Ltd", phones: [{ label: "HQ", number: "+1122334455" }] },
  "4": { company: "Hooli Technologies", phones: [{ label: "Sales", number: "+1555000111" }] },
  "5": { company: "Pied Piper", phones: [{ label: "Richard", number: "+1555000222" }, { label: "Jared", number: "+1555000333" }] },
  "14": { company: "Wayne Enterprises", phones: [{ label: "Bruce", number: "+1555000444" }] },
  "27": { company: "Dunder Mifflin", phones: [{ label: "Michael", number: "+1555000555" }, { label: "Dwight", number: "+1555000666" }] },
};

const outcomeOptions = [
  "Meeting",
  "Trial",
  "Maybe Later",
  "Not interested",
  "Didn't answer/Call back later",
  "Follow up",
  "Redirect to different person",
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

  const [notes, setNotes] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState(currentOutcome || "");

  const goBack = () => {
    if (currentOutcome === "Leads to Call") {
      navigate(`/leads-to-call?product=${product}`);
    } else {
      navigate(`/outcome-leads?product=${product}&outcome=${encodeURIComponent(currentOutcome)}`);
    }
  };

  const handleSave = () => {
    // TODO: Save to database
    goBack();
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={goBack}
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
          <SelectContent>
            {outcomeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full rounded-2xl h-12 text-base font-bold">
        Save
      </Button>
    </div>
  );
};

export default LeadDetailPage;
