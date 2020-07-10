foam.CLASS({
  package: 'foam.u2.svg.arrow',
  name: 'Arrow',

  properties: [
    {
      name: 'line',
      class: 'FObjectProperty',
      of: 'foam.u2.svg.arrow.ArrowLine'
    },
    {
      name: 'leftHead',
      class: 'FObjectProperty',
      of: 'foam.u2.svg.arrow.ArrowHead'
    },
    {
      name: 'rightHead',
      class: 'FObjectProperty',
      of: 'foam.u2.svg.arrow.ArrowHead'
    },
    {
      name: 'start',
      class: 'Array'
    },
    {
      name: 'end',
      class: 'Array'
    }
  ],
});