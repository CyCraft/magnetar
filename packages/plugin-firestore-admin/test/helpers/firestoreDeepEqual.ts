import { ExecutionContext } from 'ava'
import { db } from './initFirebase'

export async function firestoreDeepEqual(
  t: ExecutionContext,
  testName: string,
  documentPath: string,
  expected: any,
  message?: string
) {
  const docRef = db.doc(`magnetarTests/${testName}/${documentPath}`)
  const docSnapshot = await docRef.get()
  const docData = docSnapshot.data()
  t.deepEqual(expected, docData, message)
}
