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
      border: 1px solid transparent;
    }

    ^ + ^ {
      margin-left: 8px;
    }

    ^ img {
      margin-right: 4px;
    }

    ^:focus {
      border-width: 2px;
    }

    ^:hover:not(:disabled) {
      cursor: pointer;
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

    ^primary:hover:not(:disabled) {
      border-color: #294798;
      background-color: %SECONDARYHOVERCOLOR%;
    }

    ^primary:focus {
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^primary:disabled {
      border-color: %SECONDARYDISABLEDCOLOR%;
      background-color: %SECONDARYDISABLEDCOLOR%;
    }

    ^primary-destructive {
      border-color: %DESTRUCTIVECOLOR%;
      background-color: %DESTRUCTIVECOLOR%;
      color: white;
    }

    ^primary-destructive:hover:not(:disabled) {
      border-color: #a61414;
      background-color: %DESTRUCTIVEHOVERCOLOR%;
    }

    ^primary-destructive:focus {
      border-color: #a61414;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^primary-destructive:disabled {
      border-color: #ed8e8d;
      background-color: %DESTRUCTIVEDISABLEDCOLOR%;
    }


    /*
     * Secondary
     */

    ^secondary {
      border-color: #cbcfd4;
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
      border-color: %SECONDARYCOLOR%;
    }

    ^secondary:disabled {
      border-color: #e7eaec;
      color: %PRIMARYDISABLEDCOLOR%;
    }

    ^secondary-destructive {
      border-color: %DESTRUCTIVECOLOR%;
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

    ^tertiary {
      border-color: #355bc4;
      background-color: %SECONDARYCOLOR%;
      color: white;
    }

    ^tertiary:hover:not(:disabled) {
      border-color: #294798;
      background-color: %SECONDARYHOVERCOLOR%;
    }

    ^tertiary:focus {
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^tertiary:disabled {
      border-color: %SECONDARYDISABLEDCOLOR%;
      background-color: %SECONDARYDISABLEDCOLOR%;
    }

    ^tertiary-destructive {
      border-color: %DESTRUCTIVECOLOR%;
      background-color: %DESTRUCTIVECOLOR%;
      color: white;
    }

    ^tertiary-destructive:hover:not(:disabled) {
      border-color: #a61414;
      background-color: %DESTRUCTIVEHOVERCOLOR%;
    }

    ^tertiary-destructive:focus {
      border-color: #a61414;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^tertiary-destructive:disabled {
      border-color: #ed8e8d;
      background-color: %DESTRUCTIVEDISABLEDCOLOR%;
    }


    /*
     * Sizes
     */

    ^small {
      font-size: 12px;
      padding: 8px 16px;
    }

    ^small:focus {
      padding: 7px 15px;
    }

    ^medium {
      font-size: 14px;
      padding: 9px 16px;
    }

    ^medium:focus {
      padding: 8px 15px;
    }

    ^large {
      font-size: 16px;
      padding: 10px 16px;
    }

    ^large:focus {
      padding: 9px 15px;
    }
  `
});
