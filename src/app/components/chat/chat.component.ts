import { Component, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../services/chat.service';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss'
})
export class ChatComponent implements AfterViewChecked {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    messages: ChatMessage[] = [];
    userInput: string = '';
    isLoading: boolean = false;

    constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) { }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    sendMessage() {
        if (!this.userInput.trim()) return;

        const userMsg: ChatMessage = { role: 'user', content: this.userInput };
        this.messages.push(userMsg);
        this.userInput = '';
        this.isLoading = true;

        const startTime = Date.now();

        this.chatService.sendMessage(this.messages).subscribe({
            next: (response) => {
                const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
                const aiMsg: ChatMessage = { role: 'assistant', content: response.response, responseTime: elapsedSeconds };
                this.messages.push(aiMsg);
                this.isLoading = false;
                this.cdr.detectChanges(); // Force update
            },
            error: (err) => {
                console.error(err);
                this.messages.push({ role: 'system', content: 'Erro ao comunicar com a IA. Verifique se o Ollama está rodando e acessível.' });
                this.isLoading = false;
                this.cdr.detectChanges(); // Force update
            }
        });
    }
}
