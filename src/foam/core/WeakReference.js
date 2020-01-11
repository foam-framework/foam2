foam.CLASS({
  package: 'foam.core',
  name: 'WeakReference',

  documentation: `
    A WeakReference is a reference with variable type. A property holding a
    WeakReference should be of class ReferenceSpec.
  `,

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'String',
      name: 'targetDAOKey',
      expression: function(of) {
        if ( ! of ) {
          console.error("invalid 'of' for property with targetDAOKey", this.name);
        }
        return foam.String.daoize(of.name);
      }
    },
    {
      name: 'target',
      value: null,
      preSet: function(ol, nu) {
        return this.of.isInstance(nu) ?
          nu.id : nu;
      },
      expression: function(of) {
        return of ? of.ID.value : null;
      }
    }
  ],
});
