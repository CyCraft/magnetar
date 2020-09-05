import { firebase } from './firestore'

// todo: if only I could use this, I could delete the `deletePaths` mechanism.
// corrently this CF gives an "internal error"

/**
 * Call the 'recursiveDelete' callable function with a path to initiate
 * a server-side delete.
 */
export async function deleteAtPath (path = '') {
  const deleteFn = firebase.functions().httpsCallable('recursiveDelete')
  try {
    const result = await deleteFn({ path: path })
    console.log('Delete success: ' + JSON.stringify(result))
  } catch (error) {
    console.error('Delete failed, see console,')
    console.warn(error)
  }
}
