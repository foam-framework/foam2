/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'CannedQuery',
  documentation: `
    A common query that can be stored in a model
  `,

  properties: [
    {
      class: 'String',
      name: 'name',
      hidden: true,
      expression: function(label) {
        // Since these can be used as axioms, provide a unique name based on the label.
        return label.replace(/[^0-9a-z]/gi, '') + '__CannedQuery';
      }
    },
    {
      class: 'String',
      name: 'label'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate',
      expression: function(predicateFactory) {
        return predicateFactory ?
          predicateFactory(foam.mlang.ExpressionsSingleton.create()) :
          null;
      }
    },
    {
      name: 'predicateFactory',
      hidden: true
    }
  ]
}); 
