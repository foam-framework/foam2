/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.java',
  name: 'Builder',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.Property',
      name: 'properties'
    }
  ],

  methods: [
    function buildJavaClass(cls) {
      var builder = foam.java.Class.create();
      builder.name = 'Builder';
      builder.innerClass = true;
      builder.static = true;

      builder.field({
        name: 'x_',
        type: 'foam.core.X',
        visibility: 'protected',
      });

      builder.method({
        visibility: 'public',
        name: 'Builder',
        type: '',
        args: [ { type: 'foam.core.X', name: 'x' } ],
        body: `x_ = x;`
      });

      builder.method({
        visibility: 'public',
        name: 'setX',
        type: 'Builder',
        args: [ { type: 'foam.core.X', name: 'x' } ],
        body: `x_ = x;
return this;`
      });

      var buildBody = `
// TODO: Consider returning something more generic so the facet manager can
// replace the object with anything it wants.
// TODO: Consider throwing an exception if x_ is null.
${cls.name} obj = x_ == null ? new ${cls.name}() : (${cls.name}) x_.create(${cls.name}.class);
obj.setX(x_);`;

      for ( var i = 0 ; i < this.properties.length ; i++ ) {
        var prop = this.properties[i];

        var privateName = prop.name + '_';
        var isSet = prop.name + 'IsSet_';
        var capitalized = foam.String.capitalize(prop.name);
        var constantize = foam.String.constantize(prop.name);

        builder.field({
          name: privateName,
          type: prop.javaType,
          visibility: 'protected'
        });
        builder.field({
          name: isSet,
          type: 'boolean',
          visibility: 'protected',
          initializer: 'false;'
        });

        builder.method({
          name: 'set' + capitalized,
          type: 'Builder',
          visibility: 'public',
          args: [ { type: prop.javaType, name: 'value' } ],
          body: `${privateName} = value;
${isSet} = true;
return this;`
        });

        buildBody += `if ( ${isSet} ) obj.setProperty("${prop.name}", ${privateName});
`;
      }

      buildBody += 'obj.init_(); return obj;'

      builder.method({
        name: 'build',
        type: cls.name,
        visibility: 'public',
        body: buildBody
      });

      cls.classes.push(builder);
    }
  ]
});
