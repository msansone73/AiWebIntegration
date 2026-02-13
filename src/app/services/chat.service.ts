import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface OllamaGenerateResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    context?: number[];
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

    sendMessage(history: ChatMessage[]): Observable<OllamaGenerateResponse> {
        // api/generate expects a single prompt. 
        // We construct the prompt from the history to maintain context.
        const prompt = history.map(msg => `${msg.role}: ${msg.content}`).join('\n') + '\nassistant:';

        const payload = {
            model: this.model,
            prompt: prompt,
            stream: false
        };

        this.logRequest(payload);

        return this.http.post<OllamaGenerateResponse>(this.apiUrl, payload).pipe(
            timeout(this.timeoutMs),
            catchError(error => {
                console.error('Error sending message to Ollama:', error);
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
