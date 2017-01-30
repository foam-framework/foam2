foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomInfo',

  properties: [
    {
      name: 'axiom',
      hidden: true
    },
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
    'foam.doc.ClassLink',
    'foam.doc.AxiomInfo',
    'foam.u2.TableView',
    'foam.dao.ArrayDAO'
  ],

  methods: [
    function initE() {
      this.SUPER();

      var data = this.data;

      this.add('CLASS: ', data.name, ' (', data.count_, ')').br();
      this.add('extends: ');
      var cls = data;
      for ( var i = 0 ; cls ; i++ ) {
        cls = this.lookup(cls.model_.extends, true);
        if ( i ) this.add(' : ');
        this.start(this.ClassLink, {data: cls}).end();
        if ( cls === foam.core.FObject ) break;
      }
      this.br();
      this.add(data.documentation);

      var axs = [];
      for ( var key in data.axiomMap_ ) {
        var a = data.axiomMap_[key];
        var ai = foam.doc.AxiomInfo.create({
          axiom: a,
          type: a.cls_,
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
  name: 'ClassLink',
  extends: 'foam.u2.View',

  imports: [ 'browserPath' ],

  properties: [
    {
      class: 'Class',
      name: 'data'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.setNodeName('a').
        on('click', this.click).
        attrs({href: this.data.id}).
        add(this.data.name);
    }
  ],

  listeners: [
    function click(e) {
      this.browserPath$.set(this.data.id);
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
    'path',
    {
      class: 'FObjectProperty',
      name: 'axiom'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.add('Path: ', this.PATH).br().br();

      this.
        start('table').
          start('tr').
            start('td').
              add(this.slot(function(path) {
                var o = foam.lookup(path, true);
                if ( ! o ) return '';
                return this.ClassDocView.create({data: o});
              })).
            end().
            start('td').
              add(this.AXIOM).
            end().
          end().
        end();
    }
  ]
});

// foam.doc.ClassDocView.create({data: foam.core.Property}).write();

foam.doc.DocBrowser.create({path: 'foam.core.Property'}).write();
