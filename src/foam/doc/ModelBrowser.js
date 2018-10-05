/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'CachedAuthServiceCheck',
  extends: 'foam.nanos.auth.ProxyAuthService',
  properties: [
    {
      class: 'Map',
      name: 'cachedChecks',
    },
  ],
  methods: [
    function check(x, p) {
      if ( ! this.cachedChecks[p] ) {
        this.cachedChecks[p] = this.delegate.check(x, p);
      }
      return this.cachedChecks[p];
    },
  ],
});

foam.CLASS({
  package: 'foam.doc',
  name: 'PropertyPermissionCheckDecorator',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.doc.PropertyAxiom',
  ],
  imports: [
    'auth',
  ],
  methods: [
    function put_(x, o) {
      var self = this;
      if ( ! this.PropertyAxiom.isInstance(o) )
        return this.delegate.put_(x, o);
      return self.auth.check(x, `${o.parentId}.properties.permissioned`)
        .then(function(permitted) {
          if ( ! permitted ) return false;
          return self.auth.check(x, `${o.parentId}.property.${o.axiom.name}`)
      }).then(function(permitted) {
        return permitted ? self.delegate.put_(x, o) : null;
      });
    },
  ],
});

foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomDAO',
  extends: 'foam.dao.PromisedDAO',
  requires: [
    'foam.doc.PropertyAxiom',
    'foam.doc.MethodAxiom',
    'foam.core.Property',
    'foam.core.Method',
    'foam.dao.ArrayDAO',
    'foam.dao.QuickSink',
  ],
  properties: [
    {
      name: 'of',
      value: 'foam.doc.Axiom',
    },
    {
      name: 'modelDAO',
    },
    {
      name: 'delegate',
    },
    {
      name: 'promise',
      expression: function(modelDAO, delegate) {
        var self = this;
        return modelDAO.select().then(function(a) {
          return Promise.all(a.array.map(function(m) {
            return self.putCls_(foam.lookup(m.id));
          }))
        }).then(function() {
          return delegate;
        })
      },
    },
  ],
  methods: [
    function putCls_(m) {
      var ps = [];
      var self = this;
      while ( true ) {
        m.getOwnAxioms().forEach(function(a) {
          var cls =
            self.Property.isInstance(a) ?
              self.PropertyAxiom :
            self.Method.isInstance(a) ?
              self.MethodAxiom :
            null;
          if ( ! cls ) return;
          ps.push(self.delegate.put(cls.create({
            axiom: a,
            parentId: m.id
          })));
        });
        if ( m.id == 'foam.core.FObject' ) break;
        m = foam.lookup(m.model_.extends);
      }
      return Promise.all(ps);
    },
  ],
});

