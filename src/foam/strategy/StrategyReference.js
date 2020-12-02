/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.strategy',
  name: 'StrategyReference',

  documentation: `
    A reference to a strategy. See the documentation on
    foam.strategy.StrategizerService for more information.
  `,

  tableColumns: [
    'desiredModelId',
    'target',
    'strategy'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      documentation: 'A GUID.'
    },
    {
      class: 'String',
      name: 'desiredModelId',
      documentation: `
        The id of the model that the referenced strategy is a strategy for.
      `,
      help: 'The id of the model that the referenced strategy is a strategy for.',
      required: true
    },
    {
      class: 'Class',
      name: 'strategy',
      documentation: 'The strategy for the desired model.',
      help: 'The strategy for the desired model.',
      required: true
    },
    {
      class: 'String',
      name: 'target',
      documentation: `
        This is a tag that the strategizer service can look at to return more
        specific results in certain situations. If one has a strategy that is
        only applicable in certain situations or to certain models, then the
        StrategyReference for that strategy should set the this property to a
        string. Doing so signals that the strategy being referenced is not
        generally applicable and thus shouldn't be returned by the Strategizer
        service when a user queries it if no target is specified, even if the
        desired model id matches. However, if the user _does_ specify the target
        string when querying the Strategizer, then the Strategizer can return
        both the StrategyReferences where the desiredModelId matches and the
        target is not set and the StrategyReferences where the desiredModelId
        matches and the target is set and matches the one provided by the user.
        
        For example, imagine a strategy for the 'Outputter' interface that
        outputs transactions in ISO20022 format, which is only applicable to
        transactions. If the user queried the Strategizer for 'Outputter'
        without specifying a target, then the ISO20022 outputter wouldn't show
        up in the results. But if the user queried the Strategizer for
        'Outputter' and target = 'Transaction', then the special outputter would
        be included in the results.
      `
    },
    {
      class: 'String',
      name: 'label',
      documentation: 'Override the default model label for Strategizer Choice selections.'
    }
  ]
});
