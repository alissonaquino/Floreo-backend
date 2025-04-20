import fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyJwt from '@fastify/jwt'
import authRoutes from './routes/auth'
import oauthRoutes from './routes/oauth';


const server = fastify()

// Configuração JWT
server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET!
})

// Configuração Swagger
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Floreo API',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }
})

// Configuração do Swagger UI
server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list'
    }
  })

server.get('/', async (request, reply) => {
    return { status: 'OK', message: 'API is running' }
})

// Rotas
server.register(authRoutes, { prefix: '/api/auth' })
server.register(oauthRoutes, { prefix: '/api/oauth' });

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server running in ${address}`)
})