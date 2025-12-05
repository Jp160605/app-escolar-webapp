import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editar-user-modal',
  templateUrl: './editar-user-modal.component.html',
  styleUrls: ['./editar-user-modal.component.scss']
})
export class EditarUserModalComponent implements OnInit {

  public rol: string = '';
  public userId: number = 0;

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<EditarUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.rol = this.data?.rol || '';
    this.userId = this.data?.id || 0;
  }

  public cerrar_modal() {
    this.dialogRef.close({ edit: false, rol: this.rol });
  }

  public confirmarEditar() {
    // Close modal and return edit: true so parent component navigates
    this.dialogRef.close({ edit: true });
  }

}

