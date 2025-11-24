import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("user_quests", (table) => {
    // Add streak_bonus column to track bonus EXP from quest completion streaks
    table.integer("streak_bonus").defaultTo(0)
    
    // Add completed_streak column to track consecutive completions
    table.integer("completed_streak").defaultTo(0)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("user_quests", (table) => {
    table.dropColumn("streak_bonus")
    table.dropColumn("completed_streak")
  })
}