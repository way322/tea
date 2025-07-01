-- Пользователи
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Товары
CREATE TABLE Products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255) NOT NULL
);

-- Корзина
CREATE TABLE Cart (
    product_id INT REFERENCES Products(id) ON DELETE CASCADE,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (product_id, user_id)
);

-- Заказы
CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMPTZ NOT NULL,
    address VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    total DECIMAL(10, 2) NOT NULL
);

-- Состав заказов
CREATE TABLE Order_items (
    order_id INT REFERENCES Orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES Products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (order_id, product_id)
);

-- Избранное
CREATE TABLE Favorite (
    product_id INT REFERENCES Products(id) ON DELETE CASCADE,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, user_id)
);




INSERT INTO Products (id, title, price, image_url) VALUES
(1, 'Да Хун Пао', 568.00, 'chay1.png'),
(2, 'Хун Цзинь Гуй', 700.00, 'chay2.png'),
(3, 'Хакка Лэй Ча', 900.00, 'chay3.png'),
(4, 'Тайский чай', 200.00, 'chay4.png'),
(5, 'Лунцзин', 439.00, 'chay5.png'),
(6, 'Би Ло Чунь', 329.00, 'chay6.png'),
(7, 'Те Гуань Инь', 539.00, 'chay7.png'),
(8, 'Бай Хао Иньчжэнь', 735.00, 'chay8.png');


изменения которые были внесены
-- Изменение типа столбца total в таблице Orders
ALTER TABLE Orders 
ALTER COLUMN total TYPE DECIMAL(10,2) USING total::DECIMAL(10,2);

-- Добавление недостающих индексов
CREATE INDEX idx_orders_user ON Orders(user_id);
CREATE INDEX idx_order_items_order ON Order_items(order_id);

