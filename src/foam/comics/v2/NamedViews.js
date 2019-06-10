/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2.namedViews',
  name: 'NamedViewCollection',
  documentation: `
    The model for a named view that renders a collection of a model
  `,

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'view'
    },
    {
      class: 'String',
      name: 'icon'
    }
  ]
});

foam.CLASS({
  package: 'foam.comics.v2.namedViews',
  name: 'NamedViewInstance',
  documentation: `
    The model for a named view that renders a single instance of a model
  `,

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'view'
    },
    {
      class: 'String',
      name: 'icon'
    }
  ]
}); 