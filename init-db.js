const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/iclone',
});

// Sample products data
const sampleProducts = [
    {
        name: "iPhone 15 Pro Max",
        price: 450000,
        category: "Սմարթֆոններ",
        image: "https://via.placeholder.com/300x300/0071e3/ffffff?text=iPhone+15+Pro+Max",
        description: "Վերջին սերնդի iPhone՝ ամենահզոր պրոցեսորով և տեսախցիկով",
        stock: 15,
        featured: true
    },
    {
        name: "iPad Pro 12.9\"",
        price: 380000,
        category: "Պլանշետներ",
        image: "https://via.placeholder.com/300x300/0071e3/ffffff?text=iPad+Pro",
        description: "Պրոֆեսիոնալ պլանշետ՝ M2 չիպով",
        stock: 8,
        featured: true
    },
    {
        name: "Apple Watch Ultra 2",
        price: 220000,
        category: "Ժամացույցներ",
        image: "https://via.placeholder.com/300x300/0071e3/ffffff?text=Apple+Watch+Ultra",
        description: "Ամենակատար Apple Watch՝ սպորտային ակտիվության համար",
        stock: 12,
        featured: true
    },
    {
        name: "AirPods Pro 2",
        price: 85000,
        category: "Աուդիո սարքեր",
        image: "https://via.placeholder.com/300x300/0071e3/ffffff?text=AirPods+Pro",
        description: "Ակտիվ աղմուկազերծումով անլար ականջակալներ",
        stock: 25,
        featured: false
    },
    {
        name: "MacBook Air M2",
        price: 520000,
        category: "Նոթբուքեր",
        image: "https://via.placeholder.com/300x300/0071e3/ffffff?text=MacBook+Air",
        description: "Հզոր և թեթև նոթբուք M2 չիպով",
        stock: 6,
        featured: true
    },
    {
        name: "Samsung Galaxy S24 Ultra",
        price: 410000,
        category: "Սմարթֆոններ",
        image: "https://via.placeholder.com/300x300/0071e3/ffffff?text=Galaxy+S24",
        description: "Samsung-ի դրոշակային սմարթֆոն",
        stock: 10,
        featured: false
    },
    {
        name: "Sony WH-1000XM5",
        price: 95000,
        category: "Աուդիո սարքեր",
        image: "https://via.placeholder.com/300x300/0071e3/ffffff?text=Sony+WH-1000XM5",
        description: "Առաջատար աղմուկազերծումով ականջակալներ",
        stock: 18,
        featured: false
    },
    {
        name: "iPad Air",
        price: 280000,
        category: "Պլանշետներ",
        image: "https://via.placeholder.com/300x300/0071e3/ffffff?text=iPad+Air",
        description: "Թեթև և հզոր պլանշետ",
        stock: 14,
        featured: false
    }
];

// Initialize database
async function initDatabase() {
    try {
        console.log('Connecting to PostgreSQL...');
        
        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute schema
        await pool.query(schema);
        console.log('Database schema created successfully');
        
        // Check if products already exist
        const existingProducts = await pool.query('SELECT COUNT(*) as count FROM products');
        
        if (parseInt(existingProducts.rows[0].count) === 0) {
            // Insert sample products
            for (const product of sampleProducts) {
                await pool.query(
                    `INSERT INTO products (name, price, category, image, description, stock, featured) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        product.name,
                        product.price,
                        product.category,
                        product.image,
                        product.description,
                        product.stock,
                        product.featured
                    ]
                );
            }
            console.log('Sample products inserted successfully');
        } else {
            console.log('Products already exist, skipping sample data insertion');
        }
        
        // Check if admin user exists
        const existingAdmin = await pool.query('SELECT COUNT(*) as count FROM admins WHERE username = $1', ['admin']);
        
        if (parseInt(existingAdmin.rows[0].count) === 0) {
            // Create admin user
            await pool.query(
                'INSERT INTO admins (username, password) VALUES ($1, $2)',
                ['admin', 'admin123']
            );
            console.log('Admin user created (username: admin, password: admin123)');
        } else {
            console.log('Admin user already exists');
        }
        
        console.log('Database initialization completed successfully!');
        
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

initDatabase();
