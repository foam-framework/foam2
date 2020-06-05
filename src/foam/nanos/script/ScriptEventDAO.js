/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.script',
  name: 'ScriptEventDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO that creates a ScriptEvent each time a Script is run.',

  methods: [
    {
      name: 'put_',
      javaCode: `
      if ( obj instanceof Script ) {
        Script script = (Script) obj;
        ScriptEvent event = new ScriptEvent();
        event.setOwner(script.getId());
        event.setLastRun(script.getLastRun());
        event.setLastDuration(script.getLastDuration());
        event.setOutput(script.getOutput());
        event.setType(script.getClass().getSimpleName());
        return getDelegate().put_(x, event);
      }
      return getDelegate().put_(x, obj);
      `
    }
  ]
});
