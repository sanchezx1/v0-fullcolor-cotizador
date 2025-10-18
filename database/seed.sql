-- Datos de ejemplo para FullColor Cotizador
-- Ejecutar después del schema.sql

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, categoria, unidad, minimo_pedido, imagen_url) VALUES
('Tarjetas de Presentación Premium', 'Impresión de alta calidad en papel couché 300g', 'Papelería Corporativa', 'unidad', 100, '/premium-business-cards-stack.jpg'),
('Carpetas Corporativas', 'Carpetas personalizadas con tu logo', 'Papelería Corporativa', 'unidad', 50, '/corporate-folders-presentation.jpg'),
('Banners Roll-Up', 'Banners portátiles para eventos', 'Material Publicitario', 'unidad', 1, '/roll-up-banner-display.jpg'),
('Tazas Personalizadas', 'Tazas cerámicas con impresión full color', 'Merchandising', 'unidad', 24, '/custom-branded-mugs.jpg'),
('Bolígrafos Corporativos', 'Bolígrafos metálicos con grabado láser', 'Merchandising', 'unidad', 50, '/corporate-branded-pens.jpg'),
('Volantes Publicitarios', 'Volantes en papel couché brillante', 'Material Publicitario', 'unidad', 100, '/promotional-flyers-stack.jpg'),
('Hojas Membretadas', 'Papel membretado de alta calidad', 'Papelería Corporativa', 'unidad', 100, '/letterhead-stationery-set.jpg'),
('Libretas Corporativas', 'Libretas con tapa dura personalizadas', 'Merchandising', 'unidad', 50, '/corporate-notebooks-branded.jpg'),
('Afiches Publicitarios', 'Afiches en papel fotográfico', 'Material Publicitario', 'unidad', 10, '/advertising-posters-display.jpg'),
('Sobres Corporativos', 'Sobres personalizados varios tamaños', 'Papelería Corporativa', 'unidad', 100, '/corporate-envelopes-branded.jpg'),
('USB Personalizados', 'Memorias USB con logo grabado', 'Merchandising', 'unidad', 25, '/custom-usb-drives-branded.jpg'),
('Stickers Troquelados', 'Stickers en cualquier forma', 'Material Publicitario', 'unidad', 100, '/die-cut-stickers-custom.jpg');

-- Insertar escalas de precios para Tarjetas de Presentación Premium (ID: 1)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(1, 100, 0.25),
(1, 500, 0.18),
(1, 1000, 0.12),
(1, 2500, 0.08);

-- Insertar escalas de precios para Carpetas Corporativas (ID: 2)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(2, 50, 3.00),
(2, 100, 2.50),
(2, 250, 2.00),
(2, 500, 1.50);

-- Insertar escalas de precios para Banners Roll-Up (ID: 3)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(3, 1, 45.00),
(3, 5, 40.00),
(3, 10, 35.00),
(3, 20, 30.00);

-- Insertar escalas de precios para Tazas Personalizadas (ID: 4)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(4, 24, 7.50),
(4, 48, 6.50),
(4, 96, 5.50),
(4, 144, 4.50);

-- Insertar escalas de precios para Bolígrafos Corporativos (ID: 5)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(5, 50, 1.60),
(5, 100, 1.30),
(5, 250, 1.00),
(5, 500, 0.80);

-- Insertar escalas de precios para Volantes Publicitarios (ID: 6)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(6, 100, 0.35),
(6, 500, 0.25),
(6, 1000, 0.18),
(6, 2500, 0.12);

-- Insertar escalas de precios para Hojas Membretadas (ID: 7)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(7, 100, 0.40),
(7, 500, 0.30),
(7, 1000, 0.22),
(7, 2500, 0.15);

-- Insertar escalas de precios para Libretas Corporativas (ID: 8)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(8, 50, 4.40),
(8, 100, 3.80),
(8, 250, 3.20),
(8, 500, 2.60);

-- Insertar escalas de precios para Afiches Publicitarios (ID: 9)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(9, 10, 5.50),
(9, 50, 4.50),
(9, 100, 3.80),
(9, 250, 3.20);

-- Insertar escalas de precios para Sobres Corporativos (ID: 10)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(10, 100, 0.30),
(10, 500, 0.22),
(10, 1000, 0.18),
(10, 2500, 0.12);

-- Insertar escalas de precios para USB Personalizados (ID: 11)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(11, 25, 14.00),
(11, 50, 12.00),
(11, 100, 10.00),
(11, 250, 8.50);

-- Insertar escalas de precios para Stickers Troquelados (ID: 12)
INSERT INTO precios_escalonados (producto_id, cantidad_min, precio_unitario) VALUES
(12, 100, 0.25),
(12, 500, 0.18),
(12, 1000, 0.15),
(12, 2500, 0.12);
