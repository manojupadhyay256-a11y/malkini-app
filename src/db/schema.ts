import { pgTable, serial, text, decimal, timestamp, date, varchar, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const dailyAccounts = pgTable('daily_accounts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    category: varchar('category', { length: 50 }).notNull(),
    date: date('date').defaultNow().notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    description: text('description')
});

export const shoppingList = pgTable('shopping_list', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    itemName: varchar('item_name', { length: 100 }).notNull(),
    quantity: varchar('quantity', { length: 50 }).notNull(),
    status: varchar('status', { length: 20 }).default('pending').notNull(),
    dateAdded: timestamp('date_added').defaultNow().notNull()
});

export const milkLogs = pgTable('milk_logs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    date: date('date').defaultNow().notNull(),
    liters: decimal('liters', { precision: 5, scale: 2 }).notNull(),
    isCleared: boolean('is_cleared').default(false).notNull()
});

export const laundryLogs = pgTable('laundry_logs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    date: date('date').defaultNow().notNull(),
    itemsDescription: text('items_description').notNull(),
    isCleared: boolean('is_cleared').default(false).notNull()
});

export const cylinderLogs = pgTable('cylinder_logs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    installedDate: date('installed_date').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull()
});
