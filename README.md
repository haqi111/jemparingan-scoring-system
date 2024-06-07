<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

BE-JemparinganPakualaman API is a robust and efficient solution designed to manage various aspects of traditional archery competitions (Jemparingan). This API facilitates seamless administration, participant management, scoring, and real-time live score updates.
# Full Documentation In Here
  - https://documenter.getpostman.com/view/26309282/2sA3XJjjgK

# Table of Contents

- [Prerequisites](#prerequisites)
    
- [Installation](#installation)
    
- [Configuration](#configuration)
    
- [Running the Application](#running-the-application)
    

## Prerequisites

Before running the Jemparingan-Scoring-System backend application, make sure you have the following installed:

- **Nest.Js**
    
- **Prisma ORM**
    
- **Node.Js**
    

## Installation

1. Clone the repository from GitHub:
    
    ``` shell
         git clone https://github.com/haqi111/jemparingan-scoring-system.git
    
     ```
    
2. Change into the project directory:
    
    ``` shell
         cd jemparingan-scoring-system
    
     ```
    
3. Install the required dependencies using npm:
    
    ``` shell
         npm install
    
     ```
    

## Configuration

Before running the application, you need to configure the following settings in the `.env`, file:

- PostgresSQL database configuration:
    
    - `.env['DATABASE_URL']`: The PostgresSQL server host.
        
    - `.env['POSTGRES_USER']`: The PostgresSQL username.
        
    - `.env['POSTGRES_PASSWORD']`: The PostgresSQL password.
        
    - `.env['POSTGRES_DB']`: The name of the PostgresSQL database.
        
    - `.env['DB_HOST']`: The name of the database host.
        
    - `.env['DB_PORT']`: The name of the database port.
        
- Server Configuration
    
    - `.env['PORT']`: The Server port.
        
- JWT secret key:
    
    - `.env['AT_SECRET']`: A secret key used for generate access JWT token. , You can generate a random key or provide your own.
        
    - `.env['RT_SECRET']`: A secret key used for generate refresh JWT token. , You can generate a random key or provide your own.
        
- Superadmin Configuration
    
    - `.env['SUPERADMIN_EMAILS']`: The email can provide by your own
        

## Running the Application

To run the this jemparingan scoring system application, execute the following command:

``` shell
npm run start

 ```

Make sure you have the required dependencies installed and the necessary configurations set before running the application.

That's it! You have successfully set up and documented the Jemparingan Scoring System backend application.
## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
