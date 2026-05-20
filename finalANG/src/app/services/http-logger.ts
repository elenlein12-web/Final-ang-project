import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface HttpLog {
    id: number;
    method: string;
    url: string;
    status?: number;
    timestamp: Date;
    duration: number;
    response?: any;
    error?: any;
    expanded?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class HttpLoggerService {
    private logs$ = new BehaviorSubject<HttpLog[]>([]);
    private logCounter = 0;

    getLogs(): Observable<HttpLog[]> {
        return this.logs$.asObservable();
    }

    getCurrentLogs(): HttpLog[] {
        return this.logs$.getValue();
    }

    addLog(log: HttpLog): void {
        log.id = ++this.logCounter;
        const currentLogs = this.logs$.getValue();
        const updatedLogs = [log, ...currentLogs].slice(0, 50); // Keep last 50 logs
        this.logs$.next(updatedLogs);
    }

    clearLogs(): void {
        this.logs$.next([]);
        this.logCounter = 0;
    }
}
