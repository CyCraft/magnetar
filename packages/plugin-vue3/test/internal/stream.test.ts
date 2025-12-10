import { pokedexMap } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

test('stream events (before and success) are called for added documents', async () => {
  let beforeCount = 0
  let successCount = 0

  const { magnetar } = createMagnetarInstance()

  // Create a new module with event handlers
  const pokedexModuleWithEvents = magnetar.collection('pokedex', {
    configPerStore: {
      cache: {},
      remote: {},
    },
    on: {
      before: ({ actionName, streamEvent }) => {
        if (actionName === 'stream' && streamEvent === 'added') {
          beforeCount++
        }
      },
      success: ({ actionName, streamEvent }) => {
        if (actionName === 'stream' && streamEvent === 'added') {
          successCount++
        }
      },
    },
  })

  await new Promise<void>((resolve) => {
    pokedexModuleWithEvents
      .stream({ onFirstData: () => resolve() }, {
        streamSendsData: [...pokedexMap().values()],
      } as any)
      .catch((e: any) => assert.fail(e.message))
  })

  // Verify events were called 151 times (one for each Pokemon)
  assert.equal(beforeCount, 151, 'before events should be called 151 times')
  assert.equal(successCount, 151, 'success events should be called 151 times')

  pokedexModuleWithEvents.closeStream()
})
