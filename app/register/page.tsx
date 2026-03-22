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
  const colors = ["", "#dc3545", "#fd7e14", "#ffc107", "#198754", "#0d6efd"];
  return { score, label: labels[score] || "", color: colors[score] || "", checks };
}

const DiamondLogo = () => (
  <svg className="text-primary icon-30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="-0.757324" y="19.2427" width="28" height="4" rx="2" transform="rotate(-45 -0.757324 19.2427)" fill="currentColor" />
    <rect x="7.72803" y="27.728" width="28" height="4" rx="2" transform="rotate(-45 7.72803 27.728)" fill="currentColor" />
    <rect x="10.5366" y="16.3945" width="16" height="4" rx="2" transform="rotate(45 10.5366 16.3945)" fill="currentColor" />
    <rect x="10.5562" y="-0.556152" width="28" height="4" rx="2" transform="rotate(45 10.5562 -0.556152)" fill="currentColor" />
  </svg>
);

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
  
  // ── OTP State ──
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
      
      // Move to Step 2: OTP Entry
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

      if (!res.ok) {
        setError(data.error || "Verification failed. Please check the code.");
        setLoading(false);
        return;
      }

      // Verification successful! Automatically log the user in.
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

  return (
    <div className="wrapper" suppressHydrationWarning>
      {loading && <div id="loading"><div className="loader simple-loader"><div className="loader-body"></div></div></div>}
      <section className="login-content">
        <div className="row m-0 align-items-center bg-white vh-100">

          {/* ── Left panel ── */}
          <div className="col-md-6 overflow-auto" style={{ maxHeight: "100vh" }}>
            <div className="row justify-content-center">
              <div className="col-md-10">
                <div className="card card-transparent shadow-none d-flex justify-content-center mb-0 auth-card py-4">
                  <div className="card-body">

                    <a href="#" className="navbar-brand d-flex align-items-center mb-3">
                      <DiamondLogo />
                      <h4 className="logo-title ms-3">Gem Inventory</h4>
                    </a>

                    {success ? (
                      /* ── STEP 2: EMAIL VERIFICATION (OTP) ── */
                      <div className="py-2">
                        <div className="text-center mb-4">
                          <div className="mb-3 d-inline-block bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: 64, height: 64 }}>
                            <Mail size={32} />
                          </div>
                          <h3 className="fw-bold mb-2">Check your email</h3>
                          <p className="text-muted">
                            We've sent a 6-digit verification code to<br />
                            <strong>{email}</strong>
                          </p>
                        </div>

                        {error && (
                          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                            <AlertCircle size={16} className="flex-shrink-0" /> {error}
                          </div>
                        )}

                        <form onSubmit={handleVerifySubmit}>
                          <div className="form-group mb-4">
                            <label htmlFor="otpCode" className="form-label text-center d-block">Enter Verification Code</label>
                            <input 
                              type="text" 
                              className="form-control text-center form-control-lg fw-bold" 
                              id="otpCode"
                              maxLength={6}
                              placeholder="000000" 
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} 
                              required 
                              style={{ letterSpacing: '8px', fontSize: '24px' }}
                            />
                            <div className="form-text text-center mt-2">Check your spam folder if you don't see it.</div>
                          </div>

                          <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-sm" disabled={loading || verificationCode.length < 6}>
                            {loading ? "Verifying..." : "Verify & Sign In"}
                          </button>
                        </form>
                      </div>
                    ) : (
                      /* ── STEP 1: REGISTRATION FORM ── */
                      <>
                        <h2 className="mb-2 text-center">Sign Up</h2>
                        <p className="text-center text-muted">Create your organization and admin account</p>

                        {error && (
                          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                            <AlertCircle size={16} className="flex-shrink-0" /> {error}
                          </div>
                        )}

                        <form onSubmit={handleRegister}>
                          <div className="row">
                            {/* Organization */}
                            <div className="col-lg-12">
                              <div className="form-group">
                                <label htmlFor="organizationName" className="form-label">Company / Organization Name</label>
                                <input type="text" className="form-control" id="organizationName"
                                  placeholder="e.g. Acme Gems Inc." value={organizationName}
                                  onChange={f(setOrganizationName)} required />
                              </div>
                            </div>

                            {/* Full Name */}
                            <div className="col-lg-12">
                              <div className="form-group">
                                <label htmlFor="name" className="form-label">Your Full Name</label>
                                <input type="text" className="form-control" id="name"
                                  placeholder="e.g. John Doe" value={name}
                                  onChange={f(setName)} required />
                              </div>
                            </div>

                            {/* Email */}
                            <div className="col-lg-12">
                              <div className="form-group">
                                <label htmlFor="email" className="form-label">Email Address</label>
                                <input
                                  type="email"
                                  className={`form-control ${emailError ? "is-invalid" : email && !emailError ? "is-valid" : ""}`}
                                  id="email" placeholder="admin@company.com" value={email}
                                  onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                                  onBlur={handleEmailBlur} required autoComplete="email"
                                />
                                {emailError && <div className="invalid-feedback d-flex align-items-center gap-1"><AlertCircle size={12} />{emailError}</div>}
                                {email && !emailError && <div className="valid-feedback d-flex align-items-center gap-1"><CheckCircle2 size={12} />Looks good!</div>}
                              </div>
                            </div>

                            {/* Password */}
                            <div className="col-lg-12">
                              <div className="form-group">
                                <label htmlFor="password" className="form-label">Password</label>
                                <div className="input-group">
                                  <input type={showPassword ? "text" : "password"} className="form-control border-end-0"
                                    id="password" placeholder="Create a strong password" value={password}
                                    onChange={f(setPassword)} required autoComplete="new-password" />
                                  <button type="button" className="btn btn-outline-secondary border-start-0"
                                    onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                                {password && (
                                  <div className="mt-2">
                                    <div className="d-flex gap-1 mb-1">
                                      {[1,2,3,4,5].map(i => (
                                        <div key={i} style={{ height: 4, flex: 1, borderRadius: 4,
                                          backgroundColor: i <= strength.score ? strength.color : "#dee2e6",
                                          transition: "background-color 0.3s" }} />
                                      ))}
                                    </div>
                                    <small style={{ color: strength.color }} className="fw-semibold d-flex align-items-center gap-1">
                                      {strength.score >= 3 ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                      {strength.label}
                                    </small>
                                    <div className="mt-1 d-flex flex-wrap gap-2">
                                      {[
                                        { key: "length", label: "8+ chars" },
                                        { key: "uppercase", label: "Uppercase" },
                                        { key: "lowercase", label: "Lowercase" },
                                        { key: "number", label: "Number" },
                                        { key: "special", label: "Special char" },
                                      ].map(({ key, label }) => (
                                        <span key={key} className={`badge ${(strength.checks as any)[key] ? "bg-success" : "bg-light text-muted border"}`} style={{ fontSize: "0.7rem" }}>
                                          {(strength.checks as any)[key] ? "✓" : "○"} {label}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="col-lg-12">
                              <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                <div className="input-group">
                                  <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className={`form-control border-end-0 ${passwordsMismatch ? "is-invalid" : passwordsMatch ? "is-valid" : ""}`}
                                    id="confirmPassword" placeholder="Repeat password" value={confirmPassword}
                                    onChange={f(setConfirmPassword)} required autoComplete="new-password"
                                  />
                                  <button type="button"
                                    className={`btn btn-outline-secondary border-start-0 ${passwordsMismatch ? "border-danger" : passwordsMatch ? "border-success" : ""}`}
                                    onClick={() => setShowConfirmPassword(v => !v)} tabIndex={-1}>
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                                {passwordsMismatch && <div className="invalid-feedback d-block d-flex align-items-center gap-1"><AlertCircle size={12} />Passwords do not match.</div>}
                                {passwordsMatch && <div className="valid-feedback d-block d-flex align-items-center gap-1"><CheckCircle2 size={12} />Passwords match.</div>}
                              </div>
                            </div>

                            {/* Terms */}
                            <div className="col-lg-12 d-flex justify-content-center mt-2">
                              <div className="form-check mb-3">
                                <input type="checkbox" className="form-check-input" id="customCheck1" required />
                                <label className="form-check-label" htmlFor="customCheck1">I agree with the terms of use</label>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex justify-content-center">
                            <button type="submit" className="btn btn-primary px-5" disabled={loading}>
                              {loading
                                ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Creating account…</>
                                : "Sign Up"}
                            </button>
                          </div>
                        </form>

                        <div className="mt-4 pt-3 border-top text-center">
                          <p className="mb-0">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary text-decoration-underline fw-bold">Sign in</Link>
                          </p>
                        </div>
                      </>
                    )}

                  </div>
                </div>
              </div>
            </div>

            <div className="sign-bg">
              <svg width="280" height="230" viewBox="0 0 431 398" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.05">
                  <rect x="-157.085" y="193.773" width="543" height="77.5714" rx="38.7857" transform="rotate(-45 -157.085 193.773)" fill="#3B8AFF" />
                  <rect x="7.46875" y="358.327" width="543" height="77.5714" rx="38.7857" transform="rotate(-45 7.46875 358.327)" fill="#3B8AFF" />
                  <rect x="61.9355" y="138.545" width="310.286" height="77.5714" rx="38.7857" transform="rotate(45 61.9355 138.545)" fill="#3B8AFF" />
                  <rect x="62.3154" y="-190.173" width="543" height="77.5714" rx="38.7857" transform="rotate(45 62.3154 -190.173)" fill="#3B8AFF" />
                </g>
              </svg>
            </div>
          </div>

          {/* ── Right decorative panel ── */}
          <div className="col-md-6 d-md-block d-none bg-primary p-0 mt-n1 vh-100 overflow-hidden">
            <div className="d-flex flex-column align-items-center justify-content-center h-100 p-5 text-white"
              style={{ background: "linear-gradient(135deg,#3b8aff 0%,#5e60ce 100%)" }}>
              <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 120, height: 120, opacity: 0.25, marginBottom: 32 }}>
                <rect x="-0.757324" y="19.2427" width="28" height="4" rx="2" transform="rotate(-45 -0.757324 19.2427)" fill="white" />
                <rect x="7.72803" y="27.728" width="28" height="4" rx="2" transform="rotate(-45 7.72803 27.728)" fill="white" />
                <rect x="10.5366" y="16.3945" width="16" height="4" rx="2" transform="rotate(45 10.5366 16.3945)" fill="white" />
                <rect x="10.5562" y="-0.556152" width="28" height="4" rx="2" transform="rotate(45 10.5562 -0.556152)" fill="white" />
              </svg>
              <h2 className="text-white fw-bold mb-3">Gem Inventory</h2>
              <p className="text-center" style={{ opacity: 0.8, maxWidth: 320 }}>
                Get started organizing your inventory in minutes. Multiple warehouses, strict ledger tracking, and instant reports.
              </p>
              <div className="d-flex gap-3 mt-4 flex-wrap justify-content-center">
                {[{ label: "Fast Setup", icon: "🚀" }, { label: "Secure", icon: "🔒" }, { label: "Scalable", icon: "📈" }].map((item) => (
                  <div key={item.label} className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                    style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                    <span>{item.icon}</span>
                    <span className="fw-semibold small">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
