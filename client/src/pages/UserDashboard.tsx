import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  const [withdrawType, setWithdrawType] = useState<"saving" | "fixed">("saving");
  const [withdrawError, setWithdrawError] = useState("");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [savingBalance, setSavingBalance] = useState<number>(0);
  const [fixedBalance, setFixedBalance] = useState<number>(0);
  const [totalInvested, setTotalInvested] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);
  const [dismissedPaidSuccess, setDismissedPaidSuccess] = useState(false);
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");

  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  let localUser = { name: "", email: "" };
  try {
    if (userStr && userStr !== "null" && userStr !== "undefined") {
      localUser = JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
  }

  // Verify user exists in DB
  useEffect(() => {
    if (!localUser.email || !token) {
      setUserError("Please log in to continue");
      setUserLoading(false);
      return;
    }

    fetch(`${API_URL}/api/users/email/${localUser.email}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 404) {
          // User not found in DB - clear local storage
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUserError("User not found. Please log in or sign up.");
          throw new Error("User not found");
        }
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then(data => {
        if (data && data.email) {
          setUser(data);
          // Update localStorage with fresh data from DB
          localStorage.setItem("user", JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email,
            token: token
          }));
        } else {
          setUserError("User not found. Please log in or sign up.");
        }
      })
      .catch(err => {
        console.error("Error verifying user:", err);
        if (err.message === "User not found") {
          setUserError("User not found. Please log in or sign up.");
        } else {
          setUserError("Failed to load user data. Please try again.");
        }
      })
      .finally(() => {
        setUserLoading(false);
      });
  }, []);

  const initials = user?.name ? String(user.name).charAt(0).toUpperCase() : "U";
  const userEmail = user?.email || "";


  // Use backend-calculated values (no frontend calculations)
  const userWithdrawals = withdrawals.filter(w => w?.userEmail === userEmail);
  const paidWithdrawals = userWithdrawals.filter(w => w?.status === 'approved' || w?.status === 'paid');
  const pendingWithdrawal = userWithdrawals.find(w => w?.status === 'pending');

  const isPaidWithdrawal = paidWithdrawals.length > 0;
  const pendingData = pendingWithdrawal ? { ...pendingWithdrawal, amount: String(pendingWithdrawal?.amount || "0") } : null;

  // Calculate pending amount only (from investments data)
  const pendingAmount = investments.filter(i => i?.status === 'pending').reduce((acc, curr) => acc + (curr?.amount || 0), 0);

  // Total balance from backend (with safety check for negative)
  const currentBalance = Math.max(0, userBalance || 0);
  
  const fixedInvestments = investments.filter(i => i?.type === 'fixed');


  useEffect(() => {
    if (!userEmail) return;

    fetch(`${API_URL}/api/investments`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setInvestments(data.filter(i => i.userEmail === userEmail));
        else setInvestments([]);
      })
      .catch(err => {
        console.error("Error fetching investments:", err);
        setInvestments([]);
      });

    fetch(`${API_URL}/api/withdrawals`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWithdrawals(data.filter(w => w.userEmail === userEmail));
        else setWithdrawals([]);
      })
      .catch(err => {
        console.error("Error fetching withdrawals:", err);
        setWithdrawals([]);
      });

    // Fetch transactions
    setTransactionsLoading(true);
    fetch(`${API_URL}/api/transactions/user/${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTransactions(data);
          console.log('Transactions loaded:', data.length);
        } else {
          setTransactions([]);
          console.log('No transactions data received');
        }
        setTransactionsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
        setTransactionsLoading(false);
      });
  }, [userEmail]);

  // Automatic dismissal for "Withdraw Successful" message
  useEffect(() => {
    if (isPaidWithdrawal && !withdrawDone && !dismissedPaidSuccess) {
      const timer = setTimeout(() => {
        setDismissedPaidSuccess(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPaidWithdrawal, withdrawDone, dismissedPaidSuccess]);

  // Refresh data when withdrawal status changes
  useEffect(() => {
    if (withdrawDone || isPaidWithdrawal) {
      // Refresh all data to get updated balance
      const refreshData = () => {
        fetch(`${API_URL}/api/investments`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setInvestments(data.filter(i => i.userEmail === userEmail));
            else setInvestments([]);
          })
          .catch(err => {
            console.error("Error refreshing investments:", err);
            setInvestments([]);
          });

        fetch(`${API_URL}/api/withdrawals`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setWithdrawals(data.filter(w => w.userEmail === userEmail));
            else setWithdrawals([]);
          })
          .catch(err => {
            console.error("Error refreshing withdrawals:", err);
            setWithdrawals([]);
          });

        refreshTransactions();
      };

      refreshData();
    }
  }, [withdrawDone, isPaidWithdrawal]);

  // Fetch user balance from backend
  useEffect(() => {
    if (userEmail) {
      fetch(`${API_URL}/api/users/email/${userEmail}`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.balance === 'number') {
            setUserBalance(data.balance);
            // Set all balance values from backend (with safety for negative)
            setSavingBalance(Math.max(0, data.savingBalance || 0));
            setFixedBalance(Math.max(0, data.fixedBalance || 0));
            setTotalInvested(Math.max(0, data.totalInvested || 0));
            setTotalInterest(Math.max(0, data.totalInterest || 0));
            setTotalWithdrawn(Math.max(0, data.totalWithdrawn || 0));
          }
        })
        .catch(err => {
          console.error('Error fetching user balance:', err);
        });
    }
  }, [userEmail, withdrawDone, isPaidWithdrawal]);

  // Transform transactions from backend for display
  const displayTransactions = transactions.map(t => ({
    id: t._id || t.id || "N/A",
    date: safeDate(t.createdAt),
    type: t.type === 'investment' ? 'Investment' : 'Withdrawal',
    amount: t.type === 'investment' ? `+₹${safeCurrency(t.amount)}` : `-₹${safeCurrency(t.amount)}`,
    status: t.status === 'approved' ? 'Completed' : t.status === 'paid' ? 'Paid' : t.status === 'pending' ? 'Pending' : t.status === 'requested' ? 'Requested' : t.status === 'rejected' ? 'Rejected' : 'Unknown',
    description: t.description || ''
  }));

  // Refresh transactions function
  const refreshTransactions = () => {
    setTransactionsLoading(true);
    fetch(`${API_URL}/api/transactions/user/${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setTransactions([]);
        }
        setTransactionsLoading(false);
      })
      .catch(err => {
        console.error("Error refreshing transactions:", err);
        setTransactions([]);
        setTransactionsLoading(false);
      });
  };

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
    // When user has both types, don't show a combined badge
    depositBadge = "";
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
      value: `₹${safeCurrency(Math.round(totalInterest || 0))}`,
      sub: `Combined interest earned`,
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

  const checkWithdrawalEligibility = (investmentType: string, startDate: string) => {
    if (investmentType === 'fixed') {
      const lockedUntil = new Date(startDate);
      lockedUntil.setFullYear(lockedUntil.getFullYear() + 1);
      if (lockedUntil > new Date()) {
        return {
          eligible: false,
          message: "Withdrawal is allowed only after 1 year for Fixed Deposit.",
          unlockDate: lockedUntil.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        };
      }
    }
    return { eligible: true };
  };

  const checkFixedDepositEligibility = () => {
    if (fixedInvestments.length === 0) {
      setWithdrawError("No Fixed Deposits found");
      return false;
    }

    // Check if any fixed deposit is still locked
    for (const investment of fixedInvestments) {
      const eligibility = checkWithdrawalEligibility('fixed', investment.startDate);
      if (!eligibility.eligible) {
        setWithdrawError(`Withdrawal allowed only after 1 year. Available on: ${eligibility.unlockDate}`);
        return false;
      }
    }
    return true;
  };

  const validateWithdrawalAmount = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!withdrawAmount || isNaN(amount) || amount <= 0) {
      setWithdrawError("Please enter a valid amount");
      return false;
    }

    if (withdrawType === 'saving') {
      if (amount > savingBalance) {
        setWithdrawError("Insufficient balance in Saving Deposit");
        return false;
      }
    } else if (withdrawType === 'fixed') {
      if (!checkFixedDepositEligibility()) {
        return false;
      }
      if (amount > fixedBalance) {
        setWithdrawError("Insufficient balance in Fixed Deposit");
        return false;
      }
    }

    setWithdrawError("");
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Show loading state while verifying user
  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-body">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if user not found or not authenticated
  if (userError || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="font-heading text-xl text-foreground mb-2">{userError || "User not found"}</h2>
          <p className="text-muted-foreground font-body mb-6">Please log in or create an account to continue.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-2 bg-primary text-white rounded-xl font-body font-medium hover:bg-primary/90 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => window.location.href = '/register'}
              className="px-6 py-2 border border-border rounded-xl font-body font-medium hover:bg-accent transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => {
          const mobileMenu = document.getElementById('mobile-menu');
          if (mobileMenu) {
            mobileMenu.classList.toggle('translate-x-0');
          }
        }}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-card border border-border shadow-lg"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile Sidebar */}
      <aside
        id="mobile-menu"
        className="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform -translate-x-full transition-transform duration-300 lg:hidden"
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <ZenvestLogo size="sm" />
            <p className="text-xs font-body text-muted-foreground mt-1">User Dashboard</p>
          </div>
          <button
            onClick={() => {
              const mobileMenu = document.getElementById('mobile-menu');
              if (mobileMenu) {
                mobileMenu.classList.add('-translate-x-full');
              }
            }}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => {
                setActiveTab(item.tab);
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) {
                  mobileMenu.classList.add('-translate-x-full');
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body font-medium transition-colors" ${
                activeTab === item.tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
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
            <p className="text-sm font-body font-medium text-foreground">{user?.name || "User"}</p>
            <p className="text-xs font-body text-muted-foreground">{user?.email || "user@example.com"}</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body font-medium transition-colors" ${
                activeTab === item.tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
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
              {depositBadge && (
                <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {depositBadge}
                </span>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-9 w-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl font-body"
              onClick={handleLogout}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Logout
            </Button>
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
        <div className="lg:hidden flex items-center gap-1 px-4 pt-4 pb-2 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`px-3 py-2.5 rounded-xl text-sm font-body font-medium whitespace-nowrap transition-colors" ${
                activeTab === item.tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:pl-8 pt-20 lg:pt-6">
          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {overviewCards.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <motion.div
                      key={c.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="card-premium p-4 sm:p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-body text-muted-foreground leading-tight">
                          {c.label}
                        </span>
                        <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-xl ${c.color} flex items-center justify-center`}>
                          <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${c.iconColor}`} />
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl font-heading font-bold text-foreground">{c.value}</p>
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
              <div className="flex flex-col sm:flex-wrap sm:flex-row gap-3 mb-6">
                <Link to="/invest" className="flex-1 sm:flex-none">
                  <Button className="w-full rounded-xl font-body font-medium h-12 sm:h-11 group">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Investment
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full rounded-xl font-body font-medium h-12 sm:h-11"
                  onClick={() => setActiveTab("withdraw")}
                >
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Withdraw Funds
                </Button>
              </div>

              {/* Recent investments summary - Separated by type */}
              <div className="space-y-6">
                {/* Saving Deposits Section */}
                {(() => {
                  const savingDeposits = investments.filter(inv => inv?.type === 'saving').slice(0, 3);
                  if (savingDeposits.length === 0) return null;
                  return (
                    <div className="card-premium overflow-hidden">
                      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex items-center justify-between">
                        <h2 className="font-heading font-semibold text-foreground text-base sm:text-lg">Saving Deposits</h2>
                        <button
                          onClick={() => setActiveTab("investments")}
                          className="text-xs font-body text-primary hover:underline"
                        >
                          View all
                        </button>
                      </div>
                      <div className="divide-y divide-border">
                        {savingDeposits.map((inv) => {
                          const status = inv?.status || "pending";
                          const cfg = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };
                          return (
                            <div key={inv?._id || Math.random()} className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-xl flex items-center justify-center ${
                                    status === "approved"
                                      ? "bg-accent"
                                      : status === "pending"
                                      ? "bg-amber-50"
                                      : "bg-red-50"
                                  }`}
                                >
                                  {status === "approved" && <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary" />}
                                  {status === "pending" && <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />}
                                  {status === "rejected" && <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-body font-medium text-foreground truncate">{inv?.ref || "REF-ERROR"}</p>
                                  <p className="text-xs font-body text-muted-foreground">{safeDate(inv?.startDate)}</p>
                                </div>
                              </div>
                              <div className="text-right ml-2">
                                <p className="text-sm font-body font-semibold text-foreground">₹{safeCurrency(inv?.amount)}</p>
                                <p className="text-xs font-body text-secondary">Interest: ₹{safeCurrency(Math.round(inv?.totalInterest || 0))}</p>
                                <p className="text-xs font-body text-muted-foreground">7% yearly</p>
                                <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                                  {cfg.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Fixed Deposits Section */}
                {(() => {
                  const fixedDeposits = investments.filter(inv => inv?.type === 'fixed').slice(0, 3);
                  if (fixedDeposits.length === 0) return null;
                  return (
                    <div className="card-premium overflow-hidden">
                      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex items-center justify-between">
                        <h2 className="font-heading font-semibold text-foreground text-base sm:text-lg">Fixed Deposits</h2>
                        <button
                          onClick={() => setActiveTab("investments")}
                          className="text-xs font-body text-primary hover:underline"
                        >
                          View all
                        </button>
                      </div>
                      <div className="divide-y divide-border">
                        {fixedDeposits.map((inv) => {
                          const status = inv?.status || "pending";
                          const cfg = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };
                          const lockedUntil = new Date(inv?.startDate || Date.now());
                          lockedUntil.setFullYear(lockedUntil.getFullYear() + 1);
                          const isLocked = lockedUntil > new Date();
                          return (
                            <div key={inv?._id || Math.random()} className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-xl flex items-center justify-center ${
                                    status === "approved"
                                      ? "bg-accent"
                                      : status === "pending"
                                      ? "bg-amber-50"
                                      : "bg-red-50"
                                  }`}
                                >
                                  {status === "approved" && <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary" />}
                                  {status === "pending" && <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />}
                                  {status === "rejected" && <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-body font-medium text-foreground truncate">{inv?.ref || "REF-ERROR"}</p>
                                  <p className="text-xs font-body text-muted-foreground">{safeDate(inv?.startDate)}</p>
                                </div>
                              </div>
                              <div className="text-right ml-2">
                                <p className="text-sm font-body font-semibold text-foreground">₹{safeCurrency(inv?.amount)}</p>
                                <p className="text-xs font-body text-secondary">Interest: ₹{safeCurrency(Math.round(inv?.totalInterest || 0))}</p>
                                <p className="text-xs font-body text-muted-foreground">12% yearly</p>
                                <p className="text-xs font-body text-muted-foreground">
                                  {isLocked ? `Locked until ${safeDate(lockedUntil)}` : "Unlocked"}
                                </p>
                                <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                                  {cfg.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
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
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-2xl text-foreground">Transaction History</h2>
                  <p className="text-sm font-body text-muted-foreground mt-0.5">
                    Complete record of all your transactions
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshTransactions}
                  disabled={transactionsLoading}
                  className="rounded-xl font-body"
                >
                  {transactionsLoading ? "Refreshing..." : "Refresh"}
                </Button>
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
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                            <span className="text-sm font-body text-muted-foreground">Loading transactions...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : displayTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-sm font-body text-muted-foreground">No transactions found</p>
                          <p className="text-xs font-body text-muted-foreground mt-1">Your transaction history will appear here</p>
                        </TableCell>
                      </TableRow>
                    ) : displayTransactions.map((t) => {
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

              {/* Pending Withdrawal Message */}
              {pendingData && !withdrawDone && !showWithdrawSuccess && (
                <div className="card-premium p-4 mb-6 bg-amber-50 border-amber-200">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-body font-semibold text-amber-800">
                        Withdrawal Requested: ₹{safeCurrency(pendingData.amount)}
                      </p>
                      <p className="text-xs font-body text-amber-600 mt-0.5">
                        Your request is being processed by the admin team.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
              ) : showWithdrawSuccess ? (
                <div className="card-premium p-8 text-center animate-in zoom-in fade-in">
                  <div className="h-14 w-14 rounded-full bg-accent border-2 border-secondary/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-7 w-7 text-secondary" />
                  </div>
                  <h3 className="font-heading text-xl text-foreground mb-2">Withdrawal Request Sent Successfully</h3>
                  <p className="text-sm font-body text-muted-foreground mb-6">
                    Money will be credited within 12 hours.
                  </p>
                  <Button
                    onClick={() => { setShowWithdrawSuccess(false); setWithdrawAmount(""); setShowUpiInput(false); setUpiId(""); }}
                    variant="outline"
                    className="rounded-xl font-body"
                  >
                    Back to Withdraw
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
                  {/* Separate Balance Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Saving Balance Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-body text-green-700 font-medium">Saving Deposit Balance</p>
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      </div>
                      <p className="text-2xl font-heading font-bold text-green-800">₹{safeCurrency(Math.round(savingBalance || 0))}</p>
                      <p className="text-xs font-body text-green-600 mt-1">Withdraw anytime</p>
                      <Button
                        onClick={() => {
                          setWithdrawType("saving");
                          setWithdrawError("");
                        }}
                        variant={withdrawType === "saving" ? "default" : "outline"}
                        className={`w-full mt-3 rounded-xl font-body h-10 ${
                          withdrawType === "saving" ? "bg-green-600 hover:bg-green-700 text-white" : "border-green-300 text-green-700 hover:bg-green-50"
                        }`}
                      >
                        Withdraw from Saving
                      </Button>
                    </div>

                    {/* Fixed Balance Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-body text-blue-700 font-medium">Fixed Deposit Balance</p>
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <p className="text-2xl font-heading font-bold text-blue-800">₹{safeCurrency(Math.round(fixedBalance || 0))}</p>
                      <p className="text-xs font-body text-blue-600 mt-1">1 year lock period</p>
                      <Button
                        onClick={() => {
                          setWithdrawType("fixed");
                          setWithdrawError("");
                          checkFixedDepositEligibility();
                        }}
                        variant="outline"
                        disabled={fixedInvestments.length === 0}
                        className="w-full mt-3 rounded-xl font-body h-10 border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Withdraw from Fixed
                      </Button>
                    </div>
                  </div>

                  {/* Withdrawal Error Message */}
                  {withdrawError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                      <div className="flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-body font-medium text-red-800">{withdrawError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Withdrawal Form */}
                  {withdrawType && (
                    <div className="space-y-4">
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
                            onChange={(e) => {
                              setWithdrawAmount(e.target.value);
                              setWithdrawError("");
                            }}
                            className="w-full pl-8 h-13 text-lg font-heading font-bold rounded-xl border border-border bg-background px-4 focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <p className="text-xs font-body text-muted-foreground mt-1">
                          Available: ₹{safeCurrency(Math.round(withdrawType === 'saving' ? savingBalance : fixedBalance))}
                        </p>
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
                        if (validateWithdrawalAmount()) {
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
                        if (!validateWithdrawalAmount()) {
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
                                userEmail: userEmail,
                                withdrawType: withdrawType
                              })
                            });

                            if (res.ok) {
                              const newW = await res.json();
                              setWithdrawals(prev => [newW, ...prev]);
                              setShowWithdrawSuccess(true);
                              setTimeout(() => {
                                setShowWithdrawSuccess(false);
                                setWithdrawAmount("");
                                setShowUpiInput(false);
                                setUpiId("");
                              }, 3000);
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
