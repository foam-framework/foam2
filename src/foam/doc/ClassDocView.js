foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomInfo',

  properties: [
    {
      name: 'type'
    },
    {
      name: 'cls',
      label: 'Source Class'
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
          type: a.cls_ ? a.cls_.name : 'anonymous',
          cls: a.sourceCls_.name,
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

foam.doc.ClassDocView.create({data: foam.core.Property}).write();
