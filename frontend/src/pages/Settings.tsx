import {
  Bell,
  Clock3,
  Database,
  Gauge,
  Mail,
  Shield,
} from "lucide-react";

const settings = [
  {
    icon: Gauge,
    title: "Sending limits",
    description: "Control hourly delivery capacity.",
    value: "200 emails / hour",
    color: "text-violet-400",
  },
  {
    icon: Clock3,
    title: "Minimum delay",
    description: "Spacing between consecutive emails.",
    value: "2 seconds",
    color: "text-amber-400",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Receive alerts about campaign activity.",
    value: "Enabled",
    color: "text-cyan-400",
  },
  {
    icon: Mail,
    title: "Default sender",
    description: "Sender used for outgoing campaigns.",
    value: "ReachInbox Scheduler",
    color: "text-emerald-400",
  },
];

export default function Settings() {
  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
          <Shield size={13} />
          Workspace configuration
        </div>

        <h1 className="mt-2 text-3xl font-bold">
          Settings
        </h1>

        <p className="mt-2 text-sm text-white/35">
          Configure how your outreach workspace operates.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        {settings.map((setting) => {
          const Icon = setting.icon;

          return (
            <div
              key={setting.title}
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:-translate-y-1 hover:bg-white/[0.04]"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ${setting.color}`}
              >
                <Icon size={18} />
              </div>

              <h2 className="mt-5 text-sm font-semibold">
                {setting.title}
              </h2>

              <p className="mt-1 text-xs leading-5 text-white/30">
                {setting.description}
              </p>

              <div className="mt-5 rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2.5 text-xs text-white/60">
                {setting.value}
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025]">
        <div className="flex items-center gap-4 p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
            <Database size={18} />
          </div>

          <div className="flex-1">
            <h2 className="text-sm font-semibold">
              Infrastructure
            </h2>

            <p className="mt-1 text-xs text-white/30">
              PostgreSQL, Redis and BullMQ services.
            </p>
          </div>

          <span className="flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[9px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Operational
          </span>
        </div>
      </section>
    </div>
  );
}