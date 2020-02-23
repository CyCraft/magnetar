'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var mergeAnything = require('merge-anything');
var isWhat = require('is-what');

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
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
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

var actionNameTypeMap = {
    get: 'read',
    stream: 'read',
    insert: 'write',
    merge: 'write',
    assign: 'write',
    replace: 'write',
    "delete": 'write',
};
function isVueSyncError(payload) {
    return isWhat.isAnyObject(payload) && 'payload' in payload && 'message' in payload;
}

function handleAction(args) {
    return __awaiter(this, void 0, void 0, function () {
        function abort() {
            abortExecution = true;
        }
        var pluginAction, pluginActionConfig, payload, on, onError, actionName, stopExecutionAfterAction, abortExecution, result, _a, _b, fn, eventResult, _c, e_1_1, error_1, _d, _e, fn, eventResult, _f, e_2_1, _g, _h, fn, eventResult, _j, e_3_1;
        var e_1, _k, e_2, _l, e_3, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    pluginAction = args.pluginAction, pluginActionConfig = args.pluginActionConfig, payload = args.payload, on = args.eventNameFnsMap, onError = args.onError, actionName = args.actionName, stopExecutionAfterAction = args.stopExecutionAfterAction;
                    abortExecution = false;
                    result = payload // the payload throughout the stages
                    ;
                    _o.label = 1;
                case 1:
                    _o.trys.push([1, 8, 9, 10]);
                    _a = __values(on.before), _b = _a.next();
                    _o.label = 2;
                case 2:
                    if (!!_b.done) return [3 /*break*/, 7];
                    fn = _b.value;
                    eventResult = fn({ payload: result, actionName: actionName, abort: abort });
                    if (!isWhat.isPromise(eventResult)) return [3 /*break*/, 4];
                    return [4 /*yield*/, eventResult];
                case 3:
                    _c = _o.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _c = eventResult;
                    _o.label = 5;
                case 5:
                    result = _c;
                    _o.label = 6;
                case 6:
                    _b = _a.next();
                    return [3 /*break*/, 2];
                case 7: return [3 /*break*/, 10];
                case 8:
                    e_1_1 = _o.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 10];
                case 9:
                    try {
                        if (_b && !_b.done && (_k = _a["return"])) _k.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 10:
                    // abort?
                    if (abortExecution) {
                        stopExecutionAfterAction();
                        return [2 /*return*/, result];
                    }
                    _o.label = 11;
                case 11:
                    _o.trys.push([11, 13, , 24]);
                    return [4 /*yield*/, pluginAction(result, pluginActionConfig)];
                case 12:
                    result = _o.sent();
                    return [3 /*break*/, 24];
                case 13:
                    error_1 = _o.sent();
                    if (!isVueSyncError(error_1))
                        throw new Error(error_1);
                    _o.label = 14;
                case 14:
                    _o.trys.push([14, 21, 22, 23]);
                    _d = __values(on.error), _e = _d.next();
                    _o.label = 15;
                case 15:
                    if (!!_e.done) return [3 /*break*/, 20];
                    fn = _e.value;
                    eventResult = fn({ payload: error_1.payload, actionName: actionName, abort: abort, error: error_1 });
                    if (!isWhat.isPromise(eventResult)) return [3 /*break*/, 17];
                    return [4 /*yield*/, eventResult];
                case 16:
                    _f = _o.sent();
                    return [3 /*break*/, 18];
                case 17:
                    _f = eventResult;
                    _o.label = 18;
                case 18:
                    result = _f;
                    _o.label = 19;
                case 19:
                    _e = _d.next();
                    return [3 /*break*/, 15];
                case 20: return [3 /*break*/, 23];
                case 21:
                    e_2_1 = _o.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 23];
                case 22:
                    try {
                        if (_e && !_e.done && (_l = _d["return"])) _l.call(_d);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 23:
                    // abort?
                    if (abortExecution || onError === 'stop') {
                        stopExecutionAfterAction();
                        throw error_1;
                    }
                    if (onError === 'revert') {
                        stopExecutionAfterAction('revert');
                        return [2 /*return*/, result];
                    }
                    return [3 /*break*/, 24];
                case 24:
                    _o.trys.push([24, 31, 32, 33]);
                    _g = __values(on.success), _h = _g.next();
                    _o.label = 25;
                case 25:
                    if (!!_h.done) return [3 /*break*/, 30];
                    fn = _h.value;
                    eventResult = fn({ payload: result, actionName: actionName, abort: abort });
                    if (!isWhat.isPromise(eventResult)) return [3 /*break*/, 27];
                    return [4 /*yield*/, eventResult];
                case 26:
                    _j = _o.sent();
                    return [3 /*break*/, 28];
                case 27:
                    _j = eventResult;
                    _o.label = 28;
                case 28:
                    result = _j;
                    _o.label = 29;
                case 29:
                    _h = _g.next();
                    return [3 /*break*/, 25];
                case 30: return [3 /*break*/, 33];
                case 31:
                    e_3_1 = _o.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 33];
                case 32:
                    try {
                        if (_h && !_h.done && (_m = _g["return"])) _m.call(_g);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 33:
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

// prettier-ignore
function eventFnsMapWithDefaults(eventNameFnsMap) {
    if (eventNameFnsMap === void 0) { eventNameFnsMap = {}; }
    return mergeAnything.merge({ before: [], success: [], error: [], revert: [] }, eventNameFnsMap);
}

function getEventFnsPerStore(globalConfig, moduleConfig, actionConfig) {
    var result = [globalConfig, moduleConfig, actionConfig].reduce(function (carry, configPartial) {
        var onPerStore = configPartial.on || {};
        Object.entries(onPerStore).forEach(function (_a) {
            var _b = __read(_a, 2), storeName = _b[0], eventFnMap = _b[1];
            if (!(storeName in carry))
                carry[storeName] = {};
            Object.entries(eventFnMap).forEach(function (_a) {
                var _b = __read(_a, 2), eventName = _b[0], eventFn = _b[1];
                if (!(eventName in carry[storeName]))
                    carry[storeName][eventName] = [];
                carry[storeName][eventName].push(eventFn);
            });
        }, {});
        return carry;
    }, {});
    return result;
}

function CreateModuleWithContext(moduleConfig, globalConfig) {
    function createActionHandler(actionName, actionType) {
        return function (payload, actionConfig) {
            if (actionConfig === void 0) { actionConfig = {}; }
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                /**
                 * The abort mechanism for the entire store chain. When executed in handleAction() it won't go to the next store in executionOrder.
                 *
                 */
                function stopExecutionAfterAction(trueOrRevert) {
                    if (trueOrRevert === void 0) { trueOrRevert = true; }
                    stopExecution = trueOrRevert;
                }
                var config, eventFnsPerStore, storesToExecute, stopExecution, result, _b, _c, _d, i, storeName, pluginAction, pluginActionConfig, _e, storesToRevert, storesToRevert_1, storesToRevert_1_1, storeToRevert, revertAction, eventNameFnsMap, _f, _g, fn, eventResult, _h, e_1_1, e_2_1, e_3_1;
                var e_3, _j, e_2, _k, e_1, _l;
                return __generator(this, function (_m) {
                    switch (_m.label) {
                        case 0:
                            config = mergeAnything.merge(globalConfig, moduleConfig, actionConfig);
                            eventFnsPerStore = getEventFnsPerStore(globalConfig, moduleConfig, actionConfig);
                            storesToExecute = config.executionOrder.insert || config.executionOrder[actionNameTypeMap.insert] || [];
                            if (storesToExecute.length === 0) {
                                throw new Error('None of your store plugins have implemented this function.');
                            }
                            stopExecution = false;
                            result = payload;
                            _m.label = 1;
                        case 1:
                            _m.trys.push([1, 26, 27, 28]);
                            _b = __values(storesToExecute.entries()), _c = _b.next();
                            _m.label = 2;
                        case 2:
                            if (!!_c.done) return [3 /*break*/, 25];
                            _d = __read(_c.value, 2), i = _d[0], storeName = _d[1];
                            pluginAction = globalConfig.stores[storeName].actions.insert;
                            pluginActionConfig = {
                                moduleType: moduleConfig.type,
                                moduleConfig: (_a = moduleConfig) === null || _a === void 0 ? void 0 : _a.configPerStore[storeName],
                            };
                            if (!!pluginAction) return [3 /*break*/, 3];
                            _e = result;
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, handleAction({
                                pluginAction: pluginAction,
                                pluginActionConfig: pluginActionConfig,
                                payload: result,
                                eventNameFnsMap: eventFnsMapWithDefaults(eventFnsPerStore[storeName]),
                                onError: config.onError,
                                actionName: actionName,
                                stopExecutionAfterAction: stopExecutionAfterAction,
                            })
                            // handle reverting
                        ];
                        case 4:
                            _e = _m.sent();
                            _m.label = 5;
                        case 5:
                            // the plugin action
                            result = _e;
                            if (!(stopExecution === 'revert')) return [3 /*break*/, 23];
                            storesToRevert = storesToExecute.slice(0, i);
                            storesToRevert.reverse();
                            _m.label = 6;
                        case 6:
                            _m.trys.push([6, 20, 21, 22]);
                            storesToRevert_1 = (e_2 = void 0, __values(storesToRevert)), storesToRevert_1_1 = storesToRevert_1.next();
                            _m.label = 7;
                        case 7:
                            if (!!storesToRevert_1_1.done) return [3 /*break*/, 19];
                            storeToRevert = storesToRevert_1_1.value;
                            revertAction = globalConfig.stores[storeToRevert].revert;
                            return [4 /*yield*/, revertAction(actionName, result, pluginActionConfig)
                                // revert eventFns
                            ];
                        case 8:
                            result = _m.sent();
                            eventNameFnsMap = eventFnsMapWithDefaults(eventFnsPerStore[storeToRevert]);
                            _m.label = 9;
                        case 9:
                            _m.trys.push([9, 16, 17, 18]);
                            _f = (e_1 = void 0, __values(eventNameFnsMap.revert)), _g = _f.next();
                            _m.label = 10;
                        case 10:
                            if (!!_g.done) return [3 /*break*/, 15];
                            fn = _g.value;
                            eventResult = fn({ payload: result, actionName: actionName });
                            if (!isWhat.isPromise(eventResult)) return [3 /*break*/, 12];
                            return [4 /*yield*/, eventResult];
                        case 11:
                            _h = _m.sent();
                            return [3 /*break*/, 13];
                        case 12:
                            _h = eventResult;
                            _m.label = 13;
                        case 13:
                            result = _h;
                            _m.label = 14;
                        case 14:
                            _g = _f.next();
                            return [3 /*break*/, 10];
                        case 15: return [3 /*break*/, 18];
                        case 16:
                            e_1_1 = _m.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 18];
                        case 17:
                            try {
                                if (_g && !_g.done && (_l = _f["return"])) _l.call(_f);
                            }
                            finally { if (e_1) throw e_1.error; }
                            return [7 /*endfinally*/];
                        case 18:
                            storesToRevert_1_1 = storesToRevert_1.next();
                            return [3 /*break*/, 7];
                        case 19: return [3 /*break*/, 22];
                        case 20:
                            e_2_1 = _m.sent();
                            e_2 = { error: e_2_1 };
                            return [3 /*break*/, 22];
                        case 21:
                            try {
                                if (storesToRevert_1_1 && !storesToRevert_1_1.done && (_k = storesToRevert_1["return"])) _k.call(storesToRevert_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                            return [7 /*endfinally*/];
                        case 22: 
                        // return result early to prevent going to the next store
                        return [2 /*return*/, result];
                        case 23:
                            // handle abortion
                            if (stopExecution === true) {
                                // return result early to prevent going to the next store
                                return [2 /*return*/, result];
                            }
                            _m.label = 24;
                        case 24:
                            _c = _b.next();
                            return [3 /*break*/, 2];
                        case 25: return [3 /*break*/, 28];
                        case 26:
                            e_3_1 = _m.sent();
                            e_3 = { error: e_3_1 };
                            return [3 /*break*/, 28];
                        case 27:
                            try {
                                if (_c && !_c.done && (_j = _b["return"])) _j.call(_b);
                            }
                            finally { if (e_3) throw e_3.error; }
                            return [7 /*endfinally*/];
                        case 28: return [2 /*return*/, result];
                    }
                });
            });
        };
    }
    var actions = Object.entries(actionNameTypeMap).reduce(function (carry, _a) {
        var _b = __read(_a, 2), actionName = _b[0], actionType = _b[1];
        carry[actionName] = createActionHandler(actionName);
        return carry;
    }, {});
    return __assign({}, actions);
}

function configWithDefaults(config) {
    var defaults = {
        executionOrder: {
            read: [],
            write: [],
        },
        onError: 'stop',
        on: {},
    };
    var merged = mergeAnything.merge(defaults, config);
    return merged;
}
function VueSync(vueSyncConfig) {
    // the passed VueSyncConfig is merged onto defaults
    var globalConfig = configWithDefaults(vueSyncConfig);
    var createModule = function (moduleConfig) {
        return CreateModuleWithContext(moduleConfig, globalConfig);
    };
    // const createModule: VueSyncInstance['createModule'] = moduleConfig =>
    //   CreateModuleWithContext(moduleConfig, globalConfig)
    var instance = {
        globalConfig: globalConfig,
        createModule: createModule,
    };
    return instance;
}

exports.VueSync = VueSync;
