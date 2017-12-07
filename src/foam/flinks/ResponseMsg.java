/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.flinks;

import foam.core.*;

public class ResponseMsg implements ContextAware {
  private Parser jsonParser;
  private String resultJson;
  private FObject model_;

  public ResponseMsg() {
    this(null);
  }
  public ResponseMsg(X x) {
    this(x, null);
  }
  public ResponseMsg(X x, String json){
    resultJson = json;
    this.setX(x);
  }
}