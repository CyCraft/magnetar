import { initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore'

const config = {
  apiKey: 'AIzaSyDivMlXIuHqDFsTCCqBDTVL0h29xbltcL8',
  authDomain: 'tests-firestore.firebaseapp.com',
  databaseURL: 'https://tests-firestore.firebaseio.com',
  projectId: 'tests-firestore',
  // storageBucket: 'tests-firestore.appspot.com',
  // messagingSenderId: '743555674736'
}
const firebaseApp = initializeApp(config)
const db = initializeFirestore(firebaseApp, { experimentalAutoDetectLongPolling: true })
connectFirestoreEmulator(db, 'localhost', 8198)

export { db }
