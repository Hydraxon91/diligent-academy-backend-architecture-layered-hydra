import fastify from 'fastify';
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import cors from '@fastify/cors';
import { PathLike } from 'node:fs';
import { JsonFileStore } from './utils/json-file-store';
import { Pet, PetProperties } from './business/pet-type';
import { PetService } from './business/pet-service';
import { PetRepository } from './data-access/pet-repository';

export default async function createApp(options = {}, dataFilePath: PathLike) {
  const app = fastify(options).withTypeProvider<JsonSchemaToTsProvider>()
  await app.register(cors, {});

  const petStore = new JsonFileStore<Pet>(dataFilePath);
  const petRepository = new PetRepository(petStore);
  const petService = new PetService(petStore);

  const postPetSchema = {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
      additionalProperties: false
    }
  } as const

  const responsePetArraySchema = {
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            food: { type: 'number' },
            weight: { type: 'number' },
            age: { type: 'number' },
          }
        }
      },
      404: {
        type: 'object',
        properties: {
          // error: { type: 'null' },
          error: { type: 'string' },
        },
      },
    },
  } as const;

  const responsePetSchema = {
    params: {
      type: "object",
      properties: {
        id: {type: 'number'}
      },
      required: ['id']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          food: { type: 'number' },
          weight: { type: 'number' },
          age: { type: 'number' },
        },
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'null' },
          //error: { type: 'string' },
        },
      },
    },
  } as const;

  const patchPetSchema = {
    params: {
      type: "object",
      properties: {
        id: {type: 'number'}
      },
      required: ['id']
    },
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        food: {type: 'number'},
        weight: {type: 'number'},
        age: {type: 'number'},
      },
      additionalProperties: false
    }
  } as const

  const deletedPetSchema = {
    params: {
      type: 'object',
      properties: {
        id: { type: 'number' },
      },
      required: ['id'],
    },
    response: {
      204: {
        type: 'null',
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  } as const;
  

  app.post(
    '/pets',
    { schema: postPetSchema },
    async (request, reply) => {
      //Read http request parameter
      const { name } = request.body

      // business logic
      const newPet = await petService.birth(name)
      // http response
      reply.status(201);
      return newPet;
    }
  )

  app.get(
    '/pets',
    { schema: responsePetArraySchema},
    async (request, reply) => {
      const pets = await petService.getAllPets();
      if(!pets){
        return reply.status(404).send({ error: 'No pets found' });
      }
      reply.status(200);
      return pets;
    }
  )

  app.get(
    '/pets/:id',
    { schema: responsePetSchema },
    async (request, reply) => {
      const { id } = request.params;
      const foundPet = await petService.getPetById(id);
      if (!foundPet) {
        return reply.status(404).send({});
        // return reply.status(404).send({ error: 'Pet not found' });
      }
      reply.status(201);
      return foundPet;
    }
  )

  app.patch(
    '/pets/:id',
    { schema: patchPetSchema },
    async (request, reply) => {
      const { id } = request.params;
      const { name, food, weight, age } = request.body as Partial<PetProperties>;
      const updatedPet = await petService.updatePetById(Number(id), { name, food, weight, age });
      if (!updatedPet) {
        return reply.status(404).send({ error: 'Pet not found' });
      }
      reply.status(201);
      return updatedPet;
    }
  )

  app.delete(
    '/pets/:id',
    { schema: deletedPetSchema },
    async (request, reply) => {
      const { id } = request.params;
      const wasDeleted = await petService.deletePetById(id)
      if (!wasDeleted) {
        return reply.status(404).send({ error: 'Pet not found' });
    }

    return reply.status(204).send();
    }
  )

  return app;
}