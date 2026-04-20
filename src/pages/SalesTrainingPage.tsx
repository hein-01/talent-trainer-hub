import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MessageSquare, User, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Dialogue {
  question: string;
  answer: string;
}

interface TrainingCard {
  id: string;
  role: string;
  title: string;
  dialogues: Dialogue[];
  image_url: string | null;
}

const roleIcons: Record<string, React.ReactNode> = {
  "Sales Rep": <User size={18} />,
  Customer: <Users size={18} />,
  Manager: <Users size={18} />,
};

const roleColors: Record<string, string> = {
  "Sales Rep": "bg-primary/10 text-primary",
  Customer: "bg-accent/20 text-accent-foreground",
  Manager: "bg-secondary text-secondary-foreground",
};

const SalesTrainingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const product = searchParams.get("product") || "HRMS";
  const [cards, setCards] = useState<TrainingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("sales_training_cards")
        .select("*")
        .eq("product", product)
        .order("sort_order", { ascending: true });

      if (data) {
        setCards(
          data.map((d) => ({
            id: d.id,
            role: d.role,
            title: d.title,
            dialogues: (d.dialogues as unknown as Dialogue[]) || [],
            image_url: (d as any).image_url || null,
          }))
        );
      }
      setLoading(false);
    };
    fetch();
  }, [product]);

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Sales Calls Training</h1>
          <p className="text-xs text-muted-foreground">{product} • {cards.length} scenarios</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading training cards...</p>
      ) : cards.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare size={48} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground font-medium">No training cards yet</p>
          <p className="text-xs text-muted-foreground mt-1">Training scenarios will appear here once added.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card, i) => {
            const isExpanded = expandedCard === card.id;
            const colorClass = roleColors[card.role] || "bg-muted text-muted-foreground";
            const icon = roleIcons[card.role] || <User size={18} />;

            return (
              <div
                key={card.id}
                className="bg-card border border-border rounded-2xl overflow-hidden transition-all hover:shadow-md"
              >
                {card.image_url && (
                  <img
                    src={card.image_url}
                    alt={card.title}
                    className="w-full h-36 object-cover"
                  />
                )}
                <button
                  onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                  className="w-full p-4 flex items-start gap-3 text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {card.role}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground mt-1">{card.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {card.dialogues.length} dialogue{card.dialogues.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className={`w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 self-center transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" className="text-foreground">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    {card.dialogues.map((d, di) => (
                      <div key={di} className="space-y-2">
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[9px] font-bold text-primary">Q</span>
                          </div>
                          <p className="text-sm text-foreground font-medium leading-relaxed">{d.question}</p>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[9px] font-bold text-accent-foreground">A</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{d.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SalesTrainingPage;
