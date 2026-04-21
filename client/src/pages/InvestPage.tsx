import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { generateUPILink } from "@/utils/upi";

type Step = "amount" | "payment" | "pending";

interface Investment {
  _id?: string;
  amount: number;
  ref: string;
  status: "pending" | "approved" | "rejected";
  type?: "saving" | "fixed";
  userEmail?: string;
}

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000" : "https://growvest-online.onrender.com");

const statusConfig = {
  pending: { label: "Waiting for Approval", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  approved: { label: "Approved", color: "bg-accent text-accent-foreground border-accent-foreground/10", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

// Error boundary component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by boundary:', event.error);
      setErrorMessage(event.error?.message || 'An unexpected error occurred');
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 max-w-5xl">
          <div className="text-center max-w-md mx-auto">
            <h2 className="font-heading text-2xl text-foreground mb-4">Something went wrong</h2>
            <p className="text-muted-foreground font-body mb-6">{errorMessage}</p>
            <Button onClick={() => { setHasError(false); setErrorMessage(""); }} className="rounded-xl font-body">
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const InvestPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [depositType, setDepositType] = useState<"saving" | "fixed">("saving");
  const [pastInvestments, setPastInvestments] = useState<Investment[]>([]);
  const [upiId, setUpiId] = useState("7418662750@ibl");
  const [loading, setLoading] = useState(true);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    
    fetch(`${API_URL}/api/investments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          if (user && user.email) {
            setPastInvestments(data.filter(i => i.userEmail === user.email));
          } else {
            setPastInvestments([]);
          }
        } else {
          setPastInvestments([]);
        }
      })
      .catch(err => {
        console.error("Error fetching investments:", err);
        setPastInvestments([]);
      });
  }, [token, user]);

  // Fetch UPI ID from backend
  useEffect(() => {
    const fetchUPIId = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/upiId`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.value) {
            setUpiId(data.value);
            setError("");
          } else {
            setUpiId("7418662750@ibl");
          }
        } else {
          // Use default UPI ID if API fails
          setUpiId("7418662750@ibl");
        }
      } catch (err) {
        console.error('Error fetching UPI ID:', err);
        setError('Failed to load UPI settings');
        // Use default UPI ID on error
        setUpiId("7418662750@ibl");
      } finally {
        setLoading(false);
      }
    };

    fetchUPIId();
  }, []);

  // Safe calculations with fallbacks
  const totalInvested = (pastInvestments || []).filter(i => i?.status === 'approved').reduce((acc, curr) => acc + (curr?.amount || 0), 0);
  const pendingAmount = (pastInvestments || []).filter(i => i?.status === 'pending').reduce((acc, curr) => acc + (curr?.amount || 0), 0);
  const estAnnualReturn = (pastInvestments || []).filter(i => i?.status === 'approved').reduce((acc, curr) => acc + ((curr?.amount || 0) * (curr?.type === 'fixed' ? 0.12 : 0.07)), 0);


  const refCode = `INV-${Date.now().toString().slice(-6)}`;

  const handleInvest = async () => {
    if (!user || !token) {
      toast.error("Please login first to continue");
      navigate("/login");
      return;
    }

    const val = parseFloat(amount || "0");
    if (!amount || isNaN(val) || val < 1) {
      setAmountError("Minimum investment is ₹1");
      return;
    }
    setAmountError("");
    setStep("payment");
  };

  const handleConfirmPaid = async () => {
    if (!user || !token) return;
    
    setRazorpayLoading(true); // Re-using loading state for button
    try {
      const res = await fetch(`${API_URL}/api/investments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          amount: parseFloat(amount),
          type: depositType,
          userName: user.name,
          userEmail: user.email
        })
      });

      if (res.ok) {
        toast.success("Investment submitted for verification!");
        setStep("pending");
      } else {
        throw new Error("Failed to submit investment");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err.message || "Could not submit investment");
    } finally {
      setRazorpayLoading(false);
    }
  };

  // handleConfirm is no longer needed with Razorpay automated verification


  // Show error state if there's a critical error
  if (error && loading === false) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 max-w-5xl">
          <div className="text-center max-w-md mx-auto">
            <p className="text-destructive font-body mb-4">{error}</p>
            <Button onClick={() => { setError(""); setLoading(true); }} className="rounded-xl font-body">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Navbar />

      <div className="container py-12 max-w-5xl">
        {/* Loading indicator */}
        {loading && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
            <p className="text-sm font-body text-amber-700">Loading investment settings...</p>
          </div>
        )}

        {/* Page header */}
        <div className="mb-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl text-foreground">Make an Investment</h1>
          <p className="text-muted-foreground font-body mt-2">
            Enter your amount, pay via QR, and our team will verify within 2 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left — main flow */}
          <div className="lg:col-span-7">
            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-8">
              {(["amount", "payment", "pending"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 ${step === s ? "" : "opacity-40"}`}>
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-body font-bold transition-colors ${
                        step === s
                          ? "bg-primary text-primary-foreground"
                          : ["amount", "payment", "pending"].indexOf(step) > i
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {["amount", "payment", "pending"].indexOf(step) > i ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs font-body font-medium ${step === s ? "text-foreground" : "text-muted-foreground"}`}>
                      {s === "amount" ? "Amount" : s === "payment" ? "Payment" : "Status"}
                    </span>
                  </div>
                  {i < 2 && <div className="h-px w-8 bg-border" />}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: Amount */}
              {step === "amount" && (
                <motion.div
                  key="amount"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                  className="card-premium p-8"
                >
                  <h2 className="font-heading text-2xl text-foreground mb-1">Investment Amount</h2>
                  <p className="text-sm font-body text-muted-foreground mb-8">
                    Enter how much you'd like to invest. Minimum ₹1.
                  </p>

                  <div className="space-y-5">
                    <div className="space-y-3 mb-6">
                      <Label className="font-body font-medium text-sm">Select Deposit Type</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            depositType === "saving"
                              ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                              : "border-border bg-card hover:border-primary/40"
                          }`}
                          onClick={() => setDepositType("saving")}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-heading font-bold text-foreground">Saving Deposit</h3>
                            <span className="text-sm font-body font-bold text-primary">7%</span>
                          </div>
                          <p className="text-xs font-body text-muted-foreground">Withdraw anytime</p>
                        </div>
                        <div
                          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            depositType === "fixed"
                              ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                              : "border-border bg-card hover:border-primary/40"
                          }`}
                          onClick={() => setDepositType("fixed")}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-heading font-bold text-foreground">Fixed Deposit</h3>
                            <span className="text-sm font-body font-bold text-primary">12%</span>
                          </div>
                          <p className="text-xs font-body text-muted-foreground">Locked for 1 year</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body font-medium text-sm" htmlFor="amount">
                        Amount (₹)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-heading font-bold text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          id="amount"
                          type="text"
                          inputMode="numeric"
                          placeholder="5,000"
                          value={amount}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setAmount(val);
                            setAmountError("");
                          }}
                          className="pl-8 h-14 text-xl font-heading font-bold rounded-xl border-border focus:border-primary"
                        />
                      </div>
                      {amountError && (
                        <p className="text-sm font-body text-destructive">{amountError}</p>
                      )}
                    </div>

                    {/* Quick amounts */}
                    <div className="flex flex-wrap gap-2">
                      {[1000, 2000, 5000, 10000, 25000].map((q) => (
                        <button
                          key={q}
                          onClick={() => { setAmount(String(q)); setAmountError(""); }}
                          className={`px-3.5 py-1.5 rounded-lg text-sm font-body font-medium border transition-colors ${
                            amount === String(q)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                          }`}
                        >
                          ₹{q.toLocaleString("en-IN")}
                        </button>
                      ))}
                    </div>

                    {amount && parseFloat(amount) >= 1 && (
                      <div className="rounded-2xl bg-accent border border-border p-4">
                        <p className="text-xs font-body text-muted-foreground mb-1">Estimated annual return</p>
                        <p className="text-2xl font-heading font-bold text-secondary">
                          ₹{Math.round(parseFloat(amount) * (depositType === "saving" ? 0.07 : 0.12)).toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs font-body text-muted-foreground mt-0.5">
                          at {depositType === "saving" ? "7%" : "12%"} per year · returns credited Daily
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleInvest}
                      disabled={razorpayLoading}
                      size="lg"
                      className="w-full h-13 text-base font-body font-medium rounded-xl group"
                    >
                      {razorpayLoading ? "Processing..." : "Proceed to Payment"}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: QR Payment */}
              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                  className="card-premium p-8 text-center"
                >
                  <h2 className="font-heading text-2xl text-foreground mb-4">Scan QR to Pay</h2>
                  <p className="text-sm font-body text-muted-foreground mb-6">
                    Scan this QR using any UPI app like GPay, PhonePe, or Paytm to pay <strong className="text-foreground font-bold">₹{parseFloat(amount).toLocaleString("en-IN")}</strong>
                  </p>

                  <div className="flex flex-col items-center justify-center mb-8">
                    <div className="p-6 bg-white rounded-3xl border-2 border-border shadow-soft mb-4">
                      <QRCodeSVG
                        value={`upi://pay?pa=${upiId}&pn=Zenvest&am=${amount}&cu=INR`}
                        size={200}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-xs font-body font-semibold border border-divider">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Amount auto-filled
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-sm font-body text-foreground">
                        Payment Done? Click confirm below. Our team will verify and approve your investment within 2 hours.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-xl font-body"
                        onClick={() => setStep("amount")}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1 h-12 rounded-xl font-body bg-secondary hover:bg-secondary/90 text-white"
                        onClick={handleConfirmPaid}
                        disabled={razorpayLoading}
                      >
                        {razorpayLoading ? "Submitting..." : "I Have Paid"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Pending confirmation */}
              {step === "pending" && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="card-premium p-10 text-center"
                >
                  <div className="h-16 w-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-8 w-8 text-amber-500" />
                  </div>
                  <h2 className="font-heading text-2xl text-foreground mb-3">
                    Investment Submitted!
                  </h2>
                  <p className="text-base font-body text-muted-foreground max-w-sm mx-auto leading-relaxed mb-6">
                    Your investment of{" "}
                    <strong className="text-foreground">₹{parseFloat(amount).toLocaleString("en-IN")}</strong>{" "}
                    is pending verification. It will show in your dashboard once approved.
                  </p>

                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-50 border border-amber-200 mb-8">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-body font-medium text-amber-700">Awaiting Verification</span>
                  </div>

                  <div className="rounded-2xl bg-accent border border-border p-5 mb-8 text-left space-y-3">
                    {[
                      { label: "Amount", value: `₹${parseFloat(amount).toLocaleString("en-IN")}` },
                      { label: "Status", value: "Pending" },
                      { label: "Est. Approval", value: "Within 2 hours" },
                    ].map((d) => (
                      <div key={d.label} className="flex items-center justify-between">
                        <span className="text-sm font-body text-muted-foreground">{d.label}</span>
                        <span className="text-sm font-body font-semibold text-foreground">{d.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/dashboard">
                      <Button className="rounded-xl font-body font-medium px-8 h-12">
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="rounded-xl font-body font-medium h-12"
                      onClick={() => { setStep("amount"); setAmount(""); setConfirmed(false); }}
                    >
                      Make Another Investment
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right — past investments sidebar */}
          <div className="lg:col-span-5">
            <div className="card-premium p-6">
              <h3 className="font-heading text-lg text-foreground mb-5">Your Investments</h3>
              <div className="space-y-3">
                {pastInvestments.map((inv) => {
                  const status = inv?.status || "pending";
                  const cfg = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={inv?._id || Math.random()}
                      className="rounded-2xl border border-border bg-background p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${cfg.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-body font-semibold text-foreground">
                            ₹{(inv?.amount || 0).toLocaleString("en-IN")}
                          </p>
                          <p className="text-xs font-body text-muted-foreground">{inv?.ref || "REF-ERROR"}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-body font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}

              </div>

              {/* Summary */}
              <div className="mt-6 pt-5 border-t border-border space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-body text-muted-foreground">Total Invested</span>
                  <span className="text-sm font-body font-bold text-foreground">₹{totalInvested.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-body text-muted-foreground">Est. Annual Return</span>
                  <span className="text-sm font-body font-bold text-secondary">₹{Math.round(estAnnualReturn).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-body text-muted-foreground">Pending</span>
                  <span className="text-sm font-body font-bold text-amber-600">₹{pendingAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Help card */}
            <div className="card-premium p-6 mt-4">
              <h3 className="font-heading text-base text-foreground mb-2">Need help?</h3>
              <p className="text-sm font-body text-muted-foreground leading-relaxed mb-4">
                If your payment is not showing up after 2 hours, contact our support team with your Reference ID.
              </p>
              <a
                href="mailto:support@growvest.in"
                className="text-sm font-body font-medium text-primary hover:underline"
              >
                support@growvest.in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default InvestPage;
