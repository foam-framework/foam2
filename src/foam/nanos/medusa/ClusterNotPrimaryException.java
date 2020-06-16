/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

public class ClusterNotPrimaryException
  extends RuntimeException {

  public ClusterNotPrimaryException(String message) {
    super(message);
  }

  public ClusterNotPrimaryException(String message, Throwable cause) {
    super(message, cause);
  }
}
