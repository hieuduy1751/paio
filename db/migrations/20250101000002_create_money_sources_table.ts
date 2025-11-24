import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("money_sources", (table) => {
    table.increments("id").primary()
    table.integer("user_id").unsigned().notNullable()
    table.string("name", 100).notNullable()
    table.decimal("balance", 15, 2).defaultTo(0)
    table.string("currency", 10).defaultTo("VND")
    table.string("color", 20).defaultTo("#3b82f6")
    table.timestamps(true, true)

    table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("money_sources")
}
