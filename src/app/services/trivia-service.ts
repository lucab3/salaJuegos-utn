import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface PreguntaCruda {
  category: string;
  type: 'multiple' | 'boolean';
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface RespuestaApi {
  response_code: number;
  results: PreguntaCruda[];
}

export interface Pregunta {
  enunciado: string;
  categoria: string;
  dificultad: string;
  opciones: string[];
  correcta: string;
}

function decodeHtml(s: string): string {
  const txt = typeof document !== 'undefined' ? document.createElement('textarea') : null;
  if (txt) {
    txt.innerHTML = s;
    return txt.value;
  }
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&aacute;/g, 'á')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ');
}

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

@Injectable({ providedIn: 'root' })
export class TriviaService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'https://opentdb.com/api.php';

  async obtenerPreguntas(cantidad = 10): Promise<Pregunta[]> {
    const url = `${this.endpoint}?amount=${cantidad}&type=multiple`;
    const resp = await firstValueFrom(this.http.get<RespuestaApi>(url));

    if (!resp || resp.response_code !== 0 || !Array.isArray(resp.results)) {
      throw new Error('La API de trivia no devolvio preguntas. Probá de nuevo en unos segundos.');
    }

    return resp.results.map(p => {
      const correcta = decodeHtml(p.correct_answer);
      const incorrectas = p.incorrect_answers.map(decodeHtml);
      const opciones = mezclar([correcta, ...incorrectas]);
      return {
        enunciado: decodeHtml(p.question),
        categoria: decodeHtml(p.category),
        dificultad: p.difficulty,
        opciones,
        correcta
      };
    });
  }
}
