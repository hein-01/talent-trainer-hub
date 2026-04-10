import { Trophy, Flame, BookOpen, Star } from "lucide-react";

const stats = [
  { label: "Lessons Done", value: "12", icon: <BookOpen size={18} />, color: "bg-primary/10 text-primary" },
  { label: "Day Streak", value: "5", icon: <Flame size={18} />, color: "bg-secondary/20 text-secondary" },
  { label: "Badges", value: "3", icon: <Trophy size={18} />, color: "bg-accent/15 text-accent" },
  { label: "Avg Score", value: "82%", icon: <Star size={18} />, color: "bg-success/10 text-success" },
];

const ProfilePage = () => {
  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <span className="text-3xl font-extrabold text-primary">SR</span>
        </div>
        <h1 className="text-xl font-extrabold text-foreground">Sales Rep</h1>
        <p className="text-sm text-muted-foreground">Junior Sales Associate</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl p-4 border border-border flex flex-col items-center gap-2"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <span className="text-xl font-extrabold text-foreground">{stat.value}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border">
        <h2 className="font-bold text-sm text-foreground mb-3">Recent Badges</h2>
        <div className="flex gap-3">
          {["🚀", "📚", "⭐"].map((emoji, i) => (
            <div
              key={i}
              className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl"
            >
              {emoji}
            </div>
          ))}
          <div className="w-14 h-14 rounded-2xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs font-bold">
            ?
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
