import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AlgorithmResponse, SortStep, SearchStep, GraphStep, DPStep, NQueensStep,
  GraphData, KnapsackItem, DivideConquerStep,
} from '../models/algorithm.models';

@Injectable({ providedIn: 'root' })
export class AlgorithmService {
  private readonly base = environment.apiUrl + '/algorithms';

  constructor(private http: HttpClient) {}

  runSort(algorithm: string, array: number[]): Observable<AlgorithmResponse<SortStep>> {
    return this.http.post<AlgorithmResponse<SortStep>>(`${this.base}/sort`, { algorithm, array });
  }

  runSearch(algorithm: string, array: number[], target: number): Observable<AlgorithmResponse<SearchStep>> {
    return this.http.post<AlgorithmResponse<SearchStep>>(`${this.base}/search`, { algorithm, array, target });
  }

  runGraph(algorithm: string, graph: GraphData, startId: string, endId: string): Observable<AlgorithmResponse<GraphStep>> {
    return this.http.post<AlgorithmResponse<GraphStep>>(`${this.base}/graph`, { algorithm, graph, startId, endId });
  }

  runDP(algorithm: string, items: KnapsackItem[], capacity: number): Observable<AlgorithmResponse<DPStep>> {
    return this.http.post<AlgorithmResponse<DPStep>>(`${this.base}/dp`, { algorithm, items, capacity });
  }

  runBacktracking(algorithm: string, n: number): Observable<AlgorithmResponse<NQueensStep>> {
    return this.http.post<AlgorithmResponse<NQueensStep>>(`${this.base}/backtracking`, { algorithm, n });
  }

  runDivideConquer(algorithm: string, x: string, y: string): Observable<AlgorithmResponse<DivideConquerStep>> {
    return this.http.post<AlgorithmResponse<DivideConquerStep>>(`${this.base}/divide-conquer`, { algorithm, x, y });
  }

}
