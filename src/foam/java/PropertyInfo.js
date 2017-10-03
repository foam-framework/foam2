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
    'propRequired',
    'jsonParser',
    'csvParser',
    {
      name: 'methods',
      factory: function() {
        return [
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
            body: 'return compareValues(get_(o1), get_(o2));'
          },
          {
            name: 'comparePropertyToObject',
            type: 'int',
            visibility: 'public',
            args: [ { name: 'key', type: 'Object' }, { name: 'o', type: 'foam.core.FObject' } ],
            body: 'return compare(cast(key), get_(o));'
          },
          {
            name: 'jsonParser',
            type: 'foam.lib.parse.Parser',
            visibility: 'public',
            body: ( this.jsonParser ) ?
              'return new ' + this.jsonParser + '();' :
              'return null;'
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
          }
        ]
      }
    }
  ]
});
