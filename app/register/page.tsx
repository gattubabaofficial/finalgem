"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, ShieldAlert, Mail } from "lucide-react";

const BLOCKED_DOMAINS = [
  "mailinator.com","guerrillamail.com","tempmail.com","throwam.com","yopmail.com",
  "sharklasers.com","guerrillamail.info","guerrillamail.biz","guerrillamail.de",
  "guerrillamail.net","guerrillamail.org","spam4.me","trashmail.com","trashmail.io",
  "dispostable.com","maildrop.cc","fakeinbox.com","discard.email","mailnull.com",
  "spamgourmet.com","spamgourmet.net","spamgourmet.org","trashmail.at","trashmail.me",
  "trashmail.net","0-mail.com","0815.ru","10minutemail.com","10minutemail.net",
  "20minutemail.com","tempinbox.com","getairmail.com","grr.la","guerrillamailblock.com",
  "temp-mail.org","tempr.email",
];

function validateEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return "Please enter a valid email address.";
  const domain = trimmed.split("@")[1];
  if (BLOCKED_DOMAINS.includes(domain)) return "Disposable or temporary email addresses are not allowed.";
  return null;
}

function getPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const labels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["", "#F8285A", "#fd7e14", "#F6C000", "#2cd07e", "#3b8aff"];
  return { score, label: labels[score] || "", color: colors[score] || "", checks };
}

export default function RegisterPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  function handleEmailBlur() {
    if (email) setEmailError(validateEmail(email) || "");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const emailErr = validateEmail(email);
    if (emailErr) { setEmailError(emailErr); return; }
    setEmailError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, organizationName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return; }
      setSuccess(true);
      setLoading(false);
    } catch {
      setError("A network error occurred.");
      setLoading(false);
    }
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Verification failed. Please check the code."); setLoading(false); return; }
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        router.push("/login?verified=true");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("A network error occurred. Please try again.");
      setLoading(false);
    }
  }

  const f = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => setter(e.target.value);

  const eyeToggleStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "0 14px",
    background: "var(--gem-paper)",
    border: "1px solid var(--gem-border)",
    borderLeft: "none",
    borderRadius: "0 var(--gem-radius-sm) var(--gem-radius-sm) 0",
    cursor: "pointer",
    color: "var(--gem-text-secondary)",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--gem-bg)" }}>
      {/* Left: Form */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "#fff",
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
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

          {success ? (
            /* STEP 2: OTP */
            <div>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "var(--gem-primary-light)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "var(--gem-primary)",
                }}>
                  <Mail size={28} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Check your email</h2>
                <p style={{ fontSize: 14, color: "var(--gem-text-secondary)" }}>
                  We&apos;ve sent a 6-digit code to<br /><strong style={{ color: "var(--gem-text)" }}>{email}</strong>
                </p>
              </div>

              {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}><AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}</div>}

              <form onSubmit={handleVerifySubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ textAlign: "center", display: "block" }}>Enter Verification Code</label>
                  <input
                    type="text"
                    className="form-control"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ textAlign: "center", letterSpacing: 8, fontSize: 24, fontWeight: 700, padding: "14px" }}
                  />
                  <div style={{ fontSize: 12, color: "var(--gem-text-secondary)", textAlign: "center", marginTop: 8 }}>Check your spam folder if you don&apos;t see it.</div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading || verificationCode.length < 6} style={{ width: "100%", height: 44, fontWeight: 600 }}>
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
              </form>
            </div>
          ) : (
            /* STEP 1: Register */
            <>
              <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Create Account</h2>
              <p style={{ fontSize: 14, color: "var(--gem-text-secondary)", marginBottom: 28 }}>Set up your organization and admin account</p>

              {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}><AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}</div>}

              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Company / Organization Name</label>
                  <input type="text" className="form-control" placeholder="e.g. Acme Gems Inc." value={organizationName} onChange={f(setOrganizationName)} required />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Your Full Name</label>
                  <input type="text" className="form-control" placeholder="e.g. John Doe" value={name} onChange={f(setName)} required />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className={`form-control ${emailError ? "is-invalid" : email && !emailError ? "is-valid" : ""}`}
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                    onBlur={handleEmailBlur}
                    required autoComplete="email"
                  />
                  {emailError && <div className="invalid-feedback"><AlertCircle size={12} />{emailError}</div>}
                  {email && !emailError && <div className="valid-feedback"><CheckCircle2 size={12} />Looks good!</div>}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input type={showPassword ? "text" : "password"} className="form-control" placeholder="Create a strong password" value={password} onChange={f(setPassword)} required autoComplete="new-password" style={{ borderRight: "none" }} />
                    <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1} style={eyeToggleStyle}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{ height: 3, flex: 1, borderRadius: 3, backgroundColor: i <= strength.score ? strength.color : "#e2e8f0", transition: "background-color 0.3s" }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 12, color: strength.color, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        {strength.score >= 3 ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                        {strength.label}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                        {[
                          { key: "length", label: "8+ chars" },
                          { key: "uppercase", label: "Uppercase" },
                          { key: "lowercase", label: "Lowercase" },
                          { key: "number", label: "Number" },
                          { key: "special", label: "Special" },
                        ].map(({ key, label }) => (
                          <span key={key} className="badge" style={{
                            background: (strength.checks as any)[key] ? "var(--gem-success-light)" : "var(--gem-bg)",
                            color: (strength.checks as any)[key] ? "var(--gem-success)" : "var(--gem-text-secondary)",
                            border: `1px solid ${(strength.checks as any)[key] ? "rgba(44,208,126,0.2)" : "var(--gem-border)"}`,
                            fontSize: 11,
                          }}>
                            {(strength.checks as any)[key] ? "+" : "-"} {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Confirm Password</label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`form-control ${passwordsMismatch ? "is-invalid" : passwordsMatch ? "is-valid" : ""}`}
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={f(setConfirmPassword)}
                      required autoComplete="new-password"
                      style={{ borderRight: "none" }}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)} tabIndex={-1} style={eyeToggleStyle}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordsMismatch && <div className="invalid-feedback" style={{ display: "flex" }}><AlertCircle size={12} />Passwords do not match.</div>}
                  {passwordsMatch && <div className="valid-feedback" style={{ display: "flex" }}><CheckCircle2 size={12} />Passwords match.</div>}
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 20, cursor: "pointer" }}>
                  <input type="checkbox" required style={{ width: 16, height: 16, accentColor: "var(--gem-primary)" }} />
                  I agree with the terms of use
                </label>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", height: 44, fontWeight: 600 }}>
                  {loading ? <><span className="spinner-border spinner-border-sm" style={{ marginRight: 8 }} />Creating account...</> : "Sign Up"}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--gem-border)" }}>
                <p style={{ fontSize: 13.5, color: "var(--gem-text-secondary)", margin: 0 }}>
                  Already have an account?{" "}
                  <Link href="/login" style={{ fontWeight: 600, color: "var(--gem-primary)" }}>Sign in</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Decorative */}
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
          Get started organizing your inventory in minutes. Multiple warehouses, strict ledger tracking, and instant reports.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: "Fast Setup", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8" },
            { label: "Secure", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
            { label: "Scalable", icon: "M18 20V10M12 20V4M6 20v-6" },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 999,
              background: "rgba(255,255,255,0.15)",
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
