import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const config = {
  apiKey: 'AIzaSyDivMlXIuHqDFsTCCqBDTVL0h29xbltcL8',
  authDomain: 'tests-firestore.firebaseapp.com',
  databaseURL: 'https://tests-firestore.firebaseio.com',
  projectId: 'tests-firestore',
  // storageBucket: 'tests-firestore.appspot.com',
  // messagingSenderId: '743555674736'
}
const firebaseApp = initializeApp({
  credential: cert(require('../../service-account.json')),
})
const db = getFirestore(firebaseApp)

export { db }
