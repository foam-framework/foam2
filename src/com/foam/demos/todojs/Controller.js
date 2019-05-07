/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foam.demos.todojs',
  name: 'Controller',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions' // we use it for this.COUNT
  ],

  requires: [
    'com.foam.demos.todojs.TodoView',
    'com.foam.demos.todojs.Todo',
    'foam.dao.ArrayDAO',
    'foam.dao.EasyDAO',
    'foam.u2.DAOList',
    'foam.u2.DetailView',
    'foam.u2.CheckBox'
  ],

  exports: [
    'as data',
  ],

  css: `
    .com-foam-demos-todojs-TodoView-done-true {//we can replace this by ^true
      text-decoration: line-through;
      color: grey;
    }
    h2 { color: #aaa; }
    body, input[text], button { color: #888; font-family: Cambria, Georgia; }
  `,

  properties: [
    {
      class: 'String',
      name: 'todoNow',
      view: {
        class: 'foam.u2.TextField',
        onKey: true
      }
    },
    {
      name: 'todoDAO',
      factory: function() {
        return this.EasyDAO.create({
          of: com.foam.demos.todojs.Todo,
          seqNo: true,
          cache: true,
          daoType: 'LOCAL',
          testData: [
            {
              id: 1,
              action: 'bought a ticket'
            },
            {
              action: 'sign a contract',
              done: true
            },
            {
              action: 'send email',
              done: true
            },
            {
              action: 'get paycheck',
              done: true
            },
          ]
        });
      },
      view: {
        class: 'foam.u2.DAOList',
        rowView: {
          class: 'com.foam.demos.todojs.TodoView'
        }
      }
    },
    'total',
    'shownAction'
  ],

  methods: [

    function initE() {
      var self = this;

      this.todoDAO.select(this.COUNT()).then(function(c) {
        self.total = c.value;
      });

      this.todoDAO.where(this.EQ(this.Todo.DONE, true)).select(this.COUNT()).then(function(c) {
        self.shownAction = c.value;
      });

      this.start('h2').add('Todo').end(). //<h2>Todo</h2>

        start('span').
          add(this.shownAction$, ' of ', this.total$, ' remaining').add('[').
          start(this.REMOVE_ACTION, { data: this }).add('archive').end().
          add(']').
        end().
        add(this.TODO_DAO).
        start().add('Add new action: ', this.TODO_NOW, ' ').addClass(this.myClass('btn-primary')).add(this.ADD_TODO).end()
      ;
    },
  ],

  actions: [
    //TODO refrech after add an item
    {
      name: 'addTodo',
      label: '+',
      speechLabel: 'add',
      toolTip: 'add',
      code: function() {
        this.todoDAO.put(this.Todo.create({
          action: this.todoNow
        }));
        this.todoNow = '';
      }
    },
    {
      name: 'removeAction',
      label: 'X',
      speechLabel: 'delete',
      toolTip: 'delete',
      //iconFontName: 'delete_forever',
      code: function() {
        this.todoDAO.where(this.EQ(this.Todo.DONE, true)).removeAll();
      }
    },
  ]
});
