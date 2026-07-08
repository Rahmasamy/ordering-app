import { db } from "../../../lib/knex/knex";

export async function logActivity(
    restaurantId: number,
    userId: number | null,
    userName: string,
    action: string,
    type: 'update' | 'alert' | 'status',
    details?: string
): Promise<void> {
    await db("activity_logs").insert({
        restaurant_id: restaurantId,
        user_id: userId,
        user_name: userName,
        action,
        type,
        details: details || null,
        created_at: new Date()
    });
}

export async function getLatestLogs(
    restaurantId: number,
    limit = 10
): Promise<any[]> {
    const rows = await db("activity_logs")
        .where("restaurant_id", restaurantId)
        .orderBy("created_at", "desc")
        .limit(limit);

    return rows.map(row => ({
        id: String(row.id),
        time: formatRelativeTime(row.created_at),
        user: row.user_name,
        action: row.action,
        details: row.details || "",
        type: row.type
    }));
}

function formatRelativeTime(date: Date): string {
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    return new Date(date).toLocaleDateString();
}
