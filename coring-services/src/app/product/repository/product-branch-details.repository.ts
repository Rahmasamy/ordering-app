import {db} from "../../../lib/knex/knex";
import {ProductBranchDetails} from "../entity/product-branch-details.entity";

const PBD_COLUMNS = ['id', 'branch_id', 'product_id', 'price', 'stock', 'is_available'];

function toEntity(row: any): ProductBranchDetails {
    return new ProductBranchDetails({
        id: row.id,
        branchId: row.branch_id,
        productId: row.product_id,
        price: row.price,
        stock: row.stock,
        isAvailable: row.is_available,
    });
}

export async function updateBranchDetails(branchId: number, productId: number, data: {price?: number, stock?: number, isAvailable?: boolean}): Promise<ProductBranchDetails> {
    const existing = await db("product_branch_details")
        .where("branch_id", branchId)
        .where("product_id", productId)
        .first();

    let row;
    if (existing) {
        const [updated] = await db("product_branch_details")
            .where("branch_id", branchId)
            .where("product_id", productId)
            .update({
                price: data.price,
                stock: data.stock,
                is_available: data.isAvailable,
            })
            .returning(PBD_COLUMNS);
        row = updated;
    } else {
        const [inserted] = await db("product_branch_details")
            .insert({
                branch_id: branchId,
                product_id: productId,
                price: data.price ?? 0,
                stock: data.stock ?? 0,
                is_available: data.isAvailable ?? false,
            })
            .returning(PBD_COLUMNS);
        row = inserted;
    }
    return toEntity(row);
}
