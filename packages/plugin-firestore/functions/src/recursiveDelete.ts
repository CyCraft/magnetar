/* eslint-disable tree-shaking/no-side-effects-in-initialization */
import * as functions from 'firebase-functions'
// @ts-ignore
import * as firebaseTools from 'firebase-tools'

/**
 * Initiate a recursive delete of documents at a given path.
 *
 * The calling user must be authenticated and have the custom "admin" attribute
 * set to true on the auth token.
 *
 * This delete is NOT an atomic operation and it's possible
 * that it may fail after only deleting some documents.
 *
 * @param {string} data.path the document or collection path to delete.
 */
export const recursiveDelete = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB',
  })
  .https.onCall((data, context) => {
    // // Only allow admin users to execute this function.
    // if (!(context.auth && context.auth.token && context.auth.token.admin)) {
    //   throw new functions.https.HttpsError(
    //     'permission-denied',
    //     'Must be an administrative user to initiate delete.'
    //   )
    // }

    const path = data.path
    // console.log(`User ${context.auth.uid} has requested to delete path ${path}`)

    // Run a recursive delete on the given document or collection path.
    // The 'token' must be set in the functions config, and can be generated
    // at the command line by running 'firebase login:ci'.
    return firebaseTools.firestore
      .delete(path, {
        project: 'tests-firestore',
        recursive: true,
        yes: true,
        token: functions.config().fb.token,
      })
      .then(() => {
        return {
          path: path,
        }
      })
  })
