DROP DATABASE IF EXISTS resahotelcalifornia;
CREATE DATABASE resahotelcalifornia;
USE resahotelcalifornia;

-- Création utilisateur
CREATE USER IF NOT EXISTS 'username'@'localhost' IDENTIFIED BY 'password';

-- Donner tous les droits à cet utilisateur uniquement sur la base resahotelcalifornia
GRANT ALL PRIVILEGES ON resahotelcalifornia.* TO 'username'@'localhost';

-- Appliquer les changements
FLUSH PRIVILEGES;

-- Création de la table des clients
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    nombre_personnes INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Création de la table des chambres (avec colonnes supplémentaires)
CREATE TABLE chambres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(10) NOT NULL UNIQUE,
    capacite INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Création de la table des réservations
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    chambre_id INT NOT NULL,
    date_arrivee DATE NOT NULL,
    date_depart DATE NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (chambre_id) REFERENCES chambres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ajout d'un index pour accélérer les recherches de disponibilité
CREATE INDEX idx_reservation_dates ON reservations(chambre_id, date_arrivee, date_depart);

-- Valeurs chambres (avec type et prix)
INSERT INTO chambres (numero, capacite) VALUES
('101', 2),
('102', 2),
('103', 1),
('201', 3),
('202', 2),
('203', 4),
('301', 2),
('302', 3),  -- ✅ Virgule manquante ajoutée
('401', 4),
('402', 1);

-- Valeur clients
INSERT INTO clients (nom, email, telephone, nombre_personnes) VALUES
('Jean Dupont', 'jean.dupont@email.com', '0612345678', 2),
('Marie Martin', 'marie.martin@email.com', '0687654321', 3),
('Pierre Durand', 'pierre.durand@email.com', '0654321789', 1),
('Sophie Leclerc', 'sophie.leclerc@email.com', '0678912345', 4),
('Thomas Bernard', 'thomas.bernard@email.com', '0690123456', 2),
('Émilie Moreau', 'emilie.moreau@email.com', '0676543210', 1),
('François Petit', 'francois.petit@email.com', '0645678912', 2),
('Isabelle Roux', 'isabelle.roux@email.com', '0698765432', 3);

-- Valeurs réservations
-- Date au format YYYY-MM-DD

-- Réservations passées
INSERT INTO reservations (client_id, chambre_id, date_arrivee, date_depart) VALUES
(1, 1, '2024-01-15', '2024-01-20'),
(3, 3, '2024-02-05', '2024-02-07');

-- Réservations en cours (ajustez selon la date actuelle)
INSERT INTO reservations (client_id, chambre_id, date_arrivee, date_depart) VALUES
(2, 4, '2025-03-18', '2025-03-25'),
(5, 2, '2025-03-15', '2025-03-22');

-- Réservations futures
INSERT INTO reservations (client_id, chambre_id, date_arrivee, date_depart) VALUES
(4, 6, '2025-04-10', '2025-04-17'),
(6, 8, '2025-05-01', '2025-05-05'),
(7, 5, '2025-06-15', '2025-06-22'),
(8, 9, '2025-07-01', '2025-07-10');

-- Multiples réservations pour la même chambre (à différentes dates)
INSERT INTO reservations (client_id, chambre_id, date_arrivee, date_depart) VALUES
(1, 1, '2025-05-10', '2025-05-15'),
(2, 1, '2025-06-20', '2025-06-25');

-- Multiples réservations pour le même client (différentes chambres)
INSERT INTO reservations (client_id, chambre_id, date_arrivee, date_depart) VALUES
(4, 7, '2025-08-05', '2025-08-12'),
(4, 10, '2025-10-10', '2025-10-15');