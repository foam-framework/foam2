/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
      this.removeTrailingComma().out(this.nlStr);
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
      this.removeTrailingComma().out(this.nlStr);
      ret += this.buf_;
      this.reset();

      return ret;
    },

    function externalProperty(o, p) {
      if ( ! this.propertyPredicate(o, p) ) return false;
      if ( p.isDefaultValue(o[p.name]) ) return false;

      return true;
    },

    function outputHeaderTitle(o) {
      this.out(this.includeQuotes ? '"' : '').writePrefix().out(o, this.includeQuotes ? '"' : '', this.delimiter);
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

      // Checks if property is enum, or object with properties of its own
      // TODO: Is this correct way to check if object has relevant sub-properties
      if ( foam.core.AbstractEnum.isInstance( o[p.name] ) ) {
        this.outputPropertyFilteredName(p.name + '__ordinal');
      } else if ( p.of ) {
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

    function escape(str) {
      return this.includeQuotes ? str.replace(/"/g, '\\"') : str;
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
      return this;
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
          
          // Outputs only the ordinal of ENUM
          if ( foam.core.AbstractEnum.isInstance(o) ) {
            this.outputPrimitive(o.ordinal).out(this.delimiter);
          } else {
            var ps = o.cls_.getAxiomsByClass(foam.core.Property);

            for ( var i = 0 ; i < ps.length ; i++ ) {
              this.outputProperty(o, ps[i]);
            }
          }

          this.removeTrailingComma();
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

    function objectify(className, s) {
      if ( ! s ) throw 'Invalid CSV Input'
      var lines = s.split('\n');

      if ( lines.length == 0 ) throw 'Insufficient CSV Input'

      // Trims quotes and splits CSV row into array
      var props = this.includeQuotes ? lines[0].slice(1, -1).split('","') : lines[0].split(',');

      // Account for array of values (TODO?)
      var values = this.includeQuotes ? lines[1].slice(1, -1).split('","') : lines[1].split(',');

      // Calls for the creation of a new model
      return this.createModel(props, values, className);
    },

    function createModel(props, values, className) {
      foam.assert(props.length == values.length,
        'Invalid CSV Input, header and value rows must be the same number of cells');
      
      var cls = foam.lookup(className);

      // Checks if ENUM
      if ( props[0] == 'ordinal' ) {
        return cls.create({ ordinal: values[0] })
      }

      var model = cls.create();

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
              var prop = model.cls_.getAxiomByName(p[0]);
              prop.set(model, createModel(props.slice(i, j).map(nestedProp => nestedProp.slice(prefix.length)), 
                                          values.slice(i, j), prop.of.id));
              
              i = j - 1;
              break;
            }
          }
        // Adds regular prop
      } else {
          var prop = model.cls_.getAxiomByName(p);
          prop.set(model, v);
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
      includeQuotes: false
    }),
  },

  methods: [
    function stringify(o) {
      return foam.csv.Compact.stringify(o);
    },

    function objectify(className, s) {
      return foam.csv.Compact.objectify(className, s);
    }
  ]
});
