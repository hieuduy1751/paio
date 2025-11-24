import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("expenses", (table) => {
    table.increments("id").primary()
    table.integer("user_id").unsigned().notNullable()
    table.integer("money_source_id").unsigned().notNullable()
    table.enum("type", ["debit", "credit"]).notNullable()
    table.decimal("amount", 15, 2).notNullable()
    table.string("category", 100)
    table.text("description")
    table.timestamp("transaction_date").notNullable()
    table.timestamps(true, true)

    table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE")
    table.foreign("money_source_id").references("id").inTable("money_sources").onDelete("CASCADE")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("expenses")
}
