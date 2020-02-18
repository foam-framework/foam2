/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
  package: 'foam.nanos.approval',
  name: 'ApprovableAware',
  implements: [
    'foam.comics.v2.userfeedback.UserFeedbackAware',
    'foam.core.ContextAware',
    'foam.nanos.auth.LifecycleAware',
  ],

  methods: [
    {
      name: 'getApprovableKey',
      type: 'String'
    }
  ]
});
