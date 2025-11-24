import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  // Insert additional quests with various frequencies
  await knex("quests").insert([
    // Daily quests that can be done multiple times
    {
      name: "Drink Water",
      description: "Stay hydrated throughout the day",
      skill_id: 2, // Hygiene
      base_exp: 5,
      duration_minutes: 1,
      frequency: "daily",
      is_system: true,
    },
    {
      name: "Take a Walk",
      description: "Get some fresh air and exercise",
      skill_id: 4, // Household
      base_exp: 20,
      duration_minutes: 30,
      frequency: "daily",
      is_system: true,
    },
    {
      name: "Meditate",
      description: "Practice mindfulness and relaxation",
      skill_id: 5, // Focus
      base_exp: 25,
      duration_minutes: 15,
      frequency: "daily",
      is_system: true,
    },
    {
      name: "Write in Journal",
      description: "Reflect on your day and thoughts",
      skill_id: 1, // Reading
      base_exp: 15,
      duration_minutes: 20,
      frequency: "daily",
      is_system: true,
    },
    {
      name: "Stretch",
      description: "Improve flexibility and reduce tension",
      skill_id: 4, // Household
      base_exp: 10,
      duration_minutes: 10,
      frequency: "daily",
      is_system: true,
    },
    {
      name: "Learn Something New",
      description: "Study a new skill or topic",
      skill_id: 1, // Reading
      base_exp: 30,
      duration_minutes: 45,
      frequency: "daily",
      is_system: true,
    },
    
    // Daily quests that should be limited to once per day
    {
      name: "Wake Up Early",
      description: "Start your day productively",
      skill_id: 5, // Focus
      base_exp: 40,
      duration_minutes: 0, // This is more of a milestone than a time-based activity
      frequency: "daily",
      is_system: true,
    },
    {
      name: "Plan Your Day",
      description: "Organize your tasks and goals",
      skill_id: 5, // Focus
      base_exp: 25,
      duration_minutes: 15,
      frequency: "daily",
      is_system: true,
    },
    {
      name: "Review Your Day",
      description: "Reflect on accomplishments and areas for improvement",
      skill_id: 1, // Reading
      base_exp: 20,
      duration_minutes: 15,
      frequency: "daily",
      is_system: true,
    },
    
    // Weekly quests
    {
      name: "Grocery Shopping",
      description: "Stock up on essentials for the week",
      skill_id: 3, // Cooking
      base_exp: 30,
      duration_minutes: 60,
      frequency: "weekly",
      is_system: true,
    },
    {
      name: "Laundry Day",
      description: "Wash and organize your clothes",
      skill_id: 4, // Household
      base_exp: 25,
      duration_minutes: 90,
      frequency: "weekly",
      is_system: true,
    },
    {
      name: "Plan Weekly Goals",
      description: "Set objectives for the upcoming week",
      skill_id: 5, // Focus
      base_exp: 35,
      duration_minutes: 30,
      frequency: "weekly",
      is_system: true,
    },
    {
      name: "Digital Detox",
      description: "Take a break from screens and technology",
      skill_id: 5, // Focus
      base_exp: 50,
      duration_minutes: 120,
      frequency: "weekly",
      is_system: true,
    },
    {
      name: "Organize Workspace",
      description: "Tidy up your work or study area",
      skill_id: 4, // Household
      base_exp: 30,
      duration_minutes: 45,
      frequency: "weekly",
      is_system: true,
    },
  ])
}

export async function down(knex: Knex): Promise<void> {
  // Remove the added quests by name
  const questNames = [
    "Drink Water",
    "Take a Walk",
    "Meditate",
    "Write in Journal",
    "Stretch",
    "Learn Something New",
    "Wake Up Early",
    "Plan Your Day",
    "Review Your Day",
    "Grocery Shopping",
    "Laundry Day",
    "Plan Weekly Goals",
    "Digital Detox",
    "Organize Workspace",
  ]
  
  await knex("quests").whereIn("name", questNames).del()
}