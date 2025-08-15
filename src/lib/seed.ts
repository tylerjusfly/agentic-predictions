import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const recipes = [
  {
    email: 'tyler@mail.com',
    passkey: "test",
    reference: "rs3ew7c90elyd34",
    verified: true,
    subsribed_at: '08-25',
    created_at: "2025-08-08 09:09:59"
  }
]

async function seedData() {
  console.log('Seeding...')

  for (const recipe of recipes) {
    const result = await prisma.users.create({
      data: recipe,
    })
    console.log(`Created user with id: ${result.id}`)
  }

  console.log('Finished seeding.')
}

seedData()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })