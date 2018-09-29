/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.crypto.hash;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public interface Hashable {

  /**
   * Hash method that uses default algorithm of SHA-256
   *
   * @return output of the hash function
   * @throws NoSuchAlgorithmException
   */
  byte[] hash()
    throws NoSuchAlgorithmException;

  /**
   * Hash method that uses a user provided hashing algorithm
   *
   * @param algorithm user provided hashing algorithm
   * @return output of the hash function
   * @throws NoSuchAlgorithmException
   */
  byte[] hash(String algorithm)
    throws NoSuchAlgorithmException;

  /**
   * Hash metohd that uses a user provided MessageDigest object
   * 
   * @param md MessageDigest object used for hashing
   * @return output of the hash function
   */
  byte[] hash(MessageDigest md);

}
