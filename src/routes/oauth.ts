// src/routes/oauth.ts
import { FastifyInstance } from 'fastify';
import { supabase } from '../utils/supabase';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function oauthRoutes(fastify: FastifyInstance) {
  fastify.post('/google', {
    schema: {
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['access_token'],
        properties: {
          access_token: { type: 'string' } // Agora só aceita access_token
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' }
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { access_token } = request.body as { access_token: string };

      // 1️⃣ Valida o access_token com o Supabase
      const { data: { user }, error } = await supabase.auth.getUser(access_token);
      
      if (error || !user?.email) {
        throw new Error(error?.message || 'Usuário do Google não encontrado');
      }

      // 2️⃣ Cria ou atualiza o usuário no seu banco
      const dbUser = await prisma.user.upsert({
        where: { email: user.email },
        create: {
          email: user.email,
          password: '', // Campo obrigatório (não utilizado)
          name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || ''
        },
        update: {
          name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || ''
        }
      });

      // 3️⃣ Gera o JWT da sua aplicação
      const token = fastify.jwt.sign(
        { id: dbUser.id, email: dbUser.email },
        { expiresIn: '7d' }
      );

      return {
        token,
        user: {
          id: dbUser.id,
          email: dbUser.email
        }
      };

    } catch (error) {
      console.error('Erro na autenticação:', error);
      return reply.code(401).send({
        message: 'Falha na autenticação com Google',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
}