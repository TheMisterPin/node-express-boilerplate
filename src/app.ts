import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { HttpError } from "./errors/http-error.js";


export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", async (_req, res, next) => {
  try {
    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      error: error.message,
      errorCode: error.errorCode,
    });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});
