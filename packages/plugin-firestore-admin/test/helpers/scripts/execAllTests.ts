import { execa } from 'execa'
import { setupTestDatabase } from './setupTestDatabase.js'

await setupTestDatabase()
await execa({
  preferLocal: true,
  stdout: 'inherit',
})`vitest run --testTimeout 31000`
