import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import emailRoutes from "./routes/email.routes.js";
import authRoutes from "./routes/auth.routes.js";

export const app = express();

/* ============================================================
   SECURITY
============================================================ */

app.use(helmet());

/* ============================================================
   CORS
============================================================ */

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ??
      "http://localhost:5173",

    credentials: true,
  })
);

/* ============================================================
   BODY PARSING
============================================================ */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* ============================================================
   COOKIE PARSER
============================================================ */

app.use(cookieParser());

/* ============================================================
   HEALTH CHECK
============================================================ */

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "reachinbox-backend",
  });
});

/* ============================================================
   AUTHENTICATION ROUTES
============================================================ */

app.use(
  "/api/auth",
  authRoutes
);

/* ============================================================
   EMAIL / CAMPAIGN ROUTES
============================================================ */

app.use(
  "/api/emails",
  emailRoutes
);