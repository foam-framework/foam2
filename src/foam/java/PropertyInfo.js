foam.CLASS({
  package: 'foam.java',
  name: 'PropertyInfo',
  extends: 'foam.java.Class',

  properties: [
    ['anonymous', true],
    'propName',
    {
      class: 'Boolean',
      name: 'transient',
      value: false
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
    'jsonParser',
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
            body: 'return ((' + this.sourceCls.name + ')o).' + this.getterName + '();'
          },
          {
            name: 'set',
            type: 'void',
            visibility: 'public',
            args: [ { name: 'o', type: 'Object' }, { name: 'value', type: 'Object' } ],
            body: '((' + this.sourceCls.name + ')o).' + this.setterName + '(cast(value));'
          },
          {
            name: 'cast',
            type: this.propType,
            visibility: 'public',
            args: [ { name: 'o', type: 'Object' } ],
            body: 'return (' + this.propType + ')o;'
          },
          {
            name: 'compare',
            type: 'int',
            visibility: 'public',
            args: [ { name: 'o1', type: 'Object' }, { name: 'o2', type: 'Object' } ],
            body: 'return compareValues(get_(o1),get_(o2));'
          },
          {
            name: 'jsonParser',
            type: 'foam.lib.parse.Parser',
            visibility: 'public',
            body: 'return new ' + this.jsonParser + '();'
          },
          {
            name: 'getTransient',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.transient + ';'
          }
        ]
      }
    }
  ]
});
