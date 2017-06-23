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

// Property refinement
foam.CLASS({
  refines: 'foam.core.Property',

  properties: [
    { class: 'String', name: 'shortName' },
    {
      name: 'fromXML',
      value: function fromXML(value, ctx, prop, xml) {
        return foam.xml.parse(value, null, ctx);
      }
    },
    {
      name: 'toXML',
      value: function toXML(value, outputter) { return value; }
    }
  ],

  methods: [
    function outputXML(o) {
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
  name: "Outputer",

  documentation: 'XML Outputer.',

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

     function outputProperty(o, p) {
      if ( ! this.propertyPredicate(o, p ) ) return;
      if ( ! this.outputDefaultValues && p.isDefaultValue(o[p.name]) ) return;

      var v = o[p.name]; 
      this.nl().indent();
      // Create attribute class='Array' in order for parsing later on and check for nested objects
      if ( v instanceof Array || typeof v === 'object' ) {
        this.nestedObject(v, p);
        return;
      } 
        
      this.out('<').outputPropertyName(p).out('>');
      this.output(p.toXML(v, this));
      this.out('</').outputPropertyName(p).out('>');
    },

    function nestedObject(v, p) {
      if ( v instanceof Array ) {
        this.start("<" + this.propertyName(p) + " class='Array'>");
      } else {
          this.start("<" + this.propertyName(p) + ">");
      }
      // Check if object is enum or object with regular properties
      if ( foam.core.AbstractEnum.isInstance( v ) ) {
        this.outputProperty(v, v.cls_.getAxiomByName('ordinal'));
      } else {
        this.nl().indent();
        this.output(p.toXML(v, this));
      }
      this.end('</' +  this.propertyName(p) + '>');
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
        Undefined: function(o) { this.out('null'); },
        Null:      function(o) { this.out('null'); },
        String:    function(o) { this.out('"', this.escape(o), '"'); },
        Number:    function(o) { this.out(o); },
        Boolean:   function(o) { this.out(o); },
        Date:      function(o) { this.outputDate(o); },
        Function:  function(o) { this.outputFunction(o); },
        FObject:   function(o) {
          if ( o.outputXML ) {
            o.outputXML(this)
            return;
          }
          
          var clsName = o.cls_.id;
          this.start("<object class='" + clsName + "'>")
          // Iterate through properties and output
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);
          for ( var i = 0 ; i < ps.length ; i++ ) {
            this.outputProperty(o, ps[i]);
          }
          this.end('</object>');
        },
        Array: function(o) {
          // Nested Objects and FObject Arrays Passed
          for ( var i = 0 ; i < o.length ; i++ ) {
            if ( !o[i].of ) this.nl().indent().out("<value>");
            this.output(o[i], this);
            if ( !o.of ) this.out("</value>");
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
      this.output(o);
      var ret = this.buf_;
      this.reset(); // reset to avoid retaining garbage
      return ret;
    },

    function createFObj (objClass, propObj) {
      return foam.lookup(objClass).create(propObj);
    },

    function objectify(o) {
      if ( !o ) throw 'Invalid XML Input' 
      if ( typeof o === 'string' && o ) {
        // Convert xml string into an xml DOM object for node traversal
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(o, "text/xml");
        var objects = xmlDoc.getElementsByTagName("object");
        var fObjects = [];
      
        for ( objectIndex = 0; objectIndex < objects.length; objectIndex++ ) {
          var className = objects[objectIndex].className;
          var props = objects[objectIndex].children;
          var obj = foam.lookup(className).create();

          for ( propIndex = 0; propIndex < props.length; propIndex++ ) {
            var currentProp = props[propIndex];
            var prop = obj.cls_.getAxiomByName(currentProp.tagName);
            if ( currentProp.className === 'Array' ) {
              var arrayValue = (Array.from(currentProp.children)).map( function (x) {
                  return x.innerHTML;
              });
              prop.set(obj, arrayValue);
              continue;
            }
            // Check if there is value for currentProp. Otherwise, do not output
            if ( currentProp.firstChild ) prop.set(obj, currentProp.firstChild.nodeValue);
          }
          fObjects.push(obj);
        }
        return fObjects;     
      }
      throw 'Invalid XML string'
    },
  ]
});

/** Library of pre-configured XML Outputers. **/
foam.LIB({
  name: 'foam.xml',

  constants: {

    // Pretty Print
    Pretty: foam.xml.Outputer.create({
    }),

    // Compact output (not pretty)
    Compact: foam.xml.Outputer.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
    }),

    // Shorter than Compact (uses short-names if available)
    Short: foam.json.Outputer.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
      // TODO: No deserialization support for shortnames yet.
      //      useShortNames: true,
      useShortNames: false,
    }),
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
    },
  ]
});


// {
    //   name: 'objectify',
    //   code: foam.mmethod({
    //     Date: function(o) {
    //       return this.formatDatesAsNumbers ? o.valueOf() : o;
    //     },
    //     Function: function(o) {
    //       return this.formatFunctionsAsStrings ? o.toString() : o;
    //     },
    //     FObject: function(o) {
    //       var m = {};
    //       if ( this.outputClassNames ) {
    //         m.class = o.cls_.id;
    //       }
    //       var ps = o.cls_.getAxiomsByClass(foam.core.Property);
    //       for ( var i = 0 ; i < ps.length ; i++ ) {
    //         var p = ps[i];
    //         if ( ! this.propertyPredicate(o, p) ) continue;
    //         if ( ! this.outputDefaultValues && p.isDefaultValue(o[p.name]) ) continue;

    //         m[p.name] = this.objectify(p.toXML(o[p.name], this));
    //       }
    //       return m;
    //     },
    //     Array: function(o) {
    //       var a = [];
    //       for ( var i = 0 ; i < o.length ; i++ ) {
    //         a[i] = this.objectify(o[i]);
    //       }
    //       return a;
    //     },
    //     Object: function(o) {
    //       var ret = {};
    //       for ( var key in o ) {
    //         // NOTE: Could lazily construct "ret" first time
    //         // this.objectify(o[key]) !== o[key].
    //         if ( o.hasOwnProperty(key) ) ret[key] = this.objectify(o[key]);
    //       }
    //       return ret;
    //     }
    //   },
    //   function(o) { return o; })
    // }

    // function unescapeAttr(str) {
    //   return str && str.replace(/&quot;/g, '"');
    // },

        // function unescape(str) {
    //   return str && str.toString()
    //     .replace(/&lt;/g, '<')
    //     .replace(/&gt;/g, '>')
    //     .replace(/&amp;/g, '&');
    // },