import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { ChatService } from '../../services/chat.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

class MockChatService {
    sendMessage(messages: any[]) {
        // Return mock response structured like OllamaGenerateResponse
        return of({ response: 'Mock response', done: true, model: 'llama3.2:1b', created_at: '2023-01-01' });
    }
}

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ChatComponent, HttpClientTestingModule, FormsModule],
            providers: [{ provide: ChatService, useClass: MockChatService }]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should send message and receive response', () => {
        component.userInput = 'Hello';
        component.sendMessage();
        expect(component.messages.length).toBe(2); // User + Assistant
        expect(component.messages[1].content).toBe('Mock response');
    });
});
