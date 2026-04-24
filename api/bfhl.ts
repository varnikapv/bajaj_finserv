import express from "express";
import cors from "cors";
import { processBfhlData } from "../src/utils/bfhlProcessor.ts";

const app = express();
app.use(cors());
app.use(express.json());

app.post("*", (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid request payload. 'data' array is required." });
    }
    
    const response = processBfhlData(data);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("*", (req, res) => {
  res.status(200).json({ operation_code: 1 });
});

export default app;
