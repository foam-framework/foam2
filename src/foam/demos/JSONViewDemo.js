foam.CLASS({
  package: 'foam.demos',
  name: 'JSONViewDemo',
  properties: [
    {
      name: 'property',
      view: {
        class: 'foam.u2.MultiView',
        views: [
          { class: 'foam.u2.view.JSONTextView' },
          { class: 'foam.u2.view.AnyView' }
        ]
      },
      value: 'Hello World'
    }
  ]
});