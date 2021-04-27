/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'WizardEvent',
  flags: ['web'],

  tableColumns: ['name', 'summary'],

  properties: [
    {
      name: 'id',
      class: 'String',
      factory: function () {
        return foam.uuid.randomGUID();
      }
    },
    {
      name: 'name',
      class: 'String',
      factory: function () {
        return this.cls_.name;
      }
    },
    {
      name: 'summary',
      class: 'String'
    },
    {
      name: 'seqNo',
      class: 'Int'
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'PropertyEvent',
  extends: 'foam.u2.wizard.debug.WizardEvent',
  flags: ['web'],

  properties: [
    {
      name: 'data',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.internal.PropertyUpdate'
    },
    {
      name: 'summary',
      class: 'String',
      expression: function(data) {
        return data && data.path.join('.');
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'ServiceEvent',
  extends: 'foam.u2.wizard.debug.WizardEvent',
  flags: ['web'],

  properties: [
    {
      name: 'serviceName',
      class: 'String'
    },
    {
      name: 'methodName',
      class: 'String'
    },
    {
      name: 'arguments',
      class: 'Array'
    },
    {
      name: 'summary',
      class: 'String',
      expression: function(serviceName, methodName, arguments) {
        return `${serviceName}.${methodName}(...)`;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'WAOEvent',
  extends: 'foam.u2.wizard.debug.WizardEvent',
  flags: ['web'],

  properties: [
    {
      name: 'method',
      class: 'String'
    },
    {
      name: 'summary',
      class: 'String',
      expression: function(method) {
        return method;
      }
    }
  ]
});
