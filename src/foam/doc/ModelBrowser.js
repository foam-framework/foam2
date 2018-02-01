foam.CLASS({
  package: 'foam.doc',
  name: 'ModelView',
  extends: 'foam.u2.Element',
  documentation: 'Show UML & properties for passed in models',

  requires: [
    'foam.doc.ClassDocView',
    'foam.doc.UMLDiagram'
  ],

  exports: [
    'showOnlyProperties',
    'showInherited'
  ],

  properties: [
    {
      name: 'models'
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
    ^ .foam-u2-view-TableView-foam-doc-AxiomInfo{
      width: 600px;
      float: left;
      margin-top: 20px;
    }
    ^ .net-nanopay-ui-ActionView-printPage{
      margin-top: 20px;
    }
  `,

  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this.start().addClass(this.myClass())
        .start('h2').add("Model Browser").end()
        .start().add(this.PRINT_PAGE).end()
        .add(this.slot(function(models) {
          return self.E().forEach(models, function(a) {
            model = self.lookup(a, true);
            if( !model ) {
              return self.start().add("Could not find class ", model).end()
            }
            this.start().style({ 'font-size' : '20px', 'margin-top' : '20px'}).add("Model " + a).end()
            this.tag(self.UMLDiagram.create({ data: model }));
            this.tag(self.ClassDocView.create({data: model }));
          })
        }))
      .end()
    }
  ],

  actions: [
    {
      name: 'printPage',
      label: 'Print',
      code: function(){
        window.print();
      }
    }
  ]

});