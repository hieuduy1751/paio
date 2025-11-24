import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary()
    table.string("username", 100).notNullable().unique()
    table.string("password_hash", 255).notNullable()
    table.integer("level").defaultTo(1)
    table.integer("current_exp").defaultTo(0)
    table.integer("exp_to_next_level").defaultTo(100)
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users")
}
