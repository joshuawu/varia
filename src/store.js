var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
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
};
var Store = /** @class */ (function () {
    function Store(state, actions, reduce) {
        var _this = this;
        this.state = state;
        this.reduce = reduce;
        this.subscriptions = new Set();
        this.subscribe = function (sub) {
            _this.subscriptions.add(sub);
            var unsubscribe = function () { return _this.subscriptions.delete(sub); };
            if (isPromise(_this.state)) {
                return { unsubscribe: unsubscribe, promise: _this.state.then(sub) };
            }
            sub(_this.state);
            return { unsubscribe: unsubscribe };
        };
        this.verify(actions);
        this.update = mapObject(actions, function (action) { return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _this.dispatch(action.apply(undefined, args));
        }; });
    }
    Store.prototype.dispatch = function (action) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isPromise(this.state)) return [3 /*break*/, 2];
                        this.state = this.state.then(function (s) { return _this.reduce(s, action); });
                        return [4 /*yield*/, this.state.then(function (s) {
                                return Promise.all(Array.from(_this.subscriptions, function (sub) { return sub(s); }));
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.state = this.reduce(this.state, action);
                        this.subscriptions.forEach(function (sub) { return sub(_this.state); });
                        _a.label = 3;
                    case 3: return [2 /*return*/, this.state];
                }
            });
        });
    };
    Store.prototype.verify = function (actions) {
        Object.keys(actions).forEach(function (propKey) {
            var actionKey = actions[propKey]().key;
            if (propKey !== actionKey) {
                throw new Error("The property name \"" + propKey + "\" of the provided actions object does not match its " +
                    ("corresponding action key \"" + actionKey + "\"."));
            }
        });
    };
    return Store;
}());
export { Store };
export function action(key) {
    return function (opts) { return (opts ? { key: key, opts: opts } : { key: key }); };
}
function mapObject(obj, fn) {
    var ret = {};
    Object.keys(obj).forEach(function (key) {
        ret[key] = fn(obj[key]);
    });
    return ret;
}
var isPromise = function (value) {
    return "then" in value && typeof value.then === "function";
};
