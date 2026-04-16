import * as migration_20260416_165345_init from "./20260416_165345_init";

export const migrations = [
  {
    up: migration_20260416_165345_init.up,
    down: migration_20260416_165345_init.down,
    name: "20260416_165345_init",
  },
];
