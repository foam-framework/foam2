/**
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
    { class: 'String', name: 'shortName' },
    {
      name: 'fromJSON',
      value: function fromJSON(value, ctx, prop, json) {
        return foam.json.parse(value, null, ctx);
      }
    },
    {
      name: 'toJSON',
      value: function toJSON(value, outputter) { return value; }
    }
  ],

  methods: [
    function outputJSON(o) {
      o.output({ class: '__Property__', forClass_: this.forClass_ });
    }
  ]
});

foam.CLASS({
  name: '__Property__',
  package: 'foam.core',
  axioms: [
    {
      name: 'create',
      installInClass: function(c) {
        var oldCreate = c.create;
        c.create = function(args, X) {
          var cls = args.forClass_.substring(0, args.forClass_.lastIndexOf('.'));
          var name = args.forClass_.substring(args.forClass_.lastIndexOf('.') + 1);

          var prop = X.lookup(cls).getAxiomByName(name);

          foam.assert(prop, 'Could not find property "', args.forClass_, '"');

          return prop;
        };
      }
    }
  ]
});

/** Add toJSON() method to FObject. **/
foam.CLASS({
  refines: 'foam.core.FObject',

  methods: [
    /**
      Output as a pretty-printed JSON-ish String.
      Use for debugging/testing purposes. If you want actual
      JSON output, use foam.json.* instead.
    */
    function stringify() {
      return foam.json.Pretty.stringify(this);
    }
  ]
});


/** JSON Outputer. **/
foam.CLASS({
  package: 'foam.json',
  name: 'Outputer',

  documentation: 'JSON Outputer.',

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
      help: 'If true, keys are always quoted, as required by the JSON standard. If false, only quote keys which aren\'tvalid JS identifiers.',
      value: true
    },
    {
      class: 'Boolean',
      name: 'formatDatesAsNumbers',
      value: false
    },
    {
      class: 'Boolean',
      name: 'formatFunctionsAsStrings',
      value: true
    },
    {
      class: 'Boolean',
      name: 'outputDefaultValues',
      value: true
    },
    {
      class: 'Boolean',
      name: 'outputClassNames',
      value: true
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
      name: 'sortObjectKeys',
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
    },
    {
      // TODO: rename to FON
      class: 'Boolean',
      name: 'strict',
      value: true,
      postSet: function(_, s) {
        if ( s ) {
          this.useShortNames            = false;
          this.formatDatesAsNumbers     = false;
          this.alwaysQuoteKeys          = true;
          this.formatFunctionsAsStrings = true;
        } else {
          this.alwaysQuoteKeys          = false;
          this.formatFunctionsAsStrings = false;
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

    /**
      Start a block, using the supplied start character, which would typically
      be '{' for objects or '[' for arrays.  Handles indentation if enabled.
    */
    function start(c) {
      if ( c ) this.out(c).nl();
      if ( this.indentStr ) {
        this.indentLevel_++;
        this.indent();
      }
      return this;
    },

    /**
      End a block, using the supplied end character, which would typically
      be '}' for objects or ']' for arrays.
    */
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

    function outputPropertyName(p) {
      this.out(this.maybeEscapeKey(this.useShortNames && p.shortName ? p.shortName : p.name));
      return this;
    },

    function outputProperty(o, p, includeComma) {
      if ( ! this.propertyPredicate(o, p ) ) return;
      if ( ! this.outputDefaultValues && p.isDefaultValue(o[p.name]) ) return;

      var v = o[p.name];

      if ( includeComma ) this.out(',');

      this.nl().indent().outputPropertyName(p).out(':', this.postColonStr);
      this.output(p.toJSON(v, this));
    },

    function outputDate(o) {
      if ( this.formatDatesAsNumbers ) {
        this.out(o.valueOf());
      } else {
        this.out(JSON.stringify(o));
      }
    },

    function outputFunction(o) {
      if ( this.formatFunctionsAsStrings ) {
        this.output(o.toString());
      } else {
        this.out(o.toString());
      }
    },

    function outputObjectKeyValue_(key, value, first) {
        if ( ! first ) this.out(',').nl();
      this.indent().out(this.maybeEscapeKey(key), ':').output(value);
    },

    function outputObjectKeyValues_(o) {
      var first = true;
      for ( var key in o ) {
        this.outputObjectKeyValue_(key, o[key], first);
        first = false;
      }
    },

    function outputSortedObjectKeyValues_(o) {
      var key, keys = [];

      for ( key in o ) keys.push(key);
      keys.sort();

      var first = true;
      for ( var i = 0 ; i < keys.length; i++ ) {
        key = keys[i];
        this.outputObjectKeyValue_(key, o[key], first);
        first = false;
      }
    },

    {
      name: 'output',
      code: foam.mmethod({
        // JSON doesn't support sending 'undefined'
        Undefined: function(o) { this.out('null'); },
        Null:      function(o) { this.out('null'); },
        String:    function(o) { this.out('"', this.escape(o), '"'); },
        Number:    function(o) { this.out(o); },
        Boolean:   function(o) { this.out(o); },
        Date:      function(o) { this.outputDate(o); },
        Function:  function(o) { this.outputFunction(o); },
        FObject:   function(o) {
          if ( o.outputJSON ) {
            o.outputJSON(this)
            return;
          }

          this.start('{');
          if ( this.outputClassNames ) {
            this.out(
                this.maybeEscapeKey('class'),
                ':',
                this.postColonStr,
                '"',
                o.cls_.id,
                '"');
          }
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);
          for ( var i = 0 ; i < ps.length ; i++ ) {
            this.outputProperty(o, ps[i], this.outputClassNames || i );
          }
          this.nl().end('}');
        },
        Array: function(o) {
          this.start('[');
          for ( var i = 0 ; i < o.length ; i++ ) {
            this.output(o[i], this);
            if ( i < o.length -1 ) this.out(',').nl().indent();
          }
          this.nl();
          this.end(']');
        },
        Object: function(o) {
          if ( o.outputJSON ) {
            o.outputJSON(this);
          } else {
            this.start('{');
            if (this.sortObjectKeys) {
              this.outputSortedObjectKeyValues_(o);
            } else {
              this.outputObjectKeyValues_(o);
            }
            this.end('}');
          }
        }
      })
    },

    function stringify(o) {
      this.output(o);
      var ret = this.buf_;
      this.reset(); // reset to avoid retaining garbage
      return ret;
    },

    {
      name: 'objectify',
      code: foam.mmethod({
        Date: function(o) {
          return this.formatDatesAsNumbers ? o.valueOf() : o;
        },
        Function: function(o) {
          return this.formatFunctionsAsStrings ? o.toString() : o;
        },
        FObject: function(o) {
          var m = {};
          if ( this.outputClassNames ) {
            m.class = o.cls_.id;
          }
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);
          for ( var i = 0 ; i < ps.length ; i++ ) {
            var p = ps[i];
            if ( ! this.propertyPredicate(o, p) ) continue;
            if ( ! this.outputDefaultValues && p.isDefaultValue(o[p.name]) ) continue;

            m[p.name] = this.objectify(p.toJSON(o[p.name], this));
          }
          return m;
        },
        Array: function(o) {
          var a = [];
          for ( var i = 0 ; i < o.length ; i++ ) {
            a[i] = this.objectify(o[i]);
          }
          return a;
        },
        Object: function(o) {
          var ret = {};
          for ( var key in o ) {
            if ( o.hasOwnProperty(key) ) ret[key] = this.objectify(o[key]);
          }
          return ret;
        }
      },
      function(o) { return o; })
    }
  ]
});


/** Library of pre-configured JSON Outputers. **/
foam.LIB({
  name: 'foam.json',

  constants: {

    // Pretty Print
    Pretty: foam.json.Outputer.create({
      strict: false
    }),

    // Strict means output as proper JSON.
    Strict: foam.json.Outputer.create({
      pretty: false,
      strict: true
    }),

    // Pretty and proper JSON.
    PrettyStrict: foam.json.Outputer.create({
      pretty: true,
      strict: true
    }),

    // Compact output (not pretty)
    Compact: foam.json.Outputer.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
      strict: false
    }),

    // Shorter than Compact (uses short-names if available)
    Short: foam.json.Outputer.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
      useShortNames: true,
      strict: false
    }),

    // Short, but exclude network-transient properties.
    Network: foam.json.Outputer.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
      useShortNames: true,
      strict: false,
      propertyPredicate: function(o, p) { return ! p.networkTransient; }
    }),

    // Short, but exclude storage-transient properties.
    Storage: foam.json.Outputer.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
      useShortNames: true,
      strict: false,
      propertyPredicate: function(o, p) { return ! p.storageTransient; }
    })
  },

  methods: [
    {
      name: 'parse',
      code: foam.mmethod({
        Array: function(o, opt_class, opt_ctx) {
          var a = new Array(o.length);
          for ( var i = 0 ; i < o.length ; i++ ) {
            a[i] = this.parse(o[i], opt_class, opt_ctx);
          }

          return a;
        },
        FObject: function(o) { return o; },
        Object: function(json, opt_class, opt_ctx) {
          var cls = json.class || opt_class;

          if ( cls ) {
            var c = typeof cls === 'string' ? foam.lookup(cls) : cls;

            for ( var key in json ) {
              var prop = c.getAxiomByName(key);
              if ( prop ) {
                json[key] = prop.fromJSON(json[key], opt_ctx, prop, this);
              }
            }

            return c.create(json, opt_ctx || foam.__context__);
          }

          for ( var key in json ) {
            var o = json[key];
            json[key] = this.parse(json[key], null, opt_ctx);
          }

          return json;
        }
      }, function(o) { return o; })
    },

    function parseString(jsonStr, opt_ctx) {
      return this.parse(eval('(' + jsonStr + ')'), undefined, opt_ctx);
    },

    function stringify(o) {
      return foam.json.Compact.stringify(o);
    },

    function objectify(o) {
      return foam.json.Compact.objectify(o)
    }
  ]
});
