'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

var actionNameTypeMap = {
    insert: 'write',
    merge: 'write',
    assign: 'write',
    get: 'read',
    stream: 'read',
};

function handleAction(args) {
    return __awaiter(this, void 0, void 0, function () {
        function abort() {
            abortExecution = true;
        }
        var pluginAction, payload, actionConfig, storeName, wasAborted, onPerStore, on, abortExecution, result, eventResult, _a, eventResult, _b, error_1, eventResult, _c, eventResult, _d, eventResult, _e, eventResult, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    pluginAction = args.pluginAction, payload = args.payload, actionConfig = args.actionConfig, storeName = args.storeName, wasAborted = args.wasAborted;
                    onPerStore = actionConfig.on;
                    on = onPerStore[storeName] || {};
                    abortExecution = false;
                    result = payload // the payload throughout the stages
                    ;
                    if (!on.before) return [3 /*break*/, 4];
                    eventResult = on.before({ payload: result, abort: abort });
                    if (!isWhat.isPromise(eventResult)) return [3 /*break*/, 2];
                    return [4 /*yield*/, eventResult];
                case 1:
                    _a = _g.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = eventResult;
                    _g.label = 3;
                case 3:
                    result = _a;
                    _g.label = 4;
                case 4:
                    if (!abortExecution) return [3 /*break*/, 9];
                    wasAborted();
                    if (!on.aborted) return [3 /*break*/, 8];
                    eventResult = on.aborted({ at: 'before', payload: result });
                    if (!isWhat.isPromise(eventResult)) return [3 /*break*/, 6];
                    return [4 /*yield*/, eventResult];
                case 5:
                    _b = _g.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _b = eventResult;
                    _g.label = 7;
                case 7:
                    result = _b;
                    _g.label = 8;
                case 8: return [2 /*return*/, result];
                case 9:
                    _g.trys.push([9, 11, , 21]);
                    return [4 /*yield*/, pluginAction(result)];
                case 10:
                    result = _g.sent();
                    return [3 /*break*/, 21];
                case 11:
                    error_1 = _g.sent();
                    if (!on.error) return [3 /*break*/, 15];
                    eventResult = on.error({ payload: result, abort: abort, error: error_1 });
                    if (!isWhat.isPromise(eventResult)) return [3 /*break*/, 13];
                    return [4 /*yield*/, eventResult];
                case 12:
                    _c = _g.sent();
                    return [3 /*break*/, 14];
                case 13:
                    _c = eventResult;
                    _g.label = 14;
                case 14:
                    result = _c;
                    _g.label = 15;
                case 15:
                    if (!abortExecution) return [3 /*break*/, 20];
                    wasAborted();
                    if (!on.aborted) return [3 /*break*/, 19];
                    eventResult = on.aborted({ at: 'error', payload: result });
                    if (!isWhat.isPromise(eventResult)) return [3 /*break*/, 17];
                    return [4 /*yield*/, eventResult];
                case 16:
                    _d = _g.sent();
                    return [3 /*break*/, 18];
                case 17:
                    _d = eventResult;
                    _g.label = 18;
                case 18:
                    result = _d;
                    _g.label = 19;
                case 19: return [2 /*return*/, result];
                case 20: return [3 /*break*/, 21];
                case 21:
                    if (!on.success) return [3 /*break*/, 25];
                    eventResult = on.success({ payload: result, abort: abort });
                    if (!isWhat.isPromise(eventResult)) return [3 /*break*/, 23];
                    return [4 /*yield*/, eventResult];
                case 22:
                    _e = _g.sent();
                    return [3 /*break*/, 24];
                case 23:
                    _e = eventResult;
                    _g.label = 24;
                case 24:
                    result = _e;
                    _g.label = 25;
                case 25:
                    if (!abortExecution) return [3 /*break*/, 30];
                    wasAborted();
                    if (!on.aborted) return [3 /*break*/, 29];
                    eventResult = on.aborted({ at: 'success', payload: result });
                    if (!isWhat.isPromise(eventResult)) return [3 /*break*/, 27];
                    return [4 /*yield*/, eventResult];
                case 26:
                    _f = _g.sent();
                    return [3 /*break*/, 28];
                case 27:
                    _f = eventResult;
                    _g.label = 28;
                case 28:
                    result = _f;
                    _g.label = 29;
                case 29: return [2 /*return*/, result];
                case 30: return [2 /*return*/, result];
            }
        });
    });
}

function CreateModuleWithContext(moduleConfig, vueSyncConfig) {
    var _this = this;
    var insert = function (payload, actionConfig) {
        if (actionConfig === void 0) { actionConfig = {}; }
        return __awaiter(_this, void 0, void 0, function () {
            function wasAborted() {
                abortExecution = true;
            }
            var storesToExecute, abortExecution, result, _i, storesToExecute_1, storeName, pluginAction, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        storesToExecute = vueSyncConfig.executionOrder.insert ||
                            vueSyncConfig.executionOrder[actionNameTypeMap.insert] ||
                            [];
                        if (storesToExecute.length === 0) {
                            throw new Error('None of your store plugins have implemented this function.');
                        }
                        abortExecution = false;
                        result = payload;
                        _i = 0, storesToExecute_1 = storesToExecute;
                        _b.label = 1;
                    case 1:
                        if (!(_i < storesToExecute_1.length)) return [3 /*break*/, 6];
                        storeName = storesToExecute_1[_i];
                        pluginAction = vueSyncConfig.stores[storeName].actions.insert;
                        if (!!pluginAction) return [3 /*break*/, 2];
                        _a = result;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, handleAction({
                            pluginAction: pluginAction,
                            payload: result,
                            actionConfig: actionConfig,
                            storeName: storeName,
                            wasAborted: wasAborted,
                        })];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        // the plugin action
                        result = _a;
                        if (abortExecution)
                            return [2 /*return*/, result];
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, result];
                }
            });
        });
    };
    return {
        insert: insert,
    };
}

function VueSync(vueSyncConfig) {
    var config = vueSyncConfig;
    var createModule = function (moduleConfig) {
        return CreateModuleWithContext(moduleConfig, vueSyncConfig);
    };
    return {
        config: config,
        createModule: createModule,
    };
}

exports.VueSync = VueSync;
