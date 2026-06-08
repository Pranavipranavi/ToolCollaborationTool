import { ApiError } from "../utils/ApiError.js";

export function requireTrustedOrigin(allowedOrigins) {
  const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

  return (req, _res, next) => {
    if (safeMethods.has(req.method)) return next();

    const origin = req.get("origin");
    const referer = req.get("referer");
    let source = origin;
    if (!source && referer) {
      try {
        source = new URL(referer).origin;
      } catch (_error) {
        return next(new ApiError(403, "Request origin is not trusted"));
      }
    }

    if (!source && process.env.NODE_ENV !== "production") return next();
    if (source && allowedOrigins.has(source)) return next();

    return next(new ApiError(403, "Request origin is not trusted"));
  };
}
