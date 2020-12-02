/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.strategy',
  name: 'StrategizerService',

  documentation: `
    A StrategizerService is something that can return a list of references to
    models that either implement a given interface or subclass a given (possibly
    abstract) class.

    We use the term "strategy" to refer to:

      1. A model that implements an interface. In this case, we say that the
         model is one of many possible strategies for that interface.
      2. A model that extends / is a subclass of a desired model. In this case,
         we refer to the subclass model as one of many possible strategies for
         the desired model.
    
    Hence, a StrategizerService will give you references to strategies for
    something you want, which we refer to as the "desired model". The desired
    model might be an interface, abstract base class, or a concrete class.

    Example of use of Strategizer on FObjectView:

    name: 'exampleProp',
    view: function(_, X) {
      let predicate = expr.AND(
          expr.EQ(foam.strategy.StrategyReference.DESIRED_MODEL_ID, 'foam.nanos.auth.User'),
          expr.IN(foam.strategy.StrategyReference.STRATEGY, [foam.lookup('foam.nanos.auth.SomeUserClass'), foam.lookup('foam.nanos.auth.AnotherUserClass') ])
      );
      return foam.u2.view.FObjectView.create({
        data: X.data.exampleProp,
        of: foam.nanos.auth.User,
        persistantData: { website: X.data.user.website },
        predicate: predicate
      }, X);
    }

    - The FObjectView will persist X.data.user.website throughout any class selections.
    - Strategizer class options will include SomeUserClass and AnotherUserClass excluding all other user subclasses. Granted the user has permissions to the strategies and if those classes exist.
  `,

  methods: [
    {
      name: 'query',
      async: true,
      type: 'foam.strategy.StrategyReference[]',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'String',
          name: 'desiredModelId',
          documentation: 'The full id of a model, abstract base class, or an interface that you desire a strategy for.'
        },
        {
          type: 'String',
          name: 'target',
          documentation: 'Optional. If specified, the Strategizer will include StrategyReferences that are not generally applicable, but are applicable to the target.'
        },
        {
          name: 'strategyPredicate',
          documentation: 'Provide a unique predicate to strategizer query. Useful when omitting or extending entries based on class types.'
        }
      ]
    }
  ]
});
