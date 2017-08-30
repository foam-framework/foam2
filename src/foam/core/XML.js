/**
@license
Copyright 2017 The FOAM Authors. All Rights Reserved.
http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  refines: 'foam.core.Property',

  properties: [
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
      o.output({ class: '__Property__', forClass_: this.forClass_ });
    }
  ]
});

/** Add toXML() method to FObject. **/
foam.CLASS({
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

    function propertyName(p) {
      return this.maybeEscapeKey(this.useShortNames && p.shortName ? p.shortName : p.name)
    },

    function outputProperty_(o, p) {
      if ( ! this.propertyPredicate(o, p ) ) return;
      if ( ! this.outputDefaultValues && p.isDefaultValue(o[p.name]) ) return;

      var v = o[p.name];
      this.nl().indent();
      this.outputProperty(v, p);
    },

    {
      name: 'outputProperty',
      code: foam.mmethod({
        String:  function(v, p) { this.outputPrimitive(v, p) },
        Number:  function(v, p) { this.outputPrimitive(v, p) },
        Boolean: function(v, p) { this.outputPrimitive(v, p) },
        Date:    function(v, p) { this.outputPrimitive(v, p) },
        Array:   function(v, p) {
          this.start('<' + this.propertyName(p) + '>');
          this.output(p.toXML(v, this));
          this.end('</' +  this.propertyName(p) + '>');
        },
        FObject: function(v, p) {
          this.start('<' + this.propertyName(p) + '>');
          this.output(p.toXML(v, this));
          this.end('</' +  this.propertyName(p) + '>');
        },
        AbstractEnum: function(v, p) {
          this.start('<' + this.propertyName(p) + '>');
          this.outputProperty_(v, v.cls_.getAxiomByName('ordinal'));
          this.end('</' +  this.propertyName(p) + '>');
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
            this.outputProperty_(o, ps[i]);
          }
        },
        Array: function(o) {
          // Nested Objects and FObject Arrays Passed
          for ( var i = 0 ; i < o.length ; i++ ) {
            // Output 'value' tags for arrays containing non-FObject values
            if ( !o[i].cls_) this.out("<value>");
            this.output(o[i], this);
            if ( !o[i].cls_ ) this.out("</value>");
            if ( o.length - i != 1 ) this.nl().indent();
          }
        },
        Object: function(o) {
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
      if ( o instanceof Array ) {
        this.start("<objects>");
        this.output(o);
        this.end("</objects>");
      } else {
        this.output(o);
      }
      var ret = this.buf_;
      this.reset(); // reset to avoid retaining garbage
      return ret;
    },

    {
      name: 'parse',
      code: foam.mmethod({
        Object: function (o, opt_class, opt_ctx) {
          // Create FObject
          var className = o.className;
          var obj = foam.lookup(className).create();
          var props = o.children;

          // Populate FObject with properties
          for ( var propIndex = 0; propIndex < props.length; propIndex++ ) {

            var currentNode = props[propIndex];
            var prop = obj.cls_.getAxiomByName(currentNode.tagName);
            var childName = currentNode.firstChild.localName;
            // Specific case for array
            if ( currentNode.className === 'Array' ) {
              // Array of FObjects
              if ( childName === 'object' ) {
                var nestObjArray = Array.from(currentNode.childNodes);
                prop.set(obj, this.parse(nestObjArray));
              } else {
                // Array of other objects with 'value' tag names
                var arrayValue = (Array.from(currentNode.children)).map( function (x) { return x.innerHTML; });
                prop.set(obj, arrayValue);
              }
              continue;
            }

            // Nested Object
            if ( childName === 'object' ) {
              var nestObj = this.parse(currentNode.firstChild);
              prop.set(obj, nestObj);
              continue;
            }

            // Sets property with value found within node. Additionally checks whether property is Enum type in order
            // to set ordinal value. Sometimes nodeValue is not able to parse inner tag values correctly thus innerHTML
            if ( currentNode.firstChild.nodeValue ) {
              var val = currentNode.firstChild.nodeValue.replace(/\"/g, "");
              prop.set(obj, prop.of ? foam.lookup(prop.of.id).create({ ordinal: val }) : val );
            } else if ( currentNode.firstChild.innerHTML ) {
              var v = currentNode.firstChild.innerHTML.replace(/\"/g, "");
              prop.set(obj, prop.of ? foam.lookup(prop.of.id).create({ ordinal: v }) : v );
            }
          }
          return obj;
        },
        Array: function (o, opt_class, opt_ctx) {
          var fObjects = []
          for ( index = 0; index < o.length; index++ ) {
              fObjects.push(this.parse(o[index], opt_class, opt_ctx));
          }
          return fObjects;
        }
      })
    },

    function objectify(doc, cls) {
      var obj = cls.create();
      var children = doc.children;

      for ( var i = 0; i < children.length; i++ ) {
        var node = children[i];
        var prop = obj.cls_.getAxiomByName(node.tagName);

        if ( foam.core.FObjectProperty.isInstance(prop) ) {
          // parse FObjectProperty
          prop.set(obj, this.objectify(node, prop.of));
        } else if ( foam.core.FObjectArray.isInstance(prop) ) {
          // TODO: add logic for FObjectArray
          // parse FObjectArray
        }else {
          // parse property
          prop.set(obj, node.firstChild ? node.firstChild.nodeValue : null);
        }
      }

      return obj;
    },

    function parseString(str, opt_class) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(str, 'text/xml');
      var root = doc.firstChild;

      var rootClass = root.getAttribute('class');
      if ( rootClass ) {
        // look up root class from XML tags
        return this.objectify(root, foam.lookup(rootClass));
      } else if ( opt_class ) {
        // lookup class if given a string
        if ( typeof(opt_class) === 'string' )
          opt_class = foam.lookup(opt_class);
        return this.objectify(root, opt_class);
      } else {
        throw new Error('Class not provided');
      }
    }
  ]
});


/** Library of pre-configured XML Outputters. **/
foam.LIB({
  name: 'foam.xml',

  constants: {
    // Pretty Print
    Pretty: foam.xml.Outputter.create({
      outputDefaultValues: false
    }),

    // Compact output (not pretty)
    Compact: foam.xml.Outputter.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
    }),

    // Shorter than Compact (uses short-names if available)
    Short: foam.xml.Outputter.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
      // TODO: No deserialization support for shortnames yet.
      //      useShortNames: true,
      useShortNames: false,
    })
  },

  methods: [
    function parseString(xmlStr, opt_ctx) {
      return this.parse(xmlStr, undefined, opt_ctx)
    },

    function stringify(o) {
      return foam.xml.Compact.stringify(o);
    },

    function objectify(o) {
      return foam.xml.Compact.objectify(o);
    }
  ]
});
