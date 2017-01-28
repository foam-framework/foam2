
foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomInfo',

  properties: [
    {
      name: 'type',
      tableCellView: function(o, e) {
        return o.type ?
          foam.doc.LinkView.create({data: foam.doc.Link.create({path: o.type.id, label: o.type.name})}, e.__subSubContext__) :
          'anonymous';
      }
    },
    {
      name: 'cls',
      label: 'Source Class',
      tableCellView: function(o, e) {
        return foam.doc.LinkView.create({data: o.cls}, e.__subSubContext__);
      }
    },
    {
      name: 'name'
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'ClassDocView',
  extends: 'foam.u2.View',

  requires: [
    'foam.doc.Link',
    'foam.doc.AxiomInfo',
    'foam.u2.TableView',
    'foam.dao.ArrayDAO'
  ],

  methods: [
    function initE() {
      this.SUPER();

      var data = this.data;

      this.add('CLASS: ', data.name).br();
      this.add('extends: ', data.model_.extends).br();
      this.add(data.documentation);

      var axs = [];
      for ( var key in data.axiomMap_ ) {
        var a = data.axiomMap_[key];
        var ai = foam.doc.AxiomInfo.create({
          type: a.cls_, //a.cls_ ? a.cls_.name : 'anonymous',
          cls: this.Link.create({
            path: a.sourceCls_.id,
            label: a.sourceCls_.name
          }),
          name: a.name
        });
        axs.push(ai);
      }

      this.add(this.TableView.create({
        of: this.AxiomInfo,
        data: this.ArrayDAO.create({array: axs})
      }));
    }
  ]
});

foam.CLASS({
  package: 'foam.doc',
  name: 'Link',

  properties: [
    'path',
    'label'
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'LinkView',
  extends: 'foam.u2.View',

  imports: [ 'browserPath' ],

  methods: [
    function initE() {
      this.SUPER();

      this.setNodeName('a').
        on('click', this.click).
        attrs({href: this.data.path}).
        add(this.data.label);
    }
  ],

  listeners: [
    function click(e) {
      this.browserPath$.set(this.data.path);
      e.preventDefault();
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'DocBrowser',
  extends: 'foam.u2.Element',

  requires: [
    'foam.doc.ClassDocView'
  ],

  exports: [
    'as data',
    'path as browserPath'
  ],

  properties: [
    'path'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.add('Path: ', this.PATH).br().br();

      this.add(this.slot(function(path) {
        var o = foam.lookup(path, true);
        if ( ! o ) return '';
        return this.ClassDocView.create({data: o});
      }));
    }
  ]
});

// foam.doc.ClassDocView.create({data: foam.core.Property}).write();

foam.doc.DocBrowser.create({path: 'foam.core.Property'}).write();
