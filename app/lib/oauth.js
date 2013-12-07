/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var readline = require('readline');

var googleapis = require('../lib/googleapis.js');
var OAuth2Client = googleapis.OAuth2Client;

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = '19939366693-mnn18qkhbhon5fiqi30ovs7a0p6gq0ir.apps.googleusercontent.com';
var CLIENT_SECRET = 'iNGcI4rA-K-aPcKkZWqw2DOp';
var REDIRECT_URL = 'http://mobi.bleubrain.com/auth';

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getAccessToken(oauth2Client, callback) {
  // generate consent page url
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/plus.me'
  });

  console.log('Visit the url: ', url);
  rl.question('Enter the code here:', function(code) {

    // request access token
    oauth2Client.getToken(code, function(err, tokens) {
      // set tokens to the client
      // TODO: tokens should be set by OAuth2 client.
      oauth2Client.credentials = tokens;
      callback && callback();
    });
  });
}

function getUserProfile(client, authClient, userId, callback) {
  client
    .plus.people.get({ userId: userId })
    .withAuthClient(authClient)
    .execute(callback);
}

function printUserProfile(err, profile) {
  if (err) {
    console.log('An error occurred');
  } else {
    console.log(profile.displayName, ':', profile.tagline);
  }
}

// load google plus v1 API resources and methods
googleapis
  .discover('plus', 'v1')
  .execute(function(err, client) {

  var oauth2Client =
    new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

  // retrieve an access token
  getAccessToken(oauth2Client, function() {
    // retrieve user profile
    getUserProfile(
      client, oauth2Client, 'me', printUserProfile);
  });

});