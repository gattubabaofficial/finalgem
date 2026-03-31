"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

const BLOCKED_DOMAINS = [
  "mailinator.com","guerrillamail.com","tempmail.com","throwam.com",
  "yopmail.com","sharklasers.com","guerrillamailblock.com","grr.la",
  "guerrillamail.info","guerrillamail.biz","guerrillamail.de","guerrillamail.net",
  "guerrillamail.org","spam4.me","trashmail.com","trashmail.io","dispostable.com",
  "maildrop.cc","fakeinbox.com","discard.email","mailnull.com","spamgourmet.com",
  "spamgourmet.net","spamgourmet.org","trashmail.at","trashmail.me","trashmail.net",
  "dispostable.com","mailnull.com","0-mail.com","0815.ru","10minutemail.com",
  "10minutemail.net","20minutemail.com","tempinbox.com","getairmail.com",
];

function validateEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return "Please enter a valid email address.";
  const domain = trimmed.split("@")[1];
  if (BLOCKED_DOMAINS.includes(domain)) return "Disposable/temporary email addresses are not allowed.";
  return null;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("verified") === "true") {
        setSuccessMsg("Email successfully verified! You can now sign in.");
      }
    }
  }, []);

  function handleEmailBlur() {
    if (email) setEmailError(validateEmail(email) || "");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const emailErr = validateEmail(email);
    if (emailErr) { setEmailError(emailErr); return; }
    setEmailError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error || (result as any)?.code) {
      const errorString = String(result?.error || (result as any)?.code);
      if (errorString.includes("EMAIL_NOT_VERIFIED")) {
        setError("Your email address has not been verified yet. Please check your inbox and click the verification link before signing in.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "var(--gem-bg)",
    }}>
      {/* Left: Form */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "#fff",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
            <div style={{
              width: 40, height: 40,
              background: "linear-gradient(135deg, var(--gem-primary), var(--gem-info))",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--gem-text)" }}>Gem Inventory</span>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 700, color: "var(--gem-text)", marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: "var(--gem-text-secondary)", marginBottom: 32 }}>Sign in to your gemstone management account</p>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: 20 }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-control ${emailError ? "is-invalid" : email && !emailError ? "is-valid" : ""}`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                onBlur={handleEmailBlur}
                required
                autoComplete="email"
              />
              {emailError && <div className="invalid-feedback"><AlertCircle size={12} />{emailError}</div>}
              {email && !emailError && <div className="valid-feedback"><CheckCircle2 size={12} />Looks good!</div>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ borderRight: "none" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 14px",
                    background: "var(--gem-paper)",
                    border: "1px solid var(--gem-border)",
                    borderLeft: "none",
                    borderRadius: "0 var(--gem-radius-sm) var(--gem-radius-sm) 0",
                    cursor: "pointer",
                    color: "var(--gem-text-secondary)",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--gem-text)", cursor: "pointer" }}>
                <input type="checkbox" style={{ width: 16, height: 16, accentColor: "var(--gem-primary)" }} />
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", height: 44, fontSize: 14, fontWeight: 600 }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" style={{ marginRight: 8 }} />
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--gem-border)" }}>
            <p style={{ fontSize: 13.5, color: "var(--gem-text-secondary)", margin: 0 }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ fontWeight: 600, color: "var(--gem-primary)" }}>Sign up</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right: Decorative Panel */}
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #3b8aff 0%, #725AF2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        color: "#fff",
      }} className="d-none d-md-flex">
        {/* Decorative icon */}
        <div style={{
          width: 100, height: 100, borderRadius: 24,
          background: "rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 32,
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Gem Inventory</h2>
        <p style={{ fontSize: 15, opacity: 0.85, textAlign: "center", maxWidth: 340, lineHeight: 1.6 }}>
          Professional diamond and gemstone management system. Track purchases, manufacturing, sales and more.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: "Purchase", icon: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" },
            { label: "Sales", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
            { label: "Stock", icon: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" },
            { label: "Reports", icon: "M18 20V10M12 20V4M6 20v-6" },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 999,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(4px)",
              fontSize: 13, fontWeight: 600,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
