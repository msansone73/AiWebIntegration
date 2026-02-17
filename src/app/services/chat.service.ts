import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    responseTime?: number; // tempo de resposta em segundos
}

export interface AiAndreiaResponse {
    answer: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = environment.ollamaUrl;
    private model = environment.model;
    private timeoutMs = environment.timeout;
    private requestLog: any[] = [];

    constructor(private http: HttpClient) { }

    getLogs() {
        return this.requestLog;
    }

    sendMessage(history: ChatMessage[]): Observable<AiAndreiaResponse> {
        const lastUserMsg = [...history].reverse().find(msg => msg.role === 'user');
        const question = lastUserMsg ? lastUserMsg.content : '';

        const payload = {
            model: this.model,
            question: question
        };

        this.logRequest(payload);

        return this.http.post<AiAndreiaResponse>(this.apiUrl, payload).pipe(
            timeout(this.timeoutMs),
            catchError(error => {
                console.error('Error sending message to AI Andreia:', error);
                return throwError(() => new Error('Failed to communicate with AI service. Check connection or timeout.'));
            })
        );
    }

    private logRequest(payload: any) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            payload: payload
        };
        this.requestLog.push(logEntry);
        console.log('[Ollama Request]:', JSON.stringify(logEntry, null, 2));
    }
}
