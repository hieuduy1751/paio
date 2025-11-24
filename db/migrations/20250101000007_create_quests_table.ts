import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("quests", (table) => {
    table.increments("id").primary()
    table.string("name", 200).notNullable()
    table.text("description")
    table.integer("skill_id").unsigned().notNullable()
    table.integer("base_exp").notNullable()
    table.integer("duration_minutes").notNullable()
    table.enum("frequency", ["daily", "weekly"]).defaultTo("daily")
    table.boolean("is_system").defaultTo(false)
    table.timestamps(true, true)

    table.foreign("skill_id").references("id").inTable("skills").onDelete("CASCADE")
  })

  // Insert default quests
  await knex("quests").insert([
    {
      name: "Read a Book",
      description: "Read for knowledge",
      skill_id: 1,
      base_exp: 30,
      duration_minutes: 30,
      frequency: "daily",
      is_system: true,
    },
    {
      name: "Take a Shower",
      description: "Daily hygiene",
      skill_id: 2,
      base_exp: 15,
      duration_minutes: 15,
      frequency: "daily",
      is_system: true,
    },
    {
      name: "Cook a Meal",
      description: "Prepare food",
      skill_id: 3,
      base_exp: 40,
      duration_minutes: 45,
      frequency: "daily",
      is_system: true,
    },
    {
      name: "Clean House",
      description: "Maintain living space",
      skill_id: 4,
      base_exp: 35,
      duration_minutes: 60,
      frequency: "daily",
      is_system: true,
    },
    {
      name: "Focus Session",
      description: "Deep work with Pomodoro",
      skill_id: 5,
      base_exp: 50,
      duration_minutes: 25,
      frequency: "daily",
      is_system: true,
    },
    {
      name: "Meal Prep Sunday",
      description: "Prepare meals for the week",
      skill_id: 3,
      base_exp: 100,
      duration_minutes: 120,
      frequency: "weekly",
      is_system: true,
    },
    {
      name: "Deep Clean",
      description: "Thorough house cleaning",
      skill_id: 4,
      base_exp: 80,
      duration_minutes: 180,
      frequency: "weekly",
      is_system: true,
    },
  ])
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("quests")
}
