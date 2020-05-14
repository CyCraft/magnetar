import { mergeAndConcat, merge } from 'merge-anything';
import { isPlainObject, isFunction, isArray, isFullString, isAnyObject } from 'is-what';

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

var actionNameTypeMap = {
    get: 'read',
    stream: 'read',
    insert: 'write',
    merge: 'write',
    assign: 'write',
    replace: 'write',
    deleteProp: 'write',
    "delete": 'delete',
};

/**
 * handleAction is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success (4) optional: onNextStoresSuccess.
 * in any event/hook it's possible for the dev to modify the result & also abort the execution chain, which prevents calling handleAction on the next store as well
 */
function handleAction(args) {
    return __awaiter(this, void 0, void 0, function () {
        var collectionPath, docId, pluginModuleConfig, pluginAction, payload, on, onError, actionName, stopExecutionAfterAction, storeName, abortExecution, abort, _a, _b, fn, e_1_1, result, error_1, _c, _d, fn, e_2_1, _e, _f, fn, e_3_1;
        var e_1, _g, e_2, _h, e_3, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    collectionPath = args.collectionPath, docId = args.docId, pluginModuleConfig = args.pluginModuleConfig, pluginAction = args.pluginAction, payload = args.payload, on = args.eventNameFnsMap, onError = args.onError, actionName = args.actionName, stopExecutionAfterAction = args.stopExecutionAfterAction, storeName = args.storeName;
                    abortExecution = false;
                    abort = function () {
                        abortExecution = true;
                    };
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 6, 7, 8]);
                    _a = __values(on.before), _b = _a.next();
                    _k.label = 2;
                case 2:
                    if (!!_b.done) return [3 /*break*/, 5];
                    fn = _b.value;
                    return [4 /*yield*/, fn({ payload: payload, actionName: actionName, storeName: storeName, abort: abort })];
                case 3:
                    _k.sent();
                    _k.label = 4;
                case 4:
                    _b = _a.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_1_1 = _k.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (_b && !_b.done && (_g = _a["return"])) _g.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 8:
                    // abort?
                    if (abortExecution) {
                        stopExecutionAfterAction();
                        return [2 /*return*/];
                    }
                    _k.label = 9;
                case 9:
                    _k.trys.push([9, 11, , 20]);
                    return [4 /*yield*/, pluginAction(payload, [collectionPath, docId], pluginModuleConfig)];
                case 10:
                    // triggering the action provided by the plugin
                    result = _k.sent();
                    return [3 /*break*/, 20];
                case 11:
                    error_1 = _k.sent();
                    _k.label = 12;
                case 12:
                    _k.trys.push([12, 17, 18, 19]);
                    _c = __values(on.error), _d = _c.next();
                    _k.label = 13;
                case 13:
                    if (!!_d.done) return [3 /*break*/, 16];
                    fn = _d.value;
                    return [4 /*yield*/, fn({ payload: payload, actionName: actionName, storeName: storeName, abort: abort, error: error_1 })];
                case 14:
                    _k.sent();
                    _k.label = 15;
                case 15:
                    _d = _c.next();
                    return [3 /*break*/, 13];
                case 16: return [3 /*break*/, 19];
                case 17:
                    e_2_1 = _k.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 19];
                case 18:
                    try {
                        if (_d && !_d.done && (_h = _c["return"])) _h.call(_c);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 19:
                    // abort?
                    if (abortExecution || onError === 'stop') {
                        stopExecutionAfterAction();
                        throw error_1;
                    }
                    if (onError === 'revert') {
                        stopExecutionAfterAction('revert');
                        // we need to revert first, then throw the error later
                        return [2 /*return*/, error_1];
                    }
                    return [3 /*break*/, 20];
                case 20:
                    _k.trys.push([20, 25, 26, 27]);
                    _e = __values(on.success), _f = _e.next();
                    _k.label = 21;
                case 21:
                    if (!!_f.done) return [3 /*break*/, 24];
                    fn = _f.value;
                    return [4 /*yield*/, fn({ payload: payload, result: result, actionName: actionName, storeName: storeName, abort: abort })];
                case 22:
                    _k.sent();
                    _k.label = 23;
                case 23:
                    _f = _e.next();
                    return [3 /*break*/, 21];
                case 24: return [3 /*break*/, 27];
                case 25:
                    e_3_1 = _k.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 27];
                case 26:
                    try {
                        if (_f && !_f.done && (_j = _e["return"])) _j.call(_e);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 27:
                    // abort?
                    if (abortExecution) {
                        stopExecutionAfterAction();
                        return [2 /*return*/, result];
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}

function getEventNameFnsMap() {
    var onMaps = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        onMaps[_i] = arguments[_i];
    }
    var _onMaps = onMaps.filter(Boolean);
    var result = {
        before: _onMaps.flatMap(function (on) { var _a; return (_a = on.before) !== null && _a !== void 0 ? _a : []; }),
        success: _onMaps.flatMap(function (on) { var _a; return (_a = on.success) !== null && _a !== void 0 ? _a : []; }),
        error: _onMaps.flatMap(function (on) { var _a; return (_a = on.error) !== null && _a !== void 0 ? _a : []; }),
        revert: _onMaps.flatMap(function (on) { var _a; return (_a = on.revert) !== null && _a !== void 0 ? _a : []; }),
    };
    return result;
}

