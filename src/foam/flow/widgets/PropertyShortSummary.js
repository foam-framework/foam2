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

      this
        .start('table')
          .start('th')
            .start('td').add('Property').end()
            .start('td').add('Property').end()
          .end()
          .forEach(props, function (p) {
            this
              .start('tr')
                .start('td').add(p.name).end()
                .start('td').add(p.documentation).end()
              .end()
          })
        .end()
        ;
    }
  ],
});