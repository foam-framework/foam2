foam.CLASS({
  package: 'tutorial',
  name: 'Controller',
  extends: 'foam.u2.Element',

  exports: [
    'as data',
  ],

  properties: [
    {
      name: 'search',
      class: 'String',
      view: { class: 'foam.u2.TextField', onKey: true }
    },
    {
      name: 'order',
      value: Phone.NAME,
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          [Phone.NAME, 'Alphabetical'],
          [Phone.AGE, 'Newest']
        ]
      }
    },
    { name: 'dao', value: phones },
    {
      name: 'filteredDAO',
      class: 'foam.dao.DAOProperty',
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'tutorial.PhoneCitationView' }
      },
      expression: function (dao, search, order) {
        var expr = foam.mlang.Expressions.create();
        return dao.orderBy(order).where(expr.OR(expr.CONTAINS_IC(Phone.SNIPPET, search), expr.CONTAINS_IC(Phone.SNIPPET, search)));
      }
    },
    'image'
  ],

  methods: [
    function initE() {
      this.initHTML();
      window.addEventListener('hashchange', this.initHTML.bind(this));
    },

    function initHTML() {
      var self = this;
      this.removeAllChildren();

      if (window.location.hash) {
        var expr = foam.mlang.Expressions.create();
        this.dao.where(expr.EQ(Phone.ID, window.location.hash.substring(1))).select().then(function (sink) {
          var phone = sink.a[0];
          self.add(tutorial.PhoneDetialView.create({ data: phone }));
        })
      } else {
        this
          .add('Search: ').add(this.SEARCH)
          .br()
          .add('Sort by: ').add(this.ORDER)
          .br()
          .start('ul')
            .addClass('phones').add(this.FILTERED_DAO)
          .end();
      }
    }
  ]
});