/**
 * DoOnStream type guard
 */
function isDoOnStream(payload) {
    var isNotDoOnStream = !isPlainObject(payload) ||
        payload.streaming ||
        payload.stop ||
        !(payload.added || payload.modified || payload.removed);
    return !isNotDoOnStream;
}
/**
 * DoOnGet type guard
 */
function isDoOnGet(payload) {
    return isFunction(payload);
}
/**
 * GetResponse type guard
 */
function isGetResponse(payload) {
    return isPlainObject(payload) && isArray(payload.docs);
}

function getModifyPayloadFnsMap() {
    var onMaps = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        onMaps[_i] = arguments[_i];
    }
    var _onMaps = onMaps.filter(Boolean);
    var writeFns = _onMaps.flatMap(function (on) { var _a; return (_a = on.write) !== null && _a !== void 0 ? _a : []; });
    var readFns = _onMaps.flatMap(function (on) { var _a; return (_a = on.read) !== null && _a !== void 0 ? _a : []; });
    // const deleteFns = _onMaps.flatMap(on => on.delete ?? [])
    var result = {
        insert: _onMaps.flatMap(function (on) { var _a; return (_a = on.insert) !== null && _a !== void 0 ? _a : []; }).concat(writeFns),
        merge: _onMaps.flatMap(function (on) { var _a; return (_a = on.merge) !== null && _a !== void 0 ? _a : []; }).concat(writeFns),
        assign: _onMaps.flatMap(function (on) { var _a; return (_a = on.assign) !== null && _a !== void 0 ? _a : []; }).concat(writeFns),
        replace: _onMaps.flatMap(function (on) { var _a; return (_a = on.replace) !== null && _a !== void 0 ? _a : []; }).concat(writeFns),
        deleteProp: _onMaps.flatMap(function (on) { var _a; return (_a = on.deleteProp) !== null && _a !== void 0 ? _a : []; }),
        "delete": [],
        stream: _onMaps.flatMap(function (on) { var _a; return (_a = on.stream) !== null && _a !== void 0 ? _a : []; }).concat(readFns),
        get: _onMaps.flatMap(function (on) { var _a; return (_a = on.get) !== null && _a !== void 0 ? _a : []; }).concat(readFns),
    };
    return result;
}

function getModifyReadResponseFnsMap() {
    var onMaps = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        onMaps[_i] = arguments[_i];
    }
    var _onMaps = onMaps.filter(Boolean);
    var result = {
        added: _onMaps.flatMap(function (on) { var _a; return (_a = on.added) !== null && _a !== void 0 ? _a : []; }),
        modified: _onMaps.flatMap(function (on) { var _a; return (_a = on.modified) !== null && _a !== void 0 ? _a : []; }),
        removed: _onMaps.flatMap(function (on) { var _a; return (_a = on.removed) !== null && _a !== void 0 ? _a : []; }),
    };
    return result;
}

/**
 * Executes given function array with given args-array deconstructed, it will always use replace the first param with whatever the response of each function was.
 *
 * @export
 * @param {AnyFunction[]} fns
 * @param {any[]} args
 * @returns {void}
 */
