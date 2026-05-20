import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpLoggerService, HttpLog } from './http-logger';

@Injectable()
export class HttpLoggingInterceptor implements HttpInterceptor {
    constructor(private logger: HttpLoggerService) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const startTime = performance.now();

        return next.handle(request).pipe(
            tap((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    const endTime = performance.now();
                    const duration = endTime - startTime;

                    const log: HttpLog = {
                        id: 0,
                        method: request.method,
                        url: request.url,
                        status: event.status,
                        timestamp: new Date(),
                        duration: Math.round(duration),
                        response: event.body
                    };

                    this.logger.addLog(log);
                }
            }),
            catchError((error: HttpErrorResponse) => {
                const endTime = performance.now();
                const duration = endTime - startTime;

                const log: HttpLog = {
                    id: 0,
                    method: request.method,
                    url: request.url,
                    status: error.status,
                    timestamp: new Date(),
                    duration: Math.round(duration),
                    error: error.error
                };

                this.logger.addLog(log);
                throw error;
            })
        );
    }
}
