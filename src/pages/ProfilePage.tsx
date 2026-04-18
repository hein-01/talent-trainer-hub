import { Trophy, BookOpen, LogOut, TrendingUp, Wallet, PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const stats = [
  { label: "Quiz Done", value: "12", icon: <BookOpen size={18} />, color: "bg-primary/10 text-primary" },
  { label: "Badges", value: "3", icon: <Trophy size={18} />, color: "bg-accent/15 text-accent" },
];

const badges = [
  { emoji: "🚀", label: "HRMS" },
  { emoji: "📚", label: "Job Portal" },
  { emoji: "⭐", label: "GMS" },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { displayName, user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out");
    navigate("/login");
  };

  const name = displayName || user?.email || "User";

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-xl font-extrabold text-foreground">{name}</h1>
        <p className="text-sm text-muted-foreground">Tech Solution & Customer Success</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
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

      <div className="flex flex-col gap-3 mb-6">
        <div className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Upcoming Commission This Month
            </span>
            <span className="text-lg font-extrabold text-foreground">$1,250</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Wallet size={20} />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Commission Payout Last Month
            </span>
            <span className="text-lg font-extrabold text-foreground">$980</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
            <PiggyBank size={20} />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Commission Payout All Time
            </span>
            <span className="text-lg font-extrabold text-foreground">$14,320</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border mb-4">
        <h2 className="font-bold text-sm text-foreground mb-3">All Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-muted"
            >
              <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-2xl">
                {badge.emoji}
              </div>
              <span className="text-[11px] font-bold text-foreground text-center">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full rounded-2xl h-12 text-base font-bold"
      >
        <LogOut size={18} />
        Logout
      </Button>
    </div>
  );
};

export default ProfilePage;
