import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "s3cr3t";
const TOKEN_TTL = "12h";

export interface SessionClaims {
  userId: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ userId } satisfies SessionClaims, JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

export function verifyToken(token: string): SessionClaims | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      typeof (decoded as SessionClaims).userId === "string"
    ) {
      return { userId: (decoded as SessionClaims).userId };
    }
    return null;
  } catch {
    return null;
  }
}
