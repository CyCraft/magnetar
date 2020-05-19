'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isWhat = require('is-what');
var core = require('@vue-sync/core');
var Firebase = require('firebase/app');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function logError(errorMessage) {
    console.error('[@vue-sync/firestore error]\n', errorMessage);
}
function logErrorAndThrow(errorMessage) {
    logError(errorMessage);
    throw new Error(errorMessage);
}
function throwIfInvalidFirestorePath(firestorePath, moduleType) {
    var errorMessage = '';
    // no firestorePath found
    if (!isWhat.isFullString(firestorePath)) {
        errorMessage = "Firestore \"path\" not found.\n    You can enable `useModulePathsForFirestore` in the Firestore plugin options to automatically use the same paths in Firestore as your modules.\n    Otherwise you have to set the firestorePath on your doc/collection like so: `doc('myCollection/myDoc', { configPerStore: { [storePluginName]: { firestorePath: 'myFirestorePath/someDoc' } } })`";
    }
    // sanity check for collections
    else if (moduleType === 'collection') {
        if (core.isDocModule(firestorePath))
            errorMessage = "Your collection id (or \"path\") must be of odd segments. The expected pattern is: collection/doc/collection ... Yours was " + firestorePath;
    }
    // sanity check for docs
    else if (moduleType === 'doc') {
        if (core.isCollectionModule(firestorePath))
            errorMessage = "Your doc id (or \"path\") must be of even segments. The expected pattern is: collection/doc/collection/doc ... Yours was " + firestorePath;
    }
    if (errorMessage)
        logErrorAndThrow(errorMessage);
}

function getFirestoreDocPath(collectionPath, docId, firestoreModuleConfig, firestorePluginOptions) {
    var documentPath;
    // if firestorePath is set on the module level, always return this
    var firestorePath = firestoreModuleConfig.firestorePath;
    if (isWhat.isFullString(firestorePath)) {
        documentPath = core.isCollectionModule(firestorePath)
            ? [firestorePath, docId].join('/')
            : firestorePath;
    }
    else {
        // else, return the modulePath only if this option is enabled in the global firestorePluginOptions
        var useModulePathsForFirestore = firestorePluginOptions.useModulePathsForFirestore;
        var modulePath = [collectionPath, docId].join('/');
        documentPath = useModulePathsForFirestore ? modulePath : firestorePath;
    }
    throwIfInvalidFirestorePath(documentPath, 'doc');
    return documentPath;
}
function getFirestoreCollectionPath(_collectionPath, firestoreModuleConfig, firestorePluginOptions) {
    var collectionPath;
    // if firestorePath is set on the module level, always return this
    var firestorePath = firestoreModuleConfig.firestorePath;
    if (isWhat.isFullString(firestorePath)) {
        collectionPath = firestorePath;
    }
    else {
        // else, return the modulePath only if this option is enabled in the global firestorePluginOptions
        var useModulePathsForFirestore = firestorePluginOptions.useModulePathsForFirestore;
        collectionPath = useModulePathsForFirestore ? _collectionPath : firestorePath;
    }
    throwIfInvalidFirestorePath(collectionPath, 'collection');
    return collectionPath;
}

function insertActionFactory(batchSync, firestorePluginOptions) {
    return function (_a) {
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig;
        return __awaiter(this, void 0, void 0, function () {
            var firestoreInstance, _docId, documentPath;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        firestoreInstance = firestorePluginOptions.firestoreInstance;
                        _docId = docId;
                        if (!_docId) {
                            // we don't have a _docId, so we need to retrieve it from the payload or generate one
                            _docId =
                                isWhat.isFullString(payload.id) || isWhat.isNumber(payload.id)
                                    ? String(payload.id)
                                    : firestoreInstance.collection('random').doc().id;
                        }
                        documentPath = getFirestoreDocPath(collectionPath, _docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
                        ;
                        return [4 /*yield*/, batchSync.set(documentPath, payload)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, _docId];
                }
            });
        });
    };
}

