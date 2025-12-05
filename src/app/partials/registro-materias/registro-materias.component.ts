import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';
import { FacadeService } from 'src/app/services/facade.service';
import { Router } from '@angular/router';
import { MateriasService } from 'src/app/services/materias.service';

@Component({
  selector: 'app-registro-materia',
  templateUrl: './registro-materias.component.html',
  styleUrls: ['./registro-materias.component.scss']
})
export class RegistroMateriaComponent implements OnInit {
  @Input() datos_materia: any = {};
  @Input() editar: boolean = false;

  public materia: any = {};
  public errors: any = {};
  public lista_maestros: any[] = [];
  public token: string = "";

  // ==========================================
  // Propiedades para el TimePicker (Español)
  // ==========================================
  public timePickerTheme = {
    container: {
      bodyBackgroundColor: '#fff',
      buttonColor: '#0092B8'
    },
    dial: {
      dialBackgroundColor: '#0092B8',
    },
    clockFace: {
      clockFaceBackgroundColor: '#f0f0f0',
      clockHandColor: '#0092B8',
      clockFaceTimeInactiveColor: '#6c757d'
    }
  };

  public labelCancelar: string = "Cancelar";
  public labelAceptar: string = "Aceptar";

  public programas: any[] = [
    { value: 'Ingeniería en Ciencias de la Computación', viewValue: 'Ingeniería en Ciencias de la Computación' },
    { value: 'Licenciatura en Ciencias de la Computación', viewValue: 'Licenciatura en Ciencias de la Computación' },
    { value: 'Ingeniería en Tecnologías de la Información', viewValue: 'Ingeniería en Tecnologías de la Información' }
  ];

  public dias_semana: any[] = [
    { value: 'Lunes', nombre: 'Lunes' },
    { value: 'Martes', nombre: 'Martes' },
    { value: 'Miércoles', nombre: 'Miércoles' },
    { value: 'Jueves', nombre: 'Jueves' },
    { value: 'Viernes', nombre: 'Viernes' }

  ];

  constructor(
    private location: Location,
    private maestrosService: MaestrosService,
    private facadeService: FacadeService,
    private router: Router,
    private materiasService: MateriasService
  ) {}

  ngOnInit(): void {
    this.token = this.facadeService.getSessionToken();
    this.obtenerMaestros();

    if (this.editar && this.datos_materia) {
      // Normalizar datos recibidos del API para que el partial use siempre los mismos campos
      this.materia = { ...this.datos_materia };

      // API devuelve 'dias' (JSONField). El formulario usa 'dias_json'. Normalizamos ambos.
      if (this.materia.dias && !this.materia.dias_json) {
        if (typeof this.materia.dias === 'string') {
          try {
            this.materia.dias_json = JSON.parse(this.materia.dias);
          } catch (e) {
            this.materia.dias_json = [];
          }
        } else if (Array.isArray(this.materia.dias)) {
          this.materia.dias_json = [...this.materia.dias];
        } else {
          this.materia.dias_json = [];
        }
      } else if (typeof this.materia.dias_json === 'string') {
        try { this.materia.dias_json = JSON.parse(this.materia.dias_json); } catch (e) { this.materia.dias_json = []; }
      }

      // API usa 'programa', el formulario espera 'programa_educativo'
      if (this.materia.programa && !this.materia.programa_educativo) {
        this.materia.programa_educativo = this.materia.programa;
      }

      // API devuelve 'maestro' (id); el formulario usa 'profesor'
      if ((this.materia.maestro || this.materia.maestro === 0) && !this.materia.profesor) {
        this.materia.profesor = this.materia.maestro;
      }
    } else {
      const horaActualMX = this.obtenerHoraActualMexico();
      this.materia = {
        nrc: '',
        nombre: '',
        seccion: '',
        dias_json: [],
        hora_inicio: horaActualMX,
        hora_fin: '',
        salon: '',
        programa_educativo: '',
        profesor: '',
        creditos: ''
      };
    }
  }

