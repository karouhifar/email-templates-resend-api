import type { Request } from "express";

export const isEmpty = function (data: any): boolean {
  return Object.keys(data).length === 0;
};

export function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"]?.toString() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}
