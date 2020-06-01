
foam.CLASS({
  package: 'foam.u2.borders',
  name: 'MarginBorder',
  extends: 'foam.u2.Element',

  documentation: `
    A border which adds margin to all sides except the bottom.
  `,

  properties: [
    {
      name: 'margin',
      class: 'Int',
      value: 24
    },
    {
      name: 'marginUnit',
      class: 'String',
      value: 'px'
    },

    {
      name: 'marginExpr',
      class: 'String',
      expression: function (margin, marginUnit) {
        return '' + margin + marginUnit;
      }
    }
  ],

  methods: [
    function initE() {
      this
        .style({
          'margin': this.marginExpr$
        })
        ;
    }
  ]
});