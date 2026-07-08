import {db} from "../../../lib/knex/knex";
import {AppError} from "../../../lib/error/AppError";

export interface StockItem {
    productId: number;
    quantity: number;
}

export interface StockApplied {
    productId: number;
    newStock: number;
}

export interface StockResult {
    ok: true;
    applied: StockApplied[];
}

export async function reserveStock(branchId: number, items: StockItem[]): Promise<StockResult> {
    return await db.transaction(async (trx) => {
        const applied: StockApplied[] = [];

        for (const item of items) {
            const row = await trx("product_branch_details")
                .select("stock", "is_available")
                .where("branch_id", branchId)
                .where("product_id", item.productId)
                .forUpdate()
                .first();

            if (!row) {
                throw new AppError(`Product ${item.productId} not found in branch ${branchId}`, 400);
            }

            if (!row.is_available) {
                throw new AppError(`Product ${item.productId} is not available`, 400);
            }

            if (row.stock < item.quantity) {
                throw new AppError(`Insufficient stock for product ${item.productId}. Available: ${row.stock}, Requested: ${item.quantity}`, 400);
            }

            const newStock = row.stock - item.quantity;

            await trx("product_branch_details")
                .where("branch_id", branchId)
                .where("product_id", item.productId)
                .update({ stock: newStock });

            applied.push({
                productId: item.productId,
                newStock,
            });
        }

        return {
            ok: true,
            applied,
        };
    });
}

export async function releaseStock(branchId: number, items: StockItem[]): Promise<StockResult> {
    return await db.transaction(async (trx) => {
        const applied: StockApplied[] = [];

        for (const item of items) {
            const row = await trx("product_branch_details")
                .select("stock")
                .where("branch_id", branchId)
                .where("product_id", item.productId)
                .forUpdate()
                .first();

            if (!row) {
                throw new AppError(`Product ${item.productId} not found in branch ${branchId}`, 400);
            }

            const newStock = row.stock + item.quantity;

            await trx("product_branch_details")
                .where("branch_id", branchId)
                .where("product_id", item.productId)
                .update({ stock: newStock });

            applied.push({
                productId: item.productId,
                newStock,
            });
        }

        return {
            ok: true,
            applied,
        };
    });
}
