package foam.util;

import java.util.Iterator;
import java.util.NoSuchElementException;

public class List<O> {
  private final int maxSize_;
  private Node<O> head_;
  private Node<O> tail_;
  private final boolean isAutoDequeue_;
  private int curSize_;

  public List(int maxSize, boolean isAutoDequeue) {
    head_ = null;
    tail_ = null;
    maxSize_ = maxSize;
    isAutoDequeue_ = isAutoDequeue;
    curSize_ = 0;
  }

  public List() {
    this(-1, false);
  }

  public List(int maxSize) {
    this(maxSize, false);
  }

  private boolean isAllowAdd() {
    return maxSize_ == -1 || curSize_ < maxSize_;
  }
  public int size() {
    return curSize_;
  }
  public void enQueue(O o) {
    if ( isAllowAdd() ) {
      doEnQueue(o);
    } else {
      if ( isAutoDequeue_ ) {
        doDeQueue();
        doEnQueue(o);
      } else {
        throw new RuntimeException("Maximum size of the List is: " + maxSize_);
      }
    }
  }
  public O deQueue() {
    return doDeQueue();
  }
  private O doDeQueue() {
    O ret = null;
    if ( head_ == null && tail_ == null ) {
      //list is empty, do nothing
    } else if ( head_ == tail_ ) {
      //list has one node, set both head and tail to null
      ret = head_.getValue();
      head_ = null;
      tail_ = null;
      //reduce size
      curSize_--;
    } else {
      //list is non-empty, return head
      //remove head
      ret = head_.getValue();
      //set head->post->pre to null
      head_.getPost().setPre(null);
      //set head to head->post
      head_ = head_.getPost();
      //reduce size
      curSize_--;
    }
    return ret;
  }
  private void doEnQueue(O o) {
    //create a new node
    Node<O> node = new Node<O>(o);
    if ( head_ == null && tail_ == null ) {
      //list is empty, set node to both head and tail
      head_ = node;
      tail_ = node;
    } else {
      //set node to tail->post
      tail_.setPost(node);
      //set tail_ to node->pre
      node.setPre(tail_);
      //set node to tail
      tail_ = node;
    }
    //update size
    curSize_++;
  }
  public void push(O o) {
    if ( isAllowAdd() ) {
      doPush(o);
    } else {
      throw new RuntimeException("Maximum size of the List is: " + maxSize_);
    }
  }
  public void doPush(O o) {
    //create a new node
    Node<O> node = new Node<O>(o);
    if ( head_ == null && tail_ == null ) {
      //list is empty, set node to both head and tail
      head_ = node;
      tail_ = node;
    } else {
      //list is non-empty, set node to the tail
      //set node to tail->post
      tail_.setPost(node);
      //set tail_ to node->pre
      node.setPre(tail_);
      //set node to tail
      tail_ = node;
    }
    //update size
    curSize_++;
  }
  public O pop() {
    return doPop();
  }

