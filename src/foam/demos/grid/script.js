/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var dao = foam.dao.EasyDAO.create({
  of:      foam.demos.grid.Resource,
  seqNo:   true,
  daoType: 'IDB',
  testData: [
    { description: 'Google',  url: 'http://google.com/'  },
    { description: 'Dilbert', url: 'http://dilbert.com/' },
    { description: 'FOAM',    url: 'http://foamdev.com/' }
  ]
});

foam.demos.grid.Controller.create({ dao: dao }).write();
