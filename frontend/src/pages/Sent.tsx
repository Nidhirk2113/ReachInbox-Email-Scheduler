import {
  CheckCircle2,
  ExternalLink,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";

const sentEmails = [
  {
    recipient: "two@example.com",
    subject: "Rate Limit Test",
    time: "12:03 PM",
  },
  {
    recipient: "alice@example.com",
    subject: "Ethereal SMTP Test",
    time: "10:58 AM",
  },
  {
    recipient: "restart-test@example.com",
    subject: "ReachInbox Restart Test",
    time: "2:24 PM",
  },
  {
    recipient: "five@example.com",
    subject: "Rate Limit Test",
    time: "12:03 PM",
  },
];

export default function Sent() {
  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
          <CheckCircle2 size={14} />
          Delivery history
        </div>

        <h1 className="mt-2 text-3xl font-bold">
          Sent
        </h1>

        <p className="mt-2 text-sm text-white/35">
          Review successfully delivered outreach.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-400/10 bg-gradient-to-r from-emerald-400/[0.08] to-transparent p-5">
        <div className="text-xs text-emerald-300">
          Delivery performance
        </div>

        <div className="mt-2 text-3xl font-bold">
          98.4%
        </div>

        <p className="mt-1 text-xs text-white/30">
          Excellent delivery performance across your workspace.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
        <div className="divide-y divide-white/[0.05]">
          {sentEmails.map((email, index) => (
            <motion.div
              key={email.recipient + email.time}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 px-6 py-5 transition hover:bg-white/[0.025]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                <Mail size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {email.subject}
                </div>

                <div className="mt-1 truncate text-xs text-white/30">
                  {email.recipient}
                </div>
              </div>

              <div className="hidden text-xs text-white/30 sm:block">
                {email.time}
              </div>

              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={16} />

                <span className="hidden text-[10px] font-semibold sm:block">
                  Delivered
                </span>
              </div>

              <button
                title="View message"
                className="rounded-lg p-2 text-white/20 transition hover:bg-white/5 hover:text-white"
              >
                <ExternalLink size={15} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}