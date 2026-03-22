"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

// ── Blocked disposable/throwaway email domains ──
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

const DiamondLogo = () => (
  <svg className="text-primary icon-30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="-0.757324" y="19.2427" width="28" height="4" rx="2" transform="rotate(-45 -0.757324 19.2427)" fill="currentColor" />
    <rect x="7.72803" y="27.728" width="28" height="4" rx="2" transform="rotate(-45 7.72803 27.728)" fill="currentColor" />
    <rect x="10.5366" y="16.3945" width="16" height="4" rx="2" transform="rotate(45 10.5366 16.3945)" fill="currentColor" />
    <rect x="10.5562" y="-0.556152" width="28" height="4" rx="2" transform="rotate(45 10.5562 -0.556152)" fill="currentColor" />
  </svg>
);

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

    // Validate email before submitting
    const emailErr = validateEmail(email);
    if (emailErr) { setEmailError(emailErr); return; }
    setEmailError("");

    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      if (result.error.includes("EMAIL_NOT_VERIFIED")) {
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
    <div className="wrapper" suppressHydrationWarning>
      {loading && (
        <div id="loading">
          <div className="loader simple-loader"><div className="loader-body"></div></div>
        </div>
      )}

      <section className="login-content">
        <div className="row m-0 align-items-center bg-white vh-100">
          {/* ── Left: form ── */}
          <div className="col-md-6">
            <div className="row justify-content-center">
              <div className="col-md-10">
                <div className="card card-transparent shadow-none d-flex justify-content-center mb-0 auth-card">
                  <div className="card-body">
                    <a href="#" className="navbar-brand d-flex align-items-center mb-3">
                      <DiamondLogo />
                      <h4 className="logo-title ms-3">Gem Inventory</h4>
                    </a>

                    <h2 className="mb-2 text-center">Sign In</h2>
                    <p className="text-center text-muted">Login to your gemstone management account</p>

                    {error && (
                      <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                        <AlertCircle size={16} className="flex-shrink-0" /> {error}
                      </div>
                    )}

                    {successMsg && (
                      <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
                        <CheckCircle2 size={16} className="flex-shrink-0" /> {successMsg}
                      </div>
                    )}

                    <form onSubmit={handleLogin}>
                      <div className="row">
                        {/* Email */}
                        <div className="col-lg-12">
                          <div className="form-group">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                              type="email"
                              className={`form-control ${emailError ? "is-invalid" : email && !emailError ? "is-valid" : ""}`}
                              id="email"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                              onBlur={handleEmailBlur}
                              required
                              autoComplete="email"
                            />
                            {emailError && <div className="invalid-feedback d-flex align-items-center gap-1"><AlertCircle size={12} />{emailError}</div>}
                            {email && !emailError && <div className="valid-feedback d-flex align-items-center gap-1"><CheckCircle2 size={12} />Looks good!</div>}
                          </div>
                        </div>

                        {/* Password with eye toggle */}
                        <div className="col-lg-12">
                          <div className="form-group">
                            <label htmlFor="password" className="form-label">Password</label>
                            <div className="input-group">
                              <input
                                type={showPassword ? "text" : "password"}
                                className="form-control border-end-0"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary border-start-0"
                                onClick={() => setShowPassword((v) => !v)}
                                tabIndex={-1}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                              >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="col-lg-12 d-flex justify-content-between">
                          <div className="form-check mb-3">
                            <input type="checkbox" className="form-check-input" id="rememberMe" />
                            <label className="form-check-label" htmlFor="rememberMe">Remember Me</label>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-center">
                        <button type="submit" className="btn btn-primary px-5" disabled={loading}>
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                              Signing in…
                            </>
                          ) : "Sign In"}
                        </button>
                      </div>
                    </form>

                    <div className="mt-4 pt-3 border-top text-center">
                      <p className="mb-0">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-primary text-decoration-underline fw-bold">Sign up</Link>
                      </p>
                    </div>
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

          {/* ── Right: decorative panel ── */}
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
                Professional diamond &amp; gemstone management system. Track purchases, manufacturing, sales and more.
              </p>
              <div className="d-flex gap-3 mt-4 flex-wrap justify-content-center">
                {[{ label: "Purchase", icon: "💎" }, { label: "Sales", icon: "📈" }, { label: "Stock", icon: "📦" }, { label: "Reports", icon: "📊" }].map((item) => (
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
