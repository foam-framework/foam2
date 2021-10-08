foam.CLASS({
  name: 'RadioView',
  extends: 'foam.u2.View',

  documentation: 'Example of creating a simple Choice/Radio View.',

  exports: [ 'data as selected' ],

  css: '^ { height: 30px; }',

  properties: [
    'choices',
    {
      name: 'selected',
      factory: function() { return this.choices[0]; }
    }
  ],

  classes: [
    {
      name: 'Choice',
      extends: 'foam.u2.View',
      imports: [ 'selected' ],
      css: `
        ^selected {
          background: /*%PRIMARY5%*/ #e5f1fc!important;
        }
        ^ {
          background: #ccc;
          border-radius: 10px;
          border: 1px solid #bbb;
          float: right;
          margin: 2px;
          padding: 2px;
          text-align: center;
          width: 70px;
        }
      `,
      methods: [
        function initE() {
          this.SUPER();
          this
            .addClass(this.myClass())
            .addClass(this.selected$.map(s => s == this.data[0] ? this.myClass('selected') : ''))
            .add(this.data[1])
            .on('click', this.onSelect);
        }
      ],
      listeners: [
        function onSelect() {
          this.selected = this.data[0];
        }
      ]
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this.start()
        .addClass(this.myClass())
        .forEach(this.choices, function(c) {
          this.add(self.Choice.create({data: c}));
        })
      .end();
    }
  ]
});
