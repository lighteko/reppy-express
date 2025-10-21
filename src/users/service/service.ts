import { UserDAO } from "@src/users/dao/dao";
import { GetUserEquipmentCodesDTO, GetUserExerciseCodesDTO, UpdateUserEquipmentsDTO } from "@src/users/dto/dto";

export class UserService {
    private dao: UserDAO;

    constructor() {
        this.dao = new UserDAO();
    }

    async updateUserEquipments(inputData: UpdateUserEquipmentsDTO) {
        await this.dao.updateUserEquipments(inputData);
    }

    async getUserEquipmentCodes(inputData: GetUserEquipmentCodesDTO) {
        await this.dao.getUserEquipmentCodes(inputData);
    }

    async getUserExerciseCodes(inputData: GetUserExerciseCodesDTO) {
        await this.dao.getUserExerciseCodes(inputData);
    }
}
