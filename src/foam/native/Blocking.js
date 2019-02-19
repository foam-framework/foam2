/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.native',
  name: 'BlockingMethod',
  extends: 'foam.core.Method',
  requires: [
    'foam.core.Method'
  ],
  properties: [
    {
      class: 'String',
      name: 'property',
      required: true
    },
    {
      name: 'javaCode',
      getter: function() {
        return `
maybeWaitFor${this.property}();
${this.javaType != 'void' ? 'return ' : ''}get${foam.String.capitalize(this.property)}()
  .${this.name}(${this.args.map(a => a.name).join(', ')});
        `;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.native',
  name: 'Blocking',
  extends: 'FObjectProperty',
  requires: [
    'foam.native.BlockingMethod',
    'foam.core.Method'
  ],
  properties: [
    {
      name: 'methods',
      preSet: function(_, n) {
        return n.map(m => foam.String.isInstance(m) ?
          this.of.getAxiomByName(m) :
          m);
      },
      expression: function(of) {
        return this.of.getOwnAxiomsByClass(this.Method);
      }
    },
    {
      name: 'javaPostSet',
      expression: function(name) {
        return `maybeWaitFor${name}();`;
      }
    }
  ],
  methods: [
    function installInClass(cls) {
      this.SUPER(cls);
      var axioms = this.methods.map(function(m) {
        m = this.BlockingMethod.create(m);
        m.property = this.name;
        return m;
      }.bind(this));
      axioms.push(this.Method.create({
        name: `maybeWaitFor${this.name}`,
        synchronized: true,
        javaCode: `
try {
  if ( ! isPropertySet("${this.name}") ) wait();
  else notifyAll();
} catch (Exception e) {
  throw new RuntimeException(e);
}
        `
      }));
      cls.installAxioms(axioms);
    }
  ]
});