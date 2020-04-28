package foam.nanos.approval.test;

import foam.core.X;
import foam.dao.ArraySink;
import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.User;
import foam.nanos.ruler.Operations;
import net.nanopay.test.liquid.LiquidTestExecutor;

import static foam.mlang.MLang.*;


public class ApprovalStatusTestExecutor extends LiquidTestExecutor {

  private ApprovalStatusTestExecutorState[] states;
  private int usersCounter;

  public ApprovalStatusTestExecutor(String prefix, ApprovalStatusTestExecutorState[] testStates) {
    super(prefix);
    this.states = testStates;
  }

  public ApprovalStatusTestExecutorState[] getStates() {
    return this.states;
  }

  public void runTest(X x) {
    // Setup contexts
    this.setup(x);

    // Get the expected actions and states for this test
    test(getStates() != null, "Test states must be set");
    if (getStates() == null)
      return;

    for ( ApprovalStatusTestExecutorState currentState : getStates() ){
      // add user
      User userInApproval = addUser(getFirstX());

      // get request
      X contextToTest = currentState.getIsInitiatingUser() ? getFirstX() : getSecondX();

      ApprovalRequest request = getRequest(contextToTest, userInApproval, ApprovalStatus.REQUESTED);

      // test action
      // Mark the request with the appropriate status
      request = (ApprovalRequest) request.fclone();
      request.setStatus(currentState.getApprovalStatus());

      // Save the approval
      try {
        this.getApprovalRequestDAO(contextToTest).inX(contextToTest).put(request);
      } catch (Exception e) {
        // testing prevention of approving or rejecting by the initiator
        if (
          request.getCreatedBy() == request.getApprover() &&
            (
              request.getStatus() == ApprovalStatus.APPROVED ||
                request.getStatus() == ApprovalStatus.REJECTED
            )
        ){
          test(e.getMessage().equals("You cannot approve or reject a request that you have initiated."), "For an initiator, Expecting approval/rejection exception: " + e.getMessage());
          resetEnvironment(getSystemX(), userInApproval);
          continue;
        }

        if (
          request.getCreatedBy() != request.getApprover() && request.getStatus() == ApprovalStatus.CANCELLED
        ){
          test(e.getMessage().equals("You cannot cancel a request that you did not initiate."), "For a non-initiator, Expecting cancellation exception: " + e.getMessage());
          resetEnvironment(getSystemX(), userInApproval);
          continue;
        }
        throw new RuntimeException(e);
      }

      ApprovalRequest approvedRequest;

      try {
        approvedRequest = getRequest(contextToTest, userInApproval, currentState.getApprovalStatus());
      } catch(Exception e){
        throw new RuntimeException(e);
      }

      if ( currentState.getIsInitiatingUser() ){
        test(approvedRequest.getStatus() == ApprovalStatus.CANCELLED, "For an initiator, checking if found approval request status is: CANCELLED " + " - " + approvedRequest.getStatus());
      } else {
        test(approvedRequest.getStatus() == ApprovalStatus.APPROVED ||
          approvedRequest.getStatus() == ApprovalStatus.REJECTED,
          "For a non-initiator, checking if found approval request status is: APPROVED or REJECTED " + " - " + approvedRequest.getStatus()
        );
      }

      // reset environment (remove the user as super admin and all approval requests relating to it)
      resetEnvironment(getSystemX(), userInApproval);
    }
  }

  private ApprovalRequest getRequest(X x, User userInApproval, ApprovalStatus status){
    // Request to return
    ApprovalRequest approvalRequest;
    ArraySink approvalRequests;

    User xUser = (User) x.get("user");

    approvalRequests = (ArraySink) getApprovalRequestDAO(getSystemX()).inX(getSystemX()).where(AND(
      CONTAINS_IC(ApprovalRequest.OBJ_ID, String.valueOf(userInApproval.getId())),
      EQ(ApprovalRequest.CLASSIFICATION, "User"),
      EQ(ApprovalRequest.OPERATION, Operations.CREATE),
      EQ(ApprovalRequest.APPROVER, xUser.getId()),
      EQ(ApprovalRequest.STATUS, status)
    )).select(new ArraySink());


    if ( approvalRequests.getArray().size() != 1 ){
      throw new RuntimeException("Something went wrong, there should be only one request for the user");
    }

    approvalRequest = (ApprovalRequest) approvalRequests.getArray().get(0);

    return approvalRequest;
  }

  private User addUser(X x) {
    // Email of the user for the test
    String email = this.getTestPrefix() + this.usersCounter + "approvaltestuser@nanopay.net";

    // Check if the user already exists
    User user = (User) getLocalUserDAO(x).inX(getSystemX()).find(EQ(User.EMAIL, email));
    test(user == null, "Checking if user already exists: " + email);

    // Create a new user
    user = new User.Builder(x)
      .setFirstName(this.getTestPrefix())
      .setLastName("Test")
      .setEmail(email)
      .setGroup("liquidBasic")
      .setJobTitle("Tester")
      .setOrganization("Acme")
      .setEnabled(true)
      .build();

    // Add to the context
    user = (User) getLocalUserDAO(x).inX(x).put(user);

    usersCounter++;

    return user;
  }

  private void resetEnvironment(X x, User userInApproval){
    removeRequests(x, userInApproval);
    removeUser(x, userInApproval);
  }

  private void removeRequests(X x, User userInApproval) {
    ArraySink approvalRequestBefore = (ArraySink) this.getApprovalRequestDAO(x).select(new ArraySink());

    this.getApprovalRequestDAO(x).where(AND(
      CONTAINS_IC(ApprovalRequest.OBJ_ID, String.valueOf(userInApproval.getId())),
      EQ(ApprovalRequest.CLASSIFICATION, "User"),
      EQ(ApprovalRequest.OPERATION, Operations.CREATE)
    )).removeAll();

    ArraySink approvalRequestsAfter = (ArraySink) this.getApprovalRequestDAO(x).select(new ArraySink());
  }

  private void removeUser(X x, User userInApproval) {
    getLocalUserDAO(x).inX(getSystemX()).remove(userInApproval);
  }
}
