import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  Activity,
  Bell,
  CalendarClock,
  ChevronDown,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Moon,
  Palette,
  Send,
  Settings,
  Sparkles,
  Sun,
  Upload,
  UserRound,
  Users,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  useTheme,
} from "../../context/ThemeContext";

const navigation = [
  {
    label: "Overview",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Campaigns",
    path: "/campaigns",
    icon: Users,
  },
  {
    label: "Scheduled",
    path: "/scheduled",
    icon: CalendarClock,
  },
  {
    label: "Sent",
    path: "/sent",
    icon: Send,
  },
  {
    label: "Activity",
    path: "/activity",
    icon: Activity,
  },
];

export default function AppLayout() {
  const {
    user,
    logout,
    updateAvatar,
  } = useAuth();

  const {
    theme,
    toggleTheme,
  } = useTheme();

  const navigate =
    useNavigate();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(
      localStorage.getItem(
        "reachinbox_notifications"
      ) !== "false"
    );

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(
      "reachinbox_notifications",
      String(
        notificationsEnabled
      )
    );
  }, [notificationsEnabled]);

  const employeeId = user?.id
    ? `RI-${user.id
        .replaceAll("-", "")
        .slice(0, 8)
        .toUpperCase()}`
    : "RI-00000000";

  const handleAvatarUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

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
        "Please choose an image smaller than 5 MB."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        reader.result;

      if (
        typeof result === "string"
      ) {
        updateAvatar(result);
      }
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const handleLogout = async () => {
    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  const avatar =
    user?.avatarUrl;

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "RI";

  return (
    <div className="theme-bg theme-text min-h-screen">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[190px] flex-col border-r theme-border bg-[color:var(--surface)]/90 backdrop-blur-xl">
        {/* BRAND */}
        <div className="flex h-[58px] items-center gap-3 border-b theme-border px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-lg shadow-violet-500/20">
            <Mail size={16} />
          </div>

          <div className="min-w-0">
            <p className="theme-text truncate text-sm font-bold">
              ReachInbox
            </p>

            <p className="theme-subtle text-[7px] font-semibold uppercase tracking-[0.2em]">
              Outreach OS
            </p>
          </div>
        </div>

        {/* WORKSPACE */}
        <div className="px-3 pt-5">
          <p className="theme-subtle mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.2em]">
            Workspace
          </p>

          <button
            onClick={() => navigate("/")}
            className="theme-surface-hover group flex w-full items-center justify-between rounded-xl border theme-border px-3 py-2 text-left transition duration-200 hover:-translate-y-[1px]"
          >
            <div>
              <p className="theme-subtle text-[8px] uppercase">
                Workspace
              </p>

              <p className="theme-text mt-0.5 text-xs font-semibold">
                Nidhi's Workspace
              </p>
            </div>

            <ChevronDown
              size={13}
              className="theme-muted transition-transform group-hover:translate-y-0.5"
            />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="px-2 pt-7">
          <p className="theme-subtle mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.2em]">
            Workspace
          </p>

          <div className="space-y-1">
            {navigation.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={
                      item.path === "/"
                    }
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10 text-violet-500 shadow-sm"
                          : "theme-secondary hover:translate-x-0.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.035]"
                      }`
                    }
                  >
                    <Icon
                      size={15}
                      className="transition-transform duration-200 group-hover:scale-110"
                    />

                    <span>
                      {item.label}
                    </span>

                    {item.label ===
                      "Campaigns" && (
                      <span className="ml-auto rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[9px] text-violet-500">
                        3
                      </span>
                    )}
                  </NavLink>
                );
              }
            )}
          </div>
        </nav>

        {/* SYSTEM */}
        <div className="mt-5 border-t theme-border px-2 pt-5">
          <p className="theme-subtle mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.2em]">
            System
          </p>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                isActive
                  ? "bg-violet-500/10 text-violet-500"
                  : "theme-secondary hover:bg-black/[0.03] dark:hover:bg-white/[0.035]"
              }`
            }
          >
            <Settings size={15} />
            Settings
          </NavLink>
        </div>

        {/* BOTTOM ACCOUNT */}
        <div className="mt-auto border-t theme-border p-3">
          <div className="relative">
            <button
              onClick={() =>
                setProfileOpen(
                  (value) => !value
                )
              }
              className="group flex w-full items-center gap-2 rounded-xl p-2 text-left transition duration-200 hover:bg-black/[0.035] dark:hover:bg-white/[0.04]"
            >
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user?.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold">
                    {initials}
                  </div>
                )}

                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-[var(--surface)] bg-emerald-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="theme-text truncate text-[11px] font-semibold">
                  {user?.name ??
                    "ReachInbox User"}
                </p>

                <p className="theme-muted truncate text-[9px]">
                  {user?.email}
                </p>
              </div>

              <ChevronDown
                size={13}
                className={`theme-muted transition-transform ${
                  profileOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute bottom-[calc(100%+10px)] left-0 w-[230px] overflow-hidden rounded-2xl border theme-border bg-[var(--surface)] p-2 shadow-2xl shadow-black/15 backdrop-blur-xl">
                {/* PROFILE HEADER */}
                <div className="mb-2 rounded-xl bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-cyan-500/10 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={user?.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold">
                          {initials}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text truncate text-xs font-bold">
                        {user?.name}
                      </p>

                      <p className="theme-muted truncate text-[9px]">
                        {user?.email}
                      </p>

                      <p className="mt-1 text-[9px] font-medium text-violet-500">
                        {employeeId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ACCOUNT */}
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/account");
                  }}
                  className="theme-secondary flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition hover:bg-violet-500/10 hover:text-violet-500"
                >
                  <UserRound size={15} />
                  Account
                </button>

                {/* APPEARANCE */}
                <button
                  onClick={toggleTheme}
                  className="theme-secondary flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition hover:bg-violet-500/10 hover:text-violet-500"
                >
                  {theme === "dark" ? (
                    <Moon size={15} />
                  ) : (
                    <Sun size={15} />
                  )}

                  <span>
                    Appearance
                  </span>

                  <span className="theme-muted ml-auto text-[10px]">
                    {theme === "dark"
                      ? "Dark"
                      : "Light"}
                  </span>
                </button>

                {/* NOTIFICATIONS */}
                <button
                  onClick={() =>
                    setNotificationsEnabled(
                      (value) => !value
                    )
                  }
                  className="theme-secondary flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition hover:bg-violet-500/10 hover:text-violet-500"
                >
                  <Bell size={15} />

                  <span>
                    Notifications
                  </span>

                  <span
                    className={`ml-auto h-2 w-2 rounded-full ${
                      notificationsEnabled
                        ? "bg-emerald-400"
                        : "bg-gray-400"
                    }`}
                  />
                </button>

                {/* UPLOAD */}
                <button
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="theme-secondary flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition hover:bg-violet-500/10 hover:text-violet-500"
                >
                  <Upload size={15} />
                  Change profile picture
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={
                    handleAvatarUpload
                  }
                  className="hidden"
                />

                <div className="my-1 border-t theme-border" />

                {/* SETTINGS */}
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="theme-secondary flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition hover:bg-violet-500/10 hover:text-violet-500"
                >
                  <Palette size={15} />
                  Settings
                </button>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-red-500 transition hover:bg-red-500/10"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="ml-[190px] min-h-screen">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 flex h-[58px] items-center justify-between border-b theme-border bg-[color:var(--bg)]/80 px-6 backdrop-blur-xl">
          <div className="theme-muted text-[10px] font-medium">
            {new Date().toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                month: "long",
                day: "numeric",
              }
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border theme-border px-3 py-1.5 text-[9px] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />

              <span className="theme-secondary">
                All systems operational
              </span>
            </div>

            {/* TOP RIGHT PROFILE */}
            <button
              onClick={() =>
                setProfileOpen(
                  (value) => !value
                )
              }
              className="group flex items-center gap-2 rounded-xl border theme-border px-2 py-1.5 transition hover:-translate-y-[1px] hover:bg-black/[0.03] dark:hover:bg-white/[0.035]"
            >
              <div className="h-6 w-6 overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user?.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[8px] font-bold">
                    {initials}
                  </div>
                )}
              </div>

              <span className="theme-text hidden text-[10px] font-semibold sm:block">
                {user?.name?.split(
                  " "
                )[0] ?? "Account"}
              </span>

              <ChevronDown
                size={12}
                className={`theme-muted transition-transform ${
                  profileOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>
          </div>
        </header>

        {/* PAGE */}
        <div className="min-h-[calc(100vh-58px)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}