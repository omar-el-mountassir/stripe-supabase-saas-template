import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

// URL de connexion à la base de données depuis les variables d'environnement
const connectionString = process.env.DATABASE_URL as string;

// Client Postgres pour les migrations
const migrationClient = postgres(connectionString, { max: 1 });

// Client Postgres pour les requêtes
const queryClient = postgres(connectionString);

// Créer une instance Drizzle
export const db = drizzle(queryClient, { schema });

// Fonction pour exécuter les migrations
export async function runMigrations() {
  if (process.env.NODE_ENV === 'development') {
    try {
      await migrate(drizzle(migrationClient), { migrationsFolder: './drizzle' });
      console.log('Migrations exécutées avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'exécution des migrations:', error);
      throw error;
    } finally {
      await migrationClient.end();
    }
  }
}

export default db; 