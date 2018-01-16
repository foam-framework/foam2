/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.util.Password;
import net.nanopay.model.Account;
import net.nanopay.tx.model.Transaction;

public class TransactionBenchmark
  implements Benchmark
{
  protected User payee_;
  protected User payer_;

  protected DAO userDAO_;
  protected DAO accountDAO_;
  protected DAO transactionDAO_;


  @Override
  public void setup(X x) {
    userDAO_ = (DAO) x.get("userDAO");
    accountDAO_ = (DAO) x.get("localAccountDAO");
    transactionDAO_ = (DAO) x.get("transactionDAO");

    // create payer agent
    User payer = new User();
    payer.setFirstName("Test");
    payer.setLastName("Payer");
    payer.setGroup("tester");
    payer.setEmail("test1@nanopay.net");
    payer.setPassword(Password.hash("Mintchip123"));
    payer_ = (User) userDAO_.put(payer);

    // set payer balance to $1000.00
    Account payerAccount = (Account) accountDAO_.find(payer_.getId());
    payerAccount.setBalance(1000 * 100);
    accountDAO_.put(payerAccount);

    // create payee agent
    User payee = new User();
    payee.setFirstName("Test");
    payee.setLastName("Payee");
    payee.setGroup("tester");
    payee.setEmail("test2@nanopay.net");
    payee.setPassword(Password.hash("Mintchip123"));
    payee_ = (User) userDAO_.put(payee);

    // set payee balance to $1000.00
    Account payeeAccount = (Account) accountDAO_.find(payee_.getId());
    payeeAccount.setBalance(1000 * 100);
    accountDAO_.put(payeeAccount);
  }

  @Override
  public void execute(X x) {
    Transaction transaction = new Transaction();
    transaction.setPayerId(payer_.getId());
    transaction.setPayeeId(payee_.getId());
    transaction.setAmount(1);
    transactionDAO_.put(transaction);
  }
}