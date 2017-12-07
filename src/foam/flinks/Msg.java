/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.flinks;

import foam.core.FObject;
import foam.flinks.model.FlinksRequest;
import foam.flinks.model.FlinksResponse;

public interface Msg {
  public String getHttpMethod();
  public String getJson();
  public String getRequest();
  // public String setModel(FlinksRequest request);
  // public FlinksResponse getModel();
  // public boolean isValid();
  // public String getErrorMessage();
  // public int getHttpResponseCode();
  // public String getFlinksCode();
  // public void setProperty(String name, Object obj);
  // public Object getProperty(String name);
}