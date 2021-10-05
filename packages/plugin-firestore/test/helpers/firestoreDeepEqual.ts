import { doc, getDoc } from '@firebase/firestore'
import { ExecutionContext } from 'ava'
import { db } from './initFirebase'

export async function firestoreDeepEqual(
  t: ExecutionContext,
  testName: string,
  documentPath: string,
  expected: any,
  message?: string
) {
  const docRef = doc(db, `magnetarTests/${testName}/${documentPath}`)
  const docSnapshot = await getDoc(docRef)
  const docData = docSnapshot.data()
  t.deepEqual(expected, docData, message)
}
