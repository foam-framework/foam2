/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.foamlink',
  name: 'FoamlinkNodeModelFileDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.apploader.ModelFileDAO',
    'foam.foamlink.FoamlinkNodeModelFileFetcher',
  ],
  properties: [
    'root',
    {
      name: 'delegate',
      factory: function() {
        return this.ModelFileDAO.create({
          fetcher: this.FoamlinkNodeModelFileFetcher.create({ root: this.root })
        });
      },
    },
  ],
});
