"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/eyebrow";

export default function ResetPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
      <div className="space-y-1.5 border-b border-border-hairline pb-4">
        <Eyebrow size="xs" variant="scan" prefix="// RECOVERY_PROTOCOL · ">
          CREDENTIAL_RESET
        </Eyebrow>
        <h1 className="font-display text-xl font-semibold tracking-tight text-text-primary">
          Reset Portal Access Password
        </h1>
        <p className="text-xs text-text-muted font-mono">
          Enter your registered work email to receive an authorized password recovery token.
        </p>
      </div>

      {isSubmitted ? (
        <div className="space-y-4">
          <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-2">
            <div className="flex items-center gap-2 font-display text-sm font-semibold text-signal-resolved">
              <CheckCircle2 className="h-4 w-4" />
              <span>Recovery Token Dispatched</span>
            </div>
            <p className="text-xs font-mono text-text-muted leading-relaxed">
              If an account exists for <strong className="text-text-primary">{email}</strong>, a cryptographically signed password reset link has been dispatched.
            </p>
          </div>

          <Link href="/auth/login">
            <Button variant="outline" className="w-full" size="md" leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}>
              Return to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-xs text-text-muted">WORK EMAIL</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="security@protocol.io"
              prefix={<Mail className="h-3.5 w-3.5 text-text-muted" />}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            size="md"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Send Recovery Token
          </Button>

          <div className="pt-2 text-center font-mono text-xs text-text-muted">
            <Link href="/auth/login" className="text-accent-scan hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
