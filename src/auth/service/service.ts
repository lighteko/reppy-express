import { AuthDAO } from "@src/auth/dao/dao";
import { PersonalInfoDTO, SignUpWithOAuthDTO, SignUpWithPasswordDTO } from "@src/auth/dto/dto";
import bcrypt from "bcrypt";
import { DuplicateError } from "@lib/errors";

export class AuthService {
    private dao: AuthDAO;

    constructor() {
        this.dao = new AuthDAO();
    }

    async signUpWithPassword(inputData: SignUpWithPasswordDTO): Promise<void> {
        const user = await this.dao.getUserByEmail(inputData.email);
        if (user) {
            throw new DuplicateError("User already exists.");
        }
        inputData.password = await bcrypt.hash(inputData.password, 12);
        await this.dao.createUserWithPassword(inputData);
    }

    async signUpWithOAuth(inputData: SignUpWithOAuthDTO): Promise<void> {
        const user = await this.dao.getUserByEmail(inputData.email);
        if (user) {
            throw new DuplicateError("User already exists.");
        }
        await this.dao.createUserWithOAuth(inputData);
    }

    async fillOutPersonalInfo(inputData: PersonalInfoDTO): Promise<void> {
        await this.dao.updateUserWithPersonalInfo(inputData);
    }
}
