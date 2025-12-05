import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { FacadeService } from 'src/app/services/facade.service';
import { MateriasService } from 'src/app/services/materias.service';

@Component({
  selector: 'app-materias-screen',
  templateUrl: './materias-screen.component.html',
  styleUrls: ['./materias-screen.component.scss']
})
export class MateriasScreenComponent implements AfterViewInit, OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_materias: any[] = [];

  // Para la tabla
  displayedColumns: string[] = ['nrc', 'nombre', 'seccion', 'profesor', 'salon', 'dias', 'hora_inicio', 'hora_fin', 'creditos', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosMateria>(this.lista_materias as DatosMateria[]);

  constructor(
    public facadeService: FacadeService,
    public materiasService: MateriasService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  @ViewChild(MatPaginator)
  set matPaginator(p: MatPaginator) {
    this.dataSource.paginator = p;
  }
  @ViewChild(MatSort)
  set matSort(s: MatSort) {
    this.dataSource.sort = s;
  }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    // Validar que haya inicio de sesión
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if (this.token == "") {
      this.router.navigate(["/"]);
    }
    // Obtener materias
    this.obtenerMaterias();
  }

  ngAfterViewInit() {
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Obtener lista de materias
  public obtenerMaterias() {
    this.materiasService.obtenerListaMaterias().subscribe(
      (response) => {
        this.lista_materias = response;
        console.log("Lista materias: ", this.lista_materias);
        if (this.lista_materias.length > 0) {
          // Convertir dias array a string si es necesario
          this.lista_materias.forEach(materia => {
            if (Array.isArray(materia.dias)) {
              materia.dias_str = materia.dias.join(', ');
            } else {
              materia.dias_str = materia.dias || '';
            }
          });
          console.log("Materias: ", this.lista_materias);
          this.dataSource = new MatTableDataSource<DatosMateria>(this.lista_materias as DatosMateria[]);
        }
      },
      (error) => {
        console.error("Error al obtener la lista de materias: ", error);
        alert("No se pudo obtener la lista de materias");
      }
    );
  }

  public goEditar(idMateria: number) {
    console.log('Editar solicitado. Token actual:', this.facadeService.getSessionToken());
    // Navegación absoluta para evitar rutas relativas inesperadas
    this.router.navigate(['/materias/registrar', idMateria]);
  }

  public delete(idMateria: number) {
    console.log('Eliminar solicitado. Token actual:', this.facadeService.getSessionToken());
    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: idMateria, rol: 'materia' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.isDelete) {
        console.log("Materia eliminada");
        alert("Materia eliminada correctamente.");
        // Recargar página
        window.location.reload();
      } else {
        alert("Materia no se ha podido eliminar.");
        console.log("No se eliminó la materia");
      }
    });
  }
}

// Interface para datos de materia
export interface DatosMateria {
  id: number;
  nrc: string;
  nombre: string;
  seccion: string;
  dias: string[];
  dias_str: string;
  hora_inicio: string;
  hora_fin: string;
  salon: string;
  programa: string;
  profesor: string;
  creditos: string;
}
