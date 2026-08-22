import {
  GoogleLogin,
  type CredentialResponse,
} from "@react-oauth/google";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate =
    useNavigate();

  const {
    loginWithGoogle,
  } = useAuth();

  const [error, setError] =
    useState("");

  const [loggingIn, setLoggingIn] =
    useState(false);

  const handleGoogleSuccess = async (
    response: CredentialResponse
  ) => {
    if (!response.credential) {
      setError(
        "Google did not return a credential."
      );
      return;
    }

    try {
      setError("");
      setLoggingIn(true);

      await loginWithGoogle(
        response.credential
      );

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      setError(
        "Unable to sign in with Google. Please try again."
      );
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <main className="theme-bg relative min-h-screen overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute left-1/2 top-1/3 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-fuchsia-500/[0.04] blur-[100px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10 lg:px-10">
        <div className="grid w-full gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* LEFT */}
          <section className="hidden lg:block">
            <div className="mb-8 inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-lg shadow-violet-500/20">
                <Mail size={21} />
              </div>

              <div>
                <p className="theme-text text-lg font-bold">
                  ReachInbox
                </p>

                <p className="theme-subtle text-[9px] font-semibold uppercase tracking-[0.25em]">
                  Outreach OS
                </p>
              </div>
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-500">
              Outreach command center
            </p>

            <h1 className="theme-text max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight xl:text-6xl">
              Turn every outreach
              <span className="block bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                into momentum.
              </span>
            </h1>

            <p className="theme-secondary mt-6 max-w-xl text-base leading-7">
              Plan campaigns, schedule deliveries,
              monitor your outreach and keep your
              communication pipeline moving from one
              command center.
            </p>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Zap,
                  title: "Smart scheduling",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure access",
                },
                {
                  icon: Sparkles,
                  title: "Clean analytics",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="theme-surface rounded-2xl border theme-border p-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Icon
                      size={18}
                      className="mb-3 text-violet-500"
                    />

                    <p className="theme-text text-sm font-semibold">
                      {item.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* LOGIN CARD */}
          <section className="mx-auto w-full max-w-md">
            <div className="theme-surface relative overflow-hidden rounded-[28px] border theme-border p-7 shadow-2xl shadow-black/10 sm:p-9">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />

              <div className="mb-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
                  <ArrowRight size={21} />
                </div>

                <h2 className="theme-text text-2xl font-bold">
                  Welcome back
                </h2>

                <p className="theme-secondary mt-2 text-sm leading-6">
                  Sign in to continue to your
                  ReachInbox workspace.
                </p>
              </div>

              <div className="rounded-2xl border theme-border bg-black/[0.02] p-4 dark:bg-white/[0.025]">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2
                    size={15}
                    className="text-emerald-500"
                  />

                  <span className="theme-secondary text-xs">
                    Secure Google authentication
                  </span>
                </div>

                <div className="flex justify-center">
                  {loggingIn ? (
                    <div className="flex h-10 items-center gap-2 text-sm">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />

                      <span className="theme-secondary">
                        Signing you in...
                      </span>
                    </div>
                  ) : (
                    <GoogleLogin
                      onSuccess={
                        handleGoogleSuccess
                      }
                      onError={() =>
                        setError(
                          "Google sign-in failed."
                        )
                      }
                      theme="outline"
                      size="large"
                      text="continue_with"
                      shape="pill"
                      width="320"
                    />
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              <p className="theme-subtle mt-7 text-center text-xs leading-5">
                By continuing, you agree to use
                ReachInbox responsibly and securely.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}