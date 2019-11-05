foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.ruler.RuleGroup',
  targetModel: 'foam.nanos.ruler.Rule',
  forwardName: 'rules',
  inverseName: 'ruleGroup',
  cardinality: '1:*'
});
