import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import db from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-in-production"

export interface UserPayload {
  id: number
  username: string
  level: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch {
    return null
  }
}

export async function getUserById(id: number) {
  const user = await db().select("*").from("users").where({ id }).first()
  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function getUserByUsername(username: string) {
  return db().select("*").from("users").where({ username }).first()
}

export async function createUser(username: string, password: string) {
  const passwordHash = await hashPassword(password)
  const [user] = await db().insert({
      username,
      password_hash: passwordHash,
      level: 1,
      current_exp: 0,
      exp_to_next_level: 100,
    })
    .into("users")
    .returning(["id", "username", "level", "current_exp", "exp_to_next_level"])

  return user
}