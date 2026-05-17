import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const tools = [
  {
    functionDeclarations: [
      {
        name: "add_task",
        description: "Suggest adding a new study task to the planner. The user will need to confirm this.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Clear and descriptive title for the task" },
            subject: { type: Type.STRING, description: "The relevant subject (e.g., Physics, Maths)" },
            duration: { type: Type.NUMBER, description: "Estimated time in minutes (default 60)" },
            priority: { type: Type.STRING, description: "Priority level: low, medium, or high", enum: ["low", "medium", "high"] },
            scheduledDate: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
            type: { type: Type.STRING, description: "Task type: study (learning new topics) or revision (reviewing)", enum: ["study", "revision"] }
          },
          required: ["title", "subject"]
        }
      },
      {
        name: "get_current_tasks",
        description: "Get the current list of tasks to help manage the planner.",
        parameters: {
          type: Type.OBJECT,
          properties: {}
        }
      }
    ]
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { 
        contents, 
        model = "gemini-3-flash-preview", 
        systemInstruction,
        useTools = false
      } = req.body;
      
      const config: any = {
        systemInstruction: systemInstruction || "You are Axiom AI, a friendly and highly effective study tutor. You help students understand complex concepts, manage their study schedule, and stay motivated. When asked about planning or tasks, use the provided tools to suggest changes.",
      };

      const payload: any = {
        model,
        contents,
        config
      };

      if (useTools) {
        payload.config.tools = tools;
      }

      const response = await ai.models.generateContent(payload);
      
      res.json({ 
        text: response.text,
        functionCalls: response.functionCalls
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Axiom Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
