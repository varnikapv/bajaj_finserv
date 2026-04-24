import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processBfhlData } from "./bfhlProcessor";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      let body;
      try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON body" });
      }

      const { data } = body || {};
      
      if (!Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid request payload. 'data' array is required." });
      }
      
      const response = processBfhlData(data);
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error processing request:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === 'GET') {
    return res.status(200).json({ operation_code: 1 });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
