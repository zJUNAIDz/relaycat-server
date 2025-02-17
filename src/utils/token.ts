import { verify } from "hono/jwt";
import { getEnv } from "./env";

export const parseToken = async (
  token: string,
  secretKey = getEnv("JWT_SECRET")
) => {
  const decodedPayload = await verify(token, secretKey);
  return decodedPayload;
};
