/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'ModelBrowser',
  extends: 'foam.u2.Element',
  documentation: 'Show UML & properties for passed in models',

  requires: [
    'foam.doc.ClassList',
    'foam.doc.DocBorder',
    'foam.doc.SimpleClassView',
    'foam.doc.UMLDiagram',
    'foam.nanos.boot.NSpec'
  ],

  imports: [
    'nSpecDAO'
  ],

  exports: [
    'showInherited',
    'showOnlyProperties'
  ],

  properties: [
    {
      name: 'models',
      value: []
    },
    {
      name: 'showOnlyProperties',
      value: true
    },
    {
      name: 'showInherited',
      value: false
    }
  ],

  css: `
    ^ {
      display: flow-root;
      height: auto;
      width: 700px;
      margin: 20px;
    }
    ^ .foam-doc-UMLDiagram{
      width: 700px;
      margin: 0;
      margin-bottom: 20px;
    }
    ^ .foam-doc-UMLDiagram canvas{
      width: 700px;
    }
    ^ .foam-u2-view-TableView-foam-doc-PropertyInfo{
      width: 700px;
      float: left;
      margin-top: 20px;
      margin-bottom: 30px;
    }
    ^ .net-nanopay-ui-ActionView-printPage{
      margin-top: 20px;
    }
    @media print{
      .foam-u2-view-TableView-th-editColumns{
        display: none;
      }
      ^ .net-nanopay-ui-ActionView-printPage{
        display: none;
      }
      .net-nanopay-ui-topNavigation-TopNav{
        display: none;
      }
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.start().addClass(this.myClass())
        .start('h2').add('Model Browser').end()
        .start().add(this.PRINT_PAGE).end()
        .select(this.nSpecDAO, function(n) {
          var model = self.parseClientModel(n);
          if ( ! model ) return this.E();
          return this.E().
            start().style({ 'font-size': '20px', 'margin-top': '20px' }).
              add('Model ' + model).
            end().
            //tag(self.UMLDiagram.create({ data: model })).
            tag(self.SimpleClassView.create({ data: model }));
        })
      .end();
    },

    function parseClientModel(n) {
      var cls = JSON.parse(n.client);
      var clsName = cls.of ? cls.of : cls.class;
      return foam.lookup(clsName, true);
    }
  ],

  actions: [
    {
      name: 'printPage',
      label: 'Print',
      code: function() {
        window.print();
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomLink',
  extends: 'foam.u2.View',

  imports: [ 'browserPath' ],

  properties: [
    {
      class: 'Class',
      name: 'cls'
    },
    {
      name: 'axiomName'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.setNodeName('a').
        attr('href', `#${this.cls.id}-${this.axiomName}`).
        add(this.axiomName);
    }
  ],
});

foam.CLASS({
  package: 'foam.doc',
  name: 'PropertyAxiom',
  requires: [
    'foam.doc.AxiomLink',
  ],
  ids: ['name'],
  tableColumns: ['type', 'name'],
  properties: [
    'axiom',
    'parentId',
    {
      class: 'String',
      name: 'name',
      label: 'Name and Description',
      expression: function(axiom$name) { return axiom$name },
      tableCellFormatter: function(_, o) {
        this.
          start('code').
            start(o.AxiomLink, { cls: o.parentId, axiomName: o.axiom.name }).
            end().
          end().
          start('div').
            addClass('foam-doc-AxiomTableView-documentation').
            add(o.axiom.documentation).
          end()
      },
    },
    {
      class: 'String',
      name: 'type',
      expression: function(axiom) { return axiom.model_.name },
      tableCellFormatter: function(v) {
        this.start('code').add(v).end();
      },
    },
  ],
})

foam.CLASS({
  package: 'foam.doc',
  name: 'MethodAxiom',
  requires: [
    'foam.doc.AxiomLink',
  ],
  ids: ['name'],
  tableColumns: ['type', 'name'],
  properties: [
    'axiom',
    'parentId',
    {
      class: 'String',
      name: 'name',
      label: 'Method and Description',
      expression: function(axiom$name) { return axiom$name },
      tableCellFormatter: function(_, o) {
        this.
          start('code').
            start(o.AxiomLink, { cls: o.parentId, axiomName: o.axiom.name }).
            end().
            add('( ').
            forEach(o.axiom.args, function(arg, i) {
              this.
                callIf(i > 0, function() { this.add(',') }).
                add(' ').
                add(arg.of || 'Object'). // TODO which value should be used?
                add(' ').
                add(arg.name)
            }).
            add(' )').
          end().
          start('div').
            addClass('foam-doc-AxiomTableView-documentation').
            add(o.axiom.documentation).
          end()
      },
    },
    {
      class: 'String',
      name: 'type',
      expression: function(axiom$returns) {
        return axiom$returns || 'Void';
      },
      tableCellFormatter: function(v) {
        this.start('code').add(v).end();
      },
    },
  ],
})

foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomTableView',
  extends: 'foam.u2.view.UnstyledTableView',
  css: `
    ^ {
      border-collapse: collapse;
      width: 100%;
      font-size: 14px;
    }
    ^ thead {
      background-color: #dee3e9;
    }
    ^ th {
      text-align: left;
      padding: 8px 3px 3px 7px;
    }
    ^ tbody > tr:nth-child(odd) {
      background-color: #f6f9f9;
    }
    ^ tbody > tr:nth-child(even) {
      background-color: #ffffff;
    }
    ^ td {
      vertical-align: top;
      padding: 8px 3px 3px 7px;
    }
    ^documentation {
      margin: 3px 10px 2px 0px;
    }
  `
});

foam.CLASS({
  package: 'foam.doc',
  name: 'SimpleClassView',
  extends: 'foam.u2.View',
  
  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.dao.ArrayDAO',
    'foam.doc.ClassLink',
    'foam.doc.Link',
    'foam.doc.PropertyInfo',
    'foam.u2.view.TableView',
    'foam.core.Implements',
    'foam.core.Property',
    'foam.core.Method',
    'foam.doc.AxiomTableView',
    'foam.doc.PropertyAxiom',
    'foam.doc.MethodAxiom',
    'foam.doc.AxiomLink',
  ],

  imports: [
    'auth',
    'selectedAxiom',
    'showInherited',
    'showOnlyProperties'
  ],

  properties: [
    'classPropertyTableView',
  ],

  css: `
    ^header {
      background-color: #dee3e9;
      border: 1px solid #d0d9e0;
      margin-top: 14px;
      margin-bottom: 0px;
      padding: 7px 5px;
    }
    ^footer {
      background-color: #ffffff;
      padding: 7px 5px;
      font-family: monospace;
      line-height: 1.5em;
    }
    ^footer span:after {
      content: ", ";
    }
    ^footer span:last-child:after {
      content: "";
    }
  `,

  methods: [
    function fillAxiomDAO(dao, docAxiomCls, axiomCls) {
      var m = this.data;
      while ( true ) {
        m.getOwnAxiomsByClass(axiomCls).forEach(function(a) {
          // TODO check permissions before putting.
          dao.put(docAxiomCls.create({
            axiom: a,
            parentId: m.id
          }));
        });
        if ( m.id == 'foam.core.FObject' ) break;
        m = foam.lookup(m.model_.extends);
      }
    },
    function initE() {
      this.SUPER();

      var cls = this.data;
      var model = cls.model_;
      var impls = cls.getAxiomsByClass(this.Implements);

      var exts = [];
      var m = cls;
      while ( m.id != 'foam.core.FObject' ) {
        m = foam.lookup(m.model_.extends);
        exts.push(m);
      }

      var propertyAxiomDAO = this.ArrayDAO.create({ of: this.PropertyAxiom })
      this.fillAxiomDAO(propertyAxiomDAO, this.PropertyAxiom, this.Property);

      var methodAxiomDAO = this.ArrayDAO.create({ of: this.MethodAxiom })
      this.fillAxiomDAO(methodAxiomDAO, this.MethodAxiom, this.Method);

      var ClassLink = this.ClassLink;
      var AxiomLink = this.AxiomLink;

      var outputInheritedProps = function(id) {
        this.
          start('h3').
            addClass(this.myClass('header')).
            add('Properties inherited from ').
            start(ClassLink, { data: id }).end().
          end().
          start('div').
            addClass(this.myClass('footer')).
            select(propertyAxiomDAO.where(this.EQ(this.PropertyAxiom.PARENT_ID, id)), function(a) {
              return this.E('span').
                start(AxiomLink, { cls: id, axiomName: a.name }).end()
            }).
          end()
      }

      var outputInheritedMethods = function(id) {
        this.
          start('h3').
            addClass(this.myClass('header')).
            add('Methods inherited from ').
            start(ClassLink, { data: id }).end().
          end().
          start('div').
            addClass(this.myClass('footer')).
            select(methodAxiomDAO.where(this.EQ(this.MethodAxiom.PARENT_ID, id)), function(a) {
              return this.E('span').
                start(AxiomLink, { cls: id, axiomName: a.name }).end()
            }).
          end()
      }

      this.
        start('div').
          add(model.package).
        end().
        start('h3').
          add('Class ').
          add(model.name).
        end().
        start('div').
          forEach(exts, function(e, i) {
            this.
              start('div').
                style({ 'text-indent': ( i ) * 20 + 'px' }).
                add(e.id).
              end();
          }).
        end().
        callIf(impls.length, function() {
          this.
            start('h4').
              add('All Implemented Interfaces:').
            end().
            start('div').
              forEach(impls, function(impl, i) {
                this.
                  callIf(i > 0, function() { this.add(', ') }).
                  add(impl.path)
              }).
            end()
        }).
        // TODO Direct Known Subclasses? Javadoc has this.
        start('hr').end().
        start('pre').
          add('public class ').
          add(model.name).
          br().
          add('extends ').
          start(ClassLink, { data: model.extends }).end().
          callIf(impls.length, function() {
            this.
              br().
              add('implements ').
              forEach(impls, function(impl, i) {
                this.
                  callIf(i > 0, function() { this.add(', ') }).
                  start(ClassLink, { data: impl.path }).end()
              })
          }).
        end().
        start('div').
          add(model.documentation).
        end().

        start('h5').
          add('Property Summary').
        end().
        start(this.AxiomTableView, {
          data: propertyAxiomDAO.where(this.EQ(this.PropertyAxiom.PARENT_ID, cls.id))
        }).
        end().
        forEach(exts.map(function(e) { return e.id }), outputInheritedProps).
        forEach(impls.map(function(i) { return i.path }), outputInheritedProps).

        start('h5').
          add('Method Summary').
        end().
        start(this.AxiomTableView, {
          data: methodAxiomDAO.where(this.EQ(this.MethodAxiom.PARENT_ID, cls.id))
        }).
        end().
        forEach(exts.map(function(e) { return e.id }), outputInheritedMethods).
        forEach(impls.map(function(i) { return i.path }), outputInheritedMethods)
    },

    async function updateTableView() {
      var permissioned = await this.auth.check(null, this.data.id + '.properties.permissioned');
      var axs = await this.permittedAxioms(permissioned);

      this.classPropertyTableView = this.TableView.create({
        of: this.PropertyInfo,
        data: this.ArrayDAO.create({ array: axs })
      });
    },

    async function permittedAxioms(permissioned) {
      var data = this.data;
      var axs = [];

      for ( var key in data.axiomMap_ ) {
        if ( Object.hasOwnProperty.call(data.axiomMap_, key) ) {
          var a = data.axiomMap_[key];
          if ( foam.core.Property.isInstance(a) ) {
            if ( permissioned ) {
              if ( await this.auth.check(null, data.id + '.property.' + a.name ) ) {
                var ai = foam.doc.PropertyInfo.create({
                  axiom: a,
                  type: a.cls_,
                  required: a.required,
                  of: a.of,
                  documentation: a.documentation,
                  name: a.name
                });

                axs.push(ai);
              }
            } else {
              var ai = foam.doc.PropertyInfo.create({
                axiom: a,
                type: a.cls_,
                required: a.required,
                of: a.of,
                documentation: a.documentation,
                name: a.name
              });

              axs.push(ai);
            }
          }
        }
      }
      return axs;
    }
  ]
});

foam.CLASS({
  package: 'foam.doc',
  name: 'PropertyInfo',
  documentation: 'Table view model to display' +
    ' model in printable model browser\'s',
  ids: ['name'],

  tableColumns: [
    'name', 'required', 'of', 'type', 'documentation'
  ],

  properties: [
    {
      name: 'name',
      tableCellFormatter: function(value, obj, axiom) {
        this.add(value);
      }
    },
    {
      name: 'axiom',
      hidden: true
    },
    {
      name: 'required',
      tableCellFormatter: function(value, obj, axiom) {
        this.add(value);
      }
    },
    {
      name: 'of',
      label: 'Property Of',
      tableCellFormatter: function(value, obj, axiom) {
        var of_ = value ? value.id : '';
        this.add(of_);
      }
    },
    {
      name: 'type',
      tableCellFormatter: function(value, obj, axiom) {
        if ( value ) {
          this.add(value.name);
          return;
        }
        this.add('anonymous');
      }
    },
    {
      name: 'documentation',
      tableCellFormatter: function(value, obj, axiom) {
        this.add(value);
      }
    }
  ]
});
