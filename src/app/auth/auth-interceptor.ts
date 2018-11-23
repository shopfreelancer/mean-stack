import {HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {AuthService} from './auth.service';
import {Injectable} from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.getToken();
    // set works like Array.push(), not like what you would expect from a setter
    const authRequest = req.clone({
      headers: req.headers.set('Authorization', 'Bearer '  + token)
    });
    return next.handle(authRequest);
  }
}
