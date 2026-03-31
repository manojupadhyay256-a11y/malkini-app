'use server'

import { db } from '@/db';
import { users, dailyAccounts, shoppingList, milkLogs, laundryLogs, cylinderLogs } from '@/db/schema';
import { eq, sql, and, isNull, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { createSession, verifySession, deleteSession } from '@/lib/auth';

async function getUserId() {
    const session = await verifySession();
    if (!session || !session.userId) throw new Error("Unauthorized");
    return Number(session.userId);
}

export async function loginOrRegister(name: string, password: string, isLogin: boolean) {
    if (!name || !password) return { error: "Name and password required" };

    if (isLogin) {
        const userRows = await db.select().from(users).where(eq(users.name, name));
        const user = userRows[0];
        if (!user) return { error: "अकाउंट नहीं मिला। नया अकाउंट बनाएँ।" };

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return { error: "पासवर्ड गलत है।" };

        await createSession(user.id, user.name);
        return { success: true };
    } else {
        const userRows = await db.select().from(users).where(eq(users.name, name));
        if (userRows.length > 0) return { error: "यह नाम पहले से लिया हुआ है। दूसरा नाम चुनें।" };

        const hash = await bcrypt.hash(password, 10);
        const [newUser] = await db.insert(users).values({ name, passwordHash: hash }).returning();

        // MIGRATION: If this is the FIRST user, assign all existing rows to this user
        const allUsers = await db.select().from(users);
        if (allUsers.length === 1) {
            await db.update(dailyAccounts).set({ userId: newUser.id }).where(isNull(dailyAccounts.userId));
            await db.update(shoppingList).set({ userId: newUser.id }).where(isNull(shoppingList.userId));
            await db.update(milkLogs).set({ userId: newUser.id }).where(isNull(milkLogs.userId));
            await db.update(laundryLogs).set({ userId: newUser.id }).where(isNull(laundryLogs.userId));
            await db.update(cylinderLogs).set({ userId: newUser.id }).where(isNull(cylinderLogs.userId));
        }

        await createSession(newUser.id, newUser.name);
        return { success: true };
    }
}

export async function logout() {
    await deleteSession();
    redirect('/login');
}

// -- Daily Expenses --
export async function addExpense(category: string, amount: number, description: string = '') {
    const userId = await getUserId();
    await db.insert(dailyAccounts).values({
        userId,
        category,
        amount: amount.toString(), // Needs to be string for pg numeric parsing via Neon
        description
    });
    revalidatePath('/');
}

export async function getMonthlySpend() {
    const userId = await getUserId();
    const result = await db.select({
        total: sql<number>`sum(${dailyAccounts.amount})`
    })
        .from(dailyAccounts)
        .where(
            and(
                eq(dailyAccounts.userId, userId),
                sql`date_trunc('month', ${dailyAccounts.date}) = date_trunc('month', current_date)`
            )
        );

    return parseFloat(result[0]?.total?.toString() || '0');
}

// -- Shopping List --
export async function getShoppingList() {
    const userId = await getUserId();
    return await db.select().from(shoppingList).where(eq(shoppingList.userId, userId)).orderBy(shoppingList.status, shoppingList.dateAdded);
}

export async function addShoppingItem(itemName: string, quantity: string) {
    const userId = await getUserId();
    await db.insert(shoppingList).values({
        userId,
        itemName,
        quantity
    });
    revalidatePath('/');
}

export async function toggleShoppingStatus(id: number, currentStatus: string) {
    const userId = await getUserId();
    const newStatus = currentStatus === 'pending' ? 'purchased' : 'pending';
    await db.update(shoppingList)
        .set({ status: newStatus })
        .where(
            and(
                eq(shoppingList.id, id),
                eq(shoppingList.userId, userId)
            )
        );
    revalidatePath('/');
}

export async function deleteShoppingItem(id: number) {
    const userId = await getUserId();
    await db.delete(shoppingList)
        .where(
            and(
                eq(shoppingList.id, id),
                eq(shoppingList.userId, userId)
            )
        );
    revalidatePath('/');
}

// -- Milk Logging --
export async function addMilkLog(liters: number, dateStr: string) {
    const userId = await getUserId();
    await db.insert(milkLogs).values({
        userId,
        date: dateStr,
        liters: liters.toString()
    });
    revalidatePath('/');
}

export async function deleteMilkLog(id: number) {
    const userId = await getUserId();
    await db.delete(milkLogs)
        .where(
            and(
                eq(milkLogs.id, id),
                eq(milkLogs.userId, userId)
            )
        );
    revalidatePath('/');
}

export async function calculateMilkBill(ratePerLiter: number, monthYYYYMM: string) {
    const userId = await getUserId();
    const unCleared = await db.select().from(milkLogs).where(
        and(
            eq(milkLogs.userId, userId),
            eq(milkLogs.isCleared, false),
            sql`to_char(${milkLogs.date}::date, 'YYYY-MM') = ${monthYYYYMM}`
        )
    );
    const totalLiters = unCleared.reduce((acc, curr) => acc + parseFloat(curr.liters), 0);
    const totalCost = Math.round(totalLiters * ratePerLiter);
    return { success: true, totalCost, totalLiters };
}

export async function clearMilkLogs(ratePerLiter: number, monthYYYYMM: string) {
    const userId = await getUserId();
    const { totalCost, totalLiters } = await calculateMilkBill(ratePerLiter, monthYYYYMM);

    if (totalCost > 0) {
        // 2. Add as a formal expense
        await addExpense(`Milk Bill (${monthYYYYMM})`, totalCost, `Monthly clearance: ${totalLiters}L @ ₹${ratePerLiter}/L`);

        // 3. Mark all as cleared
        await db.update(milkLogs)
            .set({ isCleared: true })
            .where(
                and(
                    eq(milkLogs.userId, userId),
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
    const userId = await getUserId();
    await db.insert(laundryLogs).values({
        userId,
        date: dateStr,
        itemsDescription: description
    });
    revalidatePath('/');
}

export async function deleteLaundryLog(id: number) {
    const userId = await getUserId();
    await db.delete(laundryLogs)
        .where(
            and(
                eq(laundryLogs.id, id),
                eq(laundryLogs.userId, userId)
            )
        );
    revalidatePath('/');
}

export async function calculateLaundryBill(monthYYYYMM: string) {
    const userId = await getUserId();
    const unCleared = await db.select().from(laundryLogs).where(
        and(
            eq(laundryLogs.userId, userId),
            eq(laundryLogs.isCleared, false),
            sql`to_char(${laundryLogs.date}::date, 'YYYY-MM') = ${monthYYYYMM}`
        )
    );
    return { success: true, totalEntries: unCleared.length };
}

export async function clearLaundryLogs(monthYYYYMM: string) {
    const userId = await getUserId();
    const { totalEntries } = await calculateLaundryBill(monthYYYYMM);
    if (totalEntries === 0) return { success: false };

    await db.update(laundryLogs)
        .set({ isCleared: true })
        .where(
            and(
                eq(laundryLogs.userId, userId),
                eq(laundryLogs.isCleared, false),
                sql`to_char(${laundryLogs.date}::date, 'YYYY-MM') = ${monthYYYYMM}`
            )
        );
    revalidatePath('/');
    return { success: true };
}

export async function getUnclearedLogs() {
    const userId = await getUserId();
    const milk = await db.select().from(milkLogs).where(
        and(eq(milkLogs.userId, userId), eq(milkLogs.isCleared, false))
    ).orderBy(milkLogs.date);
    const laundry = await db.select().from(laundryLogs).where(
        and(eq(laundryLogs.userId, userId), eq(laundryLogs.isCleared, false))
    ).orderBy(laundryLogs.date);
    return { milk, laundry };
}

// -- Cylinder Logging --
export async function addCylinderLog(installedDate: string, notes: string = '') {
    const userId = await getUserId();
    await db.insert(cylinderLogs).values({
        userId,
        installedDate,
        notes: notes || null
    });
    revalidatePath('/');
}

export async function deleteCylinderLog(id: number) {
    const userId = await getUserId();
    await db.delete(cylinderLogs)
        .where(
            and(
                eq(cylinderLogs.id, id),
                eq(cylinderLogs.userId, userId)
            )
        );
    revalidatePath('/');
}

export async function getCylinderLogs() {
    const userId = await getUserId();
    return await db.select().from(cylinderLogs).where(
        eq(cylinderLogs.userId, userId)
    ).orderBy(desc(cylinderLogs.installedDate));
}
