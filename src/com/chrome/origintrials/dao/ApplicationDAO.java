package com.chrome.origintrials.dao;

import foam.core.*;
import com.chrome.origintrials.model.*;
import com.chrome.origintrials.services.TokenService;

import com.google.appengine.api.taskqueue.*;

public class ApplicationDAO extends foam.dao.ProxyDAO {


  public FObject put(FObject obj) {
    PropertyInfo primaryKey = (PropertyInfo)obj.getClassInfo().getAxiomByName("id");


    Application existing = (Application)(getDelegate().find(primaryKey.get(obj)));

    Application incoming = (Application)super.put(obj);

    if ( incoming.getApproved() && ! existing.getApproved() ) {
      Queue queue = QueueFactory.getDefaultQueue();
      queue.add(TaskOptions.Builder.withUrl("/tasks").param("id", "a"));

      //      ((TokenService)getX().get("tokenService")).generateAndEmailToken(incoming);
    }

    return incoming;
  }
}
