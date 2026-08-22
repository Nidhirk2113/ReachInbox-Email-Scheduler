import {
  CalendarClock,
  Clock3,
  Mail,
  MoreHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";

const scheduled = [
  {
    recipient: "alice@example.com",
    subject: "ReachInbox Test Email",
    time: "9:00 PM",
    status: "Scheduled",
  },
  {
    recipient: "bob@example.com",
    subject: "Product launch announcement",
    time: "9:00 PM",
    status: "Scheduled",
  },
  {
    recipient: "charlie@example.com",
    subject: "Partnership follow-up",
    time: "9:02 PM",
    status: "Scheduled",
  },
];

export default function Scheduled() {
  return (
    <div className="space-y-7">
      <PageIntro
        icon={<CalendarClock size={16} />}
        label="Delivery queue"
        title="Scheduled"
        description="See exactly what ReachInbox is preparing to send."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Queued" value="31" />
        <Stat label="Next delivery" value="9:00 PM" />
        <Stat label="Hourly capacity" value="200" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
        <div className="border-b border-white/[0.06] px-6 py-5">
          <h2 className="font-semibold">
            Upcoming deliveries
          </h2>
        </div>

        <div className="divide-y divide-white/[0.05]">
          {scheduled.map((email, index) => (
            <motion.div
              key={email.recipient + email.time}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.06 }}
              className="group flex items-center gap-4 px-6 py-5 hover:bg-white/[0.025]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                <Mail size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {email.subject}
                </div>

                <div className="mt-1 truncate text-xs text-white/30">
                  {email.recipient}
                </div>
              </div>

              <div className="hidden items-center gap-2 text-xs text-white/40 sm:flex">
                <Clock3 size={13} />
                {email.time}
              </div>

              <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[9px] font-semibold text-amber-400">
                {email.status}
              </span>

              <button className="rounded-lg p-2 text-white/20 hover:bg-white/5 hover:text-white">
                <MoreHorizontal size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageIntro({
  icon,
  label,
  title,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
        {icon}
        {label}
      </div>

      <h1 className="mt-2 text-3xl font-bold">
        {title}
      </h1>

      <p className="mt-2 text-sm text-white/35">
        {description}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="text-xs text-white/30">
        {label}
      </div>

      <div className="mt-3 text-2xl font-bold">
        {value}
      </div>
    </div>
  );
}