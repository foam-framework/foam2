/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.apploader',
  name: 'NodeModelFileDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.apploader.ModelFileDAO',
    'foam.apploader.NodeModelFileFetcher',
  ],
  properties: [
    'root',
    {
      name: 'delegate',
      factory: function() {
        return this.ModelFileDAO.create({
          fetcher: this.NodeModelFileFetcher.create({root: this.root}), });
      },
    },
  ],
});
