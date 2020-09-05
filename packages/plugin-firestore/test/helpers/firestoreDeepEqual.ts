import { firestore } from './firestore'
import { ExecutionContext } from 'ava'

export async function firestoreDeepEqual (
  t: ExecutionContext,
  testName: string,
  documentPath: string,
  expected: any,
  message?: string
) {
  const docRef = firestore.doc(`vueSyncTests/${testName}/${documentPath}`)
  const docSnapshot = await docRef.get()
  const docData = docSnapshot.data()
  t.deepEqual(expected, docData, message)
}
