foam.CLASS({
  package: 'foam.flow.widgets',
  name: 'PropertyShortSummary',
  extends: 'foam.u2.Element',
  documentation: `
    Brief summary of properties for overview documentation.
  `,

  properties: [
    {
      name: 'of',
      class: 'Class'
    },
    {
      name: 'whitelist',
      class: 'StringArray'
    }
  ],

  methods: [
    function initE() {
      var props = this.of.getAxiomsByClass(foam.core.Property);
      if ( this.whitelist.length > 0 ) {
        props = props.filter(p => this.whitelist.includes(p.name));
      }

      var self = this;
      this
        .start('table')
          .start('tr')
            .start('th').add('Property').end()
            .start('th').add('Type').end()
            .start('th').add('Documentation').end()
          .end()
          .forEach(props, function (p) {
            this
              .start('tr')
                .start('td').add(p.name).end()
                .start('td').add(self.toFriendlyType(p)).end()
                .start('td').add(p.documentation).end()
              .end()
          })
        .end()
        ;
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