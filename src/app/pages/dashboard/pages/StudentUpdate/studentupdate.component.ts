import { Component } from '@angular/core';
import { MaterialModule } from '../../../../shared/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-studentupdate',
  templateUrl: './studentupdate.component.html',
  imports: [CommonModule, MaterialModule],
})
export class StudentUpdateComponent {}
