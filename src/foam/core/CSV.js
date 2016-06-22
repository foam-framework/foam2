/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.Property',

  properties: [
    {
      name: 'fromCSV',
      value: function fromCSV(value, ctx, prop, csv) {
        return foam.csv.parse(value, null, ctx);
      }
    },
    {
      name: 'toCSV',
      value: function toCSV(value, outputter) { return value; }
    }
  ],

  // methods: [
  //   function outputCSV(o) {
  //     o.output({ class: '__Property__', forClass_: this.forClass_ });
  //   }
  // ]
});

/** CSV Outputer. **/
foam.CLASS({
  package: 'foam.csv',
  name: 'Outputer',

  documentation: 'CSV Outputer.',

  properties: [
    {
      class: 'String',
      name: 'buf_',
      value: ''
    },
    {
      class: 'Boolean',
      name: 'includeQuotes',
      help: 'If true, values are quoted with the `"` char',
      value: true
    },
    {
      class: 'String',
      name: 'delimiter',
      value: ','
    },
    {
      class: 'String',
      name: 'nestedObjectSeperator',
      value: '__'
    },
    {
      class: 'StringArray',
      name: 'nestedObjectNames'
    },
    {
      class: 'Int',
      name: 'nestedLevel_',
      value: 0
    },
    {
      class: 'String',
      name: 'nlStr',
      value: '\n'
    },
    {
      class: 'String',
      name: 'undefinedStr',
      value: ''
    },
    {
      class: 'Boolean',
      name: 'outputDefaultValues',
      value: true
    },
    {
      class: 'Boolean',
      name: 'outputHeaderRow',
      value: true
    },
    {
      class: 'Function',
      name: 'propertyPredicate',
      value: function(o, p) { return ! p.transient; }
    },
    {
      class: 'Boolean',
      name: 'sortObjectKeys',
      value: false
    }
  ],

  methods: [
    function out() {
      for ( var i = 0 ; i < arguments.length ; i++ ) { 
        this.buf_ += arguments[i];
      }

      return this;
    },

    function outputHeader(o) {
      if (!this.outputHeaderRow) return;

      // this.start(o.name)
      // Gets object axioms
      // var ps = o.cls_.getAxiomsByClass(foam.core.Property);

      // for ( var i = 0 ; i < ps.length ; i++ ) {
      //   this.outputPropertyName(o, ps[i]);
      // }

      this.outputPropertyFilteredName(o);

      this.removeTrailingComma().nl();
    },

    function removeTrailingComma() {
      // Removes trailing comma
      if (this.buf_.charAt(this.buf_.length - 1) == ',') this.buf_ = this.buf_.slice(0, -1);
      return this;
    },

    function stringify(o) {
      // TODO: handle array of objects
      this.outputHeader(o);
      var ret = this.buf_;
      this.reset(); // reset to avoid retaining garbage
      this.output(o);
      this.removeTrailingComma().nl();
      ret += this.buf_;
      this.reset();
      return ret;
    },

    // TODO: Change function name
    function externalProperty(o, p) {
      if ( ! this.propertyPredicate(o, p ) ) return false;
      if ( ! this.outputDefaultValues && p.isDefaultValue(o[p.name]) ) return false;

      return true;
    },

    function outputHeaderTitle(o) {
      this.out('"').writePrefix().out(o).out('"').out(this.delimiter);
    },

    {
      name: 'outputPropertyFilteredName',
      code: foam.mmethod({
        // Is there a `switch` like fall through so the function call isn't unecessarily repeated?
        Undefined: function(o) { this.outputHeaderTitle(o) },
        Null:      function(o) { this.outputHeaderTitle(o) },
        String:    function(o) { this.outputHeaderTitle(o) },
        Number:    function(o) { this.outputHeaderTitle(o) },
        Boolean:   function(o) { this.outputHeaderTitle(o) },
        Date:      function(o) { this.outputHeaderTitle(o) },
        FObject:   function(o) {
          // if ( o.outputCSV ) {
          //   o.outputCSV(this)
          //   return;
          // }
          
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);

          for ( var i = 0 ; i < ps.length ; i++ ) {
            this.outputPropertyName(o, ps[i]);
          }
        },
        Array: function(o) { /* Ignore arrays in CSV */ },
        Function: function(o) { /* Ignore functions in CSV */ },
        Object: function(o) {
          debugger;
          if ( o.outputCSV ) {
            o.outputCSV(this);
          } else {
            if ( this.sortObjectKeys ) {
              this.outputSortedObjectKeyValues_(o);
            } else {
              this.outputObjectKeyValues_(o);
            }
          }
        }
      })
    },

    function outputPropertyName(o, p) {
      if (!this.externalProperty(o, p)) return;
      if (p.of) {
        this.start(p.name);
      }

      this.outputPropertyFilteredName(p.of ? o[p.name] : p.name);

      if (p.of) {
        this.end();
      }
    },


    function outputProperty(o, p) {
      if (!this.externalProperty(o, p)) return;

      var v = o[p.name];
      this.output(v /* p.toCSV(v, this) */);
      this.out(this.delimiter);
    },

    function reset() {
      this.buf_ = '';
      return this;
    },

    // Starts a nested object, 1 more `__` with object name
    function start(objectName) {
      this.nestedObjectNames.push(objectName);
      return this;
    },

    function writePrefix() {
      for ( var i = 0 ; i < this.nestedObjectNames.length ; i++ ) {
        this.out(this.nestedObjectNames[i] + this.nestedObjectSeperator);
      }
      return this;
    },

    // End a nested object, 1 fewer `__` within object name
    function end() {
      this.nestedObjectNames.pop();
      return this;
    },

    // TODO: Copied from foam.core.json (move to common library)
    function nl() {
      if ( this.nlStr && this.nlStr.length ) {
        this.out(this.nlStr);
      }
      return this;
    },

    // TODO: Copied from foam.core.json (move to common library)
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

    function outputObjectKeyValue_(key, value, first) {
      if ( ! first ) this.out(',');
      this.output(value);
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

    function outputPrimitive(val) {
      this.out(this.includeQuotes ? ('"' + val + '"') : val);
    },

    {
      name: 'output',
      code: foam.mmethod({
        Undefined: function(o) { this.outputPrimitive(this.undefinedStr); },
        Null:      function(o) { this.outputPrimitive(null); },
        String:    function(o) { this.outputPrimitive(this.escape(o)); },
        Number:    function(o) { this.outputPrimitive(o); },
        Boolean:   function(o) { this.outputPrimitive(o); },
        Date:      function(o) { this.outputPrimitive(o); },
        FObject:   function(o) {
          if ( o.outputCSV ) {
            o.outputCSV(this)
            return;
          }
          
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);

          for ( var i = 0 ; i < ps.length ; i++ ) {
            this.outputProperty(o, ps[i]);
          }

          this.removeTrailingComma();
        },
        Array: function(o) { /* Ignore arrays in CSV */ },
        Function: function(o) { /* Ignore functions in CSV */ },
        Object: function(o) {
          debugger;
          if ( o.outputCSV ) {
            o.outputCSV(this);
          } else {
            if ( this.sortObjectKeys ) {
              this.outputSortedObjectKeyValues_(o);
            } else {
              this.outputObjectKeyValues_(o);
            }
          }
        }
      })
    }
  ]
});

foam.LIB({
  name: 'foam.csv',

  constants: {
    Compact: foam.csv.Outputer.create({
      outputDefaultValues: false
    }),
  },

  methods: [
    function stringify(o) {
      return foam.csv.Compact.stringify(o);
    }
  ]
});