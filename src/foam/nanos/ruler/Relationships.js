/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.ruler.RuleGroup',
  targetModel: 'foam.nanos.ruler.Rule',
  forwardName: 'rules',
  inverseName: 'ruleGroup',
  cardinality: '1:*'
});
