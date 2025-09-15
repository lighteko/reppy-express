import { z } from "zod";

/**
 * `base` 스키마에서 `requiredKeys` 만 필수로 남기고
 * 나머지 필드는 전부 optional 로 변환한 새 ZodObject 를 돌려준다.
 */
export function partialExcept<
    Base extends z.ZodObject<any>,
    Keys extends readonly (keyof Base["shape"])[]
>(
    base: Base,
    requiredKeys: Keys
) {
    /* --------------------------------- helpers -------------------------------- */

    // { id: true, name: true } 형태의 mask 객체
    const mask = Object.fromEntries(
        requiredKeys.map((k) => [k, true])
    ) as Record<Keys[number], true>;

    // 1) 필수 파트: pick(mask)
    const required = base.pick(mask);

    // 2) 옵션 파트: (나머지) .partial()
    const optional = base.omit(mask).partial();

    // 3) 합치기 – .extend() 는 "shape" 객체를 받는다.
    return required.extend(optional.shape);

    /* -------------------------------------------------------------------------- */
}
