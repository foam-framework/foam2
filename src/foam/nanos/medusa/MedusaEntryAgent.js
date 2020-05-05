/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryAgent',

  implements: [
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM'
  ],

  properties: [
    {
      name: 'dop',
      class: 'Enum',
      of: 'foam.dao.DOP'
    },
    {
      name: 'obj',
      class: 'Object',
    },
    {
      name: 'delegate',
      class: 'foam.dao.DAOProperty',
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public MedusaEntryAgent(X x, foam.dao.DOP dop, Object obj, DAO delegate) {
    setX(x);
    setDop(dop);
    setObj(obj);
    setDelegate(delegate);
  }
         `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      PM pm = PM.create(x, MedusaEntryAgent.getOwnClassInfo(), getDop().getLabel()+":"+getObj().getClass().getSimpleName());
      try {
        if ( foam.dao.DOP.PUT == getDop() ) {
          MedusaEntry entry = (MedusaEntry) getObj();
          getLogger().debug("execute", entry.getIndex());
          getDelegate().put_(x, (FObject) getObj());
        } else if ( foam.dao.DOP.CMD == getDop() ) {
          getLogger().debug("execute", getObj().getClass().getSimpleName());
          getDelegate().cmd_(x, getObj());
        }
      } catch ( Exception e ) {
        getLogger().error("execute", e.getMessage(), e);
        // TODO: Alarm
      } finally {
        pm.log(x);
      }
      `
    }
  ]
});
