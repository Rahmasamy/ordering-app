import { db } from "../../../lib/knex/knex.js";

export async function updateBranchDetails(productId: number, branchId: number, details: { price?: number | undefined; stock?: number | undefined; isAvailable?: boolean | undefined }) {
    const updatePayload: any = {};
    if (details.price !== undefined) updatePayload.price = details.price;
    if (details.stock !== undefined) updatePayload.stock = details.stock;
    if (details.isAvailable !== undefined) updatePayload.is_available = details.isAvailable;

    if (Object.keys(updatePayload).length === 0) return undefined;

    const [updated] = await db("product_branch_details")
        .where({ product_id: productId, branch_id: branchId })
        .update(updatePayload)
        .returning(["id", "branch_id", "product_id", "price", "stock", "is_available"]);
        
    return updated ? {
        id: parseInt(updated.id, 10),
        branchId: parseInt(updated.branch_id, 10),
        productId: parseInt(updated.product_id, 10),
        price: parseFloat(updated.price),
        stock: parseInt(updated.stock, 10),
        isAvailable: Boolean(updated.is_available)
    } : undefined;
}
