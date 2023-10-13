import { knex as knexSetup, Knex } from 'knex'
import { env } from './env'

function getConnection() {
  if (env.DATABASE_CLIENT === 'sqlite3') {
    return {
      filename: env.DATABASE_URL,
    }
  }
  return env.DATABASE_URL
}

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: getConnection(),
  migrations: {
    directory: './db/migrations',
    extension: 'ts',
  },
  useNullAsDefault: true,
}

export const knex = knexSetup(config)
