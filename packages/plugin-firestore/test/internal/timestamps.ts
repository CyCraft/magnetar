import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'

{
  const testName = 'read timestamps'
  test(testName, async (t) => {
    /// 'fetch' resolves once all stores have given a response with data
    const { datesModule } = await createMagnetarInstance('read')
    t.deepEqual(datesModule.data.size, 0)
    try {
      await datesModule.fetch({ force: true })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }
    t.deepEqual(datesModule.data.size, 6)
  })
}
{
  const testName = 'only:read timestamps & filter'
  test(testName, async (t) => {
    /// 'fetch' resolves once all stores have given a response with data
    const { datesModule } = await createMagnetarInstance('read')
    let resultMap: any
    t.deepEqual(datesModule.data.size, 0)
    try {
      resultMap = await datesModule.where('date', '>', new Date(2020, 0, 1)).fetch({ force: true })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }
    t.deepEqual(datesModule.data.size, 4)
    t.deepEqual(resultMap.size, 4)
  })
}
