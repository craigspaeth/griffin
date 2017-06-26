'use strict';
var Bootstrap = (function () {
'use strict';

/* @flow */

class Variable {

  constructor(default_value = Symbol.for("tailored.no_value")) {
    this.default_value = default_value;
  }
}

class Wildcard {
  constructor() {}
}

class StartsWith {

  constructor(prefix) {
    this.prefix = prefix;
  }
}

class Capture {

  constructor(value) {
    this.value = value;
  }
}

class HeadTail {
  constructor() {}
}

class Type {

  constructor(type, objPattern = {}) {
    this.type = type;
    this.objPattern = objPattern;
  }
}

class Bound {

  constructor(value) {
    this.value = value;
  }
}

class BitStringMatch {

  constructor(...values) {
    this.values = values;
  }

  length() {
    return values.length;
  }

  bit_size() {
    return this.byte_size() * 8;
  }

  byte_size() {
    let s = 0;

    for (let val of this.values) {
      s = s + val.unit * val.size / 8;
    }

    return s;
  }

  getValue(index) {
    return this.values(index);
  }

  getSizeOfValue(index) {
    let val = this.getValue(index);
    return val.unit * val.size;
  }

  getTypeOfValue(index) {
    return this.getValue(index).type;
  }
}

function variable(default_value = Symbol.for("tailored.no_value")) {
  return new Variable(default_value);
}

function wildcard() {
  return new Wildcard();
}

function startsWith(prefix) {
  return new StartsWith(prefix);
}

function capture(value) {
  return new Capture(value);
}

function headTail() {
  return new HeadTail();
}

function type(type, objPattern = {}) {
  return new Type(type, objPattern);
}

function bound(value) {
  return new Bound(value);
}

function bitStringMatch(...values) {
  return new BitStringMatch(...values);
}

/* @flow */

function is_number(value) {
  return typeof value === 'number';
}

function is_string(value) {
  return typeof value === 'string';
}

function is_boolean(value) {
  return typeof value === 'boolean';
}

function is_symbol(value) {
  return typeof value === 'symbol';
}

function is_null(value) {
  return value === null;
}

function is_undefined(value) {
  return typeof value === 'undefined';
}

function is_variable(value) {
  return value instanceof Variable;
}

function is_wildcard(value) {
  return value instanceof Wildcard;
}

function is_headTail(value) {
  return value instanceof HeadTail;
}

function is_capture(value) {
  return value instanceof Capture;
}

function is_type(value) {
  return value instanceof Type;
}

function is_startsWith(value) {
  return value instanceof StartsWith;
}

function is_bound(value) {
  return value instanceof Bound;
}

function is_object(value) {
  return typeof value === 'object';
}

function is_array(value) {
  return Array.isArray(value);
}

function is_bitstring(value) {
  return value instanceof BitStringMatch;
}

class Tuple {

  constructor(...args) {
    this.values = Object.freeze(args);
    this.length = this.values.length;
  }

  get(index) {
    return this.values[index];
  }

  count() {
    return this.values.length;
  }

  [Symbol.iterator]() {
    return this.values[Symbol.iterator]();
  }

  toString() {
    var i,
        s = "";
    for (i = 0; i < this.values.length; i++) {
      if (s !== "") {
        s += ", ";
      }
      s += this.values[i].toString();
    }

    return "{" + s + "}";
  }

  put_elem(index, elem) {
    if (index === this.length) {
      let new_values = this.values.concat([elem]);
      return new Tuple(...new_values);
    }

    let new_values = this.values.concat([]);
    new_values.splice(index, 0, elem);
    return new Tuple(...new_values);
  }

  remove_elem(index) {
    let new_values = this.values.concat([]);
    new_values.splice(index, 1);
    return new Tuple(...new_values);
  }

}

let process_counter = -1;

class PID {
  constructor() {
    process_counter = process_counter + 1;
    this.id = process_counter;
  }

  toString() {
    return "PID#<0." + this.id + ".0>";
  }
}

let ref_counter = -1;

class Reference {
  constructor() {
    ref_counter = ref_counter + 1;
    this.id = ref_counter;
    this.ref = Symbol();
  }

  toString() {
    return "Ref#<0.0.0." + this.id + ">";
  }
}

class BitString$1 {
  constructor(...args) {
    this.value = Object.freeze(this.process(args));
    this.length = this.value.length;
    this.bit_size = this.length * 8;
    this.byte_size = this.length;
  }

  get(index) {
    return this.value[index];
  }

  count() {
    return this.value.length;
  }

  slice(start, end = null) {
    let s = this.value.slice(start, end);
    let ms = s.map(elem => BitString$1.integer(elem));
    return new BitString$1(...ms);
  }

  [Symbol.iterator]() {
    return this.value[Symbol.iterator]();
  }

  toString() {
    var i,
        s = "";
    for (i = 0; i < this.count(); i++) {
      if (s !== "") {
        s += ", ";
      }
      s += this.get(i).toString();
    }

    return "<<" + s + ">>";
  }

  process(bitStringParts) {
    let processed_values = [];

    var i;
    for (i = 0; i < bitStringParts.length; i++) {
      let processed_value = this['process_' + bitStringParts[i].type](bitStringParts[i]);

      for (let attr of bitStringParts[i].attributes) {
        processed_value = this['process_' + attr](processed_value);
      }

      processed_values = processed_values.concat(processed_value);
    }

    return processed_values;
  }

  process_integer(value) {
    return value.value;
  }

  process_float(value) {
    if (value.size === 64) {
      return BitString$1.float64ToBytes(value.value);
    } else if (value.size === 32) {
      return BitString$1.float32ToBytes(value.value);
    }

    throw new Error('Invalid size for float');
  }

  process_bitstring(value) {
    return value.value.value;
  }

  process_binary(value) {
    return BitString$1.toUTF8Array(value.value);
  }

  process_utf8(value) {
    return BitString$1.toUTF8Array(value.value);
  }

  process_utf16(value) {
    return BitString$1.toUTF16Array(value.value);
  }

  process_utf32(value) {
    return BitString$1.toUTF32Array(value.value);
  }

  process_signed(value) {
    return new Uint8Array([value])[0];
  }

  process_unsigned(value) {
    return value;
  }

  process_native(value) {
    return value;
  }

  process_big(value) {
    return value;
  }

  process_little(value) {
    return value.reverse();
  }

  process_size(value) {
    return value;
  }

  process_unit(value) {
    return value;
  }

  static integer(value) {
    return BitString$1.wrap(value, { 'type': 'integer', 'unit': 1, 'size': 8 });
  }

  static float(value) {
    return BitString$1.wrap(value, { 'type': 'float', 'unit': 1, 'size': 64 });
  }

  static bitstring(value) {
    return BitString$1.wrap(value, { 'type': 'bitstring', 'unit': 1, 'size': value.bit_size });
  }

  static bits(value) {
    return BitString$1.bitstring(value);
  }

  static binary(value) {
    return BitString$1.wrap(value, { 'type': 'binary', 'unit': 8, 'size': value.length });
  }

  static bytes(value) {
    return BitString$1.binary(value);
  }

  static utf8(value) {
    return BitString$1.wrap(value, { 'type': 'utf8', 'unit': 1, 'size': value.length });
  }

  static utf16(value) {
    return BitString$1.wrap(value, { 'type': 'utf16', 'unit': 1, 'size': value.length * 2 });
  }

  static utf32(value) {
    return BitString$1.wrap(value, { 'type': 'utf32', 'unit': 1, 'size': value.length * 4 });
  }

  static signed(value) {
    return BitString$1.wrap(value, {}, 'signed');
  }

  static unsigned(value) {
    return BitString$1.wrap(value, {}, 'unsigned');
  }

  static native(value) {
    return BitString$1.wrap(value, {}, 'native');
  }

  static big(value) {
    return BitString$1.wrap(value, {}, 'big');
  }

  static little(value) {
    return BitString$1.wrap(value, {}, 'little');
  }

  static size(value, count) {
    return BitString$1.wrap(value, { 'size': count });
  }

  static unit(value, count) {
    return BitString$1.wrap(value, { 'unit': count });
  }

  static wrap(value, opt, new_attribute = null) {
    let the_value = value;

    if (!(value instanceof Object)) {
      the_value = { 'value': value, 'attributes': [] };
    }

    the_value = Object.assign(the_value, opt);

    if (new_attribute) {
      the_value.attributes.push(new_attribute);
    }

    return the_value;
  }

  static toUTF8Array(str) {
    var utf8 = [];
    for (var i = 0; i < str.length; i++) {
      var charcode = str.charCodeAt(i);
      if (charcode < 0x80) {
        utf8.push(charcode);
      } else if (charcode < 0x800) {
        utf8.push(0xc0 | charcode >> 6, 0x80 | charcode & 0x3f);
      } else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | charcode >> 12, 0x80 | charcode >> 6 & 0x3f, 0x80 | charcode & 0x3f);
      }
      // surrogate pair
      else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + ((charcode & 0x3ff) << 10 | str.charCodeAt(i) & 0x3ff);
          utf8.push(0xf0 | charcode >> 18, 0x80 | charcode >> 12 & 0x3f, 0x80 | charcode >> 6 & 0x3f, 0x80 | charcode & 0x3f);
        }
    }
    return utf8;
  }

  static toUTF16Array(str) {
    var utf16 = [];
    for (var i = 0; i < str.length; i++) {
      var codePoint = str.codePointAt(i);

      if (codePoint <= 255) {
        utf16.push(0);
        utf16.push(codePoint);
      } else {
        utf16.push(codePoint >> 8 & 0xFF);
        utf16.push(codePoint & 0xFF);
      }
    }
    return utf16;
  }

  static toUTF32Array(str) {
    var utf32 = [];
    for (var i = 0; i < str.length; i++) {
      var codePoint = str.codePointAt(i);

      if (codePoint <= 255) {
        utf32.push(0);
        utf32.push(0);
        utf32.push(0);
        utf32.push(codePoint);
      } else {
        utf32.push(0);
        utf32.push(0);
        utf32.push(codePoint >> 8 & 0xFF);
        utf32.push(codePoint & 0xFF);
      }
    }
    return utf32;
  }

  //http://stackoverflow.com/questions/2003493/javascript-float-from-to-bits
  static float32ToBytes(f) {
    var bytes = [];

    var buf = new ArrayBuffer(4);
    new Float32Array(buf)[0] = f;

    let intVersion = new Uint32Array(buf)[0];

    bytes.push(intVersion >> 24 & 0xFF);
    bytes.push(intVersion >> 16 & 0xFF);
    bytes.push(intVersion >> 8 & 0xFF);
    bytes.push(intVersion & 0xFF);

    return bytes;
  }

  static float64ToBytes(f) {
    var bytes = [];

    var buf = new ArrayBuffer(8);
    new Float64Array(buf)[0] = f;

    var intVersion1 = new Uint32Array(buf)[0];
    var intVersion2 = new Uint32Array(buf)[1];

    bytes.push(intVersion2 >> 24 & 0xFF);
    bytes.push(intVersion2 >> 16 & 0xFF);
    bytes.push(intVersion2 >> 8 & 0xFF);
    bytes.push(intVersion2 & 0xFF);

    bytes.push(intVersion1 >> 24 & 0xFF);
    bytes.push(intVersion1 >> 16 & 0xFF);
    bytes.push(intVersion1 >> 8 & 0xFF);
    bytes.push(intVersion1 & 0xFF);

    return bytes;
  }
}

var ErlangTypes = {
  Tuple,
  PID,
  Reference,
  BitString: BitString$1
};

/* @flow */

const BitString = ErlangTypes.BitString;

function resolveSymbol(pattern) {
  return function (value) {
    return is_symbol(value) && value === pattern;
  };
}

function resolveString(pattern) {
  return function (value) {
    return is_string(value) && value === pattern;
  };
}

function resolveNumber(pattern) {
  return function (value) {
    return is_number(value) && value === pattern;
  };
}

function resolveBoolean(pattern) {
  return function (value) {
    return is_boolean(value) && value === pattern;
  };
}

function resolveNull(pattern) {
  return function (value) {
    return is_null(value);
  };
}

function resolveBound(pattern) {
  return function (value, args) {
    if (typeof value === typeof pattern.value && value === pattern.value) {
      args.push(value);
      return true;
    }

    return false;
  };
}

function resolveWildcard() {
  return function () {
    return true;
  };
}

function resolveVariable() {
  return function (value, args) {
    args.push(value);
    return true;
  };
}

function resolveHeadTail() {
  return function (value, args) {
    if (!is_array(value) || value.length < 2) {
      return false;
    }

    const head = value[0];
    const tail = value.slice(1);

    args.push(head);
    args.push(tail);

    return true;
  };
}

function resolveCapture(pattern) {
  const matches = buildMatch(pattern.value);

  return function (value, args) {
    if (matches(value, args)) {
      args.push(value);
      return true;
    }

    return false;
  };
}

function resolveStartsWith(pattern) {
  const prefix = pattern.prefix;

  return function (value, args) {
    if (is_string(value) && value.startsWith(prefix)) {
      args.push(value.substring(prefix.length));
      return true;
    }

    return false;
  };
}

function resolveType(pattern) {
  return function (value, args) {
    if (value instanceof pattern.type) {
      const matches = buildMatch(pattern.objPattern);
      return matches(value, args) && args.push(value) > 0;
    }

    return false;
  };
}

