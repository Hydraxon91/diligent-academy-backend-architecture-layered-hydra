import { PetRepository } from "../data-access/pet-repository";
import { JsonFileStore } from "../utils/json-file-store";
import { Pet, PetProperties } from "./pet-type";


export class PetService {
    private readonly petRepository;
    constructor(petStore: JsonFileStore<Pet>){
        this.petRepository = new PetRepository(petStore);
    }
    // private readonly petRepository = new PetRepository(this.petStore)

    async birth(name: string){
        const newPet: PetProperties = {
            name,
            food: 1,
            weight: 1,
            age: 1
        }
        const returnPet = await this.petRepository.create(newPet)
        return returnPet;
    }

    async getAllPets(){
        return await this.petRepository.readAll();
    }

    async getPetById(id: number){
        return await this.petRepository.readById(id);
    }

    async updatePetById(id: number, petProperties: Partial<PetProperties>){
        const filteredProperties = Object.fromEntries(
            Object.entries(petProperties).filter(([_, value]) => value != null)
        ) as Partial<PetProperties>;
        
        return await this.petRepository.update(id, filteredProperties);
    }

    async deletePetById(id: number){
        return await this.petRepository.delete(id)
    }
}