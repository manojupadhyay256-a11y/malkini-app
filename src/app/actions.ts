'use server'

import { db } from '@/db';
import { dailyAccounts, shoppingList, milkLogs, laundryLogs } from '@/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// -- Daily Expenses --
export async function addExpense(category: string, amount: number, description: string = '') {
    await db.insert(dailyAccounts).values({
        category,
        amount: amount.toString(), // Needs to be string for pg numeric parsing via Neon
        description
    });
    revalidatePath('/');
}

export async function getMonthlySpend() {
    const result = await db.select({
        total: sql<number>`sum(${dailyAccounts.amount})`
    })
        .from(dailyAccounts)
        .where(sql`date_trunc('month', ${dailyAccounts.date}) = date_trunc('month', current_date)`);

    return parseFloat(result[0]?.total?.toString() || '0');
}

// -- Shopping List --
export async function getShoppingList() {
    return await db.select().from(shoppingList).orderBy(shoppingList.status, shoppingList.dateAdded);
}

export async function addShoppingItem(itemName: string, quantity: string) {
    await db.insert(shoppingList).values({
        itemName,
        quantity
    });
    revalidatePath('/');
}

export async function toggleShoppingStatus(id: number, currentStatus: string) {
    const newStatus = currentStatus === 'pending' ? 'purchased' : 'pending';
    await db.update(shoppingList)
        .set({ status: newStatus })
        .where(eq(shoppingList.id, id));
    revalidatePath('/');
}

// -- Milk Logging --
export async function addMilkLog(liters: number, dateStr: string) {
    await db.insert(milkLogs).values({
        date: dateStr,
        liters: liters.toString()
    });
    revalidatePath('/');
}

export async function calculateMilkBill(ratePerLiter: number, monthYYYYMM: string) {
    const unCleared = await db.select().from(milkLogs).where(
        and(
            eq(milkLogs.isCleared, false),
            sql`to_char(${milkLogs.date}::date, 'YYYY-MM') = ${monthYYYYMM}`
        )
    );
    const totalLiters = unCleared.reduce((acc, curr) => acc + parseFloat(curr.liters), 0);
    const totalCost = Math.round(totalLiters * ratePerLiter);
    return { success: true, totalCost, totalLiters };
}

export async function clearMilkLogs(ratePerLiter: number, monthYYYYMM: string) {
    const { totalCost, totalLiters } = await calculateMilkBill(ratePerLiter, monthYYYYMM);

    if (totalCost > 0) {
        // 2. Add as a formal expense
        await addExpense(`Milk Bill (${monthYYYYMM})`, totalCost, `Monthly clearance: ${totalLiters}L @ ₹${ratePerLiter}/L`);

        // 3. Mark all as cleared
        await db.update(milkLogs)
            .set({ isCleared: true })
            .where(
                and(
                    eq(milkLogs.isCleared, false),
                    sql`to_char(${milkLogs.date}::date, 'YYYY-MM') = ${monthYYYYMM}`
                )
            );
    }

    revalidatePath('/');
    return { success: true, totalCost, totalLiters };
}

// -- Laundry Logging --
export async function addLaundryLog(description: string, dateStr: string) {
    await db.insert(laundryLogs).values({
        date: dateStr,
        itemsDescription: description
    });
    revalidatePath('/');
}

export async function calculateLaundryBill(monthYYYYMM: string) {
    const unCleared = await db.select().from(laundryLogs).where(
        and(
            eq(laundryLogs.isCleared, false),
            sql`to_char(${laundryLogs.date}::date, 'YYYY-MM') = ${monthYYYYMM}`
        )
    );
    return { success: true, totalEntries: unCleared.length };
}

export async function clearLaundryLogs(monthYYYYMM: string) {
    const { totalEntries } = await calculateLaundryBill(monthYYYYMM);
    if (totalEntries === 0) return { success: false };

    await db.update(laundryLogs)
        .set({ isCleared: true })
        .where(
            and(
                eq(laundryLogs.isCleared, false),
                sql`to_char(${laundryLogs.date}::date, 'YYYY-MM') = ${monthYYYYMM}`
            )
        );
    revalidatePath('/');
    return { success: true };
}

export async function getUnclearedLogs() {
    const milk = await db.select().from(milkLogs).where(eq(milkLogs.isCleared, false)).orderBy(milkLogs.date);
    const laundry = await db.select().from(laundryLogs).where(eq(laundryLogs.isCleared, false)).orderBy(laundryLogs.date);
    return { milk, laundry };
}
