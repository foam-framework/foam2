/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao;

import foam.core.*;

/**
 * An unsafe MDAO which does not freeze objects on the way in
 * or clone on the way out. Can be used to improve performance
 * in specialized performance critical cases. Use with extreme
 * caution.
 **/
public class MutableMDAO
  extends MDAO
{
  public MutableMDAO(ClassInfo of) {
    super(of);
  }

  public FObject objIn(FObject obj) {
    return obj;
  }

  public FObject objOut(FObject obj) {
    return obj;
  }
}