  private O doPop() {
    O ret = null;
    if ( head_ == null && tail_ == null ) {
      //list is empty, do nothing
    } else if ( head_ == tail_ ) {
      //list has one element
      ret = tail_.getValue();
      head_ = null;
      tail_ = null;
      curSize_--;
    } else {
      //list is non-empty, return the tail
      ret = tail_.getValue();
      //set null to tail->pre->post
      tail_.getPre().setPost(null);
      //set tail->pre to tail
      tail_ = tail_.getPre();
      curSize_--;
    }
    return ret;
  }
  public int indexOf(O o) {
    int ret = 0;
    Node<O> e = head_;
    //find equal node
    while ( ret < curSize_ && e != null && ! e.getValue().equals(o) ) {
      ret++;
      e = e.getPost();
    }
    // if i == null, means that can not find
    if ( e == null ) return -1;
    //return position
    return ret;
  }
  public O valueAtIndex(int i) {
    if ( i >= curSize_ || i < 0 ) throw new IndexOutOfBoundsException("List: index out of bound");
    Node<O> e = head_;
    //find node at i
    for ( int n = 0 ; n < i ; n++ ) {
      e = e.getPost();
    }
    //return value
    return e.getValue();
  }
  public O removeAtIndex(int i) {
    if ( i >= curSize_ || i < 0 ) throw new IndexOutOfBoundsException("List: index out of bound");
    Node<O> e = head_;
    //find node at i;
    for ( int n = 0 ; n < i ; n++ ) {
      e = e.getPost();
    }
    return removeNode(e);
  }
  public O remove(O o, int startIndex) {
    if ( startIndex >= curSize_ || startIndex < 0 ) throw new IndexOutOfBoundsException("List: index out of bound");
    Node<O> e = head_;
    for ( int i = 0 ; i < startIndex ; i++ ) {
      e = e.getPost();
    }
    while ( e != null && ! e.getValue().equals(o) ) {
      e = e.getPost();
    }
    if ( e == null ) return null;
    return removeNode(e);
  }
  private O removeNode(Node<O> node) {
    //remove the node
    if ( node.pre_ != null ) node.pre_.post_ = node.post_;
    if ( node.post_ != null ) node.post_.pre_ = node.pre_;
    if ( head_ == tail_ ) {
      head_ = null;
      tail_ = null;
    } else if ( head_ == node ) {
      head_ = node.post_;
    } else {
      tail_ = node.pre_;
    }
    curSize_--;
    return node.getValue();
  }
  public void addBefore(O o, int index) {
    if ( ! isAllowAdd() ) throw  new IndexOutOfBoundsException("List: List is already full");
    if ( index >= curSize_ || index < 0 ) throw new RuntimeException("List: index out of bound");
    Node<O> node = new Node<O>(o);
    Node<O> e = head_;
    for ( int i = 0 ; i < index ; i++ ) {
      e = e.getPost();
    }
    if ( e == head_ ) {
      e.pre_ = node;
      node.post_ = e;
      head_ = node;
    } else {
      node.pre_ = e.pre_;
      node.post_ = e;
      e.pre_.post_ = node;
      e.pre_ = node;
    }
    curSize_++;
  }
  public void addAfter(O o, int index) {
    if ( ! isAllowAdd() ) throw  new IndexOutOfBoundsException("List: List is already full");
    if ( index >= curSize_ || index < 0 ) throw new RuntimeException("List: index out of bound");
    Node<O> node = new Node<O>(o);
    Node<O> e = head_;
    for ( int i = 0 ; i < index ; i++ ) {
      e = e.getPost();
    }
    if ( e == tail_ ) {
      e.post_ = node;
      node.pre_ = e;
      tail_ = node;
    } else {
      node.post_ = e.post_;
      node.pre_ = e;
      e.post_.pre_ = node;
      e.post_ = node;
    }
    curSize_++;
  }
  public Object[] toArray() {
    Object[] ret = new Object[curSize_];
    int c = 0;
    for (Node<O> i = head_; i != null ; i = i.post_ ) {
      ret[c++] = i.getValue();
    }
    return ret;
  }
  public <T> T[] toArray(T[] array) {
    if ( array.length < curSize_ ) {
      array = (T[]) java.lang.reflect.Array.newInstance(array.getClass().getComponentType(), curSize_);
    }
    int c = 0;
    Node<O> e = head_;
    while ( e != null ) {
      array[c++] = (T) e.getValue();
      e = e.getPost();
    }
    for ( int i = c ; c < array.length ; i++) {
      array[c] = null;
    }
    return array;
  }
  public Iterator<O> iterator() {
    return new ListIter<O>(toArray(), 0);
  }

  static final class ListIter<O> implements Iterator<O> {
    private final Object[] array_;
    private int cursor_;
    ListIter(Object[] array, int cursor) {
      array_ = array;
      cursor_ = cursor;
    }
    @Override
    public boolean hasNext() {
      return cursor_ < array_.length;
    }
    @Override
    public O next() {
      if ( ! hasNext() )
        throw new NoSuchElementException();
      return (O) array_[cursor_++];
    }
  }
  public String toString() {
    String ret = "[";
    Node<O> e = head_;
    while( e != null ) {
      ret += e;
      if ( e != tail_ ) {
        ret += ",";
      }
      e = e.getPost();
    }
    return ret += "]";
  }
  private static class Node<O> {
    Node<O> pre_;
    Node<O> post_;
    O value_;
    Node(O value) {
      value_ = value;
    }
    Node(Node<O> pre, Node<O> post, O value) {
      pre_ = pre;
      post_ = post;
      value_ = value;
    }
    public final O getValue() { return value_; }
    public final void setValue(O value) { value_ = value; }
    public final void setPre(Node<O> pre) { pre_ = pre; }
    public final void setPost(Node<O> post) { post_ = post; }
    public final Node<O> getPre() { return pre_; }
    public final Node<O> getPost() { return post_; }
    public String toString() { return value_.toString(); }
  }

}