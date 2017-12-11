/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.Flinks;

import foam.nanos.http.WebAgent;
import foam.core.X;

public class FlinksWebAgent
  implements WebAgent
{
  public FlinksWebAgent() {}

  public void execute(X x) {
    HttpServletRequest req = (HttpServletRequest) x.get(HttpServletRequest.class);

  }
}
