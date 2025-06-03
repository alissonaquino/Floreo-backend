import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function sensorDataRoutes(app: FastifyInstance) {
  app.post("/sensorData", {
    schema: {
      summary: "Registrar dado individual do sensor",
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
          type: { type: "string" },
          value: { type: "number" }
        },
        required: ["type", "value"],
        additionalProperties: false
      },
      response: {
        201: {
          type: "object",
          properties: {
            message: { type: "string" }
          }
        },
        400: {
          type: "object",
          properties: {
            error: { type: "string" }
          }
        },
        404: {
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
      type: z.enum(["temperature", "humiditySoil", "humidityAir", "luminosity", "relayState"]),
      value: z.number()
    });

    const headers = headerSchema.safeParse(request.headers);
    const body = bodySchema.safeParse(request.body);

    if (!headers.success || !body.success) {
      return reply.status(400).send({ error: "Invalid data format" });
    }

    const deviceNumeration = headers.data["x-device-numeration"];
    const { type, value } = body.data;

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

    // Mapear nomes para banco
    const sensorTypeMap: Record<string, string> = {
      humiditySoil: "soil_humidity",
      humidityAir: "air_humidity",
      temperature: "temperature",
      luminosity: "luminosity",
      relayState: "relay_state"
    };

    await prisma.sensorData.create({
      data: {
        sensorType: sensorTypeMap[type],
        value,
        recordedAt: new Date(),
        deviceId: device.id,
        plantId: currentPlant.id
      }
    });

    return reply.status(201).send({ message: "Sensor data saved" });
  });
}