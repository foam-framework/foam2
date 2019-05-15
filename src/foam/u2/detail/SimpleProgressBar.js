foam.CLASS({
  package: 'foam.u2.detail',
  name: 'SimpleProgressBar',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      width: 100%;

      /* Default value */
      height: 2px;
    }

    ^bar {
      height: 100%;

      /* Default value */
      background-color: green;

      -webkit-transition: all .10s linear;
      -moz-transition: all .10s linear;
      -ms-transition: all .10s linear;
      -o-transition: all .10s linear;
      transition: all .10s linear;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'current'
    },
    {
      class: 'Int',
      name: 'max'
    },
    {
      class: 'Int',
      name: 'percentage',
      expression: function(current, max) {
        return ( current / max ) * 100;
      }
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .addClass(this.myClass('bar'))
          .style({
            'width' : this.percentage$.map(function(v) { return v + '%'; })
          })
        .end();
    }
  ]
});
