import knex from "knex"
import knexConfig from "../knexfile"

// Singleton pattern for Knex connection
let dbInstance: ReturnType<typeof knex> | null = null

export function getDB() {
  // Only initialize the database connection when it's actually used
  // This prevents initialization in the Edge Runtime
  if (!dbInstance) {
    // Check if we're in the Edge Runtime
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      // Create a deep copy of the config to avoid modifying the original
      const config = JSON.parse(JSON.stringify(knexConfig.development))
      
      // Convert port to number if it's a string
      if (typeof config.connection.port === 'string') {
        config.connection.port = parseInt(config.connection.port, 10)
      }
      
      dbInstance = knex(config)
    } else {
      // In Edge Runtime, return a mock or throw an error
      throw new Error("Database connection not available in Edge Runtime")
    }
  }
  return dbInstance
}

// Lazy initialization - don't create the connection until it's needed
export default function db() {
  return getDB()
}