import { HttpError } from "../../errors/http-error.js";
import { verifyToken } from "./jwt.js";
import { revokeSession } from "./session.js";

export const logout = async (token: string): Promise<void> => {
  let payload;

  try {
    payload = verifyToken(token);
  } catch {
    throw new HttpError("Invalid or expired token", 401, "UNAUTHORIZED");
  }

  await revokeSession(payload.jti);
};
