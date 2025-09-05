import { execa } from 'execa'
import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setupTestDatabase } from './setupTestDatabase.js'

async function findTestFilesWithOnly(rootDir: string): Promise<string[]> {
  const results: string[] = []

  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue
      const fullPath = resolve(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.test.ts')) {
        const content = await readFile(fullPath, 'utf8')
        if (/(?:\bdescribe|\btest|\bit)\.only\(/.test(content)) {
          results.push(fullPath)
        }
      }
    }
  }

  await walk(rootDir)
  return results
}

await setupTestDatabase()

const packageRoot = fileURLToPath(new URL('../../..', import.meta.url))
const testRoot = resolve(packageRoot, 'test')
const onlyFiles = await findTestFilesWithOnly(testRoot)

if (onlyFiles.length > 0) {
  console.log('running `v i t e s t run --testTimeout 15000 ${onlyFiles}`')
  await execa({
    preferLocal: true,
    stdout: 'inherit',
    stderr: 'inherit',
  })`vitest run --testTimeout 15000 ${onlyFiles}`
} else {
  console.log('running `v i t e s t run --testTimeout 15000`')
  await execa({
    preferLocal: true,
    stdout: 'inherit',
    stderr: 'inherit',
  })`vitest run --testTimeout 15000`
}

process.exit(0)
