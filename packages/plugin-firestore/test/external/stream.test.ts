import { pokedex, waitMs } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

{
  const testName = 'stream (collection)'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance('read')
    assert.deepEqual(pokedexModule.doc('136').data, undefined)
    assert.deepEqual(pokedexModule.data.size, 0)

    // do not await, because it only resolves when the stream is closed
    pokedexModule.stream().catch((e: any) => assert.fail(e.message)) // prettier-ignore
    await waitMs(3500)

    // close the stream:
    pokedexModule.closeStream()

    assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
    assert.deepEqual(pokedexModule.data.get('2'), pokedex(2))
    assert.deepEqual(pokedexModule.data.get('3'), pokedex(3))
    assert.deepEqual(pokedexModule.data.size, 151)
  })
}
{
  const testName = 'stream (empty collection with read access)'
  test(testName, async () => {
    const { magnetar } = await createMagnetarInstance('read')

    // Create a readable collection that has no data
    const emptyReadable = magnetar.collection('emptyReadable', {
      configPerStore: {
        remote: { firestorePath: 'magnetarTests/read/emptyCollection2' },
      },
    })

    // Ensure it starts empty
    assert.deepEqual(emptyReadable.data.size, 0)

    // Collect onFirstData payloads
    const onFirstDataPayloads: { empty?: boolean; existingStream?: boolean }[] = []

    // Start stream and ensure no errors are thrown
    emptyReadable
      .stream({ onFirstData: (payload) => onFirstDataPayloads.push(payload) })
      .catch((e: any) => assert.fail(e.message))

    // Wait briefly for initial snapshot
    await waitMs(1000)

    // Start a second stream with the same params; its onFirstData should also trigger
    emptyReadable
      .stream({ onFirstData: (payload) => onFirstDataPayloads.push(payload) })
      .catch((e: any) => assert.fail(e.message))

    // Give the second stream a moment
    await waitMs(1000)

    // onFirstData should be called and indicate empty collection for first
    // and return existingStream for the second
    assert.deepEqual(onFirstDataPayloads[0], { empty: true })
    assert.deepEqual(onFirstDataPayloads[1], { empty: undefined, existingStream: true })

    // Should remain empty
    assert.deepEqual(emptyReadable.data.size, 0)

    // Close the stream
    emptyReadable.closeStream()
  })
}

{
  const testName = 'stream non-empty collection then stream doc on same dataset'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance('read')

    const onFirstDataPayloads: { empty?: boolean; existingStream?: boolean }[] = []

    // Ensure collection ends up with data
    pokedexModule
      .stream({ onFirstData: (payload) => onFirstDataPayloads.push(payload) })
      .catch((e: any) => assert.fail(e.message))
    await waitMs(1000)

    // Now open a stream on a specific doc within the same dataset
    pokedexModule
      .doc('1')
      .stream({ onFirstData: (payload) => onFirstDataPayloads.push(payload) })
      .catch((e: any) => assert.fail(e.message))

    await waitMs(1000)

    // For existing doc, empty should be false
    assert.deepEqual(onFirstDataPayloads[0], { empty: false })
    assert.deepEqual(onFirstDataPayloads[1], { empty: false })

    // Close streams
    pokedexModule.closeAllStreams()
  })
}
{
  const testName = 'stream (doc)'
  test(testName, async () => {
    const { trainerModule } = await createMagnetarInstance('read')
    assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

    // do not await, because it only resolves when the stream is closed
    trainerModule.stream().catch((e: any) => assert.fail(e.message)) // prettier-ignore
    await waitMs(3500)

    // close the stream:
    trainerModule.closeStream()

    assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  })
}
{
  const testName = 'stream (collection) where-filter'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance('read')
    assert.deepEqual(pokedexModule.data.size, 0)
    // let's get some more
    const pokedexModuleWithQuery = pokedexModule
      .where('type', 'array-contains', 'Fire')
      .where('base.Speed', '>=', 100)
      .orderBy('base.Speed', 'asc')
      .orderBy('name', 'asc')
    // → Charizard 6, Ninetales 38, Rapidash 78

    // do not await, because it only resolves when the stream is closed
    pokedexModuleWithQuery.stream().catch((e: any) => assert.fail(e.message))

    await waitMs(5000)
    pokedexModuleWithQuery.closeStream()

    // the queried instance only has these 3 Pokemon
    assert.deepEqual(
      [...pokedexModuleWithQuery.data.values()],
      [pokedex(6), pokedex(38), pokedex(78)],
    )
    assert.deepEqual(pokedexModule.data.size, 3)
  })
}
{
  const testName = 'stream: errors are thrown'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance('read-no-access')

    let error
    try {
      // @ts-expect-error unused variable
      const a = await pokedexModule.stream()
    } catch (_error) {
      error = _error
    }

    assert.isTrue(!!error)
  })
}

