/*
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

/**
// JSON Support
//
// TODO:
//   - don't output default classes
//   - don't output transient properties
//   - pretty printing
//   - allow for custom Property JSON support
//   - compact output
//   - reading shortNames
//   - date support
*/

/**
  A short-name is an optional shorter name for a property.
  It is used by foam.json.Outputer when 'useShortNames'
  is enabled. Short-names enable JSON output to be smaller,
  which can save disk space and/or network bandwidth.
  Ex.
<pre>
  properties: [
    { name: 'firstName', shortName: 'fn' },
    { name: 'lastName',  shortName: 'ln' }
  ]
</pre>
*/
foam.CLASS({
  refines: 'foam.core.Property',

  properties: [
    { class: 'String', name: 'shortName' }
  ]
});


foam.CLASS({
  refines: 'foam.core.FObject',

  methods: [
    function toJSON() {
      return foam.json.Outputer.create({nlStr:null, postColonStr:null, indentStr:null}).stringify(this);
    }
  ]
});


foam.CLASS({
  package: 'foam.json',
  name: 'Outputer',

  properties: [
    {
      class: 'String',
      name: 'buf_',
      value: ''
    },
    {
      class: 'Int',
      name: 'indentLevel_',
      value: 0
    },
    {
      class: 'String',
      name: 'indentStr',
      value: '\t'
    },
    {
      class: 'String',
      name: 'nlStr',
      value: '\n'
    },
    {
      class: 'String',
      name: 'postColonStr',
      value: ' '
    },
    {
      class: 'Boolean',
      name: 'alwaysQuoteKeys',
      value: false
    },
    {
      class: 'Boolean',
      name: 'outputDefaultValues',
      value: false
    },
    {
      class: 'Function',
      name: 'propertyPredicate',
      value: function(o, p) { return ! p.transient; }
    },
    {
      class: 'Boolean',
      name: 'useShortNames',
      value: false
    },
    {
      class: 'Boolean',
      name: 'pretty',
      value: true,
      postSet: function(_, p) {
        if ( p ) {
          this.clearProperty('indentStr');
          this.clearProperty('nlStr');
          this.clearProperty('postColonStr');
          this.clearProperty('useShortNames');
        } else {
          this.indentStr = this.nlStr = this.postColonStr = null;
        }
      }
    }
    /*
    {
      class: 'Boolean',
      name: 'functionFormat',
      value: false
    },
    */
  ],

  methods: [
    function reset() {
      this.indentLevel_ = 0;
      this.buf_ = '';
      return this;
    },

    function escape(str) {
      return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/[\x00-\x1f]/g, function(c) {
          return "\\u00" + ((c.charCodeAt(0) < 0x10) ?
                            '0' + c.charCodeAt(0).toString(16) :
                            c.charCodeAt(0).toString(16));
        });
    },

    function maybeEscapeKey(str) {
      return this.alwaysQuoteKeys || ! /^[a-zA-Z\$_][0-9a-zA-Z$_]*$/.test(str) ?
          '"' + str + '"' :
          str ;
    },

    function out() {
      for ( var i = 0 ; i < arguments.length ; i++ ) this.buf_ += arguments[i];
      return this;
    },

    function start(c) {
      if ( c ) this.out(c).nl();
      if ( this.indentStr ) {
        this.indentLevel_++;
        this.indent();
      }
      return this;
    },

    function end(c) {
      if ( this.indent ) {
        this.indentLevel_--;
      }
      if ( c ) this.indent().out(c);
      return this;
    },

    function nl() {
      if ( this.nlStr && this.nlStr.length ) {
        this.out(this.nlStr);
      }
      return this;
    },

    function indent() {
      for ( var i = 0 ; i < this.indentLevel_ ; i++ ) this.out(this.indentStr);
      return this;
    },

    function isDefaultValue(o, p) {
      if ( typeof p.value === 'undefined' ) return false;
      return ( ! o.hasOwnProperty(p.name) ) || foam.util.compare(p.value, p.get(o));
    },

    function outputPropertyName(p) {
      this.out(this.maybeEscapeKey(this.useShortNames && p.shortName ? p.shortName : p.name));
      return this;
    },

    function outputProperty(o, p) {
      if ( ! this.propertyPredicate(o, p ) ) return;
      if ( ! this.outputDefaultValues && this.isDefaultValue(o, p) ) return;

      var v = o[p.name];
      if ( Array.isArray(v) && ! v.length ) return;

      this.out(',').nl().indent().outputPropertyName(p).out(':', this.postColonStr);
      this.output(v);
    },

    {
      name: 'output',
      code: foam.mmethod({
        Undefined: function(o) { this.out('undefined'); },
        Null:      function(o) { this.out('null'); },
        String:    function(o) { this.out('"', this.escape(o), '"'); },
        Number:    function(o) { this.out(o); },
        Boolean:   function(o) { this.out(o); },
        Function:  function(o) { this.out(o); },
        FObject:   function(o) {
          this.start('{');
          this.out(
              this.maybeEscapeKey('class'),
              ':',
              this.postColonStr,
              '"',
              o.cls_.id,
              '"');
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);
          for ( var i = 0 ; i < ps.length ; i++ ) {
            this.outputProperty(o, ps[i]);
          }
          this.nl().end('}');
        },
        Array:     function(o) {
          this.start('[');
          for ( var i = 0 ; i < o.length ; i++ ) {
            this.output(o[i], this);
            if ( i < o.length -1 ) this.out(',').nl().indent();
          }
          this.nl();
          this.end(']')
        },
        Object:    function(o) {
          if ( o.outputJSON2 ) {
            o.outputJSON2(this)
          } else {
            this.out('undefined');
          }
        }
      })
    },

    function stringify(o) {
      this.output(o);
      var ret = this.buf_;
      this.reset(); // reset to avoid retaining garbage
      return ret;
    }
  ]
});


foam.LIB({
  name: 'foam.json',

  constants: {

    Pretty: foam.json.Outputer.create(),

    Strict: foam.json.Outputer.create({
      pretty: false,
      alwaysQuoteKeys: true
    }),

    PrettyStrict: foam.json.Outputer.create({
      alwaysQuoteKeys: true
    }),

    Compact: foam.json.Outputer.create({
      pretty: false,
      outputDefaultValues: false
    }),

    Short: foam.json.Outputer.create({
      pretty: false,
      outputDefaultValues: false,
      useShortNames: true
    }),

    Network: foam.json.Outputer.create({
      pretty: false,
      outputDefaultValues: false,
      useShortNames: true,
      propertyPredicate: function(o, p) { return ! p.networkTransient; }
    }),

    Storage: foam.json.Outputer.create({
      pretty: false,
      outputDefaultValues: false,
      useShortNames: true,
      propertyPredicate: function(o, p) { return ! p.storageTransient; }
    })
  },

  methods: [
    function parse(json, opt_class) {
      // recurse into sub-objects
      for ( var key in json ) {
        var o = json[key];
        if ( typeof o === 'object' && ! o.cls_ ) { // traverse plain old objects only
          json[key] = this.parse(o);
        }
      }

      if ( json.class ) {
        var cls = foam.lookup(json.class);
        foam.X.assert(cls, 'Unknown class "', json.class, '" in foam.json.parse.');
        return cls.create(json);
      }
      if ( opt_class ) return opt_class.create(json);

      return json;
    },

    function parseArray(a, opt_class) {
      return a.map(function(e) { return foam.json.parse(e, opt_class); });
    },

    function parseString(jsonStr) {
      return eval('(' + jsonStr + ')');
    },

    function stringify(o) {
      return foam.json.Outputer.create({nlStr:null, postColonStr:null, indentStr:null}).stringify(o);
    }
  ]
});
