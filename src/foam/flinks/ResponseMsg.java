/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.flinks;

import foam.core.*;
import foam.flinks.model.*;
import foam.lib.json.JSONParser;

public class ResponseMsg 
  extends Msg 
{
  private int httpStatusCode_;
  private JSONParser jsonParser_;
  private boolean isModelSet_ = false;

  public ResponseMsg() {
    this(null);
  }
  public ResponseMsg(X x) {
    this(x, null);
  }
  public ResponseMsg(X x, String json){
    setJson(json);
    setX(x);
    jsonParser_ = new JSONParser();
  }
  
  public void setHttpStatusCode(int httpStatusCode) {
    httpStatusCode_ = httpStatusCode;
  }
  public int getHttpStatusCode() {
    return httpStatusCode_;
  }

  @Override
  public void setModel(FlinksCall model) {
    isModelSet_ = true;
    model_ = model;
  }

  @Override 
  public FlinksCall getModel() {
    if ( isModelSet_ == true ) {
      return model_;
    } else {
      if ( getX() == null ) {
        throw new RuntimeException("No Context Found");
      }
      if ( modelInfo_ == null ) {
        throw new RuntimeException("No Model ClassInfo Found");
      }
      if ( getJson() == null ) {
        throw new RuntimeException("No Json Found");
      }
      jsonParser_.setX(getX());
      FObject obj = null;
      
      obj = jsonParser_.parseString(getJson(), modelInfo_.getObjClass());
      if ( obj == null ) {
        throw new RuntimeException("Json Parser Error");
      }
      setModel((FlinksCall) obj);
      return (FlinksCall) obj;
    }
  }

  @Override
  public void setJson(String json) {
    json_ = json;
    isModelSet_ = false;
  }
}