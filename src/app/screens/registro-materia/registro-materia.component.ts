import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MateriasService } from 'src/app/services/materias.service';

// Note: this screen now fetches the materia by id and passes it to the partial

@Component({
  selector: 'app-registro-materia-screen',
  templateUrl: './registro-materia.component.html',
  styleUrls: ['./registro-materia.component.scss']
})
export class RegistroMateriaScreenComponent implements OnInit {

  public editar: boolean = false;
  public idMateria: number | null = null;
  public materiaData: any = null;

  constructor(
    private location: Location,
    private activatedRoute: ActivatedRoute
    , private materiasService: MateriasService
  ) {}

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idMateria = Number(this.activatedRoute.snapshot.params['id']);
      // Obtener la materia desde el servicio y pasarla al partial
      this.materiasService.obtenerMateriaPorID(this.idMateria).subscribe(
        (resp) => {
          this.materiaData = resp;
        },
        (err) => {
          console.error('Error al obtener materia por id', err);
          this.materiaData = null;
        }
      );
    }
  }

  public goBack() {
    this.location.back();
  }

}
