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
//   - don't output default values (optionally)
//   - don't output default classes
//   - quote keys when required
//   - escape values
//   - don't output transient properties
//   - pretty printing
//   - property filtering
//   - allow for custom Property JSON support
//   - compact output
//   -
*/

foam.CLASS({
  refines: 'foam.core.FObject',

  methods: [
    function toJSON() {
      return foam.json.stringify(this);
    },
    function outputJSON(out, opt_options) {
      out('{class:"', this.cls_.id, '"');
      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var p = ps[i];
        out(',', p.name, ':');
        foam.json.output(this[p.name], out);
      }
      out('}');
    }/*,
    function toJSON2() {
      return foam.json.Outputer.create().out(this).toString();
    },
    function outputJSON2(o) {
      o.start('{');
      o.out('class:"', this.cls_.id, '"');
      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var p = ps[i];
        o.out(',').nl().out(p.name, ':');
        o.output(this[p.name]);
      }
      o.nl().end('}');
    }
    */
  ]
});


foam.LIB({
  name: 'foam.json',

  methods: [
    function createOut() {
      var buf = '';
      function out() {
        for ( var i = 0 ; i < arguments.length ; i++ ) buf += arguments[i];
      }
      out.toString = function() { return buf; };
      return out;
    },

    {
      name: 'output',
      code: foam.mmethod({
        Undefined: function(o, out) { out('undefined'); },
        Null:      function(o, out) { out('null'); },
        String:    function(o, out) { out('"', o, '"'); },
        Number:    function(o, out) { out(o); },
        Boolean:   function(o, out) { out(o); },
        Function:  function(o, out) { out(o); },
        FObject:   function(o, out) { o.outputJSON(out); },
        Array:     function(o, out) {
          out('[');
          for ( var i = 0 ; i < o.length ; i++ ) {
            this.output(o[i], out);
            if ( i < o.length -1 ) out(',');
          }
          out(']');
        },
        Object:    function(o, out) {
          if ( o.outputJSON ) {
            o.outputJSON(out)
          } else {
            out('undefined');
          }
        }
      })
    },

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

    function stringify(o, opt_options) {
      var out = this.createOut();
      this.output(o, out);
      return out.toString();
    }
  ]
});



foam.LIB({
  package: 'foam.json',
  name: 'Outputer',

  properties: [
    {
      class: 'String',
      name: 'buf_',
      value: ''
    },
    {
      class: 'String',
      name: 'indent',
      value: '  '
    },
    {
      class: 'Int',
      name: 'indentLevel',
      value: 0
    },
    {
      class: 'String',
      name: 'newline',
      value: '\n'
    },
    {
      class: 'Boolean',
      name: 'pretty',
      value: true
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
      class: 'Boolean',
      name: 'outputTransientProperties',
      value: false
    },
    /*
    {
      class: 'Boolean',
      name: 'useShortNames',
      value: false
    },
    */
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
      this.indentLevel = 0;
      this.buf_ = '';
      return this;
    },

    function out() {
      for ( var i = 0 ; i < arguments.length ; i++ ) buf_ += arguments[i];
      return this;
    },

    function start(c) {
      if ( c ) this.out(c);
      if ( this.indent ) {
        this.indentLevel++;
        for ( var i = 0 ; i < this.indentLevel ; i++ ) this.out(this.indent);
      }
      return this;
    },

    function end(c) {
      if ( c ) this.out(c);
      if ( this.indent ) {
        this.indentLevel--;
      }
      return this.nl();
    },

    function nl() {
      if ( this.nl && this.nl.length ) this.out(this.nl);
      return this;
    },

    {
      name: 'output',
      code: foam.mmethod({
        Undefined: function(o) { this.out('undefined'); },
        Null:      function(o) { this.out('null'); },
        String:    function(o) { this.out('"', o, '"'); },
        Number:    function(o) { this.out(o); },
        Boolean:   function(o) { this.out(o); },
        Function:  function(o) { this.out(o); },
        FObject:   function(o) { o.outputJSON2(this); },
        Array:     function(o) {
          this.start('[');
          for ( var i = 0 ; i < o.length ; i++ ) {
            this.output(o[i], this);
            if ( i < o.length -1 ) this.out(',').nl();
          }
          this.end(']')
        },
        Object:    function(o) {
          if ( o.outputJSON ) {
            o.outputJSON(this)
          } else {
            this.out('undefined');
          }
        }
      })
    },

    function stringify(o) {
      this.reset().output(o, out).toString();
    },

    function toString() {
      return this.buf;
    }
  ]
});
