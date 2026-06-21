// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — User Model
// Supports four roles: cm · dept_head · field_officer · citizen
// Passwords are stored as bcrypt hashes — never plaintext.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose, { Schema, Document, Model, models } from 'mongoose'
import type { UserRole } from '@/types'

// ── Document Interface ────────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string
  email: string
  password: string        // bcrypt hash
  role: UserRole
  department?: string     // slug — relevant for dept_head and field_officer only
  createdAt: Date
  updatedAt: Date
}

// ── Schema ────────────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['cm', 'dept_head', 'field_officer', 'citizen'] satisfies UserRole[],
      required: true,
    },
    department: {
      type: String,
      trim: true,
      // Only populated for dept_head and field_officer roles
    },
  },
  {
    timestamps: true,
  }
)

// ── Indexes ───────────────────────────────────────────────────────────────────

// Department head lookup — find officers by department
UserSchema.index({ role: 1, department: 1 })

// ── Model Export (singleton-safe) ─────────────────────────────────────────────

const User: Model<IUser> =
  (models.User as Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema)

export default User
