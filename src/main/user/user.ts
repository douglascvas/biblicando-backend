'use strict';
import {Permission} from "./permission";

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