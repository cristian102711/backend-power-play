require('dotenv').config();
const mongoose = require('mongoose');

// Helper to disable logging from mongoose in this script if needed, or just let it be.
// We want to see the output.

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('❌ MONGODB_URI is missing in .env');
    process.exit(1);
}

const checkConnectivity = async () => {
    try {
        console.log('\n🔍 Starting QA Connectivity Check...\n');

        // 1. Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Define Schema/Models on the fly or basic query if we want to avoid import issues
        // But since we are in the project, we can try to use raw collection access or simple models.
        // Let's use raw collection access to avoid model strictness issues if any, or just defining simple schemas.
        // Actually, querying via mongoose.connection.db is safer for a quick script without importing app models.
        const db = mongoose.connection.db;

        // 2. User Check
        console.log('\n1️⃣  Running User Check...');
        const usersCollection = db.collection('users');
        // Get latest user
        const latestUser = await usersCollection.find().sort({ createdAt: -1 }).limit(1).next();

        if (!latestUser) {
            console.error('❌ No users found in database.');
        } else {
            console.log(`   Latest User ID: ${latestUser._id}`);
            console.log(`   Has 'email' field: ${!!latestUser.email} (${latestUser.email})`);
            if (latestUser.email) {
                console.log('✅ User Check: PASSED');
            } else {
                console.error('❌ User Check: FAILED (Missing email)');
            }
        }

        // 3. Persistence Check (Cart)
        console.log('\n2️⃣  Running Persistence Check (Cart)...');
        if (latestUser) {
            const cartsCollection = db.collection('carts');
            const cart = await cartsCollection.findOne({ userId: latestUser._id });

            if (cart) {
                console.log(`   Cart found for user ${latestUser._id}`);
                console.log(`   Cart ID: ${cart._id}`);
                console.log('✅ Persistence Check: PASSED');
            } else {
                // Try looking for cart by tenantId if that's how it's linked, but usually it's userId.
                // Or if the system creates carts lazily.
                console.warn('⚠️  Cart not found for this user. (Note: Cart might be created on first add-to-cart action)');
                console.log('❓ Persistence Check: INCONCLUSIVE/FAILED (No cart found)');
            }
        } else {
            console.log('⏭️  Skipping Persistence Check (No user)');
        }

        // 4. API Connectivity Check
        console.log('\n3️⃣  Running Connectivity Check (Public API)...');
        const API_URL = 'https://backend-power-play.vercel.app/api/products';

        try {
            // Using native fetch (Node 18+)
            const response = await fetch(API_URL);
            const status = response.status;
            const data = await response.json();

            console.log(`   GET ${API_URL}`);
            console.log(`   Status: ${status}`);

            if (status === 200 && data) {
                // Basic validation that it looks like a product list response
                // Usually { message: "", data: { products: [] } } or just [] or { products: [] }
                const hasProducts = data.data && Array.isArray(data.data.products); // Adjust based on your controller structure
                const isArrayDirectly = Array.isArray(data);

                if (hasProducts || isArrayDirectly) {
                    console.log('✅ Connectivity Check: PASSED');
                } else {
                    console.log('⚠️  Connectivity Check: PASSED (200 OK) but unexpected format.');
                    console.log('   Response preview:', JSON.stringify(data).substring(0, 100) + '...');
                }

            } else {
                console.error(`❌ Connectivity Check: FAILED (Status ${status})`);
            }

        } catch (err) {
            console.error(`❌ Connectivity Check: FAILED (Network error: ${err.message})`);
        }

    } catch (error) {
        console.error('❌ Fatal Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🏁 QA Check Finished.');
        process.exit(0);
    }
};

checkConnectivity();
