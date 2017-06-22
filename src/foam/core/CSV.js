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
  ]
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
      if ( ! this.outputHeaderRow ) return;

      this.outputPropertyFilteredName(o);
      this.removeTrailingComma().nl();
    },

    function removeTrailingComma() {
      // Removes trailing comma
      if ( this.buf_.charAt(this.buf_.length - 1) == ',' ) this.buf_ = this.buf_.slice(0, -1);
      return this;
    },

    function stringify(o) {
      // Outputs object headers
      this.outputHeader(o);
      var ret = this.buf_;
      this.reset(); // reset to avoid retaining garbage

      // Outputs object values
      this.output(o);
      this.removeTrailingComma().nl();
      ret += this.buf_;
      this.reset();

      return ret;
    },

    function externalProperty(o, p) {
      if ( ! this.propertyPredicate(o, p) ) return false;
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
        Undefined: function(o) { this.outputHeaderTitle(o); },
        Null:      function(o) { this.outputHeaderTitle(o); },
        String:    function(o) { this.outputHeaderTitle(o); },
        Number:    function(o) { this.outputHeaderTitle(o); },
        Boolean:   function(o) { this.outputHeaderTitle(o); },
        Date:      function(o) { this.outputHeaderTitle(o); },
        FObject:   function(o) {
          // Gets and recurses through object properties
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);

          for ( var i = 0 ; i < ps.length ; i++ ) {
            this.outputPropertyName(o, ps[i]);
          }
        },
        Array: function(o) { /* Ignore arrays in CSV */ },
        Function: function(o) { /* Ignore functions in CSV */ },
        Object: function(o) {
          // TODO: How to test?
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
      if ( ! this.externalProperty(o, p) ) return;

      // Checks if property is object with properties of its own
      // TODO: Is this correct way to check if object has relevant sub-properties
      if ( p.of ) {
        this.start(p.name);
        this.outputPropertyFilteredName(o[p.name]);
        this.end();
      } else {
        this.outputPropertyFilteredName(p.name);
      }
    },

    function outputProperty(o, p) {
      if ( ! this.externalProperty(o, p) ) return;

      this.output(o[p.name]);
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
    },

    function objectify(s) {
      if (!s) throw 'Invalid CSV Input'
      var lines = s.split('\n');

      if ( lines.length == 0 ) throw 'Insufficient CSV Input'

      // Trims quotes and splits CSV row into array
      var props = lines[0].slice(1, -1).split('","');
      var values = lines[1].slice(1, -1).split('","'); // Account for array of values (TODO?)

      // Calls for the creation of a new model
      var model = this.createModel(props, values)

      return model;
    },

    function createModel(props, values) {
      foam.assert(props.length == values.length,
        'Invalid CSV Input, header and value rows must be the same number of cells');
      
      var model = {};

      for ( var i = 0 ; i < props.length ; ++i ) {
        var p = props[i];
        var v = values[i];

        // Adds nested prop
        if ( p.includes('__') ) {
          p = p.split('__');
          foam.assert(p.length >= 2, 'Invalid CSV object nesting, properties of inner objects are identified by `__`');
          var prefix = p[0] + '__';

          for ( var j = i ; j <= props.length ; ++j ) {
            // If last element, or prefix no longer matches prop
            if ( ( j == props.length ) || ( ! props[j].startsWith(prefix) ) ) {
              // Creates a new model for the inner object
              model[p[0]] = createModel(props.slice(i, j).map(nestedProp => nestedProp.slice(prefix.length)), 
                                        values.slice(i, j))

              i = j - 1;
              break;
            }
          }
        // Adds regular prop
        } else {
          model[p] = v;
        }
      }

      return model;
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
    },

    function objectify(s) {
      return foam.csv.Compact.objectify(s);
    }
  ]
});
