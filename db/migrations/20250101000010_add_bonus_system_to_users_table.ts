import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("users", (table) => {
    // Add total_quests_completed for overall tracking
    table.integer("total_quests_completed").defaultTo(0)
    
    // Add daily_streak for consecutive daily quest completions
    table.integer("daily_streak").defaultTo(0)
    
    // Add last_quest_date to track when the last quest was completed
    table.date("last_quest_date").nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("users", (table) => {
    table.dropColumn("total_quests_completed")
    table.dropColumn("daily_streak")
    table.dropColumn("last_quest_date")
  })
}