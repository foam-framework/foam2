/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.flinks;

import foam.core.*;
import foam.flinks.model.*;
import foam.lib.json.Outputter;

public class RequestMsg 
  extends Msg
{
  private static Outputter jsonOutputter = new Outputter();
  private String requestInfo_;
  private String httpMethod_;
  private boolean isJsonSet_ = false;

  public RequestMsg() {
    this(null);
  }
  public RequestMsg(X x) {
    this(x, null);
  }
  public RequestMsg(X x, FlinksCall model){
    setX(x);
    setModel(model);
  }

  @Override
  public String getJson() {
    if ( isJsonSet_ == true) {
      return json_;
    } else {
      if ( model_ == null ) throw new RuntimeException("No model found");
      String ret = jsonOutputter.stringify(model_);
      setJson(ret);
      return ret;
    }
  }

  @Override
  public void setJson(String json) {
    json_ = json;
    isJsonSet_ = true;
  }

  @Override
  public void setModel(FlinksCall model) {
    model_ = model;
    isJsonSet_ = false;
  }

  @Override
  public FlinksCall getModel() {
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