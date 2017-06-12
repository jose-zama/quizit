# quizit

[![Build Status](https://travis-ci.org/jose-zama/quizit.svg?branch=master)](https://travis-ci.org/jose-zama/quizit)

## Important note regarding to **License**

This project is on development phase and a **license** regarding to the code and use of the application has not been chosen. 
Therefore, if you have intention to use this software or copy any of the code in this repository you will need to contact me sending an email to: 
pepeazb@gmail.com.


## Dependencies

- Node.js
- Mongodb

## Install

1. Clone repository
2. `npm install`
3. `bower install`

## Run

Make sure the mongodb database is running and then run:

`npm start`

Optionally with DEBUG enabled:

Linux: `DEBUG=qa:* npm start`

Windows: `set DEBUG=qa:* & npm start`


### config.js

This file is used to set several properties for the application:

- **secret** : JWT secret key
- **dbUrl** : The URL where the mongodb lives
