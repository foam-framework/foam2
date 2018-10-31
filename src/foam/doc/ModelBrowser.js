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

      this.nSpecDAO.where(foam.mlang.Expressions.create().ENDS_WITH(foam.nanos.boot.NSpec.ID, "DAO")).select().then(function (s) { 
       
      var objDAO = s.array;
      var arrayDAO = [];
	    for (var key in objDAO) {
        arrayDAO.push(objDAO[key].name.toLowerCase().substring(0,objDAO[key].name.length-3));
      }

      self.start().addClass(self.myClass())
        .start('h2').add('Model Browser').end()
        .start().add(this.PRINT_PAGE).end()
        .select(self.nSpecDAO, function(model) {//nSpecDAO  modelDAO
          var cls = self.parseClientModel(model);//foam.lookup(model.id);
          if ( ! cls ) return;
          this.start().style({ 'font-size': '20px', 'margin-top': '20px' })
            //.add('Model ' + model)
            .callIf( arrayDAO.includes(cls.name.toLowerCase() ), function (){ this.add('Model ' + cls.name + 'DAO') })
		        .callIf( ! arrayDAO.includes(cls.name.toLowerCase() ), function (){ this.add('Model ' + cls.name + 'model') })
            .end();
          if ( arrayDAO.includes(cls.name.toLowerCase() ) )
            this.tag(self.UMLDiagram.create({ data: cls, modelBrowser: true }));//,  conventionalUML: true,
          else
			      this.tag(self.UMLDiagram.create({ data: cls, conventionalUML: false }));//, 
          this.tag(self.SimpleClassView.create({ data: cls }));
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
      });
    },

    function parseClientModel(n) {
      var cls = JSON.parse(n.client);
      var clsName = cls.of ? cls.of : cls.class;
      return foam.lookup(clsName, true);
    }
  ],

  actions: [
  ]
});