function resolveArray(pattern) {
  const matches = pattern.map(x => buildMatch(x));

  return function (value, args) {
    if (!is_array(value) || value.length != pattern.length) {
      return false;
    }

    return value.every(function (v, i) {
      return matches[i](value[i], args);
    });
  };
}

function resolveObject(pattern) {
  let matches = {};

  for (let key of Object.keys(pattern).concat(Object.getOwnPropertySymbols(pattern))) {
    matches[key] = buildMatch(pattern[key]);
  }

  return function (value, args) {
    if (!is_object(value) || pattern.length > value.length) {
      return false;
    }

    for (let key of Object.keys(pattern).concat(Object.getOwnPropertySymbols(pattern))) {
      if (!(key in value) || !matches[key](value[key], args)) {
        return false;
      }
    }

    return true;
  };
}

function resolveBitString(pattern) {
  let patternBitString = [];

  for (let bitstringMatchPart of pattern.values) {
    if (is_variable(bitstringMatchPart.value)) {
      let size = getSize(bitstringMatchPart.unit, bitstringMatchPart.size);
      fillArray(patternBitString, size);
    } else {
      patternBitString = patternBitString.concat(new BitString(bitstringMatchPart).value);
    }
  }

  let patternValues = pattern.values;

  return function (value, args) {
    let bsValue = null;

    if (!is_string(value) && !(value instanceof BitString)) {
      return false;
    }

    if (is_string(value)) {
      bsValue = new BitString(BitString.binary(value));
    } else {
      bsValue = value;
    }

    let beginningIndex = 0;

    for (let i = 0; i < patternValues.length; i++) {
      let bitstringMatchPart = patternValues[i];

      if (is_variable(bitstringMatchPart.value) && bitstringMatchPart.type == 'binary' && bitstringMatchPart.size === undefined && i < patternValues.length - 1) {
        throw new Error("a binary field without size is only allowed at the end of a binary pattern");
      }

      let size = 0;
      let bsValueArrayPart = [];
      let patternBitStringArrayPart = [];
      size = getSize(bitstringMatchPart.unit, bitstringMatchPart.size);

      if (i === patternValues.length - 1) {
        bsValueArrayPart = bsValue.value.slice(beginningIndex);
        patternBitStringArrayPart = patternBitString.slice(beginningIndex);
      } else {
        bsValueArrayPart = bsValue.value.slice(beginningIndex, beginningIndex + size);
        patternBitStringArrayPart = patternBitString.slice(beginningIndex, beginningIndex + size);
      }

      if (is_variable(bitstringMatchPart.value)) {
        switch (bitstringMatchPart.type) {
          case 'integer':
            if (bitstringMatchPart.attributes && bitstringMatchPart.attributes.indexOf("signed") != -1) {
              args.push(new Int8Array([bsValueArrayPart[0]])[0]);
            } else {
              args.push(new Uint8Array([bsValueArrayPart[0]])[0]);
            }
            break;

          case 'float':
            if (size === 64) {
              args.push(Float64Array.from(bsValueArrayPart)[0]);
            } else if (size === 32) {
              args.push(Float32Array.from(bsValueArrayPart)[0]);
            } else {
              return false;
            }
            break;

          case 'bitstring':
            args.push(createBitString(bsValueArrayPart));
            break;

          case 'binary':
            args.push(String.fromCharCode.apply(null, new Uint8Array(bsValueArrayPart)));
            break;

          case 'utf8':
            args.push(String.fromCharCode.apply(null, new Uint8Array(bsValueArrayPart)));
            break;

          case 'utf16':
            args.push(String.fromCharCode.apply(null, new Uint16Array(bsValueArrayPart)));
            break;

          case 'utf32':
            args.push(String.fromCharCode.apply(null, new Uint32Array(bsValueArrayPart)));
            break;

          default:
            return false;
        }
      } else if (!arraysEqual(bsValueArrayPart, patternBitStringArrayPart)) {
        return false;
      }

      beginningIndex = beginningIndex + size;
    }

    return true;
  };
}

function getSize(unit, size) {
  return unit * size / 8;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

function fillArray(arr, num) {
  for (let i = 0; i < num; i++) {
    arr.push(0);
  }
}

function createBitString(arr) {
  let integerParts = arr.map(elem => BitString.integer(elem));
  return new BitString(...integerParts);
}

function resolveNoMatch() {
  return function () {
    return false;
  };
}

/* @flow */
function buildMatch(pattern) {

  if (is_variable(pattern)) {
    return resolveVariable(pattern);
  }

  if (is_wildcard(pattern)) {
    return resolveWildcard(pattern);
  }

  if (is_undefined(pattern)) {
    return resolveWildcard(pattern);
  }

  if (is_headTail(pattern)) {
    return resolveHeadTail(pattern);
  }

  if (is_startsWith(pattern)) {
    return resolveStartsWith(pattern);
  }

  if (is_capture(pattern)) {
    return resolveCapture(pattern);
  }

  if (is_bound(pattern)) {
    return resolveBound(pattern);
  }

  if (is_type(pattern)) {
    return resolveType(pattern);
  }

  if (is_array(pattern)) {
    return resolveArray(pattern);
  }

  if (is_number(pattern)) {
    return resolveNumber(pattern);
  }

  if (is_string(pattern)) {
    return resolveString(pattern);
  }

  if (is_boolean(pattern)) {
    return resolveBoolean(pattern);
  }

  if (is_symbol(pattern)) {
    return resolveSymbol(pattern);
  }

  if (is_null(pattern)) {
    return resolveNull(pattern);
  }

  if (is_bitstring(pattern)) {
    return resolveBitString(pattern);
  }

  if (is_object(pattern)) {
    return resolveObject(pattern);
  }

  return resolveNoMatch();
}

class MatchError extends Error {
  constructor(arg) {
    super();

    if (typeof arg === "symbol") {
      this.message = "No match for: " + arg.toString();
    } else if (Array.isArray(arg)) {
      let mappedValues = arg.map(x => x.toString());
      this.message = "No match for: " + mappedValues;
    } else {
      this.message = "No match for: " + arg;
    }

    this.stack = new Error().stack;
    this.name = this.constructor.name;
  }
}

class Clause {
  constructor(pattern, fn, guard = () => true) {
    this.pattern = buildMatch(pattern);
    this.arity = pattern.length;
    this.optionals = getOptionalValues(pattern);
    this.fn = fn;
    this.guard = guard;
  }
}

function clause(pattern, fn, guard = () => true) {
  return new Clause(pattern, fn, guard);
}

function trampoline(fn) {
  return function () {
    let res = fn.apply(this, arguments);
    while (res instanceof Function) {
      res = res();
    }
    return res;
  };
}

function defmatch(...clauses) {
  return function (...args) {
    let funcToCall = null;
    let params = null;
    for (let processedClause of clauses) {
      let result = [];
      args = fillInOptionalValues(args, processedClause.arity, processedClause.optionals);

      if (processedClause.pattern(args, result) && processedClause.guard.apply(this, result)) {
        funcToCall = processedClause.fn;
        params = result;
        break;
      }
    }

    if (!funcToCall) {
      console.error("No match for:", args);
      throw new MatchError(args);
    }

    return funcToCall.apply(this, params);
  };
}

function defmatchgen(...clauses) {
  return function* (...args) {
    for (let processedClause of clauses) {
      let result = [];
      args = fillInOptionalValues(args, processedClause.arity, processedClause.optionals);

      if (processedClause.pattern(args, result) && processedClause.guard.apply(this, result)) {
        return yield* processedClause.fn.apply(this, result);
      }
    }

    console.error("No match for:", args);
    throw new MatchError(args);
  };
}

function getOptionalValues(pattern) {
  let optionals = [];

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] instanceof Variable && pattern[i].default_value != Symbol.for("tailored.no_value")) {
      optionals.push([i, pattern[i].default_value]);
    }
  }

  return optionals;
}

function fillInOptionalValues(args, arity, optionals) {
  if (args.length === arity || optionals.length === 0) {
    return args;
  }

  if (args.length + optionals.length < arity) {
    return args;
  }

  let numberOfOptionalsToFill = arity - args.length;
  let optionalsToRemove = optionals.length - numberOfOptionalsToFill;

  let optionalsToUse = optionals.slice(optionalsToRemove);

  for (let [index, value] of optionalsToUse) {
    args.splice(index, 0, value);
    if (args.length === arity) {
      break;
    }
  }

  return args;
}

function match(pattern, expr, guard = () => true) {
  let result = [];
  let processedPattern = buildMatch(pattern);
  if (processedPattern(expr, result) && guard.apply(this, result)) {
    return result;
  } else {
    console.error("No match for:", expr);
    throw new MatchError(expr);
  }
}

function match_or_default(pattern, expr, guard = () => true, default_value = null) {
  let result = [];
  let processedPattern = buildMatch(pattern);
  if (processedPattern(expr, result) && guard.apply(this, result)) {
    return result;
  } else {
    return default_value;
  }
}

const NO_MATCH = Symbol();

function bitstring_generator(pattern, bitstring) {
  return function () {
    let returnResult = [];
    let bsSlice = bitstring.slice(0, pattern.byte_size());
    let i = 1;

    while (bsSlice.byte_size == pattern.byte_size()) {
      const result = match_or_default(pattern, bsSlice, () => true, NO_MATCH);

      if (result != NO_MATCH) {
        const [value] = result;
        returnResult.push(result);
      }

      bsSlice = bitstring.slice(pattern.byte_size() * i, pattern.byte_size() * (i + 1));

      i++;
    }

    return returnResult;
  };
}

function list_generator(pattern, list) {
  return function () {
    let returnResult = [];
    for (let i of list) {
      const result = match_or_default(pattern, i, () => true, NO_MATCH);
      if (result != NO_MATCH) {
        const [value] = result;
        returnResult.push(value);
      }
    }

    return returnResult;
  };
}

function list_comprehension(expression, generators) {
  const generatedValues = run_generators(generators.pop()(), generators);

  let result = [];

  for (let value of generatedValues) {
    if (expression.guard.apply(this, value)) {
      result.push(expression.fn.apply(this, value));
    }
  }

  return result;
}

function run_generators(generator, generators) {
  if (generators.length == 0) {
    return generator.map(x => {
      if (Array.isArray(x)) {
        return x;
      } else {
        return [x];
      }
    });
  } else {
    const list = generators.pop();

    let next_gen = [];
    for (let j of list()) {
      for (let i of generator) {
        next_gen.push([j].concat(i));
      }
    }

    return run_generators(next_gen, generators);
  }
}

function bitstring_comprehension(expression, generators) {
  const generatedValues = run_generators(generators.pop()(), generators);

  let result = [];

  for (let value of generatedValues) {
    if (expression.guard.apply(this, value)) {
      result.push(expression.fn.apply(this, value));
    }
  }

  result = result.map(x => ErlangTypes.BitString.integer(x));
  return new ErlangTypes.BitString(...result);
}

var Patterns = {
  defmatch,
  match,
  MatchError,
  variable,
  wildcard,
  startsWith,
  capture,
  headTail,
  type,
  bound,
  Clause,
  clause,
  bitStringMatch,
  match_or_default,
  defmatchgen,
  list_comprehension,
  list_generator,
  bitstring_generator,
  bitstring_comprehension,
  trampoline
};

// https://github.com/airportyh/protomorphism
class Protocol {
  constructor(spec) {
    this.registry = new Map();
    this.fallback = null;

    for (const funName in spec) {
      this[funName] = createFun(funName).bind(this);
    }

    function createFun(funName) {
      return function (...args) {
        const thing = args[0];
        let fun = null;

        if (Number.isInteger(thing) && this.hasImplementation(Core.Integer)) {
          fun = this.registry.get(Core.Integer)[funName];
        } else if (typeof thing === 'number' && !Number.isInteger(thing) && this.hasImplementation(Core.Float)) {
          fun = this.registry.get(Core.Float)[funName];
        } else if (typeof thing === 'string' && this.hasImplementation(Core.BitString)) {
          fun = this.registry.get(Core.BitString)[funName];
        } else if (this.hasImplementation(thing)) {
          fun = this.registry.get(thing.constructor)[funName];
        } else if (this.fallback) {
          fun = this.fallback[funName];
        }

        if (fun != null) {
          const retval = fun.apply(this, args);
          return retval;
        }

        throw new Error(`No implementation found for ${thing}`);
      };
    }
  }

  implementation(type, implementation) {
    if (type === null) {
      this.fallback = implementation;
    } else {
      this.registry.set(type, implementation);
    }
  }

  hasImplementation(thing) {
    if (thing === Core.Integer || thing === Core.Float || thing === Core.BitString) {
      return this.registry.has(thing);
    }

    return this.registry.has(thing.constructor);
  }
}

function call_property(item, property) {
  let prop = null;

  if (typeof item === 'number' || typeof item === 'symbol' || typeof item === 'boolean' || typeof item === 'string') {
    if (item[property] !== undefined) {
      prop = property;
    } else if (item[Symbol.for(property)] !== undefined) {
      prop = Symbol.for(property);
    }
  } else if (property in item) {
    prop = property;
  } else if (Symbol.for(property) in item) {
    prop = Symbol.for(property);
  }

  if (prop === null) {
    throw new Error(`Property ${property} not found in ${item}`);
  }

  if (item[prop] instanceof Function) {
    return item[prop]();
  }
  return item[prop];
}

