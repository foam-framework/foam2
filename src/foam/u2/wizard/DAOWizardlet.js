/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'DAOWizardlet',
  extends: 'foam.u2.wizard.BaseWizardlet',

  properties: [
    {
      name: 'of',
      class: 'Class'
    },
    {
      name: 'data',
      class: 'FObjectProperty',
      of: 'foam.core.FObject',
      factory: function () {
        return this.of.create({}, this.__context__);
      }
    },
    {
      name: 'daoKey',
      class: 'String',
      expression: function (of) {
        return foam.String.daoize(of.name);
      }
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      expression: function (daoKey) {
        return this.__context__[daoKey];
      }
    }
  ],

  methods: [
    {
      name: 'save',
      code: function () {
        return this.dao.put(this.data);
      }
    }
  ]
});