function executeOnFns(fns, payload, otherArgs) {
    var e_1, _a;
    try {
        for (var fns_1 = __values(fns), fns_1_1 = fns_1.next(); !fns_1_1.done; fns_1_1 = fns_1.next()) {
            var fn = fns_1_1.value;
            var result = fn.apply(void 0, __spread([payload], otherArgs));
            if (result)
                payload = result;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (fns_1_1 && !fns_1_1.done && (_a = fns_1["return"])) _a.call(fns_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return payload;
}

function isEven(number) { return number % 2 === 0; } // prettier-ignore
function isOdd(number) { return number % 2 === 1; } // prettier-ignore
function countCharacter(target, regExp) {
    return (target.match(regExp) || []).length;
}

function isDocModule(path) {
    return isOdd(countCharacter(path, /\//g));
}
function isCollectionModule(path) {
    return isEven(countCharacter(path, /\//g));
}
/**
 * Returns a tuple with `[CollectionPath, DocId]` if the `DocId` is `undefined` that means that the `modulePath` passed is a collection!
 *
 * @param {string} modulePath
 * @returns {[CollectionPath, DocId]} is [string, string | undefined]
 */
function getCollectionPathDocIdEntry(modulePath) {
    if (isCollectionModule(modulePath))
        return [modulePath, undefined];
    var collectionPath = modulePath.split('/').slice(0, -1).join('/'); // prettier-ignore
    var docId = modulePath.split('/').slice(-1)[0];
    return [collectionPath, docId];
}

function logError(errorMessage) {
    console.error('[@vue-sync error]\n', errorMessage);
}
function logErrorAndThrow(errorMessage) {
    logError(errorMessage);
    throw new Error(errorMessage);
}
function throwOnIncompleteStreamResponses(streamInfoPerStore, doOnStreamFns) {
    var noStreamLogic = !Object.keys(streamInfoPerStore).length;
    if (noStreamLogic) {
        var errorMessage = 'None of your store plugins have implemented logic to open a stream.';
        logErrorAndThrow(errorMessage);
    }
    var noDoOnStreamLogic = !Object.values(doOnStreamFns).flat().length;
    if (noDoOnStreamLogic) {
        var errorMessage = 'None of your store plugins have implemented logic to do something with the data coming in from streams.';
        logErrorAndThrow(errorMessage);
    }
}
function throwIfNoFnsToExecute(storesToExecute) {
    if (storesToExecute.length === 0) {
        var errorMessage = 'None of your store plugins have implemented this function or you have not defined an executionOrder anywhere.';
        logErrorAndThrow(errorMessage);
    }
}
function throwIfNoDataStoreName(dataStoreName) {
    if (isFullString(dataStoreName))
        return;
    var errorMessage = "No 'dataStoreName' provided.";
    logErrorAndThrow(errorMessage);
}
function throwIfInvalidModulePath(modulePath, moduleType) {
    var errorMessage = '';
    if (moduleType === 'collection') {
        if (!modulePath)
            errorMessage =
                'You must provide a collection id (or a "path" like so: collection/doc/collection).';
        if (isDocModule(modulePath))
            errorMessage = "Your collection id (or \"path\") must be of odd segments. The expected pattern is: collection/doc/collection ... Yours was " + modulePath;
    }
    if (moduleType === 'doc') {
        if (!modulePath)
            errorMessage = 'You must provide a document id (or a "path" like so: collection/doc).';
        if (isCollectionModule(modulePath))
            errorMessage = "Your doc id (or \"path\") must be of even segments. The expected pattern is: collection/doc/collection/doc ... Yours was " + modulePath;
    }
    if (errorMessage)
        logErrorAndThrow(errorMessage);
}

/**
 * Extracts the PluginModuleConfig from the ModuleConfig
 *
 * @export
 * @param {ModuleConfig} moduleConfig
 * @param {string} storeName
 * @returns {PluginModuleConfig}
 */
function getPluginModuleConfig(moduleConfig, storeName) {
    var where = moduleConfig.where, orderBy = moduleConfig.orderBy, limit = moduleConfig.limit, _a = moduleConfig.configPerStore, configPerStore = _a === void 0 ? {} : _a;
    var extraStoreConfig = isPlainObject(configPerStore[storeName]) ? configPerStore[storeName] : {};
    return __assign(__assign({}, extraStoreConfig), { where: where, orderBy: orderBy, limit: limit });
}
/**
 * Executes 'setupModule' function per store, when the collection or doc is instantiated.
 *
 * @export
 * @param {GlobalConfig['stores']} globalConfigStores
 * @param {[string, string | undefined]} [collectionPath, docId]
 * @param {ModuleConfig} moduleConfig
 */
function executeSetupModulePerStore(globalConfigStores, _a, moduleConfig) {
    var _b = __read(_a, 2), collectionPath = _b[0], docId = _b[1];
    for (var storeName in globalConfigStores) {
        var setupModule = globalConfigStores[storeName].setupModule;
        if (isFunction(setupModule)) {
            var pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeName);
            setupModule([collectionPath, docId], pluginModuleConfig);
        }
    }
}
/**
 * Returns the `getModuleData` function form the store specified as 'dataStoreName'
 *
 * @export
 * @template DocDataType
 * @param {ModuleConfig} moduleConfig
 * @param {GlobalConfig} globalConfig
 * @returns {([collectionPath, docId]: [string, string | undefined]) => (Map<string, DocDataType> | DocDataType)}
 */
function getDataFnFromDataStore(moduleConfig, globalConfig) {
    var dataStoreName = moduleConfig.dataStoreName || globalConfig.dataStoreName;
    throwIfNoDataStoreName(dataStoreName);
    var getModuleData = globalConfig.stores[dataStoreName].getModuleData;
    var pluginModuleConfig = getPluginModuleConfig(moduleConfig, dataStoreName);
    return (function (_a) {
        var _b = __read(_a, 2), collectionPath = _b[0], docId = _b[1];
        return getModuleData([collectionPath, docId], pluginModuleConfig);
    });
}
/**
 * Returns an object with the `data` prop as proxy which triggers every time the data is accessed
 *
 * @export
 * @template calledFrom {'doc' | 'collection'}
 * @template DocDataType
 * @param {[string, string | undefined]} [collectionPath, docId]
 * @param {ModuleConfig} moduleConfig
 * @param {GlobalConfig} globalConfig
 * @returns {calledFrom extends 'doc' ? { get: (...p: any[]) => DocDataType } : { get: (...p: any[]) => Map<string, DocDataType> }}
 */
function getDataProxyHandler(_a, moduleConfig, globalConfig) {
    var _b = __read(_a, 2), collectionPath = _b[0], docId = _b[1];
    var getModuleData = getDataFnFromDataStore(moduleConfig, globalConfig);
    var dataHandler = {
        get: function (target, key, proxyRef) {
            if (key === 'data')
                return getModuleData([collectionPath, docId]);
            return Reflect.get(target, key, proxyRef);
        },
    };
    return dataHandler;
}

function handleActionPerStore(_a, moduleConfig, globalConfig, actionName, actionType, docFn, // actions executed on a "doc" will always return `doc()`
collectionFn // actions executed on a "collection" will return `collection()` or `doc()`
) {
    var _b = __read(_a, 2), collectionPath = _b[0], _docId = _b[1];
    // returns the action the dev can call with myModule.insert() etc.
    return function (payload, actionConfig) {
        if (actionConfig === void 0) { actionConfig = {}; }
        return __awaiter(this, void 0, void 0, function () {
            /**
             * The abort mechanism for the entire store chain. When executed in handleAction() it won't go to the next store in executionOrder.
             */
            function stopExecutionAfterAction(trueOrRevert) {
                if (trueOrRevert === void 0) { trueOrRevert = true; }
                stopExecution = trueOrRevert;
            }
            var docId, onError, modifyPayloadFnsMap, modifyReadResponseMap, eventNameFnsMap, storesToExecute, _a, _b, modifyFn, stopExecution, doOnGetFns, resultFromPlugin, _c, _d, _e, i, storeName, pluginAction, pluginModuleConfig, _f, storesToRevert, storesToRevert_1, storesToRevert_1_1, storeToRevert, pluginRevertAction, pluginModuleConfig_1, _g, _h, fn, e_1_1, e_2_1, _j, _k, docRetrieved, e_3_1, modulePath;
            var e_4, _l, e_3, _m, e_2, _o, e_1, _p, e_5, _q;
            return __generator(this, function (_r) {
                switch (_r.label) {
                    case 0:
                        docId = _docId;
                        onError = actionConfig.onError || moduleConfig.onError || globalConfig.onError;
                        modifyPayloadFnsMap = getModifyPayloadFnsMap(globalConfig.modifyPayloadOn, moduleConfig.modifyPayloadOn, actionConfig.modifyPayloadOn);
                        modifyReadResponseMap = getModifyReadResponseFnsMap(globalConfig.modifyReadResponseOn, moduleConfig.modifyReadResponseOn, actionConfig.modifyReadResponseOn);
                        eventNameFnsMap = getEventNameFnsMap(globalConfig.on, moduleConfig.on, actionConfig.on);
                        storesToExecute = actionConfig.executionOrder ||
                            (moduleConfig.executionOrder || {})[actionName] ||
                            (moduleConfig.executionOrder || {})[actionType] ||
                            (globalConfig.executionOrder || {})[actionName] ||
                            (globalConfig.executionOrder || {})[actionType] ||
                            [];
                        throwIfNoFnsToExecute(storesToExecute);
                        try {
                            // update the payload
                            for (_a = __values(modifyPayloadFnsMap[actionName]), _b = _a.next(); !_b.done; _b = _a.next()) {
                                modifyFn = _b.value;
                                payload = modifyFn(payload);
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_l = _a["return"])) _l.call(_a);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                        doOnGetFns = modifyReadResponseMap.added;
                        _r.label = 1;
                    case 1:
                        _r.trys.push([1, 24, 25, 26]);
                        _c = __values(storesToExecute.entries()), _d = _c.next();
                        _r.label = 2;
                    case 2:
                        if (!!_d.done) return [3 /*break*/, 23];
                        _e = __read(_d.value, 2), i = _e[0], storeName = _e[1];
                        // a previous iteration stopped the execution:
                        if (stopExecution === true)
                            return [3 /*break*/, 23];
                        pluginAction = globalConfig.stores[storeName].actions[actionName];
                        pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeName);
                        if (!!pluginAction) return [3 /*break*/, 3];
                        _f = resultFromPlugin;
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, handleAction({
                            collectionPath: collectionPath,
                            docId: docId,
                            pluginModuleConfig: pluginModuleConfig,
                            pluginAction: pluginAction,
                            payload: payload,
                            eventNameFnsMap: eventNameFnsMap,
                            onError: onError,
                            actionName: actionName,
                            stopExecutionAfterAction: stopExecutionAfterAction,
                            storeName: storeName,
                        })
                        // handle reverting. stopExecution might have been modified by `handleAction`
                    ];
                    case 4:
                        _f = _r.sent();
                        _r.label = 5;
                    case 5:
                        // the plugin action
                        resultFromPlugin = _f;
                        if (!(stopExecution === 'revert')) return [3 /*break*/, 21];
                        storesToRevert = storesToExecute.slice(0, i);
                        storesToRevert.reverse();
                        _r.label = 6;
                    case 6:
                        _r.trys.push([6, 18, 19, 20]);
                        storesToRevert_1 = (e_2 = void 0, __values(storesToRevert)), storesToRevert_1_1 = storesToRevert_1.next();
                        _r.label = 7;
                    case 7:
                        if (!!storesToRevert_1_1.done) return [3 /*break*/, 17];
                        storeToRevert = storesToRevert_1_1.value;
                        pluginRevertAction = globalConfig.stores[storeToRevert].revert;
                        pluginModuleConfig_1 = getPluginModuleConfig(moduleConfig, storeToRevert);
                        return [4 /*yield*/, pluginRevertAction(payload, [collectionPath, docId], pluginModuleConfig_1, actionName)
                            // revert eventFns, handle and await each eventFn in sequence
                        ];
                    case 8:
                        _r.sent();
                        _r.label = 9;
                    case 9:
                        _r.trys.push([9, 14, 15, 16]);
                        _g = (e_1 = void 0, __values(eventNameFnsMap.revert)), _h = _g.next();
                        _r.label = 10;
                    case 10:
                        if (!!_h.done) return [3 /*break*/, 13];
                        fn = _h.value;
                        return [4 /*yield*/, fn({ payload: payload, result: resultFromPlugin, actionName: actionName, storeName: storeName })];
                    case 11:
                        _r.sent();
                        _r.label = 12;
                    case 12:
                        _h = _g.next();
                        return [3 /*break*/, 10];
                    case 13: return [3 /*break*/, 16];
                    case 14:
                        e_1_1 = _r.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 16];
                    case 15:
                        try {
                            if (_h && !_h.done && (_p = _g["return"])) _p.call(_g);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 16:
                        storesToRevert_1_1 = storesToRevert_1.next();
                        return [3 /*break*/, 7];
                    case 17: return [3 /*break*/, 20];
                    case 18:
                        e_2_1 = _r.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 20];
                    case 19:
                        try {
                            if (storesToRevert_1_1 && !storesToRevert_1_1.done && (_o = storesToRevert_1["return"])) _o.call(storesToRevert_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 20: 
                    // now we must throw the error
                    throw resultFromPlugin;
                    case 21:
                        // special handling for 'insert' (resultFromPlugin will always be `string`)
                        if (actionName === 'insert' && isFullString(resultFromPlugin)) {
                            // update the modulePath if a doc with random ID was inserted in a collection
                            // if this is the case the result will be a string - the randomly genererated ID
                            if (!docId) {
                                docId = resultFromPlugin;
                            }
                        }
                        // special handling for 'get' (resultFromPlugin will always be `GetResponse | OnAddedFn`)
                        if (actionName === 'get') {
                            if (isDoOnGet(resultFromPlugin)) {
                                doOnGetFns.push(resultFromPlugin);
                            }
                            if (isGetResponse(resultFromPlugin)) {
                                try {
                                    for (_j = (e_5 = void 0, __values(resultFromPlugin.docs)), _k = _j.next(); !_k.done; _k = _j.next()) {
                                        docRetrieved = _k.value;
                                        executeOnFns(doOnGetFns, docRetrieved.data, [docRetrieved]);
                                    }
                                }
                                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                                finally {
                                    try {
                                        if (_k && !_k.done && (_q = _j["return"])) _q.call(_j);
                                    }
                                    finally { if (e_5) throw e_5.error; }
                                }
                            }
                        }
                        _r.label = 22;
                    case 22:
                        _d = _c.next();
                        return [3 /*break*/, 2];
                    case 23: return [3 /*break*/, 26];
                    case 24:
                        e_3_1 = _r.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 26];
                    case 25:
                        try {
                            if (_d && !_d.done && (_m = _c["return"])) _m.call(_c);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 26:
                        modulePath = [collectionPath, docId].filter(Boolean).join('/');
                        // anything that's executed from a "collection" module:
                        // 'insert' always returns a DocInstance, unless the "abort" action was called, then the modulePath might still be a collection:
                        if (actionName === 'insert' && docId) {
                            // we do not pass the `moduleConfig`, because it's the moduleConfig of the "collection" in this case
                            return [2 /*return*/, docFn(modulePath)];
                        }
                        // anything that's executed from a "doc" module:
                        if (docId)
                            return [2 /*return*/, docFn(modulePath, moduleConfig)
                                // all other actions triggered on collections ('get' is the only possibility left)
                                // should return the collection:
                            ];
                        // all other actions triggered on collections ('get' is the only possibility left)
                        // should return the collection:
                        return [2 /*return*/, collectionFn(modulePath, moduleConfig)];
                }
            });
        });
    };
}

/**
 * handleStream is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success
 */
function handleStream(args) {
    return __awaiter(this, void 0, void 0, function () {
        var collectionPath, docId, pluginModuleConfig, pluginAction, payload, on, actionName, storeName, mustExecuteOnRead, abort, _a, _b, fn, e_1_1, result, pluginStreamAction, error_1, _c, _d, fn, e_2_1, _e, _f, fn, e_3_1;
        var e_1, _g, e_2, _h, e_3, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    collectionPath = args.collectionPath, docId = args.docId, pluginModuleConfig = args.pluginModuleConfig, pluginAction = args.pluginAction, payload = args.payload, on = args.eventNameFnsMap, actionName = args.actionName, storeName = args.storeName, mustExecuteOnRead = args.mustExecuteOnRead;
                    abort = undefined;
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 6, 7, 8]);
                    _a = __values(on.before), _b = _a.next();
                    _k.label = 2;
                case 2:
                    if (!!_b.done) return [3 /*break*/, 5];
                    fn = _b.value;
                    return [4 /*yield*/, fn({ payload: payload, actionName: actionName, storeName: storeName, abort: abort })];
                case 3:
                    _k.sent();
                    _k.label = 4;
                case 4:
                    _b = _a.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_1_1 = _k.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (_b && !_b.done && (_g = _a["return"])) _g.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 8:
                    _k.trys.push([8, 10, , 19]);
                    pluginStreamAction = pluginAction;
                    return [4 /*yield*/, pluginStreamAction(payload, [collectionPath, docId], pluginModuleConfig, mustExecuteOnRead)];
                case 9:
                    result = _k.sent();
                    return [3 /*break*/, 19];
                case 10:
                    error_1 = _k.sent();
                    _k.label = 11;
                case 11:
                    _k.trys.push([11, 16, 17, 18]);
                    _c = __values(on.error), _d = _c.next();
                    _k.label = 12;
                case 12:
                    if (!!_d.done) return [3 /*break*/, 15];
                    fn = _d.value;
                    return [4 /*yield*/, fn({ payload: payload, actionName: actionName, storeName: storeName, error: error_1, abort: abort })];
                case 13:
                    _k.sent();
                    _k.label = 14;
                case 14:
                    _d = _c.next();
                    return [3 /*break*/, 12];
                case 15: return [3 /*break*/, 18];
                case 16:
                    e_2_1 = _k.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 18];
                case 17:
                    try {
                        if (_d && !_d.done && (_h = _c["return"])) _h.call(_c);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 18: throw error_1;
                case 19:
                    _k.trys.push([19, 24, 25, 26]);
                    _e = __values(on.success), _f = _e.next();
                    _k.label = 20;
                case 20:
                    if (!!_f.done) return [3 /*break*/, 23];
                    fn = _f.value;
                    return [4 /*yield*/, fn({ payload: payload, result: result, actionName: actionName, storeName: storeName, abort: abort })];
                case 21:
                    _k.sent();
                    _k.label = 22;
                case 22:
                    _f = _e.next();
                    return [3 /*break*/, 20];
                case 23: return [3 /*break*/, 26];
                case 24:
                    e_3_1 = _k.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 26];
                case 25:
                    try {
                        if (_f && !_f.done && (_j = _e["return"])) _j.call(_e);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 26: return [2 /*return*/, result];
            }
        });
    });
}

