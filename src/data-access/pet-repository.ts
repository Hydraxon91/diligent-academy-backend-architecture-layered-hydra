import { Pet, PetProperties } from "../business/pet-type"
import { JsonFileStore } from "../utils/json-file-store"

function getNextId<T extends {id: number}>(items: T[]) {
    if (items.length === 0) {
      return 1;
    }
    const ids = items.map(item => item.id);
    const maxId = Math.max(...ids);
    return maxId + 1;
  }

export class PetRepository {

    constructor(private readonly petStore: JsonFileStore<Pet>){}

    async create(petProperties: PetProperties) {
        const pets = await this.petStore.read();
        const nextId = getNextId(pets);
        const newPet: Pet = {
            ...petProperties,
            id: nextId,
          }
        pets.push(newPet);
        await this.petStore.write(pets);
        return newPet
    }

    async readAll() {
        const pets = await this.petStore.read();
        if (!pets) {
            return null;
        }
        return pets;
    }

    async readById(id: number) {
        const pets = await this.petStore.read();
        if (!pets) {
            return null;
        }
        return pets.find(p => p.id === id);
    }

    async update(id: number, petProperties: Partial<PetProperties>) {
        const pets = await this.petStore.read();
     
        const petIndex = pets.findIndex(p => p.id === id);
        console.log(petIndex);
        
        if (petIndex === -1) {
            return null;
        }

        const existingPet = pets[petIndex];
        const updatedPet: Pet = {
            ...existingPet,
            ...(petProperties.name !== undefined ? { name: petProperties.name } : {}),
            ...(petProperties.food !== undefined ? { food: petProperties.food } : {}),
            ...(petProperties.weight !== undefined ? { weight: petProperties.weight } : {}),
            ...(petProperties.age !== undefined ? { age: petProperties.age } : {}),
        }
        pets[petIndex] = updatedPet;
        await this.petStore.write(pets);
        return updatedPet;
    }

    async delete(id: number) {
        const pets = await this.petStore.read();
        const petIndex = pets.findIndex(p => p.id === id);
        if (petIndex === -1) {
            return false;
        }
        pets.splice(petIndex, 1);
        await this.petStore.write(pets);
        return true;
    }
}