/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.counter',
  name: 'Counter',

  documentation: `Generic model that can be used by multiples daos for reporting purposes(e.g. groupby).`,

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      name: 'name',
      class: 'String',
      documentation: `name is used to differentiate different objects from each other. Most likely you would
        want to do something like x.counterDAO.where(eq(NAME, 'name_created_specifically_for_this_group'))`
    },
    {
      name: 'key',
      class: 'Object',
      documentation: `key is the value by which the result would be grouped`
    }
  ]
});
