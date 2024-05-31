import { execa } from 'execa'
import { setupTestDatabase } from './setupTestDatabase.js'

try {
  await setupTestDatabase()
  await execa({
    stdout: 'inherit',
    stdin: 'inherit',
  })`vitest run --testTimeout 15000`
  process.exit(0)
} catch (error) {
  process.exit(1)
}
