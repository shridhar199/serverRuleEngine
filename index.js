import express from "express";
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
// import { Engine } from 'json-rules-engine';
import rulesRouter from "./src/routes/rules.js";
import { supabase } from "./src/config/supabaseClient.js"
import rulesEngine from "./src/services/rulesEngine.js";
import {
  copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import { runtime, serviceAdapter } from "./src/utils/CopilotKit.js";

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

const port = process.env.PORT;

app.use(express.json());


app.use(async(req, res, next) => {
  req.supabase = supabase;
    req.rulesEngine = rulesEngine;
  
  // Loading rules for the first time
  if (!rulesEngine.engine.rules.length) {
    await rulesEngine.loadRulesFromDatabase(supabase);
  }
  next();
});

// Mount routes
app.use('/rules', rulesRouter);
app.use('/api/v1/copilotkit', (req, res, next) => {
  (async () => {
    // const runtime = new CopilotRuntime();
    const handler = copilotRuntimeNodeHttpEndpoint({
      endpoint: '/copilotkit',
      runtime,
      serviceAdapter,
    });
 
    return handler(req, res);
  })().catch(next);
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

