/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.script.Script',
  targetModel: 'foam.nanos.script.ScriptEvent',
  forwardName: 'events',
  inverseName: 'owner',
  cardinality: '1:*',
  sourceProperty: {
    section: 'events'
  }
});
