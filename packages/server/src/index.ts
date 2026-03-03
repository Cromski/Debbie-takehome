import express from "express";
import healthRouter from "./routes/health.js";
import casesRouter from "./cases/routes.js";
import vouchersRouter from "./vouchers/routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use("/api", healthRouter);
app.use("/api/cases", casesRouter);
app.use("/api/cases/:id/vouchers", vouchersRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
