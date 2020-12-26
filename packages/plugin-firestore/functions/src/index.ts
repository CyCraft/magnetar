/* eslint-disable tree-shaking/no-side-effects-in-initialization */
import admin from 'firebase-admin'

admin.initializeApp()

export { recursiveDelete } from './recursiveDelete'
