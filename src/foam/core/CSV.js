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
    }
  ],

  methods: [
    function out() {
      for ( var i = 0 ; i < arguments.length ; i++ ) { 
        this.buf_ += arguments[i];
      }

      return this;
    },

    function toCSV(o) {
      // Resets buffer
      this.reset();

      // Outputs object headers
      this.outputHeader(o);

      // Outputs object values
      this.output(o, true);
      this.out(this.nlStr);

      return this.buf_;
    },

    function outputHeader(o) {
      if ( ! this.outputHeaderRow ) return;

      this.outputPropertyFilteredName(o, '', true);
      this.out(this.nlStr);
    },

    function outputHeaderTitle(o, prefix, first) {
      this.out(first ? '' : this.delimiter)
          .out(prefix, o);
    },

    function outputPropertyName(o, p, prefix, first) {
      if ( ! this.propertyPredicate(o, p) ) return;

      // Checks if property is enum, or object with properties of its own
      if ( p.of && ( ! foam.core.AbstractEnum.isInstance( o[p.name] ) ) ) {
        // Appends object name to prefix for CSV Header
        prefix += p.name + this.nestedObjectSeperator;
        this.outputPropertyFilteredName(o[p.name], prefix, first);
      } else {
        this.outputPropertyFilteredName(p.name, prefix, first);
      }
    },

    {
      name: 'outputPropertyFilteredName',
      code: foam.mmethod({
        FObject:   function(o, prefix, first) {
          // Gets and recurses through object properties
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);

          for ( var i = 0 ; i < ps.length ; i++ ) {
            this.outputPropertyName(o, ps[i], prefix, (i == 0 && first));
          }
        },
        Array: function(o) { /* Ignore arrays in CSV */ },
        Function: function(o) { /* Ignore functions in CSV */ },
        Object: function(o) { /* Ignore generic objects in CSV */ }
      }, function(o, prefix, first) { this.outputHeaderTitle(o, prefix, first); })
    },

    function outputProperty(o, p, first) {
      if ( ! this.propertyPredicate(o, p) ) return;
      this.output(o[p.name], first);
    },

    function reset() {
      this.buf_ = '';
      return this;
    },

    function outputPrimitive(val, first) {
      this.out(first ? '' : this.delimiter, val);
      return this;
    },

    {
      name: 'output',
      code: foam.mmethod({
        Undefined:    function(o, first) { this.outputPrimitive(this.undefinedStr, first); },
        Null:         function(o, first) { this.outputPrimitive(null, first); },
        String:       function(o, first) { this.outputPrimitive(o, first); },
        AbstractEnum: function(o, first) { this.outputPrimitive(o.ordinal, first); },
        FObject:   function(o, first) {
          if ( o.outputCSV ) {
            o.outputCSV(this)
            return;
          }
          
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);

          for ( var i = 0 ; i < ps.length ; i++ ) {
            this.outputProperty(o, ps[i], (i == 0 && first));
          }
        },
        Array:        function(o) { /* Ignore arrays in CSV */ },
        Function:     function(o) { /* Ignore functions in CSV */ },
        Object:       function(o) { /* Ignore generic objects in CSV */ }
      }, function(o, first) { this.outputPrimitive(o, first); })
    },

    function fromCSV(className, s) {
      if ( ! s ) throw 'Invalid CSV input to convert. Arguments must be (className, csvString).'
      var lines = s.split('\n');

      if ( lines.length == 0 ) throw 'Insufficient CSV Input';

      // Trims quotes and splits CSV row into array
      var props = lines[0].split(',');

      // Account for array of values (TODO?)
      var values = lines[1].split(',');

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
    Standard: foam.csv.Outputter.create(),
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
