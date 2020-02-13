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
