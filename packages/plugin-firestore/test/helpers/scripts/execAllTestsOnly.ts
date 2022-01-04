import ExecSh from 'exec-sh'
import { setupTestDatabase } from './setupTestDatabase'

const { promise: ExecShPromise } = ExecSh

function execSh(command: string) {
  return ExecShPromise(command, { cwd: '../..' })
}

;(async () => {
  await setupTestDatabase()
  await execSh(`yarn workspace @magnetarjs/plugin-firestore ava --match='*only:*'`)
})()
