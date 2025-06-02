// src/routes/getDeviceConfig.ts
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getDeviceConfigRoute(app: FastifyInstance) {
  app.get('/device-config/:numeration', {
    schema: {
      tags: ["SensorData"],
      summary: 'Obter configuração do Device',
      description: 'Retorna a configuração da planta associada ao dispositivo pela numeração (serial) do device',
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
            irrigationsPerDay: { type: 'integer' },
            idealLuminosityLx: { type: 'number' },
            mlPerIrrigation: { type: 'number' },
            minTemperatureCelsius: { type: 'number' },
            maxTemperatureCelsius: { type: 'number' }
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
      numeration: z.string().nonempty("Numeração do dispositivo é obrigatória")
    });

    const { numeration } = paramsSchema.parse(request.params);

    const device = await prisma.device.findUnique({
      where: { numeration }
    });

    if (!device) {
      return reply.status(404).send({ error: 'Dispositivo não encontrado' });
    }

    const plant = await prisma.plant.findFirst({
      where: { deviceId: device.id },
      select: {
        irrigationsPerDay: true,
        idealLuminosityLx: true,
        mlPerIrrigation: true,
        minTemperatureCelsius: true,
        maxTemperatureCelsius: true
      }
    });

    if (!plant) {
      return reply.status(404).send({ error: 'Planta associada não encontrada' });
    }

    return plant;
  });
}
