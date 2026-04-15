import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Wallet,
  Clock,
  ArrowDownToLine,
  ArrowRight,
  PlusCircle,
  CheckCircle,
  XCircle,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ZenvestLogo from "@/components/ZenvestLogo";

/* ─── Shared Configurations ─────────────────────────── */
// Removed mock investments
interface Investment {
  _id: string;
  amount: number;
  ref: string;
  status: "pending" | "approved" | "rejected";
  type: "saving" | "fixed";
  startDate: string;
  totalInterest: number;
  interestRate: number;
}

// Static transaction mock removed

const statusConfig: Record<string, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-accent text-accent-foreground" },
  pending: { label: "Pending Review", className: "bg-amber-50 text-amber-700" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-600" },
  Approved: { label: "Approved", className: "bg-accent text-accent-foreground" },
  Credited: { label: "Credited", className: "bg-secondary/10 text-secondary" },
  Pending: { label: "Pending", className: "bg-amber-50 text-amber-700" },
  Processed: { label: "Processed", className: "bg-blue-50 text-blue-600" },
  Rejected: { label: "Rejected", className: "bg-red-50 text-red-600" },
};

type NavTab = "overview" | "investments" | "history" | "withdraw";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const safeCurrency = (val: any) => {

  const num = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(num) ? "0" : num.toLocaleString("en-IN");
};

const safeDate = (dateVal: any) => {
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
};

const navItems: { label: string; tab: NavTab }[] = [

  { label: "Overview", tab: "overview" },
  { label: "My Investments", tab: "investments" },
  { label: "Transaction History", tab: "history" },
  { label: "Withdraw", tab: "withdraw" },
];

