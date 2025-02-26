import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';
import { usersTable } from '@/utils/db/schema';

// Tables existantes du template (conservées pour référence)
// ... existing code ...

// Énumérations pour le statut et la direction des appels
export const callStatusEnum = pgEnum('call_status', [
  'queued',
  'initiated',
  'ringing',
  'in-progress',
  'completed',
  'busy',
  'failed',
  'no-answer',
  'canceled',
]);

export const callDirectionEnum = pgEnum('call_direction', [
  'inbound',
  'outbound',
]);

// Table pour stocker les appels
export const calls = pgTable('calls', {
  id: text('id').primaryKey(),
  twilioSid: text('twilio_sid').notNull().unique(),
  to: text('to'),
  from: text('from'),
  status: text('status').default('initiated'),
  direction: text('direction').default('outbound'),
  duration: integer('duration'),
  recordingUrl: text('recording_url'),
  transcript: text('transcript'),
  agentId: text('agent_id'),
  userId: text('user_id').references(() => usersTable.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table pour stocker les entrées de conversation des appels
export const callConversations = pgTable('call_conversations', {
  id: text('id').primaryKey(),
  callSid: text('call_sid').notNull().references(() => calls.twilioSid),
  role: text('role').notNull(), // 'user' ou 'assistant'
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Table pour stocker les agents IA
export const aiAgents = pgTable('ai_agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  role: text('role').notNull(),
  objective: text('objective').notNull(),
  persona: text('persona').notNull(),
  guidelines: text('guidelines').notNull(), // Stocké en JSON
  companyInfo: text('company_info').notNull(), // Stocké en JSON
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: text('created_by').references(() => usersTable.id, { onDelete: 'set null' }),
});

// Relations pour les appels
export const callsRelations = relations(calls, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [calls.userId],
    references: [usersTable.id],
  }),
  conversations: many(callConversations),
}));

// Relations pour les conversations
export const callConversationsRelations = relations(callConversations, ({ one }) => ({
  call: one(calls, {
    fields: [callConversations.callSid],
    references: [calls.twilioSid],
  }),
}));

// Relations pour les agents IA
export const aiAgentsRelations = relations(aiAgents, ({ one }) => ({
  creator: one(usersTable, {
    fields: [aiAgents.createdBy],
    references: [usersTable.id],
  }),
})); 