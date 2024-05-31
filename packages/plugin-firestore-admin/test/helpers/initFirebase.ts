import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serviceAccountJson = path.join(__dirname, '../../service-account.json')

const config = {
  apiKey: 'AIzaSyDivMlXIuHqDFsTCCqBDTVL0h29xbltcL8',
  authDomain: 'tests-firestore.firebaseapp.com',
  databaseURL: 'https://tests-firestore.firebaseio.com',
  projectId: 'tests-firestore',
  // storageBucket: 'tests-firestore.appspot.com',
  // messagingSenderId: '743555674736'
}
const firebaseApp = initializeApp({
  ...config,
  credential: cert(serviceAccountJson),
})
const db = getFirestore(firebaseApp)

export { db }
