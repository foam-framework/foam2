/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.widgets',
  name: 'AxiomShortSummary',
  extends: 'foam.u2.Element',
  documentation: `
    Brief summary of axioms for overview documentation.
  `,

  css: `
    ^preformatted {
      white-space: pre;
    }
  `,

  properties: [
    {
      name: 'of',
      class: 'Class'
    },
    {
      name: 'whitelist',
      class: 'StringArray'
    },
    {
      name: 'ownAxioms',
      class: 'Boolean'
    },
    {
      name: 'axiomClass',
      class: 'Class',
      value: 'foam.core.Axiom'
    }
  ],

  methods: [
    function initE() {
      var getAxioms = `get${ this.ownAxioms ? 'Own' : '' }AxiomsByClass`;
      var axs = this.of[getAxioms](this.axiomClass);
      if ( this.whitelist.length > 0 ) {
        axs = axs.filter(ax => this.whitelist.includes(ax.name));
      }

      var self = this;
      this
        .start('table')
          .start('tr')
            .start('th').add('Name').end()
            .callOn(self, 'generateAxiomClassHeadings')
            .start('th').add('Documentation').end()
          .end()
          .forEach(axs, function (ax) {
            this
              .start('tr')
                .start('td').add(ax.name).end()
                .callOn(self, 'generateAxiomClassFields', [ax])
                .start('td')
                  .addClass(self.myClass('preformatted'))
                  .add(ax.documentation)
                .end()
              .end()
          })
        .end()
        ;
    },
    function generateAxiomClassHeadings () {},
    function generateAxiomClassFields () {},
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
