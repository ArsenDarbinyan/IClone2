const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from frontend
app.use(express.static(path.join(__dirname)));

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user@localhost:5432/iclone',
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Helper function to run queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// In-memory storage for products (temporary solution)
let products = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 450000,
    category: "Սմարթֆոններ",
    image: "https://via.placeholder.com/300x300/0071e3/ffffff?text=iPhone+15+Pro+Max",
    description: "Վերջին սերնդի iPhone՝ ամենահզոր պրոցեսորով և տեսախցիկով",
    stock: 15,
    featured: true
  },
  {
    id: 2,
    name: "iPad Pro 12.9\"",
    price: 380000,
    category: "Պլանշետներ",
    image: "https://via.placeholder.com/300x300/0071e3/ffffff?text=iPad+Pro",
    description: "Պրոֆեսիոնալ պլանշետ՝ M2 չիպով",
    stock: 8,
    featured: true
  },
  {
    id: 3,
    name: "Apple Watch Ultra 2",
    price: 220000,
    category: "Ժամացույցներ",
    image: "https://via.placeholder.com/300x300/0071e3/ffffff?text=Apple+Watch+Ultra",
    description: "Ամենակատար Apple Watch՝ սպորտային ակտիվության համար",
    stock: 12,
    featured: true
  }
];

// Routes

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const { category, search } = req.query;
        
        let filteredProducts = products;
        
        if (category && category !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }
        
        if (search) {
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        res.json(filteredProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create product (Admin only)
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, category, image, description, stock, featured } = req.body;
        
        const newProduct = {
            id: Math.max(...products.map(p => p.id), 0) + 1,
            name,
            price: parseFloat(price),
            category,
            image,
            description,
            stock: parseInt(stock) || 0,
            featured: Boolean(featured)
        };
        
        products.push(newProduct);
        console.log('Product added:', newProduct);
        console.log('Total products:', products.length);
        
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update product (Admin only)
app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, price, category, image, description, stock, featured } = req.body;
        const productId = parseInt(req.params.id);
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const updatedProduct = {
            id: productId,
            name,
            price: parseFloat(price),
            category,
            image,
            description,
            stock: parseInt(stock) || 0,
            featured: Boolean(featured)
        };
        
        products[productIndex] = updatedProduct;
        console.log('Product updated:', updatedProduct);
        
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete product (Admin only)
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const deletedProduct = products.splice(productIndex, 1)[0];
        console.log('Product deleted:', deletedProduct);
        console.log('Remaining products:', products.length);
        
        res.json({ message: 'Product deleted successfully', product: deletedProduct });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get categories
app.get('/api/categories', async (req, res) => {
    try {
        const result = await query('SELECT DISTINCT category FROM products ORDER BY category');
        res.json(result.rows.map(row => row.category));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin routes
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Временное решение для тестирования
        if (username === 'admin' && password === 'admin123') {
            return res.json({ message: 'Login successful', username: 'admin' });
        }
        
        const result = await query('SELECT * FROM admins WHERE username = $1 AND password = $2', [username, password]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        res.json({ message: 'Login successful', username: result.rows[0].username });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Serve frontend routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
});
