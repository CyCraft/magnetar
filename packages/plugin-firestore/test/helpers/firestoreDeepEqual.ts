import { doc, getDoc } from 'firebase/firestore'
import { assert } from 'vitest'
import { db } from './initFirebase.js'

export async function firestoreDeepEqual(
  testName: string,
  documentPath: string,
  expected: any,
  message?: string,
) {
  const docRef = doc(db, `magnetarTests/${testName}/${documentPath}`)
  const docSnapshot = await getDoc(docRef)
  const docData = docSnapshot.data()

  assert.deepEqual(docData, expected, message)
}
