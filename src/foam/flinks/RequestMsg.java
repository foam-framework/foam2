/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.flinks;

import foam.core.*;
import foam.lib.json.Outputter;

public class RequestMsg {
  private static Outputter jsonOutputter = new Outputter();
  private FObject model_;
  private String requestInfo_;
  private String httpMethod_;

  public RequestMsg() {
  }

  public String getJson() {
    if ( model_ == null ) throw new RuntimeException("No model found in the RequestMsg");
    return jsonOutputter.stringify(model_);
  }

  public void setModel(FObject model) {
    model_ = model;
  }

  public FObject getModel() {
    return model_;
  }

  public void setRequestInfo(String requestInfo) {
    requestInfo_ = requestInfo;
  }

  public String getRequestInfo() {
    return requestInfo_;
  }

  public void setHttpMethod(String httpMethod) {
    httpMethod_ = httpMethod; 
  }

  public String getHttpMethod() {
    return httpMethod_;
  }
}