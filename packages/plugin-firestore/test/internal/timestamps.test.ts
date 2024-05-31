import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

{
  const testName = 'read timestamps'
  test(testName, async () => {
    /// 'fetch' resolves once all stores have given a response with data
    const { datesModule } = await createMagnetarInstance('read')
    assert.deepEqual(datesModule.data.size, 0)
    try {
      await datesModule.fetch({ force: true })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }
    assert.deepEqual(datesModule.data.size, 6)
  })
}
{
  const testName = 'read timestamps & filter'
  test(testName, async () => {
    /// 'fetch' resolves once all stores have given a response with data
    const { datesModule } = await createMagnetarInstance('read')
    let resultMap: any
    assert.deepEqual(datesModule.data.size, 0)
    try {
      resultMap = await datesModule.where('date', '>', new Date(2020, 0, 1)).fetch({ force: true })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }
    assert.deepEqual(datesModule.data.size, 4)
    assert.deepEqual(resultMap.size, 4)
  })
}
