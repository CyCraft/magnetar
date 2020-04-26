import { isFullString } from 'is-what'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'

export function getFirestorePath (
  modulePath: string,
  firestoreModuleConfig: FirestoreModuleConfig,
  firestorePluginOptions: FirestorePluginOptions
): string {
  const { firestorePath } = firestoreModuleConfig
  console.log(`firestorePath → `, firestorePath)
  // if firestorePath is set on the module level, always return this
  if (isFullString(firestorePath)) return firestorePath
  // return the modulePath only if this option is enabled in the global firestorePluginOptions
  const { useModulePathsForFirestore } = firestorePluginOptions
  console.log(`useModulePathsForFirestore → `, useModulePathsForFirestore)
  console.log(
    `useModulePathsForFirestore ? modulePath : firestorePath → `,
    useModulePathsForFirestore ? modulePath : firestorePath
  )
  return useModulePathsForFirestore ? modulePath : firestorePath
}