foam.CLASS({
  package: 'foam.doc',
  name: 'ModelBrowser',
  extends: 'foam.u2.Element',
  documentation: 'Show UML & properties for passed in models',

  requires: [
    'foam.core.Model',
    'foam.dao.ArrayDAO',
    'foam.dao.PromisedDAO',
    'foam.doc.AxiomDAO',
    'foam.doc.CachedAuthServiceCheck',
    'foam.doc.ClassList',
    'foam.doc.DocBorder',
    'foam.doc.PropertyPermissionCheckDecorator',
    'foam.doc.SimpleClassView',
    'foam.doc.UMLDiagram',
    'foam.nanos.boot.NSpec',
  ],

  imports: [
    'nSpecDAO',
    'auth',
  ],

  exports: [
    'cachedAuth as auth',
  ],

  properties: [
    {
      name: 'cachedAuth',
      expression: function(auth) {
        return this.CachedAuthServiceCheck.create({delegate: auth});
      },
    },
    {
      name: 'modelDAO',
      expression: function(nSpecDAO) {
        var self = this;
        var dao = self.ArrayDAO.create({ of: self.Model })
        return self.PromisedDAO.create({
          promise: nSpecDAO.select().then(function(a) {
            return Promise.all(
              a.array.map(function(nspec) {
                return self.parseClientModel(nspec)
              }).filter(function(cls) {
                return !!cls;
              }).map(function(cls) {
                return dao.put(cls.model_);
              })
            )
          }).then(function() {
            return dao;
          })
        })
      },
    },
    {
      name: 'axiomDAO',
      expression: function(modelDAO) {
        return this.AxiomDAO.create({
          modelDAO: modelDAO,
          delegate: this.PropertyPermissionCheckDecorator.create({
            delegate: this.ArrayDAO.create()
          })
        });
      },
    },
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
    ^ .net-nanopay-ui-ActionView-printPage{
      margin-top: 20px;
    }
    @media print{
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
        .select(this.modelDAO, function(model) {
          var cls = foam.lookup(model.id);
          return this.E().
              start().style({ 'font-size': '20px', 'margin-top': '20px' }).
                add('Model ' + model).
              end().
              tag(self.UMLDiagram.create({ data: cls })).
              tag(self.SimpleClassView.create({ data: cls, axiomDAO: self.axiomDAO }));
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
  name: 'Axiom',
  ids: ['name', 'parentId'],
  properties: [
    {
      name: 'axiom',
    },
    {
      class: 'String',
      name: 'parentId',
    },
    {
      class: 'String',
      name: 'name',
      factory: function() {
        return this.axiom.name;
      },
    },
  ],
});

foam.CLASS({
  package: 'foam.doc',
  name: 'PropertyAxiom',
  extends: 'foam.doc.Axiom',
  requires: [
    'foam.doc.AxiomLink',
  ],
  tableColumns: ['type', 'name'],
  properties: [
    {
      name: 'name',
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
  extends: 'foam.doc.Axiom',
  requires: [
    'foam.doc.AxiomLink',
  ],
  tableColumns: ['type', 'name'],
  properties: [
    {
      name: 'name',
      label: 'Method and Description',
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
  properties: [
    {
      name: 'editColumnsEnabled',
      value: false,
    },
    {
      name: 'disableUserSelection',
      value: true,
    },
  ],
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
    'foam.core.Implements',
    'foam.core.Method',
    'foam.core.Model',
    'foam.core.Property',
    'foam.dao.ArrayDAO',
    'foam.doc.AxiomLink',
    'foam.doc.AxiomTableView',
    'foam.doc.ClassLink',
    'foam.doc.Axiom',
    'foam.doc.AxiomDAO',
    'foam.doc.MethodAxiom',
    'foam.doc.PropertyAxiom',
    'foam.doc.PropertyPermissionCheckDecorator',
  ],

  css: `
    ^inheritheader {
      background-color: #dee3e9;
      border: 1px solid #d0d9e0;
      margin-top: 14px;
      margin-bottom: 0px;
      padding: 7px 5px;
    }
    ^inheritfooter {
      background-color: #ffffff;
      padding: 7px 5px;
      font-family: monospace;
      line-height: 1.5em;
    }
    ^commaseparated span:after {
      content: ", ";
    }
    ^commaseparated span:last-child:after {
      content: "";
    }
    ^modeldocumentation {
      margin-top: 10px;
      margin-bottom: 10px;
    }
  `,

  properties: [
    {
      name: 'modelDAO',
      expression: function(data) {
        var d = this.ArrayDAO.create({
          of: this.Model,
          array: [data.model_],
        });
        return d;
      },
    },
    {
      name: 'axiomDAO',
      expression: function(modelDAO) {
        return this.AxiomDAO.create({
          modelDAO: modelDAO,
          delegate: this.PropertyPermissionCheckDecorator.create({
            delegate: this.ArrayDAO.create({ of: this.Axiom })
          }),
        });
      },
    },
  ],

  methods: [
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

      var propertyAxiomDAO = this.axiomDAO.where(this.INSTANCE_OF(this.PropertyAxiom));
      var methodAxiomDAO = this.axiomDAO.where(this.INSTANCE_OF(this.MethodAxiom));

      var ClassLink = this.ClassLink;
      var AxiomLink = this.AxiomLink;

      var outputInherited = function(title, dao, id) {
        var count = this.Count.create();
        dao.pipe(count);
        this.
          add(this.slot(function(c) {
            if ( ! c ) return;
            return this.E().
              start('h3').
                addClass(this.myClass('inheritheader')).
                add(title).
                add(' inherited from ').
                start(ClassLink, { data: id }).end().
              end().
              start('div').
                addClass(this.myClass('inheritfooter')).
                addClass(this.myClass('commaseparated')).
                select(dao, function(a) {
                  return this.E('span').
                    start(AxiomLink, { cls: id, axiomName: a.name }).end()
                }).
              end()
          }, count.value$))
      }

      var outputInheritedProps = function(id) {
        var dao = propertyAxiomDAO.where(this.EQ(this.PropertyAxiom.PARENT_ID, id));
        outputInherited.call(this, 'Properties', dao, id);
      }

      var outputInheritedMethods = function(id) {
        var dao = methodAxiomDAO.where(this.EQ(this.MethodAxiom.PARENT_ID, id));
        outputInherited.call(this, 'Methods', dao, id);
      }

      var outputAxiomTable = function(title, dao, of) {
        var count = this.Count.create();
        dao.pipe(count);
        this.
          add(this.slot(function(c) {
            if ( ! c ) return;
            return this.E().
              start('h5').
                add(title).
                add(' Summary').
              end().
              start(this.AxiomTableView, {
                data: dao,
                of: of,
              }).
              end()
          }, count.value$))
      }

      var outputPropertyAxiomTable = function() {
        outputAxiomTable.call(
          this,
          'Property',
          propertyAxiomDAO.where(this.EQ(this.Axiom.PARENT_ID, cls.id)),
          this.PropertyAxiom
        )
      }

      var outputMethodAxiomTable = function() {
        outputAxiomTable.call(
          this,
          'Method',
          methodAxiomDAO.where(this.EQ(this.Axiom.PARENT_ID, cls.id)),
          this.MethodAxiom
        )
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
          forEach([cls].concat(exts).reverse(), function(e, i) {
            this.
              start('div').
                style({ 'text-indent': ( i ) * 20 + 'px' }).
                callIf(cls == e, function() {
                  this.add(e.id)
                }).
                callIf(cls != e, function() {
                  this.start(ClassLink, { data: e, showPackage: true }).end()
                }).
              end();
          }).
        end().
        callIf(impls.length, function() {
          this.
            start('h4').
              add('All Implemented Interfaces:').
            end().
            start('div').
              addClass(this.myClass('commaseparated')).
              forEach(impls, function(impl) {
                this.
                  start('span').
                    start(ClassLink, { data: impl.path }).end().
                  end()
              }).
            end()
        }).
        // TODO Direct Known Subclasses? Javadoc has this.
        start('hr').end().
        start('code').
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
          addClass(this.myClass('modeldocumentation')).
          add(model.documentation).
        end().

        call(outputPropertyAxiomTable).
        forEach(exts.map(function(e) { return e.id }), outputInheritedProps).
        forEach(impls.map(function(i) { return i.path }), outputInheritedProps).

        call(outputMethodAxiomTable).
        forEach(exts.map(function(e) { return e.id }), outputInheritedMethods).
        forEach(impls.map(function(i) { return i.path }), outputInheritedMethods)

        // TODO property and method detail sections.
    },
  ]
});
