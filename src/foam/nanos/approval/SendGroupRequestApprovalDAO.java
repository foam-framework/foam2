/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.approval;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.approval.ApprovalRequest;

/**
 * Populates "points" property for new requests based on approver user.
 * When approvalRequest.group property is set, creates a new ApprovalRequest object for each user in the group and puts it to approvalDAO.
 * When approvalRequest.approver property is set, approvalRequest.group is ignored.
 * The original object is returned and should not be used for any operations.
 */

public class SendGroupRequestApprovalDAO
extends ProxyDAO {

  public SendGroupRequestApprovalDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    ApprovalRequest request = (ApprovalRequest) obj;
    ApprovalRequest oldRequest = (ApprovalRequest) ((DAO) x.get("approvalRequestDAO")).find(obj);

    if ( oldRequest != null ) {
      return getDelegate().put_(x, obj);
    }
    User approver = request.findApprover(getX());

    if ( approver != null ) {
      request.setPoints(findUserPoints(approver));
      return super.put_(x, request);
    }

    Group group = request.findGroup(getX());

    if ( group == null ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Approver or approver group must be set for approval request");
      throw new RuntimeException("Approver or approver group must be set for approval request");
    }

    group.getUsers(getX()).select(new AbstractSink() {

      @Override
      public void put(Object obj, Detachable sub) {
        sendSingleRequest(x, request, ((User)obj).getId());
      }

    });
    return obj;
  }

  private void sendSingleRequest(X x, ApprovalRequest req, long userId) {
    ApprovalRequest request = (ApprovalRequest) req.fclone();
    request.clearId();
    request.setApprover(userId);
    ((DAO) x.get("approvalRequestDAO")).put_(x, request);
  }

  private int findUserPoints(User user) {
    // TODO: find user points based on spid/role/group/configurations
    return 1;
  }
}
