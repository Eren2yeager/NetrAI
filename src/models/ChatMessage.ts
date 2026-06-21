// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — ChatMessage Model
// Stores individual messages from the citizen chatbot conversation.
// Keyed by sessionId (browser-generated UUID) so conversations survive
// page refreshes and don't require auth.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose, { Schema, Document, Model, models } from 'mongoose'

// ── Document Interface ────────────────────────────────────────────────────────

export type ChatRole    = 'user' | 'assistant'
export type ChatPersona = 'netra' | 'sahay' | 'marg' | 'citizen'

export interface IChatMessage extends Document {
  /** Browser-generated UUID — groups messages into a conversation */
  sessionId: string

  role:    ChatRole
  content: string

  /** Which AI persona produced this message (assistant messages only) */
  persona: ChatPersona

  /** Optional — set when the session belongs to a logged-in user */
  userId?: mongoose.Types.ObjectId

  createdAt: Date
}

// ── Schema ────────────────────────────────────────────────────────────────────

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sessionId: {
      type:     String,
      required: true,
      trim:     true,
      index:    true,   // primary query key — fetch all messages for a session
    },
    role: {
      type:     String,
      enum:     ['user', 'assistant'] satisfies ChatRole[],
      required: true,
    },
    content: {
      type:     String,
      required: true,
      trim:     true,
      maxlength: 8000,
    },
    persona: {
      type:    String,
      enum:    ['netra', 'sahay', 'marg', 'citizen'] satisfies ChatPersona[],
      default: 'citizen',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref:  'User',
    },
  },
  {
    timestamps: true,   // createdAt + updatedAt
  }
)

// ── Indexes ───────────────────────────────────────────────────────────────────

// Most common query: fetch conversation in order
ChatMessageSchema.index({ sessionId: 1, createdAt: 1 })

// TTL — auto-delete chatbot messages after 7 days to keep collection lean
ChatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 })

// ── Model Export (singleton-safe for Next.js hot reload) ─────────────────────

const ChatMessage: Model<IChatMessage> =
  (models.ChatMessage as Model<IChatMessage>) ||
  mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema)

export default ChatMessage
