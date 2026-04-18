import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, X, ZoomIn } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

import guideSalesBasics from "@/assets/guides/guide-sales-basics.jpg";
import guideObjectionHandling from "@/assets/guides/guide-objection-handling.jpg";
import guideClosingDeals from "@/assets/guides/guide-closing-deals.jpg";
import guideProductDemo from "@/assets/guides/guide-product-demo.jpg";
import guideFollowUp from "@/assets/guides/guide-follow-up.jpg";

const fallbackGuides = [
  { title: "Sales Call Basics", description: "Learn the fundamentals of making effective sales calls, from opening lines to building rapport with potential clients.", image: guideSalesBasics },
  { title: "Handling Objections", description: "Master techniques for addressing common customer objections and turning hesitation into confidence.", image: guideObjectionHandling },
  { title: "Closing the Deal", description: "Proven strategies to confidently close sales, negotiate terms, and secure commitments from prospects.", image: guideClosingDeals },
  { title: "Product Demo Tips", description: "How to deliver compelling product demonstrations that highlight key features and resonate with client needs.", image: guideProductDemo },
  { title: "Follow-Up Strategies", description: "Best practices for following up with leads after initial contact to maintain engagement and move deals forward.", image: guideFollowUp },
];

const GuidesPage = () => {
  const navigate = useNavigate();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [guides, setGuides] = useState<{ title: string; description: string; image: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      const { data } = await supabase.from("guides").select("*").order("sort_order", { ascending: true });
      if (data && data.length > 0) {
        setGuides(data.map((g) => ({ title: g.title, description: g.description, image: g.image_url || "" })));
      } else {
        setGuides(fallbackGuides);
      }
      setLoading(false);
    };
    fetchGuides();
  }, []);

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
        <p className="text-muted-foreground text-sm">Loading guides...</p>
      </div>
    );
  }

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
          <h1 className="text-xl font-extrabold text-foreground">Sales Guides</h1>
          <p className="text-xs text-muted-foreground">{guides.length} guides available</p>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="space-y-3">
        {guides.map(({ title, description, image }, i) => (
          <div
            key={title}
            className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-bold">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">{title}</h3>
                  <CheckCircle2 size={14} className="text-muted-foreground/30 shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
              </div>
            </div>
            {image && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxImage(image); }}
                className="relative mt-3 w-full rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-colors cursor-zoom-in group"
              >
                <img src={image} alt={`${title} illustration`} loading="lazy" width={800} height={512} className="w-full h-auto object-cover" />
                <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={14} className="text-foreground" />
                </div>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
          <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <X size={20} className="text-foreground" />
          </button>
          <img src={lightboxImage} alt="Guide illustration" className="relative z-10 max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default GuidesPage;
