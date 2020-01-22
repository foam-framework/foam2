/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

/**
 * Exception thrown by RetryStrategy when the Retry exits it's while
 * loop without successfully sending the obj.
 */
public class RetryException
  extends RuntimeException {
  public RetryException() {
  }
  public RetryException(String errorMessage) {
    super(errorMessage);
  }
  public RetryException(String errorMessage, Throwable cause) {
    super(errorMessage, cause);
  }
  public RetryException(Throwable cause) {
    super(cause);
  }
}
