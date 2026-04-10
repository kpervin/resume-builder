// Helper to prevent invalid paths from returning `never[]`.
type MapArray<T> = [T] extends [never] ? never : T[];

export type Get<T, P extends string> = P extends ""
  ? T
  : // oxlint-disable-next-line typescript/no-explicit-any
    T extends any // Distribute unions (safely propagates null & undefined)
    ? T extends null | undefined
      ? T
      : // 1. Array/Tuple Notation: Starts with "[]..." or "[0]..."
        P extends `[${infer Index}]${infer Rest}`
        ? Rest extends "" // Terminal: e.g., "[]" or "[0]"
          ? Index extends ""
            ? T extends readonly (infer U)[]
              ? U
              : never
            : Index extends keyof T
              ? T[Index]
              : T extends readonly (infer U)[]
                ? U
                : never
          : Rest extends `.${infer Next}` // Continuation: e.g., "[].prop" or "[0].prop"
            ? Index extends ""
              ? T extends readonly (infer U)[]
                ? MapArray<Get<U, Next>>
                : never
              : Index extends keyof T
                ? Get<T[Index], Next>
                : T extends readonly (infer U)[]
                  ? Get<U, Next>
                  : never
            : never
        : // 2. Property Notation with Continuation: "key.prop" or "key[0].prop" or "key[].prop"
          P extends `${infer Key}.${infer Rest}`
          ? Key extends `${infer RealKey}[${infer Index}]`
            ? RealKey extends keyof T
              ? Get<T[RealKey], `[${Index}].${Rest}`>
              : never
            : Key extends keyof T
              ? Get<T[Key], Rest>
              : never
          : // 3. Terminal Property with Brackets: "key[0]" or "key[]"
            P extends `${infer Key}[${infer Index}]`
            ? Key extends keyof T
              ? Get<T[Key], `[${Index}]`>
              : never
            : // 4. Standard Terminal Property: "key"
              P extends keyof T
              ? T[P]
              : never
    : never;
