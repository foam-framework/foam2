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
import foam.nanos.auth.User;
import net.nanopay.model.Account;
import net.nanopay.tx.model.Transaction;

import java.util.List;

public class TransactionBenchmark
  implements Benchmark
{
  List users = null;
  List accounts = null;

  protected DAO userDAO_;
  protected DAO accountDAO_;
  protected DAO transactionDAO_;
  protected DAO transactionLimitDAO_;

  @Override
  public void setup(X x) {
    userDAO_ = (DAO) x.get("localUserDAO");
    accountDAO_ = (DAO) x.get("localAccountDAO");
    transactionDAO_ = (DAO) x.get("localTransactionDAO");
    transactionLimitDAO_ = (DAO) x.get("transactionLimitDAO");

    transactionDAO_.removeAll();
    transactionLimitDAO_.removeAll();

    Sink sink = new ListSink();
    sink = userDAO_.select(sink);
    users = ((ListSink) sink).getData();

    sink = new ListSink();
    sink = accountDAO_.select(sink);
    accounts = ((ListSink) sink).getData();

    for ( int i = 0 ; i < accounts.size() ; i++ ) {
      Account account = (Account) accounts.get(i);
      account.setBalance(1000000);
      accountDAO_.put(account);
    }

    for ( int i = 0 ; i < users.size() ; i++ ) {
      User user = (User) users.get(i);
      Account account = (Account) accountDAO_.find(user.getId());
      if ( account == null ) {
        account = new Account();
        account.setId(user.getId());
        account.setBalance(1000000);
        accountDAO_.put(account);
      }
    }
  }

  @Override
  public void execute(X x) {
    int fi = (int) (Math.random() * users.size());
    int ti = (int) (Math.random() * users.size());
    int amount = (int) ((Math.random() + 0.1) * 10000);

    long payeeId = ((User) users.get(ti)).getId();
    long payerId = ((User) users.get(fi)).getId();

    if ( payeeId != payerId ) {
      Transaction transaction = new Transaction();
      transaction.setPayeeId(payeeId);
      transaction.setPayerId(payerId);
      transaction.setAmount(amount);
      transactionDAO_.put(transaction);
    }
  }
}