import "dotenv/config"
import { env } from "prisma/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "../generated/prisma/client.ts"

const adapter = new PrismaMariaDb({
  host: env("DATABASE_HOST"),
  user: env("DATABASE_USER"),
  password: env("DATABASE_PASSWORD"),
  database: env("DATABASE_NAME"),
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
  ssl: false,
});

const prisma = new PrismaClient({
  adapter: adapter,
  log: ['warn', 'error'],
});

// prisma.$on('query', (e) => {
//   console.log('Query: ' + e.query)
//   console.log('Params: ' + e.params)
//   console.log('Duration: ' + e.duration + 'ms')
// })

export { prisma }