function apply(...args) {
  if (args.length === 2) {
    return args[0].apply(args[0], args.slice(1));
  } else {
    return args[0][args[1]].apply(args[0], args.slice(2));
  }
}

function contains(left, right) {
  for (const x of right) {
    if (Core.Patterns.match_or_default(left, x) != null) {
      return true;
    }
  }

  return false;
}

function get_global() {
  if (typeof self !== 'undefined') {
    return self;
  } else if (typeof window !== 'undefined') {
    return window;
  } else if (typeof global !== 'undefined') {
    return global;
  }

  throw new Error('No global state found');
}

function defstruct(defaults) {
  return class {
    constructor(update = {}) {
      const the_values = Object.assign(defaults, update);
      Object.assign(this, the_values);
    }

    static create(updates = {}) {
      const x = new this(updates);
      return Object.freeze(x);
    }
  };
}

function defexception(defaults) {
  return class extends Error {
    constructor(update = {}) {
      const message = update.message || '';
      super(message);

      const the_values = Object.assign(defaults, update);
      Object.assign(this, the_values);

      this.name = this.constructor.name;
      this.message = message;
      this[Symbol.for('__exception__')] = true;
      Error.captureStackTrace(this, this.constructor.name);
    }

    static create(updates = {}) {
      const x = new this(updates);
      return Object.freeze(x);
    }
  };
}

function defprotocol(spec) {
  return new Protocol(spec);
}

function defimpl(protocol, type, impl) {
  protocol.implementation(type, impl);
}

function get_object_keys(obj) {
  return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj));
}

function is_valid_character(codepoint) {
  try {
    return String.fromCodePoint(codepoint) != null;
  } catch (e) {
    return false;
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_2_%E2%80%93_rewrite_the_DOMs_atob()_and_btoa()_using_JavaScript's_TypedArrays_and_UTF-8
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(`0x${p1}`)));
}

function delete_property_from_map(map, property) {
  const new_map = Object.assign(Object.create(map.constructor.prototype), map);
  delete new_map[property];

  return Object.freeze(new_map);
}

function class_to_obj(map) {
  const new_map = Object.assign({}, map);
  return Object.freeze(new_map);
}

function add_property_to_map(map, property, value) {
  const new_map = Object.assign({}, map);
  new_map[property] = value;
  return Object.freeze(new_map);
}

function update_map(map, property, value) {
  if (property in get_object_keys(map)) {
    return add_property_to_map(map, property, value);
  }

  throw 'map does not have key';
}

function bnot(expr) {
  return ~expr;
}

function band(left, right) {
  return left & right;
}

function bor(left, right) {
  return left | right;
}

function bsl(left, right) {
  return left << right;
}

function bsr(left, right) {
  return left >> right;
}

function bxor(left, right) {
  return left ^ right;
}

function zip(list_of_lists) {
  if (list_of_lists.length === 0) {
    return Object.freeze([]);
  }

  const new_value = [];
  let smallest_length = list_of_lists[0];

  for (const x of list_of_lists) {
    if (x.length < smallest_length) {
      smallest_length = x.length;
    }
  }

  for (let i = 0; i < smallest_length; i++) {
    const current_value = [];
    for (let j = 0; j < list_of_lists.length; j++) {
      current_value.push(list_of_lists[j][i]);
    }

    new_value.push(new Core.Tuple(...current_value));
  }

  return Object.freeze(new_value);
}

function can_decode64(data) {
  try {
    atob(data);
    return true;
  } catch (e) {
    return false;
  }
}

function remove_from_list(list, element) {
  let found = false;

  return list.filter(elem => {
    if (!found && elem === element) {
      found = true;
      return false;
    }

    return true;
  });
}

function foldl(fun, acc, list) {
  let acc1 = acc;

  for (const el of list) {
    acc1 = fun(el, acc1);
  }

  return acc1;
}

function foldr(fun, acc, list) {
  let acc1 = acc;

  for (let i = list.length - 1; i >= 0; i--) {
    acc1 = fun(list[i], acc1);
  }

  return acc1;
}

function keyfind(key, n, tuplelist) {
  for (let i = tuplelist.length - 1; i >= 0; i--) {
    if (tuplelist[i].get(n) === key) {
      return tuplelist[i];
    }
  }

  return false;
}

function keydelete(key, n, tuplelist) {
  for (let i = tuplelist.length - 1; i >= 0; i--) {
    if (tuplelist[i].get(n) === key) {
      return tuplelist.concat([]).splice(i, 1);
    }
  }

  return tuplelist;
}

function keystore(key, n, list, newtuple) {
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].get(n) === key) {
      return list.concat([]).splice(i, 1, newtuple);
    }
  }

  return list.concat([]).push(newtuple);
}

function keymember(key, n, list) {
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].get(n) === key) {
      return true;
    }
  }

  return false;
}

function keytake(key, n, list) {
  if (!keymember(key, n, list)) {
    return false;
  }

  const tuple = keyfind(key, n, list);

  return new Core.Tuple(tuple.get(n), tuple, keydelete(key, n, list));
}

function keyreplace(key, n, list, newtuple) {
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].get(n) === key) {
      return list.concat([]).splice(i, 1, newtuple);
    }
  }

  return list;
}

function reverse(list) {
  return list.concat([]).reverse();
}

function maps_find(key, map) {
  if (key in get_object_keys(map)) {
    return new Core.Tuple(Symbol.for('ok'), map[key]);
  }
  return Symbol.for('error');
}

function flatten(list, tail = []) {
  let new_list = [];

  for (const e of list) {
    if (Array.isArray(e)) {
      new_list = new_list.concat(flatten(e));
    } else {
      new_list.push(e);
    }
  }

  return Object.freeze(new_list.concat(tail));
}

function duplicate(n, elem) {
  const list = [];

  for (let i = 0; i < n; i++) {
    list.push(elem);
  }

  return Object.freeze(list);
}

function mapfoldl(fun, acc, list) {
  const newlist = [];
  let new_acc = acc;

  for (const x of list) {
    const tup = fun(x, new_acc);
    newlist.push(tup.get(0));
    new_acc = tup.get(1);
  }

  return new Core.Tuple(Object.freeze(newlist), new_acc);
}

function filtermap(fun, list) {
  const newlist = [];

  for (const x of list) {
    const result = fun(x);

    if (result === true) {
      newlist.push(x);
    } else if (result instanceof Core.Tuple) {
      newlist.push(result.get(1));
    }
  }

  return Object.freeze(newlist);
}

function maps_fold(fun, acc, map) {
  let acc1 = acc;

  for (const k of get_object_keys(map)) {
    acc1 = fun(k, map[k], acc1);
  }

  return acc1;
}

function build_namespace(ns, ns_string) {
  let parts = ns_string.split('.');
  const root = ns;
  let parent = ns;

  if (parts[0] === 'Elixir') {
    parts = parts.slice(1);
  }

  for (const part of parts) {
    if (typeof parent[part] === 'undefined') {
      parent[part] = {};
    }

    parent = parent[part];
  }

  root.__table = ns.__table || {};
  root.__table[Symbol.for(ns_string)] = parent;

  return parent;
}

var Functions = {
  call_property,
  apply,
  contains,
  get_global,
  defstruct,
  defexception,
  defprotocol,
  defimpl,
  get_object_keys,
  is_valid_character,
  b64EncodeUnicode,
  delete_property_from_map,
  add_property_to_map,
  class_to_obj,
  can_decode64,
  bnot,
  band,
  bor,
  bsl,
  bsr,
  bxor,
  zip,
  foldl,
  foldr,
  remove_from_list,
  keydelete,
  keystore,
  keyfind,
  keytake,
  keyreplace,
  reverse,
  update_map,
  maps_find,
  flatten,
  duplicate,
  mapfoldl,
  filtermap,
  maps_fold,
  build_namespace
};

function _case(condition, clauses) {
  return Core.Patterns.defmatch(...clauses)(condition);
}

function cond(clauses) {
  for (const clause of clauses) {
    if (clause[0]) {
      return clause[1]();
    }
  }

  throw new Error();
}

function map_update(map, values) {
  return Object.freeze(Object.assign(Object.create(map.constructor.prototype), map, values));
}

function _for(expression, generators, collectable_protocol, into = []) {
  let [result, fun] = collectable_protocol.into(into);

  const generatedValues = run_list_generators(generators.pop()(), generators);

  for (const value of generatedValues) {
    if (expression.guard.apply(this, value)) {
      result = fun(result, new Core.Tuple(Symbol.for('cont'), expression.fn.apply(this, value)));
    }
  }

  return fun(result, Symbol.for('done'));
}

function run_list_generators(generator, generators) {
  if (generators.length == 0) {
    return generator.map(x => {
      if (Array.isArray(x)) {
        return x;
      }
      return [x];
    });
  }
  const list = generators.pop();

  const next_gen = [];
  for (const j of list()) {
    for (const i of generator) {
      next_gen.push([j].concat(i));
    }
  }

  return run_list_generators(next_gen, generators);
}

function _try(do_fun, rescue_function, catch_fun, else_function, after_function) {
  let result = null;

  try {
    result = do_fun();
  } catch (e) {
    let ex_result = null;

    if (rescue_function) {
      try {
        ex_result = rescue_function(e);
        return ex_result;
      } catch (ex) {
        if (ex instanceof Core.Patterns.MatchError) {
          throw ex;
        }
      }
    }

    if (catch_fun) {
      try {
        ex_result = catch_fun(e);
        return ex_result;
      } catch (ex) {
        if (ex instanceof Core.Patterns.MatchError) {
          throw ex;
        }
      }
    }

    throw e;
  } finally {
    if (after_function) {
      after_function();
    }
  }

  if (else_function) {
    try {
      return else_function(result);
    } catch (ex) {
      if (ex instanceof Core.Patterns.MatchError) {
        throw new Error('No Match Found in Else');
      }

      throw ex;
    }
  } else {
    return result;
  }
}

function _with(...args) {
  let argsToPass = [];
  let successFunction = null;
  let elseFunction = null;

  if (typeof args[args.length - 2] === 'function') {
    [successFunction, elseFunction] = args.splice(-2);
  } else {
    successFunction = args.pop();
  }

  for (let i = 0; i < args.length; i++) {
    const [pattern, func] = args[i];

    const result = func(...argsToPass);

    const patternResult = Core.Patterns.match_or_default(pattern, result);

    if (patternResult == null) {
      if (elseFunction) {
        return elseFunction.call(null, result);
      }
      return result;
    }
    argsToPass = argsToPass.concat(patternResult);
  }

  return successFunction(...argsToPass);
}

var SpecialForms = {
  _case,
  cond,
  map_update,
  _for,
  _try,
  _with
};

const store = new Map();
const names = new Map();

function get_key(key) {
  let real_key = key;

  if (names.has(key)) {
    real_key = names.get(key);
  }

  if (store.has(real_key)) {
    return real_key;
  }

  return new Error('Key Not Found');
}

function create(key, value, name = null) {
  if (name != null) {
    names.set(name, key);
  }

  store.set(key, value);
}

function update(key, value) {
  const real_key = get_key(key);
  store.set(real_key, value);
}

function read(key) {
  const real_key = get_key(key);
  return store.get(real_key);
}

function remove(key) {
  const real_key = get_key(key);
  return store.delete(real_key);
}

var Store = {
  create,
  read,
  update,
  remove
};

class Integer {}
class Float {}

var Core = {
  Tuple: ErlangTypes.Tuple,
  PID: ErlangTypes.PID,
  BitString: ErlangTypes.BitString,
  Patterns,
  Integer,
  Float,
  Functions,
  SpecialForms,
  Store
};

