import { assert } from 'vitest'
import { db } from './initFirebase.js'

export async function firestoreDeepEqual(
  testName: string,
  documentPath: string,
  expected: any,
  message?: string,
) {
  const docRef = db.doc(`magnetarTests/${testName}/${documentPath}`)
  const docSnapshot = await docRef.get()
  const docData = docSnapshot.data()

  assert.deepEqual(docData, expected, message)
}
