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
    'foam.core.Model',
    'foam.dao.ArrayDAO',
    'foam.dao.PromisedDAO',
    'foam.doc.ClassList',
    'foam.doc.DocBorder',
    'foam.doc.SimpleClassView',
    'foam.doc.UMLDiagram',
    'foam.nanos.boot.NSpec',
  ],

  imports: [
    'nSpecDAO',
  ],

  properties: [
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
      var E = foam.mlang.Expressions.create();

      var objDAO= this.nSpecDAO
                         .where(E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO$'))
                         .orderBy(foam.nanos.boot.NSpec.ID)
                         .private_.contextParent.private_.__context__;


      /*var objService= this.nSpecDAO
                         .where(E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'Service'))
             .orderBy(foam.nanos.boot.NSpec.ID)
                     .private_.contextParent.private_.__context__;*/


      var arrayDAO = [];
      for (var key in objDAO) {
        if ( key.endsWith('DAO$') ) {
          arrayDAO.push(key.toLowerCase().substring(0,key.length-4));
        }
      }

      this.start().addClass(this.myClass())
        .start('h2').add('Model Browser').end()
        // we use nSpecDAO to get all the DAOs
        //.start().add(this.PRINT_PAGE).end()
        .select(this.nSpecDAO, function(n) {
          var model = self.parseClientModel(n);
          if ( ! model ) return;
          this.start().style({ 'font-size': '20px', 'margin-top': '20px' })
            //.add('Model ' + model)
            .callIf( arrayDAO.includes(model.name.toLowerCase() ), function (){ this.add('Model ' + model.name + 'DAO') })
            .callIf( ! arrayDAO.includes(model.name.toLowerCase() ), function (){ this.add('Model ' + model.name + 'model') })
            .end();
          if ( arrayDAO.includes(model.name.toLowerCase() ) )
            this.tag(self.UMLDiagram.create({ data: model, modelBrowser: true }));
          else
            this.tag(self.UMLDiagram.create({ data: model, conventionalUML: false }));
          this.tag(self.SimpleClassView.create({ data: model }));
/*
        .start().add(this.PRINT_PAGE).end()
        .select(this.modelDAO, function(model) {
          var cls = foam.lookup(model.id);
          return this.E().
              start().style({ 'font-size': '20px', 'margin-top': '20px' }).
                add('Model ' + model).
              end().
              start(self.UMLDiagram, { data: cls }).end().
              start(self.SimpleClassView, { data: cls }).end()
*/
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
    /*{
      name: 'printPage',
      label: 'Print',
      code: function() {
        window.print();
      }
    }*/
  ]
});
