'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";
import { eq, like, or, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

/**
 * Ensures the caller is an admin
 */
async function verifyAdmin() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    
    if (!session || session.user.role !== 'admin') {
        throw new Error("Unauthorized: Administrative clearance required.");
    }
    
    return session;
}

/**
 * Get active users with filtering from Neon (Auth DB)
 */
export async function adminGetUsers(query: string = "") {
    await verifyAdmin();

    return await db.select().from(userTable).where(query 
            ? or(
                like(userTable.name, `%${query}%`),
                like(userTable.email, `%${query}%`)
            )
            : undefined)
            .orderBy(desc(userTable.createdAt));
}

/**
 * Ban or unban a user
 */
export async function adminSetBanStatus(userId: string, banned: boolean, reason: string = "") {
    const session = await verifyAdmin();

    // Update user in Neon
    await db.update(userTable)
        .set({ banned, banReason: banned ? reason : null })
        .where(eq(userTable.id, userId));

    // Log the action in Supabase
    const supabase = await createClient();
    await supabase.from('audit_logs').insert([{
        user_id: session.user.id,
        action: banned ? "BAN_USER" : "UNBAN_USER",
        category: "ADMIN",
        severity: "WARN",
        metadata: {
            details: { targetUserId: userId, reason }
        },
        timestamp: new Date().toISOString()
    }]);

    revalidatePath("/admin/users");
}

/**
 * Assign a role to a user
 */
export async function adminSetRole(userId: string, role: string) {
    const session = await verifyAdmin();

    // Update user in Neon
    await db.update(userTable)
        .set({ role })
        .where(eq(userTable.id, userId));

    // Log in Supabase
    const supabase = await createClient();
    await supabase.from('audit_logs').insert([{
        user_id: session.user.id,
        action: "CHANGE_ROLE",
        category: "ADMIN",
        severity: "INFO",
        metadata: {
            details: { targetUserId: userId, newRole: role }
        },
        timestamp: new Date().toISOString()
    }]);

    revalidatePath("/admin/users");
}

/**
 * Get detailed audit logs from Supabase
 */
export async function adminGetLogs(category?: string) {
    await verifyAdmin();

    const supabase = await createClient();
    let query = supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
    
    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

/**
 * Update system settings in Supabase
 */
export async function adminUpdateSettings(key: string, value: string) {
    const session = await verifyAdmin();

    const supabase = await createClient();
    const { error } = await supabase.from('system_settings').upsert({
        key,
        value,
        updated_by: session.user.id,
        updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

    if (error) throw error;

    revalidatePath("/admin/settings");
}

