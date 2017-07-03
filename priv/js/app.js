'use strict'
var _NumberisInteger = Number.isInteger,
  _StringfromCharCode = String.fromCharCode,
  Bootstrap = (function () {
    'use strict'
    /* @flow */ /* @flow */ function is_number (D) {
      return typeof D === 'number'
    }
    function is_string (D) {
      return typeof D === 'string'
    }
    function is_boolean (D) {
      return typeof D === 'boolean'
    }
    function is_symbol (D) {
      return typeof D === 'symbol'
    }
    function is_object (D) {
      return typeof D === 'object'
    }
    function is_variable (D) {
      return D instanceof Variable
    }
    function is_null (D) {
      return D === null
    }
    function is_array (D) {
      return Array.isArray(D)
    }
    function is_function (D) {
      return Object.prototype.toString.call(D) == '[object Function]'
    }
    function resolveNull () {
      return function (E) {
        return is_null(E)
      }
    }
    function resolveWildcard () {
      return function () {
        return !0
      }
    }
    function resolveObject (D) {
      let E = {}
      const F = Object.keys(D).concat(Object.getOwnPropertySymbols(D))
      for (let G of F) { E[G] = buildMatch(D[G]) }
      return function (G, H) {
        if (!is_object(G) || D.length > G.length) return !1
        for (let I of F) {
          if (!(I in G) || !E[I](G[I], H)) return !1
        }
        return !0
      }
    }
    function getSize (D, E) {
      return D * E / 8
    }
    function arraysEqual (D, E) {
      if (D === E) return !0
      if (D == null || E == null) return !1
      if (D.length != E.length) return !1
      for (var F = 0; F < D.length; ++F) {
        if (D[F] !== E[F]) return !1
      }
      return !0
    }
    function fillArray (D, E) {
      for (let F = 0; F < E; F++) {
        D.push(0)
      }
    }
    function createBitString (D) {
      let E = D.map(F => h.integer(F))
      return new h(...E)
    }
    function resolveNoMatch () {
      return function () {
        return !1
      }
    }
    function buildMatch (D) {
      if (D === null) return resolveNull(D)
      if (typeof D === 'undefined') return resolveWildcard(D)
      const E = D.constructor.prototype, F = k.get(E)
      return F
        ? F(D)
        : typeof D === 'object' ? resolveObject(D) : resolveNoMatch()
    }
    function defmatchgen (...D) {
      const E = getArityMap(D)
      return function*(...F) {
        let [G, H] = findMatchingFunction(F, E)
        return yield * G.apply(this, H)
      }
    }
    function findMatchingFunction (D, E) {
      if (E.has(D.length)) {
        const F = E.get(D.length)
        let G = null, H = null
        for (let I of F) {
          let J = []
          if (
            (D = fillInOptionalValues(D, I.arity, I.optionals), I.pattern(
              D,
              J
            ) &&
              I.guard.apply(this, J))
          ) {
            G = I.fn, H = J
            break
          }
        }
        if (!G) throw (console.error('No match for:', D), new MatchError(D))
        return [G, H]
      }
      throw (console.error(
        'Arity of',
        D.length,
        'not found. No match for:',
        D
      ), new MatchError(D))
    }
    function getArityMap (D) {
      let E = new Map()
      for (const F of D) {
        const G = getArityRange(F)
        for (const H of G) {
          let I = []
          E.has(H) && (I = E.get(H)), I.push(F), E.set(H, I)
        }
      }
      return E
    }
    function getArityRange (D) {
      const E = D.arity - D.optionals.length, F = D.arity
      let G = [E]
      for (; G[G.length - 1] != F;) {
        G.push(G[G.length - 1] + 1)
      }
      return G
    }
    function getOptionalValues (D) {
      let E = []
      for (let F = 0; F < D.length; F++) {
        D[F] instanceof Variable &&
          D[F].default_value != Symbol.for('tailored.no_value') &&
          E.push([F, D[F].default_value])
      }
      return E
    }
    function fillInOptionalValues (D, E, F) {
      if (D.length === E || F.length === 0) return D
      if (D.length + F.length < E) return D
      let G = E - D.length, H = F.length - G, I = F.slice(H)
      for (let [J, K] of I) { if ((D.splice(J, 0, K), D.length === E)) break }
      return D
    }
    function match_or_default (D, E, F = () => !0, G = null) {
      let H = [], I = buildMatch(D)
      return I(E, H) && F.apply(this, H) ? H : G
    }
    function run_generators (D, E) {
      if (E.length == 0) {
        return D.map(F => {
          return Array.isArray(F) ? F : [F]
        })
      }
      const F = E.pop()
      let G = []
      for (let H of F()) {
        for (let I of D) {
          G.push([H].concat(I))
        }
      }
      return run_generators(G, E)
    }
    function iterator_to_reducer (D, E, F) {
      const G = D[Symbol.iterator]()
      let H = G.next(), I = E
      for (; !1 === H.done;) {
        if ((I = F(H.value, I.get(1)), I.get(0) === Symbol.for('halt'))) { return new B.Tuple(Symbol.for('halted'), I.get(1)) }
        if (I.get(0) === Symbol.for('suspend')) {
          return new B.Tuple(Symbol.for('suspended'), I.get(1), J => {
            return iterator_to_reducer(G, J, F)
          })
        }
        H = G.next()
      }
      return new B.Tuple(Symbol.for('done'), I.get(1))
    }
    function run_list_generators (D, E) {
      if (E.length == 0) {
        return D.map(H => {
          return Array.isArray(H) ? H : [H]
        })
      }
      const F = E.pop(), G = []
      for (const H of F()) {
        for (const I of D) {
          G.push([H].concat(I))
        }
      }
      return run_list_generators(G, E)
    } // http://erlang.org/doc/man/erlang.html
    function binary_to_atom (D, E = Symbol.for('utf8')) {
      if (E !== Symbol.for('utf8')) {
        throw new Error(`unsupported encoding ${E}`)
      }
      return Symbol.for(D)
    }
    function is_number$1 (D) {
      return typeof D === 'number' || D instanceof Number
    }
    function is_key (D, E) {
      return E.hasOwnProperty(D)
    } // http://erlang.org/doc/man/lists.html
    function reverse (D) {
      return [...D].reverse()
    }
    function flatten (D, E = []) {
      const F = D.reduce(
        (G, H) => {
          return Array.isArray(H) ? G.concat(flatten(H)) : G.concat(H)
        },
        []
      )
      return F.concat(E)
    }
    function foldl (D, E, F) {
      return F.reduce(
        (G, H) => {
          return D(H, G)
        },
        E
      )
    }
    function keyfind (D, E, F) {
      for (const G of F) {
        if (G.get(E - 1) === D) return G
      }
      return !1
    }
    function keydelete (D, E, F) {
      const G = []
      let H = !1
      for (let I = 0; I < F.length; I++) { !1 == H && F[I].get(E - 1) === D ? H = !0 : G.push(F[I]) }
      return G
    }
    class Variable {
      constructor (D = Symbol.for('tailored.no_value')) {
        this.default_value = D
      }
    }
    class Wildcard {
      constructor () {}
    }
    class StartsWith {
      constructor (D) {
        this.prefix = D
      }
    }
    class Capture {
      constructor (D) {
        this.value = D
      }
    }
    class HeadTail {
      constructor () {}
    }
    class Type {
      constructor (D, E = {}) {
        this.type = D, this.objPattern = E
      }
    }
    class Bound {
      constructor (D) {
        this.value = D
      }
    }
    class BitStringMatch {
      constructor (...D) {
        this.values = D
      }
      length () {
        return values.length
      }
      bit_size () {
        return 8 * this.byte_size()
      }
      byte_size () {
        let D = 0
        for (let E of this.values) {
          D += E.unit * E.size / 8
        }
        return D
      }
      getValue (D) {
        return this.values(D)
      }
      getSizeOfValue (D) {
        let E = this.getValue(D)
        return E.unit * E.size
      }
      getTypeOfValue (D) {
        return this.getValue(D).type
      }
    }
    class Tuple {
      constructor (...D) {
        this.values = Object.freeze(D), this.length = this.values.length
      }
      get (D) {
        return this.values[D]
      }
      count () {
        return this.values.length
      }
      [Symbol.iterator] () {
        return this.values[Symbol.iterator]()
      }
      toString () {
        let D, E = ''
        for (D = 0; D < this.values.length; D++) {
          E != '' && (E += ', ')
          const F = this.values[D] ? this.values[D].toString() : ''
          E += F
        }
        return '{' + E + '}'
      }
      put_elem (D, E) {
        if (D === this.length) {
          let G = this.values.concat([E])
          return new Tuple(...G)
        }
        let F = this.values.concat([])
        return F.splice(D, 0, E), new Tuple(...F)
      }
      remove_elem (D) {
        let E = this.values.concat([])
        return E.splice(D, 1), new Tuple(...E)
      }
    }
    let c = -1, d = -1
    class BitString$1 {
      constructor (...D) {
        this.value = Object.freeze(
          this.process(D)
        ), this.length = this.value.length, this.bit_size = 8 *
          this.length, this.byte_size = this.length
      }
      get (D) {
        return this.value[D]
      }
      count () {
        return this.value.length
      }
      slice (D, E = null) {
        let F = this.value.slice(D, E), G = F.map(H => BitString$1.integer(H))
        return new BitString$1(...G)
      }
      [Symbol.iterator] () {
        return this.value[Symbol.iterator]()
      }
      toString () {
        var D, E = ''
        for (D = 0; D < this.count(); D++) {
          E != '' && (E += ', '), E += this.get(D).toString()
        }
        return '<<' + E + '>>'
      }
      process (D) {
        let E = []
        var F
        for (F = 0; F < D.length; F++) {
          let G = this['process_' + D[F].type](D[F])
          for (let H of D[F].attributes) {
            G = this['process_' + H](G)
          }
          E = E.concat(G)
        }
        return E
      }
      process_integer (D) {
        return D.value
      }
      process_float (D) {
        if (D.size === 64) return BitString$1.float64ToBytes(D.value)
        if (D.size === 32) return BitString$1.float32ToBytes(D.value)
        throw new Error('Invalid size for float')
      }
      process_bitstring (D) {
        return D.value.value
      }
      process_binary (D) {
        return BitString$1.toUTF8Array(D.value)
      }
      process_utf8 (D) {
        return BitString$1.toUTF8Array(D.value)
      }
      process_utf16 (D) {
        return BitString$1.toUTF16Array(D.value)
      }
      process_utf32 (D) {
        return BitString$1.toUTF32Array(D.value)
      }
      process_signed (D) {
        return new Uint8Array([D])[0]
      }
      process_unsigned (D) {
        return D
      }
      process_native (D) {
        return D
      }
      process_big (D) {
        return D
      }
      process_little (D) {
        return D.reverse()
      }
      process_size (D) {
        return D
      }
      process_unit (D) {
        return D
      }
      static integer (D) {
        return BitString$1.wrap(D, { type: 'integer', unit: 1, size: 8 })
      }
      static float (D) {
        return BitString$1.wrap(D, { type: 'float', unit: 1, size: 64 })
      }
      static bitstring (D) {
        return BitString$1.wrap(D, {
          type: 'bitstring',
          unit: 1,
          size: D.bit_size
        })
      }
      static bits (D) {
        return BitString$1.bitstring(D)
      }
      static binary (D) {
        return BitString$1.wrap(D, { type: 'binary', unit: 8, size: D.length })
      }
      static bytes (D) {
        return BitString$1.binary(D)
      }
      static utf8 (D) {
        return BitString$1.wrap(D, { type: 'utf8', unit: 1, size: D.length })
      }
      static utf16 (D) {
        return BitString$1.wrap(D, {
          type: 'utf16',
          unit: 1,
          size: 2 * D.length
        })
      }
      static utf32 (D) {
        return BitString$1.wrap(D, {
          type: 'utf32',
          unit: 1,
          size: 4 * D.length
        })
      }
      static signed (D) {
        return BitString$1.wrap(D, {}, 'signed')
      }
      static unsigned (D) {
        return BitString$1.wrap(D, {}, 'unsigned')
      }
      static native (D) {
        return BitString$1.wrap(D, {}, 'native')
      }
      static big (D) {
        return BitString$1.wrap(D, {}, 'big')
      }
      static little (D) {
        return BitString$1.wrap(D, {}, 'little')
      }
      static size (D, E) {
        return BitString$1.wrap(D, { size: E })
      }
      static unit (D, E) {
        return BitString$1.wrap(D, { unit: E })
      }
      static wrap (D, E, F = null) {
        let G = D
        return D instanceof Object ||
          (G = { value: D, attributes: [] }), G = Object.assign(G, E), F &&
          G.attributes.push(F), G
      }
      static toUTF8Array (D) {
        for (var G, E = [], F = 0; F < D.length; F++) {
          G = D.charCodeAt(F), G < 128
            ? E.push(G)
            : G < 2048
                ? E.push(192 | G >> 6, 128 | 63 & G)
                : G < 55296 || G >= 57344
                    ? E.push(224 | G >> 12, 128 | 63 & G >> 6, 128 | 63 & G)
                    : (F++, G = 65536 +
                        ((1023 & G) << 10 | 1023 & D.charCodeAt(F)), E.push(
                        240 | G >> 18,
                        128 | 63 & G >> 12,
                        128 | 63 & G >> 6,
                        128 | 63 & G
                      ))
        }
        return E
      }
      static toUTF16Array (D) {
        for (var G, E = [], F = 0; F < D.length; F++) {
          G = D.codePointAt(F), G <= 255
            ? (E.push(0), E.push(G))
            : (E.push(255 & G >> 8), E.push(255 & G))
        }
        return E
      }
      static toUTF32Array (D) {
        for (var G, E = [], F = 0; F < D.length; F++) {
          G = D.codePointAt(F), G <= 255
            ? (E.push(0), E.push(0), E.push(0), E.push(G))
            : (E.push(0), E.push(0), E.push(255 & G >> 8), E.push(255 & G))
        }
        return E
      } // http://stackoverflow.com/questions/2003493/javascript-float-from-to-bits
      static float32ToBytes (D) {
        var E = [], F = new ArrayBuffer(4)
        new Float32Array(F)[0] = D
        let G = new Uint32Array(F)[0]
        return E.push(255 & G >> 24), E.push(255 & G >> 16), E.push(
          255 & G >> 8
        ), E.push(255 & G), E
      }
      static float64ToBytes (D) {
        var E = [], F = new ArrayBuffer(8)
        new Float64Array(F)[0] = D
        var G = new Uint32Array(F)[0], H = new Uint32Array(F)[1]
        return E.push(255 & H >> 24), E.push(255 & H >> 16), E.push(
          255 & H >> 8
        ), E.push(255 & H), E.push(255 & G >> 24), E.push(
          255 & G >> 16
        ), E.push(255 & G >> 8), E.push(255 & G), E
      }
    }
    var g = {
      Tuple,
      PID: class PID {
        constructor () {
          ++c, this.id = c
        }
        toString () {
          return 'PID#<0.' + this.id + '.0>'
        }
      },
      Reference: class Reference {
        constructor () {
          ++d, this.id = d, this.ref = Symbol()
        }
        toString () {
          return 'Ref#<0.0.0.' + this.id + '>'
        }
      },
      BitString: BitString$1
    }
    /* @flow */ const h = g.BitString, k = new Map()
    k.set(Variable.prototype, function resolveVariable () {
      return function (D, E) {
        return E.push(D), !0
      }
    }), k.set(
      Wildcard.prototype,
      resolveWildcard
    ), k.set(HeadTail.prototype, function resolveHeadTail () {
      return function (D, E) {
        if (!is_array(D) || D.length < 2) return !1
        const F = D[0], G = D.slice(1)
        return E.push(F), E.push(G), !0
      }
    }), k.set(StartsWith.prototype, function resolveStartsWith (D) {
      const E = D.prefix
      return function (F, G) {
        return is_string(F) &&
          F.startsWith(E) &&
          (G.push(F.substring(E.length)), !0)
      }
    }), k.set(Capture.prototype, function resolveCapture (D) {
      const E = buildMatch(D.value)
      return function (F, G) {
        return !!E(F, G) && (G.push(F), !0)
      }
    }), k.set(Bound.prototype, function resolveBound (D) {
      return function (E, F) {
        return typeof E === typeof D.value && E === D.value && (F.push(E), !0)
      }
    }), k.set(Type.prototype, function resolveType (D) {
      return function (E, F) {
        if (E instanceof D.type) {
          const G = buildMatch(D.objPattern)
          return G(E, F) && F.push(E) > 0
        }
        return !1
      }
    }), k.set(BitStringMatch.prototype, function resolveBitString (D) {
      let E = []
      for (let G of D.values) {
        if (is_variable(G.value)) {
          let H = getSize(G.unit, G.size)
          fillArray(E, H)
        } else { E = E.concat(new h(G).value) }
      }
      let F = D.values
      return function (G, H) {
        let I = null
        if (!is_string(G) && !(G instanceof h)) return !1
        I = is_string(G) ? new h(h.binary(G)) : G
        let J = 0
        for (let L, K = 0; K < F.length; K++) {
          if (
            (L = F[K], is_variable(L.value) &&
              L.type == 'binary' &&
              void 0 === L.size &&
              K < F.length - 1)
          ) {
            throw new Error(
              'a binary field without size is only allowed at the end of a binary pattern'
            )
          }
          let M = 0, N = [], O = []
          if (
            (M = getSize(L.unit, L.size), K === F.length - 1
              ? (N = I.value.slice(J), O = E.slice(J))
              : (N = I.value.slice(J, J + M), O = E.slice(
                  J,
                  J + M
                )), is_variable(L.value))
          ) {
            switch (L.type) {
              case 'integer':
                L.attributes && L.attributes.indexOf('signed') != -1
                  ? H.push(new Int8Array([N[0]])[0])
                  : H.push(new Uint8Array([N[0]])[0])
                break
              case 'float':
                if (M == 64) H.push(Float64Array.from(N)[0])
                else if (M == 32) H.push(Float32Array.from(N)[0])
                else return !1
                break
              case 'bitstring':
                H.push(createBitString(N))
                break
              case 'binary':
                H.push(_StringfromCharCode.apply(null, new Uint8Array(N)))
                break
              case 'utf8':
                H.push(_StringfromCharCode.apply(null, new Uint8Array(N)))
                break
              case 'utf16':
                H.push(_StringfromCharCode.apply(null, new Uint16Array(N)))
                break
              case 'utf32':
                H.push(_StringfromCharCode.apply(null, new Uint32Array(N)))
                break
              default:
                return !1
            }
          } else if (!arraysEqual(N, O)) return !1
          J += M
        }
        return !0
      }
    }), k.set(Number.prototype, function resolveNumber (D) {
      return function (E) {
        return is_number(E) && E === D
      }
    }), k.set(Symbol.prototype, function resolveSymbol (D) {
      return function (E) {
        return is_symbol(E) && E === D
      }
    }), k.set(Array.prototype, function resolveArray (D) {
      const E = D.map(F => buildMatch(F))
      return function (F, G) {
        return is_array(F) &&
          F.length == D.length &&
          F.every(function (H, I) {
            return E[I](F[I], G)
          })
      }
    }), k.set(String.prototype, function resolveString (D) {
      return function (E) {
        return is_string(E) && E === D
      }
    }), k.set(Boolean.prototype, function resolveBoolean (D) {
      return function (E) {
        return is_boolean(E) && E === D
      }
    }), k.set(Function.prototype, function resolveFunction (D) {
      return function (E) {
        return is_function(E) && E === D
      }
    }), k.set(Object.prototype, resolveObject)
    class MatchError extends Error {
      constructor (D) {
        if ((super(), typeof D === 'symbol')) {
          this.message = 'No match for: ' + D.toString()
        } else if (Array.isArray(D)) {
          let E = D.map(F => F.toString())
          this.message = 'No match for: ' + E
        } else {
          this.message = 'No match for: ' + D
        }
        this.stack = new Error().stack, this.name = this.constructor.name
      }
    }
    class Clause {
      constructor (D, E, F = () => !0) {
        this.pattern = buildMatch(
          D
        ), this.arity = D.length, this.optionals = getOptionalValues(
          D
        ), this.fn = E, this.guard = F
      }
    }
    const l = Symbol() // https://github.com/airportyh/protomorphism
    class Protocol {
      constructor (D) {
        function createFun (E) {
          return function (...F) {
            const G = F[0]
            let H = null
            if (
              (G === null && this.hasImplementation(Symbol('null'))
                ? H = this.registry.get(Symbol)[E]
                : _NumberisInteger(G) && this.hasImplementation(B.Integer)
                    ? H = this.registry.get(B.Integer)[E]
                    : typeof G === 'number' &&
                        !_NumberisInteger(G) &&
                        this.hasImplementation(B.Float)
                        ? H = this.registry.get(B.Float)[E]
                        : typeof G === 'string' &&
                            this.hasImplementation(B.BitString)
                            ? H = this.registry.get(B.BitString)[E]
                            : G &&
                                G[Symbol.for('__struct__')] &&
                                this.hasImplementation(G)
                                ? H = this.registry.get(
                                    G[Symbol.for('__struct__')].__MODULE__
                                  )[E]
                                : G !== null && this.hasImplementation(G)
                                    ? H = this.registry.get(G.constructor)[E]
                                    : this.fallback &&
                                        (H = this.fallback[E]), H != null)
            ) {
              const I = H.apply(this, F)
              return I
            }
            throw new Error(`No implementation found for ${G}`)
          }
        }
        for (const E in (this.registry = new Map(), this.fallback = null, D)) {
          this[E] = createFun(E).bind(this)
        }
      }
      implementation (D, E) {
        D === null ? this.fallback = E : this.registry.set(D, E)
      }
      hasImplementation (D) {
        return D === B.Integer || D === B.Float || D === B.BitString
          ? this.registry.has(D)
          : D && D[Symbol.for('__struct__')]
              ? this.registry.has(D[Symbol.for('__struct__')].__MODULE__)
              : this.registry.has(D.constructor)
      }
    }
    var q = {
      atom_to_binary: function atom_to_binary (D, E = Symbol.for('utf8')) {
        if (E !== Symbol.for('utf8')) { throw new Error(`unsupported encoding ${E}`) }
        return D.__MODULE__ ? Symbol.keyFor(D.__MODULE__) : Symbol.keyFor(D)
      },
      binary_to_atom,
      binary_to_existing_atom: function binary_to_existing_atom (
        D,
        E = Symbol.for('utf8')
      ) {
        return binary_to_atom(D, E)
      },
      list_concatenation: function list_concatenation (D, E) {
        return D.concat(E)
      },
      list_subtraction: function list_subtraction (D, E) {
        const F = [...D]
        for (const G of E) {
          const H = F.indexOf(G)
          H > -1 && F.splice(H, 1)
        }
        return F
      },
      plus: function plus (D, E) {
        return E ? D + E : +D
      },
      minus: function minus (D, E) {
        return E ? D - E : -D
      },
      multiply: function multiply (D, E) {
        return D * E
      },
      div: function div (D, E) {
        return D / E
      },
      equal: function equal (D, E) {
        return D == E
      },
      greaterThan: function greaterThan (D, E) {
        return D > E
      },
      greaterThanOrEqualTo: function greaterThanOrEqualTo (D, E) {
        return D >= E
      },
      lessThan: function lessThan (D, E) {
        return D < E
      },
      lessThanOrEqualTo: function lessThanOrEqualTo (D, E) {
        return D <= E
      },
      doesNotEqual: function doesNotEqual (D, E) {
        return D != E
      },
      strictlyEqual: function strictlyEqual (D, E) {
        return D === E
      },
      doesNotStrictlyEqual: function doesNotStrictlyEqual (D, E) {
        return D !== E
      },
      and: function and (D, E) {
        return D && E
      },
      or: function or (D, E) {
        return D || E
      },
      not: function not (D) {
        return !D
      },
      rem: function rem (D, E) {
        return D % E
      },
      band: function band (D, E) {
        return D & E
      },
      bor: function bor (D, E) {
        return D | E
      },
      bsl: function bsl (D, E) {
        return D << E
      },
      bsr: function bsr (D, E) {
        return D >> E
      },
      bxor: function bxor (D, E) {
        return D ^ E
      },
      bnot: function bnot (D) {
        return ~D
      },
      is_bitstring: function is_bitstring$1 (D) {
        return D instanceof g.BitString
      },
      is_boolean: function is_boolean$1 (D) {
        return typeof D === 'boolean' || D instanceof Boolean
      },
      is_float: function is_float (D) {
        return is_number$1(D) && !_NumberisInteger(D)
      },
      is_function: function is_function$1 (D) {
        return typeof D === 'function' || D instanceof Function
      },
      is_integer: function is_integer (D) {
        return _NumberisInteger(D)
      },
      is_list: function is_list (D) {
        return Array.isArray(D)
      },
      is_map: function is_map (D) {
        return typeof D === 'object' || D instanceof Object
      },
      is_number: is_number$1,
      is_pid: function is_pid (D) {
        return D instanceof g.PID
      },
      is_port: function is_port () {
        return !1
      },
      is_reference: function is_reference (D) {
        return D instanceof g.Reference
      },
      is_tuple: function is_tuple (D) {
        return D instanceof g.Tuple
      },
      is_atom: function is_atom (D) {
        return typeof D === 'symbol' || D instanceof Symbol || D.__MODULE__
      },
      is_binary: function is_binary (D) {
        return typeof D === 'string' || D instanceof String
      },
      element: function element (D, E) {
        return E.get(D - 1)
      },
      setelement: function setelement (D, E, F) {
        const G = [...E.data]
        return G[D - 1] = F, new g.Tuple(...G)
      },
      make_tuple: function make_tuple (D, E) {
        const F = []
        for (let G = 0; G < D; G++) {
          F.push(E)
        }
        return new g.Tuple(...F)
      },
      insert_element: function insert_element (D, E, F) {
        const G = [...E.data]
        return G.splice(D - 1, 0, F), new g.Tuple(...G)
      },
      append_element: function append_element (D, E) {
        const F = [...D.data, E]
        return new g.Tuple(...F)
      },
      delete_element: function delete_element (D, E) {
        const F = [...E.data]
        return F.splice(D - 1, 1), new g.Tuple(...F)
      },
      tuple_to_list: function tuple_to_list (D) {
        const E = [...D.data]
        return E
      }
    } // http://erlang.org/doc/man/maps.html
    const r = Symbol.for('ok'),
      t = Symbol.for('error'),
      u = Symbol.for('badmap'),
      w = Symbol.for('badkey'),
      A = (function get_global () {
        return typeof self === 'undefined'
          ? typeof window === 'undefined'
              ? typeof global === 'undefined'
                  ? (console.warn('No global state found'), null)
                  : global
              : window
          : self
      })()
    A.__elixirscript_store__ = new Map(), A.__elixirscript_names__ = new Map()
    var B = {
      Tuple: g.Tuple,
      PID: g.PID,
      BitString: g.BitString,
      Patterns: {
        defmatch: function defmatch (...D) {
          const E = getArityMap(D)
          return function (...F) {
            let [G, H] = findMatchingFunction(F, E)
            return G.apply(this, H)
          }
        },
        match: function match (D, E, F = () => !0) {
          let G = [], H = buildMatch(D)
          if (H(E, G) && F.apply(this, G)) return G
          throw (console.error('No match for:', E), new MatchError(E))
        },
        MatchError,
        variable: function variable (D = Symbol.for('tailored.no_value')) {
          return new Variable(D)
        },
        wildcard: function wildcard () {
          return new Wildcard()
        },
        startsWith: function startsWith (D) {
          return new StartsWith(D)
        },
        capture: function capture (D) {
          return new Capture(D)
        },
        headTail: function headTail () {
          return new HeadTail()
        },
        type: function type (D, E = {}) {
          return new Type(D, E)
        },
        bound: function bound (D) {
          return new Bound(D)
        },
        Clause,
        clause: function clause (D, E, F = () => !0) {
          return new Clause(D, E, F)
        },
        bitStringMatch: function bitStringMatch (...D) {
          return new BitStringMatch(...D)
        },
        match_or_default,
        defmatchgen,
        list_comprehension: function list_comprehension (D, E) {
          const F = run_generators(E.pop()(), E)
          let G = []
          for (let H of F) {
            D.guard.apply(this, H) && G.push(D.fn.apply(this, H))
          }
          return G
        },
        list_generator: function list_generator (D, E) {
          return function () {
            let F = []
            for (let G of E) {
              const H = match_or_default(D, G, () => !0, l)
              if (H != l) {
                const [I] = H
                F.push(I)
              }
            }
            return F
          }
        },
        bitstring_generator: function bitstring_generator (D, E) {
          return function () {
            let F = [], G = E.slice(0, D.byte_size()), H = 1
            for (; G.byte_size == D.byte_size();) {
              const I = match_or_default(D, G, () => !0, l)
              I != l && F.push(I), G = E.slice(
                D.byte_size() * H,
                D.byte_size() * (H + 1)
              ), H++
            }
            return F
          }
        },
        bitstring_comprehension: function bitstring_comprehension (D, E) {
          const F = run_generators(E.pop()(), E)
          let G = []
          for (let H of F) { D.guard.apply(this, H) && G.push(D.fn.apply(this, H)) }
          return G = G.map(H => g.BitString.integer(H)), new g.BitString(...G)
        },
        defmatchGen: function defmatchGen (...D) {
          return defmatchgen(...D)
        },
        defmatchAsync: function defmatchAsync (...D) {
          const E = getArityMap(D)
          return async function (...F) {
            if (E.has(F.length)) {
              const G = E.get(F.length)
              let H = null, I = null
              for (let J of G) {
                let K = []
                if (
                  (F = fillInOptionalValues(F, J.arity, J.optionals), J.pattern(
                    F,
                    K
                  ) &&
                    (await J.guard.apply(this, K)))
                ) {
                  H = J.fn, I = K
                  break
                }
              }
              if (!H) {
                throw (console.error('No match for:', F), new MatchError(F))
              }
              return H.apply(this, I)
            }
            throw (console.error(
              'Arity of',
              F.length,
              'not found. No match for:',
              F
            ), new MatchError(F))
          }
        }
      },
      Integer: class Integer {},
      Float: class Float {},
      Functions: {
        call_property: function call_property (D, E) {
          if (!E) return D instanceof Function ? D() : D
          let F = null
          if (
            (typeof D === 'number' ||
              typeof D === 'symbol' ||
              typeof D === 'boolean' ||
              typeof D === 'string'
              ? void 0 === D[E]
                  ? void 0 !== D[Symbol.for(E)] && (F = Symbol.for(E))
                  : F = E
              : E in D
                  ? F = E
                  : Symbol.for(E) in D && (F = Symbol.for(E)), F === null)
          ) {
            throw new Error(`Property ${E} not found in ${D}`)
          }
          return D[F] instanceof Function ? D[F]() : D[F]
        },
        defprotocol: function defprotocol (D) {
          return new Protocol(D)
        },
        defimpl: function defimpl (D, E, F) {
          D.implementation(E, F)
        },
        build_namespace: function build_namespace (D, E) {
          let F = E.split('.')
          const G = D
          let H = D
          F[0] === 'Elixir' && (F = F.slice(1))
          for (const I of F) {
            typeof H[I] === 'undefined' && (H[I] = {}), H = H[I]
          }
          return G.__table__ = D.__table__ || {}, G.__table__[
            Symbol.for(E)
          ] = H, H
        },
        iterator_to_reducer
      },
      SpecialForms: {
        _case: function _case (D, E) {
          return B.Patterns.defmatch(...E)(D)
        },
        cond: function cond (...D) {
          for (const E of D) { if (E[0]) return E[1]() }
          throw new Error()
        },
        _for: function _for (D, E, F, G = []) {
          let [H, I] = F.into(G)
          const J = run_list_generators(E.pop()(), E)
          for (const K of J) {
            D.guard.apply(this, K) &&
              (H = I(H, new B.Tuple(Symbol.for('cont'), D.fn.apply(this, K))))
          }
          return I(H, Symbol.for('done'))
        },
        _try: function _try (D, E, F, G, H) {
          let I = null
          try {
            I = D()
          } catch (J) {
            let K = null
            if (E) {
              try {
                return K = E(J), K
              } catch (L) {
                if (L instanceof B.Patterns.MatchError) throw L
              }
            }
            if (F) {
              try {
                return K = F(J), K
              } catch (L) {
                if (L instanceof B.Patterns.MatchError) throw L
              }
            }
            throw J
          } finally {
            H && H()
          }
          if (G) {
            try {
              return G(I)
            } catch (J) {
              if (J instanceof B.Patterns.MatchError) {
                throw new Error('No Match Found in Else')
              }
              throw J
            }
          } else {
            return I
          }
        },
        _with: function _with (...D) {
          let E = [], F = null, G = null
          typeof D[D.length - 2] === 'function'
            ? [F, G] = D.splice(-2)
            : F = D.pop()
          for (let H = 0; H < D.length; H++) {
            const [I, J] = D[H],
              K = J(...E),
              L = B.Patterns.match_or_default(I, K)
            if (L == null) return G ? G.call(null, K) : K
            E = E.concat(L)
          }
          return F(...E)
        },
        receive: function receive () {
          console.warn('Receive not supported')
        }
      },
      global: A,
      erlang: q,
      maps: {
        find: function find (D, E) {
          if (!1 === q.is_map(E)) return new g.Tuple(u, E)
          const F = E[D]
          return typeof F === 'undefined' ? t : new g.Tuple(r, F)
        },
        fold: function fold (D, E, F) {
          let G = E
          for (const [H, I] of Object.entries(F)) {
            G = D(H, I, G)
          }
          return G
        },
        remove: function remove (D, E) {
          if (!1 === q.is_map(E)) return new g.Tuple(u, E)
          const F = Object.assign({}, E)
          return delete F[D], F
        },
        to_list: function to_list (D) {
          return !1 === q.is_map(D)
            ? new g.Tuple(u, D)
            : Object.entries(D).map(E => {
              return g.Tuple(...E)
            })
        },
        from_list: function from_list (D) {
          return D.reduce(
            (E, F) => {
              const [G, H] = F
              return E[G] = H, E
            },
            {}
          )
        },
        keys: function keys (D) {
          return !1 === q.is_map(D) ? new g.Tuple(u, D) : Object.keys(D)
        },
        values: function values$1 (D) {
          return !1 === q.is_map(D) ? new g.Tuple(u, D) : Object.values(D)
        },
        is_key,
        put: function put (D, E, F) {
          if (!1 === q.is_map(F)) return new g.Tuple(u, F)
          const G = Object.assign({}, F, { [D]: E })
          return G
        },
        merge: function merge (D, E) {
          return !1 === q.is_map(D)
            ? new g.Tuple(u, D)
            : !1 === q.is_map(E) ? new g.Tuple(u, E) : Object.assign({}, D, E)
        },
        update: function update (D, E, F) {
          return !1 === q.is_map(F)
            ? new g.Tuple(u, F)
            : !1 === is_key(D)
                ? new g.Tuple(w, D)
                : Object.assign({}, F, { [D]: E })
        },
        get: function get (...D) {
          const E = D[0], F = D[1]
          return !1 === q.is_map(F)
            ? new g.Tuple(u, F)
            : is_key(E) ? F[E] : D.length === 3 ? D[2] : new g.Tuple(w, E)
        },
        take: function take (D, E) {
          if (!1 === q.is_map(E)) return new g.Tuple(u, E)
          if (!is_key(D)) return t
          const F = E[D], G = Object.assign({}, E)
          return delete G[D], new g.Tuple(F, G)
        }
      },
      lists: {
        reverse,
        foreach: function foreach (D, E) {
          return E.forEach(F => D(F)), Symbol.for('ok')
        },
        duplicate: function duplicate (D, E) {
          const F = []
          for (; F.length < D;) {
            F.push(E)
          }
          return F
        },
        flatten,
        foldl,
        foldr: function foldr (D, E, F) {
          return foldl(D, E, reverse(F))
        },
        keydelete,
        keyfind,
        keymember: function keymember (D, E, F) {
          return !1 !== keyfind(D, E, F)
        },
        keyreplace: function keyreplace (D, E, F, G) {
          const H = [...F]
          for (let I = 0; I < H.length; I++) {
            if (H[I].get(E - 1) === D) return H[I] = G, H
          }
          return H
        },
        keysort: function keysort (D, E) {
          const F = [...E]
          return F.sort((G, H) => {
            return G.get(D - 1) < H.get(D - 1)
              ? -1
              : G.get(D - 1) > H.get(D - 1) ? 1 : 0
          })
        },
        keystore: function keystore (D, E, F, G) {
          const H = [...F]
          for (let I = 0; I < H.length; I++) {
            if (H[I].get(E - 1) === D) return H[I] = G, H
          }
          return H.concat(G)
        },
        keytake: function keytake (D, E, F) {
          const G = keyfind(D, E, F)
          return !1 !== G && new g.Tuple(G.get(E - 1), G, keydelete(D, E, F))
        },
        mapfoldl: function mapfoldl (D, E, F) {
          const G = []
          let H = E
          for (const I of F) {
            const J = D(I, H)
            G.push(J.get(0)), H = J.get(1)
          }
          return new g.Tuple(G, H)
        },
        concat: function concat (D) {
          return D.map(E => E.toString()).join()
        },
        map: function map (D, E) {
          return E.map(F => D(F))
        },
        filter: function filter (D, E) {
          return E.filter(F => D(F))
        },
        filtermap: function filtermap (D, E) {
          const F = []
          for (const G of E) {
            const H = D(G)
            !0 === H
              ? F.push(G)
              : H instanceof g.Tuple && !0 === H.get(0) && F.push(H.get(1))
          }
          return F
        },
        member: function member (D, E) {
          for (const F of E) {
            if (F === D) return !0
          }
          return !1
        },
        all: function all (D, E) {
          for (const F of E) {
            if (!1 === D(F)) return !1
          }
          return !0
        },
        any: function any (D, E) {
          for (const F of E) {
            if (!0 === D(F)) return !0
          }
          return !1
        },
        splitwith: function splitwith (D, E) {
          let F = !1
          const G = [], H = []
          for (const I of E) {
            !0 == F ? H.push(I) : !0 === D(I) ? G.push(I) : (F = !0, H.push(I))
          }
          return new g.Tuple(G, H)
        },
        sort: function sort (...D) {
          if (D.length === 1) {
            const G = [...D[0]]
            return G.sort()
          }
          const E = D[0], F = [...D[1]]
          return F.sort((G, H) => {
            const I = E(G, H)
            return !0 === I ? -1 : 1
          })
        }
      }
    }
    return { Core: B }
  })();

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory()
  } else {
    root.Elixir = factory()
  }
})(this, function () {
  const Elixir = {}

  Elixir.__table__ = {}

  Elixir.start = function (app, args) {
    app.__load(Elixir).start(Symbol.for('normal'), args)
  }

  Elixir.load = function (module) {
    return module.__load(Elixir)
  }

  Bootstrap.Core.Functions.build_namespace(
    Elixir,
    'Elixir.App'
  ).__load = function (Elixir) {
    if (Elixir.App.__exports) return Elixir.App.__exports

    function start (...__function_args__) {
      let __arg_matches__ = null

      if (
        (__arg_matches__ = Bootstrap.Core.Patterns.match_or_default(
          [
            Bootstrap.Core.Patterns.variable(),
            Bootstrap.Core.Patterns.variable()
          ],
          __function_args__,
          (_0, _1) => {
            return true
          }
        )) !== null
      ) {
        const [_0, _1] = __arg_matches__

        let [html0] = Bootstrap.Core.Patterns.match(
          Bootstrap.Core.Patterns.variable(),
          Elixir.MyView.__load(Elixir).render({})
        )

        return Bootstrap.Core.Functions
          .call_property(Bootstrap.Core.global, 'console')
          .log(html0)
      }

      throw new Bootstrap.Core.Patterns.MatchError(__function_args__)
    }

    const __exports = {
      start,
      __MODULE__: Symbol.for('Elixir.App')
    }

    Elixir.App.__exports = __exports

    return __exports
  }

  Bootstrap.Core.Functions.build_namespace(
    Elixir,
    'Elixir.MyView'
  ).__load = function (Elixir) {
    if (Elixir.MyView.__exports) return Elixir.MyView.__exports

    function render (...__function_args__) {
      let __arg_matches__ = null

      if (
        (__arg_matches__ = Bootstrap.Core.Patterns.match_or_default(
          [Bootstrap.Core.Patterns.variable()],
          __function_args__,
          _0 => {
            return true
          }
        )) !== null
      ) {
        const [_0] = __arg_matches__;

        ('Hello')

        1

        2

        return 3
      }

      throw new Bootstrap.Core.Patterns.MatchError(__function_args__)
    }

    const __exports = {
      render,
      __MODULE__: Symbol.for('Elixir.MyView')
    }

    Elixir.MyView.__exports = __exports

    return __exports
  }

  return Elixir
})
