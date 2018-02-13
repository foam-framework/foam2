foam.CLASS({
  package: 'foam.apploader',
  name: 'WebModelFileDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.apploader.JSON2ModelFileDAO',
    'foam.apploader.ModelFileDAO',
    'foam.apploader.WebModelFileFetcher',
    'foam.net.HTTPRequest',
  ],
  imports: [
    'window',
  ],
  properties: [
    'root',
    'json2',
    {
      name: 'delegate',
      factory: function() {
        var cls = this.json2 ? this.JSON2ModelFileDAO : this.ModelFileDAO;
        return cls.create({
          fetcher: this.WebModelFileFetcher.create({root: this.root}), });
      },
    },
  ],
});
