import { Get } from "@/utils/types";

// --- Type Testing Utilities ---
type Expect<T extends true> = T;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

// --- Test Data Model ---
interface Data {
  users?:
    | {
        id: number;
        name: string;
        roles: [string, number];
        metadata: Record<string, boolean>;
        posts:
          | {
              title: string;
              tags: string[] | null;
            }[]
          | null;
      }[]
    | null;
}

// --- Assertions ---
// oxlint-disable-next-line no-unused-vars
type Tests = [
  Expect<Equal<Get<Data, "users">, Data["users"]>>,
  Expect<Equal<Get<Data, "users[].name">, string[] | null | undefined>>,
  Expect<Equal<Get<Data, "users[0].id">, number | null | undefined>>,

  // 4. Deep Array Mapping (`[].arr[].prop`)
  // CORRECTED: users.map(u => u.posts?.map(p => p.title)) yields (string[] | null)[]
  Expect<Equal<Get<Data, "users[].posts[].title">, (string[] | null)[] | null | undefined>>,

  // 5. Handling deeper nested `null` arrays (`posts[].tags[]`)
  // CORRECTED: nested `.map()` keeps the intermediate nulls intact
  Expect<
    Equal<Get<Data, "users[].posts[].tags[]">, ((string | null)[] | null)[] | null | undefined>
  >,

  // 6. Strict Tuple Extraction
  Expect<Equal<Get<Data, "users[].roles[1]">, number[] | null | undefined>>,

  // 7. Dictionary/Record Extraction
  Expect<Equal<Get<Data, "users[].metadata.isActive">, boolean[] | null | undefined>>,

  // 8. Top-level array extraction
  Expect<Equal<Get<string[], "[]">, string>>,

  // 9. Non-existent path
  // CORRECTED: data.users?.map(u => u.doesNotExist) evaluates to `undefined`, not strictly `never`
  // because the parent `users` union propagates its optionality over the mapping.
  Expect<Equal<Get<Data, "users[].doesNotExist">, null | undefined>>,
];
