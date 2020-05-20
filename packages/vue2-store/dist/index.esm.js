import { copy } from 'copy-anything';
import { pick } from 'filter-anything';
import { isFullString, isNumber, isArray, isString } from 'is-what';
import { merge } from 'merge-anything';
import pathToProp from 'path-to-prop';
import sort from 'fast-sort';

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

function writeActionFactory(data, reactiveStoreOptions, actionName, makeBackup) {
    return function (_a) {
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig;
        // write actions cannot be executed on collections
        if (!docId)
            throw new Error('An non-existent action was triggered on a collection');
        var collectionMap = data[collectionPath];
        if (makeBackup)
            makeBackup(collectionPath, docId);
        // always start from an empty document on 'replace' or when the doc is non existent
        if (actionName === 'replace' || !collectionMap.get(docId))
            collectionMap.set(docId, {});
        var docDataToMutate = collectionMap.get(docId);
        if (actionName === 'merge') {
            Object.entries(payload).forEach(function (_a) {
                var _b = __read(_a, 2), key = _b[0], value = _b[1];
                docDataToMutate[key] = merge(docDataToMutate[key], value);
            });
        }
        if (actionName === 'assign' || actionName === 'replace') {
            Object.entries(payload).forEach(function (_a) {
                var _b = __read(_a, 2), key = _b[0], value = _b[1];
                docDataToMutate[key] = value;
            });
        }
    };
}

function insertActionFactory(data, reactiveStoreOptions, makeBackup) {
    return function (_a) {
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig;
        if (!docId) {
            var newDocId = isFullString(payload.id) || isNumber(payload.id)
                ? String(payload.id)
                : reactiveStoreOptions.generateRandomId();
            if (makeBackup)
                makeBackup(collectionPath, newDocId);
            data[collectionPath].set(newDocId, payload);
            return newDocId;
        }
        // else it's a doc
        var collectionMap = data[collectionPath];
        if (makeBackup)
            makeBackup(collectionPath, docId);
        // reset the doc to be able to overwrite
        collectionMap.set(docId, {});
        var docDataToMutate = collectionMap.get(docId);
        Object.entries(payload).forEach(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            docDataToMutate[key] = value;
        });
        return docId;
    };
}

function deletePropActionFactory(data, reactiveStoreOptions, makeBackup) {
    return function (_a) {
        var e_1, _b;
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig;
        // `deleteProp` action cannot be executed on collections
        if (!docId)
            throw new Error('An non-existent action was triggered on a collection');
        var collectionMap = data[collectionPath];
        var docData = collectionMap.get(docId);
        if (makeBackup)
            makeBackup(collectionPath, docId);
        var payloadArray = isArray(payload) ? payload : [payload];
        try {
            for (var payloadArray_1 = __values(payloadArray), payloadArray_1_1 = payloadArray_1.next(); !payloadArray_1_1.done; payloadArray_1_1 = payloadArray_1.next()) {
                var propToDelete = payloadArray_1_1.value;
                var isNestedPropPath = /[./]/.test(propToDelete);
                if (isNestedPropPath) {
                    var parts = propToDelete.split(/[./]/);
                    var lastPart = parts.pop();
                    var parentRef = pathToProp(docData, parts.join('.'));
                    delete parentRef[lastPart];
                }
                else {
                    delete docData[propToDelete];
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (payloadArray_1_1 && !payloadArray_1_1.done && (_b = payloadArray_1["return"])) _b.call(payloadArray_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
}

function deleteActionFactory(data, reactiveStoreOptions, makeBackup) {
    return function (_a) {
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig;
        // delete cannot be executed on collections
        if (!docId)
            throw new Error('An non-existent action was triggered on a collection');
        if (makeBackup)
            makeBackup(collectionPath, docId);
        data[collectionPath]["delete"](docId);
    };
}

function getActionFactory(data, reactiveStoreOptions) {
    return function (_a) {
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig;
        var doOnGetAction = function (payload, meta) {
            insertActionFactory(data, reactiveStoreOptions)({
                payload: payload,
                collectionPath: collectionPath,
                docId: docId,
                pluginModuleConfig: pluginModuleConfig,
            });
        };
        return doOnGetAction;
    };
}

function streamActionFactory(data, reactiveStoreOptions) {
    return function (_a) {
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig, mustExecuteOnRead = _a.mustExecuteOnRead;
        // hover over the prop names below to see more info on when they are triggered:
        var doOnStream = {
            added: function (payload, meta) {
                insertActionFactory(data, reactiveStoreOptions)({
                    payload: payload,
                    collectionPath: collectionPath,
                    docId: docId,
                    pluginModuleConfig: pluginModuleConfig,
                });
            },
            modified: function (payload, meta) {
                insertActionFactory(data, reactiveStoreOptions)({
                    payload: payload,
                    collectionPath: collectionPath,
                    docId: docId,
                    pluginModuleConfig: pluginModuleConfig,
                });
            },
            removed: function (payload, meta) {
                var collectionPathDocIdToDelete = docId
                    ? [collectionPath, docId]
                    : isString(payload)
                        ? [collectionPath, payload]
                        : [collectionPath, meta.id];
                var _a = __read(collectionPathDocIdToDelete, 2), _cPath = _a[0], _dId = _a[1];
                deleteActionFactory(data)({
                    payload: undefined,
                    collectionPath: _cPath,
                    docId: _dId,
                    pluginModuleConfig: pluginModuleConfig,
                });
            },
        };
        return doOnStream;
    };
}

function revertActionFactory(data, reactiveStoreOptions, restoreBackup) {
    return function (_a) {
        var payload = _a.payload, collectionPath = _a.collectionPath, docId = _a.docId, pluginModuleConfig = _a.pluginModuleConfig, actionName = _a.actionName, error = _a.error;
        // revert all write actions when called on a doc
        if (docId &&
            ['insert', 'merge', 'assign', 'replace', 'delete', 'deleteProp'].includes(actionName)) {
            restoreBackup(collectionPath, docId);
            return;
        }
        // insert on collection (no id)
        if (!docId && actionName === 'insert')
            actionName = 'insert on collections';
        // haven't implemented reverting 'get', 'stream' actions yet
        console.error("[@vue-sync/reactive-store] revert not yet implemented for " + actionName);
    };
}

/**
 * Filters a Collection module's data map `Map<string, DocData>` based on provided clauses.
 *
 * @param {Map<string, PlainObject>} collectionDB
 * @param {Clauses} clauses
 * @returns {Map<string, PlainObject>}
 */
function filterDataPerClauses(collectionDB, clauses) {
    var _a = clauses.where, where = _a === void 0 ? [] : _a, _b = clauses.orderBy, orderBy = _b === void 0 ? [] : _b, limit = clauses.limit;
    // return the same collectionDB to be sure to keep reactivity
    if (!where.length && !orderBy.length && !isNumber(limit))
        return collectionDB;
    // all other cases we need to create a new Map() with the results
    var entries = [];
    collectionDB.forEach(function (docData, docId) {
        var passesWhereFilters = where.every(function (whereQuery) {
            var _a = __read(whereQuery, 3), fieldPath = _a[0], operator = _a[1], expectedValue = _a[2];
            var valueAtFieldPath = pathToProp(docData, fieldPath);
            var passes = false;
            switch (operator) {
                case '==':
                    passes = valueAtFieldPath == expectedValue;
                    break;
                case '<':
                    passes = valueAtFieldPath < expectedValue;
                    break;
                case '<=':
                    passes = valueAtFieldPath <= expectedValue;
                    break;
                case '>':
                    passes = valueAtFieldPath > expectedValue;
                    break;
                case '>=':
                    passes = valueAtFieldPath >= expectedValue;
                    break;
                case 'in':
                    passes = isArray(expectedValue) && expectedValue.includes(valueAtFieldPath);
                    break;
                case 'array-contains':
                    passes = isArray(valueAtFieldPath) && valueAtFieldPath.includes(expectedValue);
                    break;
                case 'array-contains-any':
                    passes =
                        isArray(valueAtFieldPath) &&
                            valueAtFieldPath.some(function (v) { return isArray(expectedValue) && expectedValue.includes(v); });
                    break;
                default:
                    throw new Error('invalid operator');
            }
            return passes;
        });
        if (!passesWhereFilters)
            return;
        entries.push([docId, docData]);
    });
    // orderBy
    var by = orderBy.reduce(function (carry, _a) {
        var _b;
        var _c = __read(_a, 2), path = _c[0], _d = _c[1], direction = _d === void 0 ? 'asc' : _d;
        var sorter = (_b = {},
            _b[direction] = function (entry) { return pathToProp(entry[1], path); },
            _b);
        carry.push(sorter);
        return carry;
    }, []);
    var entriesOrdered = orderBy.length ? sort(entries).by(by) : entries;
    // limit
    var entriesLimited = isNumber(limit) ? entriesOrdered.slice(0, limit) : entriesOrdered;
    // turn back into MAP
    var filteredDataMap = new Map(entriesLimited);
    return filteredDataMap;
}

// a Vue Sync plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Vue Sync module instance
// each action must have the proper for both collection and doc type modules
var CreatePlugin = function (reactiveStoreOptions) {
    // this is the local state of the plugin, each plugin that acts as a "local Store Plugin" should have something similar
    // do not define the store plugin data on the top level! Be sure to define it inside the scope of the plugin function!!
    var data = {};
    var dataBackups = {};
    var makeBackup = function (collectionPath, docId) {
        // set the backup map for the collection
        if (!(collectionPath in dataBackups))
            dataBackups[collectionPath] = new Map();
        var backupCollectionMap = dataBackups[collectionPath];
        // set the backup array for the doc
        if (!backupCollectionMap.has(docId))
            backupCollectionMap.set(docId, []);
        // make a backup of whatever is found in the data
        var docBackup = copy(data[collectionPath].get(docId));
        backupCollectionMap.get(docId).push(docBackup);
    };
    var restoreBackup = function (collectionPath, docId) {
        // set the backup map for the collection
        if (!(collectionPath in dataBackups))
            return;
        var backupCollectionMap = dataBackups[collectionPath];
        // set the backup array for the doc
        if (!backupCollectionMap.has(docId))
            return;
        var docBackupArray = backupCollectionMap.get(docId);
        if (!docBackupArray.length)
            return;
        // restore the backup of whatever is found and replace with the data
        var docBackup = docBackupArray.pop();
        data[collectionPath].set(docId, docBackup);
    };
    /**
     * This must be provided by Store Plugins that have "local" data. It is triggered ONCE when the module (doc or collection) is instantiated. In any case, an empty Map for the collectionPath (to be derived from the modulePath) must be set up.
     */
    var modulesAlreadySetup = new Set();
    var setupModule = function (_a) {
        var e_1, _b;
        var _c;
        var collectionPath = _a.collectionPath, docId = _a.docId, _d = _a.pluginModuleConfig, pluginModuleConfig = _d === void 0 ? {} : _d;
        var modulePath = [collectionPath, docId].filter(Boolean).join('/');
        if (modulesAlreadySetup.has(modulePath))
            return;
        // always set up a new Map for the collection, but only when it's undefined!
        // the reason for this is that the module can be instantiated multiple times
        data[collectionPath] = (_c = data[collectionPath]) !== null && _c !== void 0 ? _c : new Map();
        // then do anything specific for your plugin, like setting initial data
        var initialData = pluginModuleConfig.initialData;
        if (!initialData)
            return;
        if (!docId && isArray(initialData)) {
            try {
                for (var initialData_1 = __values(initialData), initialData_1_1 = initialData_1.next(); !initialData_1_1.done; initialData_1_1 = initialData_1.next()) {
                    var _e = __read(initialData_1_1.value, 2), _docId = _e[0], _docData = _e[1];
                    data[collectionPath].set(_docId, _docData);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (initialData_1_1 && !initialData_1_1.done && (_b = initialData_1["return"])) _b.call(initialData_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        else {
            data[collectionPath].set(docId, initialData);
        }
        modulesAlreadySetup.add(modulePath);
    };
    /**
     * Queried local data stored in weakmaps "per query" for the least CPU cycles and preventing memory leaks
     */
    var queriedData = new WeakMap();
    /**
     * This must be provided by Store Plugins that have "local" data. It is triggered EVERY TIME the module's data is accessed. The `modulePath` will be either that of a "collection" or a "doc". When it's a collection, it must return a Map with the ID as key and the doc data as value `Map<string, DocDataType>`. When it's a "doc" it must return the doc data directly `DocDataType`.
     */
    var getModuleData = function (_a) {
        var collectionPath = _a.collectionPath, docId = _a.docId, _b = _a.pluginModuleConfig, pluginModuleConfig = _b === void 0 ? {} : _b;
        var collectionDB = data[collectionPath];
        // if it's a doc, return the specific doc
        if (docId)
            return collectionDB.get(docId);
        // if it's a collection, we must return the collectionDB but with applied query clauses
        // but remember, the return type MUST be a map with id as keys and the docs as value
        var clauses = pick(pluginModuleConfig, ['where', 'orderBy', 'limit']);
        // return from cache
        if (queriedData.has(clauses))
            return queriedData.get(clauses);
        // otherwise create a new filter and return that
        var filteredMap = filterDataPerClauses(collectionDB, clauses);
        queriedData.set(clauses, filteredMap);
        return filteredMap;
    };
    // the plugin must try to implement logic for every `ActionName`
    var get = getActionFactory(data, reactiveStoreOptions);
    var stream = streamActionFactory(data, reactiveStoreOptions);
    var insert = insertActionFactory(data, reactiveStoreOptions, makeBackup);
    var _merge = writeActionFactory(data, reactiveStoreOptions, 'merge', makeBackup);
    var assign = writeActionFactory(data, reactiveStoreOptions, 'assign', makeBackup);
    var replace = writeActionFactory(data, reactiveStoreOptions, 'replace', makeBackup);
    var deleteProp = deletePropActionFactory(data, reactiveStoreOptions, makeBackup);
    var _delete = deleteActionFactory(data, reactiveStoreOptions, makeBackup);
    var revert = revertActionFactory(data, reactiveStoreOptions, restoreBackup);
    // the plugin function must return a `PluginInstance`
    var instance = {
        revert: revert,
        actions: {
            get: get,
            stream: stream,
            insert: insert,
            merge: _merge,
            assign: assign,
            replace: replace,
            deleteProp: deleteProp,
            "delete": _delete,
        },
        setupModule: setupModule,
        getModuleData: getModuleData,
    };
    return instance;
};

export { CreatePlugin };
