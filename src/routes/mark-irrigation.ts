// src/routes/markIrrigationExecuted.ts
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function markIrrigationExecutedRoute(app: FastifyInstance) {
  app.patch('/irrigation-command/:id/execute', {
    schema: {
      tags: ['Irrigation'],
      summary: 'Confirmar execução de comando',
      description: 'Marca o comando como executado pelo dispositivo',
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID do comando' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            executed: { type: 'boolean' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const paramsSchema = z.object({
      id: z.any().transform(Number)
    })

    const { id } = paramsSchema.parse(request.params)

    const command = await prisma.deviceCommand.findUnique({ where: { id } })

    if (!command) {
      return reply.status(404).send({ error: 'Comando não encontrado' })
    }

    const updated = await prisma.deviceCommand.update({
      where: { id },
      data: { executed: true }
    })

    return reply.send({ id: updated.id, executed: updated.executed })
  })
}
