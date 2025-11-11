import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import proxyRoutes from "./routes/proxy";
import { createErrorResponse } from "../../shared/utils";
import { gatewayAuth } from "./middlewares/auth";

//load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// trust proxy (important for reverse proxies)
app.set("trust proxy", 1);

// setup middlewares
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: process.env.CORS_CREDENTIALS === "true",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-user-id",
      "x-user-email",
    ],
  })
);


// auth middlware
// app.use(gatewayAuth);

// setup proxy routes
app.use(proxyRoutes);

app.all('/health', (req, res) => {
  res.status(200).json({ status: "API Gateway is healthy" });
});


// Handle 404 for undefined routes
app.get('*splat', (req, res) => {
  res.status(404).json(createErrorResponse("API Gateway is not found"));
});


//Global error handler
app.use((
  error: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.log("Unhandled error:", error);

  if (!res.headersSent) {
    res
      .status(error.statusCode || 500)
      .json(createErrorResponse(error.message || "Internal eror"));
  }
}
);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Gateway URL: http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log("");
  console.log("📋 Available endpoints:");
  console.log(`   Auth Service:  http://localhost:${PORT}/api/auth/*`);
  console.log(`   User Service:  http://localhost:${PORT}/api/users/*`);
  console.log(`   Notes Service: http://localhost:${PORT}/api/notes/*`);
  console.log(`   Tags Service:  http://localhost:${PORT}/api/tags/*`);
  console.log("");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("🚦 Shutting down API Gateway...");
  server.close(() => {
    console.log("✅ API Gateway shut down gracefully.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("🚦 Shutting down API Gateway...");
  server.close(() => {
    console.log("✅ API Gateway shut down gracefully.");
    process.exit(0);
  });
});

export default app;