import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../services/api';

interface ChatMessage {
  type: 'user' | 'bot' | 'error';
  text: string;
}

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai.html',
  styleUrls: ['./ai.css']
})
export class AiComponent {
  apiKey = '';
  userInput = '';
  messages: ChatMessage[] = [{ type: 'bot', text: 'Write something and Tedo will answer. Please set your Gemini API key first.' }];
  isTyping = false;

  constructor(private api: ApiService, private http: HttpClient) { }

  async sendMessage(): Promise<void> {
    const prompt = this.userInput.trim();
    if (!prompt) {
      return;
    }
    if (!this.apiKey.trim()) {
      this.messages.push({ type: 'error', text: 'Please provide an API key before sending a message.' });
      return;
    }

    this.messages.push({ type: 'user', text: prompt });
    this.userInput = '';
    this.isTyping = true;

    try {
      let apiData = '';

      if (prompt.toLowerCase().includes('hotel')) {
        const hotels = await this.api.getHotels();
        apiData += `\n\nHotels:\n${JSON.stringify(hotels.slice(0, 5), null, 2)}`;
      }
      if (prompt.toLowerCase().includes('room')) {
        const rooms = await this.api.getRooms();
        apiData += `\n\nRooms:\n${JSON.stringify(rooms.slice(0, 5), null, 2)}`;
      }
      if (prompt.toLowerCase().includes('available')) {
        const available = await this.api.getAvailableRooms();
        apiData += `\n\nAvailable Rooms:\n${JSON.stringify(available.slice(0, 5), null, 2)}`;
      }
      if (prompt.toLowerCase().includes('city')) {
        const cities = await this.api.getCities();
        apiData += `\n\nCities:\n${JSON.stringify(cities, null, 2)}`;
      }
      if (prompt.toLowerCase().includes('type')) {
        const types = await this.api.getRoomTypes();
        apiData += `\n\nRoom Types:\n${JSON.stringify(types, null, 2)}`;
      }

      const model = 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
      const body = {
        contents: [
          {
            parts: [
              {
                text: `You are a Hotel Booking assistant. You can only answer questions about Hotel Booking API data.\n\n${apiData}\n\nUser question: ${prompt}\n\nIf the question is not related to hotels, rooms, cities or booking, respond: "I can only answer Hotel Booking questions."`
              }
            ]
          }
        ]
      };

      const response = await firstValueFrom(
        this.http.post<any>(url, body, {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        })
      );

      const botReply = response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer returned.';
      this.messages.push({ type: 'bot', text: botReply });
    } catch (error: any) {
      console.error(error);
      this.messages.push({ type: 'error', text: `Error sending message: ${error?.message || 'Unknown error'}` });
    } finally {
      this.isTyping = false;
    }
  }
}
