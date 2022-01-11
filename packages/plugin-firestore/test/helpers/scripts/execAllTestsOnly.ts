import ExecSh from 'exec-sh'
import { setupTestDatabase } from './setupTestDatabase'

const { promise: ExecShPromise } = ExecSh

function execSh(command: string) {
  return ExecShPromise(command, { cwd: '../..' })
}

;(async () => {
  try {
    await setupTestDatabase()
    await execSh(`yarn workspace @magnetarjs/plugin-firestore ava --match='*only:*'`)
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
