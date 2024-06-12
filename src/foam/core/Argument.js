/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'Argument',

  documentation: 'Describes one argument of a function or method.',

  properties: [
    {
      /** The name of the argument */
      name: 'name'
    },
    {
      name: 'type'
    },
    {
      name: 'of',
      postSet: function(_, of) {
        console.warn('Deprecated usaged of Argument.of', this.name, of);
        this.type = of;
      }
    },
    {
      class: 'String',
      name: 'documentation',
      value: ''
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'MethodArgumentRefine',
  refines: 'foam.core.AbstractMethod',
  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.Argument',
      name: 'args',
      adapt: function(o, n, prop) {
        if ( foam.String.isInstance(n) ) {
          n = n.split(',');
        }
        return foam.core.FObjectArray.ADAPT.value.call(this, o, n, prop);
      },
      adaptArrayElement: function(e, obj) {
        if ( foam.String.isInstance(e) ) {
          // Matches strings in the form [(type)] (name)
          // Where [] is optional and () is a capture group
          let res  = /(?:([\w.$]+)\s+)?([\w$?]+)/g.exec(e);
          let type = res[1];
          let name = res[2];

          e = {name: name};

          if ( type ) e.type = type;
        }
        var ctx = obj.__subContext__ || foam;
        var of  = e.class || this.of;
        var cls = ctx.lookup(of);

        return cls.isInstance(e)    ? e :
          foam.String.isInstance(e) ? cls.create({ name: e }) :
          cls.create(e, obj);
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.AbstractMethod',
  package: 'foam.core',
  name: 'CreateChildRefines',
  documentation: `
    Overwrites the createChildMethod_ to merge in details from the parent method
    into the child method like return types, arguments, and any other method
    properties. This allows a model to not need to list these details when
    implementing an interface or overriding a parent's method.
  `,
  methods: [
    function createChildMethod_(child) {
      var result = child.clone();
      var props = child.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < props.length ; i++ ) {
        var prop = props[i];
        if ( this.hasOwnProperty(prop.name) && ! child.hasOwnProperty(prop.name) ) {
          prop.set(result, prop.get(this));
        }
      }

      // Special merging behaviour for args.
      var i = 0;
      var resultArgs = [];
      for ( ; i < this.args.length ; i++ ) resultArgs.push(this.args[i].clone().copyFrom(child.args[i]));
      for ( ; i < child.args.length ; i++ ) resultArgs.push(child.args[i]);
      result.args = resultArgs; // To trigger the adaptArrayElement

      return result;
    }
  ]
});
