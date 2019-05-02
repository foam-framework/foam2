/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ActionView',
  extends: 'foam.u2.UnstyledActionView',

  css: `
    ^ {
      border-radius: 3px;
      text-align: center;
      display: inline-block;
      padding: 9px 16px;
      background-color: %SECONDARYCOLOR%;
      color: white;
      border: 1px solid #355bc4;
    }

    ^ + ^ {
      margin-left: 8px;
    }

    ^ img {
      margin-right: 4px;
    }

    ^:focus:not(:hover) {
      border-width: 2px;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
      padding: 8px 15px;
    }

    ^:hover:not(:disabled) {
      cursor: pointer;
    }

    ^:hover:not(:disabled):not(^secondary):not(^secondary-destructive):not(^destructive) {
      border: 1px solid #294798;
      background-color: %SECONDARYHOVERCOLOR%;
    }

    ^:disabled:not(^secondary):not(^secondary-destructive):not(^destructive) {
      border: 1px solid #a7beff;
      background-color: %SECONDARYDISABLEDCOLOR%;
    }

    ^unavailable {
      display: none;
    }

    ^ img {
      vertical-align: middle;
    }

    ^.material-icons {
      cursor: pointer;
    }


    /*
     * Primary
     */

    ^primary {
      border-color: #355bc4;
      background-color: %SECONDARYCOLOR%;
      color: white;
    }

    ^primary-destructive {
      background-color: %DESTRUCTIVECOLOR%;
      border: 1px solid %DESTRUCTIVECOLOR%;
    }

    ^primary-destructive:hover {
      background-color: %DESTRUCTIVEHOVERCOLOR%;
      border-color: #a61414;
    }

    ^primary-destructive:focus {
      border: 2px solid #a61414;
      padding: 7px 15px;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^primary-destructive:disabled {
      background-color: %DESTRUCTIVEDISABLEDCOLOR%;
      border-color: #ed8e8d;
    }


    /*
     * Secondary
     */

    ^secondary {
      border: 1px solid #cbcfd4;
      background-image: linear-gradient(to bottom, #ffffff, #e7eaec);
      color: %PRIMARYCOLOR%;
    }

    ^secondary:hover {
      border-color: #cbcfd4;
      background-image: linear-gradient(to bottom, #ffffff, #d3d6d8);
      color: %PRIMARYHOVERCOLOR%;
    }

    ^secondary:focus {
      background-image: linear-gradient(to bottom, #ffffff, #d3d6d8);
      border: 2px solid %SECONDARYCOLOR%;
      padding: 7px 15px;
    }

    ^secondary:disabled {
      border-color: #e7eaec;
      color: %PRIMARYDISABLEDCOLOR%;
    }

    ^secondary-destructive {
      border: 1px solid %DESTRUCTIVECOLOR%;
      background-color: white;
      color: %DESTRUCTIVECOLOR%;
    }

    ^secondary-destructive:hover {
      border-color: %DESTRUCTIVEHOVERCOLOR%;
      background-color: white;
      color: %DESTRUCTIVEHOVERCOLOR%;
    }

    ^secondary-destructive:disabled {
      border-color: %DESTRUCTIVEDISABLEDCOLOR%;
      color: %DESTRUCTIVEDISABLEDCOLOR%;
    }


    /*
     * Tertiary
     */

    /* Tertiary is the same as primary for now. */


    /*
     * Sizes
     */

    ^small {
      font-size: 12px;
      padding: 8px 16px;
    }

    ^small:focus:not(:hover) {
      padding: 7px 15px;
    }

    ^medium {
      font-size: 14px;
      padding: 9px 16px;
    }

    ^medium:focus:not(:hover) {
      padding: 8px 15px;
    }

    ^large {
      font-size: 16px;
      padding: 10px 16px;
    }

    ^large:focus:not(:hover) {
      padding: 9px 15px;
    }
  `
});