  public obtenerHoraActualMexico(): string {
    const ahora = new Date();
    const opciones: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Mexico_City',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return new Intl.DateTimeFormat('es-MX', opciones).format(ahora);
  }

  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response.map((m: any) => ({
          id: m.id,
          nombreCompleto: `${m.user.first_name} ${m.user.last_name}`,
          id_trabajador: m.id_trabajador
        }));
      },
      (error) => console.error("Error al obtener maestros", error)
    );
  }

  public checkboxChange(event: any) {
    if (event.checked) {
      this.materia.dias_json.push(event.source.value);
    } else {
      const index = this.materia.dias_json.indexOf(event.source.value);
      if (index > -1) {
        this.materia.dias_json.splice(index, 1);
      }
    }
  }

  public revisarSeleccion(dia: string): boolean {
    return this.materia.dias_json ? this.materia.dias_json.includes(dia) : false;
  }

  public regresar() {
    this.location.back();
  }

  public validarFormulario(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.materia.nrc) {
      this.errors.nrc = "El NRC es obligatorio.";
      isValid = false;
    } else if (!/^\d{5}$/.test(this.materia.nrc.toString())) {
      this.errors.nrc = "El NRC debe ser numérico de 5 dígitos.";
      isValid = false;
    }

    if (!this.materia.nombre) {
      this.errors.nombre = "El nombre es obligatorio.";
      isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.materia.nombre)) {
      this.errors.nombre = "Solo se permiten letras y espacios.";
      isValid = false;
    }

    if (!this.materia.seccion) {
      this.errors.seccion = "La sección es obligatoria.";
      isValid = false;
    } else if (!/^\d{1,3}$/.test(this.materia.seccion.toString())) {
      this.errors.seccion = "Máximo 3 dígitos numéricos.";
      isValid = false;
    }

    if (!this.materia.dias_json || this.materia.dias_json.length === 0) {
      this.errors.dias_json = "Debes seleccionar al menos un día.";
      isValid = false;
    }

    if (!this.materia.hora_inicio || !this.materia.hora_fin) {
      this.errors.horario = "Ambas horas son obligatorias.";
      isValid = false;
    } else {
      if (this.materia.hora_inicio >= this.materia.hora_fin) {
        this.errors.horario = "La hora de inicio debe ser menor a la hora de fin.";
        isValid = false;
      }
    }

    if (!this.materia.salon) {
      this.errors.salon = "El salón es obligatorio.";
      isValid = false;
    } else if (this.materia.salon.length > 15) {
      this.errors.salon = "Máximo 15 caracteres.";
      isValid = false;
    }

    if (!this.materia.programa_educativo) {
      this.errors.programa_educativo = "Selecciona un programa educativo.";
      isValid = false;
    }
    if (!this.materia.profesor) {
      this.errors.profesor = "Selecciona un profesor asignado.";
      isValid = false;
    }

    if (!this.materia.creditos) {
      this.errors.creditos = "Créditos obligatorios.";
      isValid = false;
    } else if (!/^\d{1,2}$/.test(this.materia.creditos.toString())) {
      this.errors.creditos = "Máximo 2 dígitos positivos.";
      isValid = false;
    }

    return isValid;
  }

  public registrar() {
    if (!this.validarFormulario()) return;
    console.log("Registrando materia:", this.materia);
    const payload: any = {
      nrc: this.materia.nrc,
      nombre: this.materia.nombre,
      seccion: this.materia.seccion,
      dias: Array.isArray(this.materia.dias_json) ? this.materia.dias_json : [],
      hora_inicio: this.materia.hora_inicio,
      hora_fin: this.materia.hora_fin,
      salon: this.materia.salon,
      programa: this.materia.programa_educativo || this.materia.programa,
      creditos: this.materia.creditos,
      maestro: this.materia.profesor
    };

    this.materiasService.registrarMateria(payload).subscribe(
      (res) => {
        console.log('Materia registrada. Respuesta:', res);
        alert('Materia registrada correctamente.');
        this.router.navigate(['/maestros']);
      },
      (err) => {
        console.error('Error al registrar materia', err);
        const msg = err?.error?.message || 'Error al registrar materia';
        alert(msg);
      }
    );
  }

  public actualizar() {
    if (!this.validarFormulario()) return;
    console.log("Actualizando materia:", this.materia);
    const payload: any = {
      id: this.materia.id,
      nrc: this.materia.nrc,
      nombre: this.materia.nombre,
      seccion: this.materia.seccion,
      dias: Array.isArray(this.materia.dias_json) ? this.materia.dias_json : [],
      hora_inicio: this.materia.hora_inicio,
      hora_fin: this.materia.hora_fin,
      salon: this.materia.salon,
      programa: this.materia.programa_educativo || this.materia.programa,
      creditos: this.materia.creditos,
      maestro: this.materia.profesor
    };

    this.materiasService.actualizarMateria(payload).subscribe(
      (res) => {
        console.log('Materia actualizada. Respuesta:', res);
        alert('Materia actualizada correctamente.');
        // Después de actualizar, volver a la lista de materias
        this.router.navigate(['/materias']);
      },
      (err) => {
        console.error('Error al actualizar materia', err);
        const msg = err?.error?.message || 'Error al actualizar materia';
        alert(msg);
      }
    );
  }

  public soloNumeros(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      charCode !== 32 &&
      charCode !== 241 && charCode !== 209
    ) {
      event.preventDefault();
    }
  }
}
