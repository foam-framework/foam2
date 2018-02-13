foam.CLASS({
  package: 'foam.apploader',
  name: 'NodeModelFileDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.apploader.JSON2ModelFileDAO',
    'foam.apploader.ModelFileDAO',
    'foam.apploader.NodeModelFileFetcher',
  ],
  properties: [
    'root',
    'json2',
    {
      name: 'delegate',
      factory: function() {
        var cls = this.json2 ? this.JSON2ModelFileDAO : this.ModelFileDAO;
        return cls.create({
          fetcher: this.NodeModelFileFetcher.create({root: this.root}), });
      },
    },
  ],
});
