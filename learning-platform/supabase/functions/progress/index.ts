var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ajv/dist/compile/codegen/code.js
var require_code = __commonJS({
  "node_modules/ajv/dist/compile/codegen/code.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = void 0;
    var _CodeOrName = class {
    };
    exports._CodeOrName = _CodeOrName;
    exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    var Name = class extends _CodeOrName {
      constructor(s) {
        super();
        if (!exports.IDENTIFIER.test(s))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = s;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return false;
      }
      get names() {
        return { [this.str]: 1 };
      }
    };
    exports.Name = Name;
    var _Code = class extends _CodeOrName {
      constructor(code) {
        super();
        this._items = typeof code === "string" ? [code] : code;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return false;
        const item = this._items[0];
        return item === "" || item === '""';
      }
      get str() {
        var _a;
        return (_a = this._str) !== null && _a !== void 0 ? _a : this._str = this._items.reduce((s, c) => `${s}${c}`, "");
      }
      get names() {
        var _a;
        return (_a = this._names) !== null && _a !== void 0 ? _a : this._names = this._items.reduce((names, c) => {
          if (c instanceof Name)
            names[c.str] = (names[c.str] || 0) + 1;
          return names;
        }, {});
      }
    };
    exports._Code = _Code;
    exports.nil = new _Code("");
    function _(strs, ...args) {
      const code = [strs[0]];
      let i = 0;
      while (i < args.length) {
        addCodeArg(code, args[i]);
        code.push(strs[++i]);
      }
      return new _Code(code);
    }
    exports._ = _;
    var plus = new _Code("+");
    function str(strs, ...args) {
      const expr = [safeStringify(strs[0])];
      let i = 0;
      while (i < args.length) {
        expr.push(plus);
        addCodeArg(expr, args[i]);
        expr.push(plus, safeStringify(strs[++i]));
      }
      optimize(expr);
      return new _Code(expr);
    }
    exports.str = str;
    function addCodeArg(code, arg) {
      if (arg instanceof _Code)
        code.push(...arg._items);
      else if (arg instanceof Name)
        code.push(arg);
      else
        code.push(interpolate(arg));
    }
    exports.addCodeArg = addCodeArg;
    function optimize(expr) {
      let i = 1;
      while (i < expr.length - 1) {
        if (expr[i] === plus) {
          const res = mergeExprItems(expr[i - 1], expr[i + 1]);
          if (res !== void 0) {
            expr.splice(i - 1, 3, res);
            continue;
          }
          expr[i++] = "+";
        }
        i++;
      }
    }
    function mergeExprItems(a, b) {
      if (b === '""')
        return a;
      if (a === '""')
        return b;
      if (typeof a == "string") {
        if (b instanceof Name || a[a.length - 1] !== '"')
          return;
        if (typeof b != "string")
          return `${a.slice(0, -1)}${b}"`;
        if (b[0] === '"')
          return a.slice(0, -1) + b.slice(1);
        return;
      }
      if (typeof b == "string" && b[0] === '"' && !(a instanceof Name))
        return `"${a}${b.slice(1)}`;
      return;
    }
    function strConcat(c1, c2) {
      return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
    }
    exports.strConcat = strConcat;
    function interpolate(x) {
      return typeof x == "number" || typeof x == "boolean" || x === null ? x : safeStringify(Array.isArray(x) ? x.join(",") : x);
    }
    function stringify(x) {
      return new _Code(safeStringify(x));
    }
    exports.stringify = stringify;
    function safeStringify(x) {
      return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    exports.safeStringify = safeStringify;
    function getProperty(key) {
      return typeof key == "string" && exports.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _`[${key}]`;
    }
    exports.getProperty = getProperty;
    function getEsmExportName(key) {
      if (typeof key == "string" && exports.IDENTIFIER.test(key)) {
        return new _Code(`${key}`);
      }
      throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
    }
    exports.getEsmExportName = getEsmExportName;
    function regexpCode(rx) {
      return new _Code(rx.toString());
    }
    exports.regexpCode = regexpCode;
  }
});

// node_modules/ajv/dist/compile/codegen/scope.js
var require_scope = __commonJS({
  "node_modules/ajv/dist/compile/codegen/scope.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = void 0;
    var code_1 = require_code();
    var ValueError = class extends Error {
      constructor(name) {
        super(`CodeGen: "code" for ${name} not defined`);
        this.value = name.value;
      }
    };
    var UsedValueState;
    (function(UsedValueState2) {
      UsedValueState2[UsedValueState2["Started"] = 0] = "Started";
      UsedValueState2[UsedValueState2["Completed"] = 1] = "Completed";
    })(UsedValueState || (exports.UsedValueState = UsedValueState = {}));
    exports.varKinds = {
      const: new code_1.Name("const"),
      let: new code_1.Name("let"),
      var: new code_1.Name("var")
    };
    var Scope = class {
      constructor({ prefixes, parent } = {}) {
        this._names = {};
        this._prefixes = prefixes;
        this._parent = parent;
      }
      toName(nameOrPrefix) {
        return nameOrPrefix instanceof code_1.Name ? nameOrPrefix : this.name(nameOrPrefix);
      }
      name(prefix) {
        return new code_1.Name(this._newName(prefix));
      }
      _newName(prefix) {
        const ng = this._names[prefix] || this._nameGroup(prefix);
        return `${prefix}${ng.index++}`;
      }
      _nameGroup(prefix) {
        var _a, _b;
        if (((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) {
          throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
        }
        return this._names[prefix] = { prefix, index: 0 };
      }
    };
    exports.Scope = Scope;
    var ValueScopeName = class extends code_1.Name {
      constructor(prefix, nameStr) {
        super(nameStr);
        this.prefix = prefix;
      }
      setValue(value, { property, itemIndex }) {
        this.value = value;
        this.scopePath = (0, code_1._)`.${new code_1.Name(property)}[${itemIndex}]`;
      }
    };
    exports.ValueScopeName = ValueScopeName;
    var line = (0, code_1._)`\n`;
    var ValueScope = class extends Scope {
      constructor(opts) {
        super(opts);
        this._values = {};
        this._scope = opts.scope;
        this.opts = { ...opts, _n: opts.lines ? line : code_1.nil };
      }
      get() {
        return this._scope;
      }
      name(prefix) {
        return new ValueScopeName(prefix, this._newName(prefix));
      }
      value(nameOrPrefix, value) {
        var _a;
        if (value.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const name = this.toName(nameOrPrefix);
        const { prefix } = name;
        const valueKey = (_a = value.key) !== null && _a !== void 0 ? _a : value.ref;
        let vs = this._values[prefix];
        if (vs) {
          const _name = vs.get(valueKey);
          if (_name)
            return _name;
        } else {
          vs = this._values[prefix] = /* @__PURE__ */ new Map();
        }
        vs.set(valueKey, name);
        const s = this._scope[prefix] || (this._scope[prefix] = []);
        const itemIndex = s.length;
        s[itemIndex] = value.ref;
        name.setValue(value, { property: prefix, itemIndex });
        return name;
      }
      getValue(prefix, keyOrRef) {
        const vs = this._values[prefix];
        if (!vs)
          return;
        return vs.get(keyOrRef);
      }
      scopeRefs(scopeName, values = this._values) {
        return this._reduceValues(values, (name) => {
          if (name.scopePath === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return (0, code_1._)`${scopeName}${name.scopePath}`;
        });
      }
      scopeCode(values = this._values, usedValues, getCode) {
        return this._reduceValues(values, (name) => {
          if (name.value === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return name.value.code;
        }, usedValues, getCode);
      }
      _reduceValues(values, valueCode, usedValues = {}, getCode) {
        let code = code_1.nil;
        for (const prefix in values) {
          const vs = values[prefix];
          if (!vs)
            continue;
          const nameSet = usedValues[prefix] = usedValues[prefix] || /* @__PURE__ */ new Map();
          vs.forEach((name) => {
            if (nameSet.has(name))
              return;
            nameSet.set(name, UsedValueState.Started);
            let c = valueCode(name);
            if (c) {
              const def = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
              code = (0, code_1._)`${code}${def} ${name} = ${c};${this.opts._n}`;
            } else if (c = getCode === null || getCode === void 0 ? void 0 : getCode(name)) {
              code = (0, code_1._)`${code}${c}${this.opts._n}`;
            } else {
              throw new ValueError(name);
            }
            nameSet.set(name, UsedValueState.Completed);
          });
        }
        return code;
      }
    };
    exports.ValueScope = ValueScope;
  }
});

// node_modules/ajv/dist/compile/codegen/index.js
var require_codegen = __commonJS({
  "node_modules/ajv/dist/compile/codegen/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;
    var code_1 = require_code();
    var scope_1 = require_scope();
    var code_2 = require_code();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return code_2._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return code_2.str;
    } });
    Object.defineProperty(exports, "strConcat", { enumerable: true, get: function() {
      return code_2.strConcat;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return code_2.nil;
    } });
    Object.defineProperty(exports, "getProperty", { enumerable: true, get: function() {
      return code_2.getProperty;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return code_2.stringify;
    } });
    Object.defineProperty(exports, "regexpCode", { enumerable: true, get: function() {
      return code_2.regexpCode;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return code_2.Name;
    } });
    var scope_2 = require_scope();
    Object.defineProperty(exports, "Scope", { enumerable: true, get: function() {
      return scope_2.Scope;
    } });
    Object.defineProperty(exports, "ValueScope", { enumerable: true, get: function() {
      return scope_2.ValueScope;
    } });
    Object.defineProperty(exports, "ValueScopeName", { enumerable: true, get: function() {
      return scope_2.ValueScopeName;
    } });
    Object.defineProperty(exports, "varKinds", { enumerable: true, get: function() {
      return scope_2.varKinds;
    } });
    exports.operators = {
      GT: new code_1._Code(">"),
      GTE: new code_1._Code(">="),
      LT: new code_1._Code("<"),
      LTE: new code_1._Code("<="),
      EQ: new code_1._Code("==="),
      NEQ: new code_1._Code("!=="),
      NOT: new code_1._Code("!"),
      OR: new code_1._Code("||"),
      AND: new code_1._Code("&&"),
      ADD: new code_1._Code("+")
    };
    var Node = class {
      optimizeNodes() {
        return this;
      }
      optimizeNames(_names, _constants) {
        return this;
      }
    };
    var Def = class extends Node {
      constructor(varKind, name, rhs) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.rhs = rhs;
      }
      render({ es5, _n }) {
        const varKind = es5 ? scope_1.varKinds.var : this.varKind;
        const rhs = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${varKind} ${this.name}${rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (!names[this.name.str])
          return;
        if (this.rhs)
          this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        return this.rhs instanceof code_1._CodeOrName ? this.rhs.names : {};
      }
    };
    var Assign = class extends Node {
      constructor(lhs, rhs, sideEffects) {
        super();
        this.lhs = lhs;
        this.rhs = rhs;
        this.sideEffects = sideEffects;
      }
      render({ _n }) {
        return `${this.lhs} = ${this.rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (this.lhs instanceof code_1.Name && !names[this.lhs.str] && !this.sideEffects)
          return;
        this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        const names = this.lhs instanceof code_1.Name ? {} : { ...this.lhs.names };
        return addExprNames(names, this.rhs);
      }
    };
    var AssignOp = class extends Assign {
      constructor(lhs, op, rhs, sideEffects) {
        super(lhs, rhs, sideEffects);
        this.op = op;
      }
      render({ _n }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
      }
    };
    var Label = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        return `${this.label}:` + _n;
      }
    };
    var Break = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        const label = this.label ? ` ${this.label}` : "";
        return `break${label};` + _n;
      }
    };
    var Throw = class extends Node {
      constructor(error) {
        super();
        this.error = error;
      }
      render({ _n }) {
        return `throw ${this.error};` + _n;
      }
      get names() {
        return this.error.names;
      }
    };
    var AnyCode = class extends Node {
      constructor(code) {
        super();
        this.code = code;
      }
      render({ _n }) {
        return `${this.code};` + _n;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(names, constants) {
        this.code = optimizeExpr(this.code, names, constants);
        return this;
      }
      get names() {
        return this.code instanceof code_1._CodeOrName ? this.code.names : {};
      }
    };
    var ParentNode = class extends Node {
      constructor(nodes = []) {
        super();
        this.nodes = nodes;
      }
      render(opts) {
        return this.nodes.reduce((code, n) => code + n.render(opts), "");
      }
      optimizeNodes() {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i].optimizeNodes();
          if (Array.isArray(n))
            nodes.splice(i, 1, ...n);
          else if (n)
            nodes[i] = n;
          else
            nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      optimizeNames(names, constants) {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i];
          if (n.optimizeNames(names, constants))
            continue;
          subtractNames(names, n.names);
          nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((names, n) => addNames(names, n.names), {});
      }
    };
    var BlockNode = class extends ParentNode {
      render(opts) {
        return "{" + opts._n + super.render(opts) + "}" + opts._n;
      }
    };
    var Root = class extends ParentNode {
    };
    var Else = class extends BlockNode {
    };
    Else.kind = "else";
    var If = class _If extends BlockNode {
      constructor(condition, nodes) {
        super(nodes);
        this.condition = condition;
      }
      render(opts) {
        let code = `if(${this.condition})` + super.render(opts);
        if (this.else)
          code += "else " + this.else.render(opts);
        return code;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const cond = this.condition;
        if (cond === true)
          return this.nodes;
        let e = this.else;
        if (e) {
          const ns = e.optimizeNodes();
          e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
        }
        if (e) {
          if (cond === false)
            return e instanceof _If ? e : e.nodes;
          if (this.nodes.length)
            return this;
          return new _If(not(cond), e instanceof _If ? [e] : e.nodes);
        }
        if (cond === false || !this.nodes.length)
          return void 0;
        return this;
      }
      optimizeNames(names, constants) {
        var _a;
        this.else = (_a = this.else) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        if (!(super.optimizeNames(names, constants) || this.else))
          return;
        this.condition = optimizeExpr(this.condition, names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        addExprNames(names, this.condition);
        if (this.else)
          addNames(names, this.else.names);
        return names;
      }
    };
    If.kind = "if";
    var For = class extends BlockNode {
    };
    For.kind = "for";
    var ForLoop = class extends For {
      constructor(iteration) {
        super();
        this.iteration = iteration;
      }
      render(opts) {
        return `for(${this.iteration})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iteration = optimizeExpr(this.iteration, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iteration.names);
      }
    };
    var ForRange = class extends For {
      constructor(varKind, name, from, to) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.from = from;
        this.to = to;
      }
      render(opts) {
        const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
        const { name, from, to } = this;
        return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
      }
      get names() {
        const names = addExprNames(super.names, this.from);
        return addExprNames(names, this.to);
      }
    };
    var ForIter = class extends For {
      constructor(loop, varKind, name, iterable) {
        super();
        this.loop = loop;
        this.varKind = varKind;
        this.name = name;
        this.iterable = iterable;
      }
      render(opts) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iterable = optimizeExpr(this.iterable, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iterable.names);
      }
    };
    var Func = class extends BlockNode {
      constructor(name, args, async) {
        super();
        this.name = name;
        this.args = args;
        this.async = async;
      }
      render(opts) {
        const _async = this.async ? "async " : "";
        return `${_async}function ${this.name}(${this.args})` + super.render(opts);
      }
    };
    Func.kind = "func";
    var Return = class extends ParentNode {
      render(opts) {
        return "return " + super.render(opts);
      }
    };
    Return.kind = "return";
    var Try = class extends BlockNode {
      render(opts) {
        let code = "try" + super.render(opts);
        if (this.catch)
          code += this.catch.render(opts);
        if (this.finally)
          code += this.finally.render(opts);
        return code;
      }
      optimizeNodes() {
        var _a, _b;
        super.optimizeNodes();
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNodes();
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
        return this;
      }
      optimizeNames(names, constants) {
        var _a, _b;
        super.optimizeNames(names, constants);
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNames(names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        if (this.catch)
          addNames(names, this.catch.names);
        if (this.finally)
          addNames(names, this.finally.names);
        return names;
      }
    };
    var Catch = class extends BlockNode {
      constructor(error) {
        super();
        this.error = error;
      }
      render(opts) {
        return `catch(${this.error})` + super.render(opts);
      }
    };
    Catch.kind = "catch";
    var Finally = class extends BlockNode {
      render(opts) {
        return "finally" + super.render(opts);
      }
    };
    Finally.kind = "finally";
    var CodeGen = class {
      constructor(extScope, opts = {}) {
        this._values = {};
        this._blockStarts = [];
        this._constants = {};
        this.opts = { ...opts, _n: opts.lines ? "\n" : "" };
        this._extScope = extScope;
        this._scope = new scope_1.Scope({ parent: extScope });
        this._nodes = [new Root()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(prefix) {
        return this._scope.name(prefix);
      }
      // reserves unique name in the external scope
      scopeName(prefix) {
        return this._extScope.name(prefix);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(prefixOrName, value) {
        const name = this._extScope.value(prefixOrName, value);
        const vs = this._values[name.prefix] || (this._values[name.prefix] = /* @__PURE__ */ new Set());
        vs.add(name);
        return name;
      }
      getScopeValue(prefix, keyOrRef) {
        return this._extScope.getValue(prefix, keyOrRef);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(scopeName) {
        return this._extScope.scopeRefs(scopeName, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(varKind, nameOrPrefix, rhs, constant2) {
        const name = this._scope.toName(nameOrPrefix);
        if (rhs !== void 0 && constant2)
          this._constants[name.str] = rhs;
        this._leafNode(new Def(varKind, name, rhs));
        return name;
      }
      // `const` declaration (`var` in es5 mode)
      const(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
      }
      // `var` declaration with optional assignment
      var(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
      }
      // assignment code
      assign(lhs, rhs, sideEffects) {
        return this._leafNode(new Assign(lhs, rhs, sideEffects));
      }
      // `+=` code
      add(lhs, rhs) {
        return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
      }
      // appends passed SafeExpr to code or executes Block
      code(c) {
        if (typeof c == "function")
          c();
        else if (c !== code_1.nil)
          this._leafNode(new AnyCode(c));
        return this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...keyValues) {
        const code = ["{"];
        for (const [key, value] of keyValues) {
          if (code.length > 1)
            code.push(",");
          code.push(key);
          if (key !== value || this.opts.es5) {
            code.push(":");
            (0, code_1.addCodeArg)(code, value);
          }
        }
        code.push("}");
        return new code_1._Code(code);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(condition, thenBody, elseBody) {
        this._blockNode(new If(condition));
        if (thenBody && elseBody) {
          this.code(thenBody).else().code(elseBody).endIf();
        } else if (thenBody) {
          this.code(thenBody).endIf();
        } else if (elseBody) {
          throw new Error('CodeGen: "else" body without "then" body');
        }
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(condition) {
        return this._elseNode(new If(condition));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new Else());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(If, Else);
      }
      _for(node, forBody) {
        this._blockNode(node);
        if (forBody)
          this.code(forBody).endFor();
        return this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(iteration, forBody) {
        return this._for(new ForLoop(iteration), forBody);
      }
      // `for` statement for a range of values
      forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
        const name = this._scope.toName(nameOrPrefix);
        if (this.opts.es5) {
          const arr = iterable instanceof code_1.Name ? iterable : this.var("_arr", iterable);
          return this.forRange("_i", 0, (0, code_1._)`${arr}.length`, (i) => {
            this.var(name, (0, code_1._)`${arr}[${i}]`);
            forBody(name);
          });
        }
        return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
        if (this.opts.ownProperties) {
          return this.forOf(nameOrPrefix, (0, code_1._)`Object.keys(${obj})`, forBody);
        }
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(For);
      }
      // `label` statement
      label(label) {
        return this._leafNode(new Label(label));
      }
      // `break` statement
      break(label) {
        return this._leafNode(new Break(label));
      }
      // `return` statement
      return(value) {
        const node = new Return();
        this._blockNode(node);
        this.code(value);
        if (node.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(Return);
      }
      // `try` statement
      try(tryBody, catchCode, finallyCode) {
        if (!catchCode && !finallyCode)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const node = new Try();
        this._blockNode(node);
        this.code(tryBody);
        if (catchCode) {
          const error = this.name("e");
          this._currNode = node.catch = new Catch(error);
          catchCode(error);
        }
        if (finallyCode) {
          this._currNode = node.finally = new Finally();
          this.code(finallyCode);
        }
        return this._endBlockNode(Catch, Finally);
      }
      // `throw` statement
      throw(error) {
        return this._leafNode(new Throw(error));
      }
      // start self-balancing block
      block(body, nodeCount) {
        this._blockStarts.push(this._nodes.length);
        if (body)
          this.code(body).endBlock(nodeCount);
        return this;
      }
      // end the current self-balancing block
      endBlock(nodeCount) {
        const len = this._blockStarts.pop();
        if (len === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const toClose = this._nodes.length - len;
        if (toClose < 0 || nodeCount !== void 0 && toClose !== nodeCount) {
          throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
        }
        this._nodes.length = len;
        return this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(name, args = code_1.nil, async, funcBody) {
        this._blockNode(new Func(name, args, async));
        if (funcBody)
          this.code(funcBody).endFunc();
        return this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(Func);
      }
      optimize(n = 1) {
        while (n-- > 0) {
          this._root.optimizeNodes();
          this._root.optimizeNames(this._root.names, this._constants);
        }
      }
      _leafNode(node) {
        this._currNode.nodes.push(node);
        return this;
      }
      _blockNode(node) {
        this._currNode.nodes.push(node);
        this._nodes.push(node);
      }
      _endBlockNode(N1, N2) {
        const n = this._currNode;
        if (n instanceof N1 || N2 && n instanceof N2) {
          this._nodes.pop();
          return this;
        }
        throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
      }
      _elseNode(node) {
        const n = this._currNode;
        if (!(n instanceof If)) {
          throw new Error('CodeGen: "else" without "if"');
        }
        this._currNode = n.else = node;
        return this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const ns = this._nodes;
        return ns[ns.length - 1];
      }
      set _currNode(node) {
        const ns = this._nodes;
        ns[ns.length - 1] = node;
      }
    };
    exports.CodeGen = CodeGen;
    function addNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) + (from[n] || 0);
      return names;
    }
    function addExprNames(names, from) {
      return from instanceof code_1._CodeOrName ? addNames(names, from.names) : names;
    }
    function optimizeExpr(expr, names, constants) {
      if (expr instanceof code_1.Name)
        return replaceName(expr);
      if (!canOptimize(expr))
        return expr;
      return new code_1._Code(expr._items.reduce((items, c) => {
        if (c instanceof code_1.Name)
          c = replaceName(c);
        if (c instanceof code_1._Code)
          items.push(...c._items);
        else
          items.push(c);
        return items;
      }, []));
      function replaceName(n) {
        const c = constants[n.str];
        if (c === void 0 || names[n.str] !== 1)
          return n;
        delete names[n.str];
        return c;
      }
      function canOptimize(e) {
        return e instanceof code_1._Code && e._items.some((c) => c instanceof code_1.Name && names[c.str] === 1 && constants[c.str] !== void 0);
      }
    }
    function subtractNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) - (from[n] || 0);
    }
    function not(x) {
      return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_1._)`!${par(x)}`;
    }
    exports.not = not;
    var andCode = mappend(exports.operators.AND);
    function and(...args) {
      return args.reduce(andCode);
    }
    exports.and = and;
    var orCode = mappend(exports.operators.OR);
    function or(...args) {
      return args.reduce(orCode);
    }
    exports.or = or;
    function mappend(op) {
      return (x, y) => x === code_1.nil ? y : y === code_1.nil ? x : (0, code_1._)`${par(x)} ${op} ${par(y)}`;
    }
    function par(x) {
      return x instanceof code_1.Name ? x : (0, code_1._)`(${x})`;
    }
  }
});

// node_modules/ajv/dist/compile/util.js
var require_util = __commonJS({
  "node_modules/ajv/dist/compile/util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkStrictMode = exports.getErrorPath = exports.Type = exports.useFunc = exports.setEvaluated = exports.evaluatedPropsToName = exports.mergeEvaluated = exports.eachItem = exports.unescapeJsonPointer = exports.escapeJsonPointer = exports.escapeFragment = exports.unescapeFragment = exports.schemaRefOrVal = exports.schemaHasRulesButRef = exports.schemaHasRules = exports.checkUnknownRules = exports.alwaysValidSchema = exports.toHash = void 0;
    var codegen_1 = require_codegen();
    var code_1 = require_code();
    function toHash(arr) {
      const hash = {};
      for (const item of arr)
        hash[item] = true;
      return hash;
    }
    exports.toHash = toHash;
    function alwaysValidSchema(it, schema) {
      if (typeof schema == "boolean")
        return schema;
      if (Object.keys(schema).length === 0)
        return true;
      checkUnknownRules(it, schema);
      return !schemaHasRules(schema, it.self.RULES.all);
    }
    exports.alwaysValidSchema = alwaysValidSchema;
    function checkUnknownRules(it, schema = it.schema) {
      const { opts, self } = it;
      if (!opts.strictSchema)
        return;
      if (typeof schema === "boolean")
        return;
      const rules = self.RULES.keywords;
      for (const key in schema) {
        if (!rules[key])
          checkStrictMode(it, `unknown keyword: "${key}"`);
      }
    }
    exports.checkUnknownRules = checkUnknownRules;
    function schemaHasRules(schema, rules) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (rules[key])
          return true;
      return false;
    }
    exports.schemaHasRules = schemaHasRules;
    function schemaHasRulesButRef(schema, RULES) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (key !== "$ref" && RULES.all[key])
          return true;
      return false;
    }
    exports.schemaHasRulesButRef = schemaHasRulesButRef;
    function schemaRefOrVal({ topSchemaRef, schemaPath }, schema, keyword, $data) {
      if (!$data) {
        if (typeof schema == "number" || typeof schema == "boolean")
          return schema;
        if (typeof schema == "string")
          return (0, codegen_1._)`${schema}`;
      }
      return (0, codegen_1._)`${topSchemaRef}${schemaPath}${(0, codegen_1.getProperty)(keyword)}`;
    }
    exports.schemaRefOrVal = schemaRefOrVal;
    function unescapeFragment(str) {
      return unescapeJsonPointer(decodeURIComponent(str));
    }
    exports.unescapeFragment = unescapeFragment;
    function escapeFragment(str) {
      return encodeURIComponent(escapeJsonPointer(str));
    }
    exports.escapeFragment = escapeFragment;
    function escapeJsonPointer(str) {
      if (typeof str == "number")
        return `${str}`;
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    exports.escapeJsonPointer = escapeJsonPointer;
    function unescapeJsonPointer(str) {
      return str.replace(/~1/g, "/").replace(/~0/g, "~");
    }
    exports.unescapeJsonPointer = unescapeJsonPointer;
    function eachItem(xs, f) {
      if (Array.isArray(xs)) {
        for (const x of xs)
          f(x);
      } else {
        f(xs);
      }
    }
    exports.eachItem = eachItem;
    function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues, resultToName }) {
      return (gen, from, to, toName) => {
        const res = to === void 0 ? from : to instanceof codegen_1.Name ? (from instanceof codegen_1.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
        return toName === codegen_1.Name && !(res instanceof codegen_1.Name) ? resultToName(gen, res) : res;
      };
    }
    exports.mergeEvaluated = {
      props: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => {
          gen.if((0, codegen_1._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1._)`${to} || {}`).code((0, codegen_1._)`Object.assign(${to}, ${from})`));
        }),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => {
          if (from === true) {
            gen.assign(to, true);
          } else {
            gen.assign(to, (0, codegen_1._)`${to} || {}`);
            setEvaluated(gen, to, from);
          }
        }),
        mergeValues: (from, to) => from === true ? true : { ...from, ...to },
        resultToName: evaluatedPropsToName
      }),
      items: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1._)`${to} > ${from} ? ${to} : ${from}`)),
        mergeValues: (from, to) => from === true ? true : Math.max(from, to),
        resultToName: (gen, items) => gen.var("items", items)
      })
    };
    function evaluatedPropsToName(gen, ps) {
      if (ps === true)
        return gen.var("props", true);
      const props = gen.var("props", (0, codegen_1._)`{}`);
      if (ps !== void 0)
        setEvaluated(gen, props, ps);
      return props;
    }
    exports.evaluatedPropsToName = evaluatedPropsToName;
    function setEvaluated(gen, props, ps) {
      Object.keys(ps).forEach((p2) => gen.assign((0, codegen_1._)`${props}${(0, codegen_1.getProperty)(p2)}`, true));
    }
    exports.setEvaluated = setEvaluated;
    var snippets = {};
    function useFunc(gen, f) {
      return gen.scopeValue("func", {
        ref: f,
        code: snippets[f.code] || (snippets[f.code] = new code_1._Code(f.code))
      });
    }
    exports.useFunc = useFunc;
    var Type;
    (function(Type2) {
      Type2[Type2["Num"] = 0] = "Num";
      Type2[Type2["Str"] = 1] = "Str";
    })(Type || (exports.Type = Type = {}));
    function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
      if (dataProp instanceof codegen_1.Name) {
        const isNumber = dataPropType === Type.Num;
        return jsPropertySyntax ? isNumber ? (0, codegen_1._)`"[" + ${dataProp} + "]"` : (0, codegen_1._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1._)`"/" + ${dataProp}` : (0, codegen_1._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
      }
      return jsPropertySyntax ? (0, codegen_1.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
    }
    exports.getErrorPath = getErrorPath;
    function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
      if (!mode)
        return;
      msg = `strict mode: ${msg}`;
      if (mode === true)
        throw new Error(msg);
      it.self.logger.warn(msg);
    }
    exports.checkStrictMode = checkStrictMode;
  }
});

// node_modules/ajv/dist/compile/names.js
var require_names = __commonJS({
  "node_modules/ajv/dist/compile/names.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var names = {
      // validation function arguments
      data: new codegen_1.Name("data"),
      // data passed to validation function
      // args passed from referencing schema
      valCxt: new codegen_1.Name("valCxt"),
      // validation/data context - should not be used directly, it is destructured to the names below
      instancePath: new codegen_1.Name("instancePath"),
      parentData: new codegen_1.Name("parentData"),
      parentDataProperty: new codegen_1.Name("parentDataProperty"),
      rootData: new codegen_1.Name("rootData"),
      // root data - same as the data passed to the first/top validation function
      dynamicAnchors: new codegen_1.Name("dynamicAnchors"),
      // used to support recursiveRef and dynamicRef
      // function scoped variables
      vErrors: new codegen_1.Name("vErrors"),
      // null or array of validation errors
      errors: new codegen_1.Name("errors"),
      // counter of validation errors
      this: new codegen_1.Name("this"),
      // "globals"
      self: new codegen_1.Name("self"),
      scope: new codegen_1.Name("scope"),
      // JTD serialize/parse name for JSON string and position
      json: new codegen_1.Name("json"),
      jsonPos: new codegen_1.Name("jsonPos"),
      jsonLen: new codegen_1.Name("jsonLen"),
      jsonPart: new codegen_1.Name("jsonPart")
    };
    exports.default = names;
  }
});

// node_modules/ajv/dist/compile/errors.js
var require_errors = __commonJS({
  "node_modules/ajv/dist/compile/errors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    exports.keywordError = {
      message: ({ keyword }) => (0, codegen_1.str)`must pass "${keyword}" keyword validation`
    };
    exports.keyword$DataError = {
      message: ({ keyword, schemaType }) => schemaType ? (0, codegen_1.str)`"${keyword}" keyword must be ${schemaType} ($data)` : (0, codegen_1.str)`"${keyword}" keyword is invalid ($data)`
    };
    function reportError(cxt, error = exports.keywordError, errorPaths, overrideAllErrors) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error, errorPaths);
      if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : compositeRule || allErrors) {
        addError(gen, errObj);
      } else {
        returnErrors(it, (0, codegen_1._)`[${errObj}]`);
      }
    }
    exports.reportError = reportError;
    function reportExtraError(cxt, error = exports.keywordError, errorPaths) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error, errorPaths);
      addError(gen, errObj);
      if (!(compositeRule || allErrors)) {
        returnErrors(it, names_1.default.vErrors);
      }
    }
    exports.reportExtraError = reportExtraError;
    function resetErrorsCount(gen, errsCount) {
      gen.assign(names_1.default.errors, errsCount);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_1._)`${names_1.default.vErrors}.length`, errsCount), () => gen.assign(names_1.default.vErrors, null)));
    }
    exports.resetErrorsCount = resetErrorsCount;
    function extendErrors({ gen, keyword, schemaValue, data, errsCount, it }) {
      if (errsCount === void 0)
        throw new Error("ajv implementation error");
      const err = gen.name("err");
      gen.forRange("i", errsCount, names_1.default.errors, (i) => {
        gen.const(err, (0, codegen_1._)`${names_1.default.vErrors}[${i}]`);
        gen.if((0, codegen_1._)`${err}.instancePath === undefined`, () => gen.assign((0, codegen_1._)`${err}.instancePath`, (0, codegen_1.strConcat)(names_1.default.instancePath, it.errorPath)));
        gen.assign((0, codegen_1._)`${err}.schemaPath`, (0, codegen_1.str)`${it.errSchemaPath}/${keyword}`);
        if (it.opts.verbose) {
          gen.assign((0, codegen_1._)`${err}.schema`, schemaValue);
          gen.assign((0, codegen_1._)`${err}.data`, data);
        }
      });
    }
    exports.extendErrors = extendErrors;
    function addError(gen, errObj) {
      const err = gen.const("err", errObj);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} === null`, () => gen.assign(names_1.default.vErrors, (0, codegen_1._)`[${err}]`), (0, codegen_1._)`${names_1.default.vErrors}.push(${err})`);
      gen.code((0, codegen_1._)`${names_1.default.errors}++`);
    }
    function returnErrors(it, errs) {
      const { gen, validateName, schemaEnv } = it;
      if (schemaEnv.$async) {
        gen.throw((0, codegen_1._)`new ${it.ValidationError}(${errs})`);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, errs);
        gen.return(false);
      }
    }
    var E = {
      keyword: new codegen_1.Name("keyword"),
      schemaPath: new codegen_1.Name("schemaPath"),
      // also used in JTD errors
      params: new codegen_1.Name("params"),
      propertyName: new codegen_1.Name("propertyName"),
      message: new codegen_1.Name("message"),
      schema: new codegen_1.Name("schema"),
      parentSchema: new codegen_1.Name("parentSchema")
    };
    function errorObjectCode(cxt, error, errorPaths) {
      const { createErrors } = cxt.it;
      if (createErrors === false)
        return (0, codegen_1._)`{}`;
      return errorObject(cxt, error, errorPaths);
    }
    function errorObject(cxt, error, errorPaths = {}) {
      const { gen, it } = cxt;
      const keyValues = [
        errorInstancePath(it, errorPaths),
        errorSchemaPath(cxt, errorPaths)
      ];
      extraErrorProps(cxt, error, keyValues);
      return gen.object(...keyValues);
    }
    function errorInstancePath({ errorPath }, { instancePath }) {
      const instPath = instancePath ? (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(instancePath, util_1.Type.Str)}` : errorPath;
      return [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, instPath)];
    }
    function errorSchemaPath({ keyword, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
      let schPath = parentSchema ? errSchemaPath : (0, codegen_1.str)`${errSchemaPath}/${keyword}`;
      if (schemaPath) {
        schPath = (0, codegen_1.str)`${schPath}${(0, util_1.getErrorPath)(schemaPath, util_1.Type.Str)}`;
      }
      return [E.schemaPath, schPath];
    }
    function extraErrorProps(cxt, { params, message }, keyValues) {
      const { keyword, data, schemaValue, it } = cxt;
      const { opts, propertyName, topSchemaRef, schemaPath } = it;
      keyValues.push([E.keyword, keyword], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_1._)`{}`]);
      if (opts.messages) {
        keyValues.push([E.message, typeof message == "function" ? message(cxt) : message]);
      }
      if (opts.verbose) {
        keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_1._)`${topSchemaRef}${schemaPath}`], [names_1.default.data, data]);
      }
      if (propertyName)
        keyValues.push([E.propertyName, propertyName]);
    }
  }
});

// node_modules/ajv/dist/compile/validate/boolSchema.js
var require_boolSchema = __commonJS({
  "node_modules/ajv/dist/compile/validate/boolSchema.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.boolOrEmptySchema = exports.topBoolOrEmptySchema = void 0;
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var boolError = {
      message: "boolean schema is false"
    };
    function topBoolOrEmptySchema(it) {
      const { gen, schema, validateName } = it;
      if (schema === false) {
        falseSchemaError(it, false);
      } else if (typeof schema == "object" && schema.$async === true) {
        gen.return(names_1.default.data);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, null);
        gen.return(true);
      }
    }
    exports.topBoolOrEmptySchema = topBoolOrEmptySchema;
    function boolOrEmptySchema(it, valid) {
      const { gen, schema } = it;
      if (schema === false) {
        gen.var(valid, false);
        falseSchemaError(it);
      } else {
        gen.var(valid, true);
      }
    }
    exports.boolOrEmptySchema = boolOrEmptySchema;
    function falseSchemaError(it, overrideAllErrors) {
      const { gen, data } = it;
      const cxt = {
        gen,
        keyword: "false schema",
        data,
        schema: false,
        schemaCode: false,
        schemaValue: false,
        params: {},
        it
      };
      (0, errors_1.reportError)(cxt, boolError, void 0, overrideAllErrors);
    }
  }
});

// node_modules/ajv/dist/compile/rules.js
var require_rules = __commonJS({
  "node_modules/ajv/dist/compile/rules.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRules = exports.isJSONType = void 0;
    var _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"];
    var jsonTypes = new Set(_jsonTypes);
    function isJSONType(x) {
      return typeof x == "string" && jsonTypes.has(x);
    }
    exports.isJSONType = isJSONType;
    function getRules() {
      const groups = {
        number: { type: "number", rules: [] },
        string: { type: "string", rules: [] },
        array: { type: "array", rules: [] },
        object: { type: "object", rules: [] }
      };
      return {
        types: { ...groups, integer: true, boolean: true, null: true },
        rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
        post: { rules: [] },
        all: {},
        keywords: {}
      };
    }
    exports.getRules = getRules;
  }
});

// node_modules/ajv/dist/compile/validate/applicability.js
var require_applicability = __commonJS({
  "node_modules/ajv/dist/compile/validate/applicability.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.shouldUseRule = exports.shouldUseGroup = exports.schemaHasRulesForType = void 0;
    function schemaHasRulesForType({ schema, self }, type) {
      const group = self.RULES.types[type];
      return group && group !== true && shouldUseGroup(schema, group);
    }
    exports.schemaHasRulesForType = schemaHasRulesForType;
    function shouldUseGroup(schema, group) {
      return group.rules.some((rule) => shouldUseRule(schema, rule));
    }
    exports.shouldUseGroup = shouldUseGroup;
    function shouldUseRule(schema, rule) {
      var _a;
      return schema[rule.keyword] !== void 0 || ((_a = rule.definition.implements) === null || _a === void 0 ? void 0 : _a.some((kwd) => schema[kwd] !== void 0));
    }
    exports.shouldUseRule = shouldUseRule;
  }
});

// node_modules/ajv/dist/compile/validate/dataType.js
var require_dataType = __commonJS({
  "node_modules/ajv/dist/compile/validate/dataType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reportTypeError = exports.checkDataTypes = exports.checkDataType = exports.coerceAndCheckDataType = exports.getJSONTypes = exports.getSchemaTypes = exports.DataType = void 0;
    var rules_1 = require_rules();
    var applicability_1 = require_applicability();
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var DataType;
    (function(DataType2) {
      DataType2[DataType2["Correct"] = 0] = "Correct";
      DataType2[DataType2["Wrong"] = 1] = "Wrong";
    })(DataType || (exports.DataType = DataType = {}));
    function getSchemaTypes(schema) {
      const types = getJSONTypes(schema.type);
      const hasNull = types.includes("null");
      if (hasNull) {
        if (schema.nullable === false)
          throw new Error("type: null contradicts nullable: false");
      } else {
        if (!types.length && schema.nullable !== void 0) {
          throw new Error('"nullable" cannot be used without "type"');
        }
        if (schema.nullable === true)
          types.push("null");
      }
      return types;
    }
    exports.getSchemaTypes = getSchemaTypes;
    function getJSONTypes(ts) {
      const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
      if (types.every(rules_1.isJSONType))
        return types;
      throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
    }
    exports.getJSONTypes = getJSONTypes;
    function coerceAndCheckDataType(it, types) {
      const { gen, data, opts } = it;
      const coerceTo = coerceToTypes(types, opts.coerceTypes);
      const checkTypes = types.length > 0 && !(coerceTo.length === 0 && types.length === 1 && (0, applicability_1.schemaHasRulesForType)(it, types[0]));
      if (checkTypes) {
        const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType.Wrong);
        gen.if(wrongType, () => {
          if (coerceTo.length)
            coerceData(it, types, coerceTo);
          else
            reportTypeError(it);
        });
      }
      return checkTypes;
    }
    exports.coerceAndCheckDataType = coerceAndCheckDataType;
    var COERCIBLE = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
    function coerceToTypes(types, coerceTypes) {
      return coerceTypes ? types.filter((t) => COERCIBLE.has(t) || coerceTypes === "array" && t === "array") : [];
    }
    function coerceData(it, types, coerceTo) {
      const { gen, data, opts } = it;
      const dataType = gen.let("dataType", (0, codegen_1._)`typeof ${data}`);
      const coerced = gen.let("coerced", (0, codegen_1._)`undefined`);
      if (opts.coerceTypes === "array") {
        gen.if((0, codegen_1._)`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1._)`${data}[0]`).assign(dataType, (0, codegen_1._)`typeof ${data}`).if(checkDataTypes(types, data, opts.strictNumbers), () => gen.assign(coerced, data)));
      }
      gen.if((0, codegen_1._)`${coerced} !== undefined`);
      for (const t of coerceTo) {
        if (COERCIBLE.has(t) || t === "array" && opts.coerceTypes === "array") {
          coerceSpecificType(t);
        }
      }
      gen.else();
      reportTypeError(it);
      gen.endIf();
      gen.if((0, codegen_1._)`${coerced} !== undefined`, () => {
        gen.assign(data, coerced);
        assignParentData(it, coerced);
      });
      function coerceSpecificType(t) {
        switch (t) {
          case "string":
            gen.elseIf((0, codegen_1._)`${dataType} == "number" || ${dataType} == "boolean"`).assign(coerced, (0, codegen_1._)`"" + ${data}`).elseIf((0, codegen_1._)`${data} === null`).assign(coerced, (0, codegen_1._)`""`);
            return;
          case "number":
            gen.elseIf((0, codegen_1._)`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "integer":
            gen.elseIf((0, codegen_1._)`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "boolean":
            gen.elseIf((0, codegen_1._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
            return;
          case "null":
            gen.elseIf((0, codegen_1._)`${data} === "" || ${data} === 0 || ${data} === false`);
            gen.assign(coerced, null);
            return;
          case "array":
            gen.elseIf((0, codegen_1._)`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1._)`[${data}]`);
        }
      }
    }
    function assignParentData({ gen, parentData, parentDataProperty }, expr) {
      gen.if((0, codegen_1._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1._)`${parentData}[${parentDataProperty}]`, expr));
    }
    function checkDataType(dataType, data, strictNums, correct = DataType.Correct) {
      const EQ = correct === DataType.Correct ? codegen_1.operators.EQ : codegen_1.operators.NEQ;
      let cond;
      switch (dataType) {
        case "null":
          return (0, codegen_1._)`${data} ${EQ} null`;
        case "array":
          cond = (0, codegen_1._)`Array.isArray(${data})`;
          break;
        case "object":
          cond = (0, codegen_1._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
          break;
        case "integer":
          cond = numCond((0, codegen_1._)`!(${data} % 1) && !isNaN(${data})`);
          break;
        case "number":
          cond = numCond();
          break;
        default:
          return (0, codegen_1._)`typeof ${data} ${EQ} ${dataType}`;
      }
      return correct === DataType.Correct ? cond : (0, codegen_1.not)(cond);
      function numCond(_cond = codegen_1.nil) {
        return (0, codegen_1.and)((0, codegen_1._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1._)`isFinite(${data})` : codegen_1.nil);
      }
    }
    exports.checkDataType = checkDataType;
    function checkDataTypes(dataTypes, data, strictNums, correct) {
      if (dataTypes.length === 1) {
        return checkDataType(dataTypes[0], data, strictNums, correct);
      }
      let cond;
      const types = (0, util_1.toHash)(dataTypes);
      if (types.array && types.object) {
        const notObj = (0, codegen_1._)`typeof ${data} != "object"`;
        cond = types.null ? notObj : (0, codegen_1._)`!${data} || ${notObj}`;
        delete types.null;
        delete types.array;
        delete types.object;
      } else {
        cond = codegen_1.nil;
      }
      if (types.number)
        delete types.integer;
      for (const t in types)
        cond = (0, codegen_1.and)(cond, checkDataType(t, data, strictNums, correct));
      return cond;
    }
    exports.checkDataTypes = checkDataTypes;
    var typeError = {
      message: ({ schema }) => `must be ${schema}`,
      params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1._)`{type: ${schema}}` : (0, codegen_1._)`{type: ${schemaValue}}`
    };
    function reportTypeError(it) {
      const cxt = getTypeErrorContext(it);
      (0, errors_1.reportError)(cxt, typeError);
    }
    exports.reportTypeError = reportTypeError;
    function getTypeErrorContext(it) {
      const { gen, data, schema } = it;
      const schemaCode = (0, util_1.schemaRefOrVal)(it, schema, "type");
      return {
        gen,
        keyword: "type",
        data,
        schema: schema.type,
        schemaCode,
        schemaValue: schemaCode,
        parentSchema: schema,
        params: {},
        it
      };
    }
  }
});

// node_modules/ajv/dist/compile/validate/defaults.js
var require_defaults = __commonJS({
  "node_modules/ajv/dist/compile/validate/defaults.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assignDefaults = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function assignDefaults(it, ty) {
      const { properties, items } = it.schema;
      if (ty === "object" && properties) {
        for (const key in properties) {
          assignDefault(it, key, properties[key].default);
        }
      } else if (ty === "array" && Array.isArray(items)) {
        items.forEach((sch, i) => assignDefault(it, i, sch.default));
      }
    }
    exports.assignDefaults = assignDefaults;
    function assignDefault(it, prop, defaultValue) {
      const { gen, compositeRule, data, opts } = it;
      if (defaultValue === void 0)
        return;
      const childData = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(prop)}`;
      if (compositeRule) {
        (0, util_1.checkStrictMode)(it, `default is ignored for: ${childData}`);
        return;
      }
      let condition = (0, codegen_1._)`${childData} === undefined`;
      if (opts.useDefaults === "empty") {
        condition = (0, codegen_1._)`${condition} || ${childData} === null || ${childData} === ""`;
      }
      gen.if(condition, (0, codegen_1._)`${childData} = ${(0, codegen_1.stringify)(defaultValue)}`);
    }
  }
});

// node_modules/ajv/dist/vocabularies/code.js
var require_code2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/code.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateUnion = exports.validateArray = exports.usePattern = exports.callValidateCode = exports.schemaProperties = exports.allSchemaProperties = exports.noPropertyInData = exports.propertyInData = exports.isOwnProperty = exports.hasPropFunc = exports.reportMissingProp = exports.checkMissingProp = exports.checkReportMissingProp = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    var util_2 = require_util();
    function checkReportMissingProp(cxt, prop) {
      const { gen, data, it } = cxt;
      gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
        cxt.setParams({ missingProperty: (0, codegen_1._)`${prop}` }, true);
        cxt.error();
      });
    }
    exports.checkReportMissingProp = checkReportMissingProp;
    function checkMissingProp({ gen, data, it: { opts } }, properties, missing) {
      return (0, codegen_1.or)(...properties.map((prop) => (0, codegen_1.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1._)`${missing} = ${prop}`)));
    }
    exports.checkMissingProp = checkMissingProp;
    function reportMissingProp(cxt, missing) {
      cxt.setParams({ missingProperty: missing }, true);
      cxt.error();
    }
    exports.reportMissingProp = reportMissingProp;
    function hasPropFunc(gen) {
      return gen.scopeValue("func", {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        ref: Object.prototype.hasOwnProperty,
        code: (0, codegen_1._)`Object.prototype.hasOwnProperty`
      });
    }
    exports.hasPropFunc = hasPropFunc;
    function isOwnProperty(gen, data, property) {
      return (0, codegen_1._)`${hasPropFunc(gen)}.call(${data}, ${property})`;
    }
    exports.isOwnProperty = isOwnProperty;
    function propertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
      return ownProperties ? (0, codegen_1._)`${cond} && ${isOwnProperty(gen, data, property)}` : cond;
    }
    exports.propertyInData = propertyInData;
    function noPropertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} === undefined`;
      return ownProperties ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property))) : cond;
    }
    exports.noPropertyInData = noPropertyInData;
    function allSchemaProperties(schemaMap) {
      return schemaMap ? Object.keys(schemaMap).filter((p2) => p2 !== "__proto__") : [];
    }
    exports.allSchemaProperties = allSchemaProperties;
    function schemaProperties(it, schemaMap) {
      return allSchemaProperties(schemaMap).filter((p2) => !(0, util_1.alwaysValidSchema)(it, schemaMap[p2]));
    }
    exports.schemaProperties = schemaProperties;
    function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
      const dataAndSchema = passSchema ? (0, codegen_1._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
      const valCxt = [
        [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, errorPath)],
        [names_1.default.parentData, it.parentData],
        [names_1.default.parentDataProperty, it.parentDataProperty],
        [names_1.default.rootData, names_1.default.rootData]
      ];
      if (it.opts.dynamicRef)
        valCxt.push([names_1.default.dynamicAnchors, names_1.default.dynamicAnchors]);
      const args = (0, codegen_1._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
      return context !== codegen_1.nil ? (0, codegen_1._)`${func}.call(${context}, ${args})` : (0, codegen_1._)`${func}(${args})`;
    }
    exports.callValidateCode = callValidateCode;
    var newRegExp = (0, codegen_1._)`new RegExp`;
    function usePattern({ gen, it: { opts } }, pattern) {
      const u = opts.unicodeRegExp ? "u" : "";
      const { regExp } = opts.code;
      const rx = regExp(pattern, u);
      return gen.scopeValue("pattern", {
        key: rx.toString(),
        ref: rx,
        code: (0, codegen_1._)`${regExp.code === "new RegExp" ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`
      });
    }
    exports.usePattern = usePattern;
    function validateArray(cxt) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      if (it.allErrors) {
        const validArr = gen.let("valid", true);
        validateItems(() => gen.assign(validArr, false));
        return validArr;
      }
      gen.var(valid, true);
      validateItems(() => gen.break());
      return valid;
      function validateItems(notValid) {
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        gen.forRange("i", 0, len, (i) => {
          cxt.subschema({
            keyword,
            dataProp: i,
            dataPropType: util_1.Type.Num
          }, valid);
          gen.if((0, codegen_1.not)(valid), notValid);
        });
      }
    }
    exports.validateArray = validateArray;
    function validateUnion(cxt) {
      const { gen, schema, keyword, it } = cxt;
      if (!Array.isArray(schema))
        throw new Error("ajv implementation error");
      const alwaysValid = schema.some((sch) => (0, util_1.alwaysValidSchema)(it, sch));
      if (alwaysValid && !it.opts.unevaluated)
        return;
      const valid = gen.let("valid", false);
      const schValid = gen.name("_valid");
      gen.block(() => schema.forEach((_sch, i) => {
        const schCxt = cxt.subschema({
          keyword,
          schemaProp: i,
          compositeRule: true
        }, schValid);
        gen.assign(valid, (0, codegen_1._)`${valid} || ${schValid}`);
        const merged = cxt.mergeValidEvaluated(schCxt, schValid);
        if (!merged)
          gen.if((0, codegen_1.not)(valid));
      }));
      cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
    }
    exports.validateUnion = validateUnion;
  }
});

// node_modules/ajv/dist/compile/validate/keyword.js
var require_keyword = __commonJS({
  "node_modules/ajv/dist/compile/validate/keyword.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateKeywordUsage = exports.validSchemaType = exports.funcKeywordCode = exports.macroKeywordCode = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var code_1 = require_code2();
    var errors_1 = require_errors();
    function macroKeywordCode(cxt, def) {
      const { gen, keyword, schema, parentSchema, it } = cxt;
      const macroSchema = def.macro.call(it.self, schema, parentSchema, it);
      const schemaRef = useKeyword(gen, keyword, macroSchema);
      if (it.opts.validateSchema !== false)
        it.self.validateSchema(macroSchema, true);
      const valid = gen.name("valid");
      cxt.subschema({
        schema: macroSchema,
        schemaPath: codegen_1.nil,
        errSchemaPath: `${it.errSchemaPath}/${keyword}`,
        topSchemaRef: schemaRef,
        compositeRule: true
      }, valid);
      cxt.pass(valid, () => cxt.error(true));
    }
    exports.macroKeywordCode = macroKeywordCode;
    function funcKeywordCode(cxt, def) {
      var _a;
      const { gen, keyword, schema, parentSchema, $data, it } = cxt;
      checkAsyncKeyword(it, def);
      const validate = !$data && def.compile ? def.compile.call(it.self, schema, parentSchema, it) : def.validate;
      const validateRef = useKeyword(gen, keyword, validate);
      const valid = gen.let("valid");
      cxt.block$data(valid, validateKeyword);
      cxt.ok((_a = def.valid) !== null && _a !== void 0 ? _a : valid);
      function validateKeyword() {
        if (def.errors === false) {
          assignValid();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => cxt.error());
        } else {
          const ruleErrs = def.async ? validateAsync() : validateSync();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => addErrs(cxt, ruleErrs));
        }
      }
      function validateAsync() {
        const ruleErrs = gen.let("ruleErrs", null);
        gen.try(() => assignValid((0, codegen_1._)`await `), (e) => gen.assign(valid, false).if((0, codegen_1._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1._)`${e}.errors`), () => gen.throw(e)));
        return ruleErrs;
      }
      function validateSync() {
        const validateErrs = (0, codegen_1._)`${validateRef}.errors`;
        gen.assign(validateErrs, null);
        assignValid(codegen_1.nil);
        return validateErrs;
      }
      function assignValid(_await = def.async ? (0, codegen_1._)`await ` : codegen_1.nil) {
        const passCxt = it.opts.passContext ? names_1.default.this : names_1.default.self;
        const passSchema = !("compile" in def && !$data || def.schema === false);
        gen.assign(valid, (0, codegen_1._)`${_await}${(0, code_1.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def.modifying);
      }
      function reportErrs(errors) {
        var _a2;
        gen.if((0, codegen_1.not)((_a2 = def.valid) !== null && _a2 !== void 0 ? _a2 : valid), errors);
      }
    }
    exports.funcKeywordCode = funcKeywordCode;
    function modifyData(cxt) {
      const { gen, data, it } = cxt;
      gen.if(it.parentData, () => gen.assign(data, (0, codegen_1._)`${it.parentData}[${it.parentDataProperty}]`));
    }
    function addErrs(cxt, errs) {
      const { gen } = cxt;
      gen.if((0, codegen_1._)`Array.isArray(${errs})`, () => {
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`).assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
        (0, errors_1.extendErrors)(cxt);
      }, () => cxt.error());
    }
    function checkAsyncKeyword({ schemaEnv }, def) {
      if (def.async && !schemaEnv.$async)
        throw new Error("async keyword in sync schema");
    }
    function useKeyword(gen, keyword, result) {
      if (result === void 0)
        throw new Error(`keyword "${keyword}" failed to compile`);
      return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1.stringify)(result) });
    }
    function validSchemaType(schema, schemaType, allowUndefined = false) {
      return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema) : st === "object" ? schema && typeof schema == "object" && !Array.isArray(schema) : typeof schema == st || allowUndefined && typeof schema == "undefined");
    }
    exports.validSchemaType = validSchemaType;
    function validateKeywordUsage({ schema, opts, self, errSchemaPath }, def, keyword) {
      if (Array.isArray(def.keyword) ? !def.keyword.includes(keyword) : def.keyword !== keyword) {
        throw new Error("ajv implementation error");
      }
      const deps = def.dependencies;
      if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema, kwd))) {
        throw new Error(`parent schema must have dependencies of ${keyword}: ${deps.join(",")}`);
      }
      if (def.validateSchema) {
        const valid = def.validateSchema(schema[keyword]);
        if (!valid) {
          const msg = `keyword "${keyword}" value is invalid at path "${errSchemaPath}": ` + self.errorsText(def.validateSchema.errors);
          if (opts.validateSchema === "log")
            self.logger.error(msg);
          else
            throw new Error(msg);
        }
      }
    }
    exports.validateKeywordUsage = validateKeywordUsage;
  }
});

// node_modules/ajv/dist/compile/validate/subschema.js
var require_subschema = __commonJS({
  "node_modules/ajv/dist/compile/validate/subschema.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendSubschemaMode = exports.extendSubschemaData = exports.getSubschema = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function getSubschema(it, { keyword, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
      if (keyword !== void 0 && schema !== void 0) {
        throw new Error('both "keyword" and "schema" passed, only one allowed');
      }
      if (keyword !== void 0) {
        const sch = it.schema[keyword];
        return schemaProp === void 0 ? {
          schema: sch,
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}`
        } : {
          schema: sch[schemaProp],
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}${(0, codegen_1.getProperty)(schemaProp)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}/${(0, util_1.escapeFragment)(schemaProp)}`
        };
      }
      if (schema !== void 0) {
        if (schemaPath === void 0 || errSchemaPath === void 0 || topSchemaRef === void 0) {
          throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
        }
        return {
          schema,
          schemaPath,
          topSchemaRef,
          errSchemaPath
        };
      }
      throw new Error('either "keyword" or "schema" must be passed');
    }
    exports.getSubschema = getSubschema;
    function extendSubschemaData(subschema, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
      if (data !== void 0 && dataProp !== void 0) {
        throw new Error('both "data" and "dataProp" passed, only one allowed');
      }
      const { gen } = it;
      if (dataProp !== void 0) {
        const { errorPath, dataPathArr, opts } = it;
        const nextData = gen.let("data", (0, codegen_1._)`${it.data}${(0, codegen_1.getProperty)(dataProp)}`, true);
        dataContextProps(nextData);
        subschema.errorPath = (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
        subschema.parentDataProperty = (0, codegen_1._)`${dataProp}`;
        subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
      }
      if (data !== void 0) {
        const nextData = data instanceof codegen_1.Name ? data : gen.let("data", data, true);
        dataContextProps(nextData);
        if (propertyName !== void 0)
          subschema.propertyName = propertyName;
      }
      if (dataTypes)
        subschema.dataTypes = dataTypes;
      function dataContextProps(_nextData) {
        subschema.data = _nextData;
        subschema.dataLevel = it.dataLevel + 1;
        subschema.dataTypes = [];
        it.definedProperties = /* @__PURE__ */ new Set();
        subschema.parentData = it.data;
        subschema.dataNames = [...it.dataNames, _nextData];
      }
    }
    exports.extendSubschemaData = extendSubschemaData;
    function extendSubschemaMode(subschema, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
      if (compositeRule !== void 0)
        subschema.compositeRule = compositeRule;
      if (createErrors !== void 0)
        subschema.createErrors = createErrors;
      if (allErrors !== void 0)
        subschema.allErrors = allErrors;
      subschema.jtdDiscriminator = jtdDiscriminator;
      subschema.jtdMetadata = jtdMetadata;
    }
    exports.extendSubschemaMode = extendSubschemaMode;
  }
});

// node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({
  "node_modules/fast-deep-equal/index.js"(exports, module) {
    "use strict";
    module.exports = function equal(a, b) {
      if (a === b) return true;
      if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor !== b.constructor) return false;
        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length) return false;
          for (i = length; i-- !== 0; )
            if (!equal(a[i], b[i])) return false;
          return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for (i = length; i-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for (i = length; i-- !== 0; ) {
          var key = keys[i];
          if (!equal(a[key], b[key])) return false;
        }
        return true;
      }
      return a !== a && b !== b;
    };
  }
});

// node_modules/json-schema-traverse/index.js
var require_json_schema_traverse = __commonJS({
  "node_modules/json-schema-traverse/index.js"(exports, module) {
    "use strict";
    var traverse = module.exports = function(schema, opts, cb) {
      if (typeof opts == "function") {
        cb = opts;
        opts = {};
      }
      cb = opts.cb || cb;
      var pre = typeof cb == "function" ? cb : cb.pre || function() {
      };
      var post = cb.post || function() {
      };
      _traverse(opts, pre, post, schema, "", schema);
    };
    traverse.keywords = {
      additionalItems: true,
      items: true,
      contains: true,
      additionalProperties: true,
      propertyNames: true,
      not: true,
      if: true,
      then: true,
      else: true
    };
    traverse.arrayKeywords = {
      items: true,
      allOf: true,
      anyOf: true,
      oneOf: true
    };
    traverse.propsKeywords = {
      $defs: true,
      definitions: true,
      properties: true,
      patternProperties: true,
      dependencies: true
    };
    traverse.skipKeywords = {
      default: true,
      enum: true,
      const: true,
      required: true,
      maximum: true,
      minimum: true,
      exclusiveMaximum: true,
      exclusiveMinimum: true,
      multipleOf: true,
      maxLength: true,
      minLength: true,
      pattern: true,
      format: true,
      maxItems: true,
      minItems: true,
      uniqueItems: true,
      maxProperties: true,
      minProperties: true
    };
    function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
      if (schema && typeof schema == "object" && !Array.isArray(schema)) {
        pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
        for (var key in schema) {
          var sch = schema[key];
          if (Array.isArray(sch)) {
            if (key in traverse.arrayKeywords) {
              for (var i = 0; i < sch.length; i++)
                _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
            }
          } else if (key in traverse.propsKeywords) {
            if (sch && typeof sch == "object") {
              for (var prop in sch)
                _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
            }
          } else if (key in traverse.keywords || opts.allKeys && !(key in traverse.skipKeywords)) {
            _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
          }
        }
        post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
      }
    }
    function escapeJsonPtr(str) {
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
  }
});

// node_modules/ajv/dist/compile/resolve.js
var require_resolve = __commonJS({
  "node_modules/ajv/dist/compile/resolve.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSchemaRefs = exports.resolveUrl = exports.normalizeId = exports._getFullPath = exports.getFullPath = exports.inlineRef = void 0;
    var util_1 = require_util();
    var equal = require_fast_deep_equal();
    var traverse = require_json_schema_traverse();
    var SIMPLE_INLINED = /* @__PURE__ */ new Set([
      "type",
      "format",
      "pattern",
      "maxLength",
      "minLength",
      "maxProperties",
      "minProperties",
      "maxItems",
      "minItems",
      "maximum",
      "minimum",
      "uniqueItems",
      "multipleOf",
      "required",
      "enum",
      "const"
    ]);
    function inlineRef(schema, limit = true) {
      if (typeof schema == "boolean")
        return true;
      if (limit === true)
        return !hasRef(schema);
      if (!limit)
        return false;
      return countKeys(schema) <= limit;
    }
    exports.inlineRef = inlineRef;
    var REF_KEYWORDS = /* @__PURE__ */ new Set([
      "$ref",
      "$recursiveRef",
      "$recursiveAnchor",
      "$dynamicRef",
      "$dynamicAnchor"
    ]);
    function hasRef(schema) {
      for (const key in schema) {
        if (REF_KEYWORDS.has(key))
          return true;
        const sch = schema[key];
        if (Array.isArray(sch) && sch.some(hasRef))
          return true;
        if (typeof sch == "object" && hasRef(sch))
          return true;
      }
      return false;
    }
    function countKeys(schema) {
      let count = 0;
      for (const key in schema) {
        if (key === "$ref")
          return Infinity;
        count++;
        if (SIMPLE_INLINED.has(key))
          continue;
        if (typeof schema[key] == "object") {
          (0, util_1.eachItem)(schema[key], (sch) => count += countKeys(sch));
        }
        if (count === Infinity)
          return Infinity;
      }
      return count;
    }
    function getFullPath(resolver, id = "", normalize) {
      if (normalize !== false)
        id = normalizeId(id);
      const p2 = resolver.parse(id);
      return _getFullPath(resolver, p2);
    }
    exports.getFullPath = getFullPath;
    function _getFullPath(resolver, p2) {
      const serialized = resolver.serialize(p2);
      return serialized.split("#")[0] + "#";
    }
    exports._getFullPath = _getFullPath;
    var TRAILING_SLASH_HASH = /#\/?$/;
    function normalizeId(id) {
      return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
    }
    exports.normalizeId = normalizeId;
    function resolveUrl(resolver, baseId, id) {
      id = normalizeId(id);
      return resolver.resolve(baseId, id);
    }
    exports.resolveUrl = resolveUrl;
    var ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
    function getSchemaRefs(schema, baseId) {
      if (typeof schema == "boolean")
        return {};
      const { schemaId, uriResolver } = this.opts;
      const schId = normalizeId(schema[schemaId] || baseId);
      const baseIds = { "": schId };
      const pathPrefix = getFullPath(uriResolver, schId, false);
      const localRefs = {};
      const schemaRefs = /* @__PURE__ */ new Set();
      traverse(schema, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
        if (parentJsonPtr === void 0)
          return;
        const fullPath = pathPrefix + jsonPtr;
        let innerBaseId = baseIds[parentJsonPtr];
        if (typeof sch[schemaId] == "string")
          innerBaseId = addRef.call(this, sch[schemaId]);
        addAnchor.call(this, sch.$anchor);
        addAnchor.call(this, sch.$dynamicAnchor);
        baseIds[jsonPtr] = innerBaseId;
        function addRef(ref) {
          const _resolve = this.opts.uriResolver.resolve;
          ref = normalizeId(innerBaseId ? _resolve(innerBaseId, ref) : ref);
          if (schemaRefs.has(ref))
            throw ambiguos(ref);
          schemaRefs.add(ref);
          let schOrRef = this.refs[ref];
          if (typeof schOrRef == "string")
            schOrRef = this.refs[schOrRef];
          if (typeof schOrRef == "object") {
            checkAmbiguosRef(sch, schOrRef.schema, ref);
          } else if (ref !== normalizeId(fullPath)) {
            if (ref[0] === "#") {
              checkAmbiguosRef(sch, localRefs[ref], ref);
              localRefs[ref] = sch;
            } else {
              this.refs[ref] = fullPath;
            }
          }
          return ref;
        }
        function addAnchor(anchor) {
          if (typeof anchor == "string") {
            if (!ANCHOR.test(anchor))
              throw new Error(`invalid anchor "${anchor}"`);
            addRef.call(this, `#${anchor}`);
          }
        }
      });
      return localRefs;
      function checkAmbiguosRef(sch1, sch2, ref) {
        if (sch2 !== void 0 && !equal(sch1, sch2))
          throw ambiguos(ref);
      }
      function ambiguos(ref) {
        return new Error(`reference "${ref}" resolves to more than one schema`);
      }
    }
    exports.getSchemaRefs = getSchemaRefs;
  }
});

// node_modules/ajv/dist/compile/validate/index.js
var require_validate = __commonJS({
  "node_modules/ajv/dist/compile/validate/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getData = exports.KeywordCxt = exports.validateFunctionCode = void 0;
    var boolSchema_1 = require_boolSchema();
    var dataType_1 = require_dataType();
    var applicability_1 = require_applicability();
    var dataType_2 = require_dataType();
    var defaults_1 = require_defaults();
    var keyword_1 = require_keyword();
    var subschema_1 = require_subschema();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var errors_1 = require_errors();
    function validateFunctionCode(it) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          topSchemaObjCode(it);
          return;
        }
      }
      validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
    }
    exports.validateFunctionCode = validateFunctionCode;
    function validateFunction({ gen, validateName, schema, schemaEnv, opts }, body) {
      if (opts.code.es5) {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${names_1.default.valCxt}`, schemaEnv.$async, () => {
          gen.code((0, codegen_1._)`"use strict"; ${funcSourceUrl(schema, opts)}`);
          destructureValCxtES5(gen, opts);
          gen.code(body);
        });
      } else {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema, opts)).code(body));
      }
    }
    function destructureValCxt(opts) {
      return (0, codegen_1._)`{${names_1.default.instancePath}="", ${names_1.default.parentData}, ${names_1.default.parentDataProperty}, ${names_1.default.rootData}=${names_1.default.data}${opts.dynamicRef ? (0, codegen_1._)`, ${names_1.default.dynamicAnchors}={}` : codegen_1.nil}}={}`;
    }
    function destructureValCxtES5(gen, opts) {
      gen.if(names_1.default.valCxt, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.instancePath}`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentData}`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentDataProperty}`);
        gen.var(names_1.default.rootData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.rootData}`);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.dynamicAnchors}`);
      }, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`""`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.rootData, names_1.default.data);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`{}`);
      });
    }
    function topSchemaObjCode(it) {
      const { schema, opts, gen } = it;
      validateFunction(it, () => {
        if (opts.$comment && schema.$comment)
          commentKeyword(it);
        checkNoDefault(it);
        gen.let(names_1.default.vErrors, null);
        gen.let(names_1.default.errors, 0);
        if (opts.unevaluated)
          resetEvaluated(it);
        typeAndKeywords(it);
        returnResults(it);
      });
      return;
    }
    function resetEvaluated(it) {
      const { gen, validateName } = it;
      it.evaluated = gen.const("evaluated", (0, codegen_1._)`${validateName}.evaluated`);
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1._)`${it.evaluated}.props`, (0, codegen_1._)`undefined`));
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1._)`${it.evaluated}.items`, (0, codegen_1._)`undefined`));
    }
    function funcSourceUrl(schema, opts) {
      const schId = typeof schema == "object" && schema[opts.schemaId];
      return schId && (opts.code.source || opts.code.process) ? (0, codegen_1._)`/*# sourceURL=${schId} */` : codegen_1.nil;
    }
    function subschemaCode(it, valid) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          subSchemaObjCode(it, valid);
          return;
        }
      }
      (0, boolSchema_1.boolOrEmptySchema)(it, valid);
    }
    function schemaCxtHasRules({ schema, self }) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (self.RULES.all[key])
          return true;
      return false;
    }
    function isSchemaObj(it) {
      return typeof it.schema != "boolean";
    }
    function subSchemaObjCode(it, valid) {
      const { schema, gen, opts } = it;
      if (opts.$comment && schema.$comment)
        commentKeyword(it);
      updateContext(it);
      checkAsyncSchema(it);
      const errsCount = gen.const("_errs", names_1.default.errors);
      typeAndKeywords(it, errsCount);
      gen.var(valid, (0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
    }
    function checkKeywords(it) {
      (0, util_1.checkUnknownRules)(it);
      checkRefsAndKeywords(it);
    }
    function typeAndKeywords(it, errsCount) {
      if (it.opts.jtd)
        return schemaKeywords(it, [], false, errsCount);
      const types = (0, dataType_1.getSchemaTypes)(it.schema);
      const checkedTypes = (0, dataType_1.coerceAndCheckDataType)(it, types);
      schemaKeywords(it, types, !checkedTypes, errsCount);
    }
    function checkRefsAndKeywords(it) {
      const { schema, errSchemaPath, opts, self } = it;
      if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1.schemaHasRulesButRef)(schema, self.RULES)) {
        self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
      }
    }
    function checkNoDefault(it) {
      const { schema, opts } = it;
      if (schema.default !== void 0 && opts.useDefaults && opts.strictSchema) {
        (0, util_1.checkStrictMode)(it, "default is ignored in the schema root");
      }
    }
    function updateContext(it) {
      const schId = it.schema[it.opts.schemaId];
      if (schId)
        it.baseId = (0, resolve_1.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
    }
    function checkAsyncSchema(it) {
      if (it.schema.$async && !it.schemaEnv.$async)
        throw new Error("async schema in sync schema");
    }
    function commentKeyword({ gen, schemaEnv, schema, errSchemaPath, opts }) {
      const msg = schema.$comment;
      if (opts.$comment === true) {
        gen.code((0, codegen_1._)`${names_1.default.self}.logger.log(${msg})`);
      } else if (typeof opts.$comment == "function") {
        const schemaPath = (0, codegen_1.str)`${errSchemaPath}/$comment`;
        const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
        gen.code((0, codegen_1._)`${names_1.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
      }
    }
    function returnResults(it) {
      const { gen, schemaEnv, validateName, ValidationError, opts } = it;
      if (schemaEnv.$async) {
        gen.if((0, codegen_1._)`${names_1.default.errors} === 0`, () => gen.return(names_1.default.data), () => gen.throw((0, codegen_1._)`new ${ValidationError}(${names_1.default.vErrors})`));
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, names_1.default.vErrors);
        if (opts.unevaluated)
          assignEvaluated(it);
        gen.return((0, codegen_1._)`${names_1.default.errors} === 0`);
      }
    }
    function assignEvaluated({ gen, evaluated, props, items }) {
      if (props instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.props`, props);
      if (items instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.items`, items);
    }
    function schemaKeywords(it, types, typeErrors, errsCount) {
      const { gen, schema, data, allErrors, opts, self } = it;
      const { RULES } = self;
      if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1.schemaHasRulesButRef)(schema, RULES))) {
        gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition));
        return;
      }
      if (!opts.jtd)
        checkStrictTypes(it, types);
      gen.block(() => {
        for (const group of RULES.rules)
          groupKeywords(group);
        groupKeywords(RULES.post);
      });
      function groupKeywords(group) {
        if (!(0, applicability_1.shouldUseGroup)(schema, group))
          return;
        if (group.type) {
          gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
          iterateKeywords(it, group);
          if (types.length === 1 && types[0] === group.type && typeErrors) {
            gen.else();
            (0, dataType_2.reportTypeError)(it);
          }
          gen.endIf();
        } else {
          iterateKeywords(it, group);
        }
        if (!allErrors)
          gen.if((0, codegen_1._)`${names_1.default.errors} === ${errsCount || 0}`);
      }
    }
    function iterateKeywords(it, group) {
      const { gen, schema, opts: { useDefaults } } = it;
      if (useDefaults)
        (0, defaults_1.assignDefaults)(it, group.type);
      gen.block(() => {
        for (const rule of group.rules) {
          if ((0, applicability_1.shouldUseRule)(schema, rule)) {
            keywordCode(it, rule.keyword, rule.definition, group.type);
          }
        }
      });
    }
    function checkStrictTypes(it, types) {
      if (it.schemaEnv.meta || !it.opts.strictTypes)
        return;
      checkContextTypes(it, types);
      if (!it.opts.allowUnionTypes)
        checkMultipleTypes(it, types);
      checkKeywordTypes(it, it.dataTypes);
    }
    function checkContextTypes(it, types) {
      if (!types.length)
        return;
      if (!it.dataTypes.length) {
        it.dataTypes = types;
        return;
      }
      types.forEach((t) => {
        if (!includesType(it.dataTypes, t)) {
          strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
        }
      });
      narrowSchemaTypes(it, types);
    }
    function checkMultipleTypes(it, ts) {
      if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
        strictTypesError(it, "use allowUnionTypes to allow union type keyword");
      }
    }
    function checkKeywordTypes(it, ts) {
      const rules = it.self.RULES.all;
      for (const keyword in rules) {
        const rule = rules[keyword];
        if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
          const { type } = rule.definition;
          if (type.length && !type.some((t) => hasApplicableType(ts, t))) {
            strictTypesError(it, `missing type "${type.join(",")}" for keyword "${keyword}"`);
          }
        }
      }
    }
    function hasApplicableType(schTs, kwdT) {
      return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
    }
    function includesType(ts, t) {
      return ts.includes(t) || t === "integer" && ts.includes("number");
    }
    function narrowSchemaTypes(it, withTypes) {
      const ts = [];
      for (const t of it.dataTypes) {
        if (includesType(withTypes, t))
          ts.push(t);
        else if (withTypes.includes("integer") && t === "number")
          ts.push("integer");
      }
      it.dataTypes = ts;
    }
    function strictTypesError(it, msg) {
      const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
      msg += ` at "${schemaPath}" (strictTypes)`;
      (0, util_1.checkStrictMode)(it, msg, it.opts.strictTypes);
    }
    var KeywordCxt = class {
      constructor(it, def, keyword) {
        (0, keyword_1.validateKeywordUsage)(it, def, keyword);
        this.gen = it.gen;
        this.allErrors = it.allErrors;
        this.keyword = keyword;
        this.data = it.data;
        this.schema = it.schema[keyword];
        this.$data = def.$data && it.opts.$data && this.schema && this.schema.$data;
        this.schemaValue = (0, util_1.schemaRefOrVal)(it, this.schema, keyword, this.$data);
        this.schemaType = def.schemaType;
        this.parentSchema = it.schema;
        this.params = {};
        this.it = it;
        this.def = def;
        if (this.$data) {
          this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
        } else {
          this.schemaCode = this.schemaValue;
          if (!(0, keyword_1.validSchemaType)(this.schema, def.schemaType, def.allowUndefined)) {
            throw new Error(`${keyword} value must be ${JSON.stringify(def.schemaType)}`);
          }
        }
        if ("code" in def ? def.trackErrors : def.errors !== false) {
          this.errsCount = it.gen.const("_errs", names_1.default.errors);
        }
      }
      result(condition, successAction, failAction) {
        this.failResult((0, codegen_1.not)(condition), successAction, failAction);
      }
      failResult(condition, successAction, failAction) {
        this.gen.if(condition);
        if (failAction)
          failAction();
        else
          this.error();
        if (successAction) {
          this.gen.else();
          successAction();
          if (this.allErrors)
            this.gen.endIf();
        } else {
          if (this.allErrors)
            this.gen.endIf();
          else
            this.gen.else();
        }
      }
      pass(condition, failAction) {
        this.failResult((0, codegen_1.not)(condition), void 0, failAction);
      }
      fail(condition) {
        if (condition === void 0) {
          this.error();
          if (!this.allErrors)
            this.gen.if(false);
          return;
        }
        this.gen.if(condition);
        this.error();
        if (this.allErrors)
          this.gen.endIf();
        else
          this.gen.else();
      }
      fail$data(condition) {
        if (!this.$data)
          return this.fail(condition);
        const { schemaCode } = this;
        this.fail((0, codegen_1._)`${schemaCode} !== undefined && (${(0, codegen_1.or)(this.invalid$data(), condition)})`);
      }
      error(append, errorParams, errorPaths) {
        if (errorParams) {
          this.setParams(errorParams);
          this._error(append, errorPaths);
          this.setParams({});
          return;
        }
        this._error(append, errorPaths);
      }
      _error(append, errorPaths) {
        ;
        (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
      }
      $dataError() {
        (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
      }
      reset() {
        if (this.errsCount === void 0)
          throw new Error('add "trackErrors" to keyword definition');
        (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
      }
      ok(cond) {
        if (!this.allErrors)
          this.gen.if(cond);
      }
      setParams(obj, assign) {
        if (assign)
          Object.assign(this.params, obj);
        else
          this.params = obj;
      }
      block$data(valid, codeBlock, $dataValid = codegen_1.nil) {
        this.gen.block(() => {
          this.check$data(valid, $dataValid);
          codeBlock();
        });
      }
      check$data(valid = codegen_1.nil, $dataValid = codegen_1.nil) {
        if (!this.$data)
          return;
        const { gen, schemaCode, schemaType, def } = this;
        gen.if((0, codegen_1.or)((0, codegen_1._)`${schemaCode} === undefined`, $dataValid));
        if (valid !== codegen_1.nil)
          gen.assign(valid, true);
        if (schemaType.length || def.validateSchema) {
          gen.elseIf(this.invalid$data());
          this.$dataError();
          if (valid !== codegen_1.nil)
            gen.assign(valid, false);
        }
        gen.else();
      }
      invalid$data() {
        const { gen, schemaCode, schemaType, def, it } = this;
        return (0, codegen_1.or)(wrong$DataType(), invalid$DataSchema());
        function wrong$DataType() {
          if (schemaType.length) {
            if (!(schemaCode instanceof codegen_1.Name))
              throw new Error("ajv implementation error");
            const st = Array.isArray(schemaType) ? schemaType : [schemaType];
            return (0, codegen_1._)`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
          }
          return codegen_1.nil;
        }
        function invalid$DataSchema() {
          if (def.validateSchema) {
            const validateSchemaRef = gen.scopeValue("validate$data", { ref: def.validateSchema });
            return (0, codegen_1._)`!${validateSchemaRef}(${schemaCode})`;
          }
          return codegen_1.nil;
        }
      }
      subschema(appl, valid) {
        const subschema = (0, subschema_1.getSubschema)(this.it, appl);
        (0, subschema_1.extendSubschemaData)(subschema, this.it, appl);
        (0, subschema_1.extendSubschemaMode)(subschema, appl);
        const nextContext = { ...this.it, ...subschema, items: void 0, props: void 0 };
        subschemaCode(nextContext, valid);
        return nextContext;
      }
      mergeEvaluated(schemaCxt, toName) {
        const { it, gen } = this;
        if (!it.opts.unevaluated)
          return;
        if (it.props !== true && schemaCxt.props !== void 0) {
          it.props = util_1.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
        }
        if (it.items !== true && schemaCxt.items !== void 0) {
          it.items = util_1.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
        }
      }
      mergeValidEvaluated(schemaCxt, valid) {
        const { it, gen } = this;
        if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
          gen.if(valid, () => this.mergeEvaluated(schemaCxt, codegen_1.Name));
          return true;
        }
      }
    };
    exports.KeywordCxt = KeywordCxt;
    function keywordCode(it, keyword, def, ruleType) {
      const cxt = new KeywordCxt(it, def, keyword);
      if ("code" in def) {
        def.code(cxt, ruleType);
      } else if (cxt.$data && def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      } else if ("macro" in def) {
        (0, keyword_1.macroKeywordCode)(cxt, def);
      } else if (def.compile || def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      }
    }
    var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
    var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
    function getData($data, { dataLevel, dataNames, dataPathArr }) {
      let jsonPointer;
      let data;
      if ($data === "")
        return names_1.default.rootData;
      if ($data[0] === "/") {
        if (!JSON_POINTER.test($data))
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        jsonPointer = $data;
        data = names_1.default.rootData;
      } else {
        const matches = RELATIVE_JSON_POINTER.exec($data);
        if (!matches)
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        const up = +matches[1];
        jsonPointer = matches[2];
        if (jsonPointer === "#") {
          if (up >= dataLevel)
            throw new Error(errorMsg("property/index", up));
          return dataPathArr[dataLevel - up];
        }
        if (up > dataLevel)
          throw new Error(errorMsg("data", up));
        data = dataNames[dataLevel - up];
        if (!jsonPointer)
          return data;
      }
      let expr = data;
      const segments = jsonPointer.split("/");
      for (const segment of segments) {
        if (segment) {
          data = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)((0, util_1.unescapeJsonPointer)(segment))}`;
          expr = (0, codegen_1._)`${expr} && ${data}`;
        }
      }
      return expr;
      function errorMsg(pointerType, up) {
        return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
      }
    }
    exports.getData = getData;
  }
});

// node_modules/ajv/dist/runtime/validation_error.js
var require_validation_error = __commonJS({
  "node_modules/ajv/dist/runtime/validation_error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ValidationError = class extends Error {
      constructor(errors) {
        super("validation failed");
        this.errors = errors;
        this.ajv = this.validation = true;
      }
    };
    exports.default = ValidationError;
  }
});

// node_modules/ajv/dist/compile/ref_error.js
var require_ref_error = __commonJS({
  "node_modules/ajv/dist/compile/ref_error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var resolve_1 = require_resolve();
    var MissingRefError = class extends Error {
      constructor(resolver, baseId, ref, msg) {
        super(msg || `can't resolve reference ${ref} from id ${baseId}`);
        this.missingRef = (0, resolve_1.resolveUrl)(resolver, baseId, ref);
        this.missingSchema = (0, resolve_1.normalizeId)((0, resolve_1.getFullPath)(resolver, this.missingRef));
      }
    };
    exports.default = MissingRefError;
  }
});

// node_modules/ajv/dist/compile/index.js
var require_compile = __commonJS({
  "node_modules/ajv/dist/compile/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveSchema = exports.getCompilingSchema = exports.resolveRef = exports.compileSchema = exports.SchemaEnv = void 0;
    var codegen_1 = require_codegen();
    var validation_error_1 = require_validation_error();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var validate_1 = require_validate();
    var SchemaEnv = class {
      constructor(env) {
        var _a;
        this.refs = {};
        this.dynamicAnchors = {};
        let schema;
        if (typeof env.schema == "object")
          schema = env.schema;
        this.schema = env.schema;
        this.schemaId = env.schemaId;
        this.root = env.root || this;
        this.baseId = (_a = env.baseId) !== null && _a !== void 0 ? _a : (0, resolve_1.normalizeId)(schema === null || schema === void 0 ? void 0 : schema[env.schemaId || "$id"]);
        this.schemaPath = env.schemaPath;
        this.localRefs = env.localRefs;
        this.meta = env.meta;
        this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
        this.refs = {};
      }
    };
    exports.SchemaEnv = SchemaEnv;
    function compileSchema(sch) {
      const _sch = getCompilingSchema.call(this, sch);
      if (_sch)
        return _sch;
      const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId);
      const { es5, lines } = this.opts.code;
      const { ownProperties } = this.opts;
      const gen = new codegen_1.CodeGen(this.scope, { es5, lines, ownProperties });
      let _ValidationError;
      if (sch.$async) {
        _ValidationError = gen.scopeValue("Error", {
          ref: validation_error_1.default,
          code: (0, codegen_1._)`require("ajv/dist/runtime/validation_error").default`
        });
      }
      const validateName = gen.scopeName("validate");
      sch.validateName = validateName;
      const schemaCxt = {
        gen,
        allErrors: this.opts.allErrors,
        data: names_1.default.data,
        parentData: names_1.default.parentData,
        parentDataProperty: names_1.default.parentDataProperty,
        dataNames: [names_1.default.data],
        dataPathArr: [codegen_1.nil],
        // TODO can its length be used as dataLevel if nil is removed?
        dataLevel: 0,
        dataTypes: [],
        definedProperties: /* @__PURE__ */ new Set(),
        topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? { ref: sch.schema, code: (0, codegen_1.stringify)(sch.schema) } : { ref: sch.schema }),
        validateName,
        ValidationError: _ValidationError,
        schema: sch.schema,
        schemaEnv: sch,
        rootId,
        baseId: sch.baseId || rootId,
        schemaPath: codegen_1.nil,
        errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
        errorPath: (0, codegen_1._)`""`,
        opts: this.opts,
        self: this
      };
      let sourceCode;
      try {
        this._compilations.add(sch);
        (0, validate_1.validateFunctionCode)(schemaCxt);
        gen.optimize(this.opts.code.optimize);
        const validateCode = gen.toString();
        sourceCode = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`;
        if (this.opts.code.process)
          sourceCode = this.opts.code.process(sourceCode, sch);
        const makeValidate = new Function(`${names_1.default.self}`, `${names_1.default.scope}`, sourceCode);
        const validate = makeValidate(this, this.scope.get());
        this.scope.value(validateName, { ref: validate });
        validate.errors = null;
        validate.schema = sch.schema;
        validate.schemaEnv = sch;
        if (sch.$async)
          validate.$async = true;
        if (this.opts.code.source === true) {
          validate.source = { validateName, validateCode, scopeValues: gen._values };
        }
        if (this.opts.unevaluated) {
          const { props, items } = schemaCxt;
          validate.evaluated = {
            props: props instanceof codegen_1.Name ? void 0 : props,
            items: items instanceof codegen_1.Name ? void 0 : items,
            dynamicProps: props instanceof codegen_1.Name,
            dynamicItems: items instanceof codegen_1.Name
          };
          if (validate.source)
            validate.source.evaluated = (0, codegen_1.stringify)(validate.evaluated);
        }
        sch.validate = validate;
        return sch;
      } catch (e) {
        delete sch.validate;
        delete sch.validateName;
        if (sourceCode)
          this.logger.error("Error compiling schema, function code:", sourceCode);
        throw e;
      } finally {
        this._compilations.delete(sch);
      }
    }
    exports.compileSchema = compileSchema;
    function resolveRef(root, baseId, ref) {
      var _a;
      ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref);
      const schOrFunc = root.refs[ref];
      if (schOrFunc)
        return schOrFunc;
      let _sch = resolve.call(this, root, ref);
      if (_sch === void 0) {
        const schema = (_a = root.localRefs) === null || _a === void 0 ? void 0 : _a[ref];
        const { schemaId } = this.opts;
        if (schema)
          _sch = new SchemaEnv({ schema, schemaId, root, baseId });
      }
      if (_sch === void 0)
        return;
      return root.refs[ref] = inlineOrCompile.call(this, _sch);
    }
    exports.resolveRef = resolveRef;
    function inlineOrCompile(sch) {
      if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs))
        return sch.schema;
      return sch.validate ? sch : compileSchema.call(this, sch);
    }
    function getCompilingSchema(schEnv) {
      for (const sch of this._compilations) {
        if (sameSchemaEnv(sch, schEnv))
          return sch;
      }
    }
    exports.getCompilingSchema = getCompilingSchema;
    function sameSchemaEnv(s1, s2) {
      return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
    }
    function resolve(root, ref) {
      let sch;
      while (typeof (sch = this.refs[ref]) == "string")
        ref = sch;
      return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
    }
    function resolveSchema(root, ref) {
      const p2 = this.opts.uriResolver.parse(ref);
      const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p2);
      let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
      if (Object.keys(root.schema).length > 0 && refPath === baseId) {
        return getJsonPointer.call(this, p2, root);
      }
      const id = (0, resolve_1.normalizeId)(refPath);
      const schOrRef = this.refs[id] || this.schemas[id];
      if (typeof schOrRef == "string") {
        const sch = resolveSchema.call(this, root, schOrRef);
        if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object")
          return;
        return getJsonPointer.call(this, p2, sch);
      }
      if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object")
        return;
      if (!schOrRef.validate)
        compileSchema.call(this, schOrRef);
      if (id === (0, resolve_1.normalizeId)(ref)) {
        const { schema } = schOrRef;
        const { schemaId } = this.opts;
        const schId = schema[schemaId];
        if (schId)
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        return new SchemaEnv({ schema, schemaId, root, baseId });
      }
      return getJsonPointer.call(this, p2, schOrRef);
    }
    exports.resolveSchema = resolveSchema;
    var PREVENT_SCOPE_CHANGE = /* @__PURE__ */ new Set([
      "properties",
      "patternProperties",
      "enum",
      "dependencies",
      "definitions"
    ]);
    function getJsonPointer(parsedRef, { baseId, schema, root }) {
      var _a;
      if (((_a = parsedRef.fragment) === null || _a === void 0 ? void 0 : _a[0]) !== "/")
        return;
      for (const part of parsedRef.fragment.slice(1).split("/")) {
        if (typeof schema === "boolean")
          return;
        const partSchema = schema[(0, util_1.unescapeFragment)(part)];
        if (partSchema === void 0)
          return;
        schema = partSchema;
        const schId = typeof schema === "object" && schema[this.opts.schemaId];
        if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        }
      }
      let env;
      if (typeof schema != "boolean" && schema.$ref && !(0, util_1.schemaHasRulesButRef)(schema, this.RULES)) {
        const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
        env = resolveSchema.call(this, root, $ref);
      }
      const { schemaId } = this.opts;
      env = env || new SchemaEnv({ schema, schemaId, root, baseId });
      if (env.schema !== env.root.schema)
        return env;
      return void 0;
    }
  }
});

// node_modules/ajv/dist/refs/data.json
var require_data = __commonJS({
  "node_modules/ajv/dist/refs/data.json"(exports, module) {
    module.exports = {
      $id: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
      description: "Meta-schema for $data reference (JSON AnySchema extension proposal)",
      type: "object",
      required: ["$data"],
      properties: {
        $data: {
          type: "string",
          anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }]
        }
      },
      additionalProperties: false
    };
  }
});

// node_modules/fast-uri/lib/utils.js
var require_utils = __commonJS({
  "node_modules/fast-uri/lib/utils.js"(exports, module) {
    "use strict";
    var isUUID = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu);
    var isIPv4 = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
    var isPort = RegExp.prototype.test.bind(/^\d*$/u);
    var isHexPair = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu);
    var isUnreserved = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu);
    var isPathCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/]$/u);
    var isQueryFragmentCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/?]$/u);
    var isUserinfoCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:]$/u);
    var BYTE_HEX = new Array(256);
    {
      const HEX_DIGITS = "0123456789ABCDEF";
      for (let i = 0; i < 256; i++) {
        BYTE_HEX[i] = "%" + HEX_DIGITS[i >> 4] + HEX_DIGITS[i & 15];
      }
    }
    function percentEncodeNonAscii(cp) {
      if (cp < 2048) {
        return BYTE_HEX[192 | cp >> 6] + BYTE_HEX[128 | cp & 63];
      }
      if (cp < 65536) {
        return BYTE_HEX[224 | cp >> 12] + BYTE_HEX[128 | cp >> 6 & 63] + BYTE_HEX[128 | cp & 63];
      }
      return BYTE_HEX[240 | cp >> 18] + BYTE_HEX[128 | cp >> 12 & 63] + BYTE_HEX[128 | cp >> 6 & 63] + BYTE_HEX[128 | cp & 63];
    }
    function stringArrayToHexStripped(input) {
      let acc = "";
      let code = 0;
      let i = 0;
      for (i = 0; i < input.length; i++) {
        code = input[i].charCodeAt(0);
        if (code === 48) {
          continue;
        }
        if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
          return "";
        }
        acc += input[i];
        break;
      }
      for (i += 1; i < input.length; i++) {
        code = input[i].charCodeAt(0);
        if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
          return "";
        }
        acc += input[i];
      }
      return acc;
    }
    var isHextet = RegExp.prototype.test.bind(/^[\dA-Fa-f]{1,4}$/);
    var isIPvFuture = RegExp.prototype.test.bind(/^[vV][\dA-Fa-f]+\.[A-Za-z\d\-._~!$&'()*+,;=:]+$/);
    var isZoneCharacter = RegExp.prototype.test.bind(/^[A-Za-z\d\-._~]$/);
    var nonSimpleDomain = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
    function isZoneIdentifier(zone) {
      if (zone.length === 0) return false;
      for (let i = 0; i < zone.length; i++) {
        if (isZoneCharacter(zone[i])) continue;
        if (zone[i] === "%" && i + 2 < zone.length && isHexPair(zone.slice(i + 1, i + 3))) {
          i += 2;
          continue;
        }
        return false;
      }
      return true;
    }
    function compressIPv6ZeroRun(hextets) {
      let bestStart = -1;
      let bestLength = 0;
      let runStart = -1;
      let runLength = 0;
      for (let i = 0; i < hextets.length; i++) {
        if (hextets[i] === "0") {
          if (runStart === -1) runStart = i;
          runLength++;
          if (runLength > bestLength) {
            bestLength = runLength;
            bestStart = runStart;
          }
        } else {
          runStart = -1;
          runLength = 0;
        }
      }
      if (bestLength < 2) return hextets.join(":");
      const head = hextets.slice(0, bestStart).join(":");
      const tail = hextets.slice(bestStart + bestLength).join(":");
      return head + "::" + tail;
    }
    function normalizeIPv6Address(input) {
      const compression = input.indexOf("::");
      if (compression !== -1 && input.indexOf("::", compression + 1) !== -1) return void 0;
      const left = compression === -1 ? input.split(":") : input.slice(0, compression).split(":");
      const right = compression === -1 ? [] : input.slice(compression + 2).split(":");
      if (compression !== -1) {
        if (left.length === 1 && left[0] === "") left.length = 0;
        if (right.length === 1 && right[0] === "") right.length = 0;
      }
      const parts = left.concat(right);
      let hextetCount = 0;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part === "") return void 0;
        if (part.indexOf(".") !== -1) {
          if (i !== parts.length - 1 || compression !== -1 && right.length === 0 || !isIPv4(part)) return void 0;
          hextetCount += 2;
          continue;
        }
        if (!isHextet(part)) return void 0;
        parts[i] = parseInt(part, 16).toString(16);
        hextetCount++;
      }
      if (compression === -1) {
        if (hextetCount !== 8) return void 0;
        return compressIPv6ZeroRun(parts);
      }
      if (hextetCount >= 8) return void 0;
      const expanded = parts.slice(0, left.length);
      for (let i = hextetCount; i < 8; i++) expanded.push("0");
      for (let i = left.length; i < parts.length; i++) expanded.push(parts[i]);
      return compressIPv6ZeroRun(expanded);
    }
    function normalizeIPv6(host) {
      const bracketed = host[0] === "[" && host[host.length - 1] === "]";
      const hasBracket = host[0] === "[" || host[host.length - 1] === "]";
      if (hasBracket && !bracketed) return { host, isIPV6: false, error: true };
      let input = bracketed ? host.slice(1, -1) : host;
      if (bracketed && isIPvFuture(input)) {
        input = input.toLowerCase();
        return { host: `[${input}]`, escapedHost: input, isIPV6: false, isIPVFuture: true };
      }
      if (findToken(input, ":") < 2) {
        return { host, isIPV6: false, error: bracketed };
      }
      let zoneIdentifier = "";
      const zoneSeparator = input.indexOf("%");
      if (zoneSeparator !== -1) {
        const separatorLength = input.slice(zoneSeparator, zoneSeparator + 3).toLowerCase() === "%25" ? 3 : 1;
        zoneIdentifier = input.slice(zoneSeparator + separatorLength);
        if (!isZoneIdentifier(zoneIdentifier)) return { host, isIPV6: false, error: true };
        input = input.slice(0, zoneSeparator);
      }
      const address = normalizeIPv6Address(input);
      if (address === void 0) return { host, isIPV6: false, error: true };
      return {
        host: address + (zoneIdentifier ? "%" + zoneIdentifier : ""),
        escapedHost: address + (zoneIdentifier ? "%25" + zoneIdentifier : ""),
        isIPV6: true
      };
    }
    function findToken(str, token) {
      let ind = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === token) ind++;
      }
      return ind;
    }
    function removeDotSegments(path) {
      let input = path;
      const output = [];
      let nextSlash = -1;
      let len = 0;
      while (len = input.length) {
        if (len === 1) {
          if (input === ".") {
            break;
          } else if (input === "/") {
            output.push("/");
            break;
          } else {
            output.push(input);
            break;
          }
        } else if (len === 2) {
          if (input[0] === ".") {
            if (input[1] === ".") {
              break;
            } else if (input[1] === "/") {
              input = input.slice(2);
              continue;
            }
          } else if (input[0] === "/") {
            if (input[1] === "." || input[1] === "/") {
              output.push("/");
              break;
            }
          }
        } else if (len === 3) {
          if (input === "/..") {
            if (output.length !== 0) {
              output.pop();
            }
            output.push("/");
            break;
          }
        }
        if (input[0] === ".") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(3);
              continue;
            }
          } else if (input[1] === "/") {
            input = input.slice(2);
            continue;
          }
        } else if (input[0] === "/") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(2);
              continue;
            } else if (input[2] === ".") {
              if (input[3] === "/") {
                input = input.slice(3);
                if (output.length !== 0) {
                  output.pop();
                }
                continue;
              }
            }
          }
        }
        if ((nextSlash = input.indexOf("/", 1)) === -1) {
          output.push(input);
          break;
        } else {
          output.push(input.slice(0, nextSlash));
          input = input.slice(nextSlash);
        }
      }
      return output.join("");
    }
    function removeDotSegmentsRelative(path) {
      if (path === "" || path[0] === "/") {
        return removeDotSegments(path);
      }
      const segments = path.split("/");
      const last = segments.length - 1;
      const output = [];
      let trailingDirectory = false;
      for (let i = 0; i <= last; i++) {
        const segment = segments[i];
        if (segment === "." || segment === "..") {
          if (segment === "..") {
            if (output.length !== 0 && output[output.length - 1] !== "..") {
              output.pop();
            } else {
              output.push("..");
            }
          }
          trailingDirectory = i === last;
        } else {
          output.push(segment);
        }
      }
      if (trailingDirectory && output[output.length - 1] !== "..") {
        output.push("");
      }
      if (output.length === 0 || output[0] === "" || output[0].includes(":")) {
        output.unshift(".");
      }
      return output.join("/");
    }
    var HOST_DELIMS = { "@": "%40", "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" };
    var HOST_DELIM_RE = /[@/?#:]/g;
    var HOST_DELIM_NO_COLON_RE = /[@/?#]/g;
    function reescapeHostDelimiters(host, isIP) {
      const re = isIP ? HOST_DELIM_NO_COLON_RE : HOST_DELIM_RE;
      re.lastIndex = 0;
      return host.replace(re, (ch) => HOST_DELIMS[ch]);
    }
    function normalizePercentEncoding(input, decodeUnreserved = false) {
      if (input.indexOf("%") === -1) {
        return input;
      }
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decodeUnreserved && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        output += input[i];
      }
      return output;
    }
    function normalizePathEncoding(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decoded !== "." && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        if (isPathCharacter(ch)) {
          output += ch;
        } else {
          const code = input.charCodeAt(i);
          if (code < 128) {
            output += isEscapeSafe(code) ? ch : BYTE_HEX[code];
          } else if (code < 55296 || code > 57343) {
            output += percentEncodeNonAscii(code);
          } else if (code <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function serializePathEncoding(input, pathNoScheme = false) {
      let output = "";
      let firstSegment = pathNoScheme && input[0] !== "/";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        if (ch === "/") {
          firstSegment = false;
        }
        if (isPathCharacter(ch) && (ch !== ":" || !firstSegment)) {
          output += ch;
        } else {
          const code = input.charCodeAt(i);
          if (code < 128) {
            output += BYTE_HEX[code];
          } else if (code < 55296 || code > 57343) {
            output += percentEncodeNonAscii(code);
          } else if (code <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function encodeComponent(input, isAllowed) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        if (isAllowed(ch)) {
          output += ch;
        } else {
          const code = input.charCodeAt(i);
          if (code < 128) {
            output += BYTE_HEX[code];
          } else if (code < 55296 || code > 57343) {
            output += percentEncodeNonAscii(code);
          } else if (code <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function encodeUserinfo(input) {
      return encodeComponent(input, isUserinfoCharacter);
    }
    function encodeQuery(input) {
      return encodeComponent(input, isQueryFragmentCharacter);
    }
    function encodeFragment(input) {
      return encodeComponent(input, isQueryFragmentCharacter);
    }
    function isEscapeSafe(cp) {
      return cp >= 48 && cp <= 57 || cp >= 65 && cp <= 90 || cp >= 97 && cp <= 122 || cp === 42 || cp === 43 || cp === 45 || cp === 46 || cp === 47 || cp === 64 || cp === 95;
    }
    function normalizeQueryFragmentEncoding(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        if (isQueryFragmentCharacter(ch)) {
          output += ch;
        } else {
          const code = input.charCodeAt(i);
          if (code < 128) {
            output += isEscapeSafe(code) ? ch : BYTE_HEX[code];
          } else if (code < 55296 || code > 57343) {
            output += percentEncodeNonAscii(code);
          } else if (code <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function escapePreservingEscapes(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        output += escape(input[i]);
      }
      return output;
    }
    function recomposeAuthority(component) {
      const uriTokens = [];
      if (component.userinfo !== void 0) {
        uriTokens.push(encodeUserinfo(component.userinfo));
        uriTokens.push("@");
      }
      if (component.host !== void 0) {
        let host = component.host;
        if (!isIPv4(host)) {
          let ipV6res = normalizeIPv6(host);
          if (ipV6res.isIPV6 !== true && ipV6res.isIPVFuture !== true) {
            host = normalizePercentEncoding(host, true);
            ipV6res = normalizeIPv6(host);
          }
          if (ipV6res.isIPV6 === true || ipV6res.isIPVFuture === true) {
            host = `[${ipV6res.escapedHost}]`;
          } else {
            host = reescapeHostDelimiters(host, false);
          }
        }
        uriTokens.push(host);
      }
      if (typeof component.port === "number" || typeof component.port === "string") {
        const port = String(component.port);
        if (!isPort(port)) {
          throw new TypeError("URI port is malformed.");
        }
        uriTokens.push(":");
        uriTokens.push(port);
      }
      return uriTokens.length ? uriTokens.join("") : void 0;
    }
    module.exports = {
      nonSimpleDomain,
      recomposeAuthority,
      reescapeHostDelimiters,
      normalizePercentEncoding,
      normalizePathEncoding,
      serializePathEncoding,
      normalizeQueryFragmentEncoding,
      encodeUserinfo,
      encodeQuery,
      encodeFragment,
      escapePreservingEscapes,
      removeDotSegments,
      removeDotSegmentsRelative,
      isIPv4,
      isUUID,
      normalizeIPv6,
      stringArrayToHexStripped
    };
  }
});

// node_modules/fast-uri/lib/schemes.js
var require_schemes = __commonJS({
  "node_modules/fast-uri/lib/schemes.js"(exports, module) {
    "use strict";
    var { isUUID } = require_utils();
    var URN_REG = /^([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-./:;=@]|%[\da-f]{2})+)$/iu;
    var supportedSchemeNames = (
      /** @type {const} */
      [
        "http",
        "https",
        "ws",
        "wss",
        "urn",
        "urn:uuid"
      ]
    );
    function isValidSchemeName(name) {
      return supportedSchemeNames.indexOf(
        /** @type {*} */
        name
      ) !== -1;
    }
    function wsIsSecure(wsComponent) {
      if (wsComponent.secure === true) {
        return true;
      } else if (wsComponent.secure === false) {
        return false;
      } else if (wsComponent.scheme) {
        return wsComponent.scheme.length === 3 && (wsComponent.scheme[0] === "w" || wsComponent.scheme[0] === "W") && (wsComponent.scheme[1] === "s" || wsComponent.scheme[1] === "S") && (wsComponent.scheme[2] === "s" || wsComponent.scheme[2] === "S");
      } else {
        return false;
      }
    }
    function httpParse(component) {
      if (!component.host) {
        component.error = component.error || "HTTP URIs must have a host.";
      }
      return component;
    }
    function httpSerialize(component) {
      const secure = String(component.scheme).toLowerCase() === "https";
      if (component.port === (secure ? 443 : 80) || component.port === "") {
        component.port = void 0;
      }
      if (!component.path) {
        component.path = "/";
      }
      return component;
    }
    function wsParse(wsComponent) {
      wsComponent.secure = wsIsSecure(wsComponent);
      wsComponent.resourceName = (wsComponent.path || "/") + (wsComponent.query ? "?" + wsComponent.query : "");
      wsComponent.path = void 0;
      wsComponent.query = void 0;
      return wsComponent;
    }
    function wsSerialize(wsComponent) {
      if (wsComponent.port === (wsIsSecure(wsComponent) ? 443 : 80) || wsComponent.port === "") {
        wsComponent.port = void 0;
      }
      if (typeof wsComponent.secure === "boolean") {
        wsComponent.scheme = wsComponent.secure ? "wss" : "ws";
        wsComponent.secure = void 0;
      }
      if (wsComponent.resourceName) {
        const queryIndex = wsComponent.resourceName.indexOf("?");
        const path = queryIndex === -1 ? wsComponent.resourceName : wsComponent.resourceName.slice(0, queryIndex);
        wsComponent.path = path && path !== "/" ? path : void 0;
        wsComponent.query = queryIndex === -1 ? void 0 : wsComponent.resourceName.slice(queryIndex + 1);
        wsComponent.resourceName = void 0;
      }
      wsComponent.fragment = void 0;
      return wsComponent;
    }
    function urnParse(urnComponent, options) {
      if (!urnComponent.path) {
        urnComponent.error = "URN can not be parsed";
        return urnComponent;
      }
      const matches = urnComponent.path.match(URN_REG);
      if (matches && matches[0] === urnComponent.path) {
        const scheme = options.scheme || urnComponent.scheme || "urn";
        urnComponent.nid = matches[1].toLowerCase();
        urnComponent.nss = matches[2];
        const urnScheme = `${scheme}:${options.nid || urnComponent.nid}`;
        const schemeHandler = getSchemeHandler(urnScheme);
        urnComponent.path = void 0;
        if (schemeHandler) {
          urnComponent = schemeHandler.parse(urnComponent, options);
        }
      } else {
        urnComponent.error = urnComponent.error || "URN can not be parsed.";
      }
      return urnComponent;
    }
    function urnSerialize(urnComponent, options) {
      if (urnComponent.nid === void 0) {
        throw new Error("URN without nid cannot be serialized");
      }
      const scheme = options.scheme || urnComponent.scheme || "urn";
      const nid = urnComponent.nid.toLowerCase();
      const urnScheme = `${scheme}:${options.nid || nid}`;
      const schemeHandler = getSchemeHandler(urnScheme);
      if (schemeHandler) {
        urnComponent = schemeHandler.serialize(urnComponent, options);
      }
      const uriComponent = urnComponent;
      const nss = urnComponent.nss;
      uriComponent.path = `${nid || options.nid}:${nss}`;
      options.skipEscape = true;
      return uriComponent;
    }
    function urnuuidParse(urnComponent, options) {
      const uuidComponent = urnComponent;
      uuidComponent.uuid = uuidComponent.nss;
      uuidComponent.nss = void 0;
      if (!options.tolerant && (!uuidComponent.uuid || !isUUID(uuidComponent.uuid))) {
        uuidComponent.error = uuidComponent.error || "UUID is not valid.";
      }
      return uuidComponent;
    }
    function urnuuidSerialize(uuidComponent) {
      const urnComponent = uuidComponent;
      urnComponent.nss = (uuidComponent.uuid || "").toLowerCase();
      return urnComponent;
    }
    var http = (
      /** @type {SchemeHandler} */
      {
        scheme: "http",
        domainHost: true,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var https = (
      /** @type {SchemeHandler} */
      {
        scheme: "https",
        domainHost: http.domainHost,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var ws = (
      /** @type {SchemeHandler} */
      {
        scheme: "ws",
        domainHost: true,
        parse: wsParse,
        serialize: wsSerialize
      }
    );
    var wss = (
      /** @type {SchemeHandler} */
      {
        scheme: "wss",
        domainHost: ws.domainHost,
        parse: ws.parse,
        serialize: ws.serialize
      }
    );
    var urn = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn",
        parse: urnParse,
        serialize: urnSerialize,
        skipNormalize: true
      }
    );
    var urnuuid = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn:uuid",
        parse: urnuuidParse,
        serialize: urnuuidSerialize,
        skipNormalize: true
      }
    );
    var SCHEMES = (
      /** @type {Record<SchemeName, SchemeHandler>} */
      {
        http,
        https,
        ws,
        wss,
        urn,
        "urn:uuid": urnuuid
      }
    );
    Object.setPrototypeOf(SCHEMES, null);
    function getSchemeHandler(scheme) {
      return scheme && (SCHEMES[
        /** @type {SchemeName} */
        scheme
      ] || SCHEMES[
        /** @type {SchemeName} */
        scheme.toLowerCase()
      ]) || void 0;
    }
    module.exports = {
      wsIsSecure,
      SCHEMES,
      isValidSchemeName,
      getSchemeHandler
    };
  }
});

// node_modules/fast-uri/index.js
var require_fast_uri = __commonJS({
  "node_modules/fast-uri/index.js"(exports, module) {
    "use strict";
    var { normalizeIPv6, removeDotSegments, removeDotSegmentsRelative, recomposeAuthority, normalizePercentEncoding, normalizePathEncoding, serializePathEncoding, normalizeQueryFragmentEncoding, encodeQuery, encodeFragment, reescapeHostDelimiters, isIPv4, nonSimpleDomain } = require_utils();
    var { SCHEMES, getSchemeHandler } = require_schemes();
    var VALID_SCHEME = /^[A-Za-z][A-Za-z0-9+.-]*$/u;
    var MALFORMED_SCHEME_ERROR = "URI scheme is malformed.";
    var MALFORMED_HOST_ERROR = "URI host is malformed.";
    var FORBIDDEN_DOMAIN_HOST_CHARACTER = /[\0-\x20"#/:<>?@[\\\]^`{|}\x7F]/u;
    function validateScheme(scheme) {
      const stringScheme = String(scheme);
      if (!VALID_SCHEME.test(stringScheme)) {
        throw new TypeError(MALFORMED_SCHEME_ERROR);
      }
      return stringScheme;
    }
    function normalize(uri, options) {
      if (typeof uri === "string") {
        uri = /** @type {T} */
        normalizeString(uri, options);
      } else if (typeof uri === "object") {
        uri = /** @type {T} */
        parse(serialize(uri, options), options);
      }
      return uri;
    }
    function resolve(baseURI, relativeURI, options) {
      const schemelessOptions = options ? Object.assign({ scheme: "null" }, options) : { scheme: "null" };
      const {
        parsed: baseParsed,
        malformedAuthorityOrPort: baseMalformed,
        malformedPercentEncoding: baseMalformedPercentEncoding,
        malformedSchemeSpecific: baseMalformedSchemeSpecific,
        malformedHost: baseMalformedHost,
        malformedScheme: baseMalformedScheme
      } = parseWithStatus(baseURI, schemelessOptions);
      const {
        parsed: relativeParsed,
        malformedAuthorityOrPort: relativeMalformed,
        malformedPercentEncoding: relativeMalformedPercentEncoding,
        malformedSchemeSpecific: relativeMalformedSchemeSpecific,
        malformedHost: relativeMalformedHost,
        malformedScheme: relativeMalformedScheme
      } = parseWithStatus(relativeURI, schemelessOptions);
      if (baseMalformed || relativeMalformed || baseMalformedPercentEncoding || relativeMalformedPercentEncoding || baseMalformedSchemeSpecific || relativeMalformedSchemeSpecific || baseMalformedHost || relativeMalformedHost || baseMalformedScheme || relativeMalformedScheme) {
        throw new Error(baseParsed.error || relativeParsed.error || "URI is malformed.");
      }
      const resolved = resolveComponent(baseParsed, relativeParsed, schemelessOptions, true);
      const resolvedSchemeHandler = getSchemeHandler(options && options.scheme || resolved.scheme);
      const resolvedHost = resolved.host;
      const resolvedHostIsIP = resolvedHost !== void 0 && resolvedHost !== "" && (isIPv4(resolvedHost) || normalizeIPv6(resolvedHost).isIPV6);
      if (hasForbiddenDomainHost(resolved, options || {}, resolvedSchemeHandler, resolvedHostIsIP)) {
        throw new Error(MALFORMED_HOST_ERROR);
      }
      canonicalizeHost(resolved, options || {}, resolvedSchemeHandler, resolvedHostIsIP);
      const encodedASCIIHost = resolvedHost && resolvedHost.indexOf("%") !== -1 && !/\P{ASCII}/u.test(resolvedHost);
      if (resolved.error && !encodedASCIIHost) {
        throw new Error(resolved.error);
      }
      schemelessOptions.skipEscape = true;
      return serialize(resolved, schemelessOptions);
    }
    function resolveComponent(base, relative, options, skipNormalization) {
      const target = {};
      if (!skipNormalization) {
        base = parse(serialize(base, options), options);
        relative = parse(serialize(relative, options), options);
      }
      options = options || {};
      if (!options.tolerant && relative.scheme) {
        target.scheme = relative.scheme;
        target.userinfo = relative.userinfo;
        target.host = relative.host;
        target.port = relative.port;
        target.path = removeDotSegments(relative.path || "");
        target.query = relative.query;
      } else {
        if (relative.userinfo !== void 0 || relative.host !== void 0 || relative.port !== void 0) {
          target.userinfo = relative.userinfo;
          target.host = relative.host;
          target.port = relative.port;
          target.path = removeDotSegments(relative.path || "");
          target.query = relative.query;
        } else {
          if (!relative.path) {
            target.path = base.path;
            if (relative.query !== void 0) {
              target.query = relative.query;
            } else {
              target.query = base.query;
            }
          } else {
            if (relative.path[0] === "/") {
              target.path = removeDotSegments(relative.path);
            } else {
              const baseHasAuthority = base.userinfo !== void 0 || base.host !== void 0 || base.port !== void 0;
              if (baseHasAuthority && !base.path) {
                target.path = "/" + relative.path;
              } else if (!base.path) {
                target.path = relative.path;
              } else {
                target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
              }
              target.path = base.scheme === void 0 && !baseHasAuthority && target.path[0] !== "/" ? removeDotSegmentsRelative(target.path) : removeDotSegments(target.path);
            }
            target.query = relative.query;
          }
          target.userinfo = base.userinfo;
          target.host = base.host;
          target.port = base.port;
        }
        target.scheme = base.scheme;
      }
      target.fragment = relative.fragment;
      return target;
    }
    function equal(uriA, uriB, options) {
      const normalizedA = normalizeComparableURI(uriA, options);
      const normalizedB = normalizeComparableURI(uriB, options);
      return normalizedA !== void 0 && normalizedB !== void 0 && normalizedA === normalizedB;
    }
    function serialize(cmpts, opts) {
      const component = {
        host: cmpts.host,
        scheme: cmpts.scheme,
        userinfo: cmpts.userinfo,
        port: cmpts.port,
        path: cmpts.path,
        query: cmpts.query,
        nid: cmpts.nid,
        nss: cmpts.nss,
        uuid: cmpts.uuid,
        fragment: cmpts.fragment,
        reference: cmpts.reference,
        resourceName: cmpts.resourceName,
        secure: cmpts.secure,
        error: ""
      };
      const options = Object.assign({}, opts);
      const uriTokens = [];
      if (component.scheme) {
        component.scheme = validateScheme(component.scheme);
      }
      const schemeHandler = getSchemeHandler(options.scheme || component.scheme);
      if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(component, options);
      const hasAuthority = component.userinfo !== void 0 || component.host !== void 0 || component.port !== void 0;
      const schemelessReference = (component.scheme === void 0 || options.reference === "suffix") && !hasAuthority;
      const pathNoScheme = !options.skipEscape && schemelessReference;
      if (component.path !== void 0) {
        if (!options.skipEscape) {
          component.path = serializePathEncoding(component.path, pathNoScheme);
        } else {
          component.path = normalizePercentEncoding(component.path);
        }
      }
      if (options.reference !== "suffix" && component.scheme) {
        component.scheme = validateScheme(component.scheme);
        uriTokens.push(component.scheme, ":");
      }
      const authority = recomposeAuthority(component);
      if (authority !== void 0) {
        if (options.reference !== "suffix") {
          uriTokens.push("//");
        }
        uriTokens.push(authority);
        if (component.path && component.path[0] !== "/") {
          uriTokens.push("/");
        }
      }
      if (component.path !== void 0) {
        let s = component.path;
        if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
          s = schemelessReference && s[0] !== "/" ? removeDotSegmentsRelative(s) : removeDotSegments(s);
        }
        if (schemelessReference) {
          s = serializePathEncoding(s, true);
        }
        if (authority === void 0 && s[0] === "/" && s[1] === "/") {
          s = "/%2F" + s.slice(2);
        }
        uriTokens.push(s);
      }
      if (component.query !== void 0) {
        uriTokens.push("?", encodeQuery(component.query));
      }
      if (component.fragment !== void 0) {
        uriTokens.push("#", encodeFragment(component.fragment));
      }
      return uriTokens.join("");
    }
    var URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
    var AUTHORITY_PREFIX = /^(?:[^#/:?]+:)?\/\/([^/?#]*)/;
    var AUTHORITY_INTRODUCER_REGION = /^(?:[^#/:?]+:)?([/\\\t\n\r]*)/;
    function getParseError(parsed, matches) {
      if (matches[2] !== void 0 && parsed.path && parsed.path[0] !== "/") {
        return 'URI path must start with "/" when authority is present.';
      }
      if (typeof parsed.port === "number" && (parsed.port < 0 || parsed.port > 65535)) {
        return "URI port is malformed.";
      }
      return void 0;
    }
    function hasMalformedPercentEncoding(component) {
      if (component === void 0) return false;
      let percent = component.indexOf("%");
      while (percent !== -1) {
        if (percent + 2 >= component.length || !/^[\da-f]{2}$/iu.test(component.slice(percent + 1, percent + 3))) {
          return true;
        }
        percent = component.indexOf("%", percent + 3);
      }
      return false;
    }
    function isIPLiteral(host) {
      return host[0] === "[" && host[host.length - 1] === "]";
    }
    function hasMalformedComponentPercentEncoding(matches) {
      const host = matches[4];
      return hasMalformedPercentEncoding(matches[3]) || host !== void 0 && !isIPLiteral(host) && hasMalformedPercentEncoding(host) || hasMalformedPercentEncoding(matches[6]) || hasMalformedPercentEncoding(matches[7]) || hasMalformedPercentEncoding(matches[8]);
    }
    function canonicalizeHost(parsed, options, schemeHandler, isIP) {
      if (hasForbiddenDomainHost(parsed, options, schemeHandler, isIP)) {
        parsed.error = parsed.error || MALFORMED_HOST_ERROR;
        return true;
      }
      if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport) && parsed.host && !isIPLiteral(parsed.host) && (options.domainHost || schemeHandler && schemeHandler.domainHost) && isIP === false && nonSimpleDomain(parsed.host)) {
        let url;
        try {
          url = new URL("http://" + parsed.host);
        } catch (e) {
          parsed.error = parsed.error || "Host's domain name can not be converted to ASCII: " + e;
          return true;
        }
        if (!isHostOnlyURL(url)) {
          parsed.error = parsed.error || MALFORMED_HOST_ERROR;
          return true;
        }
        parsed.host = url.hostname;
      }
      return false;
    }
    function hasForbiddenDomainHost(parsed, options, schemeHandler, isIP) {
      return Boolean(
        parsed.host && isIP === false && !isIPLiteral(parsed.host) && (options.domainHost || schemeHandler && schemeHandler.domainHost) && FORBIDDEN_DOMAIN_HOST_CHARACTER.test(parsed.host)
      );
    }
    function isHostOnlyURL(url) {
      return url.username === "" && url.password === "" && url.port === "" && url.pathname === "/" && url.search === "" && url.hash === "" && url.hostname !== "";
    }
    function parseWithStatus(uri, opts) {
      const options = Object.assign({}, opts);
      const parsed = {
        scheme: void 0,
        userinfo: void 0,
        host: "",
        port: void 0,
        path: "",
        query: void 0,
        fragment: void 0
      };
      let malformedAuthorityOrPort = false;
      let malformedPercentEncoding = false;
      let malformedSchemeSpecific = false;
      let malformedHost = false;
      let malformedIPLiteral = false;
      let malformedScheme = false;
      let isIP = false;
      if (options.reference === "suffix") {
        if (options.scheme) {
          uri = options.scheme + ":" + uri;
        } else {
          uri = "//" + uri;
        }
      }
      const authorityMatch = uri.match(AUTHORITY_PREFIX);
      if (authorityMatch !== null && authorityMatch[1].indexOf("\\") !== -1) {
        parsed.error = "URI authority must not contain a literal backslash.";
        malformedAuthorityOrPort = true;
      }
      const introducerMatch = uri.match(AUTHORITY_INTRODUCER_REGION);
      if (introducerMatch !== null) {
        const region = introducerMatch[1];
        const normalizedRegion = region.replace(/[\t\n\r]/g, "");
        if (normalizedRegion.length >= 2) {
          if (normalizedRegion.slice(0, 2) !== "//") {
            parsed.error = parsed.error || "URI authority must not contain a literal backslash.";
            malformedAuthorityOrPort = true;
          } else if (region.length !== normalizedRegion.length) {
            parsed.error = parsed.error || "URI authority introducer must not contain whitespace.";
            malformedAuthorityOrPort = true;
          }
        }
      }
      const matches = uri.match(URI_PARSE);
      if (matches) {
        parsed.scheme = matches[1];
        parsed.userinfo = matches[3];
        parsed.host = matches[4];
        parsed.port = parseInt(matches[5], 10);
        parsed.path = matches[6] || "";
        parsed.query = matches[7];
        parsed.fragment = matches[8];
        if (parsed.scheme !== void 0) {
          if (VALID_SCHEME.test(parsed.scheme)) {
            parsed.scheme = parsed.scheme.toLowerCase();
          } else {
            parsed.error = parsed.error || MALFORMED_SCHEME_ERROR;
            malformedScheme = true;
          }
        }
        malformedPercentEncoding = hasMalformedComponentPercentEncoding(matches);
        if (malformedPercentEncoding) {
          parsed.error = parsed.error || "URI contains malformed percent-encoding.";
        }
        if (isNaN(parsed.port)) {
          parsed.port = matches[5];
        }
        const parseError = getParseError(parsed, matches);
        if (parseError !== void 0) {
          parsed.error = parsed.error || parseError;
          malformedAuthorityOrPort = true;
        }
        if (parsed.host) {
          const ipv4result = isIPv4(parsed.host);
          if (ipv4result === false) {
            const bracketedIPLiteral = isIPLiteral(parsed.host);
            const hasIPLiteralBracket = parsed.host.indexOf("[") !== -1 || parsed.host.indexOf("]") !== -1;
            const ipv6result = normalizeIPv6(parsed.host);
            isIP = ipv6result.isIPV6 || ipv6result.isIPVFuture === true;
            malformedIPLiteral = hasIPLiteralBracket && (!bracketedIPLiteral || ipv6result.error === true);
            parsed.host = isIP ? ipv6result.host : ipv6result.host.toLowerCase();
            if (malformedIPLiteral) {
              parsed.error = parsed.error || MALFORMED_HOST_ERROR;
              malformedAuthorityOrPort = true;
            }
          } else {
            isIP = true;
          }
        }
        if (parsed.scheme === void 0 && parsed.userinfo === void 0 && parsed.host === void 0 && parsed.port === void 0 && parsed.query === void 0 && !parsed.path) {
          parsed.reference = "same-document";
        } else if (parsed.scheme === void 0) {
          parsed.reference = "relative";
        } else if (parsed.fragment === void 0) {
          parsed.reference = "absolute";
        } else {
          parsed.reference = "uri";
        }
        if (options.reference && options.reference !== "suffix" && options.reference !== parsed.reference) {
          parsed.error = parsed.error || "URI is not a " + options.reference + " reference.";
        }
        const schemeHandler = getSchemeHandler(options.scheme || parsed.scheme);
        if (!malformedIPLiteral) {
          malformedHost = canonicalizeHost(parsed, options, schemeHandler, isIP);
        }
        if (uri.indexOf("%") !== -1 && parsed.host !== void 0 && !malformedIPLiteral) {
          let host = isIP ? parsed.host : normalizePercentEncoding(parsed.host, true);
          if (!isIP) {
            host = normalizePercentEncoding(host.toLowerCase());
          }
          parsed.host = isIP || options.scheme !== "null" ? reescapeHostDelimiters(host, isIP) : host;
        }
        if (!schemeHandler || schemeHandler && !schemeHandler.skipNormalize) {
          if (parsed.path) {
            parsed.path = normalizePathEncoding(parsed.path);
          }
          if (parsed.query) {
            parsed.query = normalizeQueryFragmentEncoding(parsed.query);
          }
          if (parsed.fragment) {
            parsed.fragment = normalizeQueryFragmentEncoding(parsed.fragment);
          }
        }
        if (schemeHandler && schemeHandler.parse) {
          schemeHandler.parse(parsed, options);
          if (schemeHandler === SCHEMES.urn && parsed.nid === void 0) {
            malformedSchemeSpecific = true;
          }
        }
      } else {
        parsed.error = parsed.error || "URI can not be parsed.";
      }
      return { parsed, malformedAuthorityOrPort, malformedPercentEncoding, malformedSchemeSpecific, malformedHost, malformedScheme };
    }
    function parse(uri, opts) {
      return parseWithStatus(uri, opts).parsed;
    }
    function normalizeString(uri, opts) {
      return normalizeStringWithStatus(uri, opts).normalized;
    }
    function normalizeStringWithStatus(uri, opts) {
      const { parsed, malformedAuthorityOrPort, malformedPercentEncoding, malformedSchemeSpecific, malformedHost, malformedScheme } = parseWithStatus(uri, opts);
      return {
        normalized: malformedAuthorityOrPort || malformedPercentEncoding || malformedSchemeSpecific || malformedHost || malformedScheme ? uri : serialize(parsed, opts),
        malformedAuthorityOrPort,
        malformedPercentEncoding,
        malformedSchemeSpecific,
        malformedHost,
        malformedScheme
      };
    }
    function normalizeComparableURI(uri, opts) {
      if (typeof uri !== "string" && typeof uri !== "object") {
        return void 0;
      }
      let value;
      try {
        value = typeof uri === "string" ? uri : serialize(uri, opts);
      } catch {
        return void 0;
      }
      const { normalized, malformedAuthorityOrPort, malformedPercentEncoding, malformedSchemeSpecific, malformedHost, malformedScheme } = normalizeStringWithStatus(value, opts);
      return malformedAuthorityOrPort || malformedPercentEncoding || malformedSchemeSpecific || malformedHost || malformedScheme ? void 0 : normalized;
    }
    var fastUri = {
      SCHEMES,
      normalize,
      resolve,
      resolveComponent,
      equal,
      serialize,
      parse
    };
    module.exports = fastUri;
    module.exports.default = fastUri;
    module.exports.fastUri = fastUri;
  }
});

// node_modules/ajv/dist/runtime/uri.js
var require_uri = __commonJS({
  "node_modules/ajv/dist/runtime/uri.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var uri = require_fast_uri();
    uri.code = 'require("ajv/dist/runtime/uri").default';
    exports.default = uri;
  }
});

// node_modules/ajv/dist/core.js
var require_core = __commonJS({
  "node_modules/ajv/dist/core.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    var ref_error_1 = require_ref_error();
    var rules_1 = require_rules();
    var compile_1 = require_compile();
    var codegen_2 = require_codegen();
    var resolve_1 = require_resolve();
    var dataType_1 = require_dataType();
    var util_1 = require_util();
    var $dataRefSchema = require_data();
    var uri_1 = require_uri();
    var defaultRegExp = (str, flags) => new RegExp(str, flags);
    defaultRegExp.code = "new RegExp";
    var META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
    var EXT_SCOPE_NAMES = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]);
    var removedOptions = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    };
    var deprecatedOptions = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    };
    var MAX_EXPRESSION = 200;
    function requiredOptions(o) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
      const s = o.strict;
      const _optz = (_a = o.code) === null || _a === void 0 ? void 0 : _a.optimize;
      const optimize = _optz === true || _optz === void 0 ? 1 : _optz || 0;
      const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
      const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
      return {
        strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
        strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
        strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
        strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
        strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
        code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
        loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
        loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
        meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
        messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
        inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
        schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
        addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
        validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
        validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
        unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
        int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
        uriResolver
      };
    }
    var Ajv = class {
      constructor(opts = {}) {
        this.schemas = {};
        this.refs = {};
        this.formats = /* @__PURE__ */ Object.create(null);
        this._compilations = /* @__PURE__ */ new Set();
        this._loading = {};
        this._cache = /* @__PURE__ */ new Map();
        opts = this.opts = { ...opts, ...requiredOptions(opts) };
        const { es5, lines } = this.opts.code;
        this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
        this.logger = getLogger(opts.logger);
        const formatOpt = opts.validateFormats;
        opts.validateFormats = false;
        this.RULES = (0, rules_1.getRules)();
        checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
        checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
        this._metaOpts = getMetaSchemaOptions.call(this);
        if (opts.formats)
          addInitialFormats.call(this);
        this._addVocabularies();
        this._addDefaultMetaSchema();
        if (opts.keywords)
          addInitialKeywords.call(this, opts.keywords);
        if (typeof opts.meta == "object")
          this.addMetaSchema(opts.meta);
        addInitialSchemas.call(this);
        opts.validateFormats = formatOpt;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data, meta, schemaId } = this.opts;
        let _dataRefSchema = $dataRefSchema;
        if (schemaId === "id") {
          _dataRefSchema = { ...$dataRefSchema };
          _dataRefSchema.id = _dataRefSchema.$id;
          delete _dataRefSchema.$id;
        }
        if (meta && $data)
          this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
      }
      defaultMeta() {
        const { meta, schemaId } = this.opts;
        return this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : void 0;
      }
      validate(schemaKeyRef, data) {
        let v;
        if (typeof schemaKeyRef == "string") {
          v = this.getSchema(schemaKeyRef);
          if (!v)
            throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
        } else {
          v = this.compile(schemaKeyRef);
        }
        const valid = v(data);
        if (!("$async" in v))
          this.errors = v.errors;
        return valid;
      }
      compile(schema, _meta) {
        const sch = this._addSchema(schema, _meta);
        return sch.validate || this._compileSchemaEnv(sch);
      }
      compileAsync(schema, meta) {
        if (typeof this.opts.loadSchema != "function") {
          throw new Error("options.loadSchema should be a function");
        }
        const { loadSchema } = this.opts;
        return runCompileAsync.call(this, schema, meta);
        async function runCompileAsync(_schema, _meta) {
          await loadMetaSchema.call(this, _schema.$schema);
          const sch = this._addSchema(_schema, _meta);
          return sch.validate || _compileAsync.call(this, sch);
        }
        async function loadMetaSchema($ref) {
          if ($ref && !this.getSchema($ref)) {
            await runCompileAsync.call(this, { $ref }, true);
          }
        }
        async function _compileAsync(sch) {
          try {
            return this._compileSchemaEnv(sch);
          } catch (e) {
            if (!(e instanceof ref_error_1.default))
              throw e;
            checkLoaded.call(this, e);
            await loadMissingSchema.call(this, e.missingSchema);
            return _compileAsync.call(this, sch);
          }
        }
        function checkLoaded({ missingSchema: ref, missingRef }) {
          if (this.refs[ref]) {
            throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
          }
        }
        async function loadMissingSchema(ref) {
          const _schema = await _loadSchema.call(this, ref);
          if (!this.refs[ref])
            await loadMetaSchema.call(this, _schema.$schema);
          if (!this.refs[ref])
            this.addSchema(_schema, ref, meta);
        }
        async function _loadSchema(ref) {
          const p2 = this._loading[ref];
          if (p2)
            return p2;
          try {
            return await (this._loading[ref] = loadSchema(ref));
          } finally {
            delete this._loading[ref];
          }
        }
      }
      // Adds schema to the instance
      addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
        if (Array.isArray(schema)) {
          for (const sch of schema)
            this.addSchema(sch, void 0, _meta, _validateSchema);
          return this;
        }
        let id;
        if (typeof schema === "object") {
          const { schemaId } = this.opts;
          id = schema[schemaId];
          if (id !== void 0 && typeof id != "string") {
            throw new Error(`schema ${schemaId} must be string`);
          }
        }
        key = (0, resolve_1.normalizeId)(key || id);
        this._checkUnique(key);
        this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
        return this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
        this.addSchema(schema, key, true, _validateSchema);
        return this;
      }
      //  Validate schema against its meta-schema
      validateSchema(schema, throwOrLogError) {
        if (typeof schema == "boolean")
          return true;
        let $schema;
        $schema = schema.$schema;
        if ($schema !== void 0 && typeof $schema != "string") {
          throw new Error("$schema must be a string");
        }
        $schema = $schema || this.opts.defaultMeta || this.defaultMeta();
        if (!$schema) {
          this.logger.warn("meta-schema not available");
          this.errors = null;
          return true;
        }
        const valid = this.validate($schema, schema);
        if (!valid && throwOrLogError) {
          const message = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(message);
          else
            throw new Error(message);
        }
        return valid;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(keyRef) {
        let sch;
        while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
          keyRef = sch;
        if (sch === void 0) {
          const { schemaId } = this.opts;
          const root = new compile_1.SchemaEnv({ schema: {}, schemaId });
          sch = compile_1.resolveSchema.call(this, root, keyRef);
          if (!sch)
            return;
          this.refs[keyRef] = sch;
        }
        return sch.validate || this._compileSchemaEnv(sch);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(schemaKeyRef) {
        if (schemaKeyRef instanceof RegExp) {
          this._removeAllSchemas(this.schemas, schemaKeyRef);
          this._removeAllSchemas(this.refs, schemaKeyRef);
          return this;
        }
        switch (typeof schemaKeyRef) {
          case "undefined":
            this._removeAllSchemas(this.schemas);
            this._removeAllSchemas(this.refs);
            this._cache.clear();
            return this;
          case "string": {
            const sch = getSchEnv.call(this, schemaKeyRef);
            if (typeof sch == "object")
              this._cache.delete(sch.schema);
            delete this.schemas[schemaKeyRef];
            delete this.refs[schemaKeyRef];
            return this;
          }
          case "object": {
            const cacheKey = schemaKeyRef;
            this._cache.delete(cacheKey);
            let id = schemaKeyRef[this.opts.schemaId];
            if (id) {
              id = (0, resolve_1.normalizeId)(id);
              delete this.schemas[id];
              delete this.refs[id];
            }
            return this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(definitions) {
        for (const def of definitions)
          this.addKeyword(def);
        return this;
      }
      addKeyword(kwdOrDef, def) {
        let keyword;
        if (typeof kwdOrDef == "string") {
          keyword = kwdOrDef;
          if (typeof def == "object") {
            this.logger.warn("these parameters are deprecated, see docs for addKeyword");
            def.keyword = keyword;
          }
        } else if (typeof kwdOrDef == "object" && def === void 0) {
          def = kwdOrDef;
          keyword = def.keyword;
          if (Array.isArray(keyword) && !keyword.length) {
            throw new Error("addKeywords: keyword must be string or non-empty array");
          }
        } else {
          throw new Error("invalid addKeywords parameters");
        }
        checkKeyword.call(this, keyword, def);
        if (!def) {
          (0, util_1.eachItem)(keyword, (kwd) => addRule.call(this, kwd));
          return this;
        }
        keywordMetaschema.call(this, def);
        const definition = {
          ...def,
          type: (0, dataType_1.getJSONTypes)(def.type),
          schemaType: (0, dataType_1.getJSONTypes)(def.schemaType)
        };
        (0, util_1.eachItem)(keyword, definition.type.length === 0 ? (k) => addRule.call(this, k, definition) : (k) => definition.type.forEach((t) => addRule.call(this, k, definition, t)));
        return this;
      }
      getKeyword(keyword) {
        const rule = this.RULES.all[keyword];
        return typeof rule == "object" ? rule.definition : !!rule;
      }
      // Remove keyword
      removeKeyword(keyword) {
        const { RULES } = this;
        delete RULES.keywords[keyword];
        delete RULES.all[keyword];
        for (const group of RULES.rules) {
          const i = group.rules.findIndex((rule) => rule.keyword === keyword);
          if (i >= 0)
            group.rules.splice(i, 1);
        }
        return this;
      }
      // Add format
      addFormat(name, format) {
        if (typeof format == "string")
          format = new RegExp(format);
        this.formats[name] = format;
        return this;
      }
      errorsText(errors = this.errors, { separator = ", ", dataVar = "data" } = {}) {
        if (!errors || errors.length === 0)
          return "No errors";
        return errors.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
      }
      $dataMetaSchema(metaSchema, keywordsJsonPointers) {
        const rules = this.RULES.all;
        metaSchema = JSON.parse(JSON.stringify(metaSchema));
        for (const jsonPointer of keywordsJsonPointers) {
          const segments = jsonPointer.split("/").slice(1);
          let keywords = metaSchema;
          for (const seg of segments)
            keywords = keywords[seg];
          for (const key in rules) {
            const rule = rules[key];
            if (typeof rule != "object")
              continue;
            const { $data } = rule.definition;
            const schema = keywords[key];
            if ($data && schema)
              keywords[key] = schemaOrData(schema);
          }
        }
        return metaSchema;
      }
      _removeAllSchemas(schemas, regex) {
        for (const keyRef in schemas) {
          const sch = schemas[keyRef];
          if (!regex || regex.test(keyRef)) {
            if (typeof sch == "string") {
              delete schemas[keyRef];
            } else if (sch && !sch.meta) {
              this._cache.delete(sch.schema);
              delete schemas[keyRef];
            }
          }
        }
      }
      _addSchema(schema, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
        let id;
        const { schemaId } = this.opts;
        if (typeof schema == "object") {
          id = schema[schemaId];
        } else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          else if (typeof schema != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let sch = this._cache.get(schema);
        if (sch !== void 0)
          return sch;
        baseId = (0, resolve_1.normalizeId)(id || baseId);
        const localRefs = resolve_1.getSchemaRefs.call(this, schema, baseId);
        sch = new compile_1.SchemaEnv({ schema, schemaId, meta, baseId, localRefs });
        this._cache.set(sch.schema, sch);
        if (addSchema && !baseId.startsWith("#")) {
          if (baseId)
            this._checkUnique(baseId);
          this.refs[baseId] = sch;
        }
        if (validateSchema)
          this.validateSchema(schema, true);
        return sch;
      }
      _checkUnique(id) {
        if (this.schemas[id] || this.refs[id]) {
          throw new Error(`schema with key or id "${id}" already exists`);
        }
      }
      _compileSchemaEnv(sch) {
        if (sch.meta)
          this._compileMetaSchema(sch);
        else
          compile_1.compileSchema.call(this, sch);
        if (!sch.validate)
          throw new Error("ajv implementation error");
        return sch.validate;
      }
      _compileMetaSchema(sch) {
        const currentOpts = this.opts;
        this.opts = this._metaOpts;
        try {
          compile_1.compileSchema.call(this, sch);
        } finally {
          this.opts = currentOpts;
        }
      }
    };
    Ajv.ValidationError = validation_error_1.default;
    Ajv.MissingRefError = ref_error_1.default;
    exports.default = Ajv;
    function checkOptions(checkOpts, options, msg, log = "error") {
      for (const key in checkOpts) {
        const opt = key;
        if (opt in options)
          this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
      }
    }
    function getSchEnv(keyRef) {
      keyRef = (0, resolve_1.normalizeId)(keyRef);
      return this.schemas[keyRef] || this.refs[keyRef];
    }
    function addInitialSchemas() {
      const optsSchemas = this.opts.schemas;
      if (!optsSchemas)
        return;
      if (Array.isArray(optsSchemas))
        this.addSchema(optsSchemas);
      else
        for (const key in optsSchemas)
          this.addSchema(optsSchemas[key], key);
    }
    function addInitialFormats() {
      for (const name in this.opts.formats) {
        const format = this.opts.formats[name];
        if (format)
          this.addFormat(name, format);
      }
    }
    function addInitialKeywords(defs) {
      if (Array.isArray(defs)) {
        this.addVocabulary(defs);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const keyword in defs) {
        const def = defs[keyword];
        if (!def.keyword)
          def.keyword = keyword;
        this.addKeyword(def);
      }
    }
    function getMetaSchemaOptions() {
      const metaOpts = { ...this.opts };
      for (const opt of META_IGNORE_OPTIONS)
        delete metaOpts[opt];
      return metaOpts;
    }
    var noLogs = { log() {
    }, warn() {
    }, error() {
    } };
    function getLogger(logger) {
      if (logger === false)
        return noLogs;
      if (logger === void 0)
        return console;
      if (logger.log && logger.warn && logger.error)
        return logger;
      throw new Error("logger must implement log, warn and error methods");
    }
    var KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
    function checkKeyword(keyword, def) {
      const { RULES } = this;
      (0, util_1.eachItem)(keyword, (kwd) => {
        if (RULES.keywords[kwd])
          throw new Error(`Keyword ${kwd} is already defined`);
        if (!KEYWORD_NAME.test(kwd))
          throw new Error(`Keyword ${kwd} has invalid name`);
      });
      if (!def)
        return;
      if (def.$data && !("code" in def || "validate" in def)) {
        throw new Error('$data keyword must have "code" or "validate" function');
      }
    }
    function addRule(keyword, definition, dataType) {
      var _a;
      const post = definition === null || definition === void 0 ? void 0 : definition.post;
      if (dataType && post)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES } = this;
      let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
      if (!ruleGroup) {
        ruleGroup = { type: dataType, rules: [] };
        RULES.rules.push(ruleGroup);
      }
      RULES.keywords[keyword] = true;
      if (!definition)
        return;
      const rule = {
        keyword,
        definition: {
          ...definition,
          type: (0, dataType_1.getJSONTypes)(definition.type),
          schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType)
        }
      };
      if (definition.before)
        addBeforeRule.call(this, ruleGroup, rule, definition.before);
      else
        ruleGroup.rules.push(rule);
      RULES.all[keyword] = rule;
      (_a = definition.implements) === null || _a === void 0 ? void 0 : _a.forEach((kwd) => this.addKeyword(kwd));
    }
    function addBeforeRule(ruleGroup, rule, before) {
      const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
      if (i >= 0) {
        ruleGroup.rules.splice(i, 0, rule);
      } else {
        ruleGroup.rules.push(rule);
        this.logger.warn(`rule ${before} is not defined`);
      }
    }
    function keywordMetaschema(def) {
      let { metaSchema } = def;
      if (metaSchema === void 0)
        return;
      if (def.$data && this.opts.$data)
        metaSchema = schemaOrData(metaSchema);
      def.validateSchema = this.compile(metaSchema, true);
    }
    var $dataRef = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function schemaOrData(schema) {
      return { anyOf: [schema, $dataRef] };
    }
  }
});

// node_modules/ajv/dist/vocabularies/core/id.js
var require_id = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/id.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var def = {
      keyword: "id",
      code() {
        throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/ref.js
var require_ref = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/ref.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.callRef = exports.getValidate = void 0;
    var ref_error_1 = require_ref_error();
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var compile_1 = require_compile();
    var util_1 = require_util();
    var def = {
      keyword: "$ref",
      schemaType: "string",
      code(cxt) {
        const { gen, schema: $ref, it } = cxt;
        const { baseId, schemaEnv: env, validateName, opts, self } = it;
        const { root } = env;
        if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
          return callRootRef();
        const schOrEnv = compile_1.resolveRef.call(self, root, baseId, $ref);
        if (schOrEnv === void 0)
          throw new ref_error_1.default(it.opts.uriResolver, baseId, $ref);
        if (schOrEnv instanceof compile_1.SchemaEnv)
          return callValidate(schOrEnv);
        return inlineRefSchema(schOrEnv);
        function callRootRef() {
          if (env === root)
            return callRef(cxt, validateName, env, env.$async);
          const rootName = gen.scopeValue("root", { ref: root });
          return callRef(cxt, (0, codegen_1._)`${rootName}.validate`, root, root.$async);
        }
        function callValidate(sch) {
          const v = getValidate(cxt, sch);
          callRef(cxt, v, sch, sch.$async);
        }
        function inlineRefSchema(sch) {
          const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1.stringify)(sch) } : { ref: sch });
          const valid = gen.name("valid");
          const schCxt = cxt.subschema({
            schema: sch,
            dataTypes: [],
            schemaPath: codegen_1.nil,
            topSchemaRef: schName,
            errSchemaPath: $ref
          }, valid);
          cxt.mergeEvaluated(schCxt);
          cxt.ok(valid);
        }
      }
    };
    function getValidate(cxt, sch) {
      const { gen } = cxt;
      return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
    }
    exports.getValidate = getValidate;
    function callRef(cxt, v, sch, $async) {
      const { gen, it } = cxt;
      const { allErrors, schemaEnv: env, opts } = it;
      const passCxt = opts.passContext ? names_1.default.this : codegen_1.nil;
      if ($async)
        callAsyncRef();
      else
        callSyncRef();
      function callAsyncRef() {
        if (!env.$async)
          throw new Error("async schema referenced by sync schema");
        const valid = gen.let("valid");
        gen.try(() => {
          gen.code((0, codegen_1._)`await ${(0, code_1.callValidateCode)(cxt, v, passCxt)}`);
          addEvaluatedFrom(v);
          if (!allErrors)
            gen.assign(valid, true);
        }, (e) => {
          gen.if((0, codegen_1._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
          addErrorsFrom(e);
          if (!allErrors)
            gen.assign(valid, false);
        });
        cxt.ok(valid);
      }
      function callSyncRef() {
        cxt.result((0, code_1.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
      }
      function addErrorsFrom(source) {
        const errs = (0, codegen_1._)`${source}.errors`;
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`);
        gen.assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
      }
      function addEvaluatedFrom(source) {
        var _a;
        if (!it.opts.unevaluated)
          return;
        const schEvaluated = (_a = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a === void 0 ? void 0 : _a.evaluated;
        if (it.props !== true) {
          if (schEvaluated && !schEvaluated.dynamicProps) {
            if (schEvaluated.props !== void 0) {
              it.props = util_1.mergeEvaluated.props(gen, schEvaluated.props, it.props);
            }
          } else {
            const props = gen.var("props", (0, codegen_1._)`${source}.evaluated.props`);
            it.props = util_1.mergeEvaluated.props(gen, props, it.props, codegen_1.Name);
          }
        }
        if (it.items !== true) {
          if (schEvaluated && !schEvaluated.dynamicItems) {
            if (schEvaluated.items !== void 0) {
              it.items = util_1.mergeEvaluated.items(gen, schEvaluated.items, it.items);
            }
          } else {
            const items = gen.var("items", (0, codegen_1._)`${source}.evaluated.items`);
            it.items = util_1.mergeEvaluated.items(gen, items, it.items, codegen_1.Name);
          }
        }
      }
    }
    exports.callRef = callRef;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/index.js
var require_core2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var id_1 = require_id();
    var ref_1 = require_ref();
    var core = [
      "$schema",
      "$id",
      "$defs",
      "$vocabulary",
      { keyword: "$comment" },
      "definitions",
      id_1.default,
      ref_1.default
    ];
    exports.default = core;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitNumber.js
var require_limitNumber = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitNumber.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var error = {
      message: ({ keyword, schemaCode }) => (0, codegen_1.str)`must be ${KWDs[keyword].okStr} ${schemaCode}`,
      params: ({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
    };
    var def = {
      keyword: Object.keys(KWDs),
      type: "number",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        cxt.fail$data((0, codegen_1._)`${data} ${KWDs[keyword].fail} ${schemaCode} || isNaN(${data})`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/multipleOf.js
var require_multipleOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/multipleOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must be multiple of ${schemaCode}`,
      params: ({ schemaCode }) => (0, codegen_1._)`{multipleOf: ${schemaCode}}`
    };
    var def = {
      keyword: "multipleOf",
      type: "number",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, schemaCode, it } = cxt;
        const prec = it.opts.multipleOfPrecision;
        const res = gen.let("res");
        const invalid = prec ? (0, codegen_1._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1._)`${res} !== parseInt(${res})`;
        cxt.fail$data((0, codegen_1._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitLength.js
var require_limitLength = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitLength.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var ucs2length_1 = require_ucs2length();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxLength" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} characters`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxLength", "minLength"],
      type: "string",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode, it } = cxt;
        const op = keyword === "maxLength" ? codegen_1.operators.GT : codegen_1.operators.LT;
        const len = it.opts.unicode === false ? (0, codegen_1._)`${data}.length` : (0, codegen_1._)`${(0, util_1.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
        cxt.fail$data((0, codegen_1._)`${len} ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/pattern.js
var require_pattern = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/pattern.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var util_1 = require_util();
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match pattern "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{pattern: ${schemaCode}}`
    };
    var def = {
      keyword: "pattern",
      type: "string",
      schemaType: "string",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const u = it.opts.unicodeRegExp ? "u" : "";
        if ($data) {
          const { regExp } = it.opts.code;
          const regExpCode = regExp.code === "new RegExp" ? (0, codegen_1._)`new RegExp` : (0, util_1.useFunc)(gen, regExp);
          const valid = gen.let("valid");
          gen.try(() => gen.assign(valid, (0, codegen_1._)`${regExpCode}(${schemaCode}, ${u}).test(${data})`), () => gen.assign(valid, false));
          cxt.fail$data((0, codegen_1._)`!${valid}`);
        } else {
          const regExp = (0, code_1.usePattern)(cxt, schema);
          cxt.fail$data((0, codegen_1._)`!${regExp}.test(${data})`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitProperties.js
var require_limitProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxProperties" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} properties`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxProperties", "minProperties"],
      type: "object",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxProperties" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`Object.keys(${data}).length ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/required.js
var require_required = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/required.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { missingProperty } }) => (0, codegen_1.str)`must have required property '${missingProperty}'`,
      params: ({ params: { missingProperty } }) => (0, codegen_1._)`{missingProperty: ${missingProperty}}`
    };
    var def = {
      keyword: "required",
      type: "object",
      schemaType: "array",
      $data: true,
      error,
      code(cxt) {
        const { gen, schema, schemaCode, data, $data, it } = cxt;
        const { opts } = it;
        if (!$data && schema.length === 0)
          return;
        const useLoop = schema.length >= opts.loopRequired;
        if (it.allErrors)
          allErrorsMode();
        else
          exitOnErrorMode();
        if (opts.strictRequired) {
          const props = cxt.parentSchema.properties;
          const { definedProperties } = cxt.it;
          for (const requiredKey of schema) {
            if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 && !definedProperties.has(requiredKey)) {
              const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
              const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
              (0, util_1.checkStrictMode)(it, msg, it.opts.strictRequired);
            }
          }
        }
        function allErrorsMode() {
          if (useLoop || $data) {
            cxt.block$data(codegen_1.nil, loopAllRequired);
          } else {
            for (const prop of schema) {
              (0, code_1.checkReportMissingProp)(cxt, prop);
            }
          }
        }
        function exitOnErrorMode() {
          const missing = gen.let("missing");
          if (useLoop || $data) {
            const valid = gen.let("valid", true);
            cxt.block$data(valid, () => loopUntilMissing(missing, valid));
            cxt.ok(valid);
          } else {
            gen.if((0, code_1.checkMissingProp)(cxt, schema, missing));
            (0, code_1.reportMissingProp)(cxt, missing);
            gen.else();
          }
        }
        function loopAllRequired() {
          gen.forOf("prop", schemaCode, (prop) => {
            cxt.setParams({ missingProperty: prop });
            gen.if((0, code_1.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
          });
        }
        function loopUntilMissing(missing, valid) {
          cxt.setParams({ missingProperty: missing });
          gen.forOf(missing, schemaCode, () => {
            gen.assign(valid, (0, code_1.propertyInData)(gen, data, missing, opts.ownProperties));
            gen.if((0, codegen_1.not)(valid), () => {
              cxt.error();
              gen.break();
            });
          }, codegen_1.nil);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitItems.js
var require_limitItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxItems" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} items`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxItems", "minItems"],
      type: "array",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxItems" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`${data}.length ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/runtime/equal.js
var require_equal = __commonJS({
  "node_modules/ajv/dist/runtime/equal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var equal = require_fast_deep_equal();
    equal.code = 'require("ajv/dist/runtime/equal").default';
    exports.default = equal;
  }
});

// node_modules/ajv/dist/vocabularies/validation/uniqueItems.js
var require_uniqueItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/uniqueItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dataType_1 = require_dataType();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: ({ params: { i, j } }) => (0, codegen_1.str)`must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
      params: ({ params: { i, j } }) => (0, codegen_1._)`{i: ${i}, j: ${j}}`
    };
    var def = {
      keyword: "uniqueItems",
      type: "array",
      schemaType: "boolean",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
        if (!$data && !schema)
          return;
        const valid = gen.let("valid");
        const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
        cxt.block$data(valid, validateUniqueItems, (0, codegen_1._)`${schemaCode} === false`);
        cxt.ok(valid);
        function validateUniqueItems() {
          const i = gen.let("i", (0, codegen_1._)`${data}.length`);
          const j = gen.let("j");
          cxt.setParams({ i, j });
          gen.assign(valid, true);
          gen.if((0, codegen_1._)`${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
        }
        function canOptimize() {
          return itemTypes.length > 0 && !itemTypes.some((t) => t === "object" || t === "array");
        }
        function loopN(i, j) {
          const item = gen.name("item");
          const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
          const indices = gen.const("indices", (0, codegen_1._)`{}`);
          gen.for((0, codegen_1._)`;${i}--;`, () => {
            gen.let(item, (0, codegen_1._)`${data}[${i}]`);
            gen.if(wrongType, (0, codegen_1._)`continue`);
            if (itemTypes.length > 1)
              gen.if((0, codegen_1._)`typeof ${item} == "string"`, (0, codegen_1._)`${item} += "_"`);
            gen.if((0, codegen_1._)`typeof ${indices}[${item}] == "number"`, () => {
              gen.assign(j, (0, codegen_1._)`${indices}[${item}]`);
              cxt.error();
              gen.assign(valid, false).break();
            }).code((0, codegen_1._)`${indices}[${item}] = ${i}`);
          });
        }
        function loopN2(i, j) {
          const eql = (0, util_1.useFunc)(gen, equal_1.default);
          const outer = gen.name("outer");
          gen.label(outer).for((0, codegen_1._)`;${i}--;`, () => gen.for((0, codegen_1._)`${j} = ${i}; ${j}--;`, () => gen.if((0, codegen_1._)`${eql}(${data}[${i}], ${data}[${j}])`, () => {
            cxt.error();
            gen.assign(valid, false).break(outer);
          })));
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/const.js
var require_const = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/const.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: "must be equal to constant",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValue: ${schemaCode}}`
    };
    var def = {
      keyword: "const",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schemaCode, schema } = cxt;
        if ($data || schema && typeof schema == "object") {
          cxt.fail$data((0, codegen_1._)`!${(0, util_1.useFunc)(gen, equal_1.default)}(${data}, ${schemaCode})`);
        } else {
          cxt.fail((0, codegen_1._)`${schema} !== ${data}`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/enum.js
var require_enum = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/enum.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValues: ${schemaCode}}`
    };
    var def = {
      keyword: "enum",
      schemaType: "array",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        if (!$data && schema.length === 0)
          throw new Error("enum must have non-empty array");
        const useLoop = schema.length >= it.opts.loopEnum;
        let eql;
        const getEql = () => eql !== null && eql !== void 0 ? eql : eql = (0, util_1.useFunc)(gen, equal_1.default);
        let valid;
        if (useLoop || $data) {
          valid = gen.let("valid");
          cxt.block$data(valid, loopEnum);
        } else {
          if (!Array.isArray(schema))
            throw new Error("ajv implementation error");
          const vSchema = gen.const("vSchema", schemaCode);
          valid = (0, codegen_1.or)(...schema.map((_x, i) => equalCode(vSchema, i)));
        }
        cxt.pass(valid);
        function loopEnum() {
          gen.assign(valid, false);
          gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1._)`${getEql()}(${data}, ${v})`, () => gen.assign(valid, true).break()));
        }
        function equalCode(vSchema, i) {
          const sch = schema[i];
          return typeof sch === "object" && sch !== null ? (0, codegen_1._)`${getEql()}(${data}, ${vSchema}[${i}])` : (0, codegen_1._)`${data} === ${sch}`;
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/index.js
var require_validation = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var limitNumber_1 = require_limitNumber();
    var multipleOf_1 = require_multipleOf();
    var limitLength_1 = require_limitLength();
    var pattern_1 = require_pattern();
    var limitProperties_1 = require_limitProperties();
    var required_1 = require_required();
    var limitItems_1 = require_limitItems();
    var uniqueItems_1 = require_uniqueItems();
    var const_1 = require_const();
    var enum_1 = require_enum();
    var validation = [
      // number
      limitNumber_1.default,
      multipleOf_1.default,
      // string
      limitLength_1.default,
      pattern_1.default,
      // object
      limitProperties_1.default,
      required_1.default,
      // array
      limitItems_1.default,
      uniqueItems_1.default,
      // any
      { keyword: "type", schemaType: ["string", "array"] },
      { keyword: "nullable", schemaType: "boolean" },
      const_1.default,
      enum_1.default
    ];
    exports.default = validation;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalItems.js
var require_additionalItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateAdditionalItems = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "additionalItems",
      type: "array",
      schemaType: ["boolean", "object"],
      before: "uniqueItems",
      error,
      code(cxt) {
        const { parentSchema, it } = cxt;
        const { items } = parentSchema;
        if (!Array.isArray(items)) {
          (0, util_1.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
          return;
        }
        validateAdditionalItems(cxt, items);
      }
    };
    function validateAdditionalItems(cxt, items) {
      const { gen, schema, data, keyword, it } = cxt;
      it.items = true;
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      if (schema === false) {
        cxt.setParams({ len: items.length });
        cxt.pass((0, codegen_1._)`${len} <= ${items.length}`);
      } else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
        const valid = gen.var("valid", (0, codegen_1._)`${len} <= ${items.length}`);
        gen.if((0, codegen_1.not)(valid), () => validateItems(valid));
        cxt.ok(valid);
      }
      function validateItems(valid) {
        gen.forRange("i", items.length, len, (i) => {
          cxt.subschema({ keyword, dataProp: i, dataPropType: util_1.Type.Num }, valid);
          if (!it.allErrors)
            gen.if((0, codegen_1.not)(valid), () => gen.break());
        });
      }
    }
    exports.validateAdditionalItems = validateAdditionalItems;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items.js
var require_items = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateTuple = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "array", "boolean"],
      before: "uniqueItems",
      code(cxt) {
        const { schema, it } = cxt;
        if (Array.isArray(schema))
          return validateTuple(cxt, "additionalItems", schema);
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    function validateTuple(cxt, extraItems, schArr = cxt.schema) {
      const { gen, parentSchema, data, keyword, it } = cxt;
      checkStrictTuple(parentSchema);
      if (it.opts.unevaluated && schArr.length && it.items !== true) {
        it.items = util_1.mergeEvaluated.items(gen, schArr.length, it.items);
      }
      const valid = gen.name("valid");
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      schArr.forEach((sch, i) => {
        if ((0, util_1.alwaysValidSchema)(it, sch))
          return;
        gen.if((0, codegen_1._)`${len} > ${i}`, () => cxt.subschema({
          keyword,
          schemaProp: i,
          dataProp: i
        }, valid));
        cxt.ok(valid);
      });
      function checkStrictTuple(sch) {
        const { opts, errSchemaPath } = it;
        const l = schArr.length;
        const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
        if (opts.strictTuples && !fullTuple) {
          const msg = `"${keyword}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
          (0, util_1.checkStrictMode)(it, msg, opts.strictTuples);
        }
      }
    }
    exports.validateTuple = validateTuple;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/prefixItems.js
var require_prefixItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/prefixItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var items_1 = require_items();
    var def = {
      keyword: "prefixItems",
      type: "array",
      schemaType: ["array"],
      before: "uniqueItems",
      code: (cxt) => (0, items_1.validateTuple)(cxt, "items")
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items2020.js
var require_items2020 = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items2020.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var additionalItems_1 = require_additionalItems();
    var error = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      error,
      code(cxt) {
        const { schema, parentSchema, it } = cxt;
        const { prefixItems } = parentSchema;
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        if (prefixItems)
          (0, additionalItems_1.validateAdditionalItems)(cxt, prefixItems);
        else
          cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/contains.js
var require_contains = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/contains.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1.str)`must contain at least ${min} valid item(s)` : (0, codegen_1.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
      params: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1._)`{minContains: ${min}}` : (0, codegen_1._)`{minContains: ${min}, maxContains: ${max}}`
    };
    var def = {
      keyword: "contains",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        let min;
        let max;
        const { minContains, maxContains } = parentSchema;
        if (it.opts.next) {
          min = minContains === void 0 ? 1 : minContains;
          max = maxContains;
        } else {
          min = 1;
        }
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        cxt.setParams({ min, max });
        if (max === void 0 && min === 0) {
          (0, util_1.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
          return;
        }
        if (max !== void 0 && min > max) {
          (0, util_1.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
          cxt.fail();
          return;
        }
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          let cond = (0, codegen_1._)`${len} >= ${min}`;
          if (max !== void 0)
            cond = (0, codegen_1._)`${cond} && ${len} <= ${max}`;
          cxt.pass(cond);
          return;
        }
        it.items = true;
        const valid = gen.name("valid");
        if (max === void 0 && min === 1) {
          validateItems(valid, () => gen.if(valid, () => gen.break()));
        } else if (min === 0) {
          gen.let(valid, true);
          if (max !== void 0)
            gen.if((0, codegen_1._)`${data}.length > 0`, validateItemsWithCount);
        } else {
          gen.let(valid, false);
          validateItemsWithCount();
        }
        cxt.result(valid, () => cxt.reset());
        function validateItemsWithCount() {
          const schValid = gen.name("_valid");
          const count = gen.let("count", 0);
          validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
        }
        function validateItems(_valid, block) {
          gen.forRange("i", 0, len, (i) => {
            cxt.subschema({
              keyword: "contains",
              dataProp: i,
              dataPropType: util_1.Type.Num,
              compositeRule: true
            }, _valid);
            block();
          });
        }
        function checkLimits(count) {
          gen.code((0, codegen_1._)`${count}++`);
          if (max === void 0) {
            gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true).break());
          } else {
            gen.if((0, codegen_1._)`${count} > ${max}`, () => gen.assign(valid, false).break());
            if (min === 1)
              gen.assign(valid, true);
            else
              gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true));
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/dependencies.js
var require_dependencies = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/dependencies.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    exports.error = {
      message: ({ params: { property, depsCount, deps } }) => {
        const property_ies = depsCount === 1 ? "property" : "properties";
        return (0, codegen_1.str)`must have ${property_ies} ${deps} when property ${property} is present`;
      },
      params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_1._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
      // TODO change to reference
    };
    var def = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: exports.error,
      code(cxt) {
        const [propDeps, schDeps] = splitDependencies(cxt);
        validatePropertyDeps(cxt, propDeps);
        validateSchemaDeps(cxt, schDeps);
      }
    };
    function splitDependencies({ schema }) {
      const propertyDeps = {};
      const schemaDeps = {};
      for (const key in schema) {
        if (key === "__proto__")
          continue;
        const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
        deps[key] = schema[key];
      }
      return [propertyDeps, schemaDeps];
    }
    function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
      const { gen, data, it } = cxt;
      if (Object.keys(propertyDeps).length === 0)
        return;
      const missing = gen.let("missing");
      for (const prop in propertyDeps) {
        const deps = propertyDeps[prop];
        if (deps.length === 0)
          continue;
        const hasProperty = (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties);
        cxt.setParams({
          property: prop,
          depsCount: deps.length,
          deps: deps.join(", ")
        });
        if (it.allErrors) {
          gen.if(hasProperty, () => {
            for (const depProp of deps) {
              (0, code_1.checkReportMissingProp)(cxt, depProp);
            }
          });
        } else {
          gen.if((0, codegen_1._)`${hasProperty} && (${(0, code_1.checkMissingProp)(cxt, deps, missing)})`);
          (0, code_1.reportMissingProp)(cxt, missing);
          gen.else();
        }
      }
    }
    exports.validatePropertyDeps = validatePropertyDeps;
    function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      for (const prop in schemaDeps) {
        if ((0, util_1.alwaysValidSchema)(it, schemaDeps[prop]))
          continue;
        gen.if(
          (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties),
          () => {
            const schCxt = cxt.subschema({ keyword, schemaProp: prop }, valid);
            cxt.mergeValidEvaluated(schCxt, valid);
          },
          () => gen.var(valid, true)
          // TODO var
        );
        cxt.ok(valid);
      }
    }
    exports.validateSchemaDeps = validateSchemaDeps;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/propertyNames.js
var require_propertyNames = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/propertyNames.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: "property name must be valid",
      params: ({ params }) => (0, codegen_1._)`{propertyName: ${params.propertyName}}`
    };
    var def = {
      keyword: "propertyNames",
      type: "object",
      schemaType: ["object", "boolean"],
      error,
      code(cxt) {
        const { gen, schema, data, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        const valid = gen.name("valid");
        gen.forIn("key", data, (key) => {
          cxt.setParams({ propertyName: key });
          cxt.subschema({
            keyword: "propertyNames",
            data: key,
            dataTypes: ["string"],
            propertyName: key,
            compositeRule: true
          }, valid);
          gen.if((0, codegen_1.not)(valid), () => {
            cxt.error(true);
            if (!it.allErrors)
              gen.break();
          });
        });
        cxt.ok(valid);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js
var require_additionalProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var util_1 = require_util();
    var error = {
      message: "must NOT have additional properties",
      params: ({ params }) => (0, codegen_1._)`{additionalProperty: ${params.additionalProperty}}`
    };
    var def = {
      keyword: "additionalProperties",
      type: ["object"],
      schemaType: ["boolean", "object"],
      allowUndefined: true,
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, data, errsCount, it } = cxt;
        if (!errsCount)
          throw new Error("ajv implementation error");
        const { allErrors, opts } = it;
        it.props = true;
        if (opts.removeAdditional !== "all" && (0, util_1.alwaysValidSchema)(it, schema))
          return;
        const props = (0, code_1.allSchemaProperties)(parentSchema.properties);
        const patProps = (0, code_1.allSchemaProperties)(parentSchema.patternProperties);
        checkAdditionalProperties();
        cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
        function checkAdditionalProperties() {
          gen.forIn("key", data, (key) => {
            if (!props.length && !patProps.length)
              additionalPropertyCode(key);
            else
              gen.if(isAdditional(key), () => additionalPropertyCode(key));
          });
        }
        function isAdditional(key) {
          let definedProp;
          if (props.length > 8) {
            const propsSchema = (0, util_1.schemaRefOrVal)(it, parentSchema.properties, "properties");
            definedProp = (0, code_1.isOwnProperty)(gen, propsSchema, key);
          } else if (props.length) {
            definedProp = (0, codegen_1.or)(...props.map((p2) => (0, codegen_1._)`${key} === ${p2}`));
          } else {
            definedProp = codegen_1.nil;
          }
          if (patProps.length) {
            definedProp = (0, codegen_1.or)(definedProp, ...patProps.map((p2) => (0, codegen_1._)`${(0, code_1.usePattern)(cxt, p2)}.test(${key})`));
          }
          return (0, codegen_1.not)(definedProp);
        }
        function deleteAdditional(key) {
          gen.code((0, codegen_1._)`delete ${data}[${key}]`);
        }
        function additionalPropertyCode(key) {
          if (opts.removeAdditional === "all" || opts.removeAdditional && schema === false) {
            deleteAdditional(key);
            return;
          }
          if (schema === false) {
            cxt.setParams({ additionalProperty: key });
            cxt.error();
            if (!allErrors)
              gen.break();
            return;
          }
          if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
            const valid = gen.name("valid");
            if (opts.removeAdditional === "failing") {
              applyAdditionalSchema(key, valid, false);
              gen.if((0, codegen_1.not)(valid), () => {
                cxt.reset();
                deleteAdditional(key);
              });
            } else {
              applyAdditionalSchema(key, valid);
              if (!allErrors)
                gen.if((0, codegen_1.not)(valid), () => gen.break());
            }
          }
        }
        function applyAdditionalSchema(key, valid, errors) {
          const subschema = {
            keyword: "additionalProperties",
            dataProp: key,
            dataPropType: util_1.Type.Str
          };
          if (errors === false) {
            Object.assign(subschema, {
              compositeRule: true,
              createErrors: false,
              allErrors: false
            });
          }
          cxt.subschema(subschema, valid);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/properties.js
var require_properties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/properties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var validate_1 = require_validate();
    var code_1 = require_code2();
    var util_1 = require_util();
    var additionalProperties_1 = require_additionalProperties();
    var def = {
      keyword: "properties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === void 0) {
          additionalProperties_1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1.default, "additionalProperties"));
        }
        const allProps = (0, code_1.allSchemaProperties)(schema);
        for (const prop of allProps) {
          it.definedProperties.add(prop);
        }
        if (it.opts.unevaluated && allProps.length && it.props !== true) {
          it.props = util_1.mergeEvaluated.props(gen, (0, util_1.toHash)(allProps), it.props);
        }
        const properties = allProps.filter((p2) => !(0, util_1.alwaysValidSchema)(it, schema[p2]));
        if (properties.length === 0)
          return;
        const valid = gen.name("valid");
        for (const prop of properties) {
          if (hasDefault(prop)) {
            applyPropertySchema(prop);
          } else {
            gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties));
            applyPropertySchema(prop);
            if (!it.allErrors)
              gen.else().var(valid, true);
            gen.endIf();
          }
          cxt.it.definedProperties.add(prop);
          cxt.ok(valid);
        }
        function hasDefault(prop) {
          return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== void 0;
        }
        function applyPropertySchema(prop) {
          cxt.subschema({
            keyword: "properties",
            schemaProp: prop,
            dataProp: prop
          }, valid);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/patternProperties.js
var require_patternProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/patternProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var util_2 = require_util();
    var def = {
      keyword: "patternProperties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, data, parentSchema, it } = cxt;
        const { opts } = it;
        const patterns = (0, code_1.allSchemaProperties)(schema);
        const alwaysValidPatterns = patterns.filter((p2) => (0, util_1.alwaysValidSchema)(it, schema[p2]));
        if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) {
          return;
        }
        const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
        const valid = gen.name("valid");
        if (it.props !== true && !(it.props instanceof codegen_1.Name)) {
          it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
        }
        const { props } = it;
        validatePatternProperties();
        function validatePatternProperties() {
          for (const pat of patterns) {
            if (checkProperties)
              checkMatchingProperties(pat);
            if (it.allErrors) {
              validateProperties(pat);
            } else {
              gen.var(valid, true);
              validateProperties(pat);
              gen.if(valid);
            }
          }
        }
        function checkMatchingProperties(pat) {
          for (const prop in checkProperties) {
            if (new RegExp(pat).test(prop)) {
              (0, util_1.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
            }
          }
        }
        function validateProperties(pat) {
          gen.forIn("key", data, (key) => {
            gen.if((0, codegen_1._)`${(0, code_1.usePattern)(cxt, pat)}.test(${key})`, () => {
              const alwaysValid = alwaysValidPatterns.includes(pat);
              if (!alwaysValid) {
                cxt.subschema({
                  keyword: "patternProperties",
                  schemaProp: pat,
                  dataProp: key,
                  dataPropType: util_2.Type.Str
                }, valid);
              }
              if (it.opts.unevaluated && props !== true) {
                gen.assign((0, codegen_1._)`${props}[${key}]`, true);
              } else if (!alwaysValid && !it.allErrors) {
                gen.if((0, codegen_1.not)(valid), () => gen.break());
              }
            });
          });
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/not.js
var require_not = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/not.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "not",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      code(cxt) {
        const { gen, schema, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          cxt.fail();
          return;
        }
        const valid = gen.name("valid");
        cxt.subschema({
          keyword: "not",
          compositeRule: true,
          createErrors: false,
          allErrors: false
        }, valid);
        cxt.failResult(valid, () => cxt.reset(), () => cxt.error());
      },
      error: { message: "must NOT be valid" }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/anyOf.js
var require_anyOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/anyOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var def = {
      keyword: "anyOf",
      schemaType: "array",
      trackErrors: true,
      code: code_1.validateUnion,
      error: { message: "must match a schema in anyOf" }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/oneOf.js
var require_oneOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/oneOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: "must match exactly one schema in oneOf",
      params: ({ params }) => (0, codegen_1._)`{passingSchemas: ${params.passing}}`
    };
    var def = {
      keyword: "oneOf",
      schemaType: "array",
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        if (it.opts.discriminator && parentSchema.discriminator)
          return;
        const schArr = schema;
        const valid = gen.let("valid", false);
        const passing = gen.let("passing", null);
        const schValid = gen.name("_valid");
        cxt.setParams({ passing });
        gen.block(validateOneOf);
        cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
        function validateOneOf() {
          schArr.forEach((sch, i) => {
            let schCxt;
            if ((0, util_1.alwaysValidSchema)(it, sch)) {
              gen.var(schValid, true);
            } else {
              schCxt = cxt.subschema({
                keyword: "oneOf",
                schemaProp: i,
                compositeRule: true
              }, schValid);
            }
            if (i > 0) {
              gen.if((0, codegen_1._)`${schValid} && ${valid}`).assign(valid, false).assign(passing, (0, codegen_1._)`[${passing}, ${i}]`).else();
            }
            gen.if(schValid, () => {
              gen.assign(valid, true);
              gen.assign(passing, i);
              if (schCxt)
                cxt.mergeEvaluated(schCxt, codegen_1.Name);
            });
          });
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/allOf.js
var require_allOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/allOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "allOf",
      schemaType: "array",
      code(cxt) {
        const { gen, schema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        const valid = gen.name("valid");
        schema.forEach((sch, i) => {
          if ((0, util_1.alwaysValidSchema)(it, sch))
            return;
          const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i }, valid);
          cxt.ok(valid);
          cxt.mergeEvaluated(schCxt);
        });
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/if.js
var require_if = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/if.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params }) => (0, codegen_1.str)`must match "${params.ifClause}" schema`,
      params: ({ params }) => (0, codegen_1._)`{failingKeyword: ${params.ifClause}}`
    };
    var def = {
      keyword: "if",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, parentSchema, it } = cxt;
        if (parentSchema.then === void 0 && parentSchema.else === void 0) {
          (0, util_1.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
        }
        const hasThen = hasSchema(it, "then");
        const hasElse = hasSchema(it, "else");
        if (!hasThen && !hasElse)
          return;
        const valid = gen.let("valid", true);
        const schValid = gen.name("_valid");
        validateIf();
        cxt.reset();
        if (hasThen && hasElse) {
          const ifClause = gen.let("ifClause");
          cxt.setParams({ ifClause });
          gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
        } else if (hasThen) {
          gen.if(schValid, validateClause("then"));
        } else {
          gen.if((0, codegen_1.not)(schValid), validateClause("else"));
        }
        cxt.pass(valid, () => cxt.error(true));
        function validateIf() {
          const schCxt = cxt.subschema({
            keyword: "if",
            compositeRule: true,
            createErrors: false,
            allErrors: false
          }, schValid);
          cxt.mergeEvaluated(schCxt);
        }
        function validateClause(keyword, ifClause) {
          return () => {
            const schCxt = cxt.subschema({ keyword }, schValid);
            gen.assign(valid, schValid);
            cxt.mergeValidEvaluated(schCxt, valid);
            if (ifClause)
              gen.assign(ifClause, (0, codegen_1._)`${keyword}`);
            else
              cxt.setParams({ ifClause: keyword });
          };
        }
      }
    };
    function hasSchema(it, keyword) {
      const schema = it.schema[keyword];
      return schema !== void 0 && !(0, util_1.alwaysValidSchema)(it, schema);
    }
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/thenElse.js
var require_thenElse = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/thenElse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: ["then", "else"],
      schemaType: ["object", "boolean"],
      code({ keyword, parentSchema, it }) {
        if (parentSchema.if === void 0)
          (0, util_1.checkStrictMode)(it, `"${keyword}" without "if" is ignored`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/index.js
var require_applicator = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var additionalItems_1 = require_additionalItems();
    var prefixItems_1 = require_prefixItems();
    var items_1 = require_items();
    var items2020_1 = require_items2020();
    var contains_1 = require_contains();
    var dependencies_1 = require_dependencies();
    var propertyNames_1 = require_propertyNames();
    var additionalProperties_1 = require_additionalProperties();
    var properties_1 = require_properties();
    var patternProperties_1 = require_patternProperties();
    var not_1 = require_not();
    var anyOf_1 = require_anyOf();
    var oneOf_1 = require_oneOf();
    var allOf_1 = require_allOf();
    var if_1 = require_if();
    var thenElse_1 = require_thenElse();
    function getApplicator(draft2020 = false) {
      const applicator = [
        // any
        not_1.default,
        anyOf_1.default,
        oneOf_1.default,
        allOf_1.default,
        if_1.default,
        thenElse_1.default,
        // object
        propertyNames_1.default,
        additionalProperties_1.default,
        dependencies_1.default,
        properties_1.default,
        patternProperties_1.default
      ];
      if (draft2020)
        applicator.push(prefixItems_1.default, items2020_1.default);
      else
        applicator.push(additionalItems_1.default, items_1.default);
      applicator.push(contains_1.default);
      return applicator;
    }
    exports.default = getApplicator;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/dynamicAnchor.js
var require_dynamicAnchor = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/dynamicAnchor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dynamicAnchor = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var compile_1 = require_compile();
    var ref_1 = require_ref();
    var def = {
      keyword: "$dynamicAnchor",
      schemaType: "string",
      code: (cxt) => dynamicAnchor(cxt, cxt.schema)
    };
    function dynamicAnchor(cxt, anchor) {
      const { gen, it } = cxt;
      it.schemaEnv.root.dynamicAnchors[anchor] = true;
      const v = (0, codegen_1._)`${names_1.default.dynamicAnchors}${(0, codegen_1.getProperty)(anchor)}`;
      const validate = it.errSchemaPath === "#" ? it.validateName : _getValidate(cxt);
      gen.if((0, codegen_1._)`!${v}`, () => gen.assign(v, validate));
    }
    exports.dynamicAnchor = dynamicAnchor;
    function _getValidate(cxt) {
      const { schemaEnv, schema, self } = cxt.it;
      const { root, baseId, localRefs, meta } = schemaEnv.root;
      const { schemaId } = self.opts;
      const sch = new compile_1.SchemaEnv({ schema, schemaId, root, baseId, localRefs, meta });
      compile_1.compileSchema.call(self, sch);
      return (0, ref_1.getValidate)(cxt, sch);
    }
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/dynamicRef.js
var require_dynamicRef = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/dynamicRef.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dynamicRef = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var ref_1 = require_ref();
    var def = {
      keyword: "$dynamicRef",
      schemaType: "string",
      code: (cxt) => dynamicRef(cxt, cxt.schema)
    };
    function dynamicRef(cxt, ref) {
      const { gen, keyword, it } = cxt;
      if (ref[0] !== "#")
        throw new Error(`"${keyword}" only supports hash fragment reference`);
      const anchor = ref.slice(1);
      if (it.allErrors) {
        _dynamicRef();
      } else {
        const valid = gen.let("valid", false);
        _dynamicRef(valid);
        cxt.ok(valid);
      }
      function _dynamicRef(valid) {
        if (it.schemaEnv.root.dynamicAnchors[anchor]) {
          const v = gen.let("_v", (0, codegen_1._)`${names_1.default.dynamicAnchors}${(0, codegen_1.getProperty)(anchor)}`);
          gen.if(v, _callRef(v, valid), _callRef(it.validateName, valid));
        } else {
          _callRef(it.validateName, valid)();
        }
      }
      function _callRef(validate, valid) {
        return valid ? () => gen.block(() => {
          (0, ref_1.callRef)(cxt, validate);
          gen.let(valid, true);
        }) : () => (0, ref_1.callRef)(cxt, validate);
      }
    }
    exports.dynamicRef = dynamicRef;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/recursiveAnchor.js
var require_recursiveAnchor = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/recursiveAnchor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dynamicAnchor_1 = require_dynamicAnchor();
    var util_1 = require_util();
    var def = {
      keyword: "$recursiveAnchor",
      schemaType: "boolean",
      code(cxt) {
        if (cxt.schema)
          (0, dynamicAnchor_1.dynamicAnchor)(cxt, "");
        else
          (0, util_1.checkStrictMode)(cxt.it, "$recursiveAnchor: false is ignored");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/recursiveRef.js
var require_recursiveRef = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/recursiveRef.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dynamicRef_1 = require_dynamicRef();
    var def = {
      keyword: "$recursiveRef",
      schemaType: "string",
      code: (cxt) => (0, dynamicRef_1.dynamicRef)(cxt, cxt.schema)
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/index.js
var require_dynamic = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dynamicAnchor_1 = require_dynamicAnchor();
    var dynamicRef_1 = require_dynamicRef();
    var recursiveAnchor_1 = require_recursiveAnchor();
    var recursiveRef_1 = require_recursiveRef();
    var dynamic = [dynamicAnchor_1.default, dynamicRef_1.default, recursiveAnchor_1.default, recursiveRef_1.default];
    exports.default = dynamic;
  }
});

// node_modules/ajv/dist/vocabularies/validation/dependentRequired.js
var require_dependentRequired = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/dependentRequired.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dependencies_1 = require_dependencies();
    var def = {
      keyword: "dependentRequired",
      type: "object",
      schemaType: "object",
      error: dependencies_1.error,
      code: (cxt) => (0, dependencies_1.validatePropertyDeps)(cxt)
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/dependentSchemas.js
var require_dependentSchemas = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/dependentSchemas.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dependencies_1 = require_dependencies();
    var def = {
      keyword: "dependentSchemas",
      type: "object",
      schemaType: "object",
      code: (cxt) => (0, dependencies_1.validateSchemaDeps)(cxt)
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitContains.js
var require_limitContains = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitContains.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: ["maxContains", "minContains"],
      type: "array",
      schemaType: "number",
      code({ keyword, parentSchema, it }) {
        if (parentSchema.contains === void 0) {
          (0, util_1.checkStrictMode)(it, `"${keyword}" without "contains" is ignored`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/next.js
var require_next = __commonJS({
  "node_modules/ajv/dist/vocabularies/next.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dependentRequired_1 = require_dependentRequired();
    var dependentSchemas_1 = require_dependentSchemas();
    var limitContains_1 = require_limitContains();
    var next = [dependentRequired_1.default, dependentSchemas_1.default, limitContains_1.default];
    exports.default = next;
  }
});

// node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedProperties.js
var require_unevaluatedProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    var error = {
      message: "must NOT have unevaluated properties",
      params: ({ params }) => (0, codegen_1._)`{unevaluatedProperty: ${params.unevaluatedProperty}}`
    };
    var def = {
      keyword: "unevaluatedProperties",
      type: "object",
      schemaType: ["boolean", "object"],
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, data, errsCount, it } = cxt;
        if (!errsCount)
          throw new Error("ajv implementation error");
        const { allErrors, props } = it;
        if (props instanceof codegen_1.Name) {
          gen.if((0, codegen_1._)`${props} !== true`, () => gen.forIn("key", data, (key) => gen.if(unevaluatedDynamic(props, key), () => unevaluatedPropCode(key))));
        } else if (props !== true) {
          gen.forIn("key", data, (key) => props === void 0 ? unevaluatedPropCode(key) : gen.if(unevaluatedStatic(props, key), () => unevaluatedPropCode(key)));
        }
        it.props = true;
        cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
        function unevaluatedPropCode(key) {
          if (schema === false) {
            cxt.setParams({ unevaluatedProperty: key });
            cxt.error();
            if (!allErrors)
              gen.break();
            return;
          }
          if (!(0, util_1.alwaysValidSchema)(it, schema)) {
            const valid = gen.name("valid");
            cxt.subschema({
              keyword: "unevaluatedProperties",
              dataProp: key,
              dataPropType: util_1.Type.Str
            }, valid);
            if (!allErrors)
              gen.if((0, codegen_1.not)(valid), () => gen.break());
          }
        }
        function unevaluatedDynamic(evaluatedProps, key) {
          return (0, codegen_1._)`!${evaluatedProps} || !${evaluatedProps}[${key}]`;
        }
        function unevaluatedStatic(evaluatedProps, key) {
          const ps = [];
          for (const p2 in evaluatedProps) {
            if (evaluatedProps[p2] === true)
              ps.push((0, codegen_1._)`${key} !== ${p2}`);
          }
          return (0, codegen_1.and)(...ps);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedItems.js
var require_unevaluatedItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "unevaluatedItems",
      type: "array",
      schemaType: ["boolean", "object"],
      error,
      code(cxt) {
        const { gen, schema, data, it } = cxt;
        const items = it.items || 0;
        if (items === true)
          return;
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        if (schema === false) {
          cxt.setParams({ len: items });
          cxt.fail((0, codegen_1._)`${len} > ${items}`);
        } else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
          const valid = gen.var("valid", (0, codegen_1._)`${len} <= ${items}`);
          gen.if((0, codegen_1.not)(valid), () => validateItems(valid, items));
          cxt.ok(valid);
        }
        it.items = true;
        function validateItems(valid, from) {
          gen.forRange("i", from, len, (i) => {
            cxt.subschema({ keyword: "unevaluatedItems", dataProp: i, dataPropType: util_1.Type.Num }, valid);
            if (!it.allErrors)
              gen.if((0, codegen_1.not)(valid), () => gen.break());
          });
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/unevaluated/index.js
var require_unevaluated = __commonJS({
  "node_modules/ajv/dist/vocabularies/unevaluated/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var unevaluatedProperties_1 = require_unevaluatedProperties();
    var unevaluatedItems_1 = require_unevaluatedItems();
    var unevaluated = [unevaluatedProperties_1.default, unevaluatedItems_1.default];
    exports.default = unevaluated;
  }
});

// node_modules/ajv/dist/vocabularies/format/format.js
var require_format = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/format.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match format "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{format: ${schemaCode}}`
    };
    var def = {
      keyword: "format",
      type: ["number", "string"],
      schemaType: "string",
      $data: true,
      error,
      code(cxt, ruleType) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const { opts, errSchemaPath, schemaEnv, self } = it;
        if (!opts.validateFormats)
          return;
        if ($data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self.formats,
            code: opts.code.formats
          });
          const fDef = gen.const("fDef", (0, codegen_1._)`${fmts}[${schemaCode}]`);
          const fType = gen.let("fType");
          const format = gen.let("format");
          gen.if((0, codegen_1._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1._)`${fDef}.type || "string"`).assign(format, (0, codegen_1._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1._)`"string"`).assign(format, fDef));
          cxt.fail$data((0, codegen_1.or)(unknownFmt(), invalidFmt()));
          function unknownFmt() {
            if (opts.strictSchema === false)
              return codegen_1.nil;
            return (0, codegen_1._)`${schemaCode} && !${format}`;
          }
          function invalidFmt() {
            const callFormat = schemaEnv.$async ? (0, codegen_1._)`(${fDef}.async ? await ${format}(${data}) : ${format}(${data}))` : (0, codegen_1._)`${format}(${data})`;
            const validData = (0, codegen_1._)`(typeof ${format} == "function" ? ${callFormat} : ${format}.test(${data}))`;
            return (0, codegen_1._)`${format} && ${format} !== true && ${fType} === ${ruleType} && !${validData}`;
          }
        }
        function validateFormat() {
          const formatDef = self.formats[schema];
          if (!formatDef) {
            unknownFormat();
            return;
          }
          if (formatDef === true)
            return;
          const [fmtType, format, fmtRef] = getFormat(formatDef);
          if (fmtType === ruleType)
            cxt.pass(validCondition());
          function unknownFormat() {
            if (opts.strictSchema === false) {
              self.logger.warn(unknownMsg());
              return;
            }
            throw new Error(unknownMsg());
            function unknownMsg() {
              return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
            }
          }
          function getFormat(fmtDef) {
            const code = fmtDef instanceof RegExp ? (0, codegen_1.regexpCode)(fmtDef) : opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(schema)}` : void 0;
            const fmt = gen.scopeValue("formats", { key: schema, ref: fmtDef, code });
            if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
              return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1._)`${fmt}.validate`];
            }
            return ["string", fmtDef, fmt];
          }
          function validCondition() {
            if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
              if (!schemaEnv.$async)
                throw new Error("async format in sync schema");
              return (0, codegen_1._)`await ${fmtRef}(${data})`;
            }
            return typeof format == "function" ? (0, codegen_1._)`${fmtRef}(${data})` : (0, codegen_1._)`${fmtRef}.test(${data})`;
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/format/index.js
var require_format2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var format_1 = require_format();
    var format = [format_1.default];
    exports.default = format;
  }
});

// node_modules/ajv/dist/vocabularies/metadata.js
var require_metadata = __commonJS({
  "node_modules/ajv/dist/vocabularies/metadata.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.contentVocabulary = exports.metadataVocabulary = void 0;
    exports.metadataVocabulary = [
      "title",
      "description",
      "default",
      "deprecated",
      "readOnly",
      "writeOnly",
      "examples"
    ];
    exports.contentVocabulary = [
      "contentMediaType",
      "contentEncoding",
      "contentSchema"
    ];
  }
});

// node_modules/ajv/dist/vocabularies/draft2020.js
var require_draft2020 = __commonJS({
  "node_modules/ajv/dist/vocabularies/draft2020.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var core_1 = require_core2();
    var validation_1 = require_validation();
    var applicator_1 = require_applicator();
    var dynamic_1 = require_dynamic();
    var next_1 = require_next();
    var unevaluated_1 = require_unevaluated();
    var format_1 = require_format2();
    var metadata_1 = require_metadata();
    var draft2020Vocabularies = [
      dynamic_1.default,
      core_1.default,
      validation_1.default,
      (0, applicator_1.default)(true),
      format_1.default,
      metadata_1.metadataVocabulary,
      metadata_1.contentVocabulary,
      next_1.default,
      unevaluated_1.default
    ];
    exports.default = draft2020Vocabularies;
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/types.js
var require_types = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/types.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiscrError = void 0;
    var DiscrError;
    (function(DiscrError2) {
      DiscrError2["Tag"] = "tag";
      DiscrError2["Mapping"] = "mapping";
    })(DiscrError || (exports.DiscrError = DiscrError = {}));
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/index.js
var require_discriminator = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var types_1 = require_types();
    var compile_1 = require_compile();
    var ref_error_1 = require_ref_error();
    var util_1 = require_util();
    var error = {
      message: ({ params: { discrError, tagName } }) => discrError === types_1.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
      params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
    };
    var def = {
      keyword: "discriminator",
      type: "object",
      schemaType: "object",
      error,
      code(cxt) {
        const { gen, data, schema, parentSchema, it } = cxt;
        const { oneOf } = parentSchema;
        if (!it.opts.discriminator) {
          throw new Error("discriminator: requires discriminator option");
        }
        const tagName = schema.propertyName;
        if (typeof tagName != "string")
          throw new Error("discriminator: requires propertyName");
        if (schema.mapping)
          throw new Error("discriminator: mapping is not supported");
        if (!oneOf)
          throw new Error("discriminator: requires oneOf keyword");
        const valid = gen.let("valid", false);
        const tag = gen.const("tag", (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(tagName)}`);
        gen.if((0, codegen_1._)`typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag, tagName }));
        cxt.ok(valid);
        function validateMapping() {
          const mapping = getMapping();
          gen.if(false);
          for (const tagValue in mapping) {
            gen.elseIf((0, codegen_1._)`${tag} === ${tagValue}`);
            gen.assign(valid, applyTagSchema(mapping[tagValue]));
          }
          gen.else();
          cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag, tagName });
          gen.endIf();
        }
        function applyTagSchema(schemaProp) {
          const _valid = gen.name("valid");
          const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
          cxt.mergeEvaluated(schCxt, codegen_1.Name);
          return _valid;
        }
        function getMapping() {
          var _a;
          const oneOfMapping = {};
          const topRequired = hasRequired(parentSchema);
          let tagRequired = true;
          for (let i = 0; i < oneOf.length; i++) {
            let sch = oneOf[i];
            if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
              const ref = sch.$ref;
              sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref);
              if (sch instanceof compile_1.SchemaEnv)
                sch = sch.schema;
              if (sch === void 0)
                throw new ref_error_1.default(it.opts.uriResolver, it.baseId, ref);
            }
            const propSch = (_a = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a === void 0 ? void 0 : _a[tagName];
            if (typeof propSch != "object") {
              throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
            }
            tagRequired = tagRequired && (topRequired || hasRequired(sch));
            addMappings(propSch, i);
          }
          if (!tagRequired)
            throw new Error(`discriminator: "${tagName}" must be required`);
          return oneOfMapping;
          function hasRequired({ required }) {
            return Array.isArray(required) && required.includes(tagName);
          }
          function addMappings(sch, i) {
            if (sch.const) {
              addMapping(sch.const, i);
            } else if (sch.enum) {
              for (const tagValue of sch.enum) {
                addMapping(tagValue, i);
              }
            } else {
              throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
            }
          }
          function addMapping(tagValue, i) {
            if (typeof tagValue != "string" || tagValue in oneOfMapping) {
              throw new Error(`discriminator: "${tagName}" values must be unique strings`);
            }
            oneOfMapping[tagValue] = i;
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/schema.json
var require_schema = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/schema.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/schema",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/core": true,
        "https://json-schema.org/draft/2020-12/vocab/applicator": true,
        "https://json-schema.org/draft/2020-12/vocab/unevaluated": true,
        "https://json-schema.org/draft/2020-12/vocab/validation": true,
        "https://json-schema.org/draft/2020-12/vocab/meta-data": true,
        "https://json-schema.org/draft/2020-12/vocab/format-annotation": true,
        "https://json-schema.org/draft/2020-12/vocab/content": true
      },
      $dynamicAnchor: "meta",
      title: "Core and Validation specifications meta-schema",
      allOf: [
        { $ref: "meta/core" },
        { $ref: "meta/applicator" },
        { $ref: "meta/unevaluated" },
        { $ref: "meta/validation" },
        { $ref: "meta/meta-data" },
        { $ref: "meta/format-annotation" },
        { $ref: "meta/content" }
      ],
      type: ["object", "boolean"],
      $comment: "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.",
      properties: {
        definitions: {
          $comment: '"definitions" has been replaced by "$defs".',
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          deprecated: true,
          default: {}
        },
        dependencies: {
          $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
          type: "object",
          additionalProperties: {
            anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }]
          },
          deprecated: true,
          default: {}
        },
        $recursiveAnchor: {
          $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
          $ref: "meta/core#/$defs/anchorString",
          deprecated: true
        },
        $recursiveRef: {
          $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
          $ref: "meta/core#/$defs/uriReferenceString",
          deprecated: true
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/applicator.json
var require_applicator2 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/applicator.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/applicator",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/applicator": true
      },
      $dynamicAnchor: "meta",
      title: "Applicator vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        prefixItems: { $ref: "#/$defs/schemaArray" },
        items: { $dynamicRef: "#meta" },
        contains: { $dynamicRef: "#meta" },
        additionalProperties: { $dynamicRef: "#meta" },
        properties: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          default: {}
        },
        patternProperties: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          propertyNames: { format: "regex" },
          default: {}
        },
        dependentSchemas: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          default: {}
        },
        propertyNames: { $dynamicRef: "#meta" },
        if: { $dynamicRef: "#meta" },
        then: { $dynamicRef: "#meta" },
        else: { $dynamicRef: "#meta" },
        allOf: { $ref: "#/$defs/schemaArray" },
        anyOf: { $ref: "#/$defs/schemaArray" },
        oneOf: { $ref: "#/$defs/schemaArray" },
        not: { $dynamicRef: "#meta" }
      },
      $defs: {
        schemaArray: {
          type: "array",
          minItems: 1,
          items: { $dynamicRef: "#meta" }
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/unevaluated.json
var require_unevaluated2 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/unevaluated.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/unevaluated",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/unevaluated": true
      },
      $dynamicAnchor: "meta",
      title: "Unevaluated applicator vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        unevaluatedItems: { $dynamicRef: "#meta" },
        unevaluatedProperties: { $dynamicRef: "#meta" }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/content.json
var require_content = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/content.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/content",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/content": true
      },
      $dynamicAnchor: "meta",
      title: "Content vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        contentEncoding: { type: "string" },
        contentMediaType: { type: "string" },
        contentSchema: { $dynamicRef: "#meta" }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/core.json
var require_core3 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/core.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/core",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/core": true
      },
      $dynamicAnchor: "meta",
      title: "Core vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        $id: {
          $ref: "#/$defs/uriReferenceString",
          $comment: "Non-empty fragments not allowed.",
          pattern: "^[^#]*#?$"
        },
        $schema: { $ref: "#/$defs/uriString" },
        $ref: { $ref: "#/$defs/uriReferenceString" },
        $anchor: { $ref: "#/$defs/anchorString" },
        $dynamicRef: { $ref: "#/$defs/uriReferenceString" },
        $dynamicAnchor: { $ref: "#/$defs/anchorString" },
        $vocabulary: {
          type: "object",
          propertyNames: { $ref: "#/$defs/uriString" },
          additionalProperties: {
            type: "boolean"
          }
        },
        $comment: {
          type: "string"
        },
        $defs: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" }
        }
      },
      $defs: {
        anchorString: {
          type: "string",
          pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
        },
        uriString: {
          type: "string",
          format: "uri"
        },
        uriReferenceString: {
          type: "string",
          format: "uri-reference"
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/format-annotation.json
var require_format_annotation = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/format-annotation.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/format-annotation",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/format-annotation": true
      },
      $dynamicAnchor: "meta",
      title: "Format vocabulary meta-schema for annotation results",
      type: ["object", "boolean"],
      properties: {
        format: { type: "string" }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/meta-data.json
var require_meta_data = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/meta-data.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/meta-data",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/meta-data": true
      },
      $dynamicAnchor: "meta",
      title: "Meta-data vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        title: {
          type: "string"
        },
        description: {
          type: "string"
        },
        default: true,
        deprecated: {
          type: "boolean",
          default: false
        },
        readOnly: {
          type: "boolean",
          default: false
        },
        writeOnly: {
          type: "boolean",
          default: false
        },
        examples: {
          type: "array",
          items: true
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/validation.json
var require_validation2 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/validation.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/validation",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/validation": true
      },
      $dynamicAnchor: "meta",
      title: "Validation vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        type: {
          anyOf: [
            { $ref: "#/$defs/simpleTypes" },
            {
              type: "array",
              items: { $ref: "#/$defs/simpleTypes" },
              minItems: 1,
              uniqueItems: true
            }
          ]
        },
        const: true,
        enum: {
          type: "array",
          items: true
        },
        multipleOf: {
          type: "number",
          exclusiveMinimum: 0
        },
        maximum: {
          type: "number"
        },
        exclusiveMaximum: {
          type: "number"
        },
        minimum: {
          type: "number"
        },
        exclusiveMinimum: {
          type: "number"
        },
        maxLength: { $ref: "#/$defs/nonNegativeInteger" },
        minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" },
        pattern: {
          type: "string",
          format: "regex"
        },
        maxItems: { $ref: "#/$defs/nonNegativeInteger" },
        minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" },
        uniqueItems: {
          type: "boolean",
          default: false
        },
        maxContains: { $ref: "#/$defs/nonNegativeInteger" },
        minContains: {
          $ref: "#/$defs/nonNegativeInteger",
          default: 1
        },
        maxProperties: { $ref: "#/$defs/nonNegativeInteger" },
        minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" },
        required: { $ref: "#/$defs/stringArray" },
        dependentRequired: {
          type: "object",
          additionalProperties: {
            $ref: "#/$defs/stringArray"
          }
        }
      },
      $defs: {
        nonNegativeInteger: {
          type: "integer",
          minimum: 0
        },
        nonNegativeIntegerDefault0: {
          $ref: "#/$defs/nonNegativeInteger",
          default: 0
        },
        simpleTypes: {
          enum: ["array", "boolean", "integer", "null", "number", "object", "string"]
        },
        stringArray: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
          default: []
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/index.js
var require_json_schema_2020_12 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var metaSchema = require_schema();
    var applicator = require_applicator2();
    var unevaluated = require_unevaluated2();
    var content = require_content();
    var core = require_core3();
    var format = require_format_annotation();
    var metadata = require_meta_data();
    var validation = require_validation2();
    var META_SUPPORT_DATA = ["/properties"];
    function addMetaSchema2020($data) {
      ;
      [
        metaSchema,
        applicator,
        unevaluated,
        content,
        core,
        with$data(this, format),
        metadata,
        with$data(this, validation)
      ].forEach((sch) => this.addMetaSchema(sch, void 0, false));
      return this;
      function with$data(ajv2, sch) {
        return $data ? ajv2.$dataMetaSchema(sch, META_SUPPORT_DATA) : sch;
      }
    }
    exports.default = addMetaSchema2020;
  }
});

// node_modules/ajv/dist/2020.js
var require__ = __commonJS({
  "node_modules/ajv/dist/2020.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv2020 = void 0;
    var core_1 = require_core();
    var draft2020_1 = require_draft2020();
    var discriminator_1 = require_discriminator();
    var json_schema_2020_12_1 = require_json_schema_2020_12();
    var META_SCHEMA_ID = "https://json-schema.org/draft/2020-12/schema";
    var Ajv20202 = class extends core_1.default {
      constructor(opts = {}) {
        super({
          ...opts,
          dynamicRef: true,
          next: true,
          unevaluated: true
        });
      }
      _addVocabularies() {
        super._addVocabularies();
        draft2020_1.default.forEach((v) => this.addVocabulary(v));
        if (this.opts.discriminator)
          this.addKeyword(discriminator_1.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data, meta } = this.opts;
        if (!meta)
          return;
        json_schema_2020_12_1.default.call(this, $data);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
      }
    };
    exports.Ajv2020 = Ajv20202;
    module.exports = exports = Ajv20202;
    module.exports.Ajv2020 = Ajv20202;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ajv20202;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function() {
      return validation_error_1.default;
    } });
    var ref_error_1 = require_ref_error();
    Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: function() {
      return ref_error_1.default;
    } });
  }
});

// packages/lesson-runtime/cartesian.ts
var eps = 1e-8;
var lineDistance = (a, b, c, p2) => Math.abs(a * p2.x + b * p2.y - c) / Math.hypot(a, b);
function relationPoint(g, index = 0) {
  const t = [0, 2, -2, 1][index % 4];
  return g.b !== 0 ? { x: t, y: (g.c - g.a * t) / g.b } : { x: g.c / g.a, y: t };
}
function graphSolution(g, mode) {
  if (mode === "linear_relation") return { kind: "unique", points: [relationPoint(g)] };
  if (mode === "linear_system") {
    const d = g.d, e = g.e, f = g.f, det = g.a * e - d * g.b;
    if (Math.abs(det) > eps) return { kind: "unique", points: [{ x: (g.c * e - f * g.b) / det, y: (g.a * f - d * g.c) / det }] };
    return { kind: Math.abs(g.a * f - d * g.c) < eps && Math.abs(g.b * f - e * g.c) < eps ? "coincident" : "parallel", points: [] };
  }
  const A = g.b * g.q, B = g.a, C = -g.c;
  if (Math.abs(A) < eps) {
    const x = -C / B;
    return { kind: "unique", points: [{ x, y: g.q * x * x }] };
  }
  const delta = B * B - 4 * A * C;
  if (delta < -eps) return { kind: "none", points: [] };
  if (Math.abs(delta) <= eps) {
    const x = -B / (2 * A);
    return { kind: "unique", points: [{ x, y: g.q * x * x }] };
  }
  const v = -0.5 * (B + (B >= 0 ? 1 : -1) * Math.sqrt(delta)), xs = [v / A, C / v].sort((a, b) => a - b);
  return { kind: "two", points: xs.map((x) => ({ x, y: g.q * x * x })) };
}
function graphTargets(g) {
  return g.mode === "linear_relation" ? [relationPoint(g, g.task === "practice" ? 2 : g.task === "assessment" ? 3 : 1)] : graphSolution(g, g.mode).points;
}
function graphClass(g) {
  const k = graphSolution(g, g.mode).kind;
  return k === "parallel" || k === "none" ? 0 : k === "unique" ? 1 : k === "coincident" ? 3 : 2;
}
function graphBounds(g, mode) {
  const points = [relationPoint(g), relationPoint(g, 1), relationPoint(g, 2), relationPoint(g, 3), ...graphSolution(g, mode).points];
  if (mode === "linear_system") {
    const other = { a: g.d, b: g.e, c: g.f, snap: g.snap };
    points.push(relationPoint(other), relationPoint(other, 1));
  }
  if (mode === "line_parabola_intersection") points.push({ x: 2, y: 4 * g.q }, { x: -2, y: 4 * g.q });
  const x = Math.max(5, ...points.map((p2) => Math.abs(p2.x))) * 1.3, y = Math.max(5, ...points.map((p2) => Math.abs(p2.y))) * 1.3;
  return { xMin: -x, xMax: x, yMin: -y, yMax: y };
}
function validateGraphData(g, mode) {
  const errors = [];
  for (const key of ["a", "b", "c", ...mode === "linear_system" ? ["d", "e", "f"] : [], ...mode === "line_parabola_intersection" ? ["q"] : []]) {
    const v = g[key];
    if (typeof v !== "number" || !Number.isFinite(v) || !Number.isInteger(v) || Math.abs(v) > 12) errors.push(`${key}: h\u1EC7 s\u1ED1 ph\u1EA3i l\xE0 s\u1ED1 nguy\xEAn trong [\u221212; 12].`);
  }
  if (g.a === 0 && g.b === 0) errors.push("a v\xE0 b kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1ED3ng th\u1EDDi b\u1EB1ng 0: c\u1EA7n m\u1ED9t \u0111\u01B0\u1EDDng th\u1EB3ng.");
  if (mode === "linear_system" && g.d === 0 && g.e === 0) errors.push("d v\xE0 e kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1ED3ng th\u1EDDi b\u1EB1ng 0 \u1EDF \u0111\u01B0\u1EDDng th\u1EB3ng th\u1EE9 hai.");
  if (mode === "line_parabola_intersection" && g.q === 0) errors.push("H\u1EC7 s\u1ED1 parabol q ph\u1EA3i kh\xE1c 0.");
  if (![0, 0.5, 1].includes(g.snap)) errors.push("B\u01B0\u1EDBc ghim ch\u1EC9 nh\u1EADn 0 (t\u1EF1 do), 0,5 ho\u1EB7c 1.");
  if (errors.length) return errors;
  const targets = mode === "linear_relation" ? [0, 1, 2, 3].map((i) => relationPoint(g, i)) : graphSolution(g, mode).points;
  if (g.snap && targets.some((p2) => [p2.x, p2.y].some((n) => Math.abs(n / g.snap - Math.round(n / g.snap)) > eps))) errors.push("\u0110i\u1EC3m \u0111\xEDch kh\xF4ng n\u1EB1m tr\xEAn l\u01B0\u1EDBi \u0111\xE3 ch\u1ECDn. \u0110\u1EB7t b\u01B0\u1EDBc ghim b\u1EB1ng 0 ho\u1EB7c \u0111\u1ED5i h\u1EC7 s\u1ED1 \u0111\u1EC3 c\xF3 t\u1ECDa \u0111\u1ED9 tr\xEAn l\u01B0\u1EDBi.");
  if (targets.some((p2) => !Number.isFinite(p2.x) || !Number.isFinite(p2.y) || Math.abs(p2.x) > 1e3 || Math.abs(p2.y) > 1e3)) errors.push("\u0110i\u1EC3m \u0111\xEDch v\u01B0\u1EE3t mi\u1EC1n quan s\xE1t \xB11000. Gi\u1EA3m h\u1EC7 s\u1ED1 ho\u1EB7c ch\u1ECDn h\u1EC7 kh\xE1c.");
  return errors;
}
function validateGraph(g) {
  return !["linear_relation", "linear_system", "line_parabola_intersection"].includes(g.mode) || !["explore", "identify", "discover", "guided", "practice", "assessment"].includes(g.task) ? ["Mode ho\u1EB7c nhi\u1EC7m v\u1EE5 \u0111\u1ED3 th\u1ECB kh\xF4ng \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3."] : validateGraphData(g, g.mode);
}
function graphAccept(g, name, value) {
  if (!Number.isFinite(value)) return false;
  if (["x", "y", "width", "height"].includes(name)) {
    if (["width", "height"].includes(name) && g.mode !== "line_parabola_intersection") return false;
    const bounds = graphBounds(g, g.mode), horizontal = ["x", "width"].includes(name), limit = horizontal ? bounds.xMax : bounds.yMax;
    return Math.abs(value) <= limit + eps && (!g.snap || Math.abs(value / g.snap - Math.round(value / g.snap)) < eps);
  }
  if (name === "a") return g.task === "explore" && g.mode === "line_parabola_intersection" && Number.isInteger(value) && value !== 0 && Math.abs(value) <= 12;
  if (name === "b") return g.task === "identify" && [1, 2].includes(value);
  if (name === "c") return !["explore", "identify"].includes(g.task) && g.mode !== "linear_relation" && [0, 1, 2, 3].includes(value);
  if (name === "numerator") return value === 1;
  return false;
}
function applyGraphInteraction(g, s, name, value) {
  if (["x", "y", "width", "height", "a", "c"].includes(name)) s.numerator = 0;
  if (name === "b") {
    s.b = Number(s.b) | value;
    return;
  }
  s[name] = value;
}
function graphError(g, s) {
  if (g.task === "explore") return Math.abs(Number(s.x)) + Math.abs(Number(s.y)) > 0.2 || g.mode === "line_parabola_intersection" && Number(s.a) !== 0 ? 0 : 1;
  if (g.task === "identify" && g.mode !== "linear_relation") return Number(s.b) === 3 ? 0 : 1;
  if (g.task === "discover" && g.mode !== "linear_relation") return Number(s.numerator) === 1 && Number(s.c) === graphClass(g) ? 0 : 1;
  if (!["explore", "identify"].includes(g.task) && g.mode !== "linear_relation" && Number(s.c) !== graphClass(g)) return 1;
  const points = graphTargets(g), pin = { x: Number(s.x), y: Number(s.y) };
  if (g.task === "identify") return Number(s.numerator) === 1 && lineDistance(g.a, g.b, g.c, pin) < 1e-5 ? 0 : 1;
  if (!points.length) return Number(s.numerator) === 1 && Number(s.c) === graphClass(g) ? 0 : 1;
  if (Number(s.numerator) !== 1) return 1;
  const distance2 = (p2, q) => Math.hypot(p2.x - q.x, p2.y - q.y), tol = 1e-5;
  if (points.length === 1) return distance2(points[0], pin) < tol ? 0 : 1;
  const pin2 = { x: Number(s.width), y: Number(s.height) };
  return Math.min(distance2(points[0], pin) + distance2(points[1], pin2), distance2(points[1], pin) + distance2(points[0], pin2)) < tol ? 0 : 1;
}

// packages/lesson-runtime/algebra.ts
var algebraModes = ["product_equation", "rational_equation", "quadratic_equation", "viete"];
var eps2 = 1e-8;
var unique = (values) => values.sort((a, b) => a - b).filter((v, i, a) => i === 0 || Math.abs(v - a[i - 1]) > eps2);
var constant = (id, value) => ({ id, op: "const", value });
var variable = (id) => ({ id, op: "var", name: "x" });
var linear = (id, a, b) => ({ id, op: "add", terms: [{ id: id + "-ax", op: "mul", terms: [constant(id + "-a", a), variable(id + "-x")] }, constant(id + "-b", b)] });
function expressionText(e) {
  if (e.op === "add" && e.terms.length === 2) {
    const [term, c] = e.terms;
    if (term.op === "mul" && term.terms.length === 2 && term.terms[0].op === "const" && term.terms[1].op === "var" && c.op === "const") {
      const a = term.terms[0].value, b = c.value;
      if (a === 0) return String(b);
      return `${a === 1 ? "" : a === -1 ? "\u2212" : a}x${b === 0 ? "" : b < 0 ? " \u2212 " + Math.abs(b) : " + " + b}`;
    }
  }
  switch (e.op) {
    case "const":
      return e.value < 0 ? `(${e.value})` : String(e.value);
    case "var":
      return "x";
    case "add":
      return e.terms.map(expressionText).join(" + ");
    case "mul":
      return e.terms.map((t) => `(${expressionText(t)})`).join(" \xD7 ");
    case "div":
      return `[${expressionText(e.numerator)}] / [${expressionText(e.denominator)}]`;
  }
}
function algebraEquation(g) {
  const d = g.data, n = (k) => Number(d[k]);
  if (g.mode === "product_equation" || g.mode === "rational_equation") {
    const numerator = { id: "numerator", op: "mul", terms: [linear("factor-L", n("p"), n("q")), linear("factor-R", n("r"), n("s"))] };
    return { left: g.mode === "product_equation" ? numerator : { id: "fraction", op: "div", numerator, denominator: { id: "denominator", op: "mul", terms: [linear("denominator-L", n("d"), n("e")), linear("denominator-R", n("f"), n("g"))] } }, right: constant("rhs", g.mode === "product_equation" ? 0 : n("k")) };
  }
  return { left: { id: "polynomial", op: "add", terms: [{ id: "term-square", op: "mul", terms: [constant("coefficient-a", n("a")), variable("square-x-1"), variable("square-x-2")] }, { id: "term-linear", op: "mul", terms: [constant("coefficient-b", n("b")), variable("linear-x")] }, constant("coefficient-c", n("c"))] }, right: constant("rhs", 0) };
}
function solvePolynomial(a, b, c) {
  if (a === 0) {
    if (b === 0) return { degree: 0, delta: null, kind: c === 0 ? "all" : "none", roots: [] };
    return { degree: 1, delta: null, kind: "one", roots: [-c / b] };
  }
  const delta = b * b - 4 * a * c, r = graphSolution({ a: b, b: 1, c: -c, q: a, snap: 0 }, "line_parabola_intersection"), roots = r.points.map((p2) => p2.x);
  return { degree: 2, delta, kind: roots.length === 0 ? "none" : roots.length === 1 ? "one" : "two", roots };
}
function algebraModel(g) {
  const d = g.data, n = (k) => Number(d[k]);
  const product = g.mode === "product_equation" || g.mode === "rational_equation", rational = g.mode === "rational_equation", a = product ? n("p") * n("r") - (rational ? n("k") * n("d") * n("f") : 0) : n("a"), b = product ? n("p") * n("s") + n("q") * n("r") - (rational ? n("k") * (n("d") * n("g") + n("e") * n("f")) : 0) : n("b"), c = product ? n("q") * n("s") - (rational ? n("k") * n("e") * n("g") : 0) : n("c");
  const forbidden = rational ? unique([-n("e") / n("d"), ...n("f") !== 0 ? [-n("g") / n("f")] : []]) : [], candidate = solvePolynomial(a, b, c), isAllowed = (x) => !rational || Math.abs(n("d") * x + n("e")) > eps2 && Math.abs(n("f") * x + n("g")) > eps2, roots = candidate.roots.filter(isAllowed), extraneous = candidate.roots.filter((x) => !isAllowed(x));
  const kind = candidate.kind === "all" ? "all" : roots.length === 0 ? "none" : roots.length === 1 ? "one" : "two", sum = a !== 0 ? -b / a : null, productValue = a !== 0 ? c / a : null;
  return { a, b, c, degree: candidate.degree, delta: candidate.delta, candidates: candidate.roots, forbidden, roots, extraneous, kind, count: kind === "all" ? 3 : roots.length, sum, product: productValue, equation: algebraEquation(g) };
}
function algebraDomainPool(g) {
  return unique([...algebraModel(g).forbidden, -2, -1, 0, 1, 2]);
}
function algebraDomainMask(g) {
  const m = algebraModel(g);
  return algebraDomainPool(g).reduce((mask, x, i) => mask | (m.forbidden.some((f) => Math.abs(f - x) < eps2) ? 1 << i : 0), 0);
}
function algebraCards(g) {
  const d = g.data;
  if (g.mode === "viete" && g.task !== "identify") return [{ id: "formula-sum", kind: "formula", label: "\u2212b / a" }, { id: "formula-product", kind: "formula", label: "c / a" }, { id: "formula-sign-sum", kind: "formula", label: "b / a" }, { id: "formula-sign-product", kind: "formula", label: "\u2212c / a" }];
  if (g.mode === "product_equation") return [{ id: "factor-L", kind: "factor", label: expressionText(linear("factor-L", Number(d.p), Number(d.q))) }, { id: "factor-R", kind: "factor", label: expressionText(linear("factor-R", Number(d.r), Number(d.s))) }, { id: "variable-x", kind: "variable", label: "x" }, { id: "number-zero", kind: "number", label: "0", value: 0 }];
  if (g.mode === "rational_equation") return [];
  return [...unique([Number(d.a), Number(d.b), Number(d.c), -Number(d.a), -Number(d.b), -Number(d.c), 0, 1]).map((value, i) => ({ id: "number-" + i, kind: "number", label: String(value), value })), { id: "variable-x", kind: "variable", label: "x" }];
}
function algebraSlotTargets(g) {
  if (g.mode === "product_equation" || g.mode === "viete" && g.task !== "identify") return [0, 1];
  if (g.mode === "rational_equation") return [];
  const cards = algebraCards(g);
  return ["a", "b", "c"].map((k) => cards.findIndex((card) => card.kind === "number" && card.value === Number(g.data[k])));
}
function algebraSlotsCorrect(g, s) {
  const targets = algebraSlotTargets(g), values = ["a", "b", "c"].slice(0, targets.length).map((k) => Number(s[k]));
  return g.mode === "product_equation" ? values.length === 2 && new Set(values).size === 2 && values.every((v) => v === 0 || v === 1) : targets.every((v, i) => v === values[i]);
}
var algebraOperations = [
  { id: "clear-denominator", label: "Nh\xE2n hai v\u1EBF v\u1EDBi m\u1EABu, gi\u1EEF \u0111i\u1EC1u ki\u1EC7n x\xE1c \u0111\u1ECBnh" },
  { id: "zero-product", label: "T\xE1ch t\xEDch b\u1EB1ng 0 th\xE0nh c\xE1c nh\xE2n t\u1EED b\u1EB1ng 0" },
  { id: "divide-leading", label: "Chia hai v\u1EBF cho h\u1EC7 s\u1ED1 a kh\xE1c 0" },
  { id: "divide-first-factor", label: "Chia hai v\u1EBF cho nh\xE2n t\u1EED th\u1EE9 nh\u1EA5t" },
  { id: "square-both", label: "B\xECnh ph\u01B0\u01A1ng hai v\u1EBF \xB7 ngo\xE0i ph\u1EA1m vi ki\u1EC3m ch\u1EE9ng t\u1ED5ng qu\xE1t" },
  { id: "negate-both", label: "\u0110\u1ED5i d\u1EA5u c\u1EA3 hai v\u1EBF" },
  { id: "divide-zero", label: "Chia hai v\u1EBF cho 0" }
];
function algebraDomainCorrect(g, s) {
  return g.mode !== "rational_equation" || s.targetWidth === 1 && s.denominator === algebraDomainMask(g);
}
function algebraOperationAllowed(g, operation, domainAcknowledged) {
  if (g.mode === "rational_equation" && !domainAcknowledged) return false;
  if (operation === 0) return g.mode === "rational_equation";
  if (operation === 1) return g.mode === "product_equation";
  if (operation === 2) return algebraModel(g).a !== 0;
  if (operation === 3) return g.mode === "rational_equation" && algebraModel(g).forbidden.some((x) => Math.abs(Number(g.data.p) * x + Number(g.data.q)) < eps2);
  return operation === 5;
}
function validateAlgebraData(d, mode) {
  if (!algebraModes.includes(mode)) return ["Mode \u0111\u1EA1i s\u1ED1 ch\u01B0a \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3."];
  const errors = [], keys = mode === "product_equation" ? ["p", "q", "r", "s"] : mode === "rational_equation" ? ["p", "q", "r", "s", "d", "e", "f", "g", "k"] : ["a", "b", "c"];
  for (const key of keys) if (typeof d[key] !== "number" || !Number.isInteger(d[key]) || Math.abs(Number(d[key])) > 9) errors.push(`${key}: nh\u1EADp s\u1ED1 nguy\xEAn t\u1EEB \u22129 \u0111\u1EBFn 9.`);
  if (errors.length) return errors;
  if ((mode === "product_equation" || mode === "rational_equation") && (d.p === 0 || d.r === 0)) errors.push("H\u1EC7 s\u1ED1 x c\u1EE7a c\u1EA3 hai nh\xE2n t\u1EED t\u1EED s\u1ED1 ph\u1EA3i kh\xE1c 0.");
  if (mode === "rational_equation" && (d.d === 0 || d.f === 0 && d.g === 0)) errors.push("M\u1EABu c\u1EA7n nh\xE2n t\u1EED b\u1EADc nh\u1EA5t d kh\xE1c 0; nh\xE2n t\u1EED m\u1EABu th\u1EE9 hai kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1ED3ng nh\u1EA5t b\u1EB1ng 0. D\xF9ng f = 0, g = 1 n\u1EBFu ch\u1EC9 c\u1EA7n m\u1ED9t nh\xE2n t\u1EED m\u1EABu.");
  if (mode === "quadratic_equation" && (!["quadratic_only", "allow_linear"].includes(String(d.degreePolicy)) || d.degreePolicy === "quadratic_only" && d.a === 0)) errors.push("M\u1EABu b\u1EADc hai y\xEAu c\u1EA7u a kh\xE1c 0. Ch\u1ECDn ch\u1EBF \u0111\u1ED9 cho ph\xE9p h\u1EA1 b\u1EADc n\u1EBFu c\u1EA7n a = 0.");
  if (mode === "viete" && (d.a === 0 || Number(d.b) ** 2 - 4 * Number(d.a) * Number(d.c) < 0)) errors.push("Vi\xE8te trong ph\u1EA1m vi nghi\u1EC7m th\u1EF1c c\u1EA7n a kh\xE1c 0 v\xE0 \u0394 kh\xF4ng \xE2m; \u0111\u1ED5i h\u1EC7 s\u1ED1 ho\u1EB7c d\xF9ng mode \u0394 \u0111\u1EC3 x\xE9t v\xF4 nghi\u1EC7m th\u1EF1c.");
  if (errors.length) return errors;
  const m = algebraModel({ mode, data: d, task: "guided" });
  if ([...m.roots, ...m.forbidden, ...m.candidates].some((x) => !Number.isFinite(x) || Math.abs(x) > 1e3)) errors.push("Nghi\u1EC7m ho\u1EB7c gi\xE1 tr\u1ECB c\u1EA5m v\u01B0\u1EE3t kho\u1EA3ng thao t\xE1c \u22121000\u20261000; gi\u1EA3m h\u1EC7 s\u1ED1.");
  return errors;
}
function validateAlgebra(g) {
  return [...validateAlgebraData(g.data, g.mode), ...!["explore", "identify", "discover", "guided", "practice", "assessment"].includes(g.task) ? ["Nhi\u1EC7m v\u1EE5 \u0111\u1EA1i s\u1ED1 kh\xF4ng h\u1EE3p l\u1EC7."] : []];
}
function algebraAccept(g, name, value) {
  if (!Number.isFinite(value)) return false;
  if (name === "x") return value >= -1e3 && value <= 1e3;
  if (g.task === "explore") return false;
  if (["a", "b", "c"].includes(name)) return (name !== "c" || ["quadratic_equation", "viete"].includes(g.mode) && g.task === "identify" || name === "c" && g.mode === "quadratic_equation") && Number.isInteger(value) && value >= 0 && value < algebraCards(g).length;
  if (name === "denominator") return Number.isInteger(value) && value >= 0 && (g.mode === "rational_equation" ? value < 1 << algebraDomainPool(g).length : g.mode === "quadratic_equation" && value <= 2);
  if (name === "targetWidth") return g.mode === "rational_equation" && value === 1;
  if (g.task === "identify") return false;
  if (name === "y") return Number.isInteger(value) && value >= 0 && value < algebraOperations.length;
  if (name === "numerator") return Number.isInteger(value) && value >= 0 && value <= 3;
  if (name === "width" || name === "height") return value === -999999 || value >= -1e3 && value <= 1e3;
  if (name === "targetA" || name === "targetB") return Math.abs(value) <= 1e6 && (name === "targetA" || g.mode === "viete");
  return name === "targetY" && value === 1;
}
function applyAlgebraInteraction(_g, s, name, value) {
  s[name] = value;
  if (name === "denominator") s.targetWidth = 0;
  if (!["x", "targetY"].includes(name)) s.targetY = 0;
}
function algebraRootInputs(g) {
  const m = algebraModel(g);
  return g.mode === "viete" && m.roots.length === 1 ? [m.roots[0], m.roots[0]] : m.roots;
}
function algebraRootsCorrect(g, s) {
  const roots = algebraRootInputs(g), m = algebraModel(g);
  if (s.numerator !== m.count) return false;
  const values = [Number(s.width), Number(s.height)], match = (a, b) => Math.abs(a - b) <= 1e-5;
  if (roots.length === 0) return values.every((x) => x === -999999);
  if (g.mode === "rational_equation" && values.filter((x) => x !== -999999).some((x) => m.forbidden.some((f) => Math.abs(x - f) < eps2))) return false;
  return roots.length === 1 ? match(values[0], roots[0]) && values[1] === -999999 : match(values[0], roots[0]) && match(values[1], roots[1]) || match(values[0], roots[1]) && match(values[1], roots[0]);
}
function algebraError(g, s) {
  const m = algebraModel(g), domain = algebraDomainCorrect(g, s), operation = algebraOperationAllowed(g, Number(s.y), domain), slots = algebraSlotsCorrect(g, s), close = (a, b) => Math.abs(a - b) <= 1e-5;
  if (g.task === "explore") return Math.abs(Number(s.x)) >= 0.01 ? 0 : 1;
  if (g.task === "identify") return (g.mode === "rational_equation" ? domain : slots) ? 0 : 1;
  if (s.targetY !== 1) return 1;
  const viete = slots && close(Number(s.targetA), m.sum) && close(Number(s.targetB), m.product);
  const quadratic = s.denominator === m.degree && (m.degree !== 2 || close(Number(s.targetA), m.delta)) && s.numerator === m.count;
  if (g.task === "discover") return (g.mode === "quadratic_equation" ? quadratic : g.mode === "viete" ? viete : domain && operation) ? 0 : 1;
  return domain && operation && algebraRootsCorrect(g, s) && (g.mode === "quadratic_equation" ? slots && quadratic : g.mode === "viete" ? viete : g.mode === "product_equation" ? slots : true) ? 0 : 1;
}

// packages/lesson-runtime/geometry.ts
var geometryModes = ["right_triangle", "circle_symmetry", "line_circle", "two_circles", "circle_angles", "arc_sector_annulus", "triangle_circles", "cyclic_polygon"];
var rad = Math.PI / 180;
var p = (x, y) => ({ x, y });
var polar = (r, a) => p(r * Math.cos(a * rad), r * Math.sin(a * rad));
var distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
var add = (a, b) => p(a.x + b.x, a.y + b.y);
var scale = (a, k) => p(a.x * k, a.y * k);
var turn = (a, angle) => p(a.x * Math.cos(angle * rad) - a.y * Math.sin(angle * rad), a.x * Math.sin(angle * rad) + a.y * Math.cos(angle * rad));
function constructionGraph(g, objects) {
  const triangle = ["right_triangle", "triangle_circles"].includes(g.mode), nodes = /* @__PURE__ */ new Map([["data", []]]);
  if (triangle) {
    nodes.set("construction-I", ["vertex-A", "vertex-B", "vertex-C"]);
    nodes.set("construction-O", ["vertex-A", "vertex-B", "vertex-C"]);
  }
  const parents = (id) => {
    if (id === "vertex-A" || id === "center-O" || id === "center-K") return ["data"];
    if (triangle && id === "vertex-B") return ["vertex-A", "data"];
    if (triangle && id === "vertex-C") return ["vertex-A", "vertex-B", "data"];
    if (id.startsWith("side-")) return id.slice(-2).split("").map((v) => "vertex-" + v);
    if (id.startsWith("bisector-")) return ["side-" + id.slice(-2), "construction-O"];
    if (id.startsWith("angle-bisector-")) return ["vertex-" + ["A", "B", "C"][Number(id.slice(-1))], "construction-I"];
    if (id === "incircle" || id === "incenter") return ["construction-I"];
    if (id === "circumcircle" || id === "circumcenter") return [triangle ? "construction-O" : "center-O", "data"];
    if (id === "circle-1" || id === "inner-circle") return ["center-O", "data"];
    if (id === "circle-2") return ["center-K", "data"];
    if (id === "axis" || id === "line-1") return ["center-O", "data"];
    if (id === "point-P") return ["center-O", "data"];
    if (id === "point-Q") return ["point-P", "axis"];
    if (id === "radius-OP") return ["center-O", "point-P"];
    if (id === "reflection-PQ") return ["point-P", "point-Q"];
    if (id === "centers-OK") return ["center-O", "center-K"];
    if (id === "foot-H") return ["center-O", "line-1"];
    if (id === "distance-OH") return ["center-O", "foot-H"];
    if (id.startsWith("intersection-")) return ["circle-1", g.mode === "two_circles" ? "circle-2" : "line-1"];
    if (id === "tangent-contact") return ["circle-1", "data"];
    if (id === "tangent-1" || id === "tangent-radius") return ["center-O", "tangent-contact"];
    if (id === "arc-A" || id === "arc-B") return ["circle-1", "data"];
    if (id === "radius-OA" || id === "radius-OB") return ["center-O", "arc-" + id.slice(-1)];
    if (id === "arc-AB" || id === "sector-AOB") return ["center-O", "arc-A", "arc-B"];
    if (id === "annulus") return ["circle-1", "inner-circle"];
    if (id === "inscribed-V") return ["arc-AB", "circle-1", "data"];
    if (id === "chord-VA" || id === "chord-VB") return ["inscribed-V", "arc-" + id.slice(-1)];
    if (id.startsWith("vertex-")) return ["circumcircle", "data"];
    if (id.startsWith("polygon-side-")) {
      const i = Number(id.slice(13)), n = g.data.shape === "regular_polygon" ? Number(g.data.vertices) : 4;
      return ["vertex-" + i, "vertex-" + (i + 1) % n];
    }
    if (id === "polygon") return objects.filter((o) => o.id.startsWith("vertex-")).map((o) => o.id);
    return ["data"];
  };
  objects.forEach((o) => nodes.set(o.id, parents(o.id)));
  const result = [], seen = /* @__PURE__ */ new Set(), visiting = /* @__PURE__ */ new Set();
  const visit = (id) => {
    if (seen.has(id)) return;
    if (visiting.has(id) || !nodes.has(id)) throw Error("Invalid trusted geometry dependency: " + id);
    visiting.add(id);
    nodes.get(id).forEach(visit);
    visiting.delete(id);
    seen.add(id);
    result.push({ id, parents: nodes.get(id) });
  };
  nodes.forEach((_, id) => visit(id));
  return result;
}
function geometryModel(g, state = {}) {
  const d = g.data, n = (k) => Number(d[k]), objects = [], layers = [];
  let value = 0, quantity = "", targetId = "", handle = p(1, 0), handleOrigin = p(0, 0), drag = "orientation";
  const facts = {};
  const point = (id, label, v) => {
    objects.push({ id, label, kind: "point", points: [v] });
    return v;
  };
  const segment = (id, label, a, b) => objects.push({ id, label, kind: "segment", points: [a, b] });
  const circle = (id, label, c, r) => objects.push({ id, label, kind: "circle", points: [c], radius: r });
  const layer = (id, label, bit, items) => layers.push({ id, label, bit, objects: items.map((o) => ({ ...o, layer: bit })) });
  const O = p(0, 0);
  if (g.mode === "right_triangle" || g.mode === "triangle_circles") {
    let A = O, B, C, a, b, c;
    if (g.mode === "right_triangle") {
      B = p(n("legA"), 0);
      C = p(0, n("legB"));
      a = Math.hypot(n("legA"), n("legB"));
      b = n("legB");
      c = n("legA");
    } else {
      a = n("sideA");
      b = n("sideB");
      c = n("sideC");
      B = p(c, 0);
      const x = (b * b + c * c - a * a) / (2 * c);
      C = p(x, Math.sqrt(Math.max(0, b * b - x * x)));
    }
    point("vertex-A", "\u0110\u1EC9nh A", A);
    point("vertex-B", "\u0110\u1EC9nh B", B);
    point("vertex-C", "\u0110\u1EC9nh C", C);
    segment("side-AB", "C\u1EA1nh AB", A, B);
    segment("side-AC", "C\u1EA1nh AC", A, C);
    segment("side-BC", "C\u1EA1nh BC", B, C);
    handle = B;
    const area = Math.abs(B.x * C.y) / 2, s = (a + b + c) / 2, I = scale(add(add(scale(A, a), scale(B, b)), scale(C, c)), 1 / (2 * s)), U = p(c / 2, (b * b - c * C.x) / (2 * C.y)), r = area / s, R = a * b * c / (4 * area);
    facts.area = area;
    facts.inradius = r;
    facts.circumradius = R;
    const bisectors = [["AB", A, B], ["AC", A, C], ["BC", B, C]];
    layer("perpendicular-bisectors", "Trung tr\u1EF1c", 1, bisectors.map(([id, u, v]) => {
      const mid = scale(add(u, v), 0.5), direction = p(-(v.y - u.y), v.x - u.x), sign = (U.x - mid.x) * direction.x + (U.y - mid.y) * direction.y < 0 ? -1 : 1, normal = scale(direction, sign / distance(u, v)), len = Math.max(a, b, c) * 0.2;
      return { id: "bisector-" + id, label: "Trung tr\u1EF1c " + id, kind: "segment", points: [add(mid, scale(normal, -len)), add(U, scale(normal, len))] };
    }));
    layer("angle-bisectors", "Ph\xE2n gi\xE1c", 2, [A, B, C].map((v, i) => ({ id: "angle-bisector-" + i, label: "Ph\xE2n gi\xE1c " + ["A", "B", "C"][i], kind: "segment", points: [v, I] })));
    if (g.mode === "right_triangle") {
      const opposite = d.angleAt === "B" ? b : c, adjacent = d.angleAt === "B" ? c : b, side = d.target === "hypotenuse" ? a : d.target === "opposite" ? opposite : adjacent;
      targetId = d.target === "hypotenuse" ? "side-BC" : d.target === "opposite" ? d.angleAt === "B" ? "side-AC" : "side-AB" : d.angleAt === "B" ? "side-AB" : "side-AC";
      const ratio = d.ratio === "sin" ? opposite / a : d.ratio === "cos" ? adjacent / a : opposite / adjacent;
      const angle = Math.atan2(opposite, adjacent) / rad;
      value = g.curriculumCode === "M9-GEO-01" ? side : g.curriculumCode === "M9-GEO-02" ? ratio : angle;
      quantity = g.curriculumCode === "M9-GEO-01" ? `\u0110\u1ED9 d\xE0i c\u1EA1nh ${d.target === "opposite" ? "\u0111\u1ED1i" : d.target === "adjacent" ? "k\u1EC1" : "huy\u1EC1n"} theo g\xF3c ${d.angleAt} (${d.unit})` : g.curriculumCode === "M9-GEO-02" ? `${d.ratio} g\xF3c ${d.angleAt}` : `G\xF3c ${d.angleAt} (\u0111\u1ED9)`;
      facts.rightAngle = 90;
      facts.opposite = opposite;
      facts.adjacent = adjacent;
      facts.hypotenuse = a;
      facts.ratio = ratio;
      facts.acuteAngle = angle;
    } else {
      const inc = d.construction === "incircle";
      targetId = inc ? "incircle" : "circumcircle";
      value = inc ? r : R;
      quantity = `B\xE1n k\xEDnh \u0111\u01B0\u1EDDng tr\xF2n ${inc ? "n\u1ED9i" : "ngo\u1EA1i"} ti\u1EBFp (${d.unit})`;
      layer("incircle", "\u0110\u01B0\u1EDDng tr\xF2n n\u1ED9i ti\u1EBFp", 4, [{ id: "incircle", label: "\u0110\u01B0\u1EDDng tr\xF2n n\u1ED9i ti\u1EBFp", kind: "circle", points: [I], radius: r }, { id: "incenter", label: "T\xE2m n\u1ED9i ti\u1EBFp I", kind: "point", points: [I] }]);
      layer("circumcircle", "\u0110\u01B0\u1EDDng tr\xF2n ngo\u1EA1i ti\u1EBFp", 8, [{ id: "circumcircle", label: "\u0110\u01B0\u1EDDng tr\xF2n ngo\u1EA1i ti\u1EBFp", kind: "circle", points: [U], radius: R }, { id: "circumcenter", label: "T\xE2m ngo\u1EA1i ti\u1EBFp O", kind: "point", points: [U] }]);
    }
  } else if (g.mode === "circle_symmetry") {
    const r = n("radius"), P = polar(n("pointDistance"), n("pointAngle")), Q = d.axis === "x" ? p(P.x, -P.y) : p(-P.x, P.y);
    circle("circle-1", "\u0110\u01B0\u1EDDng tr\xF2n t\xE2m O", O, r);
    point("center-O", "T\xE2m O", O);
    point("point-P", "\u0110i\u1EC3m P", P);
    point("point-Q", "\u0110i\u1EC3m \u0111\u1ED1i x\u1EE9ng Q", Q);
    segment("radius-OP", "OP", O, P);
    segment("reflection-PQ", "C\u1EB7p \u0111\u1ED1i x\u1EE9ng PQ", P, Q);
    segment("axis", "Tr\u1EE5c \u0111\u1ED1i x\u1EE9ng", d.axis === "x" ? p(-r * 1.5, 0) : p(0, -r * 1.5), d.axis === "x" ? p(r * 1.5, 0) : p(0, r * 1.5));
    value = n("pointDistance") < r - 1e-8 ? 0 : Math.abs(n("pointDistance") - r) <= 1e-8 ? 1 : 2;
    quantity = "V\u1ECB tr\xED P: trong = 0; tr\xEAn = 1; ngo\xE0i = 2";
    targetId = "point-Q";
    handle = P;
    facts.reflectionX = Q.x;
    facts.reflectionY = Q.y;
  } else if (g.mode === "line_circle") {
    const r = n("radius"), h = n("distance"), angle = n("normalAngle"), N = polar(1, angle), T = p(-N.y, N.x), foot = scale(N, h), length = 1.7 * r;
    circle("circle-1", "\u0110\u01B0\u1EDDng tr\xF2n t\xE2m O", O, r);
    point("center-O", "T\xE2m O", O);
    segment("line-1", `\u0110\u01B0\u1EDDng th\u1EB3ng \u2113 \xB7 d = ${h} ${d.unit}`, add(foot, scale(T, -length)), add(foot, scale(T, length)));
    segment("distance-OH", "Kho\u1EA3ng c\xE1ch OH", O, foot);
    point("foot-H", "Ch\xE2n vu\xF4ng g\xF3c H", foot);
    value = h > r + 1e-8 ? 0 : Math.abs(h - r) <= 1e-8 ? 1 : 2;
    quantity = "S\u1ED1 giao \u0111i\u1EC3m c\u1EE7a \u0111\u01B0\u1EDDng th\u1EB3ng v\xE0 \u0111\u01B0\u1EDDng tr\xF2n";
    targetId = "line-1";
    handle = polar(r, angle);
    if (value > 0) {
      const z = Math.sqrt(Math.max(0, r * r - h * h));
      point("intersection-1", "Giao \u0111i\u1EC3m I", add(foot, scale(T, z)));
      if (value === 2) point("intersection-2", "Giao \u0111i\u1EC3m J", add(foot, scale(T, -z)));
    }
    const contact = scale(N, r);
    layer("tangent", "Ti\u1EBFp tuy\u1EBFn t\u1EA1i T", 16, [{ id: "tangent-1", label: "Ti\u1EBFp tuy\u1EBFn", kind: "segment", points: [add(contact, scale(T, -2 * r)), add(contact, scale(T, 2 * r))] }, { id: "tangent-contact", label: "Ti\u1EBFp \u0111i\u1EC3m T", kind: "point", points: [contact] }, { id: "tangent-radius", label: "OT vu\xF4ng g\xF3c ti\u1EBFp tuy\u1EBFn", kind: "segment", points: [O, contact] }]);
    facts.distance = h;
    facts.radius = r;
  } else if (g.mode === "two_circles") {
    const r = n("radius"), s = n("radius2"), h = n("distance"), C = p(h, 0);
    circle("circle-1", "\u0110\u01B0\u1EDDng tr\xF2n O", O, r);
    circle("circle-2", "\u0110\u01B0\u1EDDng tr\xF2n K", C, s);
    point("center-O", "T\xE2m O", O);
    point("center-K", "T\xE2m K", C);
    segment("centers-OK", "\u0110o\u1EA1n n\u1ED1i t\xE2m", O, C);
    value = h < 1e-8 ? Math.abs(r - s) < 1e-8 ? 3 : 0 : h > r + s + 1e-8 || h < Math.abs(r - s) - 1e-8 ? 0 : Math.abs(h - r - s) < 1e-8 || Math.abs(h - Math.abs(r - s)) < 1e-8 ? 1 : 2;
    quantity = "S\u1ED1 giao \u0111i\u1EC3m: 0 / 1 / 2; tr\xF9ng nhau = 3 (v\xF4 s\u1ED1)";
    targetId = "circle-2";
    handle = h > 0 ? C : p(r, 0);
    if (h > 0 && value > 0 && value < 3) {
      const x = (r * r - s * s + h * h) / (2 * h), y = Math.sqrt(Math.max(0, r * r - x * x));
      point("intersection-1", "Giao \u0111i\u1EC3m I", p(x, y));
      if (value === 2) point("intersection-2", "Giao \u0111i\u1EC3m J", p(x, -y));
    }
    facts.centerDistance = h;
  } else if (g.mode === "circle_angles" || g.mode === "arc_sector_annulus") {
    const r = n("radius"), sweep = n("sweep"), A = polar(r, 0), B = polar(r, sweep);
    circle("circle-1", "\u0110\u01B0\u1EDDng tr\xF2n t\xE2m O", O, r);
    point("center-O", "T\xE2m O", O);
    point("arc-A", "\u0110\u1EA7u cung A", A);
    point("arc-B", "\u0110\u1EA7u cung B", B);
    segment("radius-OA", "B\xE1n k\xEDnh OA", O, A);
    segment("radius-OB", "B\xE1n k\xEDnh OB", O, B);
    objects.push({ id: "arc-AB", label: "Cung nh\u1ECF AB", kind: "arc", points: [O, A, B], radius: r, sweep });
    objects.push({ id: "sector-AOB", label: "Qu\u1EA1t tr\xF2n AOB", kind: "sector", points: [O, A, B], radius: r, sweep });
    if (g.mode === "circle_angles") {
      const alpha = Math.min(355, Math.max(sweep + 5, Number(state.a ?? 240))), V = polar(r, alpha);
      point("inscribed-V", "\u0110\u1EC9nh g\xF3c n\u1ED9i ti\u1EBFp V", V);
      segment("chord-VA", "D\xE2y VA", V, A);
      segment("chord-VB", "D\xE2y VB", V, B);
      value = sweep / 2;
      quantity = `G\xF3c n\u1ED9i ti\u1EBFp AVB (\u0111\u1ED9), g\xF3c \u1EDF t\xE2m AOB = ${sweep}\xB0`;
      targetId = "arc-AB";
      handle = V;
      drag = "inscribed";
      facts.centralAngle = sweep;
      facts.inscribedAngle = sweep / 2;
    } else {
      const inner = n("innerRadius");
      circle("inner-circle", "\u0110\u01B0\u1EDDng tr\xF2n trong", O, inner);
      objects.push({ id: "annulus", label: "V\xE0nh khuy\xEAn", kind: "sector", points: [O, polar(r, 0), polar(r, 359.999)], radius: r, sweep: 359.999 });
      value = d.measure === "arc" ? Math.PI * r * sweep / 180 : d.measure === "sector" ? Math.PI * r * r * sweep / 360 : Math.PI * (r * r - inner * inner);
      targetId = d.measure === "arc" ? "arc-AB" : d.measure === "sector" ? "sector-AOB" : "annulus";
      quantity = d.measure === "arc" ? `\u0110\u1ED9 d\xE0i cung AB (${d.unit})` : d.measure === "sector" ? `Di\u1EC7n t\xEDch qu\u1EA1t AOB (${d.unit}\xB2)` : `Di\u1EC7n t\xEDch v\xE0nh khuy\xEAn (${d.unit}\xB2)`;
      facts.arcLength = Math.PI * r * sweep / 180;
      facts.sectorArea = Math.PI * r * r * sweep / 360;
      facts.annulusArea = Math.PI * (r * r - inner * inner);
      handle = B;
    }
  } else {
    const r = n("radius"), regular = d.shape === "regular_polygon", angles = regular ? Array.from({ length: n("vertices") }, (_, i) => i * 360 / n("vertices")) : [0, n("angleB"), n("angleC"), n("angleD")], vertices = angles.map((a) => polar(r, a));
    circle("circumcircle", "\u0110\u01B0\u1EDDng tr\xF2n ngo\u1EA1i ti\u1EBFp", O, r);
    point("center-O", "T\xE2m O", O);
    vertices.forEach((v, i) => {
      point("vertex-" + i, "\u0110\u1EC9nh " + String.fromCharCode(65 + i), v);
      segment("polygon-side-" + i, "C\u1EA1nh " + String.fromCharCode(65 + i) + String.fromCharCode(65 + (i + 1) % vertices.length), v, vertices[(i + 1) % vertices.length]);
    });
    objects.push({ id: "polygon", label: regular ? "\u0110a gi\xE1c \u0111\u1EC1u" : "T\u1EE9 gi\xE1c n\u1ED9i ti\u1EBFp", kind: "polygon", points: vertices });
    value = regular ? (n("vertices") - 2) * 180 / n("vertices") : n("angleC") / 2;
    quantity = regular ? "M\u1ED7i g\xF3c trong \u0111a gi\xE1c \u0111\u1EC1u (\u0111\u1ED9)" : `G\xF3c D \u0111\u1ED1i g\xF3c B = ${180 - n("angleC") / 2}\xB0 (\u0111\u1ED9)`;
    targetId = "polygon";
    handle = vertices[0];
    facts.oppositeAngleSum = 180;
    facts.centralStep = regular ? 360 / n("vertices") : 0;
  }
  const orientation = Number(state.x ?? 0), all = [...objects, ...layers.flatMap((l) => l.objects)], extents = all.flatMap((o) => o.radius ? [p(o.points[0].x - o.radius, o.points[0].y - o.radius), p(o.points[0].x + o.radius, o.points[0].y + o.radius)] : o.points), center = p((Math.min(...extents.map((p2) => p2.x)) + Math.max(...extents.map((p2) => p2.x))) / 2, (Math.min(...extents.map((p2) => p2.y)) + Math.max(...extents.map((p2) => p2.y))) / 2), bounds = Math.max(0.5, ...all.map((o) => o.radius ? distance(o.points[0], center) + o.radius : Math.max(...o.points.map((v) => distance(v, center))))) * 1.12;
  for (const o of all) o.points = o.points.map((v) => turn(v, orientation));
  return { objects, value, quantity, targetId, layers, bounds, center: turn(center, orientation), handle: turn(handle, orientation), handleOrigin: turn(handleOrigin, orientation), drag, facts, construction: constructionGraph(g, all), constraints: { lengths: "locked", orientation: "free", zoom: "view-only", vertexDrag: drag === "inscribed" ? "major-arc" : "rigid" } };
}
function validateGeometryData(data, mode) {
  const e = [], n = (k) => Number(data[k]), positive = (keys) => keys.forEach((k) => {
    if (!Number.isFinite(n(k)) || n(k) < 0.5 || n(k) > 20) e.push(`${k}: nh\u1EADp \u0111\u1ED9 d\xE0i t\u1EEB 0,5 \u0111\u1EBFn 20.`);
  });
  if (!geometryModes.includes(mode)) return ["Mode h\xECnh h\u1ECDc ch\u01B0a h\u1ED7 tr\u1EE3."];
  if (!["cm", "m"].includes(String(data.unit))) e.push("\u0110\u01A1n v\u1ECB ph\u1EA3i l\xE0 cm ho\u1EB7c m.");
  if (mode === "right_triangle") {
    positive(["legA", "legB"]);
    if (n("legA") / n("legB") < 0.1 || n("legA") / n("legB") > 10) e.push("T\u1EC9 l\u1EC7 hai c\u1EA1nh g\xF3c vu\xF4ng c\u1EA7n t\u1EEB 0,1 \u0111\u1EBFn 10.");
    if (!["B", "C"].includes(String(data.angleAt)) || !["opposite", "adjacent", "hypotenuse"].includes(String(data.target)) || !["sin", "cos", "tan"].includes(String(data.ratio))) e.push("Ch\u1ECDn g\xF3c B/C, vai tr\xF2 c\u1EA1nh v\xE0 t\u1EC9 s\u1ED1 l\u01B0\u1EE3ng gi\xE1c \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3.");
  } else if (mode === "triangle_circles") {
    positive(["sideA", "sideB", "sideC"]);
    const a = n("sideA"), b = n("sideB"), c = n("sideC"), s = (a + b + c) / 2, area2 = s * (s - a) * (s - b) * (s - c);
    if (a + b <= c || a + c <= b || b + c <= a || area2 <= 0 || Math.sqrt(area2) / Math.max(a, b, c) ** 2 < 0.03) e.push("Ba c\u1EA1nh kh\xF4ng d\u1EF1ng \u0111\u01B0\u1EE3c tam gi\xE1c r\xF5: m\u1ED7i c\u1EA1nh ph\u1EA3i nh\u1ECF h\u01A1n t\u1ED5ng hai c\u1EA1nh c\xF2n l\u1EA1i; tr\xE1nh tam gi\xE1c g\u1EA7n suy bi\u1EBFn.");
    if (!["incircle", "circumcircle"].includes(String(data.construction))) e.push("Ch\u1ECDn \u0111\u01B0\u1EDDng tr\xF2n n\u1ED9i ti\u1EBFp ho\u1EB7c ngo\u1EA1i ti\u1EBFp.");
  } else {
    positive(["radius"]);
    if (mode === "circle_symmetry") {
      if (!Number.isFinite(n("pointDistance")) || n("pointDistance") < 0.5 || n("pointDistance") > 30) e.push("Kho\u1EA3ng c\xE1ch OP c\u1EA7n t\u1EEB 0,5 \u0111\u1EBFn 30.");
      if (!Number.isFinite(n("pointAngle")) || n("pointAngle") < 10 || n("pointAngle") > 80 || !["x", "y"].includes(String(data.axis))) e.push("G\xF3c \u0111\u1EB7t P t\u1EEB 10\xB0 \u0111\u1EBFn 80\xB0, tr\u1EE5c \u0111\u1ED1i x\u1EE9ng x/y \u0111\u1EC3 hai \u0111i\u1EC3m ph\xE2n bi\u1EC7t.");
    }
    if (mode === "line_circle" || mode === "two_circles") {
      if (!Number.isFinite(n("distance")) || n("distance") < 0 || n("distance") > 40) e.push("Kho\u1EA3ng c\xE1ch c\u1EA7n t\u1EEB 0 \u0111\u1EBFn 40.");
    }
    if (mode === "line_circle" && (!Number.isFinite(n("normalAngle")) || n("normalAngle") < 0 || n("normalAngle") > 359)) e.push("G\xF3c ph\xE1p tuy\u1EBFn c\u1EA7n t\u1EEB 0\xB0 \u0111\u1EBFn 359\xB0.");
    if (mode === "two_circles") positive(["radius2"]);
    if (mode === "circle_angles" || mode === "arc_sector_annulus") {
      if (!Number.isFinite(n("sweep")) || n("sweep") < 20 || n("sweep") > 160) e.push("Cung nh\u1ECF t\u1EEB 20\xB0 \u0111\u1EBFn 160\xB0 \u0111\u1EC3 \u0111\u1EC9nh g\xF3c n\u1ED9i ti\u1EBFp n\u1EB1m tr\xEAn cung l\u1EDBn.");
    }
    if (mode === "arc_sector_annulus") {
      positive(["innerRadius"]);
      if (n("innerRadius") >= n("radius")) e.push("B\xE1n k\xEDnh trong ph\u1EA3i nh\u1ECF h\u01A1n b\xE1n k\xEDnh ngo\xE0i.");
      if (!["arc", "sector", "annulus"].includes(String(data.measure))) e.push("Ch\u1ECDn \u0111\u1ED9 d\xE0i cung, qu\u1EA1t ho\u1EB7c v\xE0nh khuy\xEAn.");
    }
    if (mode === "cyclic_polygon") {
      if (!["regular_polygon", "cyclic_quadrilateral"].includes(String(data.shape))) e.push("Ch\u1ECDn \u0111a gi\xE1c \u0111\u1EC1u ho\u1EB7c t\u1EE9 gi\xE1c n\u1ED9i ti\u1EBFp.");
      if (!Number.isInteger(n("vertices")) || n("vertices") < 3 || n("vertices") > 12) e.push("S\u1ED1 \u0111\u1EC9nh nguy\xEAn t\u1EEB 3 \u0111\u1EBFn 12.");
      const angles = [0, n("angleB"), n("angleC"), n("angleD"), 360];
      if (!angles.every(Number.isFinite) || angles.slice(1).some((a, i) => a - angles[i] < 10 || a - angles[i] > 170)) e.push("G\xF3c \u0111\u1EC9nh t\u1EE9 gi\xE1c t\u0103ng d\u1EA7n; m\u1ED7i kho\u1EA3ng cung t\u1EEB 10\xB0 \u0111\u1EBFn 170\xB0 \u0111\u1EC3 h\xECnh l\u1ED3i, kh\xF4ng suy bi\u1EBFn.");
    }
  }
  return e;
}
function validateGeometry(g) {
  const e = validateGeometryData(g.data, g.mode), index = Number(g.curriculumCode.slice(-2));
  if (!Number.isInteger(index) || index < 1 || index > 10 || geometryModes[index <= 3 ? 0 : index - 3] !== g.mode) e.push("M\xE3 curriculum kh\xF4ng kh\u1EDBp mode h\xECnh h\u1ECDc.");
  if (!["explore", "identify", "discover", "guided", "practice", "assessment"].includes(g.task)) e.push("Nhi\u1EC7m v\u1EE5 h\xECnh h\u1ECDc kh\xF4ng h\u1EE3p l\u1EC7.");
  return e;
}
function geometrySelectable(g) {
  const m = geometryModel(g);
  return [...m.objects, ...m.layers.flatMap((l) => l.objects)];
}
function geometryTargetIndex(g) {
  return geometrySelectable(g).findIndex((o) => o.id === geometryModel(g).targetId);
}
function geometryAccept(g, name, value) {
  if (!Number.isFinite(value)) return false;
  if (name === "x") return value >= -180 && value <= 180;
  if (name === "y") return value >= 0.6 && value <= 1;
  if (name === "a") return g.mode === "circle_angles" && value >= Number(g.data.sweep) + 5 && value <= 355;
  if (name === "b") return Number.isInteger(value) && value >= 0 && value < geometrySelectable(g).length;
  if (name === "c") {
    const mask = geometryModel(g).layers.reduce((a, l) => a | l.bit, 0);
    return Number.isInteger(value) && value >= 0 && (value & ~mask) === 0;
  }
  if (name === "numerator") return value >= -1e5 && value <= 1e5;
  return name === "width" && value === 1 && g.task !== "explore";
}
function applyGeometryInteraction(_g, s, name, value) {
  s[name] = value;
  if (["b", "numerator", "a"].includes(name)) s.width = 0;
}
function geometryError(g, s) {
  if (g.task === "explore") return Math.abs(Number(s.x)) >= 5 || g.mode === "circle_angles" && Math.abs(Number(s.a) - 240) >= 5 ? 0 : 1;
  const m = geometryModel(g), target = geometryTargetIndex(g), selected = geometrySelectable(g)[Number(s.b)], visible = !selected?.layer || (Number(s.c) & selected.layer) !== 0;
  if (g.task === "identify") return Number(s.b) === target && visible ? 0 : 1;
  if (s.width !== 1) return 1;
  const tolerance = Math.max(5e-3, Math.abs(m.value) * 1e-4), numeric = Math.abs(Number(s.numerator) - m.value) <= tolerance;
  return numeric && (g.task === "discover" || Number(s.b) === target && visible) ? 0 : 1;
}

// packages/lesson-runtime/parabola.ts
var parabolaTasks = ["explore", "identify", "compare", "guided", "practice", "assessment"];
var parabolaValue = (a, x) => a * x * x;
function parabolaModel(c) {
  const referenceA = c.a > 0 ? c.a / 2 : c.a * 2;
  const point = { x: c.pointX, y: parabolaValue(c.a, c.pointX) };
  return {
    point,
    referenceA,
    narrower: Math.abs(c.a) > Math.abs(referenceA) ? 0 : 1,
    viewport: { xMin: -2.5, xMax: 2.5, yMax: Math.max(5, c.task === "compare" ? Math.abs(referenceA) : 0) * 2.2 ** 2 * 1.12 }
  };
}
function validateParabola(c) {
  return !Number.isInteger(c.a) || c.a === 0 || Math.abs(c.a) > 5 || ![1, 2, -2].includes(c.pointX) || !parabolaTasks.includes(c.task) ? ["Parabol c\u1EA7n a nguy\xEAn kh\xE1c 0 trong [\u22125; 5], \u0111i\u1EC3m c\xF3 x kh\xE1c 0 v\xE0 nhi\u1EC7m v\u1EE5 \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3."] : [];
}
function parabolaAccept(c, name, value) {
  if (!Number.isFinite(value)) return false;
  if (name === "x") return c.task !== "identify" && c.task !== "compare" && Number.isInteger(value) && value !== 0 && Math.abs(value) <= 5;
  if (name === "a") return c.task === "compare" && Number.isInteger(value) && value >= 1 && value <= 2;
  if (name === "y") return c.task === "identify" || c.task === "compare" ? value === 0 || value === 1 : ["guided", "practice", "assessment"].includes(c.task) && value === 0;
  return false;
}
function applyParabolaInteraction(c, s, name, value) {
  if (name === "x") {
    if (c.task === "explore") s.b = Number(s.b ?? 0) | (value > 0 ? 1 : 2);
    else s.y = -1;
  }
  if (name === "a") s.y = -1;
  s[name] = value;
}
function parabolaError(c, s) {
  if (c.task === "explore") return Number(s.b) === 3 ? 0 : 1;
  if (c.task === "identify") return Number(s.y) === (c.a > 0 ? 0 : 1) ? 0 : 1;
  if (c.task === "compare") return Number(s.a) === 2 && Number(s.y) === parabolaModel(c).narrower ? 0 : 1;
  return Number(s.x) === c.a && Number(s.y) === 0 ? 0 : 1;
}

// packages/lesson-runtime/cylinder.ts
var cylinderParts = ["radius", "height", "top", "bottom", "side"];
function cylinderAccept(c, name, value) {
  if (!Number.isFinite(value)) return false;
  if (name === "a") return Math.abs(value) <= Math.PI * 2;
  if (name === "b") return Math.abs(value) <= 1.3;
  if (name === "width") return c.task === "equal-bases" && value >= 0.5 && value <= 1.5;
  return name === "x" && Number.isInteger(value) && value >= 0 && value < cylinderParts.length;
}
function applyCylinderInteraction(state, name, value) {
  if (name === "a" || name === "b") state.c = Number(state.c ?? 0) + Math.abs(value - Number(state[name] ?? 0));
  if (name === "x" && (value === 2 || value === 3)) state.y = Number(state.y ?? 0) | (value === 2 ? 1 : 2);
  state[name] = value;
}
function cylinderError(c, s) {
  if (c.task === "orbit") return Number(s.c) >= 0.3 ? 0 : 1;
  if (c.task === "equal-bases") return Number(s.y) === 3 && Math.abs(Number(s.width) - 1) > 0.09 ? 0 : 1;
  return Number(s.x) === { radius: 0, height: 1, side: 4 }[c.task] ? 0 : 1;
}

// packages/lesson-contract/index.ts
var import__ = __toESM(require__(), 1);

// packages/lesson-runtime/uime.ts
var uimeKeys = ["x", "y", "a", "b", "c", "width", "height", "numerator"];
function uimeAccept(u, name, value) {
  if (u.algebra) return algebraAccept(u.algebra, name, value);
  if (u.geometry) return geometryAccept(u.geometry, name, value);
  if (u.graph) return graphAccept(u.graph, name, value);
  if (u.parabola) return parabolaAccept(u.parabola, name, value);
  if (u.cylinder) return cylinderAccept(u.cylinder, name, value);
  const i = uimeKeys.indexOf(name);
  if (i < 0 || !Number.isFinite(value)) return false;
  if (u.kind === "3D_SOLID_INSPECTOR" && ["a", "b"].includes(name)) return Math.abs(value) <= Math.PI * 2;
  if (i >= u.answers.length) return false;
  if (u.kind === "NUMBER_LINE_SELECTOR" && i > 0) return value === 0 || value === 1;
  if (["PARABOLA_SLIDER", "NUMBER_LINE_SELECTOR", "GEOMETRIC_HOTSPOT_FINDER"].includes(u.kind) && i === 0) return value >= u.min && value <= u.max && Math.abs((value - u.min) / u.step - Math.round((value - u.min) / u.step)) < 1e-6;
  const max = ["TOKEN_CLASSIFIER", "EVENT_CARD_BUCKET"].includes(u.kind) ? u.labels.length : u.tokens.length;
  return Number.isInteger(value) && value >= 0 && value < max;
}
function uimeError(u, state) {
  if (u.algebra) return algebraError(u.algebra, state);
  if (u.geometry) return geometryError(u.geometry, state);
  if (u.graph) return graphError(u.graph, state);
  if (u.parabola) return parabolaError(u.parabola, state);
  if (u.cylinder) return cylinderError(u.cylinder, state);
  let error = u.answers.reduce((sum, v, i) => sum + Math.abs(Number(state[uimeKeys[i]]) - v), 0);
  if (u.kind === "3D_SOLID_INSPECTOR" && Math.abs(Number(state.a)) + Math.abs(Number(state.b)) < 0.3) error += 1;
  return error;
}
function validateUime(u) {
  const e = [];
  if (u.algebra) {
    e.push(...validateAlgebra(u.algebra));
    if (u.kind !== "FORMULA_SNAP_BUILDER" || u.geometry || u.graph || u.parabola || u.cylinder) e.push("Algebra adapter binding invalid");
  }
  if (u.geometry) {
    e.push(...validateGeometry(u.geometry));
    if (u.kind !== "TRIANGLE_HOTSPOT_TAP" || u.graph || u.parabola || u.cylinder) e.push("Geometry adapter binding invalid");
  }
  if (u.graph) {
    e.push(...validateGraph(u.graph));
    if (u.kind !== "PARABOLA_SLIDER" || u.parabola || u.cylinder) e.push("Graph adapter binding invalid");
  }
  if (u.parabola) {
    e.push(...validateParabola(u.parabola));
    if (u.kind !== "PARABOLA_SLIDER" || u.cylinder || u.min !== -5 || u.max !== 5 || u.step !== 1 || u.answers.length !== 1 || u.answers[0] !== u.parabola.a) e.push("Invalid parabola model binding");
  }
  if (u.cylinder) {
    const c = u.cylinder;
    if (u.kind !== "3D_SOLID_INSPECTOR" || u.solid !== "cylinder" || ![c.radius, c.height].every((n) => Number.isFinite(n) && n >= 0.1 && n <= 100) || c.height / c.radius < 0.1 || c.height / c.radius > 10 || !["cm", "m"].includes(c.unit) || !["orbit", "radius", "equal-bases", "height", "side"].includes(c.task) || u.tokens.length !== 5) e.push("Invalid cylinder model");
  }
  if (u.answers.length < 1 || u.answers.length > 8 || u.min >= u.max || u.step <= 0) e.push("Invalid U-IME dimensions/bounds");
  if (["TOKEN_CLASSIFIER", "EVENT_CARD_BUCKET"].includes(u.kind) && u.tokens.length !== u.answers.length) e.push("Every card needs a target bucket");
  if (u.kind === "FORMULA_SNAP_BUILDER" && u.labels.length !== u.answers.length) e.push("Every formula slot needs a label");
  if (u.kind === "NUMBER_LINE_SELECTOR" && (u.answers.length !== 3 || u.min < -10 || u.max > 10)) e.push("Number line requires endpoint, direction and closure within -10..10");
  if (u.kind === "GEOMETRIC_HOTSPOT_FINDER" && u.answers.length !== 2) e.push("Circle requires distance and selected part");
  if (u.hotspots.some((h) => h.x + h.width > 360 || h.y + h.height > 240)) e.push("Hotspot outside viewport");
  if (!u.algebra && !u.geometry && !u.parabola && !u.graph) u.answers.forEach((v, i) => {
    if (!uimeAccept(u, uimeKeys[i], v)) e.push("Unreachable U-IME answer");
  });
  return e;
}

// contracts/lesson.schema.json
var lesson_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://mohoc.local/lesson.schema.json",
  type: "object",
  properties: {
    schemaVersion: {
      const: "1.0.0"
    },
    lessonId: {
      type: "string",
      pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
    },
    version: {
      type: "integer",
      minimum: 1
    },
    status: {
      enum: [
        "draft",
        "published"
      ]
    },
    locale: {
      const: "vi-VN"
    },
    title: {
      type: "string",
      minLength: 1,
      maxLength: 2e3
    },
    grade: {
      enum: [
        6,
        7,
        8,
        9
      ]
    },
    subject: {
      const: "math"
    },
    topicIds: {
      type: "array",
      items: {
        type: "string",
        pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
      },
      minItems: 1,
      maxItems: 100
    },
    learningObjectives: {
      type: "array",
      items: {
        type: "string",
        minLength: 1,
        maxLength: 2e3
      },
      minItems: 1,
      maxItems: 100
    },
    engine: {
      type: "object",
      properties: {
        type: {
          enum: [
            "geometry_2d",
            "geometry_3d_web",
            "math_explorer_2d",
            "number_line_2d",
            "fraction_bar_2d",
            "algebra_balance_2d",
            "function_plot_2d",
            "percentage_2d",
            "ratio_2d",
            "coordinate_2d",
            "area_2d",
            "pythagorean_2d",
            "linear_plot_2d"
          ]
        },
        minRuntimeVersion: {
          const: "1.0.0"
        },
        requiredCapabilities: {
          type: "array",
          items: {
            enum: [
              "drag_vertex",
              "measure_angle",
              "show_geometry_annotation",
              "toggle_angle_labels",
              "drag_angle_token",
              "orbit_solid",
              "select_face",
              "fill_layers",
              "measure_volume",
              "adjust_parameter",
              "number_line_drag",
              "fraction_partition",
              "balance_equation",
              "plot_function",
              "percentage_grid",
              "ratio_table",
              "coordinate_plane",
              "rectangle_area",
              "pythagorean",
              "linear_graph"
            ]
          },
          minItems: 1,
          maxItems: 100,
          uniqueItems: true
        }
      },
      required: [
        "type",
        "minRuntimeVersion",
        "requiredCapabilities"
      ],
      additionalProperties: false
    },
    scene: {
      type: "object",
      properties: {
        sceneId: {
          type: "string",
          pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
        },
        coordinateSystem: {
          enum: [
            "cartesian_2d",
            "cartesian_3d"
          ]
        },
        viewport: {
          type: "object",
          properties: {
            width: {
              type: "number",
              exclusiveMinimum: 0,
              maximum: 1e4
            },
            height: {
              type: "number",
              exclusiveMinimum: 0,
              maximum: 1e4
            }
          },
          required: [
            "width",
            "height"
          ],
          additionalProperties: false
        },
        objects: {
          type: "array",
          items: {
            oneOf: [
              {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                  },
                  kind: {
                    const: "point"
                  },
                  position: {
                    type: "array",
                    items: {
                      type: "number"
                    },
                    minItems: 2,
                    maxItems: 2
                  },
                  draggable: {
                    type: "boolean"
                  }
                },
                required: [
                  "id",
                  "kind",
                  "position",
                  "draggable"
                ],
                additionalProperties: false
              },
              {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                  },
                  kind: {
                    const: "polygon"
                  },
                  vertexIds: {
                    type: "array",
                    items: {
                      type: "string",
                      pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                    },
                    minItems: 3,
                    maxItems: 100
                  }
                },
                required: [
                  "id",
                  "kind",
                  "vertexIds"
                ],
                additionalProperties: false
              },
              {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                  },
                  kind: {
                    const: "angle_token"
                  },
                  sourceVertexId: {
                    type: "string",
                    pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                  }
                },
                required: [
                  "id",
                  "kind",
                  "sourceVertexId"
                ],
                additionalProperties: false
              },
              {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                  },
                  kind: {
                    const: "prism"
                  },
                  dimensions: {
                    type: "array",
                    items: {
                      type: "number",
                      exclusiveMinimum: 0,
                      maximum: 1e4
                    },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: [
                  "id",
                  "kind",
                  "dimensions"
                ],
                additionalProperties: false
              },
              {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                  },
                  kind: {
                    const: "math_model"
                  },
                  model: {
                    enum: [
                      "number_line",
                      "fraction_bar",
                      "linear_balance",
                      "quadratic_graph",
                      "percentage_grid",
                      "ratio_table",
                      "coordinate_plane",
                      "rectangle_area",
                      "pythagorean",
                      "linear_graph"
                    ]
                  },
                  parameters: {
                    type: "object",
                    properties: {
                      x: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      a: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      b: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      c: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      numerator: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      denominator: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      targetX: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      targetRatio: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      targetA: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      targetB: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      targetC: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      y: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      width: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      height: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      targetY: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      targetWidth: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      },
                      targetHeight: {
                        type: "number",
                        minimum: -1e6,
                        maximum: 1e6
                      }
                    },
                    required: [],
                    additionalProperties: false
                  }
                },
                required: [
                  "id",
                  "kind",
                  "model",
                  "parameters"
                ],
                additionalProperties: false
              }
            ]
          },
          minItems: 1,
          maxItems: 100
        },
        initialState: {
          type: "object",
          properties: {
            angleLabelsVisible: {
              type: "boolean"
            },
            dragCount: {
              type: "integer",
              minimum: 0
            },
            layers: {
              type: "integer",
              minimum: 0,
              maximum: 10
            },
            x: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            a: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            b: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            c: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            numerator: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            denominator: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            targetX: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            targetRatio: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            targetA: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            targetB: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            targetC: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            y: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            width: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            height: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            targetY: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            targetWidth: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            },
            targetHeight: {
              type: "number",
              minimum: -1e6,
              maximum: 1e6
            }
          },
          additionalProperties: false
        }
      },
      required: [
        "sceneId",
        "coordinateSystem",
        "viewport",
        "objects",
        "initialState"
      ],
      additionalProperties: false
    },
    checkpoints: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
          },
          order: {
            type: "integer",
            minimum: 1
          },
          instruction: {
            type: "string",
            minLength: 1,
            maxLength: 2e3
          },
          allowedInteractions: {
            type: "array",
            items: {
              enum: [
                "drag_vertex",
                "measure_angle",
                "show_geometry_annotation",
                "toggle_angle_labels",
                "drag_angle_token",
                "orbit_solid",
                "select_face",
                "fill_layers",
                "measure_volume",
                "adjust_parameter",
                "number_line_drag",
                "fraction_partition",
                "balance_equation",
                "plot_function",
                "percentage_grid",
                "ratio_table",
                "coordinate_plane",
                "rectangle_area",
                "pythagorean",
                "linear_graph"
              ]
            },
            minItems: 1,
            maxItems: 100,
            uniqueItems: true
          },
          scenePatch: {
            type: "object",
            properties: {
              setState: {
                type: "object",
                properties: {
                  angleLabelsVisible: {
                    type: "boolean"
                  },
                  dragCount: {
                    type: "integer",
                    minimum: 0
                  },
                  layers: {
                    type: "integer",
                    minimum: 0,
                    maximum: 10
                  },
                  x: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  a: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  b: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  c: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  numerator: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  denominator: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  targetX: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  targetRatio: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  targetA: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  targetB: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  targetC: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  y: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  width: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  height: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  targetY: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  targetWidth: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  },
                  targetHeight: {
                    type: "number",
                    minimum: -1e6,
                    maximum: 1e6
                  }
                },
                additionalProperties: false
              },
              addObjects: {
                type: "array",
                items: {
                  oneOf: [
                    {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                        },
                        kind: {
                          const: "point"
                        },
                        position: {
                          type: "array",
                          items: {
                            type: "number"
                          },
                          minItems: 2,
                          maxItems: 2
                        },
                        draggable: {
                          type: "boolean"
                        }
                      },
                      required: [
                        "id",
                        "kind",
                        "position",
                        "draggable"
                      ],
                      additionalProperties: false
                    },
                    {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                        },
                        kind: {
                          const: "polygon"
                        },
                        vertexIds: {
                          type: "array",
                          items: {
                            type: "string",
                            pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                          },
                          minItems: 3,
                          maxItems: 100
                        }
                      },
                      required: [
                        "id",
                        "kind",
                        "vertexIds"
                      ],
                      additionalProperties: false
                    },
                    {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                        },
                        kind: {
                          const: "angle_token"
                        },
                        sourceVertexId: {
                          type: "string",
                          pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                        }
                      },
                      required: [
                        "id",
                        "kind",
                        "sourceVertexId"
                      ],
                      additionalProperties: false
                    },
                    {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                        },
                        kind: {
                          const: "prism"
                        },
                        dimensions: {
                          type: "array",
                          items: {
                            type: "number",
                            exclusiveMinimum: 0,
                            maximum: 1e4
                          },
                          minItems: 3,
                          maxItems: 3
                        }
                      },
                      required: [
                        "id",
                        "kind",
                        "dimensions"
                      ],
                      additionalProperties: false
                    },
                    {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                        },
                        kind: {
                          const: "math_model"
                        },
                        model: {
                          enum: [
                            "number_line",
                            "fraction_bar",
                            "linear_balance",
                            "quadratic_graph",
                            "percentage_grid",
                            "ratio_table",
                            "coordinate_plane",
                            "rectangle_area",
                            "pythagorean",
                            "linear_graph"
                          ]
                        },
                        parameters: {
                          type: "object",
                          properties: {
                            x: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            a: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            b: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            c: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            numerator: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            denominator: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            targetX: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            targetRatio: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            targetA: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            targetB: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            targetC: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            y: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            width: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            height: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            targetY: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            targetWidth: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            },
                            targetHeight: {
                              type: "number",
                              minimum: -1e6,
                              maximum: 1e6
                            }
                          },
                          required: [],
                          additionalProperties: false
                        }
                      },
                      required: [
                        "id",
                        "kind",
                        "model",
                        "parameters"
                      ],
                      additionalProperties: false
                    }
                  ]
                },
                minItems: 0,
                maxItems: 100
              }
            },
            required: [],
            additionalProperties: false
          },
          successCriteria: {
            $ref: "#/$defs/criterion"
          },
          hints: {
            type: "array",
            items: {
              type: "string",
              minLength: 1,
              maxLength: 2e3
            },
            minItems: 0,
            maxItems: 100
          },
          feedback: {
            type: "object",
            properties: {
              success: {
                type: "string",
                minLength: 1,
                maxLength: 2e3
              }
            },
            required: [
              "success"
            ],
            additionalProperties: false
          }
        },
        required: [
          "id",
          "order",
          "instruction",
          "allowedInteractions",
          "scenePatch",
          "successCriteria",
          "hints",
          "feedback"
        ],
        additionalProperties: false
      },
      minItems: 1,
      maxItems: 100
    },
    completion: {
      type: "object",
      properties: {
        requiredCheckpointIds: {
          type: "array",
          items: {
            type: "string",
            pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
          },
          minItems: 1,
          maxItems: 100,
          uniqueItems: true
        }
      },
      required: [
        "requiredCheckpointIds"
      ],
      additionalProperties: false
    },
    recognition: {
      type: "array",
      minItems: 1,
      maxItems: 100,
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            minLength: 1,
            maxLength: 2e3
          },
          mode: {
            enum: [
              "tap",
              "drag",
              "formula"
            ]
          },
          choices: {
            type: "array",
            minItems: 2,
            maxItems: 8,
            items: {
              type: "string",
              minLength: 1,
              maxLength: 2e3
            }
          },
          correct: {
            type: "integer",
            minimum: 1,
            maximum: 8
          },
          explanation: {
            type: "string",
            minLength: 1,
            maxLength: 2e3
          },
          hint: {
            type: "string",
            minLength: 1,
            maxLength: 2e3
          },
          diagram: {
            enum: [
              "none",
              "triangle",
              "circle",
              "cone",
              "chart"
            ]
          },
          uime: {
            type: "object",
            properties: {
              kind: {
                enum: [
                  "TOKEN_CLASSIFIER",
                  "TAP_COEFFICIENT",
                  "NUMBER_LINE_SELECTOR",
                  "INEQUALITY_SIGN_SWITCH",
                  "FORMULA_SNAP_BUILDER",
                  "PARABOLA_SLIDER",
                  "DELTA_STATE_TOGGLE",
                  "TRIANGLE_HOTSPOT_TAP",
                  "GEOMETRIC_HOTSPOT_FINDER",
                  "ANGLE_MEASURE_TAP",
                  "3D_SOLID_INSPECTOR",
                  "CHART_BAR_TAP",
                  "EVENT_CARD_BUCKET"
                ]
              },
              labels: {
                type: "array",
                items: {
                  type: "string",
                  minLength: 1,
                  maxLength: 2e3
                },
                minItems: 0,
                maxItems: 100
              },
              tokens: {
                type: "array",
                items: {
                  type: "string",
                  minLength: 1,
                  maxLength: 2e3
                },
                minItems: 0,
                maxItems: 100
              },
              answers: {
                type: "array",
                minItems: 1,
                maxItems: 8,
                items: {
                  type: "number"
                }
              },
              min: {
                type: "number"
              },
              max: {
                type: "number"
              },
              step: {
                type: "number",
                exclusiveMinimum: 0
              },
              solid: {
                enum: [
                  "cone",
                  "cylinder",
                  "sphere"
                ]
              },
              hotspots: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: {
                      type: "string",
                      minLength: 1,
                      maxLength: 2e3
                    },
                    x: {
                      type: "number",
                      minimum: 0,
                      maximum: 360
                    },
                    y: {
                      type: "number",
                      minimum: 0,
                      maximum: 240
                    },
                    width: {
                      type: "number",
                      minimum: 1,
                      maximum: 360
                    },
                    height: {
                      type: "number",
                      minimum: 1,
                      maximum: 240
                    }
                  },
                  required: [
                    "label",
                    "x",
                    "y",
                    "width",
                    "height"
                  ],
                  additionalProperties: false
                },
                minItems: 0,
                maxItems: 100
              },
              geometry: {
                oneOf: [
                  {
                    type: "object",
                    properties: {
                      mode: {
                        const: "right_triangle"
                      },
                      curriculumCode: {
                        enum: [
                          "M9-GEO-01",
                          "M9-GEO-02",
                          "M9-GEO-03"
                        ]
                      },
                      data: {
                        type: "object",
                        properties: {
                          legA: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 20
                          },
                          legB: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 20
                          },
                          angleAt: {
                            enum: [
                              "B",
                              "C"
                            ]
                          },
                          target: {
                            enum: [
                              "opposite",
                              "adjacent",
                              "hypotenuse"
                            ]
                          },
                          ratio: {
                            enum: [
                              "sin",
                              "cos",
                              "tan"
                            ]
                          },
                          unit: {
                            enum: [
                              "cm",
                              "m"
                            ]
                          }
                        },
                        required: [
                          "legA",
                          "legB",
                          "angleAt",
                          "target",
                          "ratio",
                          "unit"
                        ],
                        additionalProperties: false
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      }
                    },
                    required: [
                      "mode",
                      "curriculumCode",
                      "data",
                      "task"
                    ],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      mode: {
                        const: "circle_symmetry"
                      },
                      curriculumCode: {
                        enum: [
                          "M9-GEO-04"
                        ]
                      },
                      data: {
                        type: "object",
                        properties: {
                          radius: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 20
                          },
                          pointDistance: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 30
                          },
                          pointAngle: {
                            type: "number",
                            minimum: 10,
                            maximum: 80
                          },
                          axis: {
                            enum: [
                              "x",
                              "y"
                            ]
                          },
                          unit: {
                            enum: [
                              "cm",
                              "m"
                            ]
                          }
                        },
                        required: [
                          "radius",
                          "pointDistance",
                          "pointAngle",
                          "axis",
                          "unit"
                        ],
                        additionalProperties: false
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      }
                    },
                    required: [
                      "mode",
                      "curriculumCode",
                      "data",
                      "task"
                    ],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      mode: {
                        const: "line_circle"
                      },
                      curriculumCode: {
                        enum: [
                          "M9-GEO-05"
                        ]
                      },
                      data: {
                        type: "object",
                        properties: {
                          radius: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 20
                          },
                          distance: {
                            type: "number",
                            minimum: 0,
                            maximum: 40
                          },
                          normalAngle: {
                            type: "number",
                            minimum: 0,
                            maximum: 359
                          },
                          unit: {
                            enum: [
                              "cm",
                              "m"
                            ]
                          }
                        },
                        required: [
                          "radius",
                          "distance",
                          "normalAngle",
                          "unit"
                        ],
                        additionalProperties: false
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      }
                    },
                    required: [
                      "mode",
                      "curriculumCode",
                      "data",
                      "task"
                    ],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      mode: {
                        const: "two_circles"
                      },
                      curriculumCode: {
                        enum: [
                          "M9-GEO-06"
                        ]
                      },
                      data: {
                        type: "object",
                        properties: {
                          radius: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 20
                          },
                          radius2: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 20
                          },
                          distance: {
                            type: "number",
                            minimum: 0,
                            maximum: 40
                          },
                          unit: {
                            enum: [
                              "cm",
                              "m"
                            ]
                          }
                        },
                        required: [
                          "radius",
                          "radius2",
                          "distance",
                          "unit"
                        ],
                        additionalProperties: false
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      }
                    },
                    required: [
                      "mode",
                      "curriculumCode",
                      "data",
                      "task"
                    ],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      mode: {
                        const: "circle_angles"
                      },
                      curriculumCode: {
                        enum: [
                          "M9-GEO-07"
                        ]
                      },
                      data: {
                        type: "object",
                        properties: {
                          radius: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 20
                          },
                          sweep: {
                            type: "number",
                            minimum: 20,
                            maximum: 160
                          },
                          unit: {
                            enum: [
                              "cm",
                              "m"
                            ]
                          }
                        },
                        required: [
                          "radius",
                          "sweep",
                          "unit"
                        ],
                        additionalProperties: false
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      }
                    },
                    required: [
                      "mode",
                      "curriculumCode",
                      "data",
                      "task"
                    ],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      mode: {
                        const: "arc_sector_annulus"
                      },
                      curriculumCode: {
                        enum: [
                          "M9-GEO-08"
                        ]
                      },
                      data: {
                        type: "object",
                        properties: {
                          radius: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 20
                          },
                          innerRadius: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 20
                          },
                          sweep: {
                            type: "number",
                            minimum: 20,
                            maximum: 160
                          },
                          measure: {
                            enum: [
                              "arc",
                              "sector",
                              "annulus"
                            ]
                          },
                          unit: {
                            enum: [
                              "cm",
                              "m"
                            ]
                          }
                        },
                        required: [
                          "radius",
                          "innerRadius",
                          "sweep",
                          "measure",
                          "unit"
                        ],
                        additionalProperties: false
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      }
                    },
                    required: [
                      "mode",
                      "curriculumCode",
                      "data",
                      "task"
                    ],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      mode: {
                        const: "triangle_circles"
                      },
                      curriculumCode: {
                        enum: [
                          "M9-GEO-09"
                        ]
                      },
                      data: {
                        type: "object",
                        properties: {
                          sideA: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 20
                          },
                          sideB: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 20
                          },
                          sideC: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 20
                          },
                          construction: {
                            enum: [
                              "incircle",
                              "circumcircle"
                            ]
                          },
                          unit: {
                            enum: [
                              "cm",
                              "m"
                            ]
                          }
                        },
                        required: [
                          "sideA",
                          "sideB",
                          "sideC",
                          "construction",
                          "unit"
                        ],
                        additionalProperties: false
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      }
                    },
                    required: [
                      "mode",
                      "curriculumCode",
                      "data",
                      "task"
                    ],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      mode: {
                        const: "cyclic_polygon"
                      },
                      curriculumCode: {
                        enum: [
                          "M9-GEO-10"
                        ]
                      },
                      data: {
                        type: "object",
                        properties: {
                          radius: {
                            type: "number",
                            minimum: 0.5,
                            maximum: 20
                          },
                          shape: {
                            enum: [
                              "regular_polygon",
                              "cyclic_quadrilateral"
                            ]
                          },
                          vertices: {
                            type: "integer",
                            minimum: 3,
                            maximum: 12
                          },
                          angleB: {
                            type: "number",
                            minimum: 0,
                            maximum: 359
                          },
                          angleC: {
                            type: "number",
                            minimum: 0,
                            maximum: 359
                          },
                          angleD: {
                            type: "number",
                            minimum: 0,
                            maximum: 359
                          },
                          unit: {
                            enum: [
                              "cm",
                              "m"
                            ]
                          }
                        },
                        required: [
                          "radius",
                          "shape",
                          "vertices",
                          "angleB",
                          "angleC",
                          "angleD",
                          "unit"
                        ],
                        additionalProperties: false
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      }
                    },
                    required: [
                      "mode",
                      "curriculumCode",
                      "data",
                      "task"
                    ],
                    additionalProperties: false
                  }
                ]
              },
              algebra: {
                oneOf: [
                  {
                    type: "object",
                    properties: {
                      mode: {
                        const: "product_equation"
                      },
                      data: {
                        type: "object",
                        properties: {
                          p: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          q: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          r: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          s: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          }
                        },
                        required: [
                          "p",
                          "q",
                          "r",
                          "s"
                        ],
                        additionalProperties: false
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      }
                    },
                    required: [
                      "mode",
                      "data",
                      "task"
                    ],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      mode: {
                        const: "rational_equation"
                      },
                      data: {
                        type: "object",
                        properties: {
                          p: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          q: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          r: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          s: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          d: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          e: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          f: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          g: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          k: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          }
                        },
                        required: [
                          "p",
                          "q",
                          "r",
                          "s",
                          "d",
                          "e",
                          "f",
                          "g",
                          "k"
                        ],
                        additionalProperties: false
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      }
                    },
                    required: [
                      "mode",
                      "data",
                      "task"
                    ],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      mode: {
                        const: "quadratic_equation"
                      },
                      data: {
                        type: "object",
                        properties: {
                          a: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          b: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          c: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          degreePolicy: {
                            enum: [
                              "quadratic_only",
                              "allow_linear"
                            ]
                          }
                        },
                        required: [
                          "a",
                          "b",
                          "c",
                          "degreePolicy"
                        ],
                        additionalProperties: false
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      }
                    },
                    required: [
                      "mode",
                      "data",
                      "task"
                    ],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      mode: {
                        const: "viete"
                      },
                      data: {
                        type: "object",
                        properties: {
                          a: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          b: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          },
                          c: {
                            type: "integer",
                            minimum: -9,
                            maximum: 9
                          }
                        },
                        required: [
                          "a",
                          "b",
                          "c"
                        ],
                        additionalProperties: false
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      }
                    },
                    required: [
                      "mode",
                      "data",
                      "task"
                    ],
                    additionalProperties: false
                  }
                ]
              },
              graph: {
                oneOf: [
                  {
                    type: "object",
                    properties: {
                      a: {
                        type: "integer",
                        minimum: -12,
                        maximum: 12
                      },
                      b: {
                        type: "integer",
                        minimum: -12,
                        maximum: 12
                      },
                      c: {
                        type: "integer",
                        minimum: -12,
                        maximum: 12
                      },
                      snap: {
                        enum: [
                          0,
                          0.5,
                          1
                        ]
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      },
                      mode: {
                        const: "linear_relation"
                      }
                    },
                    required: [
                      "a",
                      "b",
                      "c",
                      "snap",
                      "task",
                      "mode"
                    ],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      a: {
                        type: "integer",
                        minimum: -12,
                        maximum: 12
                      },
                      b: {
                        type: "integer",
                        minimum: -12,
                        maximum: 12
                      },
                      c: {
                        type: "integer",
                        minimum: -12,
                        maximum: 12
                      },
                      snap: {
                        enum: [
                          0,
                          0.5,
                          1
                        ]
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      },
                      mode: {
                        const: "linear_system"
                      },
                      d: {
                        type: "integer",
                        minimum: -12,
                        maximum: 12
                      },
                      e: {
                        type: "integer",
                        minimum: -12,
                        maximum: 12
                      },
                      f: {
                        type: "integer",
                        minimum: -12,
                        maximum: 12
                      }
                    },
                    required: [
                      "a",
                      "b",
                      "c",
                      "snap",
                      "task",
                      "mode",
                      "d",
                      "e",
                      "f"
                    ],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      a: {
                        type: "integer",
                        minimum: -12,
                        maximum: 12
                      },
                      b: {
                        type: "integer",
                        minimum: -12,
                        maximum: 12
                      },
                      c: {
                        type: "integer",
                        minimum: -12,
                        maximum: 12
                      },
                      snap: {
                        enum: [
                          0,
                          0.5,
                          1
                        ]
                      },
                      task: {
                        enum: [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      },
                      mode: {
                        const: "line_parabola_intersection"
                      },
                      q: {
                        enum: [
                          -12,
                          -11,
                          -10,
                          -9,
                          -8,
                          -7,
                          -6,
                          -5,
                          -4,
                          -3,
                          -2,
                          -1,
                          1,
                          2,
                          3,
                          4,
                          5,
                          6,
                          7,
                          8,
                          9,
                          10,
                          11,
                          12
                        ]
                      }
                    },
                    required: [
                      "a",
                      "b",
                      "c",
                      "snap",
                      "task",
                      "mode",
                      "q"
                    ],
                    additionalProperties: false
                  }
                ]
              },
              parabola: {
                type: "object",
                properties: {
                  a: {
                    enum: [
                      -5,
                      -4,
                      -3,
                      -2,
                      -1,
                      1,
                      2,
                      3,
                      4,
                      5
                    ]
                  },
                  pointX: {
                    enum: [
                      1,
                      2,
                      -2
                    ]
                  },
                  task: {
                    enum: [
                      "explore",
                      "identify",
                      "compare",
                      "guided",
                      "practice",
                      "assessment"
                    ]
                  }
                },
                required: [
                  "a",
                  "pointX",
                  "task"
                ],
                additionalProperties: false
              },
              cylinder: {
                type: "object",
                properties: {
                  radius: {
                    type: "number",
                    minimum: 0.1,
                    maximum: 100
                  },
                  height: {
                    type: "number",
                    minimum: 0.1,
                    maximum: 100
                  },
                  unit: {
                    enum: [
                      "cm",
                      "m"
                    ]
                  },
                  task: {
                    enum: [
                      "orbit",
                      "radius",
                      "equal-bases",
                      "height",
                      "side"
                    ]
                  }
                },
                required: [
                  "radius",
                  "height",
                  "unit",
                  "task"
                ],
                additionalProperties: false
              },
              svg: {
                type: "string",
                maxLength: 65536
              }
            },
            required: [
              "kind",
              "labels",
              "tokens",
              "answers",
              "min",
              "max",
              "step",
              "solid",
              "hotspots"
            ],
            additionalProperties: false
          }
        },
        required: [
          "question",
          "mode",
          "choices",
          "correct",
          "explanation",
          "hint",
          "diagram"
        ],
        additionalProperties: false
      }
    }
  },
  required: [
    "schemaVersion",
    "lessonId",
    "version",
    "status",
    "locale",
    "title",
    "grade",
    "subject",
    "topicIds",
    "learningObjectives",
    "engine",
    "scene",
    "checkpoints",
    "completion"
  ],
  additionalProperties: false,
  $defs: {
    criterion: {
      oneOf: [
        {
          type: "object",
          properties: {
            op: {
              enum: [
                "all",
                "any"
              ]
            },
            conditions: {
              type: "array",
              items: {
                $ref: "#/$defs/criterion"
              },
              minItems: 1,
              maxItems: 100
            }
          },
          required: [
            "op",
            "conditions"
          ],
          additionalProperties: false
        },
        {
          type: "object",
          properties: {
            op: {
              const: "not"
            },
            condition: {
              $ref: "#/$defs/criterion"
            }
          },
          required: [
            "op",
            "condition"
          ],
          additionalProperties: false
        },
        {
          type: "object",
          properties: {
            op: {
              enum: [
                "eq",
                "neq",
                "gt",
                "gte",
                "lt",
                "lte",
                "approx",
                "within"
              ]
            },
            path: {
              enum: [
                "metrics.validVertexDragCount",
                "metrics.validVertexDragCountSinceCheckpoint",
                "metrics.snappedAngleTokens",
                "metrics.assembledAngleDegrees",
                "metrics.orbitRadians",
                "metrics.selectedFaces",
                "metrics.filledLayers",
                "metrics.volume",
                "metrics.parameterChangeCount",
                "metrics.parameterChangeCountSinceCheckpoint",
                "metrics.modelError",
                "metrics.modelValue"
              ]
            },
            value: {
              type: "number"
            },
            tolerance: {
              type: "number",
              minimum: 0
            },
            max: {
              type: "number"
            }
          },
          required: [
            "op",
            "path",
            "value"
          ],
          additionalProperties: false
        }
      ]
    }
  }
};

// packages/lesson-runtime/extra-models.ts
var extraModels = ["percentage_grid", "ratio_table", "coordinate_plane", "rectangle_area", "pythagorean", "linear_graph"];
var extraEngineMap = { percentage_grid: "percentage_2d", ratio_table: "ratio_2d", coordinate_plane: "coordinate_2d", rectangle_area: "area_2d", pythagorean: "pythagorean_2d", linear_graph: "linear_plot_2d" };
function isExtraModel(model) {
  return extraModels.includes(model);
}
function extraControls(model) {
  switch (model) {
    case "percentage_grid":
      return [{ name: "x", label: "Ph\u1EA7n tr\u0103m", min: 0, max: 100, step: 1 }];
    case "ratio_table":
      return [{ name: "x", label: "S\u1ED1 l\u1EA7n g\u1EA5p", min: 0, max: 10, step: 0.1 }];
    case "coordinate_plane":
      return ["x", "y"].map((name) => ({ name, label: name === "x" ? "Ngang (x)" : "D\u1ECDc (y)", min: -10, max: 10, step: 0.1 }));
    case "rectangle_area":
    case "pythagorean":
      return ["width", "height"].map((name) => ({ name, label: model === "pythagorean" ? name === "width" ? "C\u1EA1nh g\xF3c vu\xF4ng 1" : "C\u1EA1nh g\xF3c vu\xF4ng 2" : name === "width" ? "Chi\u1EC1u d\xE0i" : "Chi\u1EC1u r\u1ED9ng", min: 1, max: 10, step: 0.1 }));
    case "linear_graph":
      return [{ name: "a", label: "\u0110\u1ED9 d\u1ED1c", min: -10, max: 10, step: 0.1 }, { name: "b", label: "\u0110\u1ED9 cao ban \u0111\u1EA7u", min: -10, max: 10, step: 0.1 }];
  }
}
var extraDefaults = { y: 0, width: 1, height: 1, targetY: 0, targetWidth: 3, targetHeight: 4 };
function extraMetrics(model, s) {
  switch (model) {
    case "percentage_grid":
      return { modelValue: s.b * s.x / 100, modelError: Math.abs(s.x - s.targetX) };
    case "ratio_table":
      return { modelValue: s.b * s.x, modelError: Math.abs(s.x - s.targetX) };
    case "coordinate_plane":
      return { modelValue: Math.hypot(s.x, s.y), modelError: Math.hypot(s.x - s.targetX, s.y - s.targetY) };
    case "rectangle_area":
      return { modelValue: s.width * s.height, modelError: Math.abs(s.width - s.targetWidth) + Math.abs(s.height - s.targetHeight) };
    case "pythagorean":
      return { modelValue: Math.hypot(s.width, s.height), modelError: Math.abs(s.width - s.targetWidth) + Math.abs(s.height - s.targetHeight) };
    case "linear_graph":
      return { modelValue: s.a * s.x + s.b, modelError: Math.abs(s.a - s.targetA) + Math.abs(s.b - s.targetB) };
  }
}

// packages/lesson-contract/index.ts
var capabilities = ["drag_vertex", "measure_angle", "show_geometry_annotation", "toggle_angle_labels", "drag_angle_token", "orbit_solid", "select_face", "fill_layers", "measure_volume", "adjust_parameter", "number_line_drag", "fraction_partition", "balance_equation", "plot_function", "percentage_grid", "ratio_table", "coordinate_plane", "rectangle_area", "pythagorean", "linear_graph"];
var metricPaths = ["metrics.validVertexDragCount", "metrics.validVertexDragCountSinceCheckpoint", "metrics.snappedAngleTokens", "metrics.assembledAngleDegrees", "metrics.orbitRadians", "metrics.selectedFaces", "metrics.filledLayers", "metrics.volume", "metrics.parameterChangeCount", "metrics.parameterChangeCountSinceCheckpoint", "metrics.modelError", "metrics.modelValue"];
var ajv = new import__.default({ allErrors: true, strict: false });
var check = ajv.compile(lesson_schema_default);
var engineCapabilities = {
  geometry_2d: capabilities.slice(0, 5),
  geometry_3d_web: capabilities.slice(5, 9),
  math_explorer_2d: ["adjust_parameter"],
  number_line_2d: ["adjust_parameter", "number_line_drag"],
  fraction_bar_2d: ["adjust_parameter", "fraction_partition"],
  algebra_balance_2d: ["adjust_parameter", "balance_equation"],
  function_plot_2d: ["adjust_parameter", "plot_function"],
  percentage_2d: ["adjust_parameter", "percentage_grid"],
  ratio_2d: ["adjust_parameter", "ratio_table"],
  coordinate_2d: ["adjust_parameter", "coordinate_plane"],
  area_2d: ["adjust_parameter", "rectangle_area"],
  pythagorean_2d: ["adjust_parameter", "pythagorean"],
  linear_plot_2d: ["adjust_parameter", "linear_graph"]
};
function isMathEngine(type) {
  return !["geometry_2d", "geometry_3d_web"].includes(type);
}
function validateLesson(input) {
  if (!check(input)) return (check.errors ?? []).map((e) => `${e.instancePath}: ${e.message}`);
  const l = input, errors = [];
  l.recognition?.forEach((t) => {
    if (t.uime) errors.push(...validateUime(t.uime));
  });
  if (l.recognition) {
    if (l.recognition.length !== l.checkpoints.length || l.engine.type !== "math_explorer_2d") errors.push("Recognition checkpoint/engine mismatch");
    l.recognition.forEach((t, i) => {
      if (t.correct > t.choices.length || new Set(t.choices).size !== t.choices.length || l.checkpoints[i]?.scenePatch.setState?.targetX !== t.correct) errors.push("Invalid recognition target");
    });
  }
  const ids = /* @__PURE__ */ new Set();
  const objects = /* @__PURE__ */ new Map();
  function add2(o) {
    if (ids.has(o.id)) errors.push(`Duplicate object ${o.id}`);
    ids.add(o.id);
    objects.set(o.id, o);
  }
  l.scene.objects.forEach(add2);
  const cps = /* @__PURE__ */ new Set();
  const allowed = engineCapabilities[l.engine.type];
  if (l.scene.viewport.width !== 360 || l.scene.viewport.height !== 360) errors.push("Runtime 1 requires a 360 \xD7 360 logical viewport");
  for (const cap of l.engine.requiredCapabilities) if (!allowed.includes(cap)) errors.push(`Unsupported capability ${cap}`);
  if (l.engine.type !== "geometry_3d_web" !== (l.scene.coordinateSystem === "cartesian_2d")) errors.push("Coordinate system mismatch");
  l.checkpoints.forEach((cp, i) => {
    if (cp.order !== i + 1 || cps.has(cp.id)) errors.push("Checkpoint order/identity invalid");
    cps.add(cp.id);
    cp.scenePatch.addObjects?.forEach(add2);
    for (const c of cp.allowedInteractions) if (!allowed.includes(c) || !l.engine.requiredCapabilities.includes(c)) errors.push(`Undeclared interaction ${c}`);
    walk(cp.successCriteria, (c) => {
      if (c.op === "approx" && c.tolerance === void 0) errors.push("Approx requires tolerance");
      if (c.op === "within" && (c.max === void 0 || c.max < c.value)) errors.push("Invalid interval");
      const index = metricPaths.indexOf(c.path);
      if (l.engine.type === "geometry_2d" && index > 3 || l.engine.type === "geometry_3d_web" && (index < 4 || index > 7) || isMathEngine(l.engine.type) && index < 8) errors.push("Metric unsupported by selected engine");
      if (c.value < 0 && c.path !== "metrics.modelValue") errors.push("Metric target cannot be negative");
    });
  });
  for (const o of objects.values()) {
    if (o.kind === "polygon" && (o.vertexIds.length !== 3 || new Set(o.vertexIds).size !== 3 || o.vertexIds.some((id) => objects.get(id)?.kind !== "point"))) errors.push("Invalid triangle references");
    if (o.kind === "angle_token" && objects.get(o.sourceVertexId)?.kind !== "point") errors.push("Invalid angle source");
    if (o.kind === "point" && (o.position[0] < 24 || o.position[0] > 336 || o.position[1] < 24 || o.position[1] > 265)) errors.push("Point outside runtime bounds");
    if (o.kind === "prism" && o.dimensions.some((n) => !Number.isInteger(n) || n > 10)) errors.push("Prism requires integer dimensions 1\u201310");
    if (o.kind === "math_model") {
      const engineForModel = { number_line: "number_line_2d", fraction_bar: "fraction_bar_2d", linear_balance: "algebra_balance_2d", quadratic_graph: "function_plot_2d", ...extraEngineMap };
      if (l.engine.type !== "math_explorer_2d" && l.engine.type !== engineForModel[o.model]) errors.push("Math model does not match selected engine");
      const p2 = { x: 0, a: 1, b: 0, c: 0, numerator: 1, denominator: 4, targetX: 2, targetRatio: 0.5, targetA: 1, targetB: 0, targetC: 0, ...o.parameters };
      if (p2.denominator < 1 || p2.denominator > 12 || !Number.isInteger(p2.denominator) || p2.numerator < 0 || p2.numerator > p2.denominator || !Number.isInteger(p2.numerator)) errors.push("Invalid fraction parameters");
      if (o.model === "linear_balance" && (p2.a === 0 || Math.abs((p2.c - p2.b) / p2.a) > 10)) errors.push("Equation has no reachable solution");
      if (o.model === "number_line" && Math.abs(p2.targetX) > 10) errors.push("Number line target outside bounds");
      if (isExtraModel(o.model)) {
        const q = o.parameters;
        if (o.model === "percentage_grid" && (q.targetX < 0 || q.targetX > 100 || !Number.isInteger(q.targetX) || !(q.b > 0))) errors.push("Ph\u1EA7n tr\u0103m c\u1EA7n s\u1ED1 nguy\xEAn 0\u2013100 v\xE0 t\u1ED5ng ban \u0111\u1EA7u d\u01B0\u01A1ng");
        if (o.model === "ratio_table" && (!(q.a > 0) || !(q.b > 0) || q.targetX < 0 || q.targetX > 10)) errors.push("T\u1EC9 l\u1EC7 ph\u1EA3i d\u01B0\u01A1ng, s\u1ED1 l\u1EA7n g\u1EA5p t\u1EEB 0\u201310");
        if (o.model === "coordinate_plane" && (Math.abs(q.targetX) > 10 || Math.abs(q.targetY) > 10)) errors.push("T\u1ECDa \u0111\u1ED9 m\u1EE5c ti\xEAu trong kho\u1EA3ng \u221210 \u0111\u1EBFn 10");
        if (["rectangle_area", "pythagorean"].includes(o.model) && [q.targetWidth, q.targetHeight].some((v) => v < 1 || v > 10)) errors.push("\u0110\u1ED9 d\xE0i c\u1EA1nh t\u1EEB 1\u201310");
        if (o.model === "linear_graph" && [q.targetA, q.targetB].some((v) => !Number.isFinite(v) || Math.abs(v) > 10)) errors.push("H\u1EC7 s\u1ED1 \u0111\u01B0\u1EDDng th\u1EB3ng t\u1EEB \u221210 \u0111\u1EBFn 10");
      }
    }
  }
  const poly = l.scene.objects.find((o) => o.kind === "polygon");
  if (poly?.kind === "polygon") {
    const p2 = poly.vertexIds.map((id) => objects.get(id)).filter((o) => o?.kind === "point");
    if (p2.length === 3) {
      const [a, b, c] = p2.map((o) => o.position);
      if (Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) < 1e3) errors.push("Initial triangle is degenerate");
    }
  }
  if (l.engine.type === "geometry_2d" && !l.scene.objects.some((o) => o.kind === "polygon")) errors.push("Triangle renderer requires polygon");
  if (l.engine.type === "geometry_3d_web" && l.scene.objects.filter((o) => o.kind === "prism").length !== 1) errors.push("Solid renderer requires one prism");
  if (isMathEngine(l.engine.type) && l.scene.objects.filter((o) => o.kind === "math_model").length !== 1) errors.push("Math explorer requires one model");
  if (l.completion.requiredCheckpointIds.length !== cps.size || l.completion.requiredCheckpointIds.some((id) => !cps.has(id))) errors.push("Completion must require all checkpoints");
  return errors;
}
function walk(c, fn) {
  if ("conditions" in c) c.conditions.forEach((x) => walk(x, fn));
  else if ("condition" in c) walk(c.condition, fn);
  else fn(c);
}
function evaluate(c, metrics) {
  if ("conditions" in c) return c.op === "all" ? c.conditions.every((x) => evaluate(x, metrics)) : c.conditions.some((x) => evaluate(x, metrics));
  if ("condition" in c) return !evaluate(c.condition, metrics);
  const a = metrics[c.path.slice(8)];
  if (!Number.isFinite(a)) return false;
  switch (c.op) {
    case "eq":
      return a === c.value;
    case "neq":
      return a !== c.value;
    case "gt":
      return a > c.value;
    case "gte":
      return a >= c.value;
    case "lt":
      return a < c.value;
    case "lte":
      return a <= c.value;
    case "approx":
      return Math.abs(a - c.value) <= (c.tolerance ?? 0);
    case "within":
      return a >= c.value && a <= (c.max ?? c.value);
  }
}

// packages/lesson-runtime/index.ts
function identity(l) {
  return JSON.stringify(l);
}
function triangleAngles(p2) {
  return p2.map((v, i) => {
    const a = p2[(i + 1) % 3], b = p2[(i + 2) % 3], x = [a[0] - v[0], a[1] - v[1]], y = [b[0] - v[0], b[1] - v[1]];
    return Math.acos(Math.max(-1, Math.min(1, (x[0] * y[0] + x[1] * y[1]) / (Math.hypot(...x) * Math.hypot(...y))))) * 180 / Math.PI;
  });
}
function triangleArea(p2) {
  return Math.abs((p2[1][0] - p2[0][0]) * (p2[2][1] - p2[0][1]) - (p2[2][0] - p2[0][0]) * (p2[1][1] - p2[0][1])) / 2;
}
var LessonSession = class _LessonSession {
  lesson;
  snapshot;
  objects;
  listeners = /* @__PURE__ */ new Set();
  eventListeners = /* @__PURE__ */ new Set();
  constructor(l, saved) {
    const errors = validateLesson(l);
    if (errors.length) throw Error(errors.join("; "));
    this.lesson = structuredClone(l);
    this.objects = structuredClone(l.scene.objects);
    this.snapshot = { identity: identity(l), checkpoint: 0, completed: false, points: Object.fromEntries(l.scene.objects.filter((o) => o.kind === "point").map((o) => [o.id, o.position])), state: { ...l.scene.initialState }, metrics: { validVertexDragCount: 0, validVertexDragCountSinceCheckpoint: 0, snappedAngleTokens: 0, assembledAngleDegrees: 0, orbitRadians: 0, selectedFaces: 0, filledLayers: 0, volume: 0 }, tokens: [], faces: [], revision: 0 };
    const model = this.objects.find((o) => o.kind === "math_model");
    if (model?.kind === "math_model") Object.assign(this.snapshot.state, { x: 0, a: 1, b: 0, c: 0, numerator: 1, denominator: 4, targetX: 2, targetRatio: 0.5, targetA: 1, targetB: 0, targetC: 0, ...extraDefaults }, model.parameters, l.scene.initialState);
    Object.assign(this.snapshot.metrics, { parameterChangeCount: 0, parameterChangeCountSinceCheckpoint: 0, modelError: 1e3, modelValue: 0 });
    const restored = !!(saved && saved.identity === identity(l) && Number.isInteger(saved.checkpoint) && saved.checkpoint >= 0 && saved.checkpoint < l.checkpoints.length && Object.values(saved.points).every((p2) => p2.length === 2 && p2.every(Number.isFinite)));
    if (restored) this.snapshot = structuredClone(saved);
    for (let i = 0; i <= this.snapshot.checkpoint; i++) this.patch(restored ? { addObjects: l.checkpoints[i].scenePatch.addObjects } : l.checkpoints[i].scenePatch);
    this.updateModel();
  }
  get checkpoint() {
    return this.lesson.checkpoints[this.snapshot.checkpoint];
  }
  get success() {
    return evaluate(this.checkpoint.successCriteria, this.snapshot.metrics);
  }
  subscribe = (f) => {
    this.listeners.add(f);
    return () => {
      this.listeners.delete(f);
    };
  };
  onInteraction = (f) => {
    this.eventListeners.add(f);
    return () => {
      this.eventListeners.delete(f);
    };
  };
  emit() {
    this.snapshot.revision++;
    this.listeners.forEach((f) => f());
  }
  patch(p2) {
    Object.assign(this.snapshot.state, p2.setState);
    for (const o of p2.addObjects ?? []) if (!this.objects.some((x) => x.id === o.id)) this.objects.push(structuredClone(o));
  }
  triangle() {
    const poly = this.objects.find((o) => o.kind === "polygon");
    return poly?.kind === "polygon" ? poly.vertexIds.map((id) => this.snapshot.points[id]) : [];
  }
  updateModel() {
    const model = this.objects.find((o) => o.kind === "math_model");
    if (model?.kind !== "math_model") return;
    const s = this.snapshot.state, m = this.snapshot.metrics;
    const u = this.lesson.recognition?.[this.snapshot.checkpoint]?.uime;
    if (u) {
      m.modelError = uimeError(u, s);
      m.modelValue = s.x;
      return;
    }
    if (isExtraModel(model.model)) {
      Object.assign(m, extraMetrics(model.model, s));
      return;
    }
    switch (model.model) {
      case "number_line":
        m.modelValue = s.x;
        m.modelError = Math.abs(s.x - s.targetX);
        break;
      case "fraction_bar":
        m.modelValue = s.numerator / s.denominator;
        m.modelError = Math.abs(m.modelValue - s.targetRatio);
        break;
      case "linear_balance":
        m.modelValue = s.a * s.x + s.b;
        m.modelError = Math.abs(m.modelValue - s.c);
        break;
      case "quadratic_graph":
        m.modelValue = s.a * s.x * s.x + s.b * s.x + s.c;
        m.modelError = Math.abs(s.a - s.targetA) + Math.abs(s.b - s.targetB) + Math.abs(s.c - s.targetC);
    }
  }
  interact(e) {
    if (this.snapshot.completed || !this.checkpoint.allowedInteractions.includes(e.type)) return false;
    const s = this.snapshot, m = s.metrics;
    const u = this.lesson.recognition?.[s.checkpoint]?.uime;
    if (u && e.type === "adjust_parameter") {
      if (!uimeAccept(u, e.name, e.value) || s.state[e.name] === e.value) return false;
      if (u.algebra) applyAlgebraInteraction(u.algebra, s.state, e.name, e.value);
      else if (u.geometry) applyGeometryInteraction(u.geometry, s.state, e.name, e.value);
      else if (u.graph) applyGraphInteraction(u.graph, s.state, e.name, e.value);
      else if (u.parabola) applyParabolaInteraction(u.parabola, s.state, e.name, e.value);
      else if (u.cylinder) applyCylinderInteraction(s.state, e.name, e.value);
      else s.state[e.name] = e.value;
      m.parameterChangeCount++;
      m.parameterChangeCountSinceCheckpoint++;
      m.modelError = uimeError(u, s.state);
      m.modelValue = Number(s.state.x);
      this.emit();
      this.eventListeners.forEach((f) => f(e));
      return true;
    }
    if (e.type === "drag_vertex") {
      const obj = this.objects.find((o) => o.id === e.id), old = s.points[e.id];
      if (obj?.kind !== "point" || !obj.draggable || !old || !e.position.every(Number.isFinite) || Math.hypot(old[0] - e.position[0], old[1] - e.position[1]) < 3) return false;
      const [x, y] = e.position;
      if (x < 24 || x > 336 || y < 24 || y > 265) return false;
      s.points[e.id] = [x, y];
      if (triangleArea(this.triangle()) < 500) {
        s.points[e.id] = old;
        return false;
      }
      m.validVertexDragCount++;
      m.validVertexDragCountSinceCheckpoint++;
    } else if (e.type === "drag_angle_token") {
      const o = this.objects.find((o2) => o2.id === e.id);
      if (o?.kind !== "angle_token" || s.tokens.includes(e.id) || e.position[0] < 30 || e.position[0] > 330 || e.position[1] < 290 || e.position[1] > 350) return false;
      s.tokens.push(e.id);
      m.snappedAngleTokens = s.tokens.length;
      const polygon = this.objects.find((o2) => o2.kind === "polygon");
      const angles = triangleAngles(this.triangle());
      m.assembledAngleDegrees = s.tokens.reduce((sum, id) => {
        const t = this.objects.find((o2) => o2.id === id);
        return sum + (t?.kind === "angle_token" && polygon?.kind === "polygon" ? angles[polygon.vertexIds.indexOf(t.sourceVertexId)] : 0);
      }, 0);
    } else if (e.type === "orbit_solid") {
      if (!Number.isFinite(e.radians) || Math.abs(e.radians) > Math.PI) return false;
      m.orbitRadians += Math.abs(e.radians);
    } else if (e.type === "select_face") {
      if (!Number.isInteger(e.face) || e.face < 0 || e.face > 5) return false;
      if (!s.faces.includes(e.face)) s.faces.push(e.face);
      m.selectedFaces = s.faces.length;
    } else if (e.type === "fill_layers") {
      const p2 = this.objects.find((o) => o.kind === "prism");
      if (p2?.kind !== "prism" || !Number.isInteger(e.layers) || e.layers < 0 || e.layers > p2.dimensions[2]) return false;
      m.filledLayers = e.layers;
      m.volume = p2.dimensions[0] * p2.dimensions[1] * e.layers;
      s.state.layers = e.layers;
    } else if (e.type === "adjust_parameter") {
      const model = this.objects.find((o) => o.kind === "math_model");
      if (model?.kind !== "math_model" || !Number.isFinite(e.value)) return false;
      const names = isExtraModel(model.model) ? extraControls(model.model).map((c) => c.name) : model.model === "number_line" || model.model === "linear_balance" ? ["x"] : model.model === "fraction_bar" ? ["numerator", "denominator"] : ["a", "b", "c"];
      if (!names.includes(e.name) || e.value === s.state[e.name]) return false;
      if (isExtraModel(model.model)) {
        const c = extraControls(model.model).find((c2) => c2.name === e.name);
        if (e.value < c.min || e.value > c.max || c.step === 1 && !Number.isInteger(e.value)) return false;
      } else if (model.model === "fraction_bar") {
        if (!Number.isInteger(e.value) || e.value < 0 || e.value > 12 || e.name === "denominator" && e.value < 1 || e.name === "numerator" && e.value > Number(s.state.denominator) || e.name === "denominator" && e.value < Number(s.state.numerator)) return false;
      } else if (Math.abs(e.value) > 10) return false;
      s.state[e.name] = e.value;
      m.parameterChangeCount++;
      m.parameterChangeCountSinceCheckpoint++;
      this.updateModel();
    }
    this.emit();
    this.eventListeners.forEach((f) => f(e));
    return true;
  }
  advance() {
    if (!this.success || this.snapshot.completed) return false;
    if (this.snapshot.checkpoint === this.lesson.checkpoints.length - 1) this.snapshot.completed = true;
    else {
      this.snapshot.checkpoint++;
      this.snapshot.metrics.validVertexDragCountSinceCheckpoint = 0;
      this.snapshot.metrics.parameterChangeCountSinceCheckpoint = 0;
      if (this.lesson.engine.type === "geometry_3d_web" && this.snapshot.checkpoint === 3) {
        this.snapshot.metrics.filledLayers = 0;
        this.snapshot.metrics.volume = 0;
        this.snapshot.state.layers = 0;
      }
      this.patch(this.checkpoint.scenePatch);
      this.updateModel();
    }
    this.emit();
    return true;
  }
  reset() {
    const fresh = new _LessonSession(this.lesson);
    this.snapshot = fresh.snapshot;
    this.objects = fresh.objects;
    this.emit();
  }
  previewCheckpoint(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.lesson.checkpoints.length) return;
    this.snapshot.checkpoint = index;
    this.snapshot.completed = false;
    for (let i = 0; i <= index; i++) this.patch(this.lesson.checkpoints[i].scenePatch);
    this.snapshot.metrics.validVertexDragCountSinceCheckpoint = 0;
    this.snapshot.metrics.parameterChangeCountSinceCheckpoint = 0;
    this.updateModel();
    this.emit();
  }
};

// packages/lesson-runtime/replay.ts
function replay(lesson, events) {
  if (!Array.isArray(events) || events.length > 1e4) throw Error("Invalid event journal");
  const session = new LessonSession(lesson);
  for (const entry of events) {
    if (!entry || typeof entry !== "object") throw Error("Invalid event");
    if (entry.kind === "advance") {
      if (!session.advance()) throw Error("Checkpoint criteria not met");
    } else if (entry.kind === "interaction") {
      if (!session.interact(entry.event)) throw Error("Invalid interaction");
    } else throw Error("Unknown event");
  }
  return session.snapshot;
}

// supabase/functions/progress/main.ts
var cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization,x-client-info,apikey,content-type", "Access-Control-Allow-Methods": "POST,OPTIONS" };
function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("", { headers: cors });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_ANON_KEY"), secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return response({ error: "Unauthorized" }, 401);
    const headers = { apikey: key, Authorization: auth, "Content-Type": "application/json" };
    const userResponse = await fetch(url + "/auth/v1/user", { headers });
    if (!userResponse.ok) return response({ error: "Unauthorized" }, 401);
    const user = await userResponse.json();
    const raw = await req.text();
    if (raw.length > 1e6) return response({ error: "Payload too large" }, 413);
    const body = JSON.parse(raw);
    if (typeof body.lessonId !== "string" || !Number.isInteger(body.version)) return response({ error: "Invalid lesson identity" }, 400);
    const manifestResponse = await fetch(url + "/rest/v1/rpc/get_published_manifest", { method: "POST", headers, body: JSON.stringify({ p_lesson_id: body.lessonId, p_version: body.version }) });
    if (!manifestResponse.ok) return response({ error: "Manifest unavailable" }, 403);
    const manifest = await manifestResponse.json();
    if (!manifest) return response({ error: "Manifest unavailable" }, 404);
    const snapshot = { ...replay(manifest, body.events), journal: body.events };
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify([user.id, body.lessonId, body.version, body.events]))));
    const hex = Array.from(digest.slice(0, 16)).map((b) => b.toString(16).padStart(2, "0")).join(""), attemptId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
    const saved = await fetch(url + "/rest/v1/rpc/commit_lesson_progress", { method: "POST", headers: { apikey: secret, Authorization: "Bearer " + secret, "Content-Type": "application/json" }, body: JSON.stringify({ p_user_id: user.id, p_lesson_id: body.lessonId, p_version: body.version, p_attempt_id: attemptId, p_snapshot: snapshot, p_revision: snapshot.revision }) });
    if (!saved.ok) return response({ error: saved.status === 409 ? "Revision conflict" : "Progress update rejected" }, 409);
    return response({ snapshot: await saved.json() });
  } catch {
    return response({ error: "Invalid request or event journal" }, 400);
  }
});
