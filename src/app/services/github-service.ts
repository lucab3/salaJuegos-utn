import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  company: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class GithubService {
  private readonly http = inject(HttpClient);
  private readonly base = 'https://api.github.com/users';

  getUser(username: string): Observable<GithubUser> {
    return this.http.get<GithubUser>(`${this.base}/${username}`);
  }
}
