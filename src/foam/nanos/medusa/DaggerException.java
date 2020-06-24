/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.medusa;

public class DaggerException
  extends ClusterException {

  public DaggerException(String message) {
    super(message);
  }

  public DaggerException(Throwable cause) {
    this(cause.getMessage(), cause);
  }

  public DaggerException(String message, Throwable cause) {
    super(message, cause);
  }
}
