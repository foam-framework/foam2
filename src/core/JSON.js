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
      var out = foam.json.Outputer.create();
      out.output(this);
      return out.toString();
    },
    function outputJSON2(o) {
      o.start('{');
      o.out(o.escapeKey('class'), ':"', this.cls_.id, '"');
      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var p = ps[i];
        o.out(',').nl().ind().out(o.escapeKey(p.name), ':');
        o.output(this[p.name]);
      }
      o.nl().end('}');
    }*/
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

    function parse(json, opt_class, opt_X) {
      // recurse into sub-objects
      for ( var key in json ) {
        var o = json[key];
        if ( typeof o === 'object' && ! o.cls_ ) { // traverse plain old objects only
          json[key] = this.parse(o, null, opt_X);
        }
      }

      if ( json.class ) {
        var cls = foam.lookup(json.class);
        foam.X.assert(cls, 'Unknown class "', json.class, '" in foam.json.parse.');
        return cls.create(json, opt_X);
      }
      if ( opt_class ) return opt_class.create(json, opt_X);

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

    {
      name: 'escapeKey',
      code: foam.Function.memoize1(function(str) {
        return /^[a-zA-Z\$_][0-9a-zA-Z$_]*$/.test(str) ?
          str :
          '"' + str + '"';
      })
    },

    function out() {
      for ( var i = 0 ; i < arguments.length ; i++ ) this.buf_ += arguments[i];
      return this;
    },

    function start(c) {
      if ( c ) this.out(c).nl();
      if ( this.indent ) {
        this.indentLevel++;
        this.ind();
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
      if ( this.newline && this.newline.length ) {
        this.out(this.newline);
      }
      return this;
    },

    function ind() {
      for ( var i = 0 ; i < this.indentLevel ; i++ ) this.out(this.indent);
      return this;
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
          if ( o.outputJSON2 ) {
            o.outputJSON2(this)
          } else {
            this.out('undefined');
          }
        }
      })
    },

    function stringify(o) {
      this.reset().output(o).toString();
    },

    function toString() {
      return this.buf_;
    }
  ]
});
