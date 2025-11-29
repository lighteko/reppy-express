import { AuthDAO } from "@src/auth/dao/dao";
import {
    LoginPayloadDTO,
    LoginResponseDTO,
    LoginResponseSchema,
    SignUpWithOAuthDTO,
    SignUpWithPasswordDTO,
    TokenPayloadSchema
} from "@src/auth/dto/dto";
import { AuthenticationError, DuplicateError } from "@lib/errors";
import Tokens from "@lib/infra/tokens";
import { validateInput } from "@lib/validate";
import { encryptPassword, encryptToken, tokenExpiresAt, validatePassword } from "@lib/utils/encryptors";

export class AuthService {
    private dao: AuthDAO;
    private tokens: Tokens;

    constructor() {
        this.dao = new AuthDAO();
        this.tokens = Tokens.getInstance();
    }

    async signUpWithPassword(inputData: SignUpWithPasswordDTO): Promise<void> {
        const user = await this.dao.getUserInfoByEmail(inputData.email);
        if (user) {
            throw new DuplicateError("User already exists.");
        }
        inputData.password = await encryptPassword(inputData.password);
        await this.dao.createUserWithPassword(inputData);
    }

    async signUpWithOAuth(inputData: SignUpWithOAuthDTO): Promise<void> {
        const user = await this.dao.getUserInfoByEmail(inputData.email);
        if (user) {
            throw new DuplicateError("User already exists.");
        }
        await this.dao.createUserWithOAuth(inputData);
    }

    async login(payload: LoginPayloadDTO): Promise<LoginResponseDTO> {
        const user = await this.dao.getUserInfoByEmail(payload.email);

        if (!user) {
            throw new AuthenticationError("Invalid Credentials.");
        }

        await validatePassword(payload.password, (user as any).password);
        const tokenPayload = validateInput(TokenPayloadSchema, {
            userId: (user as any).userId as string,
            email: payload.email,
        });
        const { refreshToken, accessToken } = this.tokens.generateAuthTokens(tokenPayload);
        const encryptedRefreshToken = encryptToken(refreshToken);
        const expiresAt = tokenExpiresAt(refreshToken);
        await this.dao.upsertRefreshToken(tokenPayload.userId, encryptedRefreshToken, expiresAt);
        return validateInput(LoginResponseSchema, {
            accessToken,
            refreshToken,
            user,
        });
    }

    async logout(tokenHash: Buffer): Promise<void> {
        await this.dao.revokeRefreshToken(tokenHash);
    }
}
