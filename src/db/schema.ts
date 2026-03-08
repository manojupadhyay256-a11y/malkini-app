import { pgTable, serial, text, decimal, timestamp, date, varchar, boolean } from 'drizzle-orm/pg-core';

export const dailyAccounts = pgTable('daily_accounts', {
    id: serial('id').primaryKey(),
    category: varchar('category', { length: 50 }).notNull(),
    date: date('date').defaultNow().notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    description: text('description')
});

export const shoppingList = pgTable('shopping_list', {
    id: serial('id').primaryKey(),
    itemName: varchar('item_name', { length: 100 }).notNull(),
    quantity: varchar('quantity', { length: 50 }).notNull(),
    status: varchar('status', { length: 20 }).default('pending').notNull(),
    dateAdded: timestamp('date_added').defaultNow().notNull()
});

export const milkLogs = pgTable('milk_logs', {
    id: serial('id').primaryKey(),
    date: date('date').defaultNow().notNull(),
    liters: decimal('liters', { precision: 5, scale: 2 }).notNull(),
    isCleared: boolean('is_cleared').default(false).notNull()
});

export const laundryLogs = pgTable('laundry_logs', {
    id: serial('id').primaryKey(),
    date: date('date').defaultNow().notNull(),
    itemsDescription: text('items_description').notNull(),
    isCleared: boolean('is_cleared').default(false).notNull()
});