/* ─── Component ────────────────────────────────────── */
const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDone, setWithdrawDone] = useState(false);
  const [showUpiInput, setShowUpiInput] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [dismissedPaidSuccess, setDismissedPaidSuccess] = useState(false);


  const userStr = localStorage.getItem("user");
  let user = { name: "User", email: "" };
  try {
    if (userStr && userStr !== "null" && userStr !== "undefined") {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
  }

  const initials = user?.name ? String(user.name).charAt(0).toUpperCase() : "U";
  const userEmail = user?.email || "";


  const userWithdrawals = withdrawals.filter(w => w?.userEmail === userEmail);
  const paidWithdrawals = userWithdrawals.filter(w => w?.status === 'approved');
  const pendingWithdrawal = userWithdrawals.find(w => w?.status === 'pending');

  
  const withdrawnAmt = paidWithdrawals.reduce((acc, curr) => acc + (curr?.amount || 0), 0);
  const isPaidWithdrawal = paidWithdrawals.length > 0;
  const pendingData = pendingWithdrawal ? { ...pendingWithdrawal, amount: String(pendingWithdrawal?.amount || "0") } : null;

  const totalInvested = investments.filter(i => i?.status === 'approved').reduce((acc, curr) => acc + (curr?.amount || 0), 0);
  const totalEarnings = investments.filter(i => i?.status === 'approved').reduce((acc, curr) => acc + (curr?.totalInterest || 0), 0);
  const currentBalance = (totalInvested || 0) + (totalEarnings || 0) - (withdrawnAmt || 0);
  const pendingAmount = investments.filter(i => i?.status === 'pending').reduce((acc, curr) => acc + (curr?.amount || 0), 0);


  useEffect(() => {
    fetch(`${API_URL}/api/investments`)

      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setInvestments(data);
        else setInvestments([]);
      })
      .catch(err => {
        console.error("Error fetching investments:", err);
        setInvestments([]);
      });

    fetch(`${API_URL}/api/withdrawals`)

      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWithdrawals(data);
        else setWithdrawals([]);
      })
      .catch(err => {
        console.error("Error fetching withdrawals:", err);
        setWithdrawals([]);
      });
  }, []);

  // Automatic dismissal for "Withdraw Successful" message
  useEffect(() => {
    if (isPaidWithdrawal && !withdrawDone && !dismissedPaidSuccess) {
      const timer = setTimeout(() => {
        setDismissedPaidSuccess(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPaidWithdrawal, withdrawDone, dismissedPaidSuccess]);

  const transactions = (investments || []).map(inv => {

    if (!inv) return null;
    return {
      id: inv?.ref || "N/A",
      date: safeDate(inv?.startDate),
      type: "Investment",
      amount: `+₹${safeCurrency(inv?.amount)}`,
      status: (String(inv?.status || "")).charAt(0).toUpperCase() + (String(inv?.status || "")).slice(1)

    };
  }).filter(Boolean) as any[];


  if (pendingData) {
    transactions.unshift({
      id: "WD-REQ",
      date: pendingData.date || safeDate(Date.now()),
      type: "Withdrawal",
      amount: `-₹${safeCurrency(pendingData.amount)}`,
      status: "Pending"

    });
  }
  paidWithdrawals.forEach(w => {
     transactions.unshift({
      id: "WD-PAID",
      date: w?.date || safeDate(Date.now()),
      type: "Withdrawal",
      amount: `-₹${safeCurrency(w?.amount)}`,
      status: "Processed"

    });
  });


  const activeTypes = Array.from(new Set(investments.filter(i => i?.status === 'approved').map(i => i?.type).filter(Boolean)));

  let depositBadge = "No Active Deposits";
  let returnRate = "0% yearly";
  if (activeTypes.length === 1 && activeTypes[0] === 'saving') {
    depositBadge = "Saving Deposit";
    returnRate = "Saving: 7% yearly";
  } else if (activeTypes.length === 1 && activeTypes[0] === 'fixed') {
    depositBadge = "Fixed Deposit";
    returnRate = "Fixed: 12% yearly";
  } else if (activeTypes.length > 1) {
    depositBadge = "Saving & Fixed";
    returnRate = "7-12% yearly";
  }

  const overviewCards = [
    {
      label: "Total Invested",
      value: `₹${safeCurrency(totalInvested)}`,


      sub: "Active capital",
      positive: true,
      icon: Wallet,
      color: "bg-accent",
      iconColor: "text-primary",
    },
    {
      label: "Total Earnings",
      value: `₹${safeCurrency(Math.round(totalEarnings || 0))}`,


      sub: `Est. Annual Return: ${returnRate}`,
      positive: true,
      icon: TrendingUp,
      color: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      label: "Current Balance",
      value: investments.length === 0 ? "₹0" : `₹${safeCurrency(Math.round(currentBalance || 0))}`,


      sub: "Available to view",
      positive: null,
      icon: Wallet,
      color: "bg-accent",
      iconColor: "text-primary",
    },
    {
      label: "Pending",
      value: `₹${safeCurrency(pendingAmount)}`,


      sub: "Awaiting admin approval",
      positive: null,
      icon: Clock,
      color: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  const handleWithdrawAction = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/investments/${id}/withdraw`, { method: 'POST' });
      if (res.ok) {
        setInvestments(prev => prev.filter(inv => inv._id !== id));
        alert("Withdrawal successful. Funds will be credited to your account.");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to withdraw");
      }
    } catch (error) {
      alert("Error processing withdrawal");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-card border-r border-border">
        <div className="p-5 border-b border-border">
          <ZenvestLogo />
        </div>

        {/* User pill */}
        <div className="mx-4 mt-5 p-3 rounded-2xl bg-accent border border-border flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-sm">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-body font-semibold text-foreground truncate max-w-[120px]">{user?.name || "User"}</p>
              <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                {depositBadge}
              </span>
            </div>
            <p className="text-xs font-body text-muted-foreground truncate w-36">{userEmail}</p>

          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 mt-3">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body font-medium transition-colors ${
                activeTab === item.tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.tab === "overview" && <Wallet className="h-4 w-4" />}
              {item.tab === "investments" && <TrendingUp className="h-4 w-4" />}
              {item.tab === "history" && <Clock className="h-4 w-4" />}
              {item.tab === "withdraw" && <ArrowDownToLine className="h-4 w-4" />}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Link to="/">
            <Button variant="outline" size="sm" className="w-full rounded-xl font-body">
              Back to Site
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border px-6 h-16 flex items-center justify-between">
          <div>
            <p className="text-xs font-body text-muted-foreground">Good morning</p>
            <h1 className="font-heading text-lg text-foreground font-bold leading-tight flex items-center gap-2">
              {user?.name || "User"}

              <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                {depositBadge}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-9 w-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            <Link to="/invest">
              <Button size="sm" className="rounded-xl font-body font-medium group">
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                Invest
                <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Tab: mobile nav */}
        <div className="lg:hidden flex items-center gap-1 px-4 pt-4 pb-0 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`px-4 py-2 rounded-xl text-sm font-body font-medium whitespace-nowrap transition-colors ${
                activeTab === item.tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-6">
          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {overviewCards.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <motion.div
                      key={c.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="card-premium p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-body text-muted-foreground leading-tight">
                          {c.label}
                        </span>
                        <div className={`h-8 w-8 rounded-xl ${c.color} flex items-center justify-center`}>
                          <Icon className={`h-4 w-4 ${c.iconColor}`} />
                        </div>
                      </div>
                      <p className="text-xl font-heading font-bold text-foreground">{c.value}</p>
                      <p
                        className={`text-xs font-body mt-1 ${
                          c.positive === true ? "text-secondary" : "text-muted-foreground"
                        }`}
                      >
                        {c.sub}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Link to="/invest">
                  <Button className="rounded-xl font-body font-medium h-11 group">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Investment
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="rounded-xl font-body font-medium h-11"
                  onClick={() => setActiveTab("withdraw")}
                >
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Withdraw Funds
                </Button>
              </div>

              {/* Recent investments summary */}
              <div className="card-premium overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-heading font-semibold text-foreground">Recent Investments</h2>
                  <button
                    onClick={() => setActiveTab("investments")}
                    className="text-xs font-body text-primary hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {investments.slice(0, 3).map((inv) => {
                    const status = inv?.status || "pending";
                    const cfg = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };
                    return (
                      <div key={inv?._id || Math.random()} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                              status === "approved"
                                ? "bg-accent"
                                : status === "pending"
                                ? "bg-amber-50"
                                : "bg-red-50"
                            }`}
                          >
                            {status === "approved" && <CheckCircle className="h-4 w-4 text-secondary" />}
                            {status === "pending" && <Clock className="h-4 w-4 text-amber-600" />}
                            {status === "rejected" && <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-body font-medium text-foreground">{inv?.ref || "REF-ERROR"}</p>
                            <p className="text-xs font-body text-muted-foreground">{safeDate(inv?.startDate)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-body font-semibold text-foreground">₹{safeCurrency(inv?.amount)}</p>

                          <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>
            </motion.div>
          )}

          {/* ── MY INVESTMENTS ── */}
          {activeTab === "investments" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading text-2xl text-foreground">My Investments</h2>
                  <p className="text-sm font-body text-muted-foreground mt-0.5">
                    All your investments and their approval status
                  </p>
                </div>
                <Link to="/invest">
                  <Button className="rounded-xl font-body font-medium group">
                    <PlusCircle className="mr-1.5 h-4 w-4" />
                    New Investment
                  </Button>
                </Link>
              </div>

              <div className="card-premium overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-body font-semibold">Investment ID</TableHead>
                      <TableHead className="font-body font-semibold">Date</TableHead>
                      <TableHead className="font-body font-semibold">Type</TableHead>
                      <TableHead className="font-body font-semibold">Amount</TableHead>
                      <TableHead className="font-body font-semibold">Returns</TableHead>
                      <TableHead className="font-body font-semibold">Status</TableHead>
                      <TableHead className="font-body font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.map((inv) => {
                      const status = inv?.status || "pending";
                      const cfg = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };
                      
                      const isFixed = inv?.type === 'fixed';
                      const lockedUntil = new Date(inv?.startDate || Date.now());
                      if (isFixed) lockedUntil.setFullYear(lockedUntil.getFullYear() + 1);
                      const isLocked = isFixed && lockedUntil > new Date();

                      return (
                        <TableRow key={inv?._id || Math.random()}>
                          <TableCell className="font-body font-medium text-sm">{inv?.ref || "REF-ERROR"}</TableCell>
                          <TableCell className="font-body text-sm text-muted-foreground">{safeDate(inv?.startDate)}</TableCell>
                          <TableCell className="font-body text-sm capitalize">
                            {inv?.type || "Saving"} Deposit
                            <br/>
                            <span className="text-[10px] text-muted-foreground">{isLocked ? `Locked until ${safeDate(lockedUntil)}` : "Withdraw anytime"}</span>
                          </TableCell>
                          <TableCell className="font-body text-sm font-semibold text-foreground">₹{safeCurrency(inv?.amount)}</TableCell>
                          <TableCell className="font-body text-sm font-semibold text-secondary">₹{safeCurrency(Math.round(inv?.totalInterest || 0))}</TableCell>

                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${cfg.className}`}>
                              {cfg.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            {isPaidWithdrawal ? (
                              <span className="text-[10px] font-body font-bold text-green-600 px-2.5 py-1 bg-green-50 rounded-md border border-green-200">
                                Payment Received
                              </span>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                disabled={status !== 'approved' || isLocked}
                                onClick={() => setActiveTab("withdraw")}
                              >
                                Withdraw
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {/* ── TRANSACTION HISTORY ── */}
          {activeTab === "history" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-6">
                <h2 className="font-heading text-2xl text-foreground">Transaction History</h2>
                <p className="text-sm font-body text-muted-foreground mt-0.5">
                  Complete record of all your transactions
                </p>
              </div>
              <div className="card-premium overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-body font-semibold">ID</TableHead>
                      <TableHead className="font-body font-semibold">Date</TableHead>
                      <TableHead className="font-body font-semibold">Type</TableHead>
                      <TableHead className="font-body font-semibold">Amount</TableHead>
                      <TableHead className="font-body font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => {
                      const status = t?.status || "Pending";
                      const cfg = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };
                      return (
                        <TableRow key={t?.id || Math.random()}>
                          <TableCell className="font-body text-sm font-medium">{t?.id || "N/A"}</TableCell>
                          <TableCell className="font-body text-sm text-muted-foreground">{t?.date || "N/A"}</TableCell>
                          <TableCell className="font-body text-sm">{t?.type || "Transaction"}</TableCell>
                          <TableCell
                            className={`font-body text-sm font-semibold ${
                              (t?.amount || "").startsWith("+") ? "text-secondary" : "text-destructive"
                            }`}
                          >
                            {t?.amount || "₹0"}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${cfg.className}`}>
                              {cfg.label}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {/* ── WITHDRAW ── */}
          {activeTab === "withdraw" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-lg"
            >
              <div className="mb-6">
                <h2 className="font-heading text-2xl text-foreground">Withdraw Funds</h2>
                <p className="text-sm font-body text-muted-foreground mt-0.5">
                  Request a withdrawal from your available balance
                </p>
              </div>

              {isPaidWithdrawal && !withdrawDone && !dismissedPaidSuccess ? (

                <div className="card-premium p-8 text-center animate-in zoom-in fade-in">
                  <div className="h-14 w-14 rounded-full bg-accent border-2 border-secondary/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-7 w-7 text-secondary" />
                  </div>
                  <h3 className="font-heading text-xl text-foreground mb-2">Withdraw Successful</h3>
                  <p className="text-sm font-body text-muted-foreground mb-6">
                    Funds have been credited to your UPI ID.
                  </p>
                  <Button
                    onClick={() => { setDismissedPaidSuccess(true); }}

                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              ) : withdrawDone ? (
                <div className="card-premium p-8 text-center">
                  <div className="h-14 w-14 rounded-full bg-accent border-2 border-secondary/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-7 w-7 text-secondary" />
                  </div>
                  <h3 className="font-heading text-xl text-foreground mb-2">Request Submitted</h3>
                  <p className="text-sm font-body text-muted-foreground mb-6">
                    Your withdraw request submitted, your money will be debited within 12 hours.
                  </p>
                  <Button
                    onClick={() => { setWithdrawDone(false); setWithdrawAmount(""); setShowUpiInput(false); setUpiId(""); setDismissedPaidSuccess(false); }}

                    variant="outline"
                    className="rounded-xl font-body"
                  >
                    Make Another Request
                  </Button>
                </div>
              ) : (
                <div className="card-premium p-7 space-y-5">
                  {/* Balance info */}
                  <div className="rounded-2xl bg-accent border border-border p-5">
                    <p className="text-xs font-body text-muted-foreground mb-1">Available Balance</p>
                    <p className="text-3xl font-heading font-bold text-foreground">₹{safeCurrency(Math.round(currentBalance || 0))}</p>



                    <p className="text-xs font-body text-muted-foreground mt-1">Includes returns credited to date</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-body font-medium text-foreground">
                      Withdrawal Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-heading font-bold text-muted-foreground">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full pl-8 h-13 text-lg font-heading font-bold rounded-xl border border-border bg-background px-4 focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                    <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-body text-amber-700 leading-relaxed">
                      Withdrawals are reviewed manually by our team and processed within 24–48 hours.
                    </p>
                  </div>

                  {showUpiInput && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-sm font-body font-medium text-foreground">
                        Enter your UPI ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. user@ybl"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full h-13 text-base font-body rounded-xl border border-border bg-background px-4 focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  )}

                  {!showUpiInput ? (
                    <Button
                      onClick={() => {
                        if (withdrawAmount && parseInt(withdrawAmount) > 0) {
                          setShowUpiInput(true);
                        }
                      }}
                      size="lg"
                      className="w-full h-13 rounded-xl font-body font-medium"
                    >
                      Submit Withdrawal Request
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={async () => {
                        if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
                          alert("Please enter a valid amount greater than 0");
                          return;
                        }
                        if (upiId.trim() !== "") {
                          try {
                            const res = await fetch(`${API_URL}/api/withdrawals`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                amount: parseFloat(withdrawAmount),
                                upiId: upiId,
                                userName: user?.name || "User",
                                userEmail: userEmail

                              })
                            });

                            if (res.ok) {
                              const newW = await res.json();
                              setWithdrawals(prev => [newW, ...prev]);
                              setWithdrawDone(true);
                            } else {
                              const errorData = await res.json();
                              alert(errorData.message || "Failed to submit withdrawal request");
                            }
                          } catch (error) {
                            console.error("Withdraw error:", error);
                            alert("Connection error. Please check if the server is running.");
                          }
                        } else {
                          alert("Please enter your UPI ID");
                        }
                      }}
                      size="lg"
                      className="w-full h-13 rounded-xl font-body font-medium"
                    >
                      Withdraw
                      <ArrowDownToLine className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
