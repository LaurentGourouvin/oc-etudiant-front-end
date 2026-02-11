import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MaterialModule } from "../../shared/material.module";

@Component({
  selector: "app-dashboard",
  imports: [CommonModule, MaterialModule],
  standalone: true,
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  ngOnInit(): void {}
}
