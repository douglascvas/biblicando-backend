'use strict';

namespace user {

  export interface User {
    firstName:string;
    lastName:string;
    passwordHash:string;
    passwordAlgorithm:string;
    passwordSalt:string;
    email:string;
    registrationIP:string;
    permissions:Permission[];
  }
}