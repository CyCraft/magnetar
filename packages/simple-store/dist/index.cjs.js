'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var copyAnything = require('copy-anything');
var core = require('@vue-sync/core');
var mergeAnything = require('merge-anything');
var isWhat = require('is-what');
var pathToProp = _interopDefault(require('path-to-prop'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

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

function writeActionFactory(moduleData, simpleStoreConfig, makeDataSnapshot, actionName) {
    return function (payload, modulePath, pluginModuleConfig) {
        // this is custom logic to be implemented by the plugin author
        var isCollection = core.isCollectionModule(modulePath);
        // write actions cannot be executed on collections
        if (isCollection)
            throw new Error('An non-existent action was triggered on a collection');
        var _a = __read(core.getCollectionPathDocIdEntry(modulePath), 2), collectionPath = _a[0], docId = _a[1];
        var collectionMap = moduleData[collectionPath];
        // always start from an empty document on 'replace' or when the doc is non existent
        if (actionName === 'replace' || !collectionMap.get(docId))
            collectionMap.set(docId, {});
        var docDataToMutate = collectionMap.get(docId);
        if (actionName === 'merge') {
            Object.entries(payload).forEach(function (_a) {
                var _b = __read(_a, 2), key = _b[0], value = _b[1];
                docDataToMutate[key] = mergeAnything.merge(docDataToMutate[key], value);
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

function insertActionFactory(moduleData, simpleStoreConfig, makeDataSnapshot) {
    return function (payload, modulePath, pluginModuleConfig) {
        // this is custom logic to be implemented by the plugin author
        var isCollection = core.isCollectionModule(modulePath);
        if (isCollection) {
            var id = isWhat.isFullString(payload.id) ? payload.id : simpleStoreConfig.generateRandomId();
            var collectionPath_1 = modulePath;
            moduleData[collectionPath_1].set(id, payload);
            return id;
        }
        // else it's a doc
        var _a = __read(core.getCollectionPathDocIdEntry(modulePath), 2), collectionPath = _a[0], docId = _a[1];
        var collectionMap = moduleData[collectionPath];
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

function deletePropActionFactory(moduleData, simpleStoreConfig, makeDataSnapshot) {
    return function (payload, modulePath, pluginModuleConfig) {
        // this is custom logic to be implemented by the plugin author
        var e_1, _a;
        var isCollection = core.isCollectionModule(modulePath);
        // `deleteProp` action cannot be executed on collections
        if (isCollection)
            throw new Error('An non-existent action was triggered on a collection');
        var _b = __read(core.getCollectionPathDocIdEntry(modulePath), 2), collectionPath = _b[0], docId = _b[1];
        var collectionMap = moduleData[collectionPath];
        var docData = collectionMap.get(docId);
        var payloadArray = isWhat.isArray(payload) ? payload : [payload];
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
                if (payloadArray_1_1 && !payloadArray_1_1.done && (_a = payloadArray_1["return"])) _a.call(payloadArray_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
}

function deleteActionFactory(moduleData, simpleStoreConfig, makeDataSnapshot) {
    return function (payload, modulePath, pluginModuleConfig) {
        // this is custom logic to be implemented by the plugin author
        var isCollection = core.isCollectionModule(modulePath);
        // delete cannot be executed on collections
        if (isCollection)
            throw new Error('An non-existent action was triggered on a collection');
        var _a = __read(core.getCollectionPathDocIdEntry(modulePath), 2), collectionPath = _a[0], docId = _a[1];
        moduleData[collectionPath]["delete"](docId);
    };
}

function getActionFactory(moduleData, simpleStoreConfig, makeDataSnapshot) {
    var _this = this;
    return function (payload, modulePath, pluginModuleConfig) {
        return __awaiter(_this, void 0, void 0, function () {
            var doOnGetAction;
            return __generator(this, function (_a) {
                // this is custom logic to be implemented by the plugin author
                makeDataSnapshot();
                doOnGetAction = function (payload, meta) {
                    insertActionFactory(moduleData, simpleStoreConfig)(payload, modulePath, pluginModuleConfig);
                    // return writeActionFactoryThatReturnsPayload(moduleData, 'insert', simpleStoreConfig)(
                    //   payload,
                    //   modulePath,
                    //   pluginModuleConfig
                    // )
                };
                // in case of a local store that doesn't fetch from anywhere, not even from cach, we could return early here
                return [2 /*return*/, doOnGetAction];
            });
        });
    };
}

function streamActionFactory(moduleData, simpleStoreConfig, makeDataSnapshot) {
    return function (payload, modulePath, pluginModuleConfig, mustExecuteOnRead) {
        // this is custom logic to be implemented by the plugin author
        // this mocks how the result from the next store (the remote store) should update this local store per action type
        // hover over the prop names below to see more info on when they are triggered:
        var doOnStream = {
            added: function (payload, meta) {
                insertActionFactory(moduleData, simpleStoreConfig)(payload, modulePath, pluginModuleConfig); // prettier-ignore
            },
            modified: function (payload, meta) {
                insertActionFactory(moduleData, simpleStoreConfig)(payload, modulePath, pluginModuleConfig); // prettier-ignore
            },
            removed: function (payload, meta) {
                var isCollection = core.isCollectionModule(modulePath);
                var pathToDelete = !isCollection
                    ? modulePath
                    : isWhat.isString(payload)
                        ? modulePath + "/" + payload
                        : modulePath + "/" + payload.id;
                deleteActionFactory(moduleData)(undefined, pathToDelete, pluginModuleConfig);
            },
        };
        return doOnStream;
    };
}

function revertActionFactory(moduleData, simpleStoreConfig, restoreDataSnapshot) {
    // this is a `PluginRevertAction`:
    return function revert(payload, modulePath, pluginModuleConfig, actionName) {
        // this is custom logic to be implemented by the plugin author
        if (!payload)
            return;
        // strings are only possible during deletions
        // haven't implemented reverting deletions yet
        if (isWhat.isString(payload) || (isWhat.isArray(payload) && isWhat.isString(payload[0])))
            return;
        // this mocks data reverted during a read
        if (actionName === 'get' || actionName === 'stream') {
            restoreDataSnapshot();
            return;
        }
        // this mocks data reverted during a write
        var _a = __read(core.getCollectionPathDocIdEntry(modulePath), 2), collectionPath = _a[0], docId = _a[1];
        var collectionMap = moduleData[collectionPath];
        if (!docId) {
            // collection
            throw new Error("revert not yet implemented for insert on collection - payload: " + JSON.stringify(payload));
        }
        if (actionName === 'insert') {
            collectionMap["delete"](docId);
            return;
        }
        throw new Error('revert not yet implemented for this action');
    };
}

// a Vue Sync plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Vue Sync module instance
// each action must have the proper for both collection and doc type modules
var CreatePlugin = function (simpleStoreConfig) {
    // this is the local state of the plugin, each plugin that acts as a "local Store Plugin" should have something similar
    // do not define the store plugin data on the top level! Be sure to define it inside the scope of the plugin function!!
    var data = {};
    // this mocks some sort of data snapshot restore functionality of the plugin
    var dataSnapshots = [];
    var makeDataSnapshot = function () { dataSnapshots.push(copyAnything.copy(data)); }; // prettier-ignore
    var restoreDataSnapshot = function () {
        var last = dataSnapshots.pop();
        Object.keys(data.pokedex).forEach(function (key) { return delete data.pokedex[key]; });
        Object.keys(last.pokedex).forEach(function (key) { return (data.pokedex[key] = last.pokedex[key]); });
    };
    /**
     * This must be provided by Store Plugins that have "local" data. It is triggered ONCE when the module (doc or collection) is instantiated. In any case, an empty Map for the collectionPath (to be derived from the modulePath) must be set up.
     */
    var modulesAlreadySetup = new Set();
    var setupModule = function (modulePath, moduleConfig) {
        var e_1, _a;
        if (moduleConfig === void 0) { moduleConfig = {}; }
        var _b;
        if (modulesAlreadySetup.has(modulePath))
            return;
        var _c = __read(core.getCollectionPathDocIdEntry(modulePath), 2), collectionPath = _c[0], docId = _c[1];
        // always set up a new Map for the collection, but only when it's undefined!
        // the reason for this is that the module can be instantiated multiple times
        data[collectionPath] = (_b = data[collectionPath]) !== null && _b !== void 0 ? _b : new Map();
        // then do anything specific for your plugin, like setting initial data
        var initialData = moduleConfig.initialData;
        if (!initialData)
            return;
        if (!docId) {
            try {
                for (var initialData_1 = __values(initialData), initialData_1_1 = initialData_1.next(); !initialData_1_1.done; initialData_1_1 = initialData_1.next()) {
                    var _d = __read(initialData_1_1.value, 2), _docId = _d[0], _docData = _d[1];
                    data[collectionPath].set(_docId, _docData);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (initialData_1_1 && !initialData_1_1.done && (_a = initialData_1["return"])) _a.call(initialData_1);
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
     * This must be provided by Store Plugins that have "local" data. It is triggered EVERY TIME the module's data is accessed. The `modulePath` will be either that of a "collection" or a "doc". When it's a collection, it must return a Map with the ID as key and the doc data as value `Map<string, DocDataType>`. When it's a "doc" it must return the doc data directly `DocDataType`.
     */
    var getModuleData = function (modulePath, moduleConfig) {
        var _a = __read(core.getCollectionPathDocIdEntry(modulePath), 2), collectionPath = _a[0], docId = _a[1];
        var collectionDB = data[collectionPath];
        // if it's a collection, just return the collectionDB, which MUST be a map with id as keys and the docs as value
        if (!docId)
            return collectionDB;
        // if it's a doc, return the specific doc
        return collectionDB.get(docId);
    };
    // the plugin must try to implement logic for every `ActionName`
    var get = getActionFactory(data, simpleStoreConfig, makeDataSnapshot);
    var stream = streamActionFactory(data, simpleStoreConfig);
    var insert = insertActionFactory(data, simpleStoreConfig);
    var _merge = writeActionFactory(data, simpleStoreConfig, makeDataSnapshot, 'merge');
    var assign = writeActionFactory(data, simpleStoreConfig, makeDataSnapshot, 'assign');
    var replace = writeActionFactory(data, simpleStoreConfig, makeDataSnapshot, 'replace');
    var deleteProp = deletePropActionFactory(data);
    var _delete = deleteActionFactory(data);
    var revert = revertActionFactory(data, simpleStoreConfig, restoreDataSnapshot);
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

exports.CreatePlugin = CreatePlugin;
