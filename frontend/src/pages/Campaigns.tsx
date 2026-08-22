import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Mail,
  Plus,
  RefreshCw,
  Send,
  Users,
  XCircle,
} from "lucide-react";

import api from "../lib/api";

import ComposeCampaignModal from "../components/campaign/ComposeCampaignModal";

/* ============================================================
   TYPES
============================================================ */

type EmailStatus =
  | "SCHEDULED"
  | "PROCESSING"
  | "SENT"
  | "FAILED";

interface CampaignEmail {
  id: string;
  recipient: string;
  status: EmailStatus;
  scheduledAt: string;
  sentAt: string | null;
}

interface Campaign {
  id: string;
  userId: string;
  subject: string;
  body: string;
  startTime: string;
  delayMs: number;
  hourlyLimit: number;
  createdAt: string;
  updatedAt?: string;
  emails: CampaignEmail[];
}

/* ============================================================
   HELPERS
============================================================ */

function formatDate(
  value: string
) {
  try {
    return new Date(
      value
    ).toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  } catch {
    return value;
  }
}

function getCampaignStats(
  emails: CampaignEmail[]
) {
  return {
    total: emails.length,

    scheduled: emails.filter(
      (email) =>
        email.status ===
        "SCHEDULED"
    ).length,

    processing: emails.filter(
      (email) =>
        email.status ===
        "PROCESSING"
    ).length,

    sent: emails.filter(
      (email) =>
        email.status === "SENT"
    ).length,

    failed: emails.filter(
      (email) =>
        email.status === "FAILED"
    ).length,
  };
}

/* ============================================================
   PAGE
============================================================ */

