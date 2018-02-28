/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.firebase',
  name: 'AwaitAuthenticationDAO',
  extends: 'foam.dao.PromisedDAO',

  documentation: `A PromiseDAO that will wait to deliver its delegate until
      after Firebase user authentication is complete.`,

  properties: [
    {
      name: 'firebase',
      documentation: `The firebase object:
          https://firebase.google.com/docs/reference/js/firebase`,
      required: true
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'delegate',
      required: true
    },
    {
      name: 'promise',
      factory: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
          this.firebase.auth().onAuthStateChanged(function(user) {
            if ( user ) resolve(self.delegate);
          });
        });
      }
    }
  ]
});
