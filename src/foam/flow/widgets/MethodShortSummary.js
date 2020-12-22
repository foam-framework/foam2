/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.widgets',
  name: 'MethodShortSummary',
  extends: 'foam.flow.widgets.AxiomShortSummary',
  documentation: `
    Brief summary of properties for overview documentation.
  `,

  properties: [
    ['axiomClass', 'foam.core.Method'],
    ['ownAxioms', true]
  ],

  css: `
    ^argumentRow {
      display: flex;
      justify-content: space-between;
    }
    ^rowGap {
      flex: 1 0 10px;
    }
  `,

  methods: [
    function generateAxiomClassHeadings(el) {
      el.start('th').add('Type').end();
      el.start('th').add('Arguments').end();
    },
    function generateAxiomClassFields(el, m) {
      var self = this;
      // If method is a javascript function, pull args from there
      var args = m.args;
      if ( ( ! args || ! args.length ) && m.code ) {
        args = foam.Function.argNames(m.code).map(name => ({
          type: 'Any',
          name: name
        }))
      }
      el
        .start('td').add(m.type).end()
        .start('td')
          .forEach(args, function (arg) {
            this
              .start()
                .addClass(self.myClass('argumentRow'))
                .start().add(arg.name).end()
                .start().addClass(self.myClass('rowGap')).end()
                .start().add(arg.type).end()
              .end()
          })
        .end();
    },
    function toFriendlyType(p) {
      var propCls = p.cls_.id;
      const prefix = 'foam.core.';
      if ( propCls.startsWith(prefix) ) {
        propCls = propCls.slice(prefix.length);
      }
      if ( propCls == 'FObjectProperty' ) {
        return 'FObject of ' + p.of.id;
      }
      if ( propCls == 'FObjectArray' ) {
        return 'FObject[] of ' + p.of.id;
      }
      if ( propCls == 'Enum' ) {
        return 'Enum of ' + p.of.id;
      }
      if ( propCls == 'foam.dao.DaoSpec' ) {
        return 'DAO of ' + p.of.id;
      }
      return propCls;
    }
  ],
});
