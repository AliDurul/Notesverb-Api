import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { servicesConfig } from "../config/services";

const router = Router();

function createServiceProxy(
  targetUrl: string,
  pathRewrite?: Record<string, string>
): any {

  const options = {
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: pathRewrite || {},
    timeout: 30000, // 30 seconds
    proxyTimeout: 30000, // 30 seconds
    onError: (err: any, req: any, res: any) => {
      console.error(`Proxy error: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: "Service unavailable. Please try again later.",
          message: "Service unavailable. Please try again later.",
        });
      }
    },
    onProxyReq: (proxyReq: any, req: any) => {
      // Log proxy request details
      console.log(
        `Proxying request: ${req.method} ${req.originalUrl} to ${targetUrl}`
      );

      // Forward user information if available
      if (req.user) {
        proxyReq.setHeader("x-user-id", req.user.userId);
        proxyReq.setHeader("x-user-email", req.user.email);
      }

      // Ensure content type for POST/PUT requests
      if (
        req.body &&
        (req.method === "POST" ||
          req.method === "PUT" ||
          req.method === "PATCH")
      ) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes: any, req: any) => {
      // log proxy response details
      console.log(
        `Received response from ${targetUrl}: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`
      );
    },
  };

  return createProxyMiddleware(options);
}

router.use(
  "/api/auth",
  createServiceProxy(servicesConfig.auth.url, {
    "^/api/auth": "",
  })
);


router.use(
  "/api/users",
  createServiceProxy(servicesConfig.users.url, {
    "^/api/users": "",
  })
);

router.use(
  "/api/notes",
  createServiceProxy(servicesConfig.notes.url, {
    "^/api/notes": "",
  })
);

router.use(
  "/api/tags",
  createServiceProxy(servicesConfig.tags.url, {
    "^/api/tags": "",
  })
);

export default router;