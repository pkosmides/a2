# A2 - Authentication & Authorization

[![Build Status](https://travis-ci.org/e-ucm/a2.svg?branch=master)](https://travis-ci.org/e-ucm/a2) [![Coverage Status](https://coveralls.io/repos/e-ucm/a2/badge.svg?branch=master&service=github)](https://coveralls.io/github/e-ucm/a2?branch=master) [![Dependency Status](https://david-dm.org/e-ucm/a2.svg)](https://david-dm.org/e-ucm/a2) [![devDependency Status](https://david-dm.org/e-ucm/a2/dev-status.svg)](https://david-dm.org/e-ucm/a2#info=devDependencies) [![Code Climate](https://codeclimate.com/github/e-ucm/a2/badges/gpa.svg)](https://codeclimate.com/github/e-ucm/a2) [![Issue Stats](http://issuestats.com/github/e-ucm/a2/badge/pr?style=flat)](http://issuestats.com/github/e-ucm/a2) [![Issue Stats](http://issuestats.com/github/e-ucm/a2/badge/issue?style=flat)](http://issuestats.com/github/e-ucm/a2)

Authentication & Authorization module for [Rage Analytics](https://github.com/e-ucm/rage-analytics)


![server](https://cloud.githubusercontent.com/assets/5658058/13121389/7174889a-d5b2-11e5-9065-fe9903bbdd50.png)

## Design goals

Authentication and authorization are important concerns for multiple RAGE assets. Having a single server (this asset, A2) that can perform authentication and authorization on behalf of all other assets provides single-sign-on capabilities to those assets, and drastically reduces duplicated effort. A2 proxies all authenticated, authorized requests to the corresponding server-side assets. Server-side assets can programmatically (via API) register themselves and configure what they consider to be authorized via customizable roles.

For clients of server-side assets that are proxied behind A2, single-sign-on is completely transparent. Additionally, since A2 effectively becomes a single point of contact, client configuration is drastically simplified: only A2’s location login and credentials need to be stored, instead of each individual server-side asset’s location and login credentials.

For more details check out the [wiki](https://github.com/e-ucm/a2/wiki)
