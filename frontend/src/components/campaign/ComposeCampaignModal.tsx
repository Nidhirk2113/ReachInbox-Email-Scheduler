import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Mail,
  Plus,
  Send,
  Users,
  X,
} from "lucide-react";

import api from "../../lib/api";

interface ComposeCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

interface FormState {
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delayMs: number;
  hourlyLimit: number;
}

const defaultStartTime = () => {
  const date = new Date(
    Date.now() + 5 * 60 * 1000
  );

  const offset =
    date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() -
      offset * 60 * 1000
  );

  return localDate
    .toISOString()
    .slice(0, 16);
};

const initialForm = (): FormState => ({
  subject: "",
  body: "",
  recipients: [],
  startTime: defaultStartTime(),
  delayMs: 2000,
  hourlyLimit: 200,
});

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export default function ComposeCampaignModal({
  open,
  onClose,
  onCreated,
}: ComposeCampaignModalProps) {
  const [form, setForm] =
    useState<FormState>(
      initialForm
    );

  const [recipientInput, setRecipientInput] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const recipientCount =
    form.recipients.length;

  const estimatedDuration =
    useMemo(() => {
      if (recipientCount <= 1) {
        return "Under a minute";
      }

      const seconds =
        Math.ceil(
          (recipientCount - 1) *
            form.delayMs /
            1000
        );

      if (seconds < 60) {
        return `~${seconds}s`;
      }

      const minutes =
        Math.ceil(seconds / 60);

      return `~${minutes} min`;
    }, [
      recipientCount,
      form.delayMs,
    ]);

  if (!open) {
    return null;
  }

  const addRecipient = (
    value?: string
  ) => {
    const raw =
      value ??
      recipientInput;

    const emails = raw
      .split(/[,\s;]+/)
      .map((email) =>
        email.trim().toLowerCase()
      )
      .filter(Boolean);

    if (emails.length === 0) {
      return;
    }

    const invalid =
      emails.find(
        (email) =>
          !isValidEmail(email)
      );

    if (invalid) {
      setError(
        `"${invalid}" is not a valid email address.`
      );
      return;
    }

    setError("");

    setForm((current) => ({
      ...current,
      recipients: Array.from(
        new Set([
          ...current.recipients,
          ...emails,
        ])
      ),
    }));

    setRecipientInput("");
  };

  const removeRecipient = (
    email: string
  ) => {
    setForm((current) => ({
      ...current,
      recipients:
        current.recipients.filter(
          (item) => item !== email
        ),
    }));
  };

  const handleRecipientKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Enter" ||
      event.key === "," ||
      event.key === "Tab"
    ) {
      if (recipientInput.trim()) {
        event.preventDefault();
        addRecipient();
      }
    }

    if (
      event.key === "Backspace" &&
      !recipientInput &&
      form.recipients.length
    ) {
      removeRecipient(
        form.recipients[
          form.recipients.length - 1
        ]
      );
    }
  };

  const resetForm = () => {
    setForm(initialForm());
    setRecipientInput("");
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    if (submitting) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      form.recipients.length === 0
    ) {
      setError(
        "Add at least one recipient."
      );
      return;
    }

    if (!form.subject.trim()) {
      setError(
        "Please enter a subject."
      );
      return;
    }

    if (!form.body.trim()) {
      setError(
        "Please enter a message."
      );
      return;
    }

    if (!form.startTime) {
      setError(
        "Choose a start time."
      );
      return;
    }

    const selectedTime =
      new Date(form.startTime);

    if (
      Number.isNaN(
        selectedTime.getTime()
      )
    ) {
      setError(
        "The selected start time is invalid."
      );
      return;
    }

    if (
      selectedTime.getTime() <
      Date.now()
    ) {
      setError(
        "Start time must be in the future."
      );
      return;
    }

    if (
      form.delayMs < 2000
    ) {
      setError(
        "Minimum delivery delay is 2 seconds."
      );
      return;
    }

    if (
      form.hourlyLimit < 1 ||
      form.hourlyLimit > 200
    ) {
      setError(
        "Hourly limit must be between 1 and 200."
      );
      return;
    }

    try {
      setSubmitting(true);

      await api.post(
        "/emails/schedule",
        {
          subject:
            form.subject.trim(),

          body:
            form.body.trim(),

          recipients:
            form.recipients,

          startTime:
            selectedTime.toISOString(),

          delayMs:
            form.delayMs,

          hourlyLimit:
            form.hourlyLimit,
        }
      );

      setSuccess(
        `Campaign created successfully for ${recipientCount} recipient${
          recipientCount === 1
            ? ""
            : "s"
        }.`
      );

      onCreated?.();

      setTimeout(() => {
        resetForm();
        onClose();
      }, 1200);
    } catch (requestError: any) {
      console.error(
        "Campaign creation failed:",
        requestError
      );

      const message =
        requestError?.response?.data
          ?.error ??
        "Unable to create the campaign. Please try again.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <div className="theme-surface max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[28px] border theme-border shadow-2xl shadow-black/25">
        {/* HEADER */}
        <div className="relative border-b theme-border px-6 py-5">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />

          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
                <Send size={18} />
              </div>

              <div>
                <h2 className="theme-text text-lg font-bold">
                  Create campaign
                </h2>

                <p className="theme-secondary mt-1 text-xs">
                  Build and schedule your
                  outreach campaign.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="theme-muted rounded-xl p-2 transition hover:bg-black/[0.04] hover:text-red-500 dark:hover:bg-white/[0.05]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(92vh-85px)] overflow-y-auto"
        >
          <div className="space-y-6 p-6">
            {/* RECIPIENTS */}
            <section>
              <FieldLabel
                icon={<Users size={14} />}
                label="Recipients"
                required
              />

              <div className="theme-surface-soft min-h-[58px] rounded-2xl border theme-border p-2.5 transition focus-within:border-violet-500/40 focus-within:ring-4 focus-within:ring-violet-500/5">
                <div className="flex flex-wrap gap-2">
                  {form.recipients.map(
                    (email) => (
                      <span
                        key={email}
                        className="flex items-center gap-1.5 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-[11px] font-medium text-violet-500"
                      >
                        {email}

                        <button
                          type="button"
                          onClick={() =>
                            removeRecipient(
                              email
                            )
                          }
                          className="rounded-full transition hover:bg-violet-500/20"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    )
                  )}

                  <input
                    value={
                      recipientInput
                    }
                    onChange={(event) =>
                      setRecipientInput(
                        event.target.value
                      )
                    }
                    onKeyDown={
                      handleRecipientKeyDown
                    }
                    onBlur={() => {
                      if (
                        recipientInput.trim()
                      ) {
                        addRecipient();
                      }
                    }}
                    placeholder={
                      form.recipients
                        .length
                        ? "Add another recipient..."
                        : "Enter email and press Enter..."
                    }
                    className="min-w-[220px] flex-1 border-none bg-transparent px-1 py-2 text-xs outline-none ring-0"
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <p className="theme-muted text-[10px]">
                  Separate multiple emails with
                  Enter, comma or space.
                </p>

                <p className="text-[10px] font-semibold text-violet-500">
                  {recipientCount} recipient
                  {recipientCount === 1
                    ? ""
                    : "s"}
                </p>
              </div>
            </section>

            {/* SUBJECT */}
            <section>
              <FieldLabel
                icon={<Mail size={14} />}
                label="Subject"
                required
              />

              <input
                value={form.subject}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    subject:
                      event.target.value,
                  }))
                }
                placeholder="e.g. Introducing our new product"
                maxLength={180}
                className="theme-surface-soft theme-text w-full rounded-2xl border theme-border px-4 py-3 text-sm outline-none transition placeholder:theme-muted focus:border-violet-500/40 focus:ring-4 focus:ring-violet-500/5"
              />

              <p className="theme-muted mt-1.5 text-right text-[10px]">
                {form.subject.length}/180
              </p>
            </section>

            {/* MESSAGE */}
            <section>
              <FieldLabel
                icon={<Mail size={14} />}
                label="Message"
                required
              />

              <div className="theme-surface-soft overflow-hidden rounded-2xl border theme-border transition focus-within:border-violet-500/40 focus-within:ring-4 focus-within:ring-violet-500/5">
                <div className="flex items-center gap-1 border-b theme-border px-3 py-2">
                  <span className="theme-muted text-[10px]">
                    Plain text email
                  </span>

                  <span className="ml-auto rounded-md bg-violet-500/10 px-2 py-1 text-[9px] font-medium text-violet-500">
                    Ready to send
                  </span>
                </div>

                <textarea
                  value={form.body}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      body:
                        event.target.value,
                    }))
                  }
                  placeholder={`Hi there,

I wanted to reach out about...

Best,
Nidhi`}
                  rows={9}
                  className="theme-text w-full resize-none border-none bg-transparent px-4 py-4 text-sm leading-6 outline-none placeholder:text-black/25 dark:placeholder:text-white/20"
                />
              </div>
            </section>

            {/* DELIVERY */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                  <CalendarClock size={14} />
                </div>

                <div>
                  <p className="theme-text text-xs font-semibold">
                    Delivery
                  </p>

                  <p className="theme-muted text-[10px]">
                    Control when and how quickly emails
                    are sent.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* START */}
                <div>
                  <label className="theme-muted mb-2 block text-[10px] font-semibold uppercase tracking-wider">
                    Start time
                  </label>

                  <div className="relative">
                    <CalendarClock
                      size={15}
                      className="theme-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="datetime-local"
                      value={
                        form.startTime
                      }
                      min={defaultStartTime()}
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            startTime:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="theme-surface-soft theme-text w-full rounded-xl border theme-border py-3 pl-10 pr-3 text-xs outline-none transition focus:border-violet-500/40 focus:ring-4 focus:ring-violet-500/5"
                    />
                  </div>
                </div>

                {/* HOURLY LIMIT */}
                <div>
                  <label className="theme-muted mb-2 block text-[10px] font-semibold uppercase tracking-wider">
                    Hourly limit
                  </label>

                  <div className="relative">
                    <Clock3
                      size={15}
                      className="theme-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={
                        form.hourlyLimit
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            hourlyLimit:
                              Number(
                                event.target
                                  .value
                              ),
                          })
                        )
                      }
                      className="theme-surface-soft theme-text w-full rounded-xl border theme-border py-3 pl-10 pr-3 text-xs outline-none transition focus:border-violet-500/40 focus:ring-4 focus:ring-violet-500/5"
                    />
                  </div>

                  <p className="theme-muted mt-1 text-[9px]">
                    System maximum: 200/hour
                  </p>
                </div>
              </div>

              {/* DELAY */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="theme-muted text-[10px] font-semibold uppercase tracking-wider">
                    Minimum delay between emails
                  </label>

                  <span className="rounded-lg bg-violet-500/10 px-2 py-1 text-[10px] font-bold text-violet-500">
                    {(
                      form.delayMs /
                      1000
                    ).toFixed(1)}
                    s
                  </span>
                </div>

                <input
                  type="range"
                  min={2000}
                  max={30000}
                  step={1000}
                  value={
                    form.delayMs
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        delayMs:
                          Number(
                            event.target
                              .value
                          ),
                      })
                    )
                  }
                  className="w-full accent-violet-500"
                />

                <div className="theme-muted mt-1 flex justify-between text-[9px]">
                  <span>2 sec</span>
                  <span>15 sec</span>
                  <span>30 sec</span>
                </div>
              </div>
            </section>

            {/* SUMMARY */}
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryCard
                icon={<Users size={15} />}
                label="Recipients"
                value={String(
                  recipientCount
                )}
              />

              <SummaryCard
                icon={<Clock3 size={15} />}
                label="Estimated delivery"
                value={
                  estimatedDuration
                }
              />

              <SummaryCard
                icon={<Send size={15} />}
                label="Rate"
                value={`${form.hourlyLimit}/hr`}
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <p className="text-xs leading-5 text-red-500">
                  {error}
                </p>
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />

                <p className="text-xs leading-5 text-emerald-500">
                  {success}
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t theme-border bg-[var(--surface)]/95 px-6 py-4 backdrop-blur-xl">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="theme-secondary rounded-xl px-4 py-2.5 text-xs font-semibold transition hover:bg-black/[0.04] hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/[0.04]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Schedule campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldLabel({
  icon,
  label,
  required,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-violet-500">
        {icon}
      </span>

      <label className="theme-text text-xs font-semibold">
        {label}
      </label>

      {required && (
        <span className="text-red-500">
          *
        </span>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="theme-surface-soft rounded-2xl border theme-border p-3">
      <div className="theme-muted mb-2">
        {icon}
      </div>

      <p className="theme-muted text-[9px] uppercase tracking-wider">
        {label}
      </p>

      <p className="theme-text mt-1 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}