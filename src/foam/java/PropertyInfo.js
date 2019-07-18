/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.java',
  name: 'PropertyInfo',
  extends: 'foam.java.Class',

  properties: [
    ['anonymous', true],
    'propName',
    'propShortName',
    'propAliases',
    'compare',
    'comparePropertyToObject',
    'comparePropertyToValue',
    {
      name: 'getAliasesBody',
      expression: function() {
      var b = 'new String[] {';
        for ( var i = 0 ; i < this.propAliases.length ; i++ ) {
          b += '"' + this.propAliases[i] + '"';
          if ( i < this.propAliases.length-1 ) b += ', ';
        }
        return b + '};';
      }
    },
    {
      class: 'Boolean',
      name: 'networkTransient'
    },
    {
      class: 'Boolean',
      name: 'storageTransient'
    },
    {
      class: 'Boolean',
      name: 'permissionRequired'
    },
    {
      class: 'Boolean',
      documentation: 'define a property is a XML attribute. eg <foo id="XMLAttribute"></foo>',
      name: 'xmlAttribute'
    },
    {
      class: 'Boolean',
      documentation: 'define a property is a XML textNode. eg <foo id="1">textNode</foo>',
      name: 'xmlTextNode'
    },
    {
      class: 'String',
      name: 'sqlType'
    },
    {
      name: 'getterName',
      expression: function(propName) {
        return 'get' + foam.String.capitalize(propName);
      }
    },
    {
      name: 'setterName',
      expression: function(propName) {
        return 'set' + foam.String.capitalize(propName);
      }
    },
    {
      name: 'clearName',
      expression: function(propName) {
        return 'clear' + foam.String.capitalize(propName);
      }
    },
    {
      class: 'Boolean',
      name: 'includeInDigest'
    },
    {
      class: 'Boolean',
      name: 'includeInSignature'
    },
    {
      class: 'Boolean',
      name: 'containsPII'
    },
    {
      class: 'Boolean',
      name: 'containsDeletablePII'
    },
    'sourceCls',
    'propType',
    'propValue',
    'propRequired',
    'jsonParser',
    'csvParser',
    'cloneProperty',
    'queryParser',
    'diffProperty',
    'validateObj',
    'toCSV',
    'toCSVLabel',
    {
      name: 'methods',
      factory: function() {
        var m = [
          {
            name: 'getName',
            visibility: 'public',
            type: 'String',
            body: 'return "' + this.propName + '";'
          },
          {
            name: 'getShortName',
            visibility: 'public',
            type: 'String',
            body: this.propShortName ?
              'return "' + this.propShortName + '";' :
              'return null;'
          },
          {
            name: 'getAliases',
            visibility: 'public',
            type: 'String[]',
            body: 'return ' + this.getAliasesBody
          },
          {
            name: 'get',
            visibility: 'public',
            type: 'Object',
            args: [{ name: 'o', type: 'Object' }],
            body: 'return get_(o);'
          },
          {
            name: 'get_',
            type: this.propType,
            visibility: 'public',
            args: [{ name: 'o', type: 'Object' }],
            body: 'return ((' + this.sourceCls.name + ') o).' + this.getterName + '();'
          },
          {
            name: 'set',
            type: 'void',
            visibility: 'public',
            args: [{ name: 'o', type: 'Object' }, { name: 'value', type: 'Object' }],
            body: '((' + this.sourceCls.name + ') o).' + this.setterName + '(cast(value));'
          },
          {
            name: 'clear',
            type: 'void',
            visibility: 'public',
            args: [{ name: 'o', type: 'Object' }],
            body: '((' + this.sourceCls.name + ') o).' + this.clearName + '();'
          },
          {
            name: 'cast',
            type: this.propType,
            visibility: 'public',
            args: [{ name: 'o', type: 'Object' }],
            body: 'return (' + this.propType + ') o;'
          },
          {
            name: 'compare',
            type: 'int',
            visibility: 'public',
            args: [{ name: 'o1', type: 'Object' }, { name: 'o2', type: 'Object' }],
            body: this.compare,
          },
          {
            name: 'comparePropertyToObject',
            type: 'int',
            visibility: 'public',
            args: [{ name: 'key', type: 'Object' }, { name: 'o', type: 'Object' }],
            body: this.comparePropertyToObject,
          },
          {
            name: 'comparePropertyToValue',
            type: 'int',
            visibility: 'public',
            args: [{ name: 'key', type: 'Object' }, { name: 'value', type: 'Object' }],
            body: this.comparePropertyToValue,
          },
          {
            name: 'jsonParser',
            type: 'foam.lib.parse.Parser',
            visibility: 'public',
            body: 'return ' + ( this.jsonParser ? this.jsonParser : null ) + ';'
          },
          {
            name: 'queryParser',
            type: 'foam.lib.parse.Parser',
            visibility: 'public',
            body: 'return ' + ( this.queryParser ? this.queryParser : null ) + ';'
          },
          {
            name: 'csvParser',
            type: 'foam.lib.parse.Parser',
            visibility: 'public',
            body: 'return ' + ( this.csvParser ? this.csvParser : null ) + ';'
          },
          {
            name: 'getNetworkTransient',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.networkTransient + ';'
          },
          {
            name: 'getPermissionRequired',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.permissionRequired + ';'
          },
          {
            name: 'getStorageTransient',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.storageTransient + ';'
          },
          {
            name: 'getXMLAttribute',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.xmlAttribute + ';'
          },
          {
            name: 'getXMLTextNode',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.xmlTextNode + ';'
          },
          {
            name: 'getRequired',
            visibility: 'public',
            type: 'boolean',
            body: 'return ' + Boolean(this.propRequired) + ';'
          },
          {
            name: 'getValueClass',
            visibility: 'public',
            type: 'Class',
            body: `return ${this.propType}.class;`
          },
          {
            name: 'getSQLType',
            visibility: 'public',
            type: 'String',
            body: 'return "' + this.sqlType + '";'
          },
          {
            name: 'createStatement',
            visibility: 'public',
            type: 'String',
            body: 'return "' + this.propName.toLowerCase() + '";'
          },
          {
            name: 'isSet',
            visibility: 'public',
            type: 'boolean',
            args: [{ name: 'o', type: 'Object' }],
            body: `return ((${this.sourceCls.name}) o).${this.propName}IsSet_;`
          },
          {
            name: 'isDefaultValue',
            visibility: 'public',
            type: 'boolean',
            args: [{ name: 'o', type: 'Object' }],
            /* TODO: revise when/if expression support is added to Java */
            body: `return foam.util.SafetyUtil.compare(get_(o), ${this.propValue}) == 0;`
          },
          {
            name: 'validateObj',
            visibility: 'public',
            type: 'void',
            args: [
              { name: 'x', type: 'foam.core.X' },
              { name: 'obj', type: 'foam.core.FObject' }
            ],
            body: this.validateObj
          },
          {
            name: 'toCSV',
            visibility: 'public',
            type: 'void',
            args: [
              { name: 'x',          type: 'foam.core.X' },
              { name: 'obj',        type: 'Object' },
              { name: 'outputter',  type: 'foam.lib.csv.CSVOutputter' }
            ],
            body: this.toCSV
          },
          {
            name: 'toCSVLabel',
            visibility: 'public',
            type: 'void',
            args: [
              { name: 'x',          type: 'foam.core.X' },
              { name: 'outputter',  type: 'foam.lib.csv.CSVOutputter' }
            ],
            body: this.toCSVLabel
          }
        ];

        if ( this.cloneProperty != null ) {
          m.push({
            name: 'cloneProperty',
            visibility: 'public',
            type: 'void',
            args: [{ type: 'foam.core.FObject', name: 'source' },
                    { type: 'foam.core.FObject', name: 'dest' }],
            body: this.cloneProperty
          });
        }

        if ( this.diffProperty != null ) {
          m.push({
            name: 'diff',
            visibility: 'public',
            type: 'void',
            args: [{ type: 'foam.core.FObject',       name: 'o1'   },
                    { type: 'foam.core.FObject',      name: 'o2'   },
                    { type: 'java.util.Map',          name: 'diff' },
                    { type: 'foam.core.PropertyInfo', name: 'prop' }],
            body: this.diffProperty
          });
        }

        // default value is true, only generate if value is false
        if ( ! this.includeInDigest ) {
          m.push({
            name:       'includeInDigest',
            visibility: 'public',
            type:       'boolean',
            body:       `return ${this.includeInDigest};`
          });
        }

        // default value is true, only generate if value is false
        if ( ! this.includeInSignature ) {
          m.push({
            name:       'includeInSignature',
            visibility: 'public',
            type:       'boolean',
            body:       `return ${this.includeInSignature};`
          });
        }

        if ( this.containsPII ) {
          m.push({
            name:       'containsPII',
            visibility: 'public',
            type:       'boolean',
            body:       `return ${this.containsPII};`
          });
        }

        if ( this.containsDeletablePII ) {
          m.push({
            name:       'containsDeletablePII',
            visibility: 'public',
            type:       'boolean',
            body:       `return ${this.containsDeletablePII};`
          });
        }

        return m;
      }
    }
  ]
});
