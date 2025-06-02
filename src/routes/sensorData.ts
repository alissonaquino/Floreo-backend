import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function sensorDataRoutes(app: FastifyInstance) {
  app.post("/sensorData", {
    schema: {
      summary: "Registrar dados do sensor",
      tags: ["SensorData"],
      headers: {
        type: "object",
        properties: {
          "x-device-numeration": { type: "string" }
        },
        required: ["x-device-numeration"]
      },
      body: {
        type: "object",
        properties: {
          temperature: { type: "number" },
          humiditySoil: { type: "number" },
          humidityAir: { type: "number" },
          luminosity: { type: "number" },
          relayState: { type: "boolean" }
        },
        additionalProperties: false
      },
      response: {
        201: {
          type: "object",
          properties: {
            message: { type: "string" }
          }
        },
        404: {
          type: "object",
          properties: {
            error: { type: "string" }
          }
        },
        400: {
          type: "object",
          properties: {
            error: { type: "string" }
          }
        }
      }
    }
  }, async (request, reply) => {
    const headerSchema = z.object({
      "x-device-numeration": z.string()
    });

    const bodySchema = z.object({
      temperature: z.number().optional(),
      humiditySoil: z.number().optional(),
      humidityAir: z.number().optional(),
      luminosity: z.number().optional(),
      relayState: z.boolean().optional()
    });

    const headers = headerSchema.safeParse(request.headers);
    const data = bodySchema.safeParse(request.body);

    if (!headers.success || !data.success) {
      return reply.status(400).send({ error: "Invalid data format" });
    }

    const deviceNumeration = headers.data["x-device-numeration"];

    const device = await prisma.device.findUnique({
      where: { numeration: deviceNumeration },
      include: {
        plants: {
          orderBy: { plantingDate: "desc" },
          take: 1
        }
      }
    });

    if (!device) {
      return reply.status(404).send({ error: "Device not found" });
    }

    const currentPlant = device.plants[0];
    if (!currentPlant) {
      return reply.status(400).send({ error: "No plant linked to this device" });
    }

    const now = new Date();

    const sensorTypes = [
      { key: "temperature", type: "temperature" },
      { key: "humiditySoil", type: "soil_humidity" },
      { key: "humidityAir", type: "air_humidity" },
      { key: "luminosity", type: "luminosity" },
      { key: "relayState", type: "relay_state" }
    ];

    const promises = sensorTypes.map(({ key, type }) => {
      const value = data.data[key as keyof typeof data.data];
      if (typeof value === "number" || typeof value === "boolean") {
        return prisma.sensorData.create({
          data: {
            sensorType: type,
            value: typeof value === "boolean" ? (value ? 1 : 0) : value,
            recordedAt: now,
            deviceId: device.id,
            plantId: currentPlant.id
          }
        });
      }
    }).filter(Boolean);

    await Promise.all(promises);

    return reply.status(201).send({ message: "Sensor data saved" });
  });
}
