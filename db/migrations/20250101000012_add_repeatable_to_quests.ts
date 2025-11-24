import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  // Add a column to indicate if a quest can be repeated multiple times per day
  await knex.schema.table("quests", (table) => {
    table.boolean("repeatable").defaultTo(false).comment("Whether this quest can be completed multiple times per day")
  })
  
  // Update existing quests to set appropriate repeatable values
  // Set repeatable = true for quests that make sense to do multiple times
  await knex("quests")
    .whereIn("name", [
      "Read a Book",
      "Cook a Meal",
      "Focus Session",
      "Drink Water",
      "Take a Walk",
      "Meditate",
      "Write in Journal",
      "Stretch",
      "Learn Something New"
    ])
    .update({ repeatable: true })
}

export async function down(knex: Knex): Promise<void> {
  // Remove the repeatable column
  await knex.schema.table("quests", (table) => {
    table.dropColumn("repeatable")
  })
}