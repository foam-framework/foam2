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
    'sourceCls',
    'propType',
    'propValue',
    'propRequired',
    'jsonParser',
    'csvParser',
    'cloneProperty',
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
            name: 'get',
            visibility: 'public',
            type: 'Object',
            args: [ { name: 'o', type: 'Object' } ],
            body: 'return get_(o);'
          },
          {
            name: 'get_',
            type: this.propType,
            visibility: 'public',
            args: [ { name: 'o', type: 'Object' } ],
            body: 'return ((' + this.sourceCls.name + ') o).' + this.getterName + '();'
          },
          {
            name: 'set',
            type: 'void',
            visibility: 'public',
            args: [ { name: 'o', type: 'Object' }, { name: 'value', type: 'Object' } ],
            body: '((' + this.sourceCls.name + ') o).' + this.setterName + '(cast(value));'
          },
          {
            name: 'cast',
            type: this.propType,
            visibility: 'public',
            args: [ { name: 'o', type: 'Object' } ],
            body: 'return (' + this.propType + ') o;'
          },
          {
            name: 'compare',
            type: 'int',
            visibility: 'public',
            args: [ { name: 'o1', type: 'Object' }, { name: 'o2', type: 'Object' } ],
            body: 'return foam.util.SafetyUtil.compare(get_(o1), get_(o2));'
          },
          {
            name: 'comparePropertyToObject',
            type: 'int',
            visibility: 'public',
            args: [ { name: 'key', type: 'Object' }, { name: 'o', type: 'Object' } ],
            body: 'return foam.util.SafetyUtil.compare(cast(key), get_(o));'
          },
          {
            name: 'comparePropertyToValue',
            type: 'int',
            visibility: 'public',
            args: [ { name: 'key', type: 'Object' }, { name: 'value', type: 'Object' } ],
            body: 'return foam.util.SafetyUtil.compare(cast(key), cast(value));'
          },
          {
            name: 'jsonParser',
            type: 'foam.lib.parse.Parser',
            visibility: 'public',
            body: 'return ' +  (this.jsonParser ? this.jsonParser : null) + ';'
          },
          {
            name: 'csvParser',
            type: 'foam.lib.parse.Parser',
            visibility: 'public',
            body: ( this.csvParser ) ?
              'return new ' + this.csvParser + '();' :
              'return null;'
          },
          {
            name: 'getNetworkTransient',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.networkTransient + ';'
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
            args: [ { name: 'o', type: 'Object' } ],
            body: `return ((${this.sourceCls.name}) o).${this.propName}IsSet_;`
          },
          {
            name: 'isDefaultValue',
            visibility: 'public',
            type: 'boolean',
            args: [ { name: 'o', type: 'Object' } ],
            /* TODO: revise when/if expression support is added to Java */
            body: `return foam.util.SafetyUtil.compare(get_(o), ${this.propValue}) == 0;`
          }
        ];

        if ( this.cloneProperty != null ) {
          m.push({
            name: 'cloneProperty',
            visibility: 'public',
            type: 'void',
            args: [ { type: 'foam.core.FObject', name: 'source' },
                    { type: 'foam.core.FObject', name: 'dest' } ],
            body: this.cloneProperty
          });
        }
        return m;
      }
    }
  ]
});
