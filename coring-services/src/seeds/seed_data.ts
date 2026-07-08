import { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries in order of dependency
    await knex("offers").del();
    await knex("testimonials").del();
    await knex("ingredients").del();
    await knex("product_stories").del();
    await knex("chefs").del();
    await knex("product_branch_details").del();
    await knex("products").del();
    await knex("product_categories").del();
    await knex("restaurant_branches").del();
    await knex("restaurants").del();
    await knex("users").where("email", "owner@example.com").del();

    const passwordHash = await bcrypt.hash("Password123!", 10);
    const now = new Date();

    // Ensure development users exist
    const superEmail = "superadmin@ogmail.com";
    let superUser = await knex("users").where({ email: superEmail }).first();
    if (!superUser) {
        const superHash = await bcrypt.hash("SuperAdmin123", 10);
        const [inserted] = await knex("users").insert({
            email: superEmail,
            phone: "0000000000",
            name: "Super Admin",
            password_hash: superHash,
            system_role: "system_admin",
            created_at: now,
            updated_at: now
        }).returning("*");
        superUser = inserted;
    }

    const restEmail = "restaurant@ogmail.com";
    let restUser = await knex("users").where({ email: restEmail }).first();
    if (!restUser) {
        const restHash = await bcrypt.hash("Restaurant123", 10);
        const [inserted] = await knex("users").insert({
            email: restEmail,
            phone: "0000000001",
            name: "Restaurant Owner",
            password_hash: restHash,
            system_role: "restaurant_user",
            created_at: now,
            updated_at: now
        }).returning("*");
        restUser = inserted;
    }

    const custEmail = "customer@ogmail.com";
    let custUser = await knex("users").where({ email: custEmail }).first();
    if (!custUser) {
        const custHash = await bcrypt.hash("Customer123", 10);
        const [inserted] = await knex("users").insert({
            email: custEmail,
            phone: "0000000002",
            name: "Customer User",
            password_hash: custHash,
            system_role: "customer",
            created_at: now,
            updated_at: now
        }).returning("*");
        custUser = inserted;
    }

    // 1. Create a Restaurant Owner user
    const [owner] = await knex("users").insert({
        email: "owner@example.com",
        phone: "12345678901",
        name: "Main Owner",
        password_hash: passwordHash,
        system_role: "restaurant_user",
        created_at: now,
        updated_at: now
    }).returning("id");

    const ownerId = owner.id;

    // 2. Define 5 Restaurants
    const restaurantsData = [
        { name: "Pizza Palace", logo_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80", status: "active", primary_country: "EG" },
        { name: "Burger Bistro", logo_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80", status: "active", primary_country: "EG" },
        { name: "Green Garden", logo_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80", status: "active", primary_country: "EG" },
        { name: "Sweet Delights", logo_url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80", status: "active", primary_country: "EG" },
        { name: "Morning Brew", logo_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80", status: "active", primary_country: "EG" }
    ];

    const insertedRestaurants: any[] = [];
    for (const r of restaurantsData) {
        const [res] = await knex("restaurants").insert({
            owner_id: ownerId,
            name: r.name,
            logo_url: r.logo_url,
            status: r.status,
            primary_country: r.primary_country,
            created_at: now,
            updated_at: now,
            status_updated_at: now
        }).returning(["id", "name"]);
        insertedRestaurants.push(res);
    }

    // 3. Define 5 Branches (placed in Cairo, Egypt to match geolocation test defaults)
    // Cairo coords: lat 30.0444, lng 31.2357
    const branchCoords = [
        { lat: 30.0444, lng: 31.2357, label: "Downtown Cairo Branch", address_text: "15 Talaat Harb St, Downtown Cairo" },
        { lat: 30.0450, lng: 31.2360, label: "Zamalek Branch", address_text: "26 July St, Zamalek" },
        { lat: 30.0430, lng: 31.2340, label: "Garden City Branch", address_text: "Corniche El Nil, Garden City" },
        { lat: 30.0460, lng: 31.2370, label: "Maadi Branch", address_text: "Road 9, Maadi" },
        { lat: 30.0420, lng: 31.2330, label: "Heliopolis Branch", address_text: "El Merghany St, Heliopolis" }
    ];

    const insertedBranches: any[] = [];
    for (let i = 0; i < insertedRestaurants.length; i++) {
        const res = insertedRestaurants[i];
        const coords = branchCoords[i];
        const [branch] = await knex("restaurant_branches").insert({
            restaurant_id: res.id,
            country_code: "EG",
            address_text: coords.address_text,
            label: coords.label,
            lat: coords.lat,
            lng: coords.lng,
            is_active: true,
            opens_at: "08:00:00",
            closes_at: "23:00:00",
            accept_orders: true,
            created_at: now,
            updated_at: now,
            delivery_radius: 15, // 15 km
            currency: "EGP",
            commission: 12
        }).returning(["id", "restaurant_id"]);
        insertedBranches.push(branch);
    }

    // 4. Define 5 Categories
    // Trending, Healthy, Fast Food, Desserts, Coffee
    const categoryNames = ["Trending", "Healthy", "Fast Food", "Desserts", "Coffee"];
    
    // We insert categories for all restaurants so they have choices
    const insertedCategoriesMap: { [key: string]: number[] } = {}; // categoryName -> categoryIds
    for (const catName of categoryNames) {
        insertedCategoriesMap[catName] = [];
        for (const res of insertedRestaurants) {
            const [cat] = await knex("product_categories").insert({
                restaurant_id: res.id,
                name: catName,
                created_at: now,
                updated_at: now
            }).returning("id");
            insertedCategoriesMap[catName].push(Number(cat.id));
        }
    }

    // Helper to get category ID for a specific restaurant and category name
    const getCategoryId = (restaurantId: number, name: string): number => {
        const resIdx = insertedRestaurants.findIndex(r => Number(r.id) === restaurantId);
        return insertedCategoriesMap[name][resIdx];
    };

    // 5. Define 10 Products with real descriptions, category associations and detailed customization options
    const productsData = [
        {
            name: "Classic Pepperoni Pizza",
            description: "Loaded with double pepperoni, mozzarella cheese, and signature tomato sauce.",
            image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80",
            restaurantName: "Pizza Palace",
            categoryName: "Fast Food",
            is_trending: true,
            is_chef_special: true,
            is_popular: true,
            calories: 680,
            is_dairy_free: false,
            contains_gluten: true,
            reviews_count: 128,
            rating: 4.8,
            image_urls: [
                "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80"
            ],
            doneness_options: ["Medium Rare", "Medium", "Well Done"],
            addons: [
                { name: "Extra Cheddar Cheese", price: 1.50 },
                { name: "Crispy Turkey Bacon", price: 2.50 },
                { name: "Organic Fried Egg", price: 1.00 }
            ],
            price: 1299 // $12.99
        },
        {
            name: "Four Cheese Pizza",
            description: "A blend of rich mozzarella, cheddar, blue cheese, and parmesan.",
            image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
            restaurantName: "Pizza Palace",
            categoryName: "Trending",
            is_trending: true,
            is_chef_special: false,
            is_popular: true,
            calories: 720,
            is_dairy_free: false,
            contains_gluten: true,
            reviews_count: 96,
            rating: 4.6,
            image_urls: [
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80"
            ],
            doneness_options: null,
            addons: [
                { name: "Extra Mozzarella", price: 2.00 },
                { name: "Garlic Dip", price: 0.50 }
            ],
            price: 1600
        },
        {
            name: "Ultimate Cheeseburger",
            description: "Premium beef patty, cheddar cheese, lettuce, tomato, and secret bistro sauce.",
            image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
            restaurantName: "Burger Bistro",
            categoryName: "Fast Food",
            is_trending: true,
            is_chef_special: true,
            is_popular: true,
            calories: 850,
            is_dairy_free: false,
            contains_gluten: true,
            reviews_count: 312,
            rating: 4.9,
            image_urls: [
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80"
            ],
            doneness_options: ["Rare", "Medium", "Well Done"],
            addons: [
                { name: "Extra Cheddar Cheese", price: 1.50 },
                { name: "Crispy Turkey Bacon", price: 2.50 }
            ],
            price: 1100
        },
        {
            name: "Bacon & Egg Burger",
            description: "Juicy burger topped with crispy bacon, sunny-side up egg, and caramelized onions.",
            image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
            restaurantName: "Burger Bistro",
            categoryName: "Trending",
            is_trending: false,
            is_chef_special: false,
            is_popular: false,
            calories: 980,
            is_dairy_free: false,
            contains_gluten: true,
            reviews_count: 45,
            rating: 4.4,
            image_urls: [
                "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80"
            ],
            doneness_options: ["Medium", "Well Done"],
            addons: [
                { name: "Organic Fried Egg", price: 1.00 }
            ],
            price: 1350
        },
        {
            name: "Avocado Quinoa Salad",
            description: "Fresh avocado, organic quinoa, cherry tomatoes, cucumbers, mixed greens with lemon-herb dressing.",
            image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
            restaurantName: "Green Garden",
            categoryName: "Healthy",
            is_trending: true,
            is_chef_special: true,
            is_popular: true,
            calories: 380,
            is_dairy_free: true,
            contains_gluten: false,
            reviews_count: 88,
            rating: 4.7,
            image_urls: [
                "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"
            ],
            doneness_options: null,
            addons: [
                { name: "Grilled Chicken", price: 3.50 },
                { name: "Extra Avocado", price: 2.00 }
            ],
            price: 950
        },
        {
            name: "Green Goddess Bowl",
            description: "Broccoli, edamame, spinach, avocado, green peas, and brown rice with ginger-sesame dressing.",
            image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
            restaurantName: "Green Garden",
            categoryName: "Healthy",
            is_trending: false,
            is_chef_special: false,
            is_popular: false,
            calories: 420,
            is_dairy_free: true,
            contains_gluten: false,
            reviews_count: 54,
            rating: 4.5,
            image_urls: [
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80"
            ],
            doneness_options: null,
            addons: [
                { name: "Organic Tofu", price: 2.50 }
            ],
            price: 1050
        },
        {
            name: "Fudge Chocolate Cake",
            description: "Rich layered chocolate cake with creamy fudge frosting and chocolate flakes.",
            image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
            restaurantName: "Sweet Delights",
            categoryName: "Desserts",
            is_trending: true,
            is_chef_special: false,
            is_popular: true,
            calories: 520,
            is_dairy_free: false,
            contains_gluten: true,
            reviews_count: 215,
            rating: 4.8,
            image_urls: [
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80"
            ],
            doneness_options: null,
            addons: [
                { name: "Vanilla Ice Cream Scoop", price: 1.50 },
                { name: "Chocolate Sauce Drizzle", price: 0.50 }
            ],
            price: 750
        },
        {
            name: "Red Velvet Cupcake",
            description: "Classic red velvet cupcake with premium cream cheese frosting.",
            image_url: "https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?w=600&auto=format&fit=crop&q=80",
            restaurantName: "Sweet Delights",
            categoryName: "Desserts",
            is_trending: false,
            is_chef_special: false,
            is_popular: false,
            calories: 310,
            is_dairy_free: false,
            contains_gluten: true,
            reviews_count: 67,
            rating: 4.6,
            image_urls: [
                "https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?w=600&auto=format&fit=crop&q=80"
            ],
            doneness_options: null,
            addons: [],
            price: 350
        },
        {
            name: "Caramel Macchiato",
            description: "Freshly brewed espresso, steamed milk, vanilla syrup, topped with caramel drizzle.",
            image_url: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80",
            restaurantName: "Morning Brew",
            categoryName: "Coffee",
            is_trending: true,
            is_chef_special: false,
            is_popular: true,
            calories: 280,
            is_dairy_free: false,
            contains_gluten: false,
            reviews_count: 142,
            rating: 4.7,
            image_urls: [
                "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80"
            ],
            doneness_options: null,
            addons: [
                { name: "Extra Espresso Shot", price: 1.00 },
                { name: "Caramel Drizzle", price: 0.50 }
            ],
            price: 550
        },
        {
            name: "Spanish Latte",
            description: "Double shot espresso with condensed milk and steamed textured milk.",
            image_url: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
            restaurantName: "Morning Brew",
            categoryName: "Coffee",
            is_trending: false,
            is_chef_special: false,
            is_popular: false,
            calories: 320,
            is_dairy_free: false,
            contains_gluten: false,
            reviews_count: 73,
            rating: 4.5,
            image_urls: [
                "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80"
            ],
            doneness_options: null,
            addons: [
                { name: "Oat Milk Swap", price: 0.75 }
            ],
            price: 600
        }
    ];

    for (const p of productsData) {
        const res = insertedRestaurants.find(r => r.name === p.restaurantName);
        if (!res) continue;

        const catId = getCategoryId(Number(res.id), p.categoryName);

        const [prod] = await knex("products").insert({
            name: p.name,
            description: p.description,
            image_url: p.image_url,
            restaurant_id: res.id,
            category_id: catId,
            is_trending: p.is_trending,
            is_chef_special: p.is_chef_special,
            is_popular: p.is_popular,
            calories: p.calories,
            is_dairy_free: p.is_dairy_free,
            contains_gluten: p.contains_gluten,
            reviews_count: p.reviews_count,
            rating: p.rating,
            image_urls: JSON.stringify(p.image_urls),
            doneness_options: p.doneness_options ? JSON.stringify(p.doneness_options) : null,
            addons: JSON.stringify(p.addons),
            created_at: now,
            updated_at: now
        }).returning("id");

        // Update auto-inserted branch details to reflect actual seed prices & availability
        await knex("product_branch_details")
            .where("product_id", prod.id)
            .update({
                price: p.price,
                stock: 100,
                is_available: true
            });
    }

    const burgerProduct = await knex("products").where("name", "Ultimate Cheeseburger").first();
    const sweetDelights = insertedRestaurants.find(r => r.name === "Sweet Delights");
    const burgerBistro = insertedRestaurants.find(r => r.name === "Burger Bistro");
    const redVelvetProduct = await knex("products").where("name", "Red Velvet Cupcake").first();

    // 6. Chef, story, ingredients, and testimonials (product detail page content)
    const [chef] = await knex("chefs").insert({
        name: "Chef Julian Rossi",
        title: "Executive Culinary Officer",
        image_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=80",
        quote: "No compromises. Only the finest seasonal truffles make it to your plate. Our kitchen embraces precision food technology and custom heat chambers to lock in flavor.",
        created_at: now,
        updated_at: now,
    }).returning("id");

    if (burgerProduct) {
        await knex("product_stories").insert({
            title: "Crafting the Perfect Bite",
            content: "Inspired by the rolling hills of Umbria, Italy, our Signature Truffle Burger brings together wild black truffles, premium Wagyu beef, and house-baked brioche. Six months of development in our test kitchen went into perfecting the balance of earthy truffle aroma and juicy, flame-kissed patty.",
            featured_quote: "No compromises. We source our seasonal truffles from certified experts to ensure that every single burger delivered holds the exact standards we set in our test laboratories.",
            product_id: burgerProduct.id,
            chef_id: chef.id,
            created_at: now,
            updated_at: now,
        });

        const ingredientsData = [
            { name: "Wild Black Truffles", description: "Seasonally sourced from certified Umbrian foragers", sort_order: 1 },
            { name: "Premium Wagyu Beef Patty", description: "80/20 blend, hand-formed daily", sort_order: 2 },
            { name: "House-Baked Brioche Bun", description: "Butter-rich brioche with a golden crust", sort_order: 3 },
            { name: "Aged Cheddar", description: "Sharp Wisconsin cheddar, melted to order", sort_order: 4 },
            { name: "Truffle Aioli", description: "House-made with black truffle oil and garlic", sort_order: 5 },
        ];

        for (const ing of ingredientsData) {
            await knex("ingredients").insert({
                name: ing.name,
                description: ing.description,
                product_id: burgerProduct.id,
                sort_order: ing.sort_order,
                created_at: now,
                updated_at: now,
            });
        }

        const productTestimonials = [
            {
                content: "The truffle flavor is incredible — easily the best burger I've had in Cairo.",
                rating: 5.0,
                author_name: "Ahmed K.",
            },
            {
                content: "Perfectly cooked every time. The Wagyu patty melts in your mouth.",
                rating: 4.8,
                author_name: "Sarah M.",
            },
            {
                content: "Worth every penny. The brioche bun alone is a masterpiece.",
                rating: 4.9,
                author_name: "Omar H.",
            },
        ];

        for (const t of productTestimonials) {
            await knex("testimonials").insert({
                content: t.content,
                rating: t.rating,
                author_name: t.author_name,
                product_id: burgerProduct.id,
                created_at: now,
                updated_at: now,
            });
        }
    }

    if (burgerBistro) {
        await knex("testimonials").insert({
            content: "Burger Bistro never disappoints. Fresh ingredients and bold flavors every visit.",
            rating: 4.7,
            author_name: "Layla F.",
            restaurant_id: burgerBistro.id,
            created_at: now,
            updated_at: now,
        });
    }

    // 7. Promotional offers
    if (burgerBistro) {
        await knex("offers").insert({
            badge_text: "50% OFF",
            image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
            title: "50% OFF your first order from Burger Bistro!",
            description: "Applicable to any premium burger or main menu item including the Ultimate Cheeseburger.",
            promo_code: "BISTRO50",
            expires_at: "2026-12-31",
            restaurant_id: burgerBistro.id,
            is_active: true,
            created_at: now,
            updated_at: now,
        });
    }

    if (sweetDelights && redVelvetProduct) {
        await knex("offers").insert({
            badge_text: "FREE DRINK",
            image_url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80",
            title: "Free Specialty Drink on pastry boxes!",
            description: "Buy any pastry bundle box and receive an organic craft cold brew coffee entirely free.",
            promo_code: "SWEETGIFT",
            expires_at: "2026-11-15",
            restaurant_id: sweetDelights.id,
            product_id: redVelvetProduct.id,
            is_active: true,
            created_at: now,
            updated_at: now,
        });
    }

    // 8. Seed Gourmet Kitchen specifically for the logged-in restaurant user
    if (restUser) {
        const [gourmetRest] = await knex("restaurants").insert({
            owner_id: restUser.id,
            name: "Gourmet Kitchen",
            logo_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200",
            status: "active",
            primary_country: "EG",
            created_at: now,
            updated_at: now,
            status_updated_at: now
        }).returning("*");

        const [gourmetBranch] = await knex("restaurant_branches").insert({
            restaurant_id: gourmetRest.id,
            country_code: "EG",
            address_text: "123 Nile Corniche, Maadi, Cairo",
            label: "Maadi Main Branch",
            lat: 30.0444,
            lng: 31.2357,
            is_active: true,
            opens_at: "08:00:00",
            closes_at: "23:00:00",
            accept_orders: true,
            created_at: now,
            updated_at: now,
            delivery_radius: 15,
            currency: "EGP",
            commission: 12
        }).returning("*");

        const ownerRole = await knex("roles").where({ name: "owner" }).first();
        if (ownerRole) {
            await knex("restaurant_members").insert({
                restaurant_id: gourmetRest.id,
                user_id: restUser.id,
                role_id: ownerRole.id,
                status: "active",
                created_at: now,
                updated_at: now
            });
        }

        const gourmetProducts = [
            {
                name: "Gourmet Truffle Burger",
                description: "Signature beef patty infused with premium truffles and aged cheese.",
                image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
                categoryName: "Trending",
                price: 18000,
                stock: 100
            },
            {
                name: "Gourmet Crispy Fries",
                description: "Golden brown crispy fries seasoned with rosemary and parmesan.",
                image_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
                categoryName: "Healthy",
                price: 5000,
                stock: 100
            }
        ];

        const gourmetCategoriesMap: { [key: string]: number } = {};
        for (const catName of ["Trending", "Healthy"]) {
            const [cat] = await knex("product_categories").insert({
                restaurant_id: gourmetRest.id,
                name: catName,
                created_at: now,
                updated_at: now
            }).returning("id");
            gourmetCategoriesMap[catName] = Number(cat.id);
        }

        for (const p of gourmetProducts) {
            const [prod] = await knex("products").insert({
                name: p.name,
                description: p.description,
                image_url: p.image_url,
                restaurant_id: gourmetRest.id,
                category_id: gourmetCategoriesMap[p.categoryName],
                is_trending: true,
                is_chef_special: true,
                is_popular: true,
                calories: 500,
                is_dairy_free: false,
                contains_gluten: true,
                reviews_count: 50,
                rating: 4.8,
                image_urls: JSON.stringify([p.image_url]),
                doneness_options: JSON.stringify(["Medium", "Well Done"]),
                addons: JSON.stringify([]),
                created_at: now,
                updated_at: now
            }).returning("id");

            await knex("product_branch_details")
                .where("product_id", prod.id)
                .update({
                    price: p.price,
                    stock: p.stock,
                    is_available: true
                });
        }
    }
}
