-- iClone.evn Database Schema for PostgreSQL

-- Create database (run this separately if needed)
-- CREATE DATABASE iclone;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image TEXT NOT NULL,
    description TEXT,
    stock INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
INSERT INTO admins (username, password) 
VALUES ('admin', 'admin123') 
ON CONFLICT (username) DO NOTHING;

-- Sample products (optional - can be inserted via init-db.js)
INSERT INTO products (name, price, category, image, description, stock, featured) VALUES
('iPhone 15 Pro Max', 450000, 'Սմարթֆոններ', 'https://via.placeholder.com/300x300/0071e3/ffffff?text=iPhone+15+Pro+Max', 'Վերջին սերնդի iPhone՝ ամենահզոր պրոցեսորով և տեսախցիկով', 15, TRUE),
('iPad Pro 12.9"', 380000, 'Պլանշետներ', 'https://via.placeholder.com/300x300/0071e3/ffffff?text=iPad+Pro', 'Պրոֆեսիոնալ պլանշետ՝ M2 չիպով', 8, TRUE),
('Apple Watch Ultra 2', 220000, 'Ժամացույցներ', 'https://via.placeholder.com/300x300/0071e3/ffffff?text=Apple+Watch+Ultra', 'Ամենակատար Apple Watch՝ սպորտային ակտիվության համար', 12, TRUE),
('AirPods Pro 2', 85000, 'Աուդիո սարքեր', 'https://via.placeholder.com/300x300/0071e3/ffffff?text=AirPods+Pro', 'Ակտիվ աղմուկազերծումով անլար ականջակալներ', 25, FALSE),
('MacBook Air M2', 520000, 'Նոթբուքեր', 'https://via.placeholder.com/300x300/0071e3/ffffff?text=MacBook+Air', 'Հզոր և թեթև նոթբուք M2 չիպով', 6, TRUE),
('Samsung Galaxy S24 Ultra', 410000, 'Սմարթֆոններ', 'https://via.placeholder.com/300x300/0071e3/ffffff?text=Galaxy+S24', 'Samsung-ի դրոշակային սմարթֆոն', 10, FALSE),
('Sony WH-1000XM5', 95000, 'Աուդիո սարքեր', 'https://via.placeholder.com/300x300/0071e3/ffffff?text=Sony+WH-1000XM5', 'Առաջատար աղմուկազերծումով ականջակալներ', 18, FALSE),
('iPad Air', 280000, 'Պլանշետներ', 'https://via.placeholder.com/300x300/0071e3/ffffff?text=iPad+Air', 'Թեթև և հզոր պլանշետ', 14, FALSE)
ON CONFLICT DO NOTHING;
