 import { HttpClient } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';
  import { player } from '../../model/player';
  
  @Injectable({
    providedIn: 'root'
  })
  export class PlayerService {
  
  private apiUrl = 'http://localhost:3003/players';
  
    constructor(private http: HttpClient) { }
  
    getAll() : Observable<player[]> {
      return this.http.get<player[]>(`${this.apiUrl}`);
    }
  
    create(item : player){
      return this.http.post(`${this.apiUrl}`,item);
    }
    delete(id: number): Observable<any> {
      
      return this.http.delete(`${this.apiUrl}/${id}`);
    }
  
    getById(id : any){
      return this.http.get<player>(`${this.apiUrl}/${id}`)
    }
  
    update(id:number,item : player){
      return this.http.put<player>(`${this.apiUrl}/${id} `,item);
    }
    
  }
  