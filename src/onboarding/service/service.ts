import { OnboardingDAO } from "@src/onboarding/dao/dao";
import {
    CreatePlanDTO,
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

    async createPlan(inputData: CreatePlanDTO): Promise<string> {
        return await this.dao.createPlan(inputData);
    }

    async createUserEquipments(inputData: CreateUserEquipmentsDTO): Promise<void> {
        await this.dao.createUserEquipments(inputData);
    }
}
