import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, waitMs } from '@magnetarjs/test-utils'

test('fetch: can mutate payload & read response (config in module)', async (t) => {
  function addSeen(payload: any) {
    return { ...payload, seen: true }
  }
  function addToken(payload: any = {}) {
    return { ...payload, auth: 'Bearer 123123' }
  }
  // get resolves once all stores have given a response with data
  const { magnetar } = createMagnetarInstance()
  const pokedexModule = magnetar.collection('pokedex', {
    modifyPayloadOn: { read: addToken },
    modifyReadResponseOn: { added: addSeen },
  })
  try {
    let payloadInSuccessEvent: any
    const result = await pokedexModule.fetch(undefined, {
      on: {
        success: ({ payload }) => {
          payloadInSuccessEvent = payload
        },
      },
    })
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(payloadInSuccessEvent, { auth: 'Bearer 123123' })
    t.deepEqual(result.data.get('136'), { ...pokedex(136), seen: true })
  } catch (error) {
    t.fail(error)
  }
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('136'), { ...pokedex(136), seen: true })
})

test('stream: can mutate payload & read response (config in module)', async (t) => {
  function addSeen(payload: any) {
    return { ...payload, seen: true }
  }
  function addToken(payload: any = {}) {
    return { ...payload, auth: 'Bearer 123123' }
  }
  const { magnetar } = createMagnetarInstance()
  const pokedexModule = magnetar.collection('pokedex', {
    modifyPayloadOn: { read: addToken },
    modifyReadResponseOn: { added: addSeen },
  })
  let payloadInSuccessEvent: any
  pokedexModule.stream(
    {},
    {
      on: {
        before: ({ payload }) => {
          payloadInSuccessEvent = payload
        },
      },
    }
  )
  await waitMs(600)
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(payloadInSuccessEvent, { auth: 'Bearer 123123' })
  t.deepEqual(pokedexModule.data.get('2'), { ...pokedex(2), seen: true })
})

test('insert: can mutate payload (config in module)', async (t) => {
  function addSeen(payload: any) {
    if (!('seen' in payload)) return { ...payload, seen: true }
  }
  // get resolves once all stores have given a response with data
  const { magnetar } = createMagnetarInstance()
  const pokedexModule = magnetar.collection('pokedex', {
    modifyPayloadOn: { write: addSeen },
  })
  try {
    const payload = pokedex(7)
    const result = await pokedexModule.insert(payload)
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(result.data, { ...pokedex(7), seen: true })
  } catch (error) {
    t.fail(error)
  }
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('7'), { ...pokedex(7), seen: true })
})

test('fetch: can mutate payload & read response (config in action)', async (t) => {
  function addSeen(payload: any) {
    return { ...payload, seen: true }
  }
  function addToken(payload: any = {}) {
    return { ...payload, auth: 'Bearer 123123' }
  }
  // get resolves once all stores have given a response with data
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  try {
    let payloadInSuccessEvent: any
    const result = await pokedexModule.fetch(
      {},
      {
        modifyPayloadOn: { read: addToken },
        modifyReadResponseOn: { added: addSeen },
        on: {
          success: ({ payload }) => {
            payloadInSuccessEvent = payload
          },
        },
      }
    )
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(result.data.get('1'), { ...pokedex(1), seen: true })
    t.deepEqual(result.data.get('136'), { ...pokedex(136), seen: true })
    t.deepEqual(payloadInSuccessEvent, { auth: 'Bearer 123123' })
  } catch (error) {
    t.fail(error)
  }
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), seen: true })
  t.deepEqual(pokedexModule.data.get('136'), { ...pokedex(136), seen: true })
})

test('stream: can mutate payload & read response (config in action)', async (t) => {
  function addSeen(payload: any) {
    return { ...payload, seen: true }
  }
  function addToken(payload: any = {}) {
    return { ...payload, auth: 'Bearer 123123' }
  }
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  let payloadInSuccessEvent: any
  pokedexModule.stream(
    {},
    {
      modifyPayloadOn: { read: addToken },
      modifyReadResponseOn: { added: addSeen },
      on: {
        before: ({ payload }) => {
          payloadInSuccessEvent = payload
        },
      },
    }
  )
  await waitMs(600)
  t.deepEqual(payloadInSuccessEvent, { auth: 'Bearer 123123' })
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), seen: true })
  t.deepEqual(pokedexModule.data.get('2'), { ...pokedex(2), seen: true })
})

test('insert: can mutate payload (config in action)', async (t) => {
  function addSeen(payload: any) {
    if (!('seen' in payload)) return { ...payload, seen: true }
  }
  // get resolves once all stores have given a response with data
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  try {
    const payload = pokedex(7)
    const result = await pokedexModule.insert(payload, {
      modifyPayloadOn: { write: addSeen },
    })
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(result.data, { ...pokedex(7), seen: true })
  } catch (error) {
    t.fail(error)
  }
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1) })
  t.deepEqual(pokedexModule.data.get('7'), { ...pokedex(7), seen: true })
})
