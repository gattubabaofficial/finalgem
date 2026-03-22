import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseClient";
import nodemailer from "nodemailer";
import crypto from "crypto";

// ── Blocked disposable email domains ──
const BLOCKED_DOMAINS = [
  "mailinator.com","guerrillamail.com","tempmail.com","throwam.com",
  "yopmail.com","sharklasers.com","guerrillamail.info","guerrillamail.biz",
  "guerrillamail.de","guerrillamail.net","guerrillamail.org","spam4.me",
  "trashmail.com","trashmail.io","dispostable.com","maildrop.cc",
  "fakeinbox.com","discard.email","mailnull.com","spamgourmet.com",
  "spamgourmet.net","spamgourmet.org","trashmail.at","trashmail.me",
  "trashmail.net","0-mail.com","0815.ru","10minutemail.com",
  "10minutemail.net","20minutemail.com","tempinbox.com","getairmail.com",
  "grr.la","guerrillamailblock.com","temp-mail.org","tempr.email",
];

function validateEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return "Invalid email address format.";
  const domain = trimmed.split("@")[1];
  if (BLOCKED_DOMAINS.includes(domain)) return "Disposable or temporary email addresses are not allowed.";
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters long.";
  return null;
}

export async function POST(request: Request) {
  try {
    const { email, password, name, organizationName } = await request.json();

    if (!email || !password || !name || !organizationName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log("[register] Attempting registration for:", normalizedEmail);

    // ── Validation ──
    const emailErr = validateEmail(normalizedEmail);
    if (emailErr) {
      console.log("[register] Email validation failed:", emailErr);
      return NextResponse.json({ error: emailErr }, { status: 400 });
    }

    const pwErr = validatePassword(password);
    if (pwErr) {
      console.log("[register] Password validation failed:", pwErr);
      return NextResponse.json({ error: pwErr }, { status: 400 });
    }

    // ── Check if user already exists ──
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // ── 1. Create the organization ──
    const { data: newOrganization, error: orgErr } = await supabaseAdmin
      .from("organizations")
      .insert({ name: organizationName.trim() })
      .select()
      .single();

    if (orgErr) throw new Error(orgErr.message);

    // ── 2. Create the custom user record (is_verified = false) ──
    const hashedPassword = await bcrypt.hash(password, 12);
    // Generate a secure 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // We insert the user with is_verified defaults to false, and store the token
    const { error: userErr } = await supabaseAdmin.from("users").insert({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "ADMIN",
      organization_id: newOrganization.id,
      is_verified: false,
      verification_token: otpCode,
    });

    if (userErr) {
      // Best-effort rollback
      await supabaseAdmin.from("organizations").delete().eq("id", newOrganization.id);
      throw new Error(userErr.message);
    }

    // ── 3. Send Verification Email via Nodemailer ──
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: `"Gem Inventory" <${process.env.GMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Your Verification Code - Gem Inventory",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #3b8aff; text-align: center;">Gem Inventory</h2>
          <p>Hi ${name.trim()},</p>
          <p>Thank you for registering. Please use the following 6-digit verification code to complete your signup:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #f3f4f6; color: #111; padding: 16px 32px; font-size: 32px; letter-spacing: 4px; border-radius: 8px; font-weight: bold; border: 1px solid #ddd; display: inline-block;">
              ${otpCode}
            </span>
          </div>
          <p>Enter this code on the registration page to verify your email address. It is valid for a limited time.</p>
          <p style="color: grey; font-size: 13px;">If you did not request this, please safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        message: "Registration successful. Please check your email to verify your account before signing in.",
        organization: newOrganization.name,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
