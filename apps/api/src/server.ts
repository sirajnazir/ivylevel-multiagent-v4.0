import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { json } from "body-parser";
import { assessmentRouter } from "./routes/assessment";

dotenv.config();

const app = express();

app.use(cors());
app.use(json());

app.use("/assessment", assessmentRouter);

const PORT = process.env.API_PORT || 4000;

app.listen(PORT, () => {
  console.log(`IvyLevel API listening on port ${PORT}`);
});
