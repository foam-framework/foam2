/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.widgets',
  name: 'EnumSummary',
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
      var vals = this.of.VALUES;
      if ( this.whitelist.length > 0 ) {
        vals = vals.filter(ax => this.whitelist.includes(ax.name));
      }

      var self = this;
      this
        .start('table')
          .start('tr')
            .start('th').add('Name').end()
            .start('th').add('Documentation').end()
          .end()
          .forEach(vals, function (ax) {
            this
              .start('tr')
                .start('td').add(ax.name).end()
                .start('td').add(ax.documentation).end()
              .end()
          })
        .end()
        ;
    }
  ],
});
