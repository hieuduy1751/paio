import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_quests", (table) => {
    table.increments("id").primary()
    table.integer("user_id").unsigned().notNullable()
    table.integer("quest_id").unsigned().notNullable()
    table.timestamp("started_at")
    table.timestamp("completed_at")
    table.integer("earned_exp")
    table.boolean("is_active").defaultTo(false)
    table.date("quest_date").notNullable()
    table.timestamps(true, true)

    table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE")
    table.foreign("quest_id").references("id").inTable("quests").onDelete("CASCADE")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user_quests")
}