{
  const testName = 'stream with onFirstData callback (non-empty collection)'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance('read')
    let onFirstDataCalled = false
    let onFirstDataCallCount = 0
    let onFirstDataEmptyValue: boolean | undefined = undefined

    // Test with onFirstData callback
    pokedexModule
      .stream({
        onFirstData: ({ empty }) => {
          onFirstDataCalled = true
          onFirstDataCallCount++
          onFirstDataEmptyValue = empty
        },
      })
      .catch((e: any) => assert.fail(e.message))

    // Wait for initial data to arrive
    await waitMs(100)

    // onFirstData should be called once when initial snapshot arrives
    assert.deepEqual(onFirstDataCalled, true)
    assert.deepEqual(onFirstDataCallCount, 1)
    assert.deepEqual(onFirstDataEmptyValue, false)

    // Close the stream
    pokedexModule.closeStream()

    // onFirstData should not be called again
    await waitMs(100)
    assert.deepEqual(onFirstDataCallCount, 1)
  })
}
{
  const testName = 'stream with onFirstData callback (empty collection)'
  test(testName, async () => {
    const { magnetar } = await createMagnetarInstance('read')
    let onFirstDataCalled = false

    // Create a collection that should be empty (using a path allowed by security rules)
    const emptyCollection = magnetar.collection('emptyCollection', {
      configPerStore: {
        remote: { firestorePath: 'magnetarTests/read/emptyCollection' },
      },
    })

    // Test with onFirstData callback on empty collection
    emptyCollection
      .stream({
        onFirstData: ({ empty }) => {
          onFirstDataCalled = true
        },
      })
      .catch((e: any) => assert.fail(e.message))

    // Wait for initial snapshot to arrive
    await waitMs(100)

    // onFirstData should be called even for empty collections
    assert.deepEqual(onFirstDataCalled, true)

    // Close the stream
    emptyCollection.closeStream()
  })
}
{
  const testName = 'stream with onFirstData callback (non-existing doc)'
  test(testName, async () => {
    const { magnetar } = await createMagnetarInstance('read')
    let onFirstDataCalled = false
    let onFirstDataEmptyValue: boolean | undefined = undefined

    const nonExistingDoc = magnetar.doc('pokedex/does-not-exist', {
      configPerStore: {
        remote: { firestorePath: 'magnetarTests/read/pokedex/does-not-exist' },
      },
    })

    nonExistingDoc
      .stream({
        onFirstData: ({ empty }) => {
          onFirstDataCalled = true
          onFirstDataEmptyValue = empty
        },
      })
      .catch((e: any) => assert.fail(e.message))

    await waitMs(100)
    assert.deepEqual(onFirstDataCalled, true)
    assert.deepEqual(onFirstDataEmptyValue, true)
    nonExistingDoc.closeStream()
  })
}
{
  const testName = 'stream with onFirstData callback (existing doc)'
  test(testName, async () => {
    const { magnetar } = await createMagnetarInstance('read', {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    let onFirstDataCalled = false
    let onFirstDataEmptyValue: boolean | undefined = undefined

    const existingDoc = magnetar.doc('pokedex/1', {
      configPerStore: {
        remote: { firestorePath: 'magnetarTests/read/pokedex/1' },
      },
    })

    existingDoc
      .stream({
        onFirstData: ({ empty }) => {
          onFirstDataCalled = true
          onFirstDataEmptyValue = empty
        },
      })
      .catch((e: any) => assert.fail(e.message))

    await waitMs(100)
    assert.deepEqual(onFirstDataCalled, true)
    assert.deepEqual(onFirstDataEmptyValue, false)
    existingDoc.closeStream()
  })
}
{
  const testName = 'stream with onFirstData callback (existing stream)'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance('read')
    let onFirstDataCallCount = 0
    const onFirstDataPayloads: { empty?: boolean; existingStream?: boolean }[] = []

    // Start first stream
    pokedexModule
      .stream({
        onFirstData: (payload: { empty?: boolean; existingStream?: boolean }) => {
          onFirstDataCallCount++
          onFirstDataPayloads.push(payload)
        },
      })
      .catch((e: any) => assert.fail(e.message))

    // Wait for first stream to be established
    await waitMs(1000)

    // Start second stream (should return existing stream)
    pokedexModule
      .stream({
        onFirstData: (payload: { empty?: boolean; existingStream?: boolean }) => {
          onFirstDataCallCount++
          onFirstDataPayloads.push(payload)
        },
      })
      .catch((e: any) => assert.fail(e.message))

    // Wait for second call to complete
    await waitMs(100)

    // Should have been called twice
    assert.deepEqual(onFirstDataCallCount, 2)

    // First call should have empty: false (non-empty collection)
    assert.deepEqual(onFirstDataPayloads[0], { empty: false })

    // Second call should have existingStream: true
    assert.deepEqual(onFirstDataPayloads[1], { empty: undefined, existingStream: true })

    // Close the stream
    pokedexModule.closeStream()
  })
}

{
  const testName = 'stream with onFirstData callback, close and stream again'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance('read')
    let onFirstDataCallCount = 0
    const onFirstDataPayloads: { empty?: boolean }[] = []

    // Start first stream
    pokedexModule
      .stream({
        onFirstData: (payload) => {
          console.log(`1!`)
          onFirstDataCallCount++
          onFirstDataPayloads.push(payload)
        },
      })
      .catch((e: any) => assert.fail(e.message))

    // Wait for first stream to be established
    await waitMs(1000) // this test needs about 1 sec to be able to pass, idk why
    pokedexModule.closeAllStreams()
    await waitMs(1)

    // Start second stream (should return existing stream)
    pokedexModule
      .stream({
        onFirstData: (payload) => {
          console.log(`yes!`)
          onFirstDataCallCount++
          onFirstDataPayloads.push(payload)
        },
      })
      .catch((e: any) => assert.fail(e.message))

    // Wait for second call to complete
    await waitMs(1000) // this test needs about 1 sec to be able to pass, idk why

    // Should have been called twice
    assert.deepEqual(onFirstDataCallCount, 2)

    // First call should have empty: false (non-empty collection)
    assert.deepEqual(onFirstDataPayloads[0], { empty: false })

    // Second call should have existingStream: true
    assert.deepEqual(onFirstDataPayloads[1], { empty: false })

    // Close the stream
    pokedexModule.closeStream()
  })
}