let Enum = {

  all__qmark__: function (collection, fun = x => x) {
    for (let elem of collection) {
      if (!fun(elem)) {
        return false;
      }
    }

    return true;
  },

  any__qmark__: function (collection, fun = x => x) {
    for (let elem of collection) {
      if (fun(elem)) {
        return true;
      }
    }

    return false;
  },

  at: function (collection, n, the_default = null) {
    if (n > this.count(collection) || n < 0) {
      return the_default;
    }

    return collection[n];
  },

  concat: function (...enumables) {
    return enumables[0].concat(enumables[1]);
  },

  count: function (collection, fun = null) {
    if (fun == null) {
      return collection.length;
    } else {
      return collection.filter(fun).length;
    }
  },

  drop: function (collection, count) {
    return collection.slice(count);
  },

  drop_while: function (collection, fun) {
    let count = 0;

    for (let elem of collection) {
      if (fun(elem)) {
        count = count + 1;
      } else {
        break;
      }
    }

    return collection.slice(count);
  },

  each: function (collection, fun) {
    for (let elem of collection) {
      fun(elem);
    }
  },

  empty__qmark__: function (collection) {
    return collection.length === 0;
  },

  fetch: function (collection, n) {
    if (Array.isArray(collection)) {
      if (n < this.count(collection) && n >= 0) {
        return new Core.Tuple(Symbol.for("ok"), collection[n]);
      } else {
        return Symbol.for("error");
      }
    }

    throw new Error("collection is not an Enumerable");
  },

  fetch__emark__: function (collection, n) {
    if (Array.isArray(collection)) {
      if (n < this.count(collection) && n >= 0) {
        return collection[n];
      } else {
        throw new Error("out of bounds error");
      }
    }

    throw new Error("collection is not an Enumerable");
  },

  filter: function (collection, fun) {
    let result = [];

    for (let elem of collection) {
      if (fun(elem)) {
        result.push(elem);
      }
    }

    return result;
  },

  filter_map: function (collection, filter, mapper) {
    return Enum.map(Enum.filter(collection, filter), mapper);
  },

  find: function (collection, if_none = null, fun) {
    for (let elem of collection) {
      if (fun(elem)) {
        return elem;
      }
    }

    return if_none;
  },

  into: function (collection, list) {
    return list.concat(collection);
  },

  map: function (collection, fun) {
    let result = [];

    for (let elem of collection) {
      result.push(fun(elem));
    }

    return result;
  },

  map_reduce: function (collection, acc, fun) {
    let mapped = Object.freeze([]);
    let the_acc = acc;

    for (var i = 0; i < this.count(collection); i++) {
      let tuple = fun(collection[i], the_acc);

      the_acc = tuple.get(1);
      mapped = Object.freeze(mapped.concat([tuple.get(0)]));
    }

    return new Core.Tuple(mapped, the_acc);
  },

  member__qmark__: function (collection, value) {
    return collection.includes(value);
  },

  reduce: function (collection, acc, fun) {
    let the_acc = acc;

    for (var i = 0; i < this.count(collection); i++) {
      let tuple = fun(collection[i], the_acc);

      the_acc = tuple.get(1);
    }

    return the_acc;
  },

  take: function (collection, count) {
    return collection.slice(0, count);
  },

  take_every: function (collection, nth) {
    let result = [];
    let index = 0;

    for (let elem of collection) {
      if (index % nth === 0) {
        result.push(elem);
      }
    }

    return Object.freeze(result);
  },

  take_while: function (collection, fun) {
    let count = 0;

    for (let elem of collection) {
      if (fun(elem)) {
        count = count + 1;
      } else {
        break;
      }
    }

    return collection.slice(0, count);
  },

  to_list: function (collection) {
    return collection;
  }
};

var elixir = {
  Core,
  Enum
};

