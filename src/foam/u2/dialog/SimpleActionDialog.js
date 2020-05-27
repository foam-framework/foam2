foam.CLASS({
  package: 'foam.u2.dialog',
  name: 'SimpleActionDialog',
  extends: 'foam.u2.Controller',

  imports: [
    'closeDialog'
  ],

  css: `
    ^ .headerTitle {
      font-family: Lato;
      font-size: 24px;
      font-weight: 900;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
    }

    ^ .Container > *:not(:last-of-type) {
      margin-bottom: 24px;
    }
    
    ^ {
      margin: 24px;
    }
  `,

  properties: [
    {
      name: 'title',
      class: 'String'
    },
    {
      name: 'body',
      class: 'String'
    },
    {
      name: 'context'
    },
    {
      name: 'actions',
      class: 'Array'
    },
    {
      name: 'closeOnChoice',
      class: 'Boolean',
      value: true
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .startContext(this.context)
        .start().addClass(this.myClass())
        .start().addClass('Container')
          .start().addClass('headerTitle').add(this.title).end()
          .start().addClass('content')
            .add(this.body)
          .end()
          .start().addClass('actions')
            .forEach(this.actions, function (action) {
              var a = action.clone();
              a.code = function (...args) {
                self.closeDialog();
                return action.code.call(action, ...args);
              }
              this.add(a);
            })
          .end()
        .end()
        .end()
        .end();
    },
  ]
});