function writeActionFactory(batchSync, firestorePluginOptions, actionName) {
    return function (_a) {
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig;
        return __awaiter(this, void 0, void 0, function () {
            var documentPath;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
                        ;
                        if (!(actionName === 'merge')) return [3 /*break*/, 2];
                        return [4 /*yield*/, batchSync.set(documentPath, payload, { merge: true })];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!(actionName === 'assign')) return [3 /*break*/, 4];
                        return [4 /*yield*/, batchSync.set(documentPath, payload, { mergeFields: Object.keys(payload) })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        if (!(actionName === 'replace')) return [3 /*break*/, 6];
                        return [4 /*yield*/, batchSync.set(documentPath, payload)];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
}

function deletePropActionFactory(batchSync, firestorePluginOptions) {
    return function (_a) {
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig;
        return __awaiter(this, void 0, void 0, function () {
            var documentPath, payloadArray, firestorePayload;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
                        ;
                        payloadArray = isWhat.isArray(payload) ? payload : [payload];
                        firestorePayload = payloadArray.reduce(function (carry, propPath) {
                            var _a;
                            return (__assign(__assign({}, carry), (_a = {}, _a[propPath] = Firebase.firestore.FieldValue["delete"](), _a)));
                        }, {});
                        return [4 /*yield*/, batchSync.update(documentPath, firestorePayload)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
}

function deleteActionFactory(batchSync, firestorePluginOptions) {
    return function (_a) {
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig;
        return __awaiter(this, void 0, void 0, function () {
            var documentPath;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
                        ;
                        return [4 /*yield*/, batchSync["delete"](documentPath)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
}

function getQueryInstance(collectionPath, pluginModuleConfig, firestoreInstance) {
    var e_1, _a, e_2, _b;
    var _c = pluginModuleConfig.where, where = _c === void 0 ? [] : _c, _d = pluginModuleConfig.orderBy, orderBy = _d === void 0 ? [] : _d, limit = pluginModuleConfig.limit;
    var query;
    query = firestoreInstance.collection(collectionPath);
    try {
        for (var where_1 = __values(where), where_1_1 = where_1.next(); !where_1_1.done; where_1_1 = where_1.next()) {
            var whereClause = where_1_1.value;
            query = query.where.apply(query, __spread(whereClause));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (where_1_1 && !where_1_1.done && (_a = where_1["return"])) _a.call(where_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        for (var orderBy_1 = __values(orderBy), orderBy_1_1 = orderBy_1.next(); !orderBy_1_1.done; orderBy_1_1 = orderBy_1.next()) {
            var orderByClause = orderBy_1_1.value;
            query = query.orderBy.apply(query, __spread(orderByClause));
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (orderBy_1_1 && !orderBy_1_1.done && (_b = orderBy_1["return"])) _b.call(orderBy_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    if (isWhat.isNumber(limit)) {
        query = query.limit(limit);
    }
    return query;
}
function docSnapshotToDocMetadata(docSnapshot) {
    var _a;
    var docMetaData = {
        data: ((_a = docSnapshot.data()) !== null && _a !== void 0 ? _a : {}),
        metadata: docSnapshot,
        id: docSnapshot.id,
        exists: docSnapshot.exists,
    };
    return docMetaData;
}

function getActionFactory(firestorePluginOptions) {
    return function (_a) {
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig;
        return __awaiter(this, void 0, void 0, function () {
            var firestoreInstance, snapshots, documentPath, docSnapshot, _collectionPath, queryInstance, querySnapshot, docs;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        firestoreInstance = firestorePluginOptions.firestoreInstance;
                        if (!docId) return [3 /*break*/, 2];
                        documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
                        ;
                        return [4 /*yield*/, firestoreInstance.doc(documentPath).get()];
                    case 1:
                        docSnapshot = _b.sent();
                        snapshots = [docSnapshot];
                        return [3 /*break*/, 4];
                    case 2:
                        if (!!docId) return [3 /*break*/, 4];
                        _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
                        ;
                        queryInstance = getQueryInstance(_collectionPath, pluginModuleConfig, firestoreInstance);
                        return [4 /*yield*/, queryInstance.get()];
                    case 3:
                        querySnapshot = _b.sent();
                        snapshots = querySnapshot.docs;
                        _b.label = 4;
                    case 4:
                        docs = snapshots.map(docSnapshotToDocMetadata);
                        return [2 /*return*/, { docs: docs }];
                }
            });
        });
    };
}

function streamActionFactory(firestorePluginOptions) {
    return function (_a) {
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig, mustExecuteOnRead = _a.mustExecuteOnRead;
        var added = mustExecuteOnRead.added, modified = mustExecuteOnRead.modified, removed = mustExecuteOnRead.removed;
        var firestoreInstance = firestorePluginOptions.firestoreInstance;
        var resolveStream;
        var rejectStream;
        var streaming = new Promise(function (resolve, reject) {
            resolveStream = resolve;
            rejectStream = reject;
        });
        var unsubscribeStream;
        // in case of a doc module
        if (docId) {
            var documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions); // prettier-ignore
            unsubscribeStream = firestoreInstance.doc(documentPath).onSnapshot(function (docSnapshot) {
                var localChange = docSnapshot.metadata.hasPendingWrites;
                // do nothing for local changes
                if (localChange)
                    return;
                // serverChanges only
                var docData = docSnapshot.data();
                var docMetadata = docSnapshotToDocMetadata(docSnapshot);
                added(docData, docMetadata);
            }, rejectStream);
        }
        // in case of a collection module
        else if (!docId) {
            var _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions); // prettier-ignore
            var queryInstance = getQueryInstance(_collectionPath, pluginModuleConfig, firestoreInstance);
            unsubscribeStream = queryInstance.onSnapshot(function (querySnapshot) {
                querySnapshot.docChanges().forEach(function (docChange) {
                    var docSnapshot = docChange.doc;
                    // do nothing for local changes
                    var localChange = docSnapshot.metadata.hasPendingWrites;
                    // serverChanges only
                    if (localChange)
                        return;
                    var docData = docSnapshot.data();
                    var docMetadata = docSnapshotToDocMetadata(docSnapshot);
                    if (docChange.type === 'added') {
                        added(docData, docMetadata);
                    }
                    if (docChange.type === 'modified') {
                        modified(docData, docMetadata);
                    }
                    if (docChange.type === 'removed') {
                        removed(docData, docMetadata);
                    }
                });
            }, rejectStream);
        }
        function stop() {
            resolveStream();
            unsubscribeStream();
        }
        return { stop: stop, streaming: streaming };
    };
}

function revertActionFactory(actions, firestorePluginOptions) {
    return function (_a) {
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig, actionName = _a.actionName, error = _a.error;
        return __awaiter(this, void 0, void 0, function () {
            var isReadAction;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        isReadAction = ['get', 'stream'].includes(actionName);
                        if (isReadAction)
                            return [2 /*return*/];
                        if (!docId) return [3 /*break*/, 2];
                        if (!(actionName === 'insert')) return [3 /*break*/, 2];
                        return [4 /*yield*/, actions["delete"]({ payload: undefined, collectionPath: collectionPath, docId: docId, pluginModuleConfig: pluginModuleConfig })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                    case 2:
                        // reverting other actions are tricky...
                        // insert on collection (no id)
                        if (!docId && actionName === 'insert')
                            actionName = 'insert on collections';
                        console.error("[@vue-sync/firestore] revert not yet implemented for " + actionName + ". See https://github.com/vue-sync/core/issues/2\n\nerror:", error);
                        return [2 /*return*/];
                }
            });
        });
    };
}

/**
 * A countdown which can be restarted and resolves when the provided milliseconds have passed.
 *
 * @param {number} ms The amount of milliseconds to count down.
 * @returns {{done: Promise<void>, restart: () => void}} restart will reset the countdown and start counting down again.
 * @example
 * const countdown = Countdown(1000)
 * // set up what to do when it's finished:
 * countdown.done.then(() => doSomething())
 * // call this every time to restart the countdown:
 * countdown.restart()
 * @author Adam Dorling
 * @contact https://codepen.io/naito
 */
function Countdown(ms) {
    var startTime = Date.now();
    var done = new Promise(function (resolve) {
        var interval = setInterval(function () {
            var now = Date.now();
            var deltaT = now - startTime;
            if (deltaT >= ms) {
                clearInterval(interval);
                resolve();
            }
        }, 10);
    });
    var restart = function () { startTime = Date.now(); }; // prettier-ignore
    return { done: done, restart: restart };
}

// https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes
// A batched write can contain up to 500 operations.
// Eg.
// function pathToRef (firestorePath) {}
// // Get a new write batch
// var batch = db.batch();
// // Set the value of 'NYC'
// var nycRef = db.collection("cities").doc("NYC");
// batch.set(nycRef, {name: "New York City"});
// // Update the population of 'SF'
// var sfRef = db.collection("cities").doc("SF");
// batch.update(sfRef, {"population": 1000000});
// // Delete the city 'LA'
// var laRef = db.collection("cities").doc("LA");
// batch.delete(laRef);
// // Commit the batch
// batch.commit().then(function () {
//     // ...
// });
/**
 * Each write operation in a batch counts towards the 500 limit.
 * Within a write operation, field transforms like serverTimestamp,
 * arrayUnion, and increment each count as an additional operation.
 *
 * @param {PlainObject} payload
 * @returns {number}
 */
function countOperations(payload) {
    var count = 1;
    // todo: when actions like serverTimestamp, arrayUnion and increment are supported, count them here
    return count;
}
/**
 * Creates a BatchSync instance that will sync to firestore and automatically debounce
 *
 * @export
 * @returns {BatchSync}
 */
function batchSyncFactory(firestorePluginOptions) {
    var firestoreInstance = firestorePluginOptions.firestoreInstance, syncDebounceMs = firestorePluginOptions.syncDebounceMs;
    var state = {
        queue: [],
        countdown: null,
    };
    var newSyncStack = function () { return ({
        operationCount: 0,
        batch: firestoreInstance.batch(),
        resolves: [],
        rejects: [],
    }); };
    function prepareSyncStack(operationCount) {
        if (!state.queue.length)
            state.queue.push(newSyncStack());
        var _a = __read(state.queue, 1), syncStack = _a[0];
        syncStack.operationCount += operationCount;
        return syncStack;
    }
    function prepareRef(documentPath) {
        return firestoreInstance.doc(documentPath);
    }
    function preparePayload(_payload) {
        // todo: properly handle any serverTimestamp, arrayUnion and increment in here
        var payload = _payload;
        var operationCount = countOperations();
        return { payload: payload, operationCount: operationCount };
    }
    /**
     * Removes one `syncStack` entry from the `queue` & executes batch.commit() and makes sure to reject or resolve all actions when this promise is resolved
     */
    function executeSync() {
        var syncStack = state.queue.shift();
        syncStack.batch
            .commit()
            .then(function () { return syncStack.resolves.forEach(function (r) { return r(); }); })["catch"](function (error) { return syncStack.rejects.forEach(function (r) { return r(error); }); });
    }
    /**
     * Sets a new countdown if it doesn't exist yet, and makes sure that the countdown will executeSync
     *
     * @returns {CountdownInstance}
     */
    function prepareCountdown() {
        if (!state.countdown) {
            state.countdown = Countdown(syncDebounceMs);
            state.countdown.done.then(function () {
                executeSync();
                state.countdown = null;
            });
        }
        return state.countdown;
    }
    function triggerSync() {
        var countdown = prepareCountdown();
        countdown.restart();
    }
    function set(documentPath, _payload, options) {
        var _a = preparePayload(_payload), payload = _a.payload, operationCount = _a.operationCount;
        var _b = prepareSyncStack(operationCount), batch = _b.batch, resolves = _b.resolves, rejects = _b.rejects;
        var ref = prepareRef(documentPath);
        batch.set(ref, payload, options);
        var promise = new Promise(function (resolve, reject) {
            resolves.push(resolve);
            rejects.push(reject);
        });
        triggerSync();
        return promise;
    }
    function update(documentPath, _payload) {
        var _a = preparePayload(_payload), payload = _a.payload, operationCount = _a.operationCount;
        var _b = prepareSyncStack(operationCount), batch = _b.batch, resolves = _b.resolves, rejects = _b.rejects;
        var ref = prepareRef(documentPath);
        batch.update(ref, payload);
        var promise = new Promise(function (resolve, reject) {
            resolves.push(resolve);
            rejects.push(reject);
        });
        triggerSync();
        return promise;
    }
    function _delete(documentPath) {
        var operationCount = 1;
        var _a = prepareSyncStack(operationCount), batch = _a.batch, resolves = _a.resolves, rejects = _a.rejects;
        var ref = prepareRef(documentPath);
        batch["delete"](ref);
        var promise = new Promise(function (resolve, reject) {
            resolves.push(resolve);
            rejects.push(reject);
        });
        triggerSync();
        return promise;
    }
    return { set: set, update: update, "delete": _delete };
}

function firestorePluginOptionsWithDefaults(firestorePluginOptions) {
    return __assign({ syncDebounceMs: 1000, useModulePathsForFirestore: false }, firestorePluginOptions);
}
// a Vue Sync plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Vue Sync module instance
// each action must have the proper for both collection and doc type modules
var CreatePlugin = function (firestorePluginOptions) {
    var pluginOptions = firestorePluginOptionsWithDefaults(firestorePluginOptions);
    var batchSync = batchSyncFactory(pluginOptions);
    // the plugin must try to implement logic for every `ActionName`
    var get = getActionFactory(pluginOptions);
    var stream = streamActionFactory(pluginOptions);
    var insert = insertActionFactory(batchSync, pluginOptions);
    var _merge = writeActionFactory(batchSync, pluginOptions, 'merge');
    var assign = writeActionFactory(batchSync, pluginOptions, 'assign');
    var replace = writeActionFactory(batchSync, pluginOptions, 'replace');
    var deleteProp = deletePropActionFactory(batchSync, pluginOptions);
    var _delete = deleteActionFactory(batchSync, pluginOptions);
    var actions = {
        get: get,
        stream: stream,
        insert: insert,
        merge: _merge,
        assign: assign,
        replace: replace,
        deleteProp: deleteProp,
        "delete": _delete,
    };
    var revert = revertActionFactory(actions);
    // the plugin function must return a `PluginInstance`
    var instance = {
        revert: revert,
        actions: actions,
    };
    return instance;
};

exports.CreatePlugin = CreatePlugin;
