import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("pomodoro_sessions", (table) => {
    table.increments("id").primary()
    table.integer("user_id").unsigned().notNullable()
    table.integer("duration_minutes").notNullable()
    table.timestamp("started_at").notNullable()
    table.timestamp("completed_at")
    table.boolean("completed").defaultTo(false)
    table.string("task_name", 255)
    table.timestamps(true, true)

    table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("pomodoro_sessions")
}
