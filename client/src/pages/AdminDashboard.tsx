import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  ArrowDownToLine,
  Menu,
  X,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import ZenvestLogo from "@/components/ZenvestLogo";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ─── Mock Data & Types ─────────────────────────── */
type InvStatus = "pending" | "approved" | "rejected";

interface PendingInv {
  _id: string;
  user: string;
  email: string;
  amount: number;
  startDate: string;
  ref: string;
  status: InvStatus;
  type: string;
  totalInterest?: number;
}

// Removing mock initialPending

const usersData: any[] = []; // Removed static

type WithdrawStatus = "pending" | "approved" | "rejected";
interface WithdrawReq {
  id: string;
  user: string;
  amount: string;
  date: string;
  status: WithdrawStatus;
  upi?: string;
}

const initialWithdrawals: WithdrawReq[] = []; // Removed static

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-accent text-accent-foreground border-accent-foreground/10",
  rejected: "bg-red-50 text-red-600 border-red-200",
  Active: "bg-accent text-accent-foreground border-accent-foreground/10",
  New: "bg-blue-50 text-blue-600 border-blue-200",
};

type AdminTab = "overview" | "pending" | "users" | "withdrawals";

const navItems: { label: string; tab: AdminTab; icon: React.ElementType; badge?: number }[] = [
  { label: "Overview", tab: "overview", icon: LayoutDashboard },
  { label: "Pending Investments", tab: "pending", icon: Clock, badge: 3 },
  { label: "Users", tab: "users", icon: Users },
  { label: "Withdrawals", tab: "withdrawals", icon: ArrowDownToLine, badge: 2 },
];

/* ─── Component ─────────────────────────────────── */
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingList, setPendingList] = useState<PendingInv[]>([]);
  const [payModalData, setPayModalData] = useState<WithdrawReq | null>(null);
  const [withdrawList, setWithdrawList] = useState<WithdrawReq[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/withdrawals")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWithdrawList(data.map((w: any) => ({
            id: w?._id || "unknown",
            user: w?.userName || "Unknown",
            amount: `₹${(w?.amount || 0).toLocaleString("en-IN")}`,
            date: w?.date || "",
            status: w?.status || "pending",
            upi: w?.upiId || ""
          })));

        } else {
          setWithdrawList([]);
        }
      })
      .catch(err => {
        console.error("Error fetching withdrawals:", err);
        setWithdrawList([]);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/investments")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPendingList(data.map((inv: any) => ({
            _id: inv?._id || "unknown",
            user: inv?.userName || "Unknown User",
            email: inv?.userEmail || "user@example.com",
            amount: inv?.amount || 0,
            startDate: inv?.startDate || new Date().toISOString(),
            ref: inv?.ref || "REF-ERROR",
            status: inv?.status || "pending",
            type: inv?.type || "saving",
            totalInterest: inv?.totalInterest || 0
          })));

        } else {
          setPendingList([]);
        }
      })
      .catch(err => {
        console.error("Error fetching investments:", err);
        setPendingList([]);
      });
  }, []);

  const handleInvestAction = async (id: string, action: "approved" | "rejected" | "pending") => {
    try {
      const res = await fetch(`http://localhost:5000/api/investments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        setPendingList((prev) =>
          prev.map((inv) => (inv._id === id ? { ...inv, status: action } : inv))
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleWithdrawAction = async (id: string, action: "approved" | "rejected") => {
    try {
      const res = await fetch(`http://localhost:5000/api/withdrawals/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        setWithdrawList((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status: action } : w))
        );
      }
    } catch (error) {
      console.error("Error updating withdrawal status:", error);
    }
  };

  const pendingCount = pendingList.filter((i) => i.status === "pending").length;
  const wdPendingCount = withdrawList.filter((w) => w.status === "pending").length;

  const totalInvestedStr = `₹${pendingList.filter(i => i?.status === 'approved').reduce((acc, curr) => acc + (curr?.amount || 0), 0).toLocaleString("en-IN")}`;
  const totalReturnsStr = `₹${Math.round(pendingList.filter(i => i?.status === 'approved').reduce((acc, curr) => acc + (curr?.totalInterest || 0), 0)).toLocaleString("en-IN")}`;

  
  // Real dynamic users computation from investments
  const uniqueUsersMap = new Map();
  pendingList.forEach(inv => {
    if (!inv || !inv.email) return;
    if (!uniqueUsersMap.has(inv.email)) {
      uniqueUsersMap.set(inv.email, {
        id: inv._id,
        name: inv.user || "User",
        email: inv.email,
        joined: new Date(inv.startDate || Date.now()).toLocaleDateString(),
        investedAmt: inv.amount || 0,
        balanceAmt: (inv.amount || 0) + (inv.totalInterest || 0),
        status: "Active"
      });
    } else {
      const u = uniqueUsersMap.get(inv.email);
      u.investedAmt += (inv.amount || 0);
      u.balanceAmt += ((inv.amount || 0) + (inv.totalInterest || 0));
    }
  });

  const dynamicUsersData = Array.from(uniqueUsersMap.values()).map(u => ({
    ...u,
    invested: `₹${Math.round(u.investedAmt).toLocaleString("en-IN")}`,
    balance: `₹${Math.round(u.balanceAmt).toLocaleString("en-IN")}`
  }));

  const uniqueUsersCount = dynamicUsersData.length || 0;

  const overviewCards = [
    { label: "Total Users", value: `${uniqueUsersCount}`, sub: "Active investors", icon: Users, color: "bg-accent", iconColor: "text-primary" },
    { label: "Total Invested", value: totalInvestedStr, sub: "Across all users", icon: DollarSign, color: "bg-secondary/10", iconColor: "text-secondary" },
    { label: "Pending Approvals", value: `${pendingCount}`, sub: "Requires action", icon: Clock, color: "bg-amber-50", iconColor: "text-amber-600" },
    { label: "Total Returns", value: totalReturnsStr, sub: "Accumulated ROI", icon: TrendingUp, color: "bg-accent", iconColor: "text-primary" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          sidebarOpen ? "translate-x-0 flex flex-col" : "-translate-x-full hidden lg:flex"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <ZenvestLogo />
          <button
            className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Admin badge */}
        <div className="mx-4 mt-4 px-3 py-2 rounded-xl bg-primary/8 border border-primary/20 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-xs font-body font-semibold text-primary">Admin Panel</span>
        </div>

        <nav className="flex-1 p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const badge = item.tab === "pending" ? pendingCount : item.tab === "withdrawals" ? wdPendingCount : 0;
            return (
              <button
                key={item.tab}
                onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-body font-medium transition-colors ${
                  activeTab === item.tab
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
                {badge > 0 && (
                  <span
                    className={`h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      activeTab === item.tab ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link to="/">
            <Button variant="outline" size="sm" className="w-full rounded-xl font-body">
              Back to Site
            </Button>
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center h-16 px-6 border-b border-border bg-card/95 backdrop-blur justify-between">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 text-foreground rounded-lg hover:bg-muted"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs font-body text-muted-foreground">Zenvest Admin</p>
              <h1 className="font-heading font-bold text-foreground capitalize text-lg leading-tight">
                {activeTab === "pending" ? "Pending Investments" : activeTab}
              </h1>
            </div>
          </div>

          {(pendingCount + wdPendingCount) > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-body font-semibold text-amber-700">
                {pendingCount + wdPendingCount} pending actions
              </span>
            </div>
          )}
        </header>

        <main className="flex-1 p-6">
          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {overviewCards.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <motion.div
                      key={c.label}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="card-premium p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-body text-muted-foreground leading-tight">{c.label}</span>
                        <div className={`h-8 w-8 rounded-xl ${c.color} flex items-center justify-center`}>
                          <Icon className={`h-4 w-4 ${c.iconColor}`} />
                        </div>
                      </div>
                      <p className="text-2xl font-heading font-bold text-foreground">{c.value}</p>
                      <p className="text-xs font-body text-muted-foreground mt-1">{c.sub}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pending actions alert */}
              {pendingCount > 0 && (
                <div
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-5 mb-6 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
                  onClick={() => setActiveTab("pending")}
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-body font-semibold text-amber-800">
                        {pendingCount} investment{pendingCount > 1 ? "s" : ""} awaiting your approval
                      </p>
                      <p className="text-xs font-body text-amber-600 mt-0.5">
                        Click to review and approve or reject
                      </p>
                    </div>
                  </div>
                  <Button size="sm" className="rounded-xl font-body bg-amber-600 hover:bg-amber-700">
                    Review Now
                  </Button>
                </div>
              )}

              {/* Recent activity */}
              <div className="card-premium overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="font-heading font-semibold text-foreground">Recent Investments</h2>
                </div>
                <div className="divide-y divide-border">
                  {pendingList.slice(0, 5).map((inv) => (
                    <div key={inv._id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                            inv.status === "approved" ? "bg-accent" : inv.status === "pending" ? "bg-amber-50" : "bg-red-50"
                          }`}
                        >
                          {inv.status === "approved" && <CheckCircle className="h-4 w-4 text-secondary" />}
                          {inv.status === "pending" && <Clock className="h-4 w-4 text-amber-600" />}
                          {inv.status === "rejected" && <XCircle className="h-4 w-4 text-red-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-body font-semibold text-foreground">{inv.user} <span className="opacity-50 font-normal">({inv.type} deposit)</span></p>
                          <p className="text-xs font-body text-muted-foreground">{inv.ref} · {new Date(inv.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-body font-bold text-foreground">₹{inv.amount.toLocaleString("en-IN")}</p>
                        <span className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-full border ${statusStyle[inv.status]}`}>
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── PENDING INVESTMENTS ── */}
          {activeTab === "pending" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-6">
                <h2 className="font-heading text-2xl text-foreground">Pending Investments</h2>
                <p className="text-sm font-body text-muted-foreground mt-0.5">
                  Review each investment and approve or reject based on payment verification.
                </p>
              </div>

              {/* Pending items as cards */}
              <div className="space-y-4">
                {pendingList.map((inv) => (
                  <motion.div
                    key={inv._id}
                    layout
                    className="card-premium p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                            inv.status === "approved" ? "bg-accent" : inv.status === "pending" ? "bg-amber-50" : "bg-red-50"
                          }`}
                        >
                          {inv.status === "approved" && <CheckCircle className="h-5 w-5 text-secondary" />}
                          {inv.status === "pending" && <Clock className="h-5 w-5 text-amber-600" />}
                          {inv.status === "rejected" && <XCircle className="h-5 w-5 text-red-500" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className="text-sm font-body font-bold text-foreground">{inv.user}</p>
                            <span className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-full border ${statusStyle[inv.status]}`}>
                              {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                            </span>
                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full capitalize">{inv.type} deposit</span>
                          </div>
                          <p className="text-xs font-body text-muted-foreground mt-0.5">{inv.email}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            <div>
                              <span className="text-[10px] font-body text-muted-foreground">Amount</span>
                              <p className="text-lg font-heading font-bold text-foreground">₹{inv.amount.toLocaleString("en-IN")}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-body text-muted-foreground">Date</span>
                              <p className="text-sm font-body font-medium text-foreground">{new Date(inv.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-body text-muted-foreground">Reference</span>
                              <p className="text-sm font-body font-medium text-foreground">{inv.ref}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {inv.status === "pending" ? (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl font-body border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-4"
                            onClick={() => handleInvestAction(inv._id, "rejected")}
                          >
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="rounded-xl font-body h-10 px-4"
                            onClick={() => handleInvestAction(inv._id, "approved")}
                          >
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                            Approve
                          </Button>
                        </div>
                      ) : (
                        <div className="shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-xl font-body text-muted-foreground h-10 text-xs"
                            onClick={() => handleInvestAction(inv._id, "pending")}
                          >
                            Undo
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── USERS ── */}
          {activeTab === "users" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-6">
                <h2 className="font-heading text-2xl text-foreground">All Users</h2>
                <p className="text-sm font-body text-muted-foreground mt-0.5">
                  {dynamicUsersData.length} registered investors
                </p>
              </div>
              <div className="card-premium overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-body font-semibold">Name</TableHead>
                      <TableHead className="font-body font-semibold">Email</TableHead>
                      <TableHead className="font-body font-semibold">Joined</TableHead>
                      <TableHead className="font-body font-semibold">Total Invested</TableHead>
                      <TableHead className="font-body font-semibold">Balance</TableHead>
                      <TableHead className="font-body font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dynamicUsersData.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-body font-semibold text-sm">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-accent border border-border flex items-center justify-center text-xs font-heading font-bold text-primary">
                              {u.name.charAt(0)}
                            </div>
                            {u.name}
                          </div>
                        </TableCell>
                        <TableCell className="font-body text-sm text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="font-body text-sm text-muted-foreground">{u.joined}</TableCell>
                        <TableCell className="font-body text-sm font-semibold text-foreground">{u.invested}</TableCell>
                        <TableCell className="font-body text-sm font-semibold text-secondary">{u.balance}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium border ${statusStyle[u.status]}`}>
                            {u.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {/* ── WITHDRAWALS ── */}
          {activeTab === "withdrawals" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-6">
                <h2 className="font-heading text-2xl text-foreground">Withdrawal Requests</h2>
                <p className="text-sm font-body text-muted-foreground mt-0.5">
                  Review and process withdrawal requests from investors.
                </p>
              </div>

              <div className="space-y-4">
                {withdrawList.map((w) => (
                  <motion.div key={w.id} layout className="card-premium p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                            w.status === "approved" ? "bg-accent" : w.status === "pending" ? "bg-amber-50" : "bg-red-50"
                          }`}
                        >
                          {w.status === "approved" && <CheckCircle className="h-5 w-5 text-secondary" />}
                          {w.status === "pending" && <ArrowDownToLine className="h-5 w-5 text-amber-600" />}
                          {w.status === "rejected" && <XCircle className="h-5 w-5 text-red-500" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className="text-sm font-body font-bold text-foreground">{w.user}</p>
                            <span className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-full border ${statusStyle[w.status]}`}>
                              {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                            </span>
                            {w.status === "pending" && w.upi && (
                              <span className="text-[10px] font-body font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground ml-2">
                                UPI: {w.upi}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-5 mt-1.5">
                            <div>
                              <p className="text-[10px] font-body text-muted-foreground">Request ID</p>
                              <p className="text-sm font-body font-medium text-foreground">{w.id}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-body text-muted-foreground">Amount</p>
                              <p className="text-lg font-heading font-bold text-destructive">{w.amount}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-body text-muted-foreground">Date</p>
                              <p className="text-sm font-body font-medium text-foreground">{w.date}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {w.status === "pending" ? (
                        <div className="flex gap-2 shrink-0 mt-3 sm:mt-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl font-body border-red-200 text-red-600 hover:bg-red-50 h-10 px-4"
                            onClick={() => handleWithdrawAction(w.id, "rejected")}
                          >
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="rounded-xl font-body h-10 px-5 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => setPayModalData(w)}
                          >
                            <DollarSign className="mr-1.5 h-3.5 w-3.5 text-white" />
                            Pay
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-3 items-center">
                          <span className="text-xs font-body font-bold text-green-600 px-3 py-1.5 bg-green-50 rounded-xl border border-green-200">
                             Paid
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Pay Modal */}
      {payModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 mt-16">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setPayModalData(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-heading font-bold text-foreground">Complete Payment</h2>
              <p className="text-sm font-body text-muted-foreground mt-2">
                Send the requested amount to the user's UPI below.
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-6">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${payModalData.upi || ""}&pn=${encodeURIComponent(payModalData.user || "")}&am=${payModalData.amount.replace(/[^0-9.]/g, '')}&cu=INR`} alt="UPI QR" className="rounded-xl border border-border" />
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground">UPI ID</label>
                <div className="p-3 bg-muted rounded-xl text-sm font-body text-foreground font-medium flex items-center justify-between">
                  {payModalData.upi || "None provided"}
                </div>
              </div>
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground">Amount</label>
                <div className="p-3 bg-muted rounded-xl text-lg font-heading text-destructive font-bold">
                  {payModalData.amount.startsWith('₹') ? payModalData.amount : `₹${payModalData.amount}`}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="w-full rounded-xl font-body"
                onClick={() => setPayModalData(null)}
              >
                Cancel
              </Button>
              <Button
                className="w-full rounded-xl font-body bg-green-600 hover:bg-green-700"
                onClick={() => {
                  handleWithdrawAction(payModalData.id, "approved");
                  setPayModalData(null);
                }}
              >
                Paid
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
