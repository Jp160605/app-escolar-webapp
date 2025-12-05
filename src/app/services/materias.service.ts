import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Importación necesaria para procesar datos
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaMateria() {
    return {
      'nrc': '',
      'nombre': '',
      'seccion': '',
      'dias': [],
      'hora_inicio': '',
      'hora_fin': '',
      'salon': '',
      'programa': '',
      'profesor': '',
      'creditos': ''
    }
  }

  // Validación para el formulario de materias
  public validarMateria(data: any, editar: boolean) {
    console.log("Validando materia", data);
    let error: any = {};

    if (!this.validatorService.required(data["nrc"])) {
      error["nrc"] = this.errorService.required;
    } else if (!this.validatorService.numeric(data["nrc"])) {
      error["nrc"] = "El NRC debe ser numérico";
    }

    if (!this.validatorService.required(data["nombre"])) {
      error["nombre"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["seccion"])) {
      error["seccion"] = this.errorService.required;
    }

    if (data["dias"].length === 0) {
      error["dias"] = "Debes seleccionar al menos un día";
    }

    if (!this.validatorService.required(data["hora_inicio"])) {
      error["hora_inicio"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["hora_fin"])) {
      error["hora_fin"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["salon"])) {
      error["salon"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["programa"])) {
      error["programa"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["profesor"])) {
      error["profesor"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["creditos"])) {
      error["creditos"] = this.errorService.required;
    } else if (!this.validatorService.numeric(data["creditos"])) {
      error["creditos"] = "Solo números";
    }

    return error;
  }

  public registrarMateria(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  public obtenerListaMaterias(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/lista-materias/`, { headers });
  }

  public obtenerMateriaPorID(idMateria: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
  }

  public actualizarMateria(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.put<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  public eliminarMateria(idMateria: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
  }

  // --- FUNCIÓN CORREGIDA ---
  // Ahora obtiene la lista completa y calcula los días localmente para asegurar datos
  public getMateriasPorDia(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    // Usamos 'lista-materias' que sabemos que existe y procesamos la respuesta
    return this.http.get<any[]>(`${environment.url_api}/lista-materias/`, { headers }).pipe(
      map((materias: any[]) => {
        // Inicializamos contador en 0
        const conteo: any = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0 };

        materias.forEach(materia => {
          // Asumiendo que materia.dias es un array como ["Lunes", "Martes"]
          if (materia.dias && Array.isArray(materia.dias)) {
            materia.dias.forEach((dia: string) => {
              // Normalizamos a las llaves que usa la gráfica (Inglés)
              if (dia === 'Lunes') conteo['Mon']++;
              if (dia === 'Martes') conteo['Tue']++;
              if (dia === 'Miércoles') conteo['Wed']++;
              if (dia === 'Jueves') conteo['Thu']++;
              if (dia === 'Viernes') conteo['Fri']++;
            });
          }
        });
        return conteo;
      })
    );
  }
}
