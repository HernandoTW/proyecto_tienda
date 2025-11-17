-- Script de Base de Datos para Tienda de Barrio
-- MySQL 8

CREATE DATABASE IF NOT EXISTS tienda_barrio_db;
USE tienda_barrio_db;

-- Tabla de proveedores
CREATE TABLE proveedores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    alias VARCHAR(50),
    telefono VARCHAR(20),
    direccion TEXT,
    limite_credito DECIMAL(10,2) DEFAULT 0,
    cliente_regular BOOLEAN DEFAULT FALSE,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proveedor_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    valor DECIMAL(10,2) NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE RESTRICT
);

-- Tabla de ventas diarias (corazón del sistema)
CREATE TABLE ventas_diarias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10,2) NOT NULL,
    tipo_venta ENUM('contado', 'credito', 'pendiente') NOT NULL,
    medio_pago ENUM('efectivo', 'transferencia', 'n/a') DEFAULT 'n/a',
    estado ENUM('completada', 'pendiente') NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

-- Tabla de abonos a créditos de clientes
CREATE TABLE abonos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabla de pagos a proveedores
CREATE TABLE pagos_proveedores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proveedor_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_ventas_cliente_fecha ON ventas_diarias(cliente_id, fecha);
CREATE INDEX idx_ventas_tipo_estado ON ventas_diarias(tipo_venta, estado);
CREATE INDEX idx_ventas_fecha ON ventas_diarias(fecha);
CREATE INDEX idx_abonos_cliente_fecha ON abonos(cliente_id, fecha);
CREATE INDEX idx_clientes_regular ON clientes(cliente_regular, estado);
CREATE INDEX idx_productos_proveedor ON productos(proveedor_id, estado);

-- Insertar datos de ejemplo para pruebas
INSERT INTO proveedores (nombre, telefono) VALUES 
('Distribuidora La Economía', '3101234567'),
('Lácteos El Campo', '3112345678'),
('Abarrotes Don Pedro', '3123456789');

INSERT INTO clientes (nombre, alias, telefono, direccion, limite_credito, cliente_regular) VALUES 
('María Rodríguez', 'Doña María', '3151234567', 'Calle 123 #45-67', 500000, TRUE),
('Carlos López', 'Carlitos', '3162345678', 'Carrera 89 #12-34', 300000, TRUE),
('Ana García', 'Anita', '3173456789', 'Diagonal 56 #78-90', 0, FALSE);

INSERT INTO productos (proveedor_id, nombre, descripcion, valor) VALUES 
(1, 'Arroz 1kg', 'Arroz blanco premium 1 kilogramo', 2500),
(1, 'Aceite 900ml', 'Aceite vegetal 900ml', 8500),
(2, 'Leche Entera 1L', 'Leche entera larga vida 1 litro', 3800),
(2, 'Queso Campesino 250g', 'Queso campesino por 250 gramos', 6500),
(3, 'Huevos x30', 'Huevos grade x30 unidades', 15000),
(3, 'Pan Bimbo', 'Pan de molde bimbo', 5200);

INSERT INTO ventas_diarias (cliente_id, valor_total, tipo_venta, medio_pago, estado, descripcion) VALUES 
(1, 28500, 'credito', 'n/a', 'completada', 'Leche, huevos, pan'),
(2, 12800, 'contado', 'efectivo', 'completada', 'Arroz y aceite'),
(NULL, 6500, 'pendiente', 'n/a', 'pendiente', 'Queso campesino - Cliente sin registrar'),
(1, 15000, 'credito', 'n/a', 'completada', 'Huevos x30');

INSERT INTO abonos (cliente_id, valor, descripcion) VALUES 
(1, 20000, 'Abono inicial'),
(1, 15000, 'Abono semanal');

INSERT INTO pagos_proveedores (proveedor_id, valor, descripcion) VALUES 
(1, 150000, 'Pago por mercancía de la semana'),
(2, 80000, 'Abono productos lácteos');

-- Vista útil para consultar saldos de clientes
CREATE VIEW vista_saldos_clientes AS
SELECT 
    c.id,
    c.nombre,
    c.alias,
    c.limite_credito,
    COALESCE(SUM(CASE WHEN v.tipo_venta = 'credito' THEN v.valor_total ELSE 0 END), 0) as deuda_total,
    COALESCE(SUM(a.valor), 0) as abonos_total,
    (COALESCE(SUM(CASE WHEN v.tipo_venta = 'credito' THEN v.valor_total ELSE 0 END), 0) - COALESCE(SUM(a.valor), 0)) as saldo_actual,
    c.estado
FROM clientes c
LEFT JOIN ventas_diarias v ON v.cliente_id = c.id AND v.estado = 'completada'
LEFT JOIN abonos a ON a.cliente_id = c.id
GROUP BY c.id, c.nombre, c.alias, c.limite_credito, c.estado;

-- Mostrar datos de ejemplo
SELECT '=== Proveedores ===' as '';
SELECT * FROM proveedores;

SELECT '=== Clientes ===' as '';
SELECT * FROM clientes;

SELECT '=== Productos ===' as '';
SELECT * FROM productos;

SELECT '=== Saldos Clientes ===' as '';
SELECT * FROM vista_saldos_clientes;

SELECT '=== Ventas Pendientes ===' as '';
SELECT * FROM ventas_diarias WHERE estado = 'pendiente';

USE tienda_barrio_db;

-- Tabla de usuarios para authentication
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol ENUM('admin', 'tendero') DEFAULT 'tendero',
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resto de las tablas (las que ya teníamos)...
-- [Aquí van todas las tablas anteriores: proveedores, clientes, productos, etc.]

-- Insertar usuario admin por defecto
INSERT INTO usuarios (username, email, password_hash, nombre, rol) VALUES 
('admin', 'admin@tienda.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin');
-- Password: password