package com.chrome.origintrials;

import foam.core.*;

import foam.dao.*;
import com.chrome.origintrials.dao.*;
import com.chrome.origintrials.model.*;
import com.chrome.origintrials.services.*;
import com.chrome.origintrials.services.impl.*;

public class Context {
  private static X x_ = null;
  private static synchronized X build() {
    if ( x_ != null ) return x_;

    X x = EmptyX.instance();

    x = x.put("tokenService", x.create(TestTokenServiceImpl.class));

    DAO applicationDAO = x.create(DatastoreDAO.class).setOf(Application.getOwnClassInfo());
    applicationDAO = x.create(ApplicationDAO.class).setDelegate(applicationDAO);

    x = x.put("applicationDAO", applicationDAO);

    DAO experimentDAO = x.create(DatastoreDAO.class).setOf(Experiment.getOwnClassInfo());

    x = x.put("experimentDAO", experimentDAO);

    foam.box.ProxyBox me = x.create(foam.box.ProxyBox.class);
    x = x.put("me", me);

    foam.box.BoxRegistryBox registry = x.create(foam.box.BoxRegistryBox.class);

    me.setDelegate(registry);

    x = x.put("registry", registry);

    x_ = x;

    return x_;
  }

  public static X instance() {
    if ( x_ != null ) return x_;

    return build();
  }
}
