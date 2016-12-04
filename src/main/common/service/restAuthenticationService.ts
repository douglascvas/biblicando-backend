import {Named} from "../../bdi/decorator/di";
import {ValidationService} from "./validationService";
import {AccessDeniedException} from "../exception/accessDeniedException";
import {Config} from "../config";

@Named
export class AuthenticationService {
  constructor(private config:Config,
              private validationService:ValidationService) {
  }

  public requiresAuthentication() {
    var self = this;
    return function (request, response, next:Function) {
      if (!request.user.id) {
        self.validationService.rejectRequest(response, new AccessDeniedException('User not authenticated.'));
      }
    }
  }
}