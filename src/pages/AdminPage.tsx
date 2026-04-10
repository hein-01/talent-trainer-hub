import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, Image, ChevronDown, ChevronUp, Save } from "lucide-react";

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

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeProduct, setActiveProduct] = useState<string>("HRMS");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [featureDetails, setFeatureDetails] = useState<Record<string, FeatureDetail>>({});

  // New feature form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  // Edit feature form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  // Detail form
  const [editOverview, setEditOverview] = useState("");
  const [editUseCases, setEditUseCases] = useState<{ industry: string; icon: string; description: string }[]>([]);

  const fetchFeatures = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  useEffect(() => {
    fetchFeatures();
    setExpandedFeature(null);
    setShowAddForm(false);
    setEditingId(null);
  }, [activeProduct]);

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${activeProduct}/${Date.now()}.${ext}`;
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
      setNewTitle("");
      setNewDescription("");
      setNewImageFile(null);
      setShowAddForm(false);
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
      setEditingId(null);
      setEditImageFile(null);
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
    const { data } = await supabase
      .from("feature_details")
      .select("*")
      .eq("feature_id", featureId)
      .single();
    if (data) {
      const detail: FeatureDetail = {
        id: data.id,
        feature_id: data.feature_id,
        overview: data.overview,
        use_cases: (data.use_cases as unknown as { industry: string; icon: string; description: string }[]) || [],
      };
      setFeatureDetails((prev) => ({ ...prev, [featureId]: detail }));
      setEditOverview(detail.overview);
      setEditUseCases(detail.use_cases);
    } else {
      setEditOverview("");
      setEditUseCases([]);
    }
  };

  const toggleExpand = (featureId: string) => {
    if (expandedFeature === featureId) {
      setExpandedFeature(null);
    } else {
      setExpandedFeature(featureId);
      fetchDetail(featureId);
    }
  };

  const handleSaveDetail = async (featureId: string) => {
    try {
      const existing = featureDetails[featureId];
      if (existing) {
        const { error } = await supabase
          .from("feature_details")
          .update({ overview: editOverview, use_cases: editUseCases })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("feature_details")
          .insert({ feature_id: featureId, overview: editOverview, use_cases: editUseCases });
        if (error) throw error;
      }
      toast({ title: "Details saved!" });
      fetchDetail(featureId);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const addUseCase = () => {
    setEditUseCases([...editUseCases, { industry: "", icon: "factory", description: "" }]);
  };

  const updateUseCase = (index: number, field: string, value: string) => {
    const updated = [...editUseCases];
    updated[index] = { ...updated[index], [field]: value };
    setEditUseCases(updated);
  };

  const removeUseCase = (index: number) => {
    setEditUseCases(editUseCases.filter((_, i) => i !== index));
  };

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
        <h1 className="text-xl font-extrabold text-foreground">Admin — Manage Features</h1>
      </div>

      {/* Product Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {PRODUCTS.map((p) => (
          <button
            key={p}
            onClick={() => setActiveProduct(p)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
              activeProduct === p
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Add Feature Button */}
      {!showAddForm && (
        <Button onClick={() => setShowAddForm(true)} className="mb-4 w-full" variant="outline">
          <Plus size={16} className="mr-2" /> Add Feature
        </Button>
      )}

      {/* Add Feature Form */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-4 space-y-3">
          <h3 className="font-bold text-sm text-foreground">New Feature for {activeProduct}</h3>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Feature title" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Short description" />
          </div>
          <div className="space-y-2">
            <Label>Screenshot Image</Label>
            <Input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={!newTitle.trim()} size="sm">Add</Button>
            <Button onClick={() => setShowAddForm(false)} variant="ghost" size="sm">Cancel</Button>
          </div>
        </div>
      )}

      {/* Feature List */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : features.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No features yet. Add one above!</p>
      ) : (
        <div className="space-y-3">
          {features.map((feature) => (
            <div key={feature.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Feature Header */}
              <div className="p-4">
                {editingId === feature.id ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Replace Image</Label>
                      <Input type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files?.[0] || null)} />
                    </div>
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
                      {feature.image_url && (
                        <img src={feature.image_url} alt={feature.title} className="mt-2 rounded-lg w-full max-h-32 object-cover" />
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(feature.id);
                          setEditTitle(feature.title);
                          setEditDescription(feature.description);
                        }}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
                      >
                        <Pencil size={14} className="text-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(feature.id)}
                        className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20"
                      >
                        <Trash2 size={14} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Expand Details */}
              <button
                onClick={() => toggleExpand(feature.id)}
                className="w-full px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <span>Feature Details (Overview & Use Cases)</span>
                {expandedFeature === feature.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {/* Detail Form */}
              {expandedFeature === feature.id && (
                <div className="p-4 border-t border-border space-y-4">
                  <div className="space-y-2">
                    <Label>Overview</Label>
                    <Textarea
                      value={editOverview}
                      onChange={(e) => setEditOverview(e.target.value)}
                      placeholder="Detailed overview of this feature..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Use Cases</Label>
                      <Button onClick={addUseCase} size="sm" variant="outline">
                        <Plus size={14} className="mr-1" /> Add Use Case
                      </Button>
                    </div>
                    {editUseCases.map((uc, i) => (
                      <div key={i} className="bg-muted/30 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-muted-foreground">Use Case #{i + 1}</span>
                          <button onClick={() => removeUseCase(i)} className="text-destructive hover:text-destructive/80">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <Input
                          value={uc.industry}
                          onChange={(e) => updateUseCase(i, "industry", e.target.value)}
                          placeholder="Industry (e.g. Garment Factory)"
                        />
                        <select
                          value={uc.icon}
                          onChange={(e) => updateUseCase(i, "icon", e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="shirt">Garment (shirt)</option>
                          <option value="factory">Manufacturing (factory)</option>
                          <option value="shield">Insurance (shield)</option>
                          <option value="building">General (building)</option>
                        </select>
                        <Textarea
                          value={uc.description}
                          onChange={(e) => updateUseCase(i, "description", e.target.value)}
                          placeholder="Description of how this feature is used..."
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>

                  <Button onClick={() => handleSaveDetail(feature.id)} className="w-full">
                    <Save size={14} className="mr-2" /> Save Details
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
