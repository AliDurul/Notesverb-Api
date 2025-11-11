import { Request, Response, NextFunction } from "express";
import { JWTPayload, logError, ServiceError } from "../types";
import { createErrorResponse } from "../utils";
import jwt from "jsonwebtoken";


export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer token

  if (!token) {
    res.status(401).json(createErrorResponse("Access token required"));
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logError(new Error("JWT_SECRET is not defined"));
    res.status(500).json(createErrorResponse("Internal Server Error"));
    return;
  }
  console.log(token);

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json(createErrorResponse("Invalid token"));
      return;
    }

    req.user = decoded as JWTPayload; // Attach user info to request
    next();
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function validateRequest(schema: any) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errors: Record<string, string[]> = {};
      error.details.forEach((detail: any) => {
        const field = detail.path.join(".");
        if (!error[field]) {
          errors[field] = [];
        }
        errors[field].push(detail.message);
      });

      res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
      return;
    }

    next();
  };
}

export function errorHandler(
  error: ServiceError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logError(error, {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json(createErrorResponse(message));

  next();
}

export function corsOptions() {
  return {
    origin: "*",
    credentials: process.env.CORS_CREDENTIALS === "true",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", 'X-Internal-Request'],
  };
}

export function healthCheck(req: Request, res: Response) {
  res.json({ status: "ok", timestamp: new Date().toISOString(), port: process.env.PORT});
}