export default function Campaigns() {
  const [campaigns, setCampaigns] =
    useState<Campaign[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [composerOpen, setComposerOpen] =
    useState(false);

  /* ==========================================================
     FETCH CAMPAIGNS
  ========================================================== */

  const fetchCampaigns =
    useCallback(async () => {
      try {
        setError(null);

        const response =
          await api.get(
            "/emails/campaigns"
          );

        const data =
          response.data;

        if (
          Array.isArray(
            data?.campaigns
          )
        ) {
          setCampaigns(
            data.campaigns
          );
        } else {
          setCampaigns([]);
        }
      } catch (error: any) {
        console.error(
          "Failed to load campaigns:",
          error
        );

        const status =
          error?.response?.status;

        const message =
          error?.response?.data
            ?.error;

        if (status === 401) {
          setError(
            "Your session has expired. Please sign in again."
          );
        } else if (status === 403) {
          setError(
            "You do not have permission to view these campaigns."
          );
        } else if (status === 404) {
          setError(
            "Campaign API endpoint was not found."
          );
        } else if (status >= 500) {
          setError(
            "The server encountered an error while loading campaigns."
          );
        } else {
          setError(
            message ??
              "Unable to load campaigns."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await fetchCampaigns();
    };

  /* ==========================================================
     CAMPAIGN CREATED
  ========================================================== */

  const handleCampaignCreated =
    async () => {
      setComposerOpen(false);

      await fetchCampaigns();
    };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <main className="theme-bg min-h-full">
        <div className="mx-auto max-w-7xl px-8 py-8">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-lg bg-violet-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-violet-500">
                  Outreach
                </span>

                <span className="theme-muted text-[10px]">
                  Campaign management
                </span>
              </div>

              <h1 className="theme-text text-3xl font-bold tracking-tight">
                Campaigns
              </h1>

              <p className="theme-secondary mt-2 max-w-xl text-sm leading-6">
                Create, schedule and monitor
                your email campaigns from one
                workspace.
              </p>
            </div>

            <div className="flex items-center gap-2">

              {/* REFRESH */}

              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  refreshing
                }
                className="theme-surface theme-text flex items-center gap-2 rounded-xl border theme-border px-4 py-3 text-xs font-semibold transition hover:border-violet-500/20 hover:text-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              {/* CREATE */}

              <button
                type="button"
                onClick={() =>
                  setComposerOpen(
                    true
                  )
                }
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/25"
              >
                <Plus
                  size={15}
                  className="transition-transform group-hover:rotate-90"
                />

                Create campaign
              </button>
            </div>
          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <XCircle
                size={17}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div className="flex-1">
                <p className="theme-text text-xs font-semibold">
                  Unable to load campaigns
                </p>

                <p className="theme-secondary mt-1 text-[10px] leading-5">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    handleRefresh
                  }
                  className="mt-3 text-[10px] font-bold text-violet-500 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (
            <CampaignSkeleton />
          ) : campaigns.length ===
            0 ? (
            <EmptyCampaignState
              onCreate={() =>
                setComposerOpen(
                  true
                )
              }
            />
          ) : (
            <>
              {/* ==================================================
                  SUMMARY
              ================================================== */}

              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  icon={
                    <Mail
                      size={16}
                    />
                  }
                  label="Campaigns"
                  value={
                    campaigns.length
                  }
                  className="bg-violet-500/10 text-violet-500"
                />

                <SummaryCard
                  icon={
                    <Users
                      size={16}
                    />
                  }
                  label="Recipients"
                  value={campaigns.reduce(
                    (
                      total,
                      campaign
                    ) =>
                      total +
                      campaign
                        .emails
                        .length,
                    0
                  )}
                  className="bg-cyan-500/10 text-cyan-500"
                />

                <SummaryCard
                  icon={
                    <CheckCircle2
                      size={16}
                    />
                  }
                  label="Sent"
                  value={campaigns.reduce(
                    (
                      total,
                      campaign
                    ) =>
                      total +
                      getCampaignStats(
                        campaign
                          .emails
                      ).sent,
                    0
                  )}
                  className="bg-emerald-500/10 text-emerald-500"
                />

                <SummaryCard
                  icon={
                    <Clock3
                      size={16}
                    />
                  }
                  label="Scheduled"
                  value={campaigns.reduce(
                    (
                      total,
                      campaign
                    ) =>
                      total +
                      getCampaignStats(
                        campaign
                          .emails
                      ).scheduled,
                    0
                  )}
                  className="bg-fuchsia-500/10 text-fuchsia-500"
                />
              </div>

              {/* ==================================================
                  CAMPAIGN LIST
              ================================================== */}

              <div className="space-y-4">
                {campaigns.map(
                  (campaign) => (
                    <CampaignCard
                      key={
                        campaign.id
                      }
                      campaign={
                        campaign
                      }
                    />
                  )
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ======================================================
          COMPOSER
      ====================================================== */}

      <ComposeCampaignModal
        open={composerOpen}
        onClose={() =>
          setComposerOpen(
            false
          )
        }
        onCreated={
          handleCampaignCreated
        }
      />
    </>
  );
}

/* ============================================================
   CAMPAIGN CARD
============================================================ */

function CampaignCard({
  campaign,
}: {
  campaign: Campaign;
}) {
  const stats =
    getCampaignStats(
      campaign.emails
    );

  const isComplete =
    stats.total > 0 &&
    stats.sent ===
      stats.total;

  const isFailed =
    stats.total > 0 &&
    stats.failed ===
      stats.total;

  const isScheduled =
    stats.scheduled > 0 ||
    stats.processing > 0;

  let status = "Draft";

  let statusClass =
    "bg-black/[0.05] text-black/50 dark:bg-white/[0.05] dark:text-white/50";

  if (isComplete) {
    status = "Completed";

    statusClass =
      "bg-emerald-500/10 text-emerald-500";
  } else if (isFailed) {
    status = "Failed";

    statusClass =
      "bg-red-500/10 text-red-500";
  } else if (isScheduled) {
    status = "Scheduled";

    statusClass =
      "bg-cyan-500/10 text-cyan-500";
  } else if (stats.sent > 0) {
    status = "In progress";

    statusClass =
      "bg-violet-500/10 text-violet-500";
  }

  const completion =
    stats.total > 0
      ? Math.round(
          ((stats.sent +
            stats.failed) /
            stats.total) *
            100
        )
      : 0;

  return (
    <article className="theme-surface group overflow-hidden rounded-3xl border theme-border transition duration-200 hover:-translate-y-0.5 hover:border-violet-500/20 hover:shadow-xl hover:shadow-black/5">

      {/* MAIN */}

      <div className="p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          <div className="flex min-w-0 gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/15 to-cyan-500/10 text-violet-500">
              <Mail
                size={19}
              />
            </div>

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="theme-text truncate text-sm font-bold">
                  {campaign.subject}
                </h2>

                <span
                  className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${statusClass}`}
                >
                  {status}
                </span>
              </div>

              <p className="theme-muted mt-1 text-[10px]">
                Created{" "}
                {formatDate(
                  campaign.createdAt
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="theme-muted flex shrink-0 items-center gap-1 self-start rounded-lg px-2 py-1.5 text-[10px] font-semibold transition hover:bg-black/[0.04] hover:text-violet-500 dark:hover:bg-white/[0.04]"
          >
            View details
            <ArrowUpRight
              size={11}
            />
          </button>
        </div>

        {/* DETAILS */}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <InfoItem
            icon={
              <Users
                size={13}
              />
            }
            label="Recipients"
            value={String(
              stats.total
            )}
          />

          <InfoItem
            icon={
              <CalendarClock
                size={13}
              />
            }
            label="Start time"
            value={formatDate(
              campaign.startTime
            )}
          />

          <InfoItem
            icon={
              <Send
                size={13}
              />
            }
            label="Sent"
            value={`${stats.sent}/${stats.total}`}
          />

          <InfoItem
            icon={
              <Clock3
                size={13}
              />
            }
            label="Hourly limit"
            value={`${campaign.hourlyLimit}/hr`}
          />
        </div>

        {/* PROGRESS */}

        <div className="mt-6">

          <div className="mb-2 flex items-center justify-between">

            <span className="theme-muted text-[9px] font-semibold uppercase tracking-[0.12em]">
              Delivery progress
            </span>

            <span className="theme-text text-[10px] font-bold">
              {completion}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.05]">

            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700"
              style={{
                width: `${completion}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t theme-border bg-black/[0.015] px-6 py-3 dark:bg-white/[0.015]">

        <span className="theme-muted flex items-center gap-1.5 text-[9px]">
          <CheckCircle2
            size={12}
            className="text-emerald-500"
          />

          {stats.sent} sent
        </span>

        <span className="theme-muted flex items-center gap-1.5 text-[9px]">
          <Clock3
            size={12}
            className="text-cyan-500"
          />

          {stats.scheduled}{" "}
          scheduled
        </span>

        <span className="theme-muted flex items-center gap-1.5 text-[9px]">
          <XCircle
            size={12}
            className="text-red-500"
          />

          {stats.failed} failed
        </span>
      </div>
    </article>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="theme-surface rounded-2xl border theme-border p-4 transition hover:-translate-y-0.5 hover:shadow-lg">

      <div
        className={`mb-3 flex h-8 w-8 items-center justify-center rounded-xl ${className}`}
      >
        {icon}
      </div>

      <p className="theme-muted text-[9px] font-semibold uppercase tracking-[0.12em]">
        {label}
      </p>

      <p className="theme-text mt-1 text-xl font-bold">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border theme-border bg-black/[0.015] p-3 dark:bg-white/[0.015]">

      <div className="theme-muted flex items-center gap-1.5 text-[9px]">
        {icon}
        {label}
      </div>

      <p className="theme-text mt-2 truncate text-[10px] font-semibold">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyCampaignState({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <div className="theme-surface flex min-h-[430px] items-center justify-center rounded-3xl border theme-border">

      <div className="max-w-md px-6 text-center">

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/15 to-cyan-500/10 text-violet-500">
          <Mail
            size={26}
          />
        </div>

        <h2 className="theme-text text-xl font-bold">
          No campaigns yet
        </h2>

        <p className="theme-secondary mt-2 text-sm leading-6">
          Create your first campaign
          and it will appear here with
          live delivery information.
        </p>

        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
        >
          <Plus
            size={15}
          />

          Create your first campaign
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   SKELETON
============================================================ */

function CampaignSkeleton() {
  return (
    <div className="space-y-4">

      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="theme-surface animate-pulse rounded-3xl border theme-border p-6"
          >
            <div className="flex gap-4">

              <div className="h-11 w-11 rounded-2xl bg-black/[0.05] dark:bg-white/[0.05]" />

              <div className="flex-1">

                <div className="h-4 w-48 rounded bg-black/[0.05] dark:bg-white/[0.05]" />

                <div className="mt-2 h-3 w-32 rounded bg-black/[0.05] dark:bg-white/[0.05]" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">

              {[1, 2, 3, 4].map(
                (box) => (
                  <div
                    key={box}
                    className="h-16 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04]"
                  />
                )
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}