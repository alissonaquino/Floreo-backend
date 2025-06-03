import fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

import { sensorDataRoutes } from './routes/sensorData'
import { getDeviceConfigRoute } from './routes/getDeviceConfig';
import { getIrrigationCommandRoute } from './routes/getCommandRoute';
import { markIrrigationExecutedRoute } from './routes/mark-irrigation';

const server = fastify()

// Configura o Swagger
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Floreo API',
      version: '1.0.0',
      description: 'API para dispositivos e sensores'
    }
  }
})

// Configura o Swagger UI (interface web)
server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list'
  },
  // serve as root page, so /docs carrega o swagger UI
  staticCSP: true
})

// Rota de teste simples
server.get('/', async () => {
  return { status: 'OK' }
})

// Registra as rotas do device com prefixo /api/devices
server.register(sensorDataRoutes, { prefix: '/api/devices' })
server.register(getDeviceConfigRoute, { prefix: '/api/devices' })
server.register(getIrrigationCommandRoute, { prefix: '/api/devices' })
server.register(markIrrigationExecutedRoute, { prefix: '/api/devices' })

// Inicia o servidor
server.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) throw err
  console.log(`Server running at ${address}`)
  console.log(`Swagger UI available at ${address}/docs`)
})
