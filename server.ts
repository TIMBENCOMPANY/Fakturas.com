import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API Endpoint: Parse full sentence prompts into formatted invoice structures
app.post("/api/ai/invoice", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      // Return a structured error so the client triggers its sophisticated local parser
      return res.json({
        success: false,
        error: "API key not configured",
        fallback: true
      });
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const promptMessage = `Parse the following user request and extract professional invoice information. 
Current Date is ${currentDate}.
Default Due Date is ${defaultDueDate}.
Extract client details, currency (default 'USD' unless mentioned otherwise e.g. Euros -> EUR, pounds -> GBP, sterling -> GBP), discount, and VAT. 
If no invoice number is specified, invent a luxury sequence like "FAK-2026-89".
Calculate logical hours and rates. If price is total, set quantity = 1 and unitPrice = total.

User Input: "${prompt}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        systemInstruction: "You are Fakturas AI, an ultra-premium fintech billing parsing assistant. Translate statements into high-end structured invoicing data. Return strictly JSON matching the requested schema and nothing else. No markdown wrappers.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["clientName", "clientEmail", "invoiceNumber", "issueDate", "dueDate", "items", "currency", "vatRate", "discountRate"],
          properties: {
            clientName: { type: Type.STRING, description: "The client person, firm or organization." },
            clientEmail: { type: Type.STRING, description: "Email address of the client." },
            clientAddress: { type: Type.STRING, description: "Corporate or personal address of the client if available, else standard placeholder like 'San Francisco, CA'." },
            invoiceNumber: { type: Type.STRING, description: "High-end sequential identifier like FAK-2026-102." },
            issueDate: { type: Type.STRING, description: "Date of invoice generation (format: YYYY-MM-DD)." },
            dueDate: { type: Type.STRING, description: "Due date of final transfer (format: YYYY-MM-DD)." },
            currency: { type: Type.STRING, description: "3-letter currency uppercase symbol: USD, EUR, GBP, CAD, CHF." },
            vatRate: { type: Type.NUMBER, description: "VAT tax percentage rate (e.g. 21 for 21%, 0 if not mentioned)." },
            discountRate: { type: Type.NUMBER, description: "Discount percentage rate (e.g. 10 for 10% discount, 0 if not mentioned)." },
            items: {
              type: Type.ARRAY,
              description: "Array of bills, log lines or packages",
              items: {
                type: Type.OBJECT,
                required: ["description", "quantity", "unitPrice"],
                properties: {
                  description: { type: Type.STRING, description: "Detailed summary of services render or product delivered." },
                  quantity: { type: Type.NUMBER, description: "Numerical hours, units or blocks." },
                  unitPrice: { type: Type.NUMBER, description: "Single-unit or hourly currency value." }
                }
              }
            },
            notes: { type: Type.STRING, description: "Optional bank details, payment instructions, or a warm elite thank you." }
          }
        }
      }
    });

    if (!response || !response.text) {
      throw new Error("Empty response from AI engine");
    }

    const cleanedText = response.text.trim();
    const invoiceJSON = JSON.parse(cleanedText);

    return res.json({
      success: true,
      invoice: invoiceJSON
    });
  } catch (err: any) {
    console.error("AI Invoicing parse error in server:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to parse invoice statement recursively."
    });
  }
});

// Serve frontend application with Vite middleware or static files
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fakturas Server launched efficiently on http://localhost:${PORT}`);
  });
}

bootstrap();
