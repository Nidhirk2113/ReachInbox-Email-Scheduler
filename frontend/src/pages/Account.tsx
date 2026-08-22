import {
  useRef,
} from "react";

import {
  Camera,
  CheckCircle2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useAuth,
} from "../context/AuthContext";

export default function Account() {
  const {
    user,
    updateAvatar,
  } = useAuth();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  if (!user) {
    return null;
  }

  const employeeId = `RI-${user.id
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase()}`;

  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const handleUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Please select an image smaller than 5 MB."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        updateAvatar(
          reader.result
        );
      }
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-500">
          Account
        </p>

        <h1 className="theme-text text-3xl font-bold">
          Your profile
        </h1>

        <p className="theme-secondary mt-2 text-sm">
          Manage your ReachInbox identity and
          profile information.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        {/* PROFILE CARD */}
        <section className="theme-surface overflow-hidden rounded-3xl border theme-border p-7">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-28 w-28 overflow-hidden rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 p-[2px] shadow-xl shadow-violet-500/20">
                <div className="h-full w-full overflow-hidden rounded-full bg-[var(--surface)]">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl font-bold text-white">
                      {initials}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[var(--surface)] bg-violet-500 text-white shadow-lg transition hover:scale-110 hover:bg-fuchsia-500"
                title="Change profile picture"
              >
                <Camera size={15} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </div>

            <h2 className="theme-text mt-5 text-xl font-bold">
              {user.name}
            </h2>

            <p className="theme-secondary mt-1 text-sm">
              {user.email}
            </p>

            <div className="mt-4 rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-semibold text-violet-500">
              {employeeId}
            </div>
          </div>
        </section>

        {/* DETAILS */}
        <section className="theme-surface rounded-3xl border theme-border p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <UserRound size={18} />
            </div>

            <div>
              <h2 className="theme-text font-semibold">
                Profile information
              </h2>

              <p className="theme-muted text-xs">
                Your authenticated ReachInbox identity
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <InfoRow
              icon={<UserRound size={16} />}
              label="Full name"
              value={user.name}
            />

            <InfoRow
              icon={<Mail size={16} />}
              label="Email address"
              value={user.email}
            />

            <InfoRow
              icon={
                <ShieldCheck
                  size={16}
                />
              }
              label="Authentication"
              value="Google"
            />

            <InfoRow
              icon={
                <CheckCircle2
                  size={16}
                />
              }
              label="Account status"
              value="Verified"
            />

            <InfoRow
              icon={<UserRound size={16} />}
              label="Employee ID"
              value={employeeId}
            />
          </div>
        </section>
      </div>

      <section className="theme-surface mt-6 rounded-3xl border theme-border p-7">
        <h2 className="theme-text font-semibold">
          Profile picture
        </h2>

        <p className="theme-secondary mt-1 text-sm">
          Choose an image from your device. This
          replaces your Google profile picture inside
          ReachInbox.
        </p>

        <button
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="mt-5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30"
        >
          Change profile picture
        </button>
      </section>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border theme-border p-4 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.025]">
      <div className="theme-muted">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="theme-muted text-[10px]">
          {label}
        </p>

        <p className="theme-text mt-1 truncate text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}