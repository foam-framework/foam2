/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.web',
  name: 'URLState',

  documentation: `A URL-based strategy for storing application state in the URL
      hash. Produces hashes of the form:

      #<path>?<key1>=<value1>&<key2>=<value2>...

      All parts are URI-encoded. The "path" is intended as a top-level
      description what view/controller the application is rendering. Keys and
      values additional state bindings to be reflected in the URL hash.`,

  requires: [
    'foam.json.Outputter',
    'foam.json.Parser'
  ],
  imports: [ 'warn', 'window' ],

  classes: [
    {
      name: 'URICoderWindow',

      documentation: `Provide a window that fakes exactly the parts of the
          massive window interface that are used by foam.web.URLState except
          URI encode/decode. This is used to generate stateful URLs without
          affecting the current page. E.g.:

           foam.web.URLState.create(null, someContext.createSubContext({
             window: foam.web.URLState.URICoderWindow.create(
                 null, contextContainingRealWindow)
           }));`,

      imports: [ 'window' ],

      properties: [ [ 'location', { hash: '' } ] ],
      methods: [
        function addEventListener() {},
        function encodeURIComponent(component) {
          return this.window.encodeURIComponent(component);
        },
        function decodeURIComponent(component) {
          return this.window.decodeURIComponent(component);
        }
      ]
    }
  ],

  properties: [
    {
      name: 'serializer',
      documentation: 'Implementer of stringify(value) for value serialization.',
      factory: function() {
        return this.Outputter.create({ strict: true });
      }
    },
    {
      name: 'deserializer',
      documentation: `Implementer of parseString(str) for value
          deserialization.`,
      factory: function() {
        return this.Parser.create({
          strict: true,
          creationContext: this.__subContext__
        });
      }
    },
    {
      name: 'bindingsMap_',
      documentation: 'Map of {<key>: foam.core.Slot} comprising state.',
      factory: function() { return {}; }
    },
    {
      name: 'subMap_',
      documentation: `Map of {<key>: <event subscription>} parallel to
          bindingsMap_.`,
      factory: function() { return {}; }
    },
    {
      name: 'unboundMap_',
      documentation: `Map of {<key>: <deserialized value>} that contains
          bindings loaded from hash, but not bound to a foam.core.Slot.`,
      factory: function() { return {}; }
    },
    {
      class: 'String',
      documentation: `"path" part of hash; hash is:
          "#<path>?<key1>=<value1>&<key2>=<value2>..."`,
      name: 'path_',
      postSet: function(old, nu) {
        if ( old !== nu ) this.onStateChange();
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.hashToState_();
      this.window.addEventListener('hashchange', this.onHashChange);
    },
    function getPath() { return this.path_; },
    function setPath(path) { return this.path_ = path; },
    function getSlot(name) {
      return this.bindingsMap_[name] || null;
    },
    function addBinding(name, slot) {
      if ( this.bindingsMap_.hasOwnProperty(name) ) {
        this.warn('Overwriting URLState:', name, this.bindingsMap_[name],
                  'with', slot);
        this.subMap_[name].detach();
      }
      if ( this.unboundMap_.hasOwnProperty(name) ) {
        slot.set(this.unboundMap_[name]);
        delete this.unboundMap_[name];
      }
      this.bindingsMap_[name] = slot;
      this.subMap_[name] = slot.sub(this.onStateChange);
      this.onStateChange();
    },
    function removeBinding(name) {
      if ( ! this.bindingsMap_.hasOwnProperty(name) ) return;
      this.subMap_[name].detach();
      delete this.subMap_[name];
      delete this.bindingsMap_[name];
      this.onStateChange();
    },
    function clearBindings() {
      var subMap = this.subMap_;
      for ( var key in subMap ) {
        if ( ! subMap.hasOwnProperty(key) ) continue;
        subMap[key].detach();
      }
      this.subMap_ = {};
      this.bindingsMap_ = {};
      this.unboundMap_ = {};
      this.onStateChange();
    },
    function stateToHash_() {
      var hash = '#' + this.path_ + '?';
      var bindingsMap = this.bindingsMap_;
      var first = true;
      var value;
      for ( var key in bindingsMap ) {
        if ( ! bindingsMap.hasOwnProperty(key) ) continue;

        if ( ! first ) hash += '&';
        first = false;

        value = this.serializer.stringify(bindingsMap[key].get());
        hash += key + '=' + this.window.encodeURIComponent(value);
      }

      var unboundMap = this.unboundMap_;
      for ( var key in unboundMap ) {
        if ( ! unboundMap.hasOwnProperty(key) ) continue;
        value = this.serializer.stringify(unboundMap[key]);
        hash += '&' + key + '=' + this.window.encodeURIComponent(value);
      }

      this.window.location.hash = hash;
    },
    function hashToState_() {
      var hash = this.window.location.hash;
      var res = this.hashGrammar.parseString(hash, 'hash');
      foam.assert(res, 'Invalid URLState hash: ' + hash);

      this.path_ = this.window.decodeURIComponent(res.path);
      var bindingsMap = this.bindingsMap_;
      var bindings = res.bindings;
      for ( var i = 0; i < bindings.length; i++ ) {
        var binding = bindings[i];
        var key = this.window.decodeURIComponent(binding.key);
        var value = this.deserializer.parseString(
            this.window.decodeURIComponent(binding.value));
        if ( bindingsMap.hasOwnProperty(key) ) {
          if ( ! foam.util.equals(bindingsMap[key].get(), value) )
            bindingsMap[key].set(value);
        } else {
          this.unboundMap_[key] = value;
        }
      }
    }
  ],

  listeners: [
    function onHashChange() { this.hashToState_(); },
    {
      name: 'onStateChange',
      isMerged: true,
      mergeDelay: 150,
      code: function() { this.stateToHash_(); }
    }
  ],

  grammars: [
    {
      name: 'hashGrammar',
      language: 'foam.parse.json.Parsers',
      symbols: function() {
        return {
          hash: optional(
              seq('#', optional(sym('path')),
                  optional(seq1(1, '?', repeat(sym('binding'), '&'))))),
          path: str(repeat(notChars('?'))),
          binding: seq(sym('key'), optional(seq1(1, '=', sym('value')))),
          key: str(plus(notChars('=&'))),
          value: str(plus(notChars('=&')))
        };
      },
      actions: [
        function binding(v) { return { key: v[0], value: v[1] }; },
        function hash(v) {
          return { path: v && v[1] || '' , bindings: v && v[2] || [] };
        }
      ]
    }
  ]
});
