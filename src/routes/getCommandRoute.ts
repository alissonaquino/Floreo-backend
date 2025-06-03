// src/routes/getIrrigationCommand.ts
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getIrrigationCommandRoute(app: FastifyInstance) {
  app.get('/irrigation-command/:numeration', {
    schema: {
      tags: ['Irrigation'],
      summary: 'Verificar comando de irrigação pendente',
      description: 'Retorna o comando de irrigação mais recente e não executado para um dispositivo',
      params: {
        type: 'object',
        properties: {
          numeration: { type: 'string', description: 'Numeração (serial) do dispositivo' }
        },
        required: ['numeration']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            command: {
              type: ['object', 'null'],
              properties: {
                id: { type: 'integer' },
                command: { type: 'string' },
                executed: { type: 'boolean' },
                created_at: { type: 'string' }
              }
            }
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
      numeration: z.string().nonempty('Numeração do dispositivo é obrigatória')
    })

    const { numeration } = paramsSchema.parse(request.params)

    const device = await prisma.device.findUnique({
      where: { numeration }
    })

    if (!device) {
      return reply.status(404).send({ error: 'Dispositivo não encontrado' })
    }

    const command = await prisma.deviceCommand.findFirst({
      where: {
        deviceId: device.id,
        command: 'IRRIGAR',
        executed: false
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return reply.send({ command: command || null })
  })
}
