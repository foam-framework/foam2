for ( var key in foam.UNUSED ) { foam.lookup(key); }

foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomInfo',
  ids: ['name'],

  properties: [
    {
      name: 'axiom',
      hidden: true
    },
    {
      name: 'cls',
      label: 'Source Class',
      tableCellView: function(o, e) {
        return foam.doc.LinkView.create({data: o.cls}, e.__subSubContext__);
      },
      tableCellFormatter: function(value, obj, axiom) {
        this.tag(foam.doc.LinkView, { data: value });
      }
    },
    {
      name: 'type',
      tableCellView: function(o, e) {
        return o.type ?
          foam.doc.LinkView.create({data: foam.doc.Link.create({path: o.type.id, label: o.type.name})}, e.__subSubContext__) :
          'anonymous';
      },
      tableCellFormatter: function(value, obj, axiom) {
        if ( value ) {
          this.tag(foam.doc.LinkView, { data: foam.doc.Link.create({ path: value.id, label: value.name }) });
          return;
        }
        this.add('anonymous');
      }
    },
    {
      name: 'name'
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'ClassList',
  extends: 'foam.u2.View',

  requires: [
    'foam.doc.ClassLink'
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      this.add('(', this.data.length, ')').br();

      this.data.forEach(function(cls) {
        self.start(self.ClassLink, {data: cls, showPackage: true}).end().br();
      });
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
    'foam.u2.view.TableView',
    'foam.dao.ArrayDAO'
  ],

  imports: [
    'selectedAxiom'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'showInherited',
      value: true
    }
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

      this.add('Show Inherited: ').start(this.SHOW_INHERITED, {data$: this.showInherited$}).end();

      this.add(this.slot(function (showInherited) {
        // TODO: hide 'Source Class' column if showInherited is false
        var axs = [];
        for ( var key in data.axiomMap_ ) {
          if ( showInherited || Object.hasOwnProperty.call(data.axiomMap_, key) ) {
            var a  = data.axiomMap_[key];
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
        }

        return this.TableView.create({
          of: this.AxiomInfo,
          data: this.ArrayDAO.create({array: axs}),
          hoverSelection$: this.selectedAxiom$
        });
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
    },
    {
      class: 'Boolean',
      name: 'showPackage'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.setNodeName('a').
        on('click', this.click).
        attrs({href: this.data.id}).
        add(this.showPackage ? this.data.id : this.data.name);
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
    'foam.doc.ClassList',
    'foam.doc.ClassDocView'
  ],

  exports: [
    'as data',
    'path as browserPath',
    'axiom as selectedAxiom'
  ],

  properties: [
    'path',
    {
      class: 'FObjectProperty',
      name: 'axiom',
      view: { class: 'foam.u2.DetailView' }
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
            add('Classes:').
              style({'vertical-align': 'top', background: '#f5f5ea' }).
              start(this.ClassList, {data: Object.values(foam.USED).sort(foam.core.Model.ID.compare)}).
            end().
            start('td').
              style({'vertical-align': 'top', background: '#f5f5ea' }).
              add(this.slot(function(path) {
                var o = foam.lookup(path, true);
                if ( ! o ) return '';
                return this.ClassDocView.create({data: o});
              })).
            end().
            start('td').
              add('Sub-Classes:').
              style({'vertical-align': 'top', background: '#f5f5ea' }).
              add(this.slot(function(path) {
                var o = foam.lookup(path, true);
                if ( ! o ) return '';
                return this.ClassList.create({data: Object.values(foam.USED).filter(function(cls) { return cls.model_.extends == path || 'foam.core.' + cls.model_.extends == path; }).sort(foam.core.Model.ID.compare)});
              })).
            end().
            start('td').
              add('Required-by:').
              style({'vertical-align': 'top', background: '#f5f5ea' }).
              add(this.slot(function(path) {
                var o = foam.lookup(path, true);
                if ( ! o ) return '';
                // TODO: this could be done more efficiently, and memoized
                return this.ClassList.create({data: Object.values(foam.USED).filter(function(cls) {
                  return cls.model_.requires && cls.model_.requires.map(function(r) { return r.path; }).includes(path); }).sort(foam.core.Model.ID.compare)});
              })).
            end().
            start('td').
              style({'vertical-align': 'top', background: '#f5f5ea' }).
              add(this.slot(function (axiom) { return axiom && foam.u2.DetailView.create({data: axiom.axiom}); })).
            end().
          end().
        end();
    }
  ]
});
