var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import React from "react";
import { Store } from "./store";
export * from "./state";
export { action } from "./store";
var Varia = /** @class */ (function (_super) {
    __extends(Varia, _super);
    function Varia() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.store = _this.props.getStore();
        return _this;
    }
    Varia.prototype.componentDidMount = function () {
        var _this = this;
        var unsubscribe = this.store.subscribe(function (state) { return new Promise(function (resolve) { return _this.setState({ state: state }, resolve); }); }).unsubscribe;
        this.unsubscribe = unsubscribe;
    };
    Varia.prototype.componentWillUnmount = function () {
        this.unsubscribe && this.unsubscribe();
    };
    Varia.prototype.render = function () {
        return this.state
            ? this.props.render(this.state.state, this.store.update)
            : this.props.loader || null;
    };
    return Varia;
}(React.Component));
export { Varia };
export var makeApp = function (args) {
    var store = new Store(args.initialState, args.actions, args.reduce);
    return {
        Provider: function (_a) {
            var render = _a.render;
            return <Varia getStore={function () { return store; }} render={render}/>;
        },
        updateApp: store.update,
    };
};
export var make = function (args) { return function (props) { return (<Varia getStore={function () {
    return new Store(typeof args.initialState === "function"
        ? args.initialState(props)
        : args.initialState, args.actions, args.reduce);
}} render={function (state, update) { return args.render(props, state, update); }}/>); }; };
export var makeAsync = function (args) { return function (props) { return (<Varia getStore={function () {
    return new Store(args.getInitialState(props), args.actions, args.reduce);
}} render={function (state, update) { return args.render(props, state, update); }} loader={args.renderLoader && args.renderLoader(props)}/>); }; };
