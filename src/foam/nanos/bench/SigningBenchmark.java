/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ListSink;
import foam.dao.Sink;
import net.nanopay.tx.model.Transaction;

import java.math.BigInteger;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.spec.AlgorithmParameterSpec;
import java.security.spec.RSAKeyGenParameterSpec;
import java.util.List;

public class SigningBenchmark
    implements Benchmark
{
  protected PrivateKey key_;
  protected List transactions_;
  protected DAO transactionDAO_;

  @Override
  public void setup(X x) {
    transactionDAO_ = (DAO) x.get("localTransactionDAO");

    Sink sink = new ListSink();
    sink = transactionDAO_.select(sink);
    transactions_ = ((ListSink) sink).getData();

    try {
      // generate an RSA keypair with a size of 2048 and a public exponent of 65537
      SecureRandom srand = SecureRandom.getInstance("SHA1PRNG");
      KeyPairGenerator keygen = KeyPairGenerator.getInstance("RSA");
      AlgorithmParameterSpec spec = new RSAKeyGenParameterSpec(2048, new BigInteger("10001", 16));
      keygen.initialize(spec, srand);

      KeyPair keypair = keygen.generateKeyPair();
      key_ = keypair.getPrivate();
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public void execute(X x) {
    try {
      // sign using SHA256 with RSA
      int n = (int) (Math.random() * transactions_.size());
      ((Transaction) transactions_.get(n)).sign("SHA256withRSA", key_);
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }
}