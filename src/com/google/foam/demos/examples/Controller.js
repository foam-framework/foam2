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
    'viewArea',
    'lastModel'
  ],

  methods: [
    function initE() {
      this./*add(this.RELOAD).br().*/start('span',{}, this.viewArea$).tag(this.view).end();
      this.delayedReload();
    }
  ],

  actions: [
    function reload() {
      delete foam.__context__.__cache__[this.view.class];
      delete this.classloader.latched[this.view.class];
      delete this.classloader.pending[this.view.class];

      this.classloader.load(this.view.class).then((cls)=>{

        foam.__context__.__cache__[this.view.class] = cls;
        if ( foam.json.Compact.stringify(cls.model_.instance_) != foam.json.Compact.stringify(this.lastModel && this.lastModel.instance_) ) {
          console.log('1', foam.json.Compact.stringify(cls.model_.instance_));
          console.log('2', foam.json.Compact.stringify(this.lastModel && this.lastModel.instance_));
          console.log('reload');
          this.lastModel = cls.model_;
          this.viewArea.removeAllChildren();
          this.viewArea.add(new Date()).br();
          this.viewArea.tag(this.view);
        } else {
//          console.log('no reload');
        }
      });

      this.delayedReload();
    }
  ],

  listeners: [
    {
      name: 'delayedReload',
      isMerged: true,
      mergeDelay: 250,
      code: function() { this.reload(); this.delayedReload(); }
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
              xxxborder: '2px solid black',
              'border-radius': '3px',
              'padding-bottom': '24px'
            }).
            tag('hr').
            add(this.Example.ID, ' ', this.Example.TITLE).
            br().
            add(this.Example.DESCRIPTION).
            br().
            add(this.Example.SCRIPT).
            br().
            tag('div', {}, this.dom$);

            this.onload.sub(this.run.bind(this));
            this.onDetach(this.data.script$.sub(this.run.bind(this)));
        }
      ],

      actions: [
        function run() {
          var self = this;
          this.dom.removeAllChildren();
          var scope = {
            print: function() {
              self.dom.add.apply(self.dom, arguments);
//              self.dom.add(arg);
            },
            add: function() {
              self.dom.add.apply(self.dom, arguments);
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
      displayWidth: 10,
    },
    {
      class: 'String',
      name: 'title',
      displayWidth: 123,
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

  css: '^ { background: #eee;}',

  properties: [
    {
      name: 'data',
      factory: function() {
        return this.EasyDAO.create({
          of: com.google.foam.demos.examples.Example,
          daoType: 'MDAO',
          cache: true,
          testData: [
            { id: '1', name: 'Example',  script: 'print("example1");' },
            { id: '2', name: 'Example2', script: 'print("example2");' },
            { id: '3', name: 'Example3', script: 'print("example3");' },
            { id: '4', name: 'Example4', script: 'print("example4");' }
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
        addClass(this.myClass()).
        add('Examples').
        add(this.DATA);
    }
  ]
});
