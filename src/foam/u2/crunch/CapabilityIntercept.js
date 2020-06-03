foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityIntercept',

  properties: [
    {
      name: 'capabilityOptions',
      class: 'StringArray'
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