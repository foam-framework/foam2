/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.csv',
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

      this.outputPropertyName(o, '', true);
      this.out(this.nlStr);
    },

    function outputHeaderTitle(o, prefix, first) {
      this.out(first ? '' : this.delimiter)
          .out(this.escapeString(prefix + o));
    },

    function outputPropertyName_(o, p, prefix, first) {
      if ( ! this.propertyPredicate(o, p) ) return;

      if ( foam.core.FObjectProperty.isInstance(p) ) {
        // Gets new empty object if FObjectProperty is currently undefined
        // Done to permit appropriate headers for multi-line CSVs (multiple objects to convert)
        if ( o[p.name] == undefined ) o[p.name] = p.of.id;

        // Appends object name to prefix for CSV Header
        prefix += p.name + this.nestedObjectSeperator;
        this.outputPropertyName(o[p.name], prefix, first);
      } else {
        this.outputPropertyName(p.name, prefix, first);
      }
    },

    {
      name: 'outputPropertyName',
      code: foam.mmethod({
        FObject:   function(o, prefix, first) {
          // Gets and recurses through object properties
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);

          for ( var i = 0 ; i < ps.length ; i++ ) {
            this.outputPropertyName_(o, ps[i], prefix, (i == 0 && first));
          }
        },
        Array: function(o) { /* Ignore arrays in CSV */ },
        Function: function(o) { /* Ignore functions in CSV */ },
        Object: function(o) { /* Ignore generic objects in CSV */ }
      }, function(o, prefix, first) { this.outputHeaderTitle(o, prefix, first); })
    },

    function outputProperty(o, p, first) {
      if ( this.propertyPredicate(o, p) ) this.output(o[p.name], first);
    },

    function reset() {
      this.buf_ = '';
      return this;
    },

    function outputPrimitive(val, first) {
      this.out(first ? '' : this.delimiter, val);
      return this;
    },

    function escapeString(s) {
      if ( s.includes(',') ) {
        // Surrounds fields with commas in quotes
        // Escapes inner quotes by adding another quote char (Google Sheets strategy)
        s = '"' + s.replace('"', '""') + '"';
      }
      
      return s;
    },

    {
      name: 'output',
      code: foam.mmethod({
        Undefined:    function(o, first) { this.outputPrimitive(this.undefinedStr, first); },
        String:       function(o, first) { this.outputPrimitive(this.escapeString(o), first); },
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

    function fromCSV(cls, s, sink) {
      if ( ! s ) throw 'Invalid CSV input to convert. Arguments must be (class, csvString).'
      var lines = s.split('\n');

      if ( lines.length == 0 ) throw 'Insufficient CSV Input';

      // Trims quotes and splits CSV row into array
      var props = this.splitIntoValues(lines[0]);

      for ( var i = 1 ; i < lines.length ; i++ ) {
        var values = this.splitIntoValues(lines[i]);

        // Skips blank lines
        if ( values.length == 0 ) continue;

        // Calls for creation of new model, and `puts` into sink
        sink.put(this.createModel(props, values, cls));
      }

      return sink;
    },

    function splitIntoValues(csvString) {
      if ( ( csvString == undefined ) || ( csvString.length == 0) ) return [];

      var parser = foam.lib.csv.CSVParser.create();
      return parser.parseString(csvString, this.delimiter).map(field => field.value == undefined ? '' : field.value);
    },

    function createModel(props, values, cls) {
      foam.assert(props.length == values.length,
        'Invalid CSV Input, header and value rows must be the same number of cells');

      var model = cls.create();

      for ( var i = 0 ; i < props.length ; i++ ) {
        var p = props[i];
        var v = values[i];

        // Adds nested prop
        if ( p.includes(this.nestedObjectSeperator) ) {
          p = p.split(this.nestedObjectSeperator);

          foam.assert(p.length >= 2, 'Invalid CSV object nesting, properties of inner objects are identified by `' + 
                                      this.nestedObjectSeperator + '`');

          var prefix = p[0] + this.nestedObjectSeperator;

          for ( var j = i ; j <= props.length ; ++j ) {
            // If last element, or prefix no longer matches prop
            if ( ( j == props.length ) || ( ! props[j].startsWith(prefix) ) ) {
              // Creates a new model for the inner object
              var prop = model.cls_.getAxiomByName(p[0]);
              prop.set(model, this.createModel(props.slice(i, j).map(nestedProp => nestedProp.slice(prefix.length)), 
                                          values.slice(i, j), prop.of));
              
              i = j - 1;
              break;
            }
          }
        // Adds regular prop
        } else {
          var prop = model.cls_.getAxiomByName(p);
          prop.set(model, prop.of ? prop.of.create({ ordinal: v }) : v);
        }
      }

      return model;
    }
  ]
});

foam.LIB({
  name: 'foam.lib.csv',

  constants: {
    Standard: foam.lib.csv.Outputter.create(),
  },

  methods: [
    function toCSV(o) {
      return foam.lib.csv.Standard.toCSV(o);
    },

    function fromCSV(cls, csvString, sink) {
      return foam.lib.csv.Standard.fromCSV(cls, csvString, sink);
    }
  ]
});