function handleStreamPerStore(_a, moduleConfig, globalConfig, actionType, openStreams) {
    var _b = __read(_a, 2), collectionPath = _b[0], docId = _b[1];
    // returns the action the dev can call with myModule.insert() etc.
    return function (payload, actionConfig) {
        if (actionConfig === void 0) { actionConfig = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var eventNameFnsMap, modifyPayloadFnsMap, modifyReadResponseMap, storesToExecute, _a, _b, modifyFn, streamInfoPerStore, doOnStreamFns, mustExecuteOnRead, storesToExecute_1, storesToExecute_1_1, storeName, pluginAction, pluginModuleConfig, result, _c, _d, _e, doOn, doFn, e_1_1, streamPromises, unsubscribe, openStreamIdentifier;
            var e_2, _f, e_1, _g, e_3, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        eventNameFnsMap = getEventNameFnsMap(globalConfig.on, moduleConfig.on, actionConfig.on);
                        modifyPayloadFnsMap = getModifyPayloadFnsMap(globalConfig.modifyPayloadOn, moduleConfig.modifyPayloadOn, actionConfig.modifyPayloadOn);
                        modifyReadResponseMap = getModifyReadResponseFnsMap(globalConfig.modifyReadResponseOn, moduleConfig.modifyReadResponseOn, actionConfig.modifyReadResponseOn);
                        storesToExecute = actionConfig.executionOrder ||
                            (moduleConfig.executionOrder || {})['stream'] ||
                            (moduleConfig.executionOrder || {})[actionType] ||
                            (globalConfig.executionOrder || {})['stream'] ||
                            (globalConfig.executionOrder || {})[actionType] ||
                            [];
                        throwIfNoFnsToExecute(storesToExecute);
                        try {
                            // update the payload
                            for (_a = __values(modifyPayloadFnsMap['stream']), _b = _a.next(); !_b.done; _b = _a.next()) {
                                modifyFn = _b.value;
                                payload = modifyFn(payload);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_f = _a["return"])) _f.call(_a);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        streamInfoPerStore = {};
                        doOnStreamFns = {
                            added: modifyReadResponseMap.added,
                            modified: modifyReadResponseMap.modified,
                            removed: modifyReadResponseMap.removed,
                        };
                        mustExecuteOnRead = {
                            added: function (_payload, _meta) { return executeOnFns(doOnStreamFns.added, _payload, [_meta]); },
                            modified: function (_payload, _meta) { return executeOnFns(doOnStreamFns.modified, _payload, [_meta]); },
                            removed: function (_payload, _meta) { return executeOnFns(doOnStreamFns.removed, _payload, [_meta]); },
                        };
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 6, 7, 8]);
                        storesToExecute_1 = __values(storesToExecute), storesToExecute_1_1 = storesToExecute_1.next();
                        _j.label = 2;
                    case 2:
                        if (!!storesToExecute_1_1.done) return [3 /*break*/, 5];
                        storeName = storesToExecute_1_1.value;
                        pluginAction = globalConfig.stores[storeName].actions['stream'];
                        pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeName);
                        if (!pluginAction) return [3 /*break*/, 4];
                        return [4 /*yield*/, handleStream({
                                collectionPath: collectionPath,
                                docId: docId,
                                pluginModuleConfig: pluginModuleConfig,
                                pluginAction: pluginAction,
                                payload: payload,
                                eventNameFnsMap: eventNameFnsMap,
                                actionName: 'stream',
                                storeName: storeName,
                                mustExecuteOnRead: mustExecuteOnRead,
                            })
                            // if the plugin action for stream returns a "do on read" result
                        ];
                    case 3:
                        result = _j.sent();
                        // if the plugin action for stream returns a "do on read" result
                        if (isDoOnStream(result)) {
                            try {
                                // register the functions we received: result
                                for (_c = (e_3 = void 0, __values(Object.entries(result))), _d = _c.next(); !_d.done; _d = _c.next()) {
                                    _e = __read(_d.value, 2), doOn = _e[0], doFn = _e[1];
                                    doOnStreamFns[doOn].push(doFn);
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (_d && !_d.done && (_h = _c["return"])) _h.call(_c);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                        }
                        // if the plugin action for stream returns a "stream response" result
                        if (!isDoOnStream(result)) {
                            streamInfoPerStore[storeName] = result;
                        }
                        _j.label = 4;
                    case 4:
                        storesToExecute_1_1 = storesToExecute_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _j.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (storesToExecute_1_1 && !storesToExecute_1_1.done && (_g = storesToExecute_1["return"])) _g.call(storesToExecute_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        throwOnIncompleteStreamResponses(streamInfoPerStore, doOnStreamFns);
                        streamPromises = Object.values(streamInfoPerStore).map(function (_a) {
                            var streaming = _a.streaming;
                            return streaming;
                        });
                        unsubscribe = function () { return Object.values(streamInfoPerStore).forEach(function (_a) {
                            var stop = _a.stop;
                            return stop();
                        }); };
                        openStreamIdentifier = payload !== null && payload !== void 0 ? payload : {};
                        openStreams.set(openStreamIdentifier, unsubscribe);
                        // return all the stream promises as one promise
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                Promise.all(streamPromises)
                                    // todo: why can I not just write then(resolve)
                                    .then(function () { return resolve(); })["catch"](reject);
                            })];
                }
            });
        });
    };
}

function createCollectionWithContext(_a, moduleConfig, globalConfig, docFn, collectionFn, openStreams) {
    var _b = __read(_a, 2), collectionPath = _b[0], docId = _b[1];
    var id = collectionPath.split('/').slice(-1)[0];
    var path = collectionPath;
    var doc = function (docId, _moduleConfig) {
        if (_moduleConfig === void 0) { _moduleConfig = {}; }
        return docFn(path + "/" + docId, _moduleConfig);
    };
    var insert = handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'insert', actionNameTypeMap.get, docFn, collectionFn); //prettier-ignore
    var get = handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'get', actionNameTypeMap.get, docFn, collectionFn); //prettier-ignore
    var stream = handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, actionNameTypeMap.stream, openStreams); // prettier-ignore
    var actions = { stream: stream, get: get, insert: insert };
    // Every store will have its 'setupModule' function executed
    executeSetupModulePerStore(globalConfig.stores, [collectionPath, docId], moduleConfig);
    function where(fieldPath, operator, value) {
        var whereClause = [fieldPath, operator, value];
        var moduleConfigWithClause = mergeAndConcat(moduleConfig, { where: [whereClause] });
        return collectionFn(path, moduleConfigWithClause);
    }
    function orderBy(fieldPath, direction) {
        if (direction === void 0) { direction = 'asc'; }
        var orderByClause = [fieldPath, direction];
        var moduleConfigWithClause = mergeAndConcat(moduleConfig, { orderBy: [orderByClause] });
        return collectionFn(path, moduleConfigWithClause);
    }
    function limit(limitCount) {
        return collectionFn(path, __assign(__assign({}, moduleConfig), { limit: limitCount }));
    }
    var queryFns = { where: where, orderBy: orderBy, limit: limit };
    var moduleInstance = __assign(__assign({ doc: doc,
        id: id,
        path: path,
        openStreams: openStreams }, actions), queryFns);
    /**
     * The data returned by the store specified as 'dataStoreName'
     */
    var dataProxyHandler = getDataProxyHandler([collectionPath, docId], moduleConfig, globalConfig);
    return new Proxy(moduleInstance, dataProxyHandler);
}

function createDocWithContext(_a, moduleConfig, globalConfig, docFn, collectionFn, openStreams) {
    var _b = __read(_a, 2), collectionPath = _b[0], docId = _b[1];
    var id = docId;
    var path = [collectionPath, docId].join('/');
    var collection = function (collectionId, _moduleConfig) {
        if (_moduleConfig === void 0) { _moduleConfig = {}; }
        return collectionFn(path + "/" + collectionId, _moduleConfig);
    };
    var actions = {
        insert: handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'insert', actionNameTypeMap.insert, docFn),
        merge: handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'merge', actionNameTypeMap.merge, docFn),
        assign: handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'assign', actionNameTypeMap.assign, docFn),
        replace: handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'replace', actionNameTypeMap.replace, docFn),
        deleteProp: handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'deleteProp', actionNameTypeMap.deleteProp, docFn),
        "delete": handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'delete', actionNameTypeMap["delete"], docFn),
        get: handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'get', actionNameTypeMap.get, docFn),
        stream: handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, actionNameTypeMap.stream, openStreams),
    };
    // Every store will have its 'setupModule' function executed
    executeSetupModulePerStore(globalConfig.stores, [collectionPath, docId], moduleConfig);
    var moduleInstance = __assign({ collection: collection,
        id: id,
        path: path,
        openStreams: openStreams }, actions);
    /**
     * The data returned by the store specified as 'dataStoreName'
     */
    var dataProxyHandler = getDataProxyHandler([collectionPath, docId], moduleConfig, globalConfig);
    return new Proxy(moduleInstance, dataProxyHandler);
}

