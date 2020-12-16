/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'FindRuledCommand',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.ruler.RuleGroup',
      name: 'ruleGroup'
    }
  ]
})
