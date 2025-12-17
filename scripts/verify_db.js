require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password

mongoose.connect(uri)
    .then(async () => {
        console.log('✅ MOONGOOSE CONNECTED SUCCESSFULLY!');
        console.log('State:', mongoose.connection.readyState);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections found:', collections.map(c => c.name));

        await mongoose.disconnect();
        console.log('Disconnected.');
    })
    .catch(err => {
        console.error('❌ CONNECTION FAILED:');
        console.error(err.message);
    });
