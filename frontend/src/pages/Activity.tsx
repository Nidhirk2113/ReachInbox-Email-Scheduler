import {
  CheckCircle2,
  Clock3,
  Mail,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const events = [
  {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    title: "Email delivered",
    description: "test1@example.com received an email",
    time: "Just now",
  },
  {
    icon: Mail,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    title: "Campaign scheduled",
    description: "3 emails added to the delivery queue",
    time: "2 min ago",
  },
  {
    icon: RotateCcw,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    title: "Retry completed",
    description: "A previously failed email was retried",
    time: "12 min ago",
  },
  {
    icon: Clock3,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    title: "Delivery delayed",
    description: "Rate limit temporarily paused delivery",
    time: "24 min ago",
  },
  {
    icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    title: "Delivery failed",
    description: "SMTP connection failed",
    time: "1 hr ago",
  },
];

export default function Activity() {
  return (
    <div className="space-y-7">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
          System timeline
        </div>

        <h1 className="mt-2 text-3xl font-bold">
          Activity
        </h1>

        <p className="mt-2 text-sm text-white/35">
          Everything happening across your outreach system.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
        <div className="absolute bottom-8 left-[39px] top-8 w-px bg-gradient-to-b from-violet-500/40 via-cyan-500/20 to-transparent" />

        <div className="space-y-7">
          {events.map((event, index) => {
            const Icon = event.icon;

            return (
              <motion.div
                key={event.title + index}
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                className="relative flex gap-4"
              >
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${event.bg} ${event.color}`}
                >
                  <Icon size={14} />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row">
                    <div className="text-sm font-semibold">
                      {event.title}
                    </div>

                    <div className="text-[10px] text-white/25">
                      {event.time}
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-white/35">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}