/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityIntercept',

  properties: [
    {
      name: 'exception',
      class: 'FObjectProperty',
      of: 'foam.box.CapabilityRequiredRemoteException'
    },
    {
      name: 'capabilityOptions',
      class: 'StringArray',
      expression: function (exception) {
        return exception.capabilityOptions;
      }
    },
    {
      name: 'capableRequirements',
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.lite.Capable',
      expression: function (exception) {
        return exception.capableRequirements;
      }
    },
    {
      name: 'daoKey',
      class: 'String'
    },
    {
      name: 'resolve',
      class: 'Function'
    },
    {
      name: 'resend',
      class: 'Function'
    },
    {
      name: 'aquired',
      class: 'Boolean',
      value: false
    },
    {
      name: 'cancelled',
      class: 'Boolean',
      value: false
    },
    {
      name: 'promise',
      expression: function (aquired, cancelled) {
        if ( aquired ) return Promise.resolve();
        if ( cancelled ) return Promise.reject();
        var self = this;
        return new Promise(function (resolve, reject) {
          var s1, s2;
          s1 = self.aquired$.sub(() => {
            s1.detach();
            s2.detach();
            resolve();
          })
          s1 = self.cancelled$.sub(() => {
            s1.detach();
            s2.detach();
            reject();
          })
        });
      }
    }
  ]
});