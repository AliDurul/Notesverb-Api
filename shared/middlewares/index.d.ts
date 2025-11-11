import { Request, Response, NextFunction } from "express";
import { ServiceError } from "../types";
export declare function authenticateToken(req: Request, res: Response, next: NextFunction): void;
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): (req: Request, res: Response, next: NextFunction) => void;
export declare function validateRequest(schema: any): (req: Request, res: Response, next: NextFunction) => void;
export declare function errorHandler(error: ServiceError, req: Request, res: Response, next: NextFunction): void;
export declare function corsOptions(): {
    origin: string;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
};
export declare function healthCheck(req: Request, res: Response): void;
//# sourceMappingURL=index.d.ts.map