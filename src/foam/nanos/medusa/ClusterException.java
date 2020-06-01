/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.medusa;

public class ClusterException
  extends RuntimeException {

  public ClusterException(String message) {
    super(message);
  }

  public ClusterException(String message, Throwable cause) {
    super(message, cause);
  }
}
