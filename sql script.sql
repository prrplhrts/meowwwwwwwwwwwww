-- 1. Setup Database
DROP DATABASE IF EXISTS flash_sale_db;
CREATE DATABASE flash_sale_db;
USE flash_sale_db;

-- 2. Create Products Table 
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL
) ENGINE=InnoDB; 

-- 3. Create Orders Table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- 4. Insert Initial Data (1 item in stock)
INSERT INTO products (id, name, stock, price) 
VALUES ('Porsche 911', 1, 15000000.00);

-- 5. Verify Data
SELECT * FROM products;

UPDATE products SET stock = 1 WHERE id = 1;

-- ACID Logic

-- 1. ATOMICITY
   UPDATE products SET stock = stock - 1 WHERE id = 1;
   INSERT INTO orders (product_id) VALUES (1);
   
-- 2. CONSISTENCY
	

-- 3. ISOLATION
	SELECT stock FROM products WHERE id = 1 FOR UPDATE;
    
-- 4. DURABILITY
	COMMIT;
