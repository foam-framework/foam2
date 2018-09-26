/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.LIB({
  name: 'foam.swift',
  flags: ['swift'],
  methods: [
    function asSwiftValue(v) {
      var type = foam.typeOf(v);

      if ( type == foam.Number || type == foam.Boolean ) {
        return `${v}`;
      } else if ( type == foam.String ) {
        return `"${v
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
        }"`;
      } else if ( type == foam.Array ) {
        return `[${v.map(foam.swift.asSwiftValue).join(',')}]`;
      } else if ( type == foam.Undefined ) {
        return 'nil';
      } else if ( type == foam.Function ) {
        // Unable to convert functions.
        return 'nil';
      } else if ( type == foam.core.FObject ) {
        // TODO: Should be able to serialize an FObject to swift.
        return 'nil';
      } else  {
        console.log('Encountered unexpected type while converitng value to string:', v);
        debugger;
        return 'nil';
      }
    },
    function isNullable(type) {
      return !! type.match(/[?!]$/);
    },
    function requiresCast(type) {
      return type != 'Any?' && type != 'Any!'
    },
    function toSwiftType(type, optional) {
      // Is this right?

      if ( ! type ) type = 'Any';

      // Is this the right idea?
      var isArray = type.endsWith('Array');
      if ( isArray ) type = type.substring(0, type.lastIndexOf('Array'));

      // TODO(adamvy): Model types as a object and use polymorphism
      // instead of this stupid switch statement.  I haven't done
      // that yet because I want to see all the different variations
      // we have/need to express a type so I have a better idea how
      // to design it.

      var s;

      switch ( type ) {
      case "Number":
      case "Float":
        s = "Float";
        break;
      case "Double":
        s = "Double";
        break;
      case "String":
        s = "String"
        break;
      case "Byte":
        s = "Int8";
        break;
      case "Short":
        s = "Int16";
        break;
      case "Integer":
        s = "Int"; // TODO Int32
        break;
      case "Long":
        s = "Int";
        break;
      case "Boolean":
        s = "Bool";
        break;
      case "Object":
        s = "Any";
        break;
      case "Any":
        s = "Any";
        optional = true;
        break;
      case "List":
        s = "[Any?]";
        break;
      case "Map":
        s = "[AnyHashable:Any?]";
        break;
      case "Class":
        s = "ClassInfo";
        break;
      case "Char":
        s = "Character";
        break;
      case "Date":
      case "DateTime":
      case "Time":
        s = "Date";
        break;
      case "Void":
        s = "Void";
        break;
      case "Context":
        s = "Context";
        break;
      default:
        s = foam.lookup(type).model_.swiftName
      }

      if ( isArray ) s = `[${s}]`;
      if ( optional ) s += '?';
      return s;
    },
  ],
});

foam.CLASS({
  package: 'foam.swift',
  name: 'SwiftTypeProperty',
  extends: 'String',
  properties: [
    {
      name: 'expression',
      value: function(type) {
        return foam.swift.toSwiftType(type);
      }
    },
    {
      name: 'name',
      value: 'swiftType'
    }
  ]
});