return elixir;

}());

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['react', 'react-dom'], factory)
    } else if (typeof exports === 'object') {
        module.exports = factory(require('react'), require('react-dom'))
    } else {
        root.Elixir = factory(root.React, root.ReactDOM)
    }
})(this, function(React, ReactDOM) {
    const Elixir = {};

    Elixir.start = function(app, args) {
        app.__load(Elixir).start(Symbol.for('normal'), args)
    }

    Elixir.load = function(module) {
        return module.__load(Elixir);
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.String.Chars.DefImpl').__load = function(Elixir) {
        if (Elixir.ElixirScript.String.Chars.DefImpl.__exports)
            return Elixir.ElixirScript.String.Chars.DefImpl.__exports;

        let impls = [];

        impls.push(Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Atom.__load(Elixir))

        impls.push(Elixir.ElixirScript.String.Chars.DefImpl.Elixir.BitString.__load(Elixir))

        impls.push(Elixir.ElixirScript.String.Chars.DefImpl.Elixir.List.__load(Elixir))

        impls.push(Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Tuple.__load(Elixir))

        impls.push(Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Integer.__load(Elixir))

        impls.push(Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Float.__load(Elixir))

        const __exports = impls;

        Elixir.ElixirScript.String.Chars.DefImpl.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Enumerable.DefImpl').__load = function(Elixir) {
        if (Elixir.ElixirScript.Enumerable.DefImpl.__exports)
            return Elixir.ElixirScript.Enumerable.DefImpl.__exports;

        let impls = [];

        impls.push(Elixir.ElixirScript.Enumerable.DefImpl.Elixir.List.__load(Elixir))

        impls.push(Elixir.ElixirScript.Enumerable.DefImpl.Elixir.Map.__load(Elixir))

        const __exports = impls;

        Elixir.ElixirScript.Enumerable.DefImpl.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Collectable.DefImpl').__load = function(Elixir) {
        if (Elixir.ElixirScript.Collectable.DefImpl.__exports)
            return Elixir.ElixirScript.Collectable.DefImpl.__exports;

        let impls = [];

        impls.push(Elixir.ElixirScript.Collectable.DefImpl.Elixir.List.__load(Elixir))

        impls.push(Elixir.ElixirScript.Collectable.DefImpl.Elixir.BitString.__load(Elixir))

        impls.push(Elixir.ElixirScript.Collectable.DefImpl.Elixir.Map.__load(Elixir))

        const __exports = impls;

        Elixir.ElixirScript.Collectable.DefImpl.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Agent').__load = function(Elixir) {
        if (Elixir.ElixirScript.Agent.__exports)
            return Elixir.ElixirScript.Agent.__exports;

        const get = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(agent, fun) {
            let [current_state] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Store.read(agent));

            return fun(current_state);
        }));

        const get_and_update = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(agent, fun) {
            let [current_state] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Store.read(agent));

            let [val, new_state] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
                values: [Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()]
            }), fun(current_state));

            let _ref = new Bootstrap.Core.Tuple(val, new_state);

            Bootstrap.Core.Store.update(agent, new_state);

            return val;
        }));

        const start = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(Object.freeze([]))], function(fun, options) {
            let [pid] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), new Bootstrap.Core.PID());

            let [name] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                return null;
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return Elixir.ElixirScript.Keyword.__load(Elixir).get(options, Symbol.for('name'));
            })).call(this, Elixir.ElixirScript.Keyword.__load(Elixir).has_key__qmark__(options, Symbol.for('name'))));

            Bootstrap.Core.Store.create(pid, fun(), name);

            return new Bootstrap.Core.Tuple(Symbol.for('ok'), pid);
        }));

        const start_link = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(Object.freeze([]))], function(fun, options) {
            let [pid] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), new Bootstrap.Core.PID());

            let [name] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                return null;
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return Elixir.ElixirScript.Keyword.__load(Elixir).get(options, Symbol.for('name'));
            })).call(this, Elixir.ElixirScript.Keyword.__load(Elixir).has_key__qmark__(options, Symbol.for('name'))));

            Bootstrap.Core.Store.create(pid, fun(), name);

            return new Bootstrap.Core.Tuple(Symbol.for('ok'), pid);
        }));

        const stop = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(agent) {
            Bootstrap.Core.Store.remove(agent);

            return Symbol.for('ok');
        }));

        const update = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(agent, fun) {
            let [current_state] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Store.read(agent));

            Bootstrap.Core.Store.update(agent, fun(current_state));

            return Symbol.for('ok');
        }));

        const __exports = {
            get,
            get_and_update,
            start,
            start_link,
            stop,
            update
        };

        Elixir.ElixirScript.Agent.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Atom').__load = function(Elixir) {
        if (Elixir.ElixirScript.Atom.__exports)
            return Elixir.ElixirScript.Atom.__exports;

        const to_char_list = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(atom) {
            return Elixir.ElixirScript.String.Chars.__load(Elixir).to_string(atom).split('');
        }));

        const to_string = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(atom) {
            return Bootstrap.Core.Functions.get_global().Symbol.keyFor(atom);
        }));

        const __exports = {
            to_char_list,
            to_string
        };

        Elixir.ElixirScript.Atom.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Base').__load = function(Elixir) {
        if (Elixir.ElixirScript.Base.__exports)
            return Elixir.ElixirScript.Base.__exports;

        const decode64 = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(data) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                return Symbol.for('error');
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return new Bootstrap.Core.Tuple(Symbol.for('ok'), decode64__emark__(data));
            })).call(this, Bootstrap.Core.can_decode64(data));
        }));

        const decode64__emark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(data) {
            return Bootstrap.Core.Functions.get_global().atob(data);
        }));

        const encode64 = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(data) {
            return Bootstrap.Core.b64EncodeUnicode(data);
        }));

        const __exports = {
            decode64,
            decode64__emark__,
            encode64
        };

        Elixir.ElixirScript.Base.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Bitwise').__load = function(Elixir) {
        if (Elixir.ElixirScript.Bitwise.__exports)
            return Elixir.ElixirScript.Bitwise.__exports;

        const __exports = {};

        Elixir.ElixirScript.Bitwise.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Collectable').__load = function(Elixir) {
        if (Elixir.ElixirScript.Collectable.__exports)
            return Elixir.ElixirScript.Collectable.__exports;

        const Elixir$ElixirScript$Collectable$DefImpl = Elixir.ElixirScript.Collectable.DefImpl.__load(Elixir);

        const Elixir$ElixirScript$Collectable = Bootstrap.Core.Functions.defprotocol({
            into: function() {}
        });

        for (let {Type, Implementation} of Elixir$ElixirScript$Collectable$DefImpl) Bootstrap.Core.Functions.defimpl(Elixir$ElixirScript$Collectable, Type, Implementation)

        const __exports = Elixir$ElixirScript$Collectable;

        Elixir.ElixirScript.Collectable.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Collectable.DefImpl.Elixir.List').__load = function(Elixir) {
        if (Elixir.ElixirScript.Collectable.DefImpl.Elixir.List.__exports)
            return Elixir.ElixirScript.Collectable.DefImpl.Elixir.List.__exports;

        const into = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(original) {
            return new Bootstrap.Core.Tuple(Object.freeze([]), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
                values: [Symbol.for('cont'), Bootstrap.Core.Patterns.variable()]
            })], function(list, x) {
                return list.concat(Object.freeze([x]));
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Symbol.for('done')], function(list) {
                return original.concat(list);
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard(), Symbol.for('halt')], function() {
                return Symbol.for('ok');
            })));
        }));

        const __exports = {
            'Type': Array,
            'Implementation': {
                into
            }
        };

        Elixir.ElixirScript.Collectable.DefImpl.Elixir.List.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Collectable.DefImpl.Elixir.BitString').__load = function(Elixir) {
        if (Elixir.ElixirScript.Collectable.DefImpl.Elixir.BitString.__exports)
            return Elixir.ElixirScript.Collectable.DefImpl.Elixir.BitString.__exports;

        const into = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(original) {
            return new Bootstrap.Core.Tuple(original, Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
                values: [Symbol.for('cont'), Bootstrap.Core.Patterns.variable()]
            })], function(acc, x) {
                return new Bootstrap.Core.BitString(Bootstrap.Core.BitString.bitstring(acc), Bootstrap.Core.BitString.bitstring(x));
            }, function(acc, x) {
                return Elixir.ElixirScript.Kernel.__load(Elixir).is_bitstring(x);
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Symbol.for('done')], function(acc) {
                return acc;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard(), Symbol.for('halt')], function() {
                return Symbol.for('ok');
            })));
        }));

        const __exports = {
            'Type': Bootstrap.Core.BitString,
            'Implementation': {
                into
            }
        };

        Elixir.ElixirScript.Collectable.DefImpl.Elixir.BitString.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Collectable.DefImpl.Elixir.Map').__load = function(Elixir) {
        if (Elixir.ElixirScript.Collectable.DefImpl.Elixir.Map.__exports)
            return Elixir.ElixirScript.Collectable.DefImpl.Elixir.Map.__exports;

        const into = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(original) {
            return new Bootstrap.Core.Tuple(original, Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
                values: [Symbol.for('cont'), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
                    values: [Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()]
                })]
            })], function(map, k, v) {
                return Elixir.ElixirScript.Map.__load(Elixir).put(map, k, v);
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Symbol.for('done')], function(map) {
                return map;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard(), Symbol.for('halt')], function() {
                return Symbol.for('ok');
            })));
        }));

        const __exports = {
            'Type': Object,
            'Implementation': {
                into
            }
        };

        Elixir.ElixirScript.Collectable.DefImpl.Elixir.Map.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Enumerable').__load = function(Elixir) {
        if (Elixir.ElixirScript.Enumerable.__exports)
            return Elixir.ElixirScript.Enumerable.__exports;

        const Elixir$ElixirScript$Enumerable$DefImpl = Elixir.ElixirScript.Enumerable.DefImpl.__load(Elixir);

        const Elixir$ElixirScript$Enumerable = Bootstrap.Core.Functions.defprotocol({
            reduce: function() {},
            member__qmark__: function() {},
            count: function() {}
        });

        for (let {Type, Implementation} of Elixir$ElixirScript$Enumerable$DefImpl) Bootstrap.Core.Functions.defimpl(Elixir$ElixirScript$Enumerable, Type, Implementation)

        const __exports = Elixir$ElixirScript$Enumerable;

        Elixir.ElixirScript.Enumerable.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Enumerable.DefImpl.Elixir.List').__load = function(Elixir) {
        if (Elixir.ElixirScript.Enumerable.DefImpl.Elixir.List.__exports)
            return Elixir.ElixirScript.Enumerable.DefImpl.Elixir.List.__exports;

        const count = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(list) {
            return Elixir.ElixirScript.Kernel.__load(Elixir).length(list);
        }));

        const member__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, value) {
            return Bootstrap.Enum.member__qmark__(list, value);
        }));

        const reduce = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('halt'), Bootstrap.Core.Patterns.variable()]
        }), Bootstrap.Core.Patterns.variable()], function(acc, _fun) {
            return new Bootstrap.Core.Tuple(Symbol.for('halted'), acc);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('suspend'), Bootstrap.Core.Patterns.variable()]
        }), Bootstrap.Core.Patterns.variable()], function(list, acc, fun) {
            return new Bootstrap.Core.Tuple(Symbol.for('suspended'), acc, Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(__1) {
                return reduce(list, __1, fun);
            })));
        }), Bootstrap.Core.Patterns.clause([Object.freeze([]), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('cont'), Bootstrap.Core.Patterns.variable()]
        }), Bootstrap.Core.Patterns.variable()], function(acc, _fun) {
            return new Bootstrap.Core.Tuple(Symbol.for('done'), acc);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.headTail(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('cont'), Bootstrap.Core.Patterns.variable()]
        }), Bootstrap.Core.Patterns.variable()], function(h, t, acc, fun) {
            return reduce(t, fun(h, acc), fun);
        }));

        const __exports = {
            'Type': Array,
            'Implementation': {
                count,
                member__qmark__,
                reduce
            }
        };

        Elixir.ElixirScript.Enumerable.DefImpl.Elixir.List.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Enumerable.DefImpl.Elixir.Map').__load = function(Elixir) {
        if (Elixir.ElixirScript.Enumerable.DefImpl.Elixir.Map.__exports)
            return Elixir.ElixirScript.Enumerable.DefImpl.Elixir.Map.__exports;

        const do_reduce = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('halt'), Bootstrap.Core.Patterns.variable()]
        }), Bootstrap.Core.Patterns.variable()], function(acc, _fun) {
            return new Bootstrap.Core.Tuple(Symbol.for('halted'), acc);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('suspend'), Bootstrap.Core.Patterns.variable()]
        }), Bootstrap.Core.Patterns.variable()], function(list, acc, fun) {
            return new Bootstrap.Core.Tuple(Symbol.for('suspended'), acc, Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(__1) {
                return do_reduce(list, __1, fun);
            })));
        }), Bootstrap.Core.Patterns.clause([Object.freeze([]), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('cont'), Bootstrap.Core.Patterns.variable()]
        }), Bootstrap.Core.Patterns.variable()], function(acc, _fun) {
            return new Bootstrap.Core.Tuple(Symbol.for('done'), acc);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.headTail(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('cont'), Bootstrap.Core.Patterns.variable()]
        }), Bootstrap.Core.Patterns.variable()], function(h, t, acc, fun) {
            return do_reduce(t, fun(h, acc), fun);
        }));

        const count = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(map) {
            return new Bootstrap.Core.Tuple(Symbol.for('ok'), Elixir.ElixirScript.Kernel.__load(Elixir).map_size(map));
        }));

        const member__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()]
        })], function(map, key, value) {
            return new Bootstrap.Core.Tuple(Symbol.for('ok'), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.bound(value)], function() {
                return true;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return false;
            })).call(this, Elixir.ElixirScript.Map.__load(Elixir).get(map, key)));
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.wildcard()], function() {
            return new Bootstrap.Core.Tuple(Symbol.for('ok'), false);
        }));

        const reduce = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, acc, fun) {
            return do_reduce(Elixir.ElixirScript.Map.__load(Elixir).to_list(map), acc, fun);
        }));

        const __exports = {
            'Type': Object,
            'Implementation': {
                count,
                member__qmark__,
                reduce
            }
        };

        Elixir.ElixirScript.Enumerable.DefImpl.Elixir.Map.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Integer').__load = function(Elixir) {
        if (Elixir.ElixirScript.Integer.__exports)
            return Elixir.ElixirScript.Integer.__exports;

        const is_even = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(number) {
            return number % 2 == 0;
        }));

        const is_odd = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(number) {
            return number % 2 != 0;
        }));

        const parse = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(10)], function(bin, base) {
            let [result] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Functions.get_global().parseInt(bin, base));

            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(index_of_dot) {
                    return new Bootstrap.Core.Tuple(result, '');
                }, function(index_of_dot) {
                    return index_of_dot < 0;
                }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(index_of_dot) {
                    return new Bootstrap.Core.Tuple(result, bin.substring(index_of_dot));
                })).call(this, bin.indexOf('.'));
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return Symbol.for('error');
            })).call(this, Bootstrap.Core.Functions.get_global().isNaN(result));
        }));

        const to_char_list = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(10)], function(number, base) {
            return number.toString(base).split(Object.freeze([]));
        }));

        const __exports = {
            is_even,
            is_odd,
            parse,
            to_char_list
        };

        Elixir.ElixirScript.Integer.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.IO').__load = function(Elixir) {
        if (Elixir.ElixirScript.IO.__exports)
            return Elixir.ElixirScript.IO.__exports;

        const inspect = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(Object.freeze([]))], function(item, opts) {
            Bootstrap.Core.Functions.call_property(Bootstrap.Core.Functions.get_global(), 'console').log(item);

            return item;
        }));

        const puts = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(Symbol.for('stdio')), Bootstrap.Core.Patterns.variable()], function(device, item) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Symbol.for('stdio')], function() {
                return Bootstrap.Core.Functions.call_property(Bootstrap.Core.Functions.get_global(), 'console').log(item);
            }), Bootstrap.Core.Patterns.clause([Symbol.for('stderr')], function() {
                return Bootstrap.Core.Functions.call_property(Bootstrap.Core.Functions.get_global(), 'console').warn(item);
            })).call(this, device);
        }, function(device, item) {
            return Elixir.ElixirScript.Kernel.__load(Elixir).is_binary(item);
        }));

        const warn = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(message) {
            Bootstrap.Core.Functions.call_property(Bootstrap.Core.Functions.get_global(), 'console').warn('warning: ' + Elixir.ElixirScript.String.Chars.__load(Elixir).to_string(message));

            return Bootstrap.Core.Functions.call_property(Bootstrap.Core.Functions.call_property(Bootstrap.Core.Functions.get_global(), 'console'), 'trace');
        }, function(message) {
            return Elixir.ElixirScript.Kernel.__load(Elixir).is_binary(message);
        }));

        const __exports = {
            inspect,
            puts,
            warn
        };

        Elixir.ElixirScript.IO.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.JS').__load = function(Elixir) {
        if (Elixir.JS.__exports)
            return Elixir.JS.__exports;

        const global = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([], function() {
            return Bootstrap.Core.Functions.call_property(Bootstrap.Core.Functions, 'get_global');
        }));

        const is_generator = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return Bootstrap.Core.Functions.call_property(Bootstrap.Core.Functions.call_property(term, 'constructor'), 'name') === 'GeneratorFunction';
        }));

        const __exports = {
            global,
            is_generator
        };

        Elixir.JS.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Kernel').__load = function(Elixir) {
        if (Elixir.ElixirScript.Kernel.__exports)
            return Elixir.ElixirScript.Kernel.__exports;

        const build_if = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Object.freeze([Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('do'), Bootstrap.Core.Patterns.variable()]
        })])], function(condition, do_clause) {
            return build_if(condition, Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('do'), do_clause), new Bootstrap.Core.Tuple(Symbol.for('else'), null)]));
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Object.freeze([Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('do'), Bootstrap.Core.Patterns.variable()]
        }), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('else'), Bootstrap.Core.Patterns.variable()]
        })])], function(condition, do_clause, else_clause) {
            return new Bootstrap.Core.Tuple(Symbol.for('case'), Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('line'), 19)]), Object.freeze([condition, Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('do'), Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('->'), Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('line'), 20)]), Object.freeze([Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('when'), Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('line'), 20)]), Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('x'), Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('line'), 20)]), null), new Bootstrap.Core.Tuple(Symbol.for('in'), Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('line'), 20)]), Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('x'), Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('line'), 20)]), null), Object.freeze([false, null])]))]))]), else_clause])), new Bootstrap.Core.Tuple(Symbol.for('->'), Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('line'), 22)]), Object.freeze([Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('_'), Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('line'), 22)]), null)]), do_clause]))]))])]));
        }));

        const build_unless = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Object.freeze([Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('do'), Bootstrap.Core.Patterns.variable()]
        })])], function(condition, do_clause) {
            return build_unless(condition, Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('do'), do_clause), new Bootstrap.Core.Tuple(Symbol.for('else'), null)]));
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Object.freeze([Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('do'), Bootstrap.Core.Patterns.variable()]
        }), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Symbol.for('else'), Bootstrap.Core.Patterns.variable()]
        })])], function(condition, do_clause, else_clause) {
            return new Bootstrap.Core.Tuple(Symbol.for('if'), Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('line'), 38)]), Object.freeze([condition, Object.freeze([new Bootstrap.Core.Tuple(Symbol.for('do'), else_clause), new Bootstrap.Core.Tuple(Symbol.for('else'), do_clause)])]));
        }));

        const abs = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(number) {
            return Bootstrap.Core.Functions.get_global().Math.abs(number);
        }));

        const apply = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(fun, args) {
            return Bootstrap.Core.Functions.apply(fun, args);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(module, fun, args) {
            return Bootstrap.Core.Functions.apply(module, Elixir.ElixirScript.Atom.__load(Elixir).to_string(fun), args);
        }));

        const binary_part = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(binary, start, len) {
            return binary.substring(start, len);
        }));

        const elem = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(tuple, index) {
            return Bootstrap.Core.Functions.apply(tuple, 'get', Object.freeze([index]));
        }));

        const hd = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(list) {
            return list[0];
        }));

        const is_atom = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return typeof term === 'symbol';
        }));

        const is_binary = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return typeof term === 'string';
        }));

        const is_bitstring = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return is_binary(term) || term instanceof Bootstrap.Core.BitString;
        }));

        const is_boolean = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return typeof term === 'boolean' || term instanceof Boolean;
        }));

        const is_float = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return is_number(term) && !Number.isInteger(term);
        }));

        const is_function = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return is_function(term, 0);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.wildcard()], function(term) {
            return typeof term === 'function' || term instanceof Function;
        }));

        const is_integer = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return Number.isInteger(term);
        }));

        const is_list = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return Array.isArray(term);
        }));

        const is_map = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return typeof term === 'object' || term instanceof Object;
        }));

        const is_nil = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return term === null;
        }));

        const is_number = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return typeof term === 'number' || term instanceof Number;
        }));

        const is_pid = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return term instanceof Bootstrap.Core.PID;
        }));

        const is_port = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
            return false;
        }));

        const is_reference = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
            return false;
        }));

        const is_tuple = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return term instanceof Bootstrap.Core.Tuple;
        }));

        const length = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return Bootstrap.Core.Functions.call_property(term, 'length');
        }));

        const map_size = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return Bootstrap.Core.Functions.call_property(Bootstrap.Core.Functions.get_global().Object.keys(term), 'length');
        }));

        const max = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(first, second) {
            return Bootstrap.Core.Functions.get_global().Math.max(first, second);
        }));

        const min = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(first, second) {
            return Bootstrap.Core.Functions.get_global().Math.min(first, second);
        }));

        const round = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(number) {
            return Bootstrap.Core.Functions.get_global().Math.round(number);
        }));

        const tl = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(list) {
            return list.slice(1);
        }));

        const trunc = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(number) {
            return Bootstrap.Core.Functions.get_global().Math.floor(number);
        }));

        const tuple_size = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(tuple) {
            return Bootstrap.Core.Functions.size(tuple);
        }));

        const __exports = {
            abs,
            apply,
            binary_part,
            elem,
            hd,
            is_atom,
            is_binary,
            is_bitstring,
            is_boolean,
            is_float,
            is_function,
            is_integer,
            is_list,
            is_map,
            is_nil,
            is_number,
            is_pid,
            is_port,
            is_reference,
            is_tuple,
            length,
            map_size,
            max,
            min,
            round,
            tl,
            trunc,
            tuple_size
        };

        Elixir.ElixirScript.Kernel.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Keyword').__load = function(Elixir) {
        if (Elixir.ElixirScript.Keyword.__exports)
            return Elixir.ElixirScript.Keyword.__exports;

        const do_get = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(kw, key) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
                values: [Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()]
            })], function(kw_key, value) {
                return value;
            }, function(kw_key, value) {
                return kw_key == key;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return do_get(Elixir.ElixirScript.Kernel.__load(Elixir).tl(kw), key);
            })).call(this, Elixir.ElixirScript.Kernel.__load(Elixir).hd(kw));
        }));

        const do_has_key__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Object.freeze([]), Bootstrap.Core.Patterns.wildcard()], function() {
            return false;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(kw, key) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
                values: [Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.wildcard()]
            })], function(the_key) {
                return true;
            }, function(the_key) {
                return the_key == key;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return do_has_key__qmark__(Elixir.ElixirScript.Kernel.__load(Elixir).tl(kw), key);
            })).call(this, Elixir.ElixirScript.Kernel.__load(Elixir).hd(kw));
        }));

        const get = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(kw, key) {
            return get(kw, key, null);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(kw, key, default_value) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return do_get(kw, key);
            }), Bootstrap.Core.Patterns.clause([false], function() {
                return default_value;
            })).call(this, has_key__qmark__(kw, key));
        }));

        const has_key__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(kw, key) {
            return do_has_key__qmark__(kw, key);
        }));

        const __new__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([], function() {
            return Object.freeze([]);
        }));

        const __exports = {
            get,
            has_key__qmark__,
            __new__
        };

        Elixir.ElixirScript.Keyword.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.List').__load = function(Elixir) {
        if (Elixir.ElixirScript.List.__exports)
            return Elixir.ElixirScript.List.__exports;

        const do_delete = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, item, current_index, new_list) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                let [updated] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.bound(item)], function() {
                    return new_list;
                }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                    return new_list.concat(Object.freeze([list[current_index]]));
                })).call(this, list[current_index]));

                return do_delete(list, item, current_index + 1, updated);
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return new_list;
            })).call(this, current_index == Elixir.ElixirScript.Kernel.__load(Elixir).length(list));
        }));

        const do_delete_at = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, index, current_index, new_list) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                let [updated] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                    return new_list;
                }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                    return new_list.concat(Object.freeze([list[current_index]]));
                })).call(this, current_index == index));

                return do_delete_at(list, index, current_index + 1, updated);
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return new_list;
            })).call(this, current_index == Elixir.ElixirScript.Kernel.__load(Elixir).length(list));
        }));

        const do_duplicate = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard(), 0, Bootstrap.Core.Patterns.variable()], function(list) {
            return list;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(data, size, list) {
            return do_duplicate(data, size - 1, list.concat(Object.freeze([data])));
        }));

        const do_flatten = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Object.freeze([]), Bootstrap.Core.Patterns.variable()], function(flattened_list) {
            return flattened_list;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, flattened_list) {
            let [updated] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(l) {
                return flattened_list.concat(do_flatten(l, Object.freeze([])));
            }, function(l) {
                return Elixir.ElixirScript.Kernel.__load(Elixir).is_list(l);
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(item) {
                return flattened_list.concat(Object.freeze([item]));
            })).call(this, Elixir.ElixirScript.Kernel.__load(Elixir).hd(list)));

            return do_flatten(Elixir.ElixirScript.Kernel.__load(Elixir).tl(list), updated);
        }));

        const do_foldl = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Object.freeze([]), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.variable()], function(acc, new_list) {
            return new Bootstrap.Core.Tuple(acc, new_list);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, acc, func, new_list) {
            let [acc1, value] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
                values: [Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()]
            }), func(Elixir.ElixirScript.Kernel.__load(Elixir).hd(list), acc));

            let _ref = new Bootstrap.Core.Tuple(acc1, value);

            return do_foldl(Elixir.ElixirScript.Kernel.__load(Elixir).tl(list), acc, func, new_list.concat(Object.freeze([value])));
        }));

        const do_insert_at = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, index, value, current_index, new_list) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                let [updated] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                    return new_list.concat(Object.freeze([value, list[current_index]]));
                }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                    return new_list.concat(Object.freeze([list[current_index]]));
                })).call(this, current_index == index));

                return do_insert_at(list, index, value, current_index + 1, updated);
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return new_list;
            })).call(this, current_index == Elixir.ElixirScript.Kernel.__load(Elixir).length(list));
        }));

        const do_keydelete = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Object.freeze([]), Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.variable()], function(new_list) {
            return new_list;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, key, position, new_list) {
            let [current_value] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Elixir.ElixirScript.Kernel.__load(Elixir).hd(list));

            let [updated] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                return new_list.concat(Object.freeze([current_value]));
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return new_list;
            })).call(this, Elixir.ElixirScript.Kernel.__load(Elixir).elem(current_value, position) == key));

            return do_keydelete(Elixir.ElixirScript.Kernel.__load(Elixir).tl(list), key, position, updated);
        }));

        const do_keyfind = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Object.freeze([]), Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.variable()], function(__default__) {
            return __default__;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, key, position, __default__) {
            let [current_value] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Elixir.ElixirScript.Kernel.__load(Elixir).hd(list));

            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                return do_keyfind(Elixir.ElixirScript.Kernel.__load(Elixir).tl(list), key, position, __default__);
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return current_value;
            })).call(this, Elixir.ElixirScript.Kernel.__load(Elixir).elem(current_value, position) == key);
        }));

        const do_keyreplace = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Object.freeze([]), Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.wildcard()], function(new_list) {
            return new_list;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, key, position, new_list, new_tuple) {
            let [current_value] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Elixir.ElixirScript.Kernel.__load(Elixir).hd(list));

            let [updated] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                return new_list.concat(Object.freeze([current_value]));
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return new_list.concat(Object.freeze([new_tuple]));
            })).call(this, Elixir.ElixirScript.Kernel.__load(Elixir).elem(current_value, position) == key));

            return do_keyreplace(Elixir.ElixirScript.Kernel.__load(Elixir).tl(list), key, position, updated, new_tuple);
        }));

        const do_replace_at = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, index, value, current_index, new_list) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                let [updated] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                    return new_list.concat(Object.freeze([value]));
                }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                    return new_list.concat(Object.freeze([list[current_index]]));
                })).call(this, current_index == index));

                return do_replace_at(list, index, value, current_index + 1, updated);
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return new_list;
            })).call(this, current_index == Elixir.ElixirScript.Kernel.__load(Elixir).length(list));
        }));

        const do_update_at = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, index, func, current_index, new_list) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                let [updated] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                    return new_list.concat(Object.freeze([func(list[current_index])]));
                }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                    return new_list.concat(Object.freeze([list[current_index]]));
                })).call(this, current_index == index));

                return do_update_at(list, index, func, current_index + 1, updated);
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return new_list;
            })).call(this, current_index == Elixir.ElixirScript.Kernel.__load(Elixir).length(list));
        }));

        const append = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, term) {
            return concat(list, Object.freeze([term]));
        }));

        const concat = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list_a, list_b) {
            return list_a.concat(list_b);
        }));

        const __delete__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, item) {
            return do_delete(list, item, 0, Object.freeze([]));
        }));

        const delete_at = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, index) {
            return do_delete_at(list, index, 0, Object.freeze([]));
        }));

        const duplicate = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(data, size) {
            return do_duplicate(data, size, Object.freeze([]));
        }));

        const first = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(list) {
            return list[0];
        }));

        const flatten = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(list) {
            return do_flatten(list, Object.freeze([]));
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, tail) {
            return do_flatten(list, Object.freeze([])).concat(tail);
        }));

        const foldl = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, acc, func) {
            return do_foldl(list, acc, func, Object.freeze([]));
        }));

        const foldr = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, acc, func) {
            return do_foldl(Bootstrap.Core.Functions.call_property(list.concat(Object.freeze([])), 'reverse'), acc, func, Object.freeze([]));
        }));

        const insert_at = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, index, value) {
            return do_insert_at(list, index, value, 0, Object.freeze([]));
        }));

        const keydelete = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, key, position) {
            return do_keydelete(list, key, position, Object.freeze([]));
        }));

        const keyfind = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, key, position) {
            return do_keyfind(list, key, position, null);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, key, position, __default__) {
            return do_keyfind(list, key, position, __default__);
        }));

        const keymember__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, key, position) {
            return keyfind(list, key, position) != null;
        }));

        const keyreplace = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, key, position, new_tuple) {
            return do_keyreplace(list, key, position, Object.freeze([]), new_tuple);
        }));

        const last = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(list) {
            return list[Elixir.ElixirScript.Kernel.__load(Elixir).length(list) - 1];
        }));

        const prepend = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, term) {
            return concat(Object.freeze([term]), list);
        }));

        const replace_at = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, index, value) {
            return do_replace_at(list, index, value, 0, Object.freeze([]));
        }));

        const to_tuple = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(list) {
            return new Bootstrap.Core.Tuple(...list);
        }));

        const update_at = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(list, index, func) {
            return do_update_at(list, index, func, 0, Object.freeze([]));
        }));

        const wrap = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(list) {
            return list;
        }, function(list) {
            return Elixir.ElixirScript.Kernel.__load(Elixir).is_list(list);
        }), Bootstrap.Core.Patterns.clause([null], function() {
            return Object.freeze([]);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return Object.freeze([term]);
        }));

        const zip = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(list_of_lists) {
            return Bootstrap.Core.Functions.zip(list_of_lists);
        }));

        const __exports = {
            append,
            concat,
            __delete__,
            delete_at,
            duplicate,
            first,
            flatten,
            foldl,
            foldr,
            insert_at,
            keydelete,
            keyfind,
            keymember__qmark__,
            keyreplace,
            last,
            prepend,
            replace_at,
            to_tuple,
            update_at,
            wrap,
            zip
        };

        Elixir.ElixirScript.List.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Macro.Env').__load = function(Elixir) {
        if (Elixir.ElixirScript.Macro.Env.__exports)
            return Elixir.ElixirScript.Macro.Env.__exports;

        const Elixir$ElixirScript$Macro$Env = Bootstrap.Core.Functions.defstruct({
            [Symbol.for('__struct__')]: Symbol.for('Elixir.ElixirScript.Macro.Env'),
            [Symbol.for('module')]: null,
            [Symbol.for('file')]: null,
            [Symbol.for('line')]: 0,
            [Symbol.for('function')]: null,
            [Symbol.for('context')]: null,
            [Symbol.for('aliases')]: Object.freeze([]),
            [Symbol.for('requires')]: Object.freeze([]),
            [Symbol.for('functions')]: Object.freeze([]),
            [Symbol.for('macros')]: Object.freeze([]),
            [Symbol.for('macro_aliases')]: Object.freeze([]),
            [Symbol.for('context_modules')]: Object.freeze([]),
            [Symbol.for('vars')]: Object.freeze([]),
            [Symbol.for('export_vars')]: null,
            [Symbol.for('lexical_tracker')]: null
        });

        const __exports = {
            Elixir$ElixirScript$Macro$Env
        };

        Elixir.ElixirScript.Macro.Env.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Map').__load = function(Elixir) {
        if (Elixir.ElixirScript.Map.__exports)
            return Elixir.ElixirScript.Map.__exports;

        const do_split = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard(), Object.freeze([]), Bootstrap.Core.Patterns.variable()], function(split_tuple) {
            return split_tuple;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
            values: [Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()]
        })], function(map, keys, key_map, non_key_map) {
            let [key] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Elixir.ElixirScript.Kernel.__load(Elixir).hd(keys));

            let [new_split_tuple] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return new Bootstrap.Core.Tuple(Elixir.ElixirScript.Map.__load(Elixir).put(key_map, key, map[key]), non_key_map);
            }), Bootstrap.Core.Patterns.clause([false], function() {
                return new Bootstrap.Core.Tuple(key_map, Elixir.ElixirScript.Map.__load(Elixir).put(non_key_map, key, map[key]));
            })).call(this, Bootstrap.Enum.member__qmark__(keys(map), key)));

            return do_split(map, Elixir.ElixirScript.Kernel.__load(Elixir).tl(keys), new_split_tuple);
        }));

        const __delete__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key) {
            return Bootstrap.Core.Functions.delete_property_from_map(map, key);
        }));

        const do_to_list = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, list) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([0], function() {
                return list;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                let [key] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Elixir.ElixirScript.Kernel.__load(Elixir).hd(keys(map)));

                let [value] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), map[key]);

                return do_to_list(Elixir.ElixirScript.Map.__load(Elixir).__delete__(map, key), list.concat(Object.freeze([new Bootstrap.Core.Tuple(key, value)])));
            })).call(this, size(map));
        }));

        const drop = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, keys) {
            let [undefined, non_key_map] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
                values: [Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.variable()]
            }), split(map, keys));

            let _ref = new Bootstrap.Core.Tuple(undefined, non_key_map);

            return non_key_map;
        }));

        const equal__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map1, map2) {
            return map1 === map2;
        }));

        const fetch = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return new Bootstrap.Core.Tuple(Symbol.for('ok'), map[key]);
            }), Bootstrap.Core.Patterns.clause([false], function() {
                return Symbol.for('error');
            })).call(this, Bootstrap.Enum.member__qmark__(keys(map), key));
        }));

        const fetch__emark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return map[key];
            }), Bootstrap.Core.Patterns.clause([false], function() {
                throw {
                    [Symbol.for('__struct__')]: Symbol.for('RuntimeError'),
                    [Symbol.for('__exception__')]: true,
                    [Symbol.for('message')]: Elixir.ElixirScript.String.Chars.__load(Elixir).to_string(key) + ' not found in map'
                };

                return null;
            })).call(this, Bootstrap.Enum.member__qmark__(keys(map), key));
        }));

        const from_struct = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(struct) {
            return __delete__(Bootstrap.Core.Functions.class_to_obj(struct), Symbol.for('__struct__'));
        }));

        const get = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key) {
            return get(map, key, null);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key, default_value) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return map[key];
            }), Bootstrap.Core.Patterns.clause([false], function() {
                return default_value;
            })).call(this, Bootstrap.Enum.member__qmark__(keys(map), key));
        }));

        const get_and_update = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key, func) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return new Bootstrap.Core.Tuple(null, map);
            }), Bootstrap.Core.Patterns.clause([false], function() {
                let [new_value] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), func(map[key]));

                return new Bootstrap.Core.Tuple(new_value, Elixir.ElixirScript.Map.__load(Elixir).put(map, key, new_value));
            })).call(this, Bootstrap.Enum.member__qmark__(keys(map), key));
        }));

        const get_lazy = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key, func) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return func(map[key]);
            }), Bootstrap.Core.Patterns.clause([false], function() {
                return func();
            })).call(this, Bootstrap.Enum.member__qmark__(keys(map), key));
        }));

        const has_key__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key) {
            return Bootstrap.Enum.member__qmark__(keys(map), key);
        }));

        const keys = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(map) {
            return Bootstrap.Core.Functions.get_object_keys(map);
        }));

        const merge = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map1, map2) {
            return Bootstrap.Core.SpecialForms.map_update(map1, map2);
        }));

        const __new__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([], function() {
            return Object.freeze({});
        }));

        const pop = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key) {
            return pop(map, key, null);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key, default_value) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return new Bootstrap.Core.Tuple(map[key], Elixir.ElixirScript.Map.__load(Elixir).__delete__(map, key));
            }), Bootstrap.Core.Patterns.clause([false], function() {
                return new Bootstrap.Core.Tuple(default_value, map);
            })).call(this, Bootstrap.Enum.member__qmark__(keys(map), key));
        }));

        const pop_lazy = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key, func) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return new Bootstrap.Core.Tuple(func(map[key]), Elixir.ElixirScript.Map.__load(Elixir).__delete__(map, key));
            }), Bootstrap.Core.Patterns.clause([false], function() {
                return new Bootstrap.Core.Tuple(func(), map);
            })).call(this, Bootstrap.Enum.member__qmark__(keys(map), key));
        }));

        const put = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key, value) {
            return Bootstrap.Core.Functions.add_property_to_map(map, key, value);
        }));

        const put_new = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key, value) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return map;
            }), Bootstrap.Core.Patterns.clause([false], function() {
                return Elixir.ElixirScript.Map.__load(Elixir).put(map, key, value);
            })).call(this, Bootstrap.Enum.member__qmark__(keys(map), key));
        }));

        const put_new_lazy = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key, func) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return map;
            }), Bootstrap.Core.Patterns.clause([false], function() {
                return Elixir.ElixirScript.Map.__load(Elixir).put(map, key, func());
            })).call(this, Bootstrap.Enum.member__qmark__(keys(map), key));
        }));

        const size = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(map) {
            return Bootstrap.Core.Functions.call_property(keys(map), 'length');
        }));

        const split = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, keys) {
            return do_split(map, keys, new Bootstrap.Core.Tuple(Object.freeze({}), Object.freeze({})));
        }));

        const take = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, keys) {
            let [key_map, undefined] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.type(Bootstrap.Core.Tuple, {
                values: [Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.wildcard()]
            }), split(map, keys));

            let _ref = new Bootstrap.Core.Tuple(key_map, undefined);

            return key_map;
        }));

        const to_list = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(map) {
            return do_to_list(map, Object.freeze([]));
        }));

        const update = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key, initial, func) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return Elixir.ElixirScript.Map.__load(Elixir).put(map, key, func(map[key]));
            }), Bootstrap.Core.Patterns.clause([false], function() {
                return Elixir.ElixirScript.Map.__load(Elixir).put(map, key, initial);
            })).call(this, Bootstrap.Enum.member__qmark__(keys(map), key));
        }));

        const update__emark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(map, key, func) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return Elixir.ElixirScript.Map.__load(Elixir).put(map, key, func(map[key]));
            }), Bootstrap.Core.Patterns.clause([false], function() {
                throw {
                    [Symbol.for('__struct__')]: Symbol.for('RuntimeError'),
                    [Symbol.for('__exception__')]: true,
                    [Symbol.for('message')]: Elixir.ElixirScript.String.Chars.__load(Elixir).to_string(key) + ' not found in map'
                };

                return null;
            })).call(this, Bootstrap.Enum.member__qmark__(keys(map), key));
        }));

        const values = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(map) {
            return Bootstrap.Core.Functions.get_global().Object.values(map);
        }));

        const __exports = {
            __delete__,
            do_to_list,
            drop,
            equal__qmark__,
            fetch,
            fetch__emark__,
            from_struct,
            get,
            get_and_update,
            get_lazy,
            has_key__qmark__,
            keys,
            merge,
            __new__,
            pop,
            pop_lazy,
            put,
            put_new,
            put_new_lazy,
            size,
            split,
            take,
            to_list,
            update,
            update__emark__,
            values
        };

        Elixir.ElixirScript.Map.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.MapSet').__load = function(Elixir) {
        if (Elixir.ElixirScript.MapSet.__exports)
            return Elixir.ElixirScript.MapSet.__exports;

        const Elixir$ElixirScript$MapSet = Bootstrap.Core.Functions.defstruct({
            [Symbol.for('__struct__')]: Symbol.for('Elixir.ElixirScript.MapSet'),
            [Symbol.for('set')]: Object.freeze([])
        });

        const __delete__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(set, term) {
            return Bootstrap.Core.SpecialForms.map_update(set, Object.freeze({
                [Symbol.for('set')]: Elixir.ElixirScript.List.__load(Elixir).remove(Bootstrap.Core.Functions.call_property(set, 'set'), term)
            }));
        }));

        const difference = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(set1, set2) {
            return do_difference(to_list(set1), set2, __new__());
        }));

        const disjoint__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(set1, set2) {
            return size(intersection(set1, set2)) == 0;
        }));

        const do_difference = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Object.freeze([]), Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.variable()], function(difference_set) {
            return difference_set;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(set1_list, set2, difference_set) {
            let [term] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Elixir.ElixirScript.Kernel.__load(Elixir).hd(set1_list));

            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return do_difference(Elixir.ElixirScript.Kernel.__load(Elixir).tl(set1_list), set2, difference_set);
            }), Bootstrap.Core.Patterns.clause([false], function() {
                return do_difference(Elixir.ElixirScript.Kernel.__load(Elixir).tl(set1_list), set2, Bootstrap.Core.SpecialForms.map_update(difference_set, Object.freeze({
                    [Symbol.for('set')]: Bootstrap.Core.Functions.call_property(difference_set, 'set').concat(Object.freeze([term]))
                })));
            })).call(this, member__qmark__(set2, term));
        }));

        const do_intersection = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Object.freeze([]), Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.variable()], function(intersection_set) {
            return intersection_set;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(set1_list, set2, intersection_set) {
            let [term] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Elixir.ElixirScript.Kernel.__load(Elixir).hd(set1_list));

            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([false], function() {
                return do_intersection(Elixir.ElixirScript.Kernel.__load(Elixir).tl(set1_list), set2, intersection_set);
            }), Bootstrap.Core.Patterns.clause([true], function() {
                return do_intersection(Elixir.ElixirScript.Kernel.__load(Elixir).tl(set1_list), set2, Bootstrap.Core.SpecialForms.map_update(intersection_set, Object.freeze({
                    [Symbol.for('set')]: Bootstrap.Core.Functions.call_property(intersection_set, 'set').concat(Object.freeze([term]))
                })));
            })).call(this, member__qmark__(set2, term));
        }));

        const do_subset__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Object.freeze([]), Bootstrap.Core.Patterns.wildcard()], function() {
            return true;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(set1_list, set2) {
            let [term] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Elixir.ElixirScript.Kernel.__load(Elixir).hd(set1_list));

            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([false], function() {
                return false;
            }), Bootstrap.Core.Patterns.clause([true], function() {
                return do_subset__qmark__(Elixir.ElixirScript.Kernel.__load(Elixir).tl(set1_list), set2);
            })).call(this, member__qmark__(set2, term));
        }));

        const equal__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(set1, set2) {
            return set1 === set2;
        }));

        const intersection = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(set1, set2) {
            return do_intersection(to_list(set1), set2, __new__());
        }));

        const member__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(set, term) {
            return Bootstrap.Core.Functions.call_property(set, 'set').indexOf(term) >= 0;
        }));

        const __new__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([], function() {
            return Elixir.ElixirScript.MapSet.__load(Elixir).Elixir$ElixirScript$MapSet.create(Object.freeze({}));
        }));

        const put = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(set, term) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([false], function() {
                return Bootstrap.Core.SpecialForms.map_update(set, Object.freeze({
                    [Symbol.for('set')]: Bootstrap.Core.Functions.call_property(set, 'set').concat(term)
                }));
            }), Bootstrap.Core.Patterns.clause([true], function() {
                return set;
            })).call(this, member__qmark__(set, term));
        }));

        const size = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(set) {
            return Elixir.ElixirScript.Kernel.__load(Elixir).length(Bootstrap.Core.Functions.call_property(set, 'set'));
        }));

        const subset__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(set1, set2) {
            return do_subset__qmark__(to_list(set1), set2);
        }));

        const to_list = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(set) {
            return Bootstrap.Core.Functions.call_property(set, 'set');
        }));

        const union = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(set1, set2) {
            return Bootstrap.Core.SpecialForms.map_update(set1, Object.freeze({
                [Symbol.for('set')]: Bootstrap.Core.Functions.call_property(set1, 'set').concat(Bootstrap.Core.Functions.call_property(set2, 'set'))
            }));
        }));

        const __exports = {
            Elixir$ElixirScript$MapSet,
            __delete__,
            difference,
            disjoint__qmark__,
            do_difference,
            do_intersection,
            do_subset__qmark__,
            equal__qmark__,
            intersection,
            member__qmark__,
            __new__,
            put,
            size,
            subset__qmark__,
            to_list,
            union
        };

        Elixir.ElixirScript.MapSet.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Module').__load = function(Elixir) {
        if (Elixir.ElixirScript.Module.__exports)
            return Elixir.ElixirScript.Module.__exports;

        const Elixir$ElixirScript$Module = Bootstrap.Core.Functions.defstruct({
            [Symbol.for('__struct__')]: Symbol.for('Elixir.ElixirScript.Module'),
            [Symbol.for('name')]: null,
            [Symbol.for('functions')]: Elixir.ElixirScript.Keyword.__load(Elixir).__new__(),
            [Symbol.for('private_functions')]: Elixir.ElixirScript.Keyword.__load(Elixir).__new__(),
            [Symbol.for('body')]: null,
            [Symbol.for('js_imports')]: Object.freeze([]),
            [Symbol.for('module_refs')]: Object.freeze([]),
            [Symbol.for('type')]: Symbol.for('module'),
            [Symbol.for('impls')]: Elixir.ElixirScript.Map.__load(Elixir).__new__(),
            [Symbol.for('impl_type')]: null,
            [Symbol.for('app_name')]: null
        });

        const __exports = {
            Elixir$ElixirScript$Module
        };

        Elixir.ElixirScript.Module.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Range').__load = function(Elixir) {
        if (Elixir.ElixirScript.Range.__exports)
            return Elixir.ElixirScript.Range.__exports;

        const Elixir$ElixirScript$Range = Bootstrap.Core.Functions.defstruct({
            [Symbol.for('__struct__')]: Symbol.for('Elixir.ElixirScript.Range'),
            [Symbol.for('first')]: null,
            [Symbol.for('last')]: null
        });

        const __new__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(first, last) {
            return Elixir.ElixirScript.Range.__load(Elixir).Elixir$ElixirScript$Range.create(Object.freeze({
                [Symbol.for('first')]: first,
                [Symbol.for('last')]: last
            }));
        }));

        const range__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.type(Elixir.ElixirScript.Range.__load(Elixir).Elixir$ElixirScript$Range, {})], function() {
            return true;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
            return false;
        }));

        const __exports = {
            Elixir$ElixirScript$Range,
            __new__,
            range__qmark__
        };

        Elixir.ElixirScript.Range.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Regex').__load = function(Elixir) {
        if (Elixir.ElixirScript.Regex.__exports)
            return Elixir.ElixirScript.Regex.__exports;

        const do_scan = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(regex, string, options, results) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([null], function() {
                return results;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(match) {
                return do_scan(regex, string, options, results.concat(match));
            })).call(this, run(regex, string, options));
        }));

        const make_global = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(regex) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                return new JS.RegExp(source(regex), opts(regex) + 'g');
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return regex;
            })).call(this, Elixir.ElixirScript.String.__load(Elixir).contains__qmark__(opts(regex), 'g'));
        }));

        const compile = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable('')], function(source, options) {
            return Bootstrap.Core.SpecialForms._try(function() {
                return new Bootstrap.Core.Tuple(Symbol.for('ok'), new JS.RegExp(source, options));
            }, Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                return new Bootstrap.Core.Tuple(Symbol.for('error'), Bootstrap.Core.Functions.call_property(x, 'message'));
            })), null, null, null);
        }));

        const compile__emark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable('')], function(source, options) {
            return new JS.RegExp(source, options);
        }));

        const match__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(regex, string) {
            let [reg] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                return compile__emark__(source(regex), opts(regex));
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return regex;
            })).call(this, regex__qmark__(regex)));

            return reg.test(string);
        }));

        const opts = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(regex) {
            return Bootstrap.Core.Functions.call_property(regex, 'opts');
        }));

        const regex__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(term) {
            return term instanceof JS.RegExp;
        }));

        const replace = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(Object.freeze([]))], function(regex, string, replacement, options) {
            let [reg] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                return regex;
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return make_global(regex);
            })).call(this, Elixir.ElixirScript.Keyword.__load(Elixir).get(options, Symbol.for('global'), true)));

            return string.replace(reg, replacement);
        }));

        const run = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(Object.freeze([]))], function(regex, string, options) {
            return regex.exec(string);
        }));

        const scan = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(Object.freeze([]))], function(regex, string, options) {
            let [reg] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), make_global(regex));

            return do_scan(reg, string, options, Object.freeze([]));
        }));

        const source = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(regex) {
            return Bootstrap.Core.Functions.call_property(regex, 'source');
        }));

        const __exports = {
            compile,
            compile__emark__,
            match__qmark__,
            opts,
            regex__qmark__,
            replace,
            run,
            scan,
            source
        };

        Elixir.ElixirScript.Regex.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.String').__load = function(Elixir) {
        if (Elixir.ElixirScript.String.__exports)
            return Elixir.ElixirScript.String.__exports;

        const do_reverse = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause(['', Bootstrap.Core.Patterns.variable()], function(str) {
            return str;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, reverse_str) {
            return do_reverse(str.substr(1), reverse_str + last(str));
        }));

        const at = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, pos) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return null;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return str[pos];
            })).call(this, pos > length(str));
        }));

        const capitalize = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            let [first] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Functions.call_property(str[0], 'toUpperCase'));

            let [rest] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Functions.call_property(str.substr(1), 'toLowerCase'));

            return first + rest;
        }));

        const codepoints = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return do_codepoints(str, Object.freeze([]));
        }));

        const contains__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, s) {
            return str.indexOf(s) > -1;
        }, function(str, s) {
            return Elixir.ElixirScript.Kernel.__load(Elixir).is_binary(s);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, s) {
            return do_contains__qmark__(str, s);
        }, function(str, s) {
            return Elixir.ElixirScript.Kernel.__load(Elixir).is_list(s);
        }));

        const do_codepoints = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause(['', Bootstrap.Core.Patterns.variable()], function(codepoint_list) {
            return codepoint_list;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, codepoint_list) {
            return do_codepoints(str.substr(1), codepoint_list.concat(Object.freeze([first(str).codePointAt(0)])));
        }));

        const do_contains__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard(), Object.freeze([])], function() {
            return false;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, prefixes) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return true;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return do_contains__qmark__(str, Elixir.ElixirScript.Kernel.__load(Elixir).tl(prefixes));
            })).call(this, contains__qmark__(str, Elixir.ElixirScript.Kernel.__load(Elixir).hd(prefixes)));
        }));

        const do_ends_with__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard(), Object.freeze([])], function() {
            return false;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, suffixes) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return true;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return do_ends_with__qmark__(str, Elixir.ElixirScript.Kernel.__load(Elixir).tl(suffixes));
            })).call(this, ends_with__qmark__(str, Elixir.ElixirScript.Kernel.__load(Elixir).hd(suffixes)));
        }));

        const do_starts_with__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard(), Object.freeze([])], function() {
            return false;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, prefixes) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                return true;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return do_starts_with__qmark__(str, Elixir.ElixirScript.Kernel.__load(Elixir).tl(prefixes));
            })).call(this, starts_with__qmark__(str, Elixir.ElixirScript.Kernel.__load(Elixir).hd(prefixes)));
        }));

        const downcase = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return Bootstrap.Core.Functions.call_property(str, 'toLowerCase');
        }));

        const duplicate = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, n) {
            return str.repeat(n);
        }));

        const ends_with__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, suffix) {
            return str.endsWith(suffix);
        }, function(str, suffix) {
            return Elixir.ElixirScript.Kernel.__load(Elixir).is_binary(suffix);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, suffixes) {
            return do_ends_with__qmark__(str, suffixes);
        }, function(str, suffixes) {
            return Elixir.ElixirScript.Kernel.__load(Elixir).is_list(suffixes);
        }));

        const first = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([null], function() {
            return null;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return str[0];
        }));

        const graphemes = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return str.split(Object.freeze([]));
        }));

        const last = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([null], function() {
            return null;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return str[length(str) - 1];
        }));

        const length = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return Bootstrap.Core.Functions.call_property(str, 'length');
        }));

        const match__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, regex) {
            return str.match(regex) != null;
        }));

        const next_codepoint = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([null], function() {
            return null;
        }), Bootstrap.Core.Patterns.clause([''], function() {
            return null;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return new Bootstrap.Core.Tuple(str[0].codePointAt(0), str.substr(1));
        }));

        const next_grapheme = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([null], function() {
            return null;
        }), Bootstrap.Core.Patterns.clause([''], function() {
            return null;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return new Bootstrap.Core.Tuple(str[0], str.substr(1));
        }));

        const reverse = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return do_reverse(str, '');
        }));

        const split = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return Bootstrap.Core.Functions.call_property(str, 'split');
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(Object.freeze([]))], function(str, replace, options) {
            let [limit] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Elixir.ElixirScript.Keyword.__load(Elixir).get(options, Symbol.for('parts'), -1));

            let [trim] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Elixir.ElixirScript.Keyword.__load(Elixir).get(options, Symbol.for('trim'), false));

            let [split] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), str.split(replace, limit));

            return Bootstrap.Enum.map(split, Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                    return x;
                }, function(x) {
                    return x === null || x === false;
                }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                    return Bootstrap.Core.Functions.call_property(x, 'trim');
                })).call(this, trim);
            })));
        }));

        const starts_with__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, prefix) {
            return str.startsWith(prefix);
        }, function(str, prefix) {
            return Elixir.ElixirScript.Kernel.__load(Elixir).is_binary(prefix);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, prefixes) {
            return do_starts_with__qmark__(str, prefixes);
        }, function(str, prefixes) {
            return Elixir.ElixirScript.Kernel.__load(Elixir).is_list(prefixes);
        }));

        const to_atom = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return Bootstrap.Core.Functions.get_global().Symbol.for(str);
        }));

        const to_char_list = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return str.split('');
        }));

        const to_existing_atom = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return Bootstrap.Core.Functions.get_global().Symbol.for(str);
        }));

        const to_float = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return Bootstrap.Core.Functions.get_global().parseFloat(str);
        }));

        const to_integer = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return Bootstrap.Core.Functions.get_global().parseInt(str, 10);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(str, base) {
            return Bootstrap.Core.Functions.get_global().parseInt(str, base);
        }));

        const upcase = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(str) {
            return Bootstrap.Core.Functions.call_property(str, 'toUpperCase');
        }));

        const valid_character__qmark__ = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(codepoint) {
            return Bootstrap.Core.Functions.is_valid_character(codepoint);
        }));

        const __exports = {
            at,
            capitalize,
            codepoints,
            contains__qmark__,
            do_codepoints,
            do_contains__qmark__,
            do_ends_with__qmark__,
            do_starts_with__qmark__,
            downcase,
            duplicate,
            ends_with__qmark__,
            first,
            graphemes,
            last,
            length,
            match__qmark__,
            next_codepoint,
            next_grapheme,
            reverse,
            split,
            starts_with__qmark__,
            to_atom,
            to_char_list,
            to_existing_atom,
            to_float,
            to_integer,
            upcase,
            valid_character__qmark__
        };

        Elixir.ElixirScript.String.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.String.Chars').__load = function(Elixir) {
        if (Elixir.ElixirScript.String.Chars.__exports)
            return Elixir.ElixirScript.String.Chars.__exports;

        const Elixir$ElixirScript$String$Chars$DefImpl = Elixir.ElixirScript.String.Chars.DefImpl.__load(Elixir);

        const Elixir$ElixirScript$String$Chars = Bootstrap.Core.Functions.defprotocol({
            to_string: function() {}
        });

        for (let {Type, Implementation} of Elixir$ElixirScript$String$Chars$DefImpl) Bootstrap.Core.Functions.defimpl(Elixir$ElixirScript$String$Chars, Type, Implementation)

        const __exports = Elixir$ElixirScript$String$Chars;

        Elixir.ElixirScript.String.Chars.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Atom').__load = function(Elixir) {
        if (Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Atom.__exports)
            return Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Atom.__exports;

        const to_string = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([null], function() {
            return '';
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(atom) {
            return Elixir.ElixirScript.Atom.__load(Elixir).to_string(atom);
        }));

        const __exports = {
            'Type': Symbol,
            'Implementation': {
                to_string
            }
        };

        Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Atom.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.String.Chars.DefImpl.Elixir.BitString').__load = function(Elixir) {
        if (Elixir.ElixirScript.String.Chars.DefImpl.Elixir.BitString.__exports)
            return Elixir.ElixirScript.String.Chars.DefImpl.Elixir.BitString.__exports;

        const to_string = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(thing) {
            return thing;
        }, function(thing) {
            return Elixir.ElixirScript.Kernel.__load(Elixir).is_binary(thing);
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(thing) {
            return Bootstrap.Core.Functions.call_property(thing, 'toString');
        }));

        const __exports = {
            'Type': Bootstrap.Core.BitString,
            'Implementation': {
                to_string
            }
        };

        Elixir.ElixirScript.String.Chars.DefImpl.Elixir.BitString.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.String.Chars.DefImpl.Elixir.List').__load = function(Elixir) {
        if (Elixir.ElixirScript.String.Chars.DefImpl.Elixir.List.__exports)
            return Elixir.ElixirScript.String.Chars.DefImpl.Elixir.List.__exports;

        const to_string = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(list) {
            return Bootstrap.Core.Functions.call_property(list, 'toString');
        }));

        const __exports = {
            'Type': Array,
            'Implementation': {
                to_string
            }
        };

        Elixir.ElixirScript.String.Chars.DefImpl.Elixir.List.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Tuple').__load = function(Elixir) {
        if (Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Tuple.__exports)
            return Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Tuple.__exports;

        const to_string = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(tuple) {
            return Bootstrap.Core.Functions.call_property(tuple, 'toString');
        }));

        const __exports = {
            'Type': Bootstrap.Core.Tuple,
            'Implementation': {
                to_string
            }
        };

        Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Tuple.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Integer').__load = function(Elixir) {
        if (Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Integer.__exports)
            return Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Integer.__exports;

        const to_string = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(integer) {
            return Bootstrap.Core.Functions.call_property(integer, 'toString');
        }));

        const __exports = {
            'Type': Bootstrap.Core.Integer,
            'Implementation': {
                to_string
            }
        };

        Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Integer.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Float').__load = function(Elixir) {
        if (Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Float.__exports)
            return Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Float.__exports;

        const to_string = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(float) {
            return Bootstrap.Core.Functions.call_property(float, 'toString');
        }));

        const __exports = {
            'Type': Bootstrap.Core.Float,
            'Implementation': {
                to_string
            }
        };

        Elixir.ElixirScript.String.Chars.DefImpl.Elixir.Float.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.ElixirScript.Tuple').__load = function(Elixir) {
        if (Elixir.ElixirScript.Tuple.__exports)
            return Elixir.ElixirScript.Tuple.__exports;

        const do_delete_at = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(tuple, index, current_index, list) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                let [new_list] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                    return list;
                }), Bootstrap.Core.Patterns.clause([false], function() {
                    return list.concat(Object.freeze([tuple.get(current_index)]));
                })).call(this, index == current_index));

                return do_delete_at(tuple, index, current_index + 1, new_list);
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return list;
            })).call(this, current_index == Elixir.ElixirScript.Kernel.__load(Elixir).length(tuple));
        }));

        const do_duplicate = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard(), 0, Bootstrap.Core.Patterns.variable()], function(list) {
            return list;
        }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(data, size, list) {
            return do_duplicate(data, size - 1, list.concat(Object.freeze([data])));
        }));

        const do_insert_at = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(tuple, index, value, current_index, list) {
            return Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(x) {
                let [new_list] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([true], function() {
                    return list.concat(Object.freeze([value, tuple.get(current_index)]));
                }), Bootstrap.Core.Patterns.clause([false], function() {
                    return list.concat(Object.freeze([tuple.get(current_index)]));
                })).call(this, index == current_index));

                return do_insert_at(tuple, index, value, current_index + 1, new_list);
            }, function(x) {
                return x === null || x === false;
            }), Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard()], function() {
                return list;
            })).call(this, current_index == Elixir.ElixirScript.Kernel.__load(Elixir).length(tuple));
        }));

        const append = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(tuple, value) {
            return new Bootstrap.Core.Tuple(...to_list(tuple).concat(Object.freeze([value])));
        }));

        const delete_at = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(tuple, index) {
            return new Bootstrap.Core.Tuple(...do_delete_at(tuple, index, 0, Object.freeze([])));
        }));

        const duplicate = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(data, size) {
            return new Bootstrap.Core.Tuple(...do_duplicate(data, size, Object.freeze([])));
        }));

        const insert_at = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable(), Bootstrap.Core.Patterns.variable()], function(tuple, index, value) {
            return new Bootstrap.Core.Tuple(...do_insert_at(tuple, index, value, 0, Object.freeze([])));
        }));

        const to_list = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.variable()], function(tuple) {
            return Bootstrap.Core.Functions.call_property(tuple, 'values');
        }));

        const __exports = {
            append,
            delete_at,
            duplicate,
            insert_at,
            to_list
        };

        Elixir.ElixirScript.Tuple.__exports = __exports

        return __exports;
    }

    Bootstrap.Core.Functions.build_namespace(Elixir, 'Elixir.App').__load = function(Elixir) {
        if (Elixir.App.__exports)
            return Elixir.App.__exports;

        const start = Bootstrap.Core.Patterns.defmatch(Bootstrap.Core.Patterns.clause([Bootstrap.Core.Patterns.wildcard(), Bootstrap.Core.Patterns.wildcard()], function() {
            let [val] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), 'foobar');

            let [ret] = Bootstrap.Core.Patterns.match(Bootstrap.Core.Patterns.variable(), Bootstrap.Core.SpecialForms.cond(Object.freeze([Symbol.for('foo') == Symbol.for('foo'), function() {
                return 'bar';
            }])));

            return console.log(ret);
        }));

        const __exports = {
            start
        };

        Elixir.App.__exports = __exports

        return __exports;
    }

    return Elixir;
});