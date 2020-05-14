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
    'foam.nanos.boot.NSpec'
  ],

  imports: [ 'nSpecDAO' ],

  exports: [ 'conventionalUML' ],


  properties: [
    [ 'conventionalUML', false ],
    {
      class: 'Map',
      name: 'allowedModels',
      adapt: function(_,models) {
        if ( foam.Array.isInstance(models) ) {
          var map = {};
          models.forEach((m) => map[m.id] = true);
        }
        return models;
      }
    },
    {
      name: 'modelDAO',
      expression: function(nSpecDAO,allowedModels) {
        var self = this;
        var dao = self.ArrayDAO.create({ of: self.Model })
        return self.PromisedDAO.create({
          promise: nSpecDAO.select().then(function(a) {
            return Promise.all(
              a.array.map(function(nspec) {
                return self.parseClientModel(nspec)
              }).filter(function(cls) {
                return cls && (allowedModels == undefined? true : !!allowedModels[cls.id]);
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
    ^ .foam-u2-ActionView-printPage{
      margin-top: 20px;
    }
    @media print{
      ^ .foam-u2-ActionView-printPage{
        display: none;
      }
      .foam-nanos-u2-navigation-TopNavigation{
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
              start(self.UMLDiagram, { data: cls }).end().
              start(self.SimpleClassView, { data: cls }).end()
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
