/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
  package: 'foam.approval',
  name: 'ApprovableAware',
  implements: [
    'foam.core.ContextAware',
    'foam.nanos.auth.LifecycleAware',
    'foam.comics.v2.userfeedback.UserFeedbackAware'
  ],

  methods: [
    {
      name: 'getApprovableKey',
      type: 'String'
    }
  ]
});
