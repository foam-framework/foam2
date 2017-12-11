/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.flinks;

import foam.core.*;
import foam.lib.parse.Parser;

public class ResponseMsg implements ContextAware {
  private String json_;
  private FObject model_;
  private ClassInfo modelInfo_;
  private X x_;
  private int httpStatusCode_;

  public ResponseMsg() {
    this(null);
  }
  public ResponseMsg(X x) {
    this(x, null);
  }
  public ResponseMsg(X x, String json){
    json_ = json;
    this.setX(x);
  }
  public void setModelInfo(ClassInfo modelInfo){
    modelInfo_ = modelInfo;
  }
  public ClassInfo getModelInfo() {
    return modelInfo_;
  }
  public void setX(X x) {
    x_ = x;
  }
  public X getX() {
    return x_;
  }
  public void setJson(String json) {
    json_ = json;
  }
  public String getJson(){
    return json_;
  }
  public void setHttpStatusCode(int httpStatusCode) {
    httpStatusCode_ = httpStatusCode;
  }
  public int getHttpStatusCode() {
    return httpStatusCode_;
  }
}