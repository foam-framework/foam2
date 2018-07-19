/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.mlang;

import foam.core.X;
import foam.nanos.auth.*;
import static foam.mlang.MLang.*;

public class MLangTest
  extends foam.nanos.test.Test
{
  public void runTest(X x) {
    // Test INSTANCE_OF
    test(
      INSTANCE_OF(User.class).f(new User()),
      "INSTANCE_OF detects instance with class");

    test(
      ! INSTANCE_OF(User.class).f(new Group()),
      "INSTANCE_OF rejects non instance with class");

    test(
      INSTANCE_OF(User.getOwnClassInfo()).f(new User()),
      "INSTANCE_OF detects instance with ClassInfo");

    test(
      ! INSTANCE_OF(User.getOwnClassInfo()).f(new Group()),
      "INSTANCE_OF rejects non instance with ClassInfo");
  }
}
