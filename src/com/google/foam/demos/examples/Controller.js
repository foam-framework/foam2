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
      this./*add(this.RELOAD).br().br().*/start('span',{}, this.viewArea$).tag(this.view).end();
      this.delayedReload();
    }
  ],

  actions: [
    function reload() {
      delete foam.__context__.__cache__[this.view.class];
      delete this.classloader.latched[this.view.class];
      delete this.classloader.pending[this.view.class];
      // TODO: remove old stylesheet

      this.classloader.load(this.view.class).then((cls)=>{

        foam.__context__.__cache__[this.view.class] = cls;
        if ( foam.json.Compact.stringify(cls.model_.instance_) != foam.json.Compact.stringify(this.lastModel && this.lastModel.instance_) ) {
          console.log('reload');
          this.lastModel = cls.model_;
          this.viewArea.removeAllChildren();
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
      mergeDelay: 200,
      code: function() { this.reload(); /*this.delayedReload();*/ }
    }
  ]
});


foam.CLASS({
  package: 'com.google.foam.demos.examples',
  name: 'Example',

  classes: [
    {
      name: 'CitationView',
      extends: 'foam.u2.View',

      requires: [
        'com.google.foam.demos.examples.Example',
        'foam.u2.Element'
      ],

      properties: [
        'dom'
      ],

      css: `
        ^ { margin-bottom: 36px; }
        ^ .property-text { border: none; padding: 10 0; }
        ^ .property-code { margin-bottom: 12px; }
        ^ .property-title { float: left; }
        ^ .property-id { float: left; margin-right: 12px; }
      `,

      methods: [
        function initE() {
          this.SUPER();

          this.
            addClass(this.myClass()).
            style({
              width: '100%',
              xxxborder: '2px solid black',
              'border-radius': '3px',
              'padding-bottom': '24px'
            }).
            tag('hr').
            start('h3').
              add(this.Example.ID, ' ', this.Example.TITLE).
            end().
            br().
            add(this.Example.TEXT).
            br().
            add(this.Example.CODE).
            br().
            start('b').add('Output:').end().
            br().br().
            tag('div', {}, this.dom$);

            this.onload.sub(this.run.bind(this));
            this.onDetach(this.data.code$.sub(this.run.bind(this)));
        }
      ],

      actions: [
        function run() {
          var self = this;
          this.dom.removeAllChildren();
          var scope = {
            E: function(opt_nodeName) {
              return self.Element.create({nodeName: opt_nodeName});
            },
            print: function() {
              self.dom.add.apply(self.dom, arguments);
              self.dom.br();
//              self.dom.add(arg);
            },
            add: function() {
              self.dom.add.apply(self.dom, arguments);
            }
          };
          with ( scope ) {
            eval(self.data.code);
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
      comparePropertyValues: function(id1, id2) {
        var a1 = id1.split('.'), a2 = id2.split('.');
        for ( var i = 0 ; i < Math.min(a1.length, a2.length)-1 ; i++ ) {
          var c = foam.util.compare(parseInt(a1[i]), parseInt(a2[i]));
          if ( c ) return c;
        }
        return foam.util.compare(a1.length, a2.length);
      },
      view: {
        class: 'foam.u2.ReadWriteView', nodeName: 'span'
      }
    },
    {
      class: 'String',
      name: 'title',
      displayWidth: 123,
      view: {
        class: 'foam.u2.ReadWriteView', nodeName: 'span'
      }
    },
    {
      class: 'String',
      name: 'text',
      adapt: function(_, text) { return text.trim(); },
      documentation: 'Description of the script.',
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 120 }
    },
    {
      class: 'Code',
      name: 'code',
      adapt: function(_, s) {
        if ( foam.String.isInstance(s) ) return s.trim();
        s         = s.toString();
        var start = s.indexOf('{');
        var end   = s.lastIndexOf('}');
        return ( start >= 0 && end >= 0 ) ? s.substring(start + 2, end) : '';
      },
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
          return Promise.resolve(eval(this.code));
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

  css: '^ { background: white; }',

  properties: [
    {
      name: 'data',
      factory: function() {
        return this.EasyDAO.create({
          of: com.google.foam.demos.examples.Example,
          daoType: 'MDAO',
          cache: true,
          testData: this.createTestData()
        }).orderBy(com.google.foam.demos.examples.Example.ID);
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
        start('h1').
          add('U2 by Example').
        end().
        add(this.DATA);
    },

    function createTestData() {
      var s = `
## A
##  B
##   C1
##   C2
## Welcome
First U2 Example
--
add('testing');

## Background
First U2 Example
--
add('testing');

## DSL
## Intro1
## Intro2
##  SubIntro
## Fluent Interface
## nodeName
## v2
## ControllerMode
## DisplayMode
## Borders
##  content
## CSS
## CSS Variables
## inheritCSS
## ViewSpec
## Entities / entity() / nbsp()
## onKey
## Element States
##  state
##  onload
##  onunload
## Tooltips
## shown / show() / hide()
## focused / focus() / blur()
## Creating a Component
##  initE
## Keyboard Shortcuts
## el() and id
## E()
## addClass() / cssClass() / addClasses()
## enableCls() / enableClass()
## myClass()
## removeClass()
## setAttribute()
## removeAttribute()
## appendChild()
## removeChild()
## replaceChild()
## insertBefore()
## insertAfter()
## remove()
## addEventListener()
## removeEventListener()
## on()
## attr()
## attrs()
## style()
## tag()
## br()
## startContext() / endContext()
## start() / end()
## i18n
##  Messages
##  translate()
## add()
##  adding properties
##  toE()
##  view:
## addBefore()
## removeAllChildren()
## setChildren()
## repeat()
## daoSlot()
## select()
## call()
## callOn
## callIf
## callIfElse
## forEach()
## write()
## Tags
##  attributes
##  registerElement
##  elementForName
## View
##  fromProperty()
## Controller
## Views
##  ActionView
## StackView
## More
      `;
      var a = [];
      var id = [];
      var e;
      var mode = 'text';
      s = s.substring(1).split('\n').forEach(l => {
        if ( l.startsWith('##') ) {
//          e = this.Example.create({id: i++, title: l.substring(3)});
          var depth = l.substring(2).match(/^ */)[0].length;
          id.length = depth;
          id[depth-1] = (id[depth-1] || 0)+1;
          e = {id: id.join('.') + '.', title: l.substring(3), code: '', text: ''};
          a.push(e);
          mode = 'text';
        } else if ( l.startsWith('--') ) {
          mode = 'code';
        } else if ( ! e ) {
        } else if ( mode == 'text' ) {
          e.text += l + '\n';
        } else {
          e.code += l + '\n';
        }
      });
      return a;
    }
  ]
});
