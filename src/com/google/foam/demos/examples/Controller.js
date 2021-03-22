/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ViewReloader',
  extends: 'foam.u2.Controller',

  imports: [ 'classloader' ],

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'view'
    },
    'viewArea'
  ],

  methods: [
    function initE() {
      this.add(this.RELOAD).br().start('span',{}, this.viewArea$).tag(this.view).end();
    }
  ],

  actions: [
    function reload() {
      debugger;
      this.viewArea.removeAllChildren();

      delete foam.__context__.__cache__[this.view.class];
      // foam.register(null, this.view.class);
      this.viewArea.add(new Date()).br();

      this.classloader.load(this.view.class).then(()=>{
        this.viewArea.tag(this.view);
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.foam.demos.examples',
  name: 'Example',

  classes: [
    {
      name: 'CitationView',
      extends: 'foam.u2.CitationView',

      requires: [ 'com.google.foam.demos.examples.Example' ],

      properties: [
        'dom'
      ],

      methods: [
        function initE() {
          //this.SUPER();

          this.
            style({
              width: '100%',
              border: '2px solid black',
              'border-radius': '3px'
            }).
            add(this.Example.ID, ' ', this.Example.TITLE).
            br().
            add(this.Example.DESCRIPTION).
            br().
            add(this.Example.SCRIPT).
            br().
            tag('div', {}, this.dom$);

            this.onload.sub(this.run.bind(this));
        }
      ],

      actions: [
        function run() {
          var self = this;
          var scope = {
            print: function(arg) {
              self.dom.add(arg);
            }
          };
          with ( scope ) {
            eval(self.data.script);
          }
        }
      ]
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      displayWidth: 8,
    },
    {
      class: 'String',
      name: 'title',
      displayWidth: 120,
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of the script.',
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 120 }
    },
    {
      class: 'Code',
      name: 'script',
      view: { class: 'foam.u2.tag.TextArea', rows: 12, cols: 120 }
    }
  ],

  methods: [
    {
      name: 'runScript',
      code: function() {
        var log = () => {
          this.output += Array.from(arguments).join('') + '\n';
        };
        try {
          with ({ log: log, print: log, x: this.__context__ })
          return Promise.resolve(eval(this.script));
        } catch (err) {
          this.output += err;
          return Promise.reject(err);
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'com.google.foam.demos.examples',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [
    'com.google.foam.demos.examples.Example',
    'foam.dao.EasyDAO',
    'foam.u2.DAOList'
  ],

  properties: [
    {
      name: 'data',
      factory: function() {
        return this.EasyDAO.create({
          of: com.google.foam.demos.examples.Example,
          daoType: 'MDAO',
          cache: true,
          testData: [
            { id: '1', name: 'Example',  script: 'console.log("foo");print("example1");' },
            { id: '2', name: 'Example2', script: 'print("example2");'  },
            { id: '3', name: 'Example3', script: 'print("example3");'  },
          ]
        });
      },
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'com.google.foam.demos.examples.Example.CitationView' }
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.
        add('Examples').
        add(this.DATA);
    }
  ]
});
