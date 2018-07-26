/**
@license
Copyright 2017 The FOAM Authors. All Rights Reserved.
http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  refines: 'foam.core.Property',

  properties: [
    {
      class: 'Boolean',
      name: 'xmlAttribute',
      value: false
    },
    {
      class: 'Boolean',
      name: 'xmlTextNode',
      value: false
    },
    {
      name: 'fromXML',
      value: function fromXML(value, ctx, prop, xml) {
        return foam.xml.parse(value, null, ctx);
      }
    },
    {
      name: 'toXML',
      value: function toXML(value, Outputter) { return value; }
    }
  ],

  methods: [
    function outputXML(o) {
      o.output({ class: '__Property__', forClass_: this.forClass_, name: this.name });
    }
  ]
});

/** Add toXML() method to FObject. **/
foam.CLASS({
  package: 'foam.core',
  name: 'FObjectXMLStringify',
  refines: 'foam.core.FObject',

  methods: [
    /**
      Output as a pretty-printed XML-ish String.
      Use for debugging/testing purposes. If you want actual
      XML output, use foam.xml.* instead.
    */
    function stringify() {
      return foam.xml.Pretty.stringify(this);
    }
  ]
});


/** XML Outputter **/
foam.CLASS({
  package: 'foam.xml',
  name: "Outputter",

  documentation: 'XML Outputter.',

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
      class: 'Boolean',
      name: 'outputDefaultValues',
      value: true
    },
    {
      class: 'Boolean',
      name: 'outputDefinedValues',
      value: true
    },
    {
      class: 'Boolean',
      name: 'formatDatesAsNumbers',
      value: false
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
          this.clearProperty('useShortNames');
        } else {
          this.indentStr = this.nlStr = null;
        }
      }
    }
  ],

  methods: [

    function reset() {
      this.indentLevel_ = 0;
      this.buf_ = '';
      return this;
    },

    function escape(str) {
        return str && str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    function maybeEscapeKey(str) {
      return this.alwaysQuoteKeys || ! /^[a-zA-Z\$_][0-9a-zA-Z$_]*$/.test(str) ?
          '"' + str + '"' :
          str ;
    },

    function escapeAttr(str) {
        return str && str.replace(/"/g, '&quot;');
    },

    function out() {
      for ( var i = 0 ; i < arguments.length ; i++ ) this.buf_ += arguments[i];
      return this;
    },

    function start(c) {
      if ( c ) this.out(c);
      if ( this.indentStr ) {
        this.indentLevel_++;
        this.indent();
      }
    },

    function end(c) {
      if ( this.indent ) {
        this.indentLevel_--;
      }
      if ( c ) this.nl().indent().out(c);
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

    function outputAttributes(v) {
      var attributes = v.cls_.getAxiomsByClass(foam.core.Property).filter(function (p) { return p.xmlAttribute });
      if ( attributes.length === 0 ) return this;

      for ( var i = 0 ; i < attributes.length ; i++ ) {
        this.out(' ' + attributes[i].name + '="' + this.escapeAttr(attributes[i].get(v)) + '"');
      }
      return this;
    },

    function propertyName(p) {
      return this.maybeEscapeKey(this.useShortNames && p.shortName ? p.shortName : p.name)
    },

    function outputProperty_(o, p) {
      if ( ! this.propertyPredicate(o, p ) ) return;
      // don't output default values unless value is defined and outputDefinedValues set to true
      if ( this.outputDefinedValues ) {
        if ( ! o.hasOwnProperty(p.name) ) return;
      } else if ( this.outputDefaultValues ) {
        if ( p.isDefaultValue(o[p.name]) ) return;
      }

      var v = o[p.name];
      if ( ! v || ( v instanceof Array && v.length === 0 ) ) {
        return;
      }

      this.nl().indent();
      this.outputProperty(v, p);
    },

    {
      name: 'outputProperty',
      code: foam.mmethod({
        Undefined:    function(v, p) {},
        String:       function(v, p) { this.outputPrimitive(v, p); },
        Number:       function(v, p) { this.outputPrimitive(v, p); },
        Boolean:      function(v, p) { this.outputPrimitive(v, p); },
        Date:         function(v, p) { this.outputPrimitive(v, p); },
        AbstractEnum: function(v, p) { this.outputPrimitive(v.name, p); },
        Array:     function(v, p) {
          for ( var i = 0 ; i < v.length ; i++ ) {
            if ( foam.core.FObjectArray.isInstance(p) ) {
              // output FObject array
              this.start('<' + this.propertyName(p) + '>');
              this.output(p.toXML(v[i], this));
              this.end('</' + this.propertyName(p) + '>');
            } else {
              // output primitive array
              this.outputPrimitive(v[i], p);
            }

            // new line and indent except on last element
            if ( i != v.length - 1 ) this.nl().indent();
          }
        },
        FObject: function(v, p) {
          if ( v.xmlValue ) {
            // if v.xmlValue exists then we have attributes
            // check if the value is an FObject and structure XML accordingly
            if ( foam.core.FObject.isInstance(v.xmlValue) ) {
              this.start('<' + this.propertyName(p) + this.outputAttributes(v) + '>');
              this.output(p.toXML(v, this));
              this.end('</' +  this.propertyName(p) + '>');
            } else {
              this.out('<').outputPropertyName(p).outputAttributes(v).out('>');
              this.out(p.toXML(v.xmlValue, this));
              this.out('</').outputPropertyName(p).out('>');
            }
          } else {
            // assume no attributes
            this.start('<' + this.propertyName(p) + '>');
            this.output(p.toXML(v, this));
            this.end('</' +  this.propertyName(p) + '>');
          }
        }
      })
    },

    function outputPrimitive(v, p){
      this.out('<').outputPropertyName(p).out('>');
      this.output(p.toXML(v, this));
      this.out('</').outputPropertyName(p).out('>');
    },

    function outputDate(o) {
      if ( this.formatDatesAsNumbers ) {
        this.out(o.valueOf());
      } else {
        this.out(o.toISOString());
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
      if ( ! first ) this.out(',').nl().indent();
      this.out(this.maybeEscapeKey(key), ':').output(value);
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
        Undefined:    function(o) { this.out('null'); },
        Null:         function(o) { this.out('null'); },
        String:       function(o) { this.out(this.escape(o)); },
        Number:       function(o) { this.out(o); },
        Boolean:      function(o) { this.out(o); },
        Date:         function(o) { this.outputDate(o); },
        Function:     function(o) { this.outputFunction(o); },
        AbstractEnum: function(o) { },
        FObject:      function(o) {
          if ( o.outputXML ) {
            o.outputXML(this)
            return;
          }

          var clsName = o.cls_.id;
          // Iterate through properties and output
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);
          for ( var i = 0 ; i < ps.length ; i++ ) {
            // skip outputting of attributes
            if ( ps[i].xmlAttribute ) continue;
            this.outputProperty_(o, ps[i]);
          }
        },
        Array: function(o, opt_cls) {
          this.start('<objects>\n');
          var cls = this.getCls(opt_cls);
          for ( var i = 0 ; i < o.length ; i++ ) {
            this.output(o[i], cls);
            if ( i < o.length-1 ) this.out('\n').nl().indent();
          }
          this.end('\n</objects>');
        },
        Object:        function(o) {
          if ( o.outputXML ) {
            o.outputXML(this);
          } else {
            var oName = o.name;
            this.start("<object name='" + oName + "'>");
            if ( this.sortObjectKeys ) {
              this.outputSortedObjectKeyValues_(o);
            } else {
              this.outputObjectKeyValues_(o);
            }
            this.end('</object>');
          }
        }
      })
    },

    function stringify(o) {
      // Root tags of objects for array of FObjects
      this.output(o);
      var ret = this.buf_;
      this.reset(); // reset to avoid retaining garbage
      return ret;
    },

    function objectify(doc, cls) {
      var obj = cls.create();
      var children = doc.children;

      for ( var i = 0 ; i < children.length ; i++ ) {
        // fetch property based on xml tag name since they may not be in order
        var node = children[i];
        var prop = obj.cls_.getAxiomByName(node.tagName);

        if ( foam.core.FObjectProperty.isInstance(prop) ) {
          // parse FObjectProperty
          prop.set(obj, this.objectify(node, prop.of));
        } else if ( foam.core.FObjectArray.isInstance(prop) ) {
          // parse array property
          prop.get(obj).push(this.objectify(node, foam.lookup(prop.of)));

        } else if ( foam.core.StringArray.isInstance(prop) ) {
          // parse string array
          prop.get(obj).push(node.firstChild ? node.firstChild.nodeValue : null);
        } else {
          // parse property
          prop.set(obj, node.firstChild ? node.firstChild.nodeValue : null);
        }
      }

      // check to see if xmlValue property exists
      var xmlValueProp = obj.cls_.getAxiomByName('xmlValue');
      if ( xmlValueProp ) {
        // parse attributes if they exist
        var attributes = doc.attributes;
        for ( var i = 0 ; i < attributes.length ; i++ ) {
          var attribute = attributes[i];
          var prop = obj.cls_.getAxiomByName(attribute.name);
          // don't need to check for types as attributes are always simple types
          prop.set(obj, attribute.value);
        }

        if ( foam.core.FObjectProperty.isInstance(xmlValueProp) ) {
          xmlValueProp.set(obj, this.objectify(doc, xmlValueProp.of));
        } else {
          xmlValueProp.set(obj, doc.firstChild ? doc.firstChild.nodeValue : null);
        }
      }

      return obj;
    },

    function parseString(str, opt_class) {
      // create DOM
      var parser = new DOMParser();
      var doc = parser.parseFromString(str, 'text/xml');
      var root = doc.firstChild;

      var rootClass = root.getAttribute('class');
      if ( rootClass )
        return this.objectify(root, foam.lookup(rootClass));

      if ( opt_class ) {
        // lookup class if given a string
        if ( typeof(opt_class) === 'string' )
          opt_class = foam.lookup(opt_class);
        return this.objectify(root, opt_class);
      }

      throw new Error('Class not provided');
    },

    function getCls(opt_cls) {
      return foam.String.isInstance(opt_cls);
    }
  ]
});


/** Library of pre-configured XML Outputters. **/
foam.LIB({
  name: 'foam.xml',

  constants: {
    // Pretty Print
    Pretty: foam.xml.Outputter.create({
      outputDefaultValues: false,
      outputDefinedValues: true
    }),

    // Compact output (not pretty)
    Compact: foam.xml.Outputter.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
      outputDefinedValues: false
    }),

    // Shorter than Compact (uses short-names if available)
    Short: foam.xml.Outputter.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
      outputDefinedValues: false,
      // TODO: No deserialization support for shortnames yet.
      //      useShortNames: true,
      useShortNames: false,
    })
  },

  methods: [
    function stringify(o) {
      return foam.xml.Compact.stringify(o);
    },

    function objectify(o) {
      return foam.xml.Compact.objectify(o);
    }
  ]
});
