foam.CLASS({
  name: 'Test',
  requires: [
    'TestPropView',
  ],
  properties: [
    {
      class: 'Int',
      name: 'someValue',
      view: {
        class: 'TestPropView',
      },
    },
  ],
});
