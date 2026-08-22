import { useState } from "react";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Mail,
  Plus,
  Send,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";

import ComposeCampaignModal from "../components/campaign/ComposeCampaignModal";

export default function Dashboard() {
  const [composerOpen, setComposerOpen] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleCampaignCreated = () => {
    setRefreshKey((current) => current + 1);
  };

  return (
    <>
      <main className="theme-bg min-h-full">
        <div className="mx-auto max-w-7xl px-8 py-8">
          {/* HEADER */}
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-lg bg-violet-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-violet-500">
                  Workspace
                </span>

                <span className="theme-muted text-[10px]">
                  Email operations
                </span>
              </div>

              <h1 className="theme-text text-3xl font-bold tracking-tight">
                Good to see you.
              </h1>

              <p className="theme-secondary mt-2 max-w-xl text-sm leading-6">
                Manage your campaigns, monitor scheduled
                deliveries and keep your outreach moving.
              </p>
            </div>

            {/* COMPOSE */}
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30 active:translate-y-0"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full" />

              <Plus
                size={15}
                className="relative transition-transform duration-200 group-hover:rotate-90"
              />

              <span className="relative">
                Compose new email
              </span>
            </button>
          </div>

          {/* QUICK CREATE BANNER */}
          <section className="relative mb-7 overflow-hidden rounded-3xl border theme-border bg-gradient-to-br from-violet-500/[0.09] via-fuchsia-500/[0.04] to-cyan-500/[0.07] p-6">
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
                  <Sparkles size={19} />
                </div>

                <div>
                  <h2 className="theme-text text-sm font-bold">
                    Ready to send something?
                  </h2>

                  <p className="theme-secondary mt-1 max-w-xl text-xs leading-5">
                    Create a campaign, choose your recipients
                    and let the scheduler handle delivery
                    automatically.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setComposerOpen(true)}
                className="group flex shrink-0 items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-xs font-semibold text-violet-500 transition duration-200 hover:-translate-y-0.5 hover:border-violet-500/30 hover:bg-violet-500/15"
              >
                <Send
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />

                Start campaign

                <ArrowUpRight
                  size={13}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </section>

          {/* STATISTICS */}
          <div
            key={refreshKey}
            className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <StatCard
              icon={<Send size={17} />}
              label="Emails sent"
              value="124"
              description="Across all campaigns"
              iconClass="bg-violet-500/10 text-violet-500"
            />

            <StatCard
              icon={<CalendarClock size={17} />}
              label="Scheduled"
              value="87"
              description="Waiting for delivery"
              iconClass="bg-cyan-500/10 text-cyan-500"
            />

            <StatCard
              icon={<CheckCircle2 size={17} />}
              label="Delivered"
              value="98.4%"
              description="Successful deliveries"
              iconClass="bg-emerald-500/10 text-emerald-500"
            />

            <StatCard
              icon={<Activity size={17} />}
              label="Active campaigns"
              value="31"
              description="Currently running"
              iconClass="bg-fuchsia-500/10 text-fuchsia-500"
            />
          </div>

          {/* MAIN CONTENT */}
          <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            {/* RECENT ACTIVITY */}
            <section className="theme-surface overflow-hidden rounded-3xl border theme-border">
              <div className="flex items-center justify-between border-b theme-border px-6 py-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity
                      size={15}
                      className="text-violet-500"
                    />

                    <h2 className="theme-text text-sm font-bold">
                      Recent activity
                    </h2>
                  </div>

                  <p className="theme-muted mt-1 text-[10px]">
                    Latest email operations
                  </p>
                </div>

                <button
                  type="button"
                  className="theme-muted flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition hover:bg-black/[0.04] hover:text-violet-500 dark:hover:bg-white/[0.04]"
                >
                  View all
                  <ArrowUpRight size={11} />
                </button>
              </div>

              <div className="divide-y theme-border">
                <ActivityRow
                  icon={<CheckCircle2 size={15} />}
                  iconClass="bg-emerald-500/10 text-emerald-500"
                  title="Campaign delivered"
                  description="Product launch campaign"
                  time="Just now"
                  status="Delivered"
                />

                <ActivityRow
                  icon={<Clock3 size={15} />}
                  iconClass="bg-cyan-500/10 text-cyan-500"
                  title="Campaign scheduled"
                  description="August outreach sequence"
                  time="12 min ago"
                  status="Scheduled"
                />

                <ActivityRow
                  icon={<Send size={15} />}
                  iconClass="bg-violet-500/10 text-violet-500"
                  title="Email sent"
                  description="hello@example.com"
                  time="28 min ago"
                  status="Sent"
                />

                <ActivityRow
                  icon={<XCircle size={15} />}
                  iconClass="bg-red-500/10 text-red-500"
                  title="Delivery failed"
                  description="Invalid recipient address"
                  time="1 hr ago"
                  status="Failed"
                />
              </div>
            </section>

            {/* PERFORMANCE */}
            <section className="theme-surface overflow-hidden rounded-3xl border theme-border">
              <div className="border-b theme-border px-6 py-5">
                <div className="flex items-center gap-2">
                  <BarChart3
                    size={15}
                    className="text-violet-500"
                  />

                  <h2 className="theme-text text-sm font-bold">
                    Delivery performance
                  </h2>
                </div>

                <p className="theme-muted mt-1 text-[10px]">
                  Current campaign health
                </p>
              </div>

              <div className="space-y-5 p-6">
                <PerformanceRow
                  label="Delivered"
                  value="98.4%"
                  progress={98.4}
                  className="bg-emerald-500"
                />

                <PerformanceRow
                  label="Scheduled"
                  value="87"
                  progress={72}
                  className="bg-cyan-500"
                />

                <PerformanceRow
                  label="Failed"
                  value="1.6%"
                  progress={1.6}
                  className="bg-red-500"
                />

                <div className="mt-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                      <Sparkles size={14} />
                    </div>

                    <div>
                      <p className="theme-text text-xs font-semibold">
                        Looking healthy
                      </p>

                      <p className="theme-secondary mt-1 text-[10px] leading-5">
                        Your delivery pipeline is operating
                        within the configured limits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* QUICK ACTIONS */}
          <section className="mt-6">
            <div className="mb-3">
              <h2 className="theme-text text-sm font-bold">
                Quick actions
              </h2>

              <p className="theme-muted mt-1 text-[10px]">
                Common workspace actions
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <QuickAction
                icon={<Send size={17} />}
                title="Compose email"
                description="Create a new campaign"
                onClick={() => setComposerOpen(true)}
              />

              <QuickAction
                icon={<CalendarClock size={17} />}
                title="Scheduled"
                description="View upcoming emails"
              />

              <QuickAction
                icon={<Mail size={17} />}
                title="Sent emails"
                description="Review delivery history"
              />

              <QuickAction
                icon={<Users size={17} />}
                title="Recipients"
                description="Manage your audience"
              />
            </div>
          </section>
        </div>
      </main>

      {/* CAMPAIGN COMPOSER */}
      <ComposeCampaignModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreated={handleCampaignCreated}
      />
    </>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon,
  label,
  value,
  description,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="theme-surface group rounded-2xl border theme-border p-5 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
      <div
        className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl transition duration-200 group-hover:scale-110 ${iconClass}`}
      >
        {icon}
      </div>

      <p className="theme-muted text-[9px] font-semibold uppercase tracking-[0.14em]">
        {label}
      </p>

      <p className="theme-text mt-1 text-2xl font-bold tracking-tight">
        {value}
      </p>

      <p className="theme-muted mt-1 text-[10px]">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   ACTIVITY ROW
============================================================ */

function ActivityRow({
  icon,
  iconClass,
  title,
  description,
  time,
  status,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  description: string;
  time: string;
  status: string;
}) {
  return (
    <div className="group flex items-center gap-4 px-6 py-4 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="theme-text truncate text-xs font-semibold">
          {title}
        </p>

        <p className="theme-muted mt-0.5 truncate text-[10px]">
          {description}
        </p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="theme-muted text-[9px]">
          {time}
        </p>

        <p className="mt-1 text-[9px] font-semibold text-violet-500">
          {status}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   PERFORMANCE ROW
============================================================ */

function PerformanceRow({
  label,
  value,
  progress,
  className,
}: {
  label: string;
  value: string;
  progress: number;
  className: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="theme-secondary text-[10px] font-medium">
          {label}
        </span>

        <span className="theme-text text-[10px] font-bold">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.05]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${className}`}
          style={{
            width: `${Math.min(
              Math.max(progress, 0),
              100
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="theme-surface group flex items-center gap-3 rounded-2xl border theme-border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-violet-500/20 hover:shadow-lg hover:shadow-black/5"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 transition duration-200 group-hover:scale-110 group-hover:bg-violet-500 group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="theme-text text-xs font-semibold">
          {title}
        </p>

        <p className="theme-muted mt-1 truncate text-[9px]">
          {description}
        </p>
      </div>

      <ArrowUpRight
        size={13}
        className="theme-muted ml-auto shrink-0 transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-500"
      />
    </button>
  );
}