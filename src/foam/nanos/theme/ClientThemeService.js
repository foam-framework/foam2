/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'ClientThemeService',

  implements: [
    'foam.nanos.theme.ThemeService'
  ],

  requires: [
    'foam.box.SessionClientBox',
    'foam.box.HTTPBox'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'Stub',
      name: 'delegate',
      of: 'foam.nanos.theme.ThemeService',
      factory: function() {
        return this.SessionClientBox.create({
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: this.serviceName
          })
        });
      },
      swiftFactory: `
        return SessionClientBox_create([
          "delegate": HTTPBox_create([
            "method": "POST",
            "url": serviceName
          ])
        ])
      `
    }
  ]
});
