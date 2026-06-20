export class ProductCategoryBranchDetails {

    id?: number;
    product_id?: number;
    branch_id?: number;
    price?: number;
    stock?: number;
    is_available?: boolean;
    created_at?: Date;

    constructor(detailsPartial?: Partial<ProductCategoryBranchDetails>) {
        Object.assign(this, detailsPartial);
    }
}