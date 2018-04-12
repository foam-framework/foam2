/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.util;
import java.util.*;

public class LRU<K, V> {
  private final int maxSize_;
  private int currentSize_;
  private Node head_;
  private Node tail_;
  private Map<K, Node<K, V>> map_;
  public LRU ( int maxSize ) {
    maxSize_ = maxSize;
    head_ = null;
    tail_ = null;
    map_ = new HashMap<K, Node<K, V>>(maxSize_);
  }

  //add new key-value to this LRU cache
  public void cache(K key, V value) {
    Node<K, V> n = map_.get(key);
    if ( n != null ) {
      //if key exists, replace to new value and move node to head
      n.setValue(value);
      moveToHead(n);
      return;
    }
    if ( currentSize_ < maxSize_) {
      //if cache is not full, update current size
      currentSize_++;
    } else {
      //remove least recent used node from both map and list
      map_.remove(tail_.getKey());
      removeFromTail();
    }
    //create a new node, add to head
    Node<K, V> node = new Node<K, V>(key, value);
    map_.put(key, node);
    addToHead(node);
  }

  //get value from this LRU according to the key
  public V get(K key) {
    //get node from Hash Map
    Node<K, V> node = map_.get(key);
    //If not exist, return null
    if ( node == null ) return null;
    //move the node to the head and return node value
    moveToHead(node);
    return node.getValue();
  }

  public V remove(K key) {
    Node<K, V> node = map_.get(key);
    if ( node == null ) return null;
    //remove from list
    removeNode(node);
    //remove from map
    map_.remove(key);
    //reduce size
    currentSize_--;
    return node.getValue();
  }

  //add node to the head of the list
  private void addToHead(Node<K, V> node) {
    //if the list is empty, assign node to both head and tail
    if ( head_ == null ) {
      head_ = node;
      tail_ = node;
      return;
    }
    //set node to head->pre
    head_.setPre(node);
    //set head to node->post
    node.setPost(head_);
    //set node to head
    head_ = node;
  }

  //remove the least recent used node
  private void removeFromTail() {
    //no element in the list
    if ( tail_ == null ) return;
    //only one element in the list
    if ( head_ == tail_ ) {
      head_ = null;
      tail_ = null;
      return;
    }
    //set tail->pre->post to null
    tail_.getPre().setPost(null);
    //set tail->pre to tail
    tail_ = tail_.getPre();
  }

  private void moveToHead(Node<K, V> node) {
    //if only one element
    if ( head_ == tail_ ) return;
    //already in the head
    if ( head_ == node ) return;
    //in the tail
    if ( tail_ == node ) {
      //set node->pre to tail
      tail_ = node.getPre();
      //set node->pre->post to null
      node.getPre().setPost(null);
    } else {
      //set node->post to node->pre->post
      node.getPre().setPost(node.getPost());
      //set node->pre to node->post->pre
      node.getPost().setPre(node.getPre());
    }
    //move to the head
    //set node->pre to null
    node.setPre(null);
    //set head to node->post
    node.setPost(head_);
    //set node to head->pre
    head_.setPre(node);
    //change head
    head_ = node;
  }

  private Node<K, V> removeNode(Node<K, V> node) {
    //assert node is in the list
    if ( head_ == tail_ ) {
      //set both head_ and tail_ to null
      head_ = null;
      tail_ = null;
    } else if ( head_ == node ) {
      //set node->post->pre to null
      node.getPost().setPre(null);
      //set node->post to head
      head_ = node.getPost();
    } else if ( tail_ == node ) {
      //set node->pre->post to null
      node.getPre().setPost(null);
      //set node->pre to tail
      tail_ = node.getPre();
    } else {
      //set node->post to node->pre->post
      node.getPre().setPost(node.getPost());
      //set node->pre to node->post->pre
      node.getPost().setPre(node.getPre());
    }
    return node;
  }

  //print node list from most recent used to least recent used
  public String toString() {
    Node<K, V> cur = head_;
    String ret = "";
    while ( cur != null ) {
      ret += cur.toString() + "\n";
      cur = cur.getPost();
    }
    return ret;
  }

  //print node list from least recent used to most recent used
  public String toReverseString() {
    Node<K, V> cur = tail_;
    String ret = "";
    while ( cur != null ) {
      ret += cur.toString() + "\n";
      cur = cur.getPre();
    }
    return ret;
  }
  
  public Set<Map.Entry<K,V>> entrySet() {
    Map<K, V> map = new HashMap<K, V>();
    for ( Map.Entry<K, Node<K, V>> e : map_.entrySet() ) {
      map.put(e.getKey(), e.getValue().getValue());
    } 
    return map.entrySet();
  }

  //Node
  private static class Node<K, V> {
    Node<K, V> pre_;
    Node<K, V> post_;
    final K key_;
    V value_;
    Node(K key, V value) {
      pre_ = null;
      post_ = null;
      key_ = key;
      value_ = value;
    }
    Node(Node<K, V> pre, Node<K, V> post, K key, V value) {
      pre_ = pre;
      post_ = post;
      key_ = key;
      value_ = value;
    }
    public final K getKey() { return key_; }
    public final V getValue() { return value_; }
    public final void setValue(V value) { value_ = value; }
    public final void setPre(Node<K, V> pre) { pre_ = pre; }
    public final void setPost(Node<K, V> post) { post_ = post; }
    public final Node<K, V> getPre() { return pre_; }
    public final Node<K, V>  getPost() { return post_; }
    public String toString() { return "{ key: " + key_.toString() + " ; value: " + value_.toString() + " }"; }
  }
}
