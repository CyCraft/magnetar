import { firestore } from 'firebase';
import { FirestoreModuleConfig } from 'src/CreatePlugin';
import { DocMetadata } from '@vue-sync/core';
declare type Firestore = firestore.Firestore;
declare type Query = firestore.Query;
declare type DocumentSnapshot = firestore.DocumentSnapshot;
declare type QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;
export declare function getQueryInstance(collectionPath: string, pluginModuleConfig: FirestoreModuleConfig, firestoreInstance: Firestore): Query;
export declare function docSnapshotToDocMetadata(docSnapshot: DocumentSnapshot | QueryDocumentSnapshot): DocMetadata;
export {};