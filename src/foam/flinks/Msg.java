/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.flinks;

import foam.core.*;
import foam.flinks.model.*;

public abstract class Msg 
  implements ContextAware 
{
  protected String json_;
  protected FlinksCall model_;
  protected X x_;
  protected ClassInfo modelInfo_;

  @Override
  public void setX(X x) {
    x_ = x;
  }
  @Override
  public X getX() {
    return x_;
  }
  public void setJson(String json) {
    json_ = json;
  }
  public String getJson(){
    return json_;
  }
  public void setModelInfo(ClassInfo modelInfo){
    modelInfo_ = modelInfo;
  }
  public ClassInfo getModelInfo() {
    return modelInfo_;
  }
  public void setModel(FlinksCall model) {
    model_ = model;
  }
  public FlinksCall getModel() {
    return model_;
  }
}