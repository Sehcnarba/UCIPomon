-- Seed com as 38 caricaturas/pessoas migradas do jogo Hot Potatoes original.
-- Corre-se UMA VEZ, depois de as imagens estarem no bucket R2 (ver README.md):
--   wrangler d1 execute ucipomon --remote --file=./migration/seed.sql

INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('1000066466', 'people/1000066466.jpg', 'Jean François', '["Jean", "François"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('1000066565', 'people/1000066565.jpg', 'Joaquim Lúcio', '["Lúcio"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('1000066464', 'people/1000066464.jpg', 'Marta', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('1000066463', 'people/1000066463.jpg', 'Zé Pedro', '["José Pedro"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('1000066275', 'people/1000066275.jpg', 'Patrícia', '["Patricia"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('1000066465', 'people/1000066465.jpg', 'Eduardo', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('1000066467', 'people/1000066467.jpg', 'João Cunha', '["Cunha"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('1000066555', 'people/1000066555.jpg', 'Ana Gois', '["Gois"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('1000066560', 'people/1000066560.jpg', 'Ana Margarida', '["Margarida"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-15', 'people/image-15.jpg', 'Vera', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-31', 'people/image-31.jpg', 'Beatriz', '["Bea", "BEAM"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('1000066556', 'people/1000066556.jpg', 'Rúben', '["Ruben"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-36', 'people/image-36.jpg', 'Mariana', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-37', 'people/image-37.jpg', 'Nuno Pruxa', '["Nuno", "Pruxa"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-70', 'people/image-70.jpg', 'Ricardo', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-46', 'people/image-46.jpg', 'David', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-43', 'people/image-43.jpg', 'Elsa Sousa', '["Elsa"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-45', 'people/image-45.jpg', 'Fernando Lino', '["Lino", "Fernando"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-37_1', 'people/image-37_1.jpg', 'Ana Lúcia', '["Lúcia", "Lucia"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-50', 'people/image-50.jpg', 'Ana Sousa', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-56', 'people/image-56.jpg', 'Filipa Brochado', '["Filipa"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-61', 'people/image-61.jpg', 'João Abranches', '["Teimosão", "João", "Abranches"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-120', 'people/image-120.jpg', 'Ana Lúcia', '["Lúcia", "Ana Lucia"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-75', 'people/image-75.jpg', 'Filipe', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('image-89', 'people/image-89.jpg', 'Rui', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('45cb79b7', 'people/45cb79b7.jpg', 'Ricardo', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('75b8fb78', 'people/75b8fb78.jpg', 'Ana Casinhas', '["Casinhas"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('79ffd9ac', 'people/79ffd9ac.jpg', 'Ana Casinhas', '["Casinhas"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('287ca6cd', 'people/287ca6cd.jpg', 'Filipe', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('95189d0', 'people/95189d0.jpg', 'Isilda', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('424736c3', 'people/424736c3.jpg', 'José Pedro Tadeu', '["Tadeu"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('aa797bea', 'people/aa797bea.jpg', 'Luís Teles', '["Teles", "Luis Teles"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('b70ad740', 'people/b70ad740.jpg', 'João Borges', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('be6c48e3', 'people/be6c48e3.jpg', 'Sónia Brandão', '["Brandoa"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('c5a887ea', 'people/c5a887ea.jpg', 'João Borges', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('c6ad432b', 'people/c6ad432b.jpg', 'Patrícia', '["Patricia"]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('765b451e', 'people/765b451e.jpg', 'Tiago Silva', '[]', 1);
INSERT INTO people (id, image_key, display_name, aliases, active) VALUES ('f8b62ba8', 'people/f8b62ba8.jpg', 'Isilda', '[]', 1);
