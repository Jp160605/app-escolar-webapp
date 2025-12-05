import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MateriasService } from 'src/app/services/materias.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit {

  public total_user: any = {};

  // Histograma (Materias) - AHORA SOLO LUNES A VIERNES
  lineChartData = {
    // Etiquetas visuales para la gráfica
    labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    datasets: [
      {
        data: [0, 0, 0, 0, 0], // Inicializado en 0 para los 5 días
        label: 'Registro de materias',
        backgroundColor: '#F88406'
      }
    ]
  };
  lineChartOption = {
    responsive: false
  };
  lineChartPlugins = [DatalabelsPlugin];

  // Barras (Eventos) - SE QUEDA ESTÁTICO (Como pediste)
  barChartData = {
    labels: ["Congreso", "FePro", "Presentación Doctoral", "Feria Matemáticas", "T-System"],
    datasets: [
      {
        data: [22, 10, 26, 32, 44],
        label: 'Eventos Académicos',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB',
          '#FB82F5',
          '#2AD84A'
        ]
      }
    ]
  };
  barChartOption = {
    responsive: false
  };
  barChartPlugins = [DatalabelsPlugin];

  // Circular (Usuarios) - SE QUEDA DINÁMICO
  pieChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#4463ffff',
          '#422fd4ff',
          '#31b0e7ff'
        ]
      }
    ]
  };
  pieChartOption = {
    responsive: false
  };
  pieChartPlugins = [DatalabelsPlugin];

  // Doughnut (Usuarios) - SE QUEDA DINÁMICO
  doughnutChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#06b4f8ff',
          '#446dffff',
          '#31E7E7'
        ]
      }
    ]
  };
  doughnutChartOption = {
    responsive: false
  };
  doughnutChartPlugins = [DatalabelsPlugin];

  constructor(
    private administradoresServices: AdministradoresService,
    private materiasService: MateriasService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
    this.obtenerTotalMateriasDia();
  }

  // Función para obtener el total de usuarios registrados
  public obtenerTotalUsers() {
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response) => {
        this.total_user = response;
        console.log("Total usuarios: ", this.total_user);
        this.actualizarGraficas();
      }, (error) => {
        console.log("Error al obtener total de usuarios ", error);
        alert("No se pudo obtener el total de cada rol de usuarios");
      }
    );
  }

  // Función dinámica para obtener materias (FILTRADO LUN-VIE)
  public obtenerTotalMateriasDia() {
    this.materiasService.getMateriasPorDia().subscribe(
      (response) => {
        // Usamos las claves en inglés que suelen venir del backend/Date pipe,
        // pero solo mapeamos Lunes a Viernes.
        const diasOrdenados = ["Mon", "Tue", "Wed", "Thu", "Fri"];

        // Mapeamos la respuesta a nuestro arreglo de valores
        const valores = diasOrdenados.map(dia => response[dia] || 0);

        // Actualizamos la gráfica
        this.lineChartData = {
          ...this.lineChartData,
          datasets: [{
            ...this.lineChartData.datasets[0],
            data: valores
          }]
        };
      },
      (error) => {
        console.log("Error al obtener materias por día", error);
      }
    );
  }

  private actualizarGraficas() {
    const totalAdministradores = this.total_user.admins || this.total_user.total_administradores || this.total_user.admin || 0;
    const totalMaestros = this.total_user.maestros || this.total_user.total_maestros || 0;
    const totalAlumnos = this.total_user.alumnos || this.total_user.total_alumnos || 0;

    this.pieChartData = {
      ...this.pieChartData,
      datasets: [
        {
          ...this.pieChartData.datasets[0],
          data: [totalAdministradores, totalMaestros, totalAlumnos]
        }
      ]
    };

    this.doughnutChartData = {
      ...this.doughnutChartData,
      datasets: [
        {
          ...this.doughnutChartData.datasets[0],
          data: [totalAdministradores, totalMaestros, totalAlumnos]
        }
      ]
    };

    console.log("Gráfica actualizada con datos:", {
      administradores: totalAdministradores,
      maestros: totalMaestros,
      alumnos: totalAlumnos
    });
  }
}
