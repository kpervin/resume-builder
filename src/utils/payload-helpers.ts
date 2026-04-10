import { Condition } from "payload";
import type { TypeWithID } from "payload";

export function condition<TData extends TypeWithID = TypeWithID, TSiblingData = unknown>(
  callback: Condition<TData, TSiblingData>,
): Condition<TData, TSiblingData> {
  return callback;
}
