import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Save } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const PRODUCTS = ["HRMS", "Job Portal", "GMS", "POS (F&B)", "GSMS", "POS(Phone)", "HMS"] as const;

interface Feature {
  id: string;
  product: string;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
}

interface FeatureDetail {
  id: string;
  feature_id: string;
  overview: string;
  use_cases: { industry: string; icon: string; description: string }[];
}

interface Guide {
  id: string;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
}

interface Dialogue {
  question: string;
  answer: string;
}

interface TrainingCard {
  id: string;
  product: string;
  role: string;
  title: string;
  dialogues: Dialogue[];
  sort_order: number;
  image_url: string;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // === TOP LEVEL ===
  const [activeProduct, setActiveProduct] = useState<string>("HRMS");
  const [activeSubTab, setActiveSubTab] = useState("features");

  // === FEATURES STATE ===
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [featureDetails, setFeatureDetails] = useState<Record<string, FeatureDetail>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editOverview, setEditOverview] = useState("");
  const [editUseCases, setEditUseCases] = useState<{ industry: string; icon: string; description: string }[]>([]);

  // === SALES TRAINING STATE ===
  const [trainingCards, setTrainingCards] = useState<TrainingCard[]>([]);
  const [loadingTraining, setLoadingTraining] = useState(true);
  const [showAddTraining, setShowAddTraining] = useState(false);
  const [newTrainingRole, setNewTrainingRole] = useState("");
  const [newTrainingTitle, setNewTrainingTitle] = useState("");
  const [newTrainingDialogues, setNewTrainingDialogues] = useState<Dialogue[]>([{ question: "", answer: "" }]);
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [editTrainingRole, setEditTrainingRole] = useState("");
  const [editTrainingTitle, setEditTrainingTitle] = useState("");
  const [editTrainingDialogues, setEditTrainingDialogues] = useState<Dialogue[]>([]);
  const [newTrainingImageFile, setNewTrainingImageFile] = useState<File | null>(null);
  const [editTrainingImageFile, setEditTrainingImageFile] = useState<File | null>(null);

  // === GUIDES STATE ===
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(true);
  const [showAddGuide, setShowAddGuide] = useState(false);
  const [newGuideTitle, setNewGuideTitle] = useState("");
  const [newGuideDescription, setNewGuideDescription] = useState("");
  const [newGuideImageFile, setNewGuideImageFile] = useState<File | null>(null);
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  const [editGuideTitle, setEditGuideTitle] = useState("");
  const [editGuideDescription, setEditGuideDescription] = useState("");
  const [editGuideImageFile, setEditGuideImageFile] = useState<File | null>(null);

  // === FEATURES LOGIC ===
  const fetchFeatures = async () => {
    setLoadingFeatures(true);
    const { data, error } = await supabase
      .from("features")
      .select("*")
      .eq("product", activeProduct)
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ title: "Error loading features", description: error.message, variant: "destructive" });
    } else {
      setFeatures(data || []);
    }
    setLoadingFeatures(false);
  };

  useEffect(() => {
    fetchFeatures();
    fetchTrainingCards();
    setExpandedFeature(null);
    setShowAddForm(false);
    setEditingId(null);
    setShowAddTraining(false);
    setEditingTrainingId(null);
  }, [activeProduct]);

  const uploadImage = async (file: File, folder: string = activeProduct): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("feature-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("feature-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAdd = async () => {
    try {
      let imageUrl = "";
      if (newImageFile) imageUrl = await uploadImage(newImageFile);
      const { error } = await supabase.from("features").insert({
        product: activeProduct,
        title: newTitle,
        description: newDescription,
        image_url: imageUrl,
        sort_order: features.length,
      });
      if (error) throw error;
      toast({ title: "Feature added!" });
      setNewTitle(""); setNewDescription(""); setNewImageFile(null); setShowAddForm(false);
      fetchFeatures();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      let imageUrl: string | undefined;
      if (editImageFile) imageUrl = await uploadImage(editImageFile);
      const updateData: any = { title: editTitle, description: editDescription };
      if (imageUrl) updateData.image_url = imageUrl;
      const { error } = await supabase.from("features").update(updateData).eq("id", id);
      if (error) throw error;
      toast({ title: "Feature updated!" });
      setEditingId(null); setEditImageFile(null);
      fetchFeatures();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feature?")) return;
    const { error } = await supabase.from("features").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Feature deleted" });
      fetchFeatures();
    }
  };

  const fetchDetail = async (featureId: string) => {
    const { data } = await supabase.from("feature_details").select("*").eq("feature_id", featureId).maybeSingle();
    if (data) {
      const detail: FeatureDetail = {
        id: data.id, feature_id: data.feature_id, overview: data.overview,
        use_cases: (data.use_cases as unknown as { industry: string; icon: string; description: string }[]) || [],
      };
      setFeatureDetails((prev) => ({ ...prev, [featureId]: detail }));
      setEditOverview(detail.overview);
      setEditUseCases(detail.use_cases);
    } else {
      setEditOverview(""); setEditUseCases([]);
    }
  };

  const toggleExpand = (featureId: string) => {
    if (expandedFeature === featureId) { setExpandedFeature(null); } else { setExpandedFeature(featureId); fetchDetail(featureId); }
  };

  const handleSaveDetail = async (featureId: string) => {
    try {
      const existing = featureDetails[featureId];
      if (existing) {
        const { error } = await supabase.from("feature_details").update({ overview: editOverview, use_cases: editUseCases }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("feature_details").insert({ feature_id: featureId, overview: editOverview, use_cases: editUseCases });
        if (error) throw error;
      }
      toast({ title: "Details saved!" });
      fetchDetail(featureId);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const addUseCase = () => setEditUseCases([...editUseCases, { industry: "", icon: "factory", description: "" }]);
  const updateUseCase = (index: number, field: string, value: string) => {
    const updated = [...editUseCases]; updated[index] = { ...updated[index], [field]: value }; setEditUseCases(updated);
  };
  const removeUseCase = (index: number) => setEditUseCases(editUseCases.filter((_, i) => i !== index));

  // === SALES TRAINING LOGIC ===
  const fetchTrainingCards = async () => {
    setLoadingTraining(true);
    const { data, error } = await supabase
      .from("sales_training_cards")
      .select("*")
      .eq("product", activeProduct)
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ title: "Error loading training cards", description: error.message, variant: "destructive" });
    } else {
      setTrainingCards(
        (data || []).map((d) => ({
          id: d.id,
          product: d.product,
          role: d.role,
          title: d.title,
          dialogues: (d.dialogues as unknown as Dialogue[]) || [],
          sort_order: d.sort_order,
          image_url: (d as any).image_url || "",
        }))
      );
    }
    setLoadingTraining(false);
  };

  const handleAddTraining = async () => {
    try {
      let imageUrl = "";
      if (newTrainingImageFile) imageUrl = await uploadImage(newTrainingImageFile, `training/${activeProduct}`);
      const filteredDialogues = newTrainingDialogues.filter((d) => d.question.trim() || d.answer.trim());
      const { error } = await supabase.from("sales_training_cards").insert([{
        product: activeProduct,
        role: newTrainingRole,
        title: newTrainingTitle,
        dialogues: filteredDialogues as unknown as any,
        sort_order: trainingCards.length,
        image_url: imageUrl,
      } as any]);
      if (error) throw error;
      toast({ title: "Training card added!" });
      setNewTrainingRole(""); setNewTrainingTitle(""); setNewTrainingDialogues([{ question: "", answer: "" }]); setNewTrainingImageFile(null); setShowAddTraining(false);
      fetchTrainingCards();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateTraining = async (id: string) => {
    try {
      let imageUrl: string | undefined;
      if (editTrainingImageFile) imageUrl = await uploadImage(editTrainingImageFile, `training/${activeProduct}`);
      const filteredDialogues = editTrainingDialogues.filter((d) => d.question.trim() || d.answer.trim());
      const updateData: any = {
        role: editTrainingRole,
        title: editTrainingTitle,
        dialogues: filteredDialogues,
      };
      if (imageUrl) updateData.image_url = imageUrl;
      const { error } = await supabase.from("sales_training_cards").update(updateData).eq("id", id);
      if (error) throw error;
      toast({ title: "Training card updated!" });
      setEditingTrainingId(null); setEditTrainingImageFile(null);
      fetchTrainingCards();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteTraining = async (id: string) => {
    if (!confirm("Delete this training card?")) return;
    const { error } = await supabase.from("sales_training_cards").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Training card deleted" });
      fetchTrainingCards();
    }
  };

  // === GUIDES LOGIC ===
  const fetchGuides = async () => {
    setLoadingGuides(true);
    const { data, error } = await supabase.from("guides").select("*").order("sort_order", { ascending: true });
    if (error) {
      toast({ title: "Error loading guides", description: error.message, variant: "destructive" });
    } else {
      setGuides(data || []);
    }
    setLoadingGuides(false);
  };

  useEffect(() => { fetchGuides(); }, []);

  const handleAddGuide = async () => {
    try {
      let imageUrl = "";
      if (newGuideImageFile) imageUrl = await uploadImage(newGuideImageFile, "guides");
      const { error } = await supabase.from("guides").insert({
        title: newGuideTitle,
        description: newGuideDescription,
        image_url: imageUrl,
        sort_order: guides.length,
      });
      if (error) throw error;
      toast({ title: "Guide added!" });
      setNewGuideTitle(""); setNewGuideDescription(""); setNewGuideImageFile(null); setShowAddGuide(false);
      fetchGuides();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateGuide = async (id: string) => {
    try {
      let imageUrl: string | undefined;
      if (editGuideImageFile) imageUrl = await uploadImage(editGuideImageFile, "guides");
      const updateData: any = { title: editGuideTitle, description: editGuideDescription };
      if (imageUrl) updateData.image_url = imageUrl;
      const { error } = await supabase.from("guides").update(updateData).eq("id", id);
      if (error) throw error;
      toast({ title: "Guide updated!" });
      setEditingGuideId(null); setEditGuideImageFile(null);
      fetchGuides();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteGuide = async (id: string) => {
    if (!confirm("Delete this guide?")) return;
    const { error } = await supabase.from("guides").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Guide deleted" });
      fetchGuides();
    }
  };

  // === DIALOGUE HELPERS ===
  const renderDialogueEditor = (dialogues: Dialogue[], setDialogues: (d: Dialogue[]) => void) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Dialogues (Q&A)</Label>
        <Button onClick={() => setDialogues([...dialogues, { question: "", answer: "" }])} size="sm" variant="outline">
          <Plus size={14} className="mr-1" /> Add Q&A
        </Button>
      </div>
      {dialogues.map((d, i) => (
        <div key={i} className="bg-muted/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Q&A #{i + 1}</span>
            <button onClick={() => setDialogues(dialogues.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80">
              <Trash2 size={14} />
            </button>
          </div>
          <Textarea
            value={d.question}
            onChange={(e) => { const updated = [...dialogues]; updated[i] = { ...updated[i], question: e.target.value }; setDialogues(updated); }}
            placeholder="Question (e.g. Customer asks...)"
            rows={2}
          />
          <Textarea
            value={d.answer}
            onChange={(e) => { const updated = [...dialogues]; updated[i] = { ...updated[i], answer: e.target.value }; setDialogues(updated); }}
            placeholder="Answer (e.g. Sales rep responds...)"
            rows={2}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="px-4 pt-6 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="text-xl font-extrabold text-foreground">Admin Panel</h1>
      </div>

      {/* Product Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {PRODUCTS.map((p) => (
          <button
            key={p}
            onClick={() => setActiveProduct(p)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
              activeProduct === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Sub-tabs per product */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
          <TabsTrigger value="sales-calls" className="flex-1">Sales Calls</TabsTrigger>
          <TabsTrigger value="guides" className="flex-1">Guides</TabsTrigger>
        </TabsList>

        {/* ========== FEATURES TAB ========== */}
        <TabsContent value="features">
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} className="mb-4 w-full" variant="outline">
              <Plus size={16} className="mr-2" /> Add Feature
            </Button>
          )}

          {showAddForm && (
            <div className="bg-card border border-border rounded-2xl p-4 mb-4 space-y-3">
              <h3 className="font-bold text-sm text-foreground">New Feature for {activeProduct}</h3>
              <div className="space-y-2"><Label>Title</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Feature title" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Short description" /></div>
              <div className="space-y-2"><Label>Screenshot Image</Label><Input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files?.[0] || null)} /></div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={!newTitle.trim()} size="sm">Add</Button>
                <Button onClick={() => setShowAddForm(false)} variant="ghost" size="sm">Cancel</Button>
              </div>
            </div>
          )}

          {loadingFeatures ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : features.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No features yet for {activeProduct}. Add one above!</p>
          ) : (
            <div className="space-y-3">
              {features.map((feature) => (
                <div key={feature.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="p-4">
                    {editingId === feature.id ? (
                      <div className="space-y-3">
                        <div className="space-y-2"><Label>Title</Label><Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Description</Label><Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Replace Image</Label><Input type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files?.[0] || null)} /></div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdate(feature.id)} size="sm"><Save size={14} className="mr-1" /> Save</Button>
                          <Button onClick={() => setEditingId(null)} variant="ghost" size="sm">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-foreground">{feature.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                          {feature.image_url && <img src={feature.image_url} alt={feature.title} className="mt-2 rounded-lg w-full max-h-32 object-cover" />}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => { setEditingId(feature.id); setEditTitle(feature.title); setEditDescription(feature.description); }} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"><Pencil size={14} className="text-foreground" /></button>
                          <button onClick={() => handleDelete(feature.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20"><Trash2 size={14} className="text-destructive" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => toggleExpand(feature.id)} className="w-full px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors">
                    <span>Feature Details (Overview & Use Cases)</span>
                    {expandedFeature === feature.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedFeature === feature.id && (
                    <div className="p-4 border-t border-border space-y-4">
                      <div className="space-y-2"><Label>Overview</Label><Textarea value={editOverview} onChange={(e) => setEditOverview(e.target.value)} placeholder="Detailed overview of this feature..." rows={4} /></div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between"><Label>Use Cases</Label><Button onClick={addUseCase} size="sm" variant="outline"><Plus size={14} className="mr-1" /> Add Use Case</Button></div>
                        {editUseCases.map((uc, i) => (
                          <div key={i} className="bg-muted/30 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between"><span className="text-xs font-bold text-muted-foreground">Use Case #{i + 1}</span><button onClick={() => removeUseCase(i)} className="text-destructive hover:text-destructive/80"><Trash2 size={14} /></button></div>
                            <Input value={uc.industry} onChange={(e) => updateUseCase(i, "industry", e.target.value)} placeholder="Industry (e.g. Garment Factory)" />
                            <Input value={uc.icon} onChange={(e) => updateUseCase(i, "icon", e.target.value)} placeholder="Icon keyword (e.g. factory, shirt, shield, building)" />
                            <Textarea value={uc.description} onChange={(e) => updateUseCase(i, "description", e.target.value)} placeholder="Description of how this feature is used..." rows={2} />
                          </div>
                        ))}
                      </div>
                      <Button onClick={() => handleSaveDetail(feature.id)} className="w-full"><Save size={14} className="mr-2" /> Save Details</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ========== SALES CALLS TAB ========== */}
        <TabsContent value="sales-calls">
          {!showAddTraining && (
            <Button onClick={() => setShowAddTraining(true)} className="mb-4 w-full" variant="outline">
              <Plus size={16} className="mr-2" /> Add Training Card
            </Button>
          )}

          {showAddTraining && (
            <div className="bg-card border border-border rounded-2xl p-4 mb-4 space-y-3">
              <h3 className="font-bold text-sm text-foreground">New Training Card for {activeProduct}</h3>
              <div className="space-y-2"><Label>Role</Label><Input value={newTrainingRole} onChange={(e) => setNewTrainingRole(e.target.value)} placeholder="e.g. Sales Rep, Customer, Manager" /></div>
              <div className="space-y-2"><Label>Title</Label><Input value={newTrainingTitle} onChange={(e) => setNewTrainingTitle(e.target.value)} placeholder="Scenario title" /></div>
              <div className="space-y-2"><Label>Image</Label><Input type="file" accept="image/*" onChange={(e) => setNewTrainingImageFile(e.target.files?.[0] || null)} /></div>
              {renderDialogueEditor(newTrainingDialogues, setNewTrainingDialogues)}
              <div className="flex gap-2">
                <Button onClick={handleAddTraining} disabled={!newTrainingTitle.trim() || !newTrainingRole.trim()} size="sm">Add</Button>
                <Button onClick={() => { setShowAddTraining(false); setNewTrainingImageFile(null); }} variant="ghost" size="sm">Cancel</Button>
              </div>
            </div>
          )}

          {loadingTraining ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : trainingCards.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No training cards yet for {activeProduct}. Add one above!</p>
          ) : (
            <div className="space-y-3">
              {trainingCards.map((card) => (
                <div key={card.id} className="bg-card border border-border rounded-2xl p-4">
                  {editingTrainingId === card.id ? (
                    <div className="space-y-3">
                      <div className="space-y-2"><Label>Role</Label><Input value={editTrainingRole} onChange={(e) => setEditTrainingRole(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Title</Label><Input value={editTrainingTitle} onChange={(e) => setEditTrainingTitle(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Replace Image</Label><Input type="file" accept="image/*" onChange={(e) => setEditTrainingImageFile(e.target.files?.[0] || null)} /></div>
                      {renderDialogueEditor(editTrainingDialogues, setEditTrainingDialogues)}
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdateTraining(card.id)} size="sm"><Save size={14} className="mr-1" /> Save</Button>
                        <Button onClick={() => { setEditingTrainingId(null); setEditTrainingImageFile(null); }} variant="ghost" size="sm">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{card.role}</span>
                        <h3 className="font-bold text-sm text-foreground mt-1">{card.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{card.dialogues.length} dialogue{card.dialogues.length !== 1 ? "s" : ""}</p>
                        {card.image_url && <img src={card.image_url} alt={card.title} className="mt-2 rounded-lg w-full max-h-32 object-cover" />}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => { setEditingTrainingId(card.id); setEditTrainingRole(card.role); setEditTrainingTitle(card.title); setEditTrainingDialogues(card.dialogues); setEditTrainingImageFile(null); }} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"><Pencil size={14} className="text-foreground" /></button>
                        <button onClick={() => handleDeleteTraining(card.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20"><Trash2 size={14} className="text-destructive" /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ========== GUIDES TAB ========== */}
        <TabsContent value="guides">
          <p className="text-xs text-muted-foreground mb-4">Guides are shared across all products.</p>

          {!showAddGuide && (
            <Button onClick={() => setShowAddGuide(true)} className="mb-4 w-full" variant="outline">
              <Plus size={16} className="mr-2" /> Add Guide
            </Button>
          )}

          {showAddGuide && (
            <div className="bg-card border border-border rounded-2xl p-4 mb-4 space-y-3">
              <h3 className="font-bold text-sm text-foreground">New Guide</h3>
              <div className="space-y-2"><Label>Title</Label><Input value={newGuideTitle} onChange={(e) => setNewGuideTitle(e.target.value)} placeholder="Guide title" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={newGuideDescription} onChange={(e) => setNewGuideDescription(e.target.value)} placeholder="Short description" /></div>
              <div className="space-y-2"><Label>Image</Label><Input type="file" accept="image/*" onChange={(e) => setNewGuideImageFile(e.target.files?.[0] || null)} /></div>
              <div className="flex gap-2">
                <Button onClick={handleAddGuide} disabled={!newGuideTitle.trim()} size="sm">Add</Button>
                <Button onClick={() => setShowAddGuide(false)} variant="ghost" size="sm">Cancel</Button>
              </div>
            </div>
          )}

          {loadingGuides ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : guides.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No guides yet. Add one above!</p>
          ) : (
            <div className="space-y-3">
              {guides.map((guide) => (
                <div key={guide.id} className="bg-card border border-border rounded-2xl p-4">
                  {editingGuideId === guide.id ? (
                    <div className="space-y-3">
                      <div className="space-y-2"><Label>Title</Label><Input value={editGuideTitle} onChange={(e) => setEditGuideTitle(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Description</Label><Textarea value={editGuideDescription} onChange={(e) => setEditGuideDescription(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Replace Image</Label><Input type="file" accept="image/*" onChange={(e) => setEditGuideImageFile(e.target.files?.[0] || null)} /></div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdateGuide(guide.id)} size="sm"><Save size={14} className="mr-1" /> Save</Button>
                        <Button onClick={() => setEditingGuideId(null)} variant="ghost" size="sm">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground">{guide.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{guide.description}</p>
                        {guide.image_url && <img src={guide.image_url} alt={guide.title} className="mt-2 rounded-lg w-full max-h-32 object-cover" />}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => { setEditingGuideId(guide.id); setEditGuideTitle(guide.title); setEditGuideDescription(guide.description); }} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"><Pencil size={14} className="text-foreground" /></button>
                        <button onClick={() => handleDeleteGuide(guide.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20"><Trash2 size={14} className="text-destructive" /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
