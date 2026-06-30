import sqlite3

def init_db():
    conn = sqlite3.connect('nutrition.db')
    cursor = conn.cursor()
    
    # Création de la table des ingrédients
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        calories_100g REAL,
        proteines_100g REAL,
        lipides_100g REAL,
        glucides_100g REAL,
        categorie TEXT,
        stock_grammes REAL
    )
    ''')
    
    # Insertion de quelques données de base si la table est vide
    cursor.execute("SELECT COUNT(*) FROM ingredients")
    if cursor.fetchone()[0] == 0:
        ingredients_data = [
            ('Poulet (blanc)', 165, 31, 3.6, 0, 'Viande', 1000),
            ('Riz Basmati', 350, 7, 0.5, 78, 'Féculent', 2000),
            ('Brocoli', 34, 2.8, 0.4, 7, 'Légume', 500),
            ('Avocat', 160, 2, 15, 9, 'Fruit/Gras', 300),
            ('Oeuf', 155, 13, 11, 1.1, 'Protéine', 600),
            ('Avoine', 389, 16.9, 6.9, 66, 'Céréale', 1500),
            ('Saumon', 208, 20, 13, 0, 'Poisson', 800),
            ('Pomme de terre', 77, 2, 0.1, 17, 'Légume/Féculent', 3000)
        ]
        cursor.executemany('''
        INSERT INTO ingredients (nom, calories_100g, proteines_100g, lipides_100g, glucides_100g, categorie, stock_grammes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', ingredients_data)
        
    conn.commit()
    conn.close()
    print("Base de données initialisée avec succès.")

if __name__ == "__main__":
    init_db()
