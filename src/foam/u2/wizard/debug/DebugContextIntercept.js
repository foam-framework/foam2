/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'DebugContextIntercept',
  topics: ['stubMethodCalled'],

  requires: [
    'foam.u2.wizard.debug.ServiceEvent'
  ],

  methods: [
    function createInterceptedValues(x) {
      var self = this;
      var subContext = {};

      for ( let key in x ) {
        let contextValue = null;
        try {
          contextValue = x[key];
        } catch {
          continue;
        }
        if ( foam.core.Slot.isInstance(contextValue) ) continue;
        if ( ! foam.core.FObject.isInstance(contextValue) ) continue;
        let stubMethods = contextValue.cls_.getAxiomsByClass(foam.core.StubMethod)
          .map(ax => ax.name);
        if ( stubMethods.length == 0 ) continue;
        subContext[key] = new Proxy(contextValue, {
          get: function (target, prop) {
            if ( stubMethods.includes(prop) ) {
              return function(...args) {
                self.stubMethodCalled.pub(self.ServiceEvent.create({
                  serviceName: key,
                  methodName: prop,
                  arguments: args
                }));
                return contextValue[prop].call(target, ...args);
              }
            }
            return contextValue[prop];
          }
        })
      }
      subContext['debugContextIntercept'] = this;
      return subContext;
    }
  ]
});
