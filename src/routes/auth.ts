import { FastifyInstance } from 'fastify'
import { hashPassword, comparePassword } from '../utils/hashPassword'
import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body as { email: string, password: string }
    
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return reply.code(400).send({ message: 'Usuário já existe' })
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    })

    const token = fastify.jwt.sign({ id: user.id })
    return { token }
  })

  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body as { email: string, password: string }
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return reply.code(401).send({ message: 'Credenciais inválidas' })
    }

    const passwordMatch = await comparePassword(password, user.password)
    if (!passwordMatch) {
      return reply.code(401).send({ message: 'Credenciais inválidas' })
    }

    const token = fastify.jwt.sign({ id: user.id })
    return { token }
  })
}