'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var mergeAnything = require('merge-anything');
var isWhat = require('is-what');

const actionNameTypeMap = {
    get: 'read',
    stream: 'read',
    insert: 'write',
    merge: 'write',
    assign: 'write',
    replace: 'write',
    deleteProp: 'write',
    delete: 'delete',
};

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

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/**
 * handleAction is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success (4) optional: onNextStoresSuccess.
 * in any event/hook it's possible for the dev to modify the result & also abort the execution chain, which prevents calling handleAction on the next store as well
 */
function handleAction(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { collectionPath, docId, pluginModuleConfig, pluginAction, payload, eventNameFnsMap: on, onError, actionName, stopExecutionAfterAction, storeName, } = args;
        // create abort mechanism for current scope
        let abortExecution = false;
        const abort = () => {
            abortExecution = true;
        };
        // handle and await each eventFn in sequence
        for (const fn of on.before) {
            yield fn({ payload, actionName, storeName, abort });
        }
        // abort?
        if (abortExecution) {
            stopExecutionAfterAction();
            return;
        }
        let result;
        try {
            // triggering the action provided by the plugin
            result = yield pluginAction({ payload, collectionPath, docId, pluginModuleConfig });
        }
        catch (error) {
            // handle and await each eventFn in sequence
            for (const fn of on.error) {
                yield fn({ payload, actionName, storeName, abort, error });
            }
            // abort?
            if (abortExecution || onError === 'stop') {
                stopExecutionAfterAction();
                throw error;
            }
            if (onError === 'revert') {
                stopExecutionAfterAction('revert');
                // we need to revert first, then throw the error later
                return error;
            }
        }
        // handle and await each eventFn in sequence
        for (const fn of on.success) {
            yield fn({ payload, result, actionName, storeName, abort });
        }
        // abort?
        if (abortExecution) {
            stopExecutionAfterAction();
            return result;
        }
        return result;
    });
}

function getEventNameFnsMap(...onMaps) {
    const _onMaps = onMaps.filter(Boolean);
    const result = {
        before: _onMaps.flatMap((on) => { var _a; return (_a = on.before) !== null && _a !== void 0 ? _a : []; }),
        success: _onMaps.flatMap((on) => { var _a; return (_a = on.success) !== null && _a !== void 0 ? _a : []; }),
        error: _onMaps.flatMap((on) => { var _a; return (_a = on.error) !== null && _a !== void 0 ? _a : []; }),
        revert: _onMaps.flatMap((on) => { var _a; return (_a = on.revert) !== null && _a !== void 0 ? _a : []; }),
    };
    return result;
}

/**
 * DoOnStream type guard
 */
function isDoOnStream(payload) {
    const isNotDoOnStream = !isWhat.isPlainObject(payload) ||
        payload.streaming ||
        payload.stop ||
        !(payload.added || payload.modified || payload.removed);
    return !isNotDoOnStream;
}
/**
 * DoOnGet type guard
 */
function isDoOnGet(payload) {
    return isWhat.isFunction(payload);
}
/**
 * GetResponse type guard
 */
function isGetResponse(payload) {
    return isWhat.isPlainObject(payload) && isWhat.isArray(payload.docs);
}

function getModifyPayloadFnsMap(...onMaps) {
    const _onMaps = onMaps.filter(Boolean);
    const writeFns = _onMaps.flatMap((on) => { var _a; return (_a = on.write) !== null && _a !== void 0 ? _a : []; });
    const readFns = _onMaps.flatMap((on) => { var _a; return (_a = on.read) !== null && _a !== void 0 ? _a : []; });
    // const deleteFns = _onMaps.flatMap(on => on.delete ?? [])
    const result = {
        insert: _onMaps.flatMap((on) => { var _a; return (_a = on.insert) !== null && _a !== void 0 ? _a : []; }).concat(writeFns),
        merge: _onMaps.flatMap((on) => { var _a; return (_a = on.merge) !== null && _a !== void 0 ? _a : []; }).concat(writeFns),
        assign: _onMaps.flatMap((on) => { var _a; return (_a = on.assign) !== null && _a !== void 0 ? _a : []; }).concat(writeFns),
        replace: _onMaps.flatMap((on) => { var _a; return (_a = on.replace) !== null && _a !== void 0 ? _a : []; }).concat(writeFns),
        deleteProp: _onMaps.flatMap((on) => { var _a; return (_a = on.deleteProp) !== null && _a !== void 0 ? _a : []; }),
        delete: [],
        stream: _onMaps.flatMap((on) => { var _a; return (_a = on.stream) !== null && _a !== void 0 ? _a : []; }).concat(readFns),
        get: _onMaps.flatMap((on) => { var _a; return (_a = on.get) !== null && _a !== void 0 ? _a : []; }).concat(readFns),
    };
    return result;
}

function getModifyReadResponseFnsMap(...onMaps) {
    const _onMaps = onMaps.filter(Boolean);
    const result = {
        added: _onMaps.flatMap((on) => { var _a; return (_a = on.added) !== null && _a !== void 0 ? _a : []; }),
        modified: _onMaps.flatMap((on) => { var _a; return (_a = on.modified) !== null && _a !== void 0 ? _a : []; }),
        removed: _onMaps.flatMap((on) => { var _a; return (_a = on.removed) !== null && _a !== void 0 ? _a : []; }),
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
    for (const fn of fns) {
        const result = fn(payload, ...otherArgs);
        if (result)
            payload = result;
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
    const collectionPath = modulePath.split('/').slice(0, -1).join('/'); // prettier-ignore
    const docId = modulePath.split('/').slice(-1)[0];
    return [collectionPath, docId];
}

function logError(errorMessage) {
    console.error('[@magnetarjs error]\n', errorMessage);
}
function logErrorAndThrow(errorMessage) {
    logError(errorMessage);
    throw new Error(errorMessage);
}
function throwOnIncompleteStreamResponses(streamInfoPerStore, doOnStreamFns) {
    const noStreamLogic = !Object.keys(streamInfoPerStore).length;
    if (noStreamLogic) {
        const errorMessage = 'None of your store plugins have implemented logic to open a stream.';
        logErrorAndThrow(errorMessage);
    }
    const noDoOnStreamLogic = !Object.values(doOnStreamFns).flat().length;
    if (noDoOnStreamLogic) {
        const errorMessage = 'None of your store plugins have implemented logic to do something with the data coming in from streams.';
        logErrorAndThrow(errorMessage);
    }
}
function throwIfNoFnsToExecute(storesToExecute) {
    if (storesToExecute.length === 0) {
        const errorMessage = 'None of your store plugins have implemented this function or you have not defined an executionOrder anywhere.';
        logErrorAndThrow(errorMessage);
    }
}
function throwIfNoDataStoreName(dataStoreName) {
    if (isWhat.isFullString(dataStoreName))
        return;
    const errorMessage = `No 'dataStoreName' provided.`;
    logErrorAndThrow(errorMessage);
}
function throwIfInvalidModulePath(modulePath, moduleType) {
    let errorMessage = '';
    if (moduleType === 'collection') {
        if (!modulePath)
            errorMessage =
                'You must provide a collection id (or a "path" like so: collection/doc/collection).';
        if (isDocModule(modulePath))
            errorMessage = `Your collection id (or "path") must be of odd segments. The expected pattern is: collection/doc/collection ... Yours was ${modulePath}`;
    }
    if (moduleType === 'doc') {
        if (!modulePath)
            errorMessage = 'You must provide a document id (or a "path" like so: collection/doc).';
        if (isCollectionModule(modulePath))
            errorMessage = `Your doc id (or "path") must be of even segments. The expected pattern is: collection/doc/collection/doc ... Yours was ${modulePath}`;
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
    const { where, orderBy, limit, configPerStore = {} } = moduleConfig;
    const extraStoreConfig = isWhat.isPlainObject(configPerStore[storeName]) ? configPerStore[storeName] : {};
    return Object.assign(Object.assign({}, extraStoreConfig), { where, orderBy, limit });
}
/**
 * Executes 'setupModule' function per store, when the collection or doc is instantiated.
 *
 * @export
 * @param {GlobalConfig['stores']} globalConfigStores
 * @param {[string, string | undefined]} [collectionPath, docId]
 * @param {ModuleConfig} moduleConfig
 */
function executeSetupModulePerStore(globalConfigStores, [collectionPath, docId], moduleConfig) {
    for (const storeName in globalConfigStores) {
        const { setupModule } = globalConfigStores[storeName];
        if (isWhat.isFunction(setupModule)) {
            const pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeName);
            setupModule({ collectionPath, docId, pluginModuleConfig });
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
 * @returns {(collectionPath: string, docId: string | undefined) => (Map<string, DocDataType> | DocDataType)}
 */
function getDataFnFromDataStore(moduleConfig, globalConfig) {
    const dataStoreName = moduleConfig.dataStoreName || globalConfig.dataStoreName;
    throwIfNoDataStoreName(dataStoreName);
    const getModuleData = globalConfig.stores[dataStoreName];
    const pluginModuleConfig = getPluginModuleConfig(moduleConfig, dataStoreName);
    return (collectionPath, docId) => getModuleData({ collectionPath, docId, pluginModuleConfig });
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
function getDataProxyHandler([collectionPath, docId], moduleConfig, globalConfig) {
    const getModuleData = getDataFnFromDataStore(moduleConfig, globalConfig);
    const dataHandler = {
        get: function (target, key, proxyRef) {
            if (key === 'data')
                return getModuleData(collectionPath, docId);
            return Reflect.get(target, key, proxyRef);
        },
    };
    return dataHandler;
}

function handleActionPerStore([collectionPath, _docId], moduleConfig, globalConfig, actionName, actionType, docFn, // actions executed on a "doc" will always return `doc()`
collectionFn // actions executed on a "collection" will return `collection()` or `doc()`
) {
    // returns the action the dev can call with myModule.insert() etc.
    return function (payload, actionConfig = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let docId = _docId;
            // get all the config needed to perform this action
            const onError = actionConfig.onError || moduleConfig.onError || globalConfig.onError;
            const modifyPayloadFnsMap = getModifyPayloadFnsMap(globalConfig.modifyPayloadOn, moduleConfig.modifyPayloadOn, actionConfig.modifyPayloadOn);
            const modifyReadResponseMap = getModifyReadResponseFnsMap(globalConfig.modifyReadResponseOn, moduleConfig.modifyReadResponseOn, actionConfig.modifyReadResponseOn);
            const eventNameFnsMap = getEventNameFnsMap(globalConfig.on, moduleConfig.on, actionConfig.on);
            const storesToExecute = actionConfig.executionOrder ||
                (moduleConfig.executionOrder || {})[actionName] ||
                (moduleConfig.executionOrder || {})[actionType] ||
                (globalConfig.executionOrder || {})[actionName] ||
                (globalConfig.executionOrder || {})[actionType] ||
                [];
            throwIfNoFnsToExecute(storesToExecute);
            // update the payload
            for (const modifyFn of modifyPayloadFnsMap[actionName]) {
                payload = modifyFn(payload);
            }
            let stopExecution;
            /**
             * The abort mechanism for the entire store chain. When executed in handleAction() it won't go to the next store in executionOrder.
             */
            function stopExecutionAfterAction(trueOrRevert = true) {
                stopExecution = trueOrRevert;
            }
            /**
             * each each time a store returns a `GetResponse` then all `doOnGetFns` need to be executed
             */
            const doOnGetFns = modifyReadResponseMap.added;
            // handle and await each action in sequence
            let resultFromPlugin;
            for (const [i, storeName] of storesToExecute.entries()) {
                // a previous iteration stopped the execution:
                // @ts-ignore
                if (stopExecution === true)
                    break;
                // find the action on the plugin
                const pluginAction = globalConfig.stores[storeName].actions[actionName];
                const pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeName);
                // the plugin action
                resultFromPlugin = !pluginAction
                    ? resultFromPlugin
                    : yield handleAction({
                        collectionPath,
                        docId,
                        pluginModuleConfig,
                        pluginAction,
                        payload,
                        eventNameFnsMap,
                        onError,
                        actionName,
                        stopExecutionAfterAction,
                        storeName,
                    });
                // handle reverting. stopExecution might have been modified by `handleAction`
                // @ts-ignore
                if (stopExecution === 'revert') {
                    const storesToRevert = storesToExecute.slice(0, i);
                    storesToRevert.reverse();
                    for (const storeToRevert of storesToRevert) {
                        const pluginRevertAction = globalConfig.stores[storeToRevert].revert;
                        const pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeToRevert);
                        yield pluginRevertAction({
                            payload,
                            collectionPath,
                            docId,
                            pluginModuleConfig,
                            actionName,
                            error: resultFromPlugin,
                        });
                        // revert eventFns, handle and await each eventFn in sequence
                        for (const fn of eventNameFnsMap.revert) {
                            yield fn({ payload, result: resultFromPlugin, actionName, storeName });
                        }
                    }
                    // now we must throw the error
                    throw resultFromPlugin;
                }
                // special handling for 'insert' (resultFromPlugin will always be `string`)
                if (actionName === 'insert' && isWhat.isFullString(resultFromPlugin)) {
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
                        for (const docRetrieved of resultFromPlugin.docs) {
                            executeOnFns(doOnGetFns, docRetrieved.data, [docRetrieved]);
                        }
                    }
                }
            }
            const modulePath = [collectionPath, docId].filter(Boolean).join('/');
            // anything that's executed from a "collection" module:
            // 'insert' always returns a DocInstance, unless the "abort" action was called, then the modulePath might still be a collection:
            if (actionName === 'insert' && docId) {
                // we do not pass the `moduleConfig`, because it's the moduleConfig of the "collection" in this case
                return docFn(modulePath);
            }
            // anything that's executed from a "doc" module:
            if (docId || !collectionFn)
                return docFn(modulePath, moduleConfig);
            // all other actions triggered on collections ('get' is the only possibility left)
            // should return the collection:
            return collectionFn(modulePath, moduleConfig);
        });
    };
}

/**
 * handleStream is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success
 */
function handleStream(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { collectionPath, docId, pluginModuleConfig, pluginAction, payload, eventNameFnsMap: on, actionName, storeName, mustExecuteOnRead, } = args;
        // no aborting possible in stream actions
        const abort = undefined;
        // handle and await each eventFn in sequence
        for (const fn of on.before) {
            yield fn({ payload, actionName, storeName, abort });
        }
        let result;
        try {
            // triggering the action provided by the plugin
            const pluginStreamAction = pluginAction;
            result = yield pluginStreamAction({
                payload,
                collectionPath,
                docId,
                pluginModuleConfig,
                mustExecuteOnRead,
            });
        }
        catch (error) {
            // handle and await each eventFn in sequence
            for (const fn of on.error) {
                yield fn({ payload, actionName, storeName, error, abort });
            }
            throw error;
        }
        // handle and await each eventFn in sequence
        for (const fn of on.success) {
            yield fn({ payload, result, actionName, storeName, abort });
        }
        return result;
    });
}

function handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, actionType, openStreams) {
    // returns the action the dev can call with myModule.insert() etc.
    return function (payload, actionConfig = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // get all the config needed to perform this action
            const eventNameFnsMap = getEventNameFnsMap(globalConfig.on, moduleConfig.on, actionConfig.on);
            const modifyPayloadFnsMap = getModifyPayloadFnsMap(globalConfig.modifyPayloadOn, moduleConfig.modifyPayloadOn, actionConfig.modifyPayloadOn);
            const modifyReadResponseMap = getModifyReadResponseFnsMap(globalConfig.modifyReadResponseOn, moduleConfig.modifyReadResponseOn, actionConfig.modifyReadResponseOn);
            const storesToExecute = actionConfig.executionOrder ||
                (moduleConfig.executionOrder || {})['stream'] ||
                (moduleConfig.executionOrder || {})[actionType] ||
                (globalConfig.executionOrder || {})['stream'] ||
                (globalConfig.executionOrder || {})[actionType] ||
                [];
            throwIfNoFnsToExecute(storesToExecute);
            // update the payload
            for (const modifyFn of modifyPayloadFnsMap['stream']) {
                payload = modifyFn(payload);
            }
            const streamInfoPerStore = {};
            const doOnStreamFns = {
                added: modifyReadResponseMap.added,
                modified: modifyReadResponseMap.modified,
                removed: modifyReadResponseMap.removed,
            };
            /**
             * this is what must be executed by a plugin store that implemented "stream" functionality
             */
            const mustExecuteOnRead = {
                added: (_payload, _meta) => executeOnFns(doOnStreamFns.added, _payload, [_meta]),
                modified: (_payload, _meta) => executeOnFns(doOnStreamFns.modified, _payload, [_meta]),
                removed: (_payload, _meta) => executeOnFns(doOnStreamFns.removed, _payload, [_meta]),
            };
            // handle and await each action in sequence
            for (const storeName of storesToExecute) {
                // find the action on the plugin
                const pluginAction = globalConfig.stores[storeName].actions['stream'];
                const pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeName);
                // the plugin action
                if (pluginAction) {
                    const result = yield handleStream({
                        collectionPath,
                        docId,
                        pluginModuleConfig,
                        pluginAction,
                        payload,
                        eventNameFnsMap,
                        actionName: 'stream',
                        storeName,
                        mustExecuteOnRead,
                    });
                    // if the plugin action for stream returns a "do on read" result
                    if (isDoOnStream(result)) {
                        // register the functions we received: result
                        for (const [doOn, doFn] of Object.entries(result)) {
                            if (doFn)
                                doOnStreamFns[doOn].push(doFn);
                        }
                    }
                    // if the plugin action for stream returns a "stream response" result
                    if (!isDoOnStream(result)) {
                        streamInfoPerStore[storeName] = result;
                    }
                }
            }
            throwOnIncompleteStreamResponses(streamInfoPerStore, doOnStreamFns);
            const streamPromises = Object.values(streamInfoPerStore).map(({ streaming }) => streaming);
            // create a function to unsubscribe from the stream of each store
            const unsubscribe = () => Object.values(streamInfoPerStore).forEach(({ stop }) => stop());
            const openStreamIdentifier = payload !== null && payload !== void 0 ? payload : {};
            openStreams.set(openStreamIdentifier, unsubscribe);
            // return all the stream promises as one promise
            return new Promise((resolve, reject) => {
                Promise.all(streamPromises)
                    // todo: why can I not just write then(resolve)
                    .then(() => resolve())
                    .catch(reject);
            });
        });
    };
}

function createCollectionWithContext([collectionPath, docId], moduleConfig, globalConfig, docFn, collectionFn, openStreams) {
    const id = collectionPath.split('/').slice(-1)[0];
    const path = collectionPath;
    const doc = (docId, _moduleConfig = {}) => {
        return docFn(`${path}/${docId}`, _moduleConfig);
    };
    const insert = handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'insert', actionNameTypeMap.get, docFn, collectionFn); //prettier-ignore
    const get = handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'get', actionNameTypeMap.get, docFn, collectionFn); //prettier-ignore
    const stream = handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, actionNameTypeMap.stream, openStreams); // prettier-ignore
    const actions = { stream, get, insert };
    // Every store will have its 'setupModule' function executed
    executeSetupModulePerStore(globalConfig.stores, [collectionPath, docId], moduleConfig);
    function where(fieldPath, operator, value) {
        const whereClause = [fieldPath, operator, value];
        const moduleConfigWithClause = mergeAnything.mergeAndConcat(moduleConfig, { where: [whereClause] });
        return collectionFn(path, moduleConfigWithClause);
    }
    function orderBy(fieldPath, direction = 'asc') {
        const orderByClause = [fieldPath, direction];
        const moduleConfigWithClause = mergeAnything.mergeAndConcat(moduleConfig, { orderBy: [orderByClause] });
        return collectionFn(path, moduleConfigWithClause);
    }
    function limit(limitCount) {
        return collectionFn(path, Object.assign(Object.assign({}, moduleConfig), { limit: limitCount }));
    }
    const queryFns = { where, orderBy, limit };
    const moduleInstance = Object.assign(Object.assign({ doc,
        id,
        path,
        openStreams }, actions), queryFns);
    /**
     * The data returned by the store specified as 'dataStoreName'
     */
    const dataProxyHandler = getDataProxyHandler([collectionPath, docId], moduleConfig, globalConfig);
    return new Proxy(moduleInstance, dataProxyHandler);
}

function createDocWithContext([collectionPath, docId], moduleConfig, globalConfig, docFn, collectionFn, openStreams) {
    const id = docId;
    const path = [collectionPath, docId].join('/');
    const collection = (collectionId, _moduleConfig = {}) => {
        return collectionFn(`${path}/${collectionId}`, _moduleConfig);
    };
    const actions = {
        insert: handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'insert', actionNameTypeMap.insert, docFn),
        merge: handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'merge', actionNameTypeMap.merge, docFn),
        assign: handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'assign', actionNameTypeMap.assign, docFn),
        replace: handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'replace', actionNameTypeMap.replace, docFn),
        deleteProp: handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'deleteProp', actionNameTypeMap.deleteProp, docFn),
        delete: handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'delete', actionNameTypeMap.delete, docFn),
        get: handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'get', actionNameTypeMap.get, docFn),
        stream: handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, actionNameTypeMap.stream, openStreams),
    };
    // Every store will have its 'setupModule' function executed
    executeSetupModulePerStore(globalConfig.stores, [collectionPath, docId], moduleConfig);
    const moduleInstance = Object.assign({ collection, id: id, path,
        openStreams }, actions);
    /**
     * The data returned by the store specified as 'dataStoreName'
     */
    const dataProxyHandler = getDataProxyHandler([collectionPath, docId], moduleConfig, globalConfig);
    return new Proxy(moduleInstance, dataProxyHandler);
}

function configWithDefaults(config) {
    const defaults = {
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
    const merged = mergeAnything.merge(defaults, config);
    return merged;
}
function VueSync(vueSyncConfig) {
    // the passed GlobalConfig is merged onto defaults
    const globalConfig = configWithDefaults(vueSyncConfig);
    /**
     * takes care of the caching instances of modules. Todo: double check memory leaks for when an instance isn't referenced anymore.
     */
    const moduleMap = new WeakMap(); // apply type upon get/set
    /**
     * the global storage for subscriptions
     */
    const streamSubscribtionMap = new Map(); // apply type upon get/set
    function getModuleInstance(modulePath, moduleConfig = {}, moduleType, docFn, collectionFn) {
        throwIfInvalidModulePath(modulePath, moduleType);
        const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath);
        // retrieved the cached instance
        const moduleIdentifier = { modulePath, moduleConfig };
        const _moduleMap = moduleMap;
        const cachedInstance = _moduleMap.get(moduleIdentifier);
        if (cachedInstance)
            return cachedInstance;
        // else create and cache a new instance
        // first create the stream subscribtion map for this module
        if (!streamSubscribtionMap.has(modulePath)) {
            streamSubscribtionMap.set(modulePath, new Map());
        }
        const openStreams = streamSubscribtionMap.get(modulePath);
        // then create the module instance
        const createInstanceWithContext = moduleType === 'doc' ? createDocWithContext : createCollectionWithContext;
        // @ts-ignore
        const moduleInstance = createInstanceWithContext([collectionPath, docId], moduleConfig, globalConfig, docFn, collectionFn, openStreams);
        moduleMap.set(moduleIdentifier, moduleInstance);
        return moduleInstance;
    }
    function collection(modulePath, moduleConfig = {}) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return getModuleInstance(modulePath, moduleConfig, 'collection', doc, collection); // prettier-ignore
    }
    function doc(modulePath, moduleConfig = {}) {
        return getModuleInstance(modulePath, moduleConfig, 'doc', doc, collection); // prettier-ignore
    }
    const instance = {
        globalConfig,
        collection: collection,
        doc: doc,
    };
    return instance;
}

exports.VueSync = VueSync;
exports.getCollectionPathDocIdEntry = getCollectionPathDocIdEntry;
exports.isCollectionModule = isCollectionModule;
exports.isDoOnGet = isDoOnGet;
exports.isDoOnStream = isDoOnStream;
exports.isDocModule = isDocModule;
exports.isGetResponse = isGetResponse;
