import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  // Add a column to limit daily completions for repeatable quests
  await knex.schema.table("quests", (table) => {
    table.integer("max_daily_completions").defaultTo(null).comment("Maximum times this quest can be completed per day (null = unlimited)")
  })
  
  // Set appropriate limits for repeatable quests
  // Cooking - 3 times per day
  await knex("quests")
    .where("name", "Cook a Meal")
    .update({ max_daily_completions: 3 })
    
  // Reading - 5 times per day
  await knex("quests")
    .where("name", "Read a Book")
    .update({ max_daily_completions: 5 })
    
  // Focus Session - 8 times per day (4 hours of focus)
  await knex("quests")
    .where("name", "Focus Session")
    .update({ max_daily_completions: 8 })
    
  // Drink Water - 10 times per day
  await knex("quests")
    .where("name", "Drink Water")
    .update({ max_daily_completions: 10 })
    
  // Take a Walk - 3 times per day
  await knex("quests")
    .where("name", "Take a Walk")
    .update({ max_daily_completions: 3 })
    
  // Meditate - 5 times per day
  await knex("quests")
    .where("name", "Meditate")
    .update({ max_daily_completions: 5 })
    
  // Write in Journal - 2 times per day
  await knex("quests")
    .where("name", "Write in Journal")
    .update({ max_daily_completions: 2 })
    
  // Stretch - 4 times per day
  await knex("quests")
    .where("name", "Stretch")
    .update({ max_daily_completions: 4 })
    
  // Learn Something New - 3 times per day
  await knex("quests")
    .where("name", "Learn Something New")
    .update({ max_daily_completions: 3 })
}

export async function down(knex: Knex): Promise<void> {
  // Remove the max_daily_completions column
  await knex.schema.table("quests", (table) => {
    table.dropColumn("max_daily_completions")
  })
}