/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.csv',
  name: 'Outputter',

  documentation: 'CSV Outputter.',

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

      this.outputPropertyFilteredName(o, '');
      this.out(this.nlStr);
    },

    function toCSV(o) {
      // Outputs object headers
      this.outputHeader(o);
      var ret = this.buf_;
      this.reset(); // reset to avoid retaining garbage

      // Outputs object values
      this.output(o);
      this.out(this.nlStr);
      ret += this.buf_;
      this.reset();

      return ret;
    },

    function outputHeaderTitle(o, prefix) {
      this.out(this.buf_.length ? this.delimiter : '')
          .out(this.includeQuotes ? '"' : '', prefix, o, this.includeQuotes ? '"' : '');
    },

    function outputPropertyName(o, p, prefix) {
      if ( ! this.propertyPredicate(o, p) ) return;

      // Checks if property is enum, or object with properties of its own
      if ( p.of && ( ! foam.core.AbstractEnum.isInstance( o[p.name] ) ) ) {
        // Appends object name to prefix for CSV Header
        prefix += p.name + this.nestedObjectSeperator;
        this.outputPropertyFilteredName(o[p.name], prefix);
      } else {
        this.outputPropertyFilteredName(p.name, prefix);
      }
    },

    {
      name: 'outputPropertyFilteredName',
      code: foam.mmethod({
        FObject:   function(o, prefix) {
          // Gets and recurses through object properties
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);

          for ( var i = 0 ; i < ps.length ; i++ ) {
            this.outputPropertyName(o, ps[i], prefix);
          }
        },
        Array: function(o) { /* Ignore arrays in CSV */ },
        Function: function(o) { /* Ignore functions in CSV */ },
        Object: function(o) { /* Ignore generic objects in CSV */ }
      }, function(o, prefix) { this.outputHeaderTitle(o, prefix); })
    },

    function outputProperty(o, p) {
      if ( ! this.propertyPredicate(o, p) ) return;
      this.output(o[p.name]);
    },

    function reset() {
      this.buf_ = '';
      return this;
    },

    function escape(str) {
      return this.includeQuotes ? str.replace(/"/g, '\\"') : str;
    },

    function outputPrimitive(val) {
      this.out(this.buf_.length ? this.delimiter : '')
          .out(this.includeQuotes ? ('"' + val + '"') : val);

      return this;
    },

    {
      name: 'output',
      code: foam.mmethod({
        Undefined: function(o) { this.outputPrimitive(this.undefinedStr); },
        Null:      function(o) { this.outputPrimitive(null); },
        String:    function(o) { this.outputPrimitive(this.escape(o)); },
        FObject:   function(o) {
          if ( o.outputCSV ) {
            o.outputCSV(this)
            return;
          }
          
          // Outputs only the ordinal of ENUM
          if ( foam.core.AbstractEnum.isInstance(o) ) {
            this.outputPrimitive(o.ordinal);
          } else {
            var ps = o.cls_.getAxiomsByClass(foam.core.Property);

            for ( var i = 0 ; i < ps.length ; i++ ) {
              this.outputProperty(o, ps[i]);
            }
          }
        },
        Array: function(o) { /* Ignore arrays in CSV */ },
        Function: function(o) { /* Ignore functions in CSV */ },
        Object: function(o) { /* Ignore generic objects in CSV */ }
      }, function(o) { this.outputPrimitive(o); })
    },

    function fromCSV(className, s) {
      if ( ! s ) throw 'Invalid CSV input to convert. Arguments must be (className, csvString).'
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

      var model = foam.lookup(className).create();

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
          prop.set(model, prop.of ? foam.lookup(prop.of.id).create({ ordinal: v }) : v);
        }
      }

      return model;
    }
  ]
});

foam.LIB({
  name: 'foam.csv',

  constants: {
    Standard: foam.csv.Outputter.create({
      includeQuotes: true
    }),
  },

  methods: [
    function toCSV(o) {
      return foam.csv.Standard.toCSV(o);
    },

    function fromCSV(className, s) {
      return foam.csv.Standard.fromCSV(className, s);
    }
  ]
});
