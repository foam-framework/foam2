/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.heroes',
  name: 'Hero',

  properties: [
    {
      class: 'Int',
      name: 'id',
      final: true // TODO: implement
    },
    {
      class: 'String',
      name: 'name',
      view: { class: 'foam.u2.TextField', onKey: true}
    },
    {
      class: 'Boolean',
      name: 'starred'
    }
  ]
});
