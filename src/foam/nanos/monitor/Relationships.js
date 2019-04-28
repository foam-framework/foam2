foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.monitor.Monitor',
  forwardName: 'alarms',
  targetModel: 'foam.nanos.monitor.Alarm',
  inverseName: 'monitor',
  cardinality: '1:*',
});
