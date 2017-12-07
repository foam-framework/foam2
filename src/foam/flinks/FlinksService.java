/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.flinks;

public class FlinksService {
  public static final String AUTHORIZE = "Authorize";
  public static final String AUTHORIZE_MULTIPLE = "AuthorizeMultiple";
  public static final String ACCOUNTS_SUMMARY = "GetAccountsSummary";
  public static final String WAIT_SUMMARY = "WaitSummary";
  public static final String ACCOUNTS_DETAIL = "GetAccountsDetail";
  public static final String ACCOUNTS_STATEMENTS = "GetStatements";

  private String address_;
  private RestCall call = new RestCall();

  public FlinksService() {
    this("8bc4718b-3780-46d0-82fd-b217535229f1");
  }
  public FlinksService(String customerId) {
    this("https://nanopay-api.private.fin.ag/v3", customerId);
  }
  public FlinksService(String url, String customerId) {
    address_ = url + "/" + customerId + "/" + "BankingServices";
  }

  public Msg service(RequestMsg msg) {
    if ( msg.getRequestCode().equals(AUTHORIZE) ) {
      return authorizeService(msg);
    } else if ( msg.getRequesCode().equals(AUTHORIZE_MULTIPLE) ) {
      return null;
    } else if ( msg.getRequestCode().equals(ACCOUNTS_SUMMARY) ) {
      return null;
    } else if ( msg.getRequestCode().equals(ACCOUNTS_STATEMENTS) ) {
      return null;
    } else if ( msg.getRequestCode().equals(ACCOUNTS_DETAIL) ) {
      return null;
    } else if ( msg.getRequestCode().equals(WAIT_SUMMARY) ) {
      return null;
    } else {
      return null;
    }
  }

  public Msg authorizeService(RequestMsg msg) {
    String resp = call.request(address_ + "/" + msg.getRequestCode(), msg.getRequestMethod(), msg.getJson());

    return null;
  }

  public Msg accountsDetailService(Msg msg) {
    return null;
  }
}