import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('ChatService', () => {
    let service: ChatService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ChatService]
        });
        service = TestBed.inject(ChatService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send message to Ollama API', () => {
        const messages: any[] = [{ role: 'user', content: 'Hello' }];
        const mockResponse = { response: 'Hi there', done: true, model: 'llama3.2:1b', created_at: '2023-01-01' };

        service.sendMessage(messages).subscribe(response => {
            expect(response.response).toBe('Hi there');
        });

        const req = httpMock.expectOne(environment.ollamaUrl);
        expect(req.request.method).toBe('POST');
        // Check if prompt is constructed correctly
        expect(req.request.body).toEqual({
            model: environment.model,
            prompt: 'user: Hello\nassistant:',
            stream: false
        });

        req.flush(mockResponse);
    });
});
