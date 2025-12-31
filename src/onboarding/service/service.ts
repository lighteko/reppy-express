import { OnboardingDAO } from "@src/onboarding/dao/dao";
import {
    OnboardUserDTO
} from "@src/onboarding/dto/dto";
import Queues from "@lib/infra/queues";

export class OnboardingService {
    private dao: OnboardingDAO;
    private queue: Queues;

    constructor() {
        this.dao = new OnboardingDAO();
        this.queue = Queues.getInstance();
    }

    async onboardUser(inputData: OnboardUserDTO) {
        // 1. onboard user with given data
        // 2. send program generation request to Queue.
        await this.dao.onboardUser(inputData);
        // this.queue.enqueueBatch()
    }
}
