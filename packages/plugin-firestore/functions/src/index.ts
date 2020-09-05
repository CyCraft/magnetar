/* eslint-disable tree-shaking/no-side-effects-in-initialization */
import * as admin from 'firebase-admin'

admin.initializeApp()

export { recursiveDelete } from './recursiveDelete'
