package com.chrome.origintrials.dao;

import foam.core.*;
import com.chrome.origintrials.model.*;
import com.chrome.origintrials.services.TokenService;

public class ApplicationDAO extends foam.dao.ProxyDAO {


  public FObject put(FObject obj) {
    PropertyInfo p = (PropertyInfo)obj.getClassInfo().getAxiomByName("id");


    Application existing = (Application)(getDelegate().find(p.get(obj)));

    Application incoming = (Application)super.put(obj);

    if ( incoming.getApproved() && ! existing.getApproved() ) {
      ((TokenService)getX().get("tokenService")).generateAndEmailToken(incoming);
    }

    return incoming;
  }
}
