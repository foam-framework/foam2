foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.theme.Theme',
  targetModel: 'foam.nanos.auth.User',
  cardinality: '1:*',
  forwardName: 'users',
  inverseName: 'personalTheme',
  sourceProperty: {
    hidden: true,
    visibility: 'HIDDEN',
  },
  targetProperty: {
    section: 'administrative'
  }
});
