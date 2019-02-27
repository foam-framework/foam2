/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RuleHistory',
  documentation: 'Represents rule execution history.',
  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Creation date.'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.ruler.Rule',
      name: 'ruleId',
      documentation: 'The applied rule.'
    },
    {
      class: 'Object',
      name: 'ObjectId',
      visibility: 'RO',
      documentation: 'Id of the object onwhich rule is applied.'
    },
    {
      class: 'String',
      name: 'objectDaoKey',
      visibility: 'RO',
      documentation: 'DAO name of the object'
    },
    {
      class: 'Object',
      name: 'result',
      documentation: 'Result of rule execution.'
    }
  ]
});
