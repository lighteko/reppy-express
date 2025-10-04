import { OnboardingDAO } from "@src/onboarding/dao/dao";
import {
    CreateProgramDTO,
    CreateUserBioDTO,
    CreateUserEquipmentsDTO,
    CreateUserPreferencesDTO
} from "@src/onboarding/dto/dto";

export class OnboardingService {
    private dao: OnboardingDAO;

    constructor() {
        this.dao = new OnboardingDAO();
    }

    async createUserBio(inputData: CreateUserBioDTO): Promise<void> {
        await this.dao.createUserBio(inputData);
    }

    async createUserPreferences(inputData: CreateUserPreferencesDTO): Promise<void> {
        await this.dao.createUserPreferences(inputData);
    }

    async createProgram(inputData: CreateProgramDTO): Promise<string> {
        return await this.dao.createProgram(inputData);
    }

    async createUserEquipments(inputData: CreateUserEquipmentsDTO): Promise<void> {
        await this.dao.createUserEquipments(inputData);
    }
}
