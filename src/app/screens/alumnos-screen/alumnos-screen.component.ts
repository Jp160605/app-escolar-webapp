// alumnos-screen.component.ts
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { EditarUserModalComponent } from 'src/app/modals/editar-user-modal/editar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements AfterViewInit, OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];

  // Para la tabla
  displayedColumns: string[] = ['matricula', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'curp', 'ocupacion', 'editar', 'eliminar'];
  // Inicializa el dataSource sin datos, pero con el tipo correcto.
  dataSource = new MatTableDataSource<DatosUsuario>([]);

    constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
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
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    //Obtener alumnos
    this.obtenerAlumnos();
  }

  ngAfterViewInit() {
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  // Consumimos el servicio para obtener los alumnos
  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log("Lista users: ", this.lista_alumnos);
        if (this.lista_alumnos.length > 0) {
          // Agregar datos del nombre e email para que estén disponibles
          // en el nivel superior del objeto, aunque el sortingDataAccessor ya los maneja,
          // es buena práctica para el template.
          this.lista_alumnos.forEach(usuario => {
            usuario.nombre = usuario.user.first_name + " " + usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          console.log("Alumnos: ", this.lista_alumnos);

          this.dataSource = new MatTableDataSource<DatosUsuario>(this.lista_alumnos as DatosUsuario[]);

        }
      }, (error) => {
        console.error("Error al obtener la lista de Alumnos: ", error);
        alert("No se pudo obtener la lista de Alumnos");
      }
    );
  }

  public goEditar(idUser: number) {
    // Open confirmation modal
    const dialogRef = this.dialog.open(EditarUserModalComponent, {
      data: { id: idUser, rol: 'alumno' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.edit) {
        // User confirmed, navigate to edit form
        this.router.navigate(["registro-usuarios/alumnos/" + idUser]);
      } else if (!result?.edit && result?.rol) {
        // User cancelled
        alert(`${result.rol.charAt(0).toUpperCase() + result.rol.slice(1)} no se ha podido editar.`);
        console.log("Edición cancelada");
      }
    });
  }

  public delete(idUser: number) {
      // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar
      const userIdSession = Number(this.facadeService.getUserId());
      // --------- Pero el parametro idUser (el de la función) es el ID del maestro que se quiere eliminar ---------
       // Administrador puede eliminar cualquier maestro
      // Maestro solo puede eliminar su propio registro
      if (this.rol === 'administrador' || (this.rol === 'maestro' && userIdSession === idUser)) {
        //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
        const dialogRef = this.dialog.open(EliminarUserModalComponent,{
          data: {id: idUser, rol: 'alumno'}, //Se pasan valores a través del componente
          height: '288px',
          width: '328px',
        });

      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
          console.log("Alumno eliminado");
          alert("Alumno eliminado correctamente.");
          //Recargar página
          window.location.reload();
        }else{
          alert("Alumno no se ha podido eliminar.");
          console.log("No se eliminó el alumno");
        }
      });
      }else{
        alert("No tienes permisos para eliminar este alumno.");
      }
    }

}

export interface DatosUsuario {
  id: number,
  matricula: string;
  nombre: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  rfc: string,
  curp: string,
  ocupacion: string,
}