function configWithDefaults(config) {
    var defaults = {
        executionOrder: {
            read: [],
            write: [],
        },
        onError: 'revert',
        on: {},
        modifyPayloadOn: {},
        modifyReadResponseOn: {},
        dataStoreName: '',
    };
    var merged = merge(defaults, config);
    return merged;
}
function VueSync(vueSyncConfig) {
    // the passed GlobalConfig is merged onto defaults
    var globalConfig = configWithDefaults(vueSyncConfig);
    /**
     * takes care of the caching instances of modules. Todo: double check memory leaks for when an instance isn't referenced anymore.
     */
    var moduleMap = new WeakMap(); // apply type upon get/set
    /**
     * the global storage for subscriptions
     */
    var streamSubscribtionMap = new Map(); // apply type upon get/set
    function getModuleInstance(modulePath, moduleConfig, moduleType, docFn, collectionFn) {
        if (moduleConfig === void 0) { moduleConfig = {}; }
        throwIfInvalidModulePath(modulePath, moduleType);
        var _a = __read(getCollectionPathDocIdEntry(modulePath), 2), collectionPath = _a[0], docId = _a[1];
        // retrieved the cached instance
        var moduleIdentifier = { modulePath: modulePath, moduleConfig: moduleConfig };
        var _moduleMap = moduleMap;
        var cachedInstance = _moduleMap.get(moduleIdentifier);
        if (cachedInstance)
            return cachedInstance;
        // else create and cache a new instance
        // first create the stream subscribtion map for this module
        if (!streamSubscribtionMap.has(modulePath)) {
            streamSubscribtionMap.set(modulePath, new Map());
        }
        var openStreams = streamSubscribtionMap.get(modulePath);
        // then create the module instance
        var createInstanceWithContext = moduleType === 'doc' ? createDocWithContext : createCollectionWithContext;
        // @ts-ignore
        var moduleInstance = createInstanceWithContext([collectionPath, docId], moduleConfig, globalConfig, docFn, collectionFn, openStreams);
        moduleMap.set(moduleIdentifier, moduleInstance);
        return moduleInstance;
    }
    function collection(modulePath, moduleConfig) {
        if (moduleConfig === void 0) { moduleConfig = {}; }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return getModuleInstance(modulePath, moduleConfig, 'collection', doc, collection); // prettier-ignore
    }
    function doc(modulePath, moduleConfig) {
        if (moduleConfig === void 0) { moduleConfig = {}; }
        return getModuleInstance(modulePath, moduleConfig, 'doc', doc, collection); // prettier-ignore
    }
    var instance = {
        globalConfig: globalConfig,
        collection: collection,
        doc: doc,
    };
    return instance;
}

function isVueSyncError(payload) {
    return isAnyObject(payload) && 'payload' in payload && 'message' in payload;
}

export { VueSync, getCollectionPathDocIdEntry, isCollectionModule, isDoOnGet, isDoOnStream, isDocModule, isGetResponse, isVueSyncError };
