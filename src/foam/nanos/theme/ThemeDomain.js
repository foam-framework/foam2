/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'ThemeDomain',

  documentation: 'mapping of domain to Theme. Note: is managed by the ThemeDomainDAO',

  tableColumns: [
    'id',
    'theme'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      label: 'Domain'
    },
    {
      name: 'theme',
      class: 'Reference',
      of: 'foam.nanos.theme.Theme',
      tableCellFormatter: function(value, obj, axiom) {
        obj.theme$find
          .then((theme) => {
            if ( theme ) {
              this.add(theme.toSummary);
            }
          })
          .catch((error) => {
            this.add(value);
          });
      },
    }
  ]
});
