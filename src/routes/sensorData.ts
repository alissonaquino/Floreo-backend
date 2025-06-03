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
          value: { type: ["number", "boolean"] }
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
      value: z.union([z.number(), z.boolean()])
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

    const formattedValue = type === "relayState"
      ? (typeof value === "boolean" ? (value ? 1 : 0) : value)
      : value;

    await prisma.sensorData.create({
      data: {
        sensorType: type === "humiditySoil" ? "soil_humidity"
                  : type === "humidityAir" ? "air_humidity"
                  : type,
        value: formattedValue,
        recordedAt: new Date(),
        deviceId: device.id,
        plantId: currentPlant.id
      }
    });

    return reply.status(201).send({ message: "Sensor data saved" });
  });
}
