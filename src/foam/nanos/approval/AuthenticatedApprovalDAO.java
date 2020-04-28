package foam.nanos.approval;

import foam.core.X;
import foam.core.FObject;
import foam.dao.*;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.approval.ApprovalRequest;

import static foam.mlang.MLang.EQ;

public class AuthenticatedApprovalDAO
  extends ProxyDAO {
  public final static String GLOBAL_APPROVAL_READ = "approval.read.*";
  public final static String GLOBAL_APPROVAL_UPDATE = "approval.update.*";
  public final static String GLOBAL_APPROVAL_REMOVE = "approval.remove.*";

  public AuthenticatedApprovalDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    ApprovalRequest approvalRequest = (ApprovalRequest) obj;
    Long userId = ((User) x.get("user")).getId();
    AuthService authService = (AuthService) x.get("auth");

    if ( ! authService.check(x, GLOBAL_APPROVAL_UPDATE) && ! SafetyUtil.equals(approvalRequest.getApprover(), userId) ) {
      throw new AuthorizationException();
    }

    return super.put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    ApprovalRequest ret = (ApprovalRequest) super.find_(x, id);
    if ( ret != null ) {
      long currentUserId = ((User) x.get("user")).getId();
      AuthService authService = (AuthService) x.get("auth");

      if ( ! authService.check(x, GLOBAL_APPROVAL_READ) && ! SafetyUtil.equals(currentUserId, ret.getApprover()) ) {
        throw new AuthorizationException();
      }
    }

    return ret;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    boolean global = auth.check(x, GLOBAL_APPROVAL_READ);
    DAO dao = global ? getDelegate() : getDelegate().where(EQ(ApprovalRequest.APPROVER, user.getId()));
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    AuthService auth = (AuthService) x.get("auth");

    if ( ! auth.check(x, GLOBAL_APPROVAL_REMOVE) ) {
      throw new AuthenticationException();
    }
    return getDelegate().remove_(x, obj);
  }

}
