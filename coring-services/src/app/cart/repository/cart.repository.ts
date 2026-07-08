import { db } from "../../../lib/knex/knex";
import { Cart, CartItem } from "../entity/cart.entity";

export async function findActiveCartByUserId(userId: number): Promise<Cart | null> {
    const row = await db("carts")
        .where("user_id", userId)
        .where("status", "active")
        .first();
    
    if (!row) return null;
    return {
        id: Number(row.id),
        userId: Number(row.user_id),
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

export async function createCart(userId: number): Promise<Cart> {
    const [row] = await db("carts")
        .insert({ user_id: userId, status: "active" })
        .returning("*");
    
    return {
        id: Number(row.id),
        userId: Number(row.user_id),
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

export async function findCartItem(
    cartId: number, 
    productId: number, 
    selectedDoneness: string | undefined, 
    selectedAddons: string[]
): Promise<CartItem | null> {
    // Sort addons to ensure consistent JSON matching
    const sortedAddons = [...selectedAddons].sort();
    
    let query = db("cart_items")
        .where("cart_id", cartId)
        .where("product_id", productId);
        
    if (selectedDoneness) {
        query = query.where("selected_doneness", selectedDoneness);
    } else {
        query = query.whereNull("selected_doneness");
    }
    
    // Compare JSONB using postgres operator @> and <@ for exact match or stringify
    // Safest way is to stringify array
    const row = await query.andWhereRaw("selected_addons::jsonb = ?::jsonb", [JSON.stringify(sortedAddons)]).first();
    
    if (!row) return null;
    return mapCartItem(row);
}

export async function addCartItem(
    cartId: number, 
    productId: number, 
    quantity: number, 
    unitPrice: number, 
    selectedDoneness: string | undefined, 
    selectedAddons: string[]
): Promise<CartItem> {
    const sortedAddons = [...selectedAddons].sort();
    
    const [row] = await db("cart_items")
        .insert({
            cart_id: cartId,
            product_id: productId,
            quantity: quantity,
            unit_price: unitPrice,
            selected_doneness: selectedDoneness || null,
            selected_addons: JSON.stringify(sortedAddons)
        })
        .returning("*");
        
    return mapCartItem(row);
}

export async function updateCartItemQuantity(itemId: number, quantity: number): Promise<CartItem> {
    const [row] = await db("cart_items")
        .where("id", itemId)
        .update({ quantity })
        .returning("*");
        
    return mapCartItem(row);
}

export async function removeCartItem(cartId: number, productId: number): Promise<void> {
    // We remove all items with this product id from the cart (unless we want to remove specific customizations)
    // The requirement said "User removes Phone Case DELETE /cart/items/205", implying removing by product id
    await db("cart_items")
        .where("cart_id", cartId)
        .where("product_id", productId)
        .delete();
}

export async function clearCartItems(cartId: number): Promise<void> {
    await db("cart_items")
        .where("cart_id", cartId)
        .delete();
}

export async function getCartItemsWithProductDetails(cartId: number) {
    const rows = await db("cart_items as ci")
        .join("products as p", "ci.product_id", "p.id")
        .where("ci.cart_id", cartId)
        .select(
            "ci.id",
            "ci.cart_id",
            "ci.product_id",
            "ci.quantity",
            "ci.unit_price",
            "ci.selected_doneness",
            "ci.selected_addons",
            "ci.created_at",
            "p.name",
            "p.image_url",
            "p.is_chef_special",
            "p.is_popular",
            "p.restaurant_id"
        )
        .orderBy("ci.created_at", "asc");
        
    return rows.map((row: any) => ({
        id: Number(row.id),
        cartId: Number(row.cart_id),
        productId: Number(row.product_id),
        quantity: row.quantity,
        unitPrice: row.unit_price,
        selectedDoneness: row.selected_doneness,
        selectedAddons: typeof row.selected_addons === 'string' ? JSON.parse(row.selected_addons) : row.selected_addons,
        createdAt: row.created_at,
        product: {
            id: Number(row.product_id),
            name: row.name,
            imageUrl: row.image_url,
            isChefSpecial: row.is_chef_special,
            isPopular: row.is_popular,
            restaurantId: Number(row.restaurant_id)
        },
        subtotal: Number((row.quantity * row.unit_price).toFixed(2))
    }));
}

function mapCartItem(row: any): CartItem {
    return {
        id: Number(row.id),
        cartId: Number(row.cart_id),
        productId: Number(row.product_id),
        quantity: row.quantity,
        unitPrice: Number(row.unit_price),
        selectedDoneness: row.selected_doneness || undefined,
        selectedAddons: typeof row.selected_addons === 'string' ? JSON.parse(row.selected_addons) : row.selected_addons,
        createdAt: row.created_at
    };
}
