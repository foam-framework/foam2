/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.test',
  name: 'RuledDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.ClassInfo',
    'foam.dao.DAO',
    'foam.dao.GUIDDAO',
    'foam.dao.MDAO',
    'foam.nanos.ruler.RuledDAO',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        RuledDAOTest_find_ruled_obj_without_predicate(x);
      `
    },
    {
      name: 'setUpDAO',
      type: 'DAO',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'ClassInfo', name: 'of' }
      ],
      javaCode: `
        return new RuledDAO.Builder(x).setDelegate(
          new GUIDDAO.Builder(x).setDelegate(new MDAO(of)).build()
        ).build();
      `
    },
    {
      name: 'RuledDAOTest_find_ruled_obj_without_predicate',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        var dao = setUpDAO(x, RuledDummy.getOwnClassInfo());
        var found = dao.put(new RuledDummy());
        test(found != null, "Find ruled obj without predicate");
      `
    }
  ]
});
