foam.CLASS({
  package: 'foam.core',
  name: 'NumberSet',

  documentation: 'A set of Long values.',

  javaImports: [
    'java.util.ArrayList',
    'java.util.HashSet',
    'java.util.List',
    'java.util.Set'
  ],

  properties: [
    {
      class: 'List',
      name: 'pseudoSet',
      javaType: 'ArrayList<Long>',
      javaFactory: 'return new ArrayList<Long>();',
      factory: function() {
        return [];
      }
    }
  ],

  methods: [
    {
      name: 'add',
      type: 'Boolean',
      args: [
        { name: 'element', type: 'Long' },
      ],
      code: function(element) {
        if ( ! Number.isInteger(element) ) {
          console.error("Element is not an integer");
          return false;
        }

        if ( ! this.pseudoSet.includes(element) ){
          this.pseudoSet.push(element);
          return true;
        }

        return false
      },
      javaCode: `
        List<Long> currentPseudoSet = (ArrayList<Long>) getPseudoSet();

        if ( ! currentPseudoSet.contains(element) ){
          currentPseudoSet.add(element);
          return true;
        }

        return false;
      `
    },
    {
      name: 'remove',
      type: 'Boolean',
      args: [
        { name: 'element', type: 'Long' },
      ],
      code: function(element) {
        if ( ! Number.isInteger(element) ) {
          console.error("Element is not an integer");
          return false;
        }

        if ( this.pseudoSet.includes(element) ){
          var newArray = this.pseudoSet.filter(value => value !== element );
          this.pseudoSet = newArray;
          return true;
        }

        return false
      },
      javaCode: `
        List<Long> currentPseudoSet = (ArrayList<Long>) getPseudoSet();

        if ( currentPseudoSet.contains(element) ){
          currentPseudoSet.remove(element);
          return true;
        }

        return false;
      `
    },
    {
      name: 'contains',
      type: 'Boolean',
      args: [
        { name: 'element', type: 'Long' },
      ],
      code: function(element) {
        if ( ! Number.isInteger(element) ) {
          console.error("Element is not an integer");
          return false;
        }

        return this.pseudoSet.includes(element);
      },
      javaCode: `
        List<Long> currentPseudoSet = (ArrayList<Long>) getPseudoSet();

        return currentPseudoSet.contains(element);
      `
    },
    {
      name: 'getAsRealSet',
      javaType: `Set<Long>`,
      javaCode: `
        return new HashSet<Long>(getPseudoSet());
      `
    },
    {
      name: 'setAsRealSet',
      type: 'void',
      args: [
        { name: 'set', type: 'Set<Long>' },
      ],
      javaCode: `
        setPseudoSet(new ArrayList<Long>(set));
      `
    }
  ]
});
