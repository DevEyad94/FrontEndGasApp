import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import { GasService } from '../../shared/services/gas.service';
import { ZskService } from '../../shared/services/zsk.service';
import { GasField } from '../../models/gas-field.model';
import { MaintenanceType } from '../../models/maintenance-type.model';
import { ProductionRecord } from '../../models/production-record.model';
import { FieldMaintenance } from '../../models/field-maintenance.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  filterForm!: FormGroup;
  fields: GasField[] = [];
  maintenanceTypes: MaintenanceType[] = [];
  productionChart: any;
  maintenanceCostChart: any;
  fieldDistributionChart: any;

  totalProductionRate: number = 0;
  totalMaintenanceCost: number = 0;
  fieldCount: number = 0;

  // Dashboard data
  productionRecords: ProductionRecord[] = [];
  maintenanceRecords: FieldMaintenance[] = [];

  constructor(
    private gasService: GasService,
    private lookupService: ZskService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.loadFilterOptions();
    this.loadDashboardData();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      productionRate: [null],
      year: [new Date().getFullYear()],
      maintenanceType: [null],
      cost: [null]
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.loadDashboardData();
    });
  }

  loadFilterOptions(): void {
    forkJoin({
      fields: this.lookupService.getFields(),
      maintenanceTypes: this.lookupService.getMaintenanceTypes()
    }).subscribe(result => {
      this.fields = result.fields;
      this.maintenanceTypes = result.maintenanceTypes;
      this.fieldCount = this.fields.length;
    });
  }

  loadDashboardData(): void {
    const filters = this.filterForm.value;
    const productionFilter = {
      year: filters.year,
      minProductionRate: filters.productionRate ? filters.productionRate : undefined
    };

    const maintenanceFilter = {
      zMaintenanceTypeId: filters.maintenanceType,
      minCost: filters.cost
    };

    forkJoin({
      production: this.gasService.getProductionRecordsWithFilter(productionFilter, 1, 100),
      maintenance: this.gasService.getFieldMaintenancesWithFilter(maintenanceFilter, 1, 100)
    }).subscribe(result => {
      // this.productionRecords = result.production.data.result;
      // this.maintenanceRecords = result.maintenance.data.result;

      this.calculateTotals();
      this.renderCharts();
    });
  }

  calculateTotals(): void {
    this.totalProductionRate = this.productionRecords.reduce((sum, record) =>
      sum + record.productionRate, 0);

    this.totalMaintenanceCost = this.maintenanceRecords.reduce((sum, record) =>
      sum + record.cost, 0);
  }

  renderCharts(): void {
    this.renderProductionChart();
    this.renderMaintenanceCostChart();
    this.renderFieldDistributionChart();
  }

  renderProductionChart(): void {
    const ctx = document.getElementById('productionChart') as HTMLCanvasElement;

    if (this.productionChart) {
      this.productionChart.destroy();
    }

    // Group by field and sum production rates
    const fieldProductionData: {[key: string]: number} = {};
    this.productionRecords.forEach(record => {
      if (!fieldProductionData[record.fieldName]) {
        fieldProductionData[record.fieldName] = 0;
      }
      fieldProductionData[record.fieldName] += record.productionRate;
    });

    const labels = Object.keys(fieldProductionData);
    const data = Object.values(fieldProductionData);

    this.productionChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Production Rate by Field',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Production Rate'
            }
          }
        }
      }
    });
  }

  renderMaintenanceCostChart(): void {
    const ctx = document.getElementById('maintenanceCostChart') as HTMLCanvasElement;

    if (this.maintenanceCostChart) {
      this.maintenanceCostChart.destroy();
    }

    // Group by maintenance type and sum costs
    const maintenanceCostData: {[key: string]: number} = {};
    this.maintenanceRecords.forEach(record => {
      if (!maintenanceCostData[record.maintenanceTypeName]) {
        maintenanceCostData[record.maintenanceTypeName] = 0;
      }
      maintenanceCostData[record.maintenanceTypeName] += record.cost;
    });

    const labels = Object.keys(maintenanceCostData);
    const data = Object.values(maintenanceCostData);

    this.maintenanceCostChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Maintenance Cost by Type',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  }

  renderFieldDistributionChart(): void {
    const ctx = document.getElementById('fieldDistributionChart') as HTMLCanvasElement;

    if (this.fieldDistributionChart) {
      this.fieldDistributionChart.destroy();
    }

    // Count maintenance records by field
    const fieldDistributionData: {[key: string]: number} = {};
    this.fields.forEach(field => {
      fieldDistributionData[field.name] = 0;
    });

    this.maintenanceRecords.forEach(record => {
      if (fieldDistributionData[record.fieldName] !== undefined) {
        fieldDistributionData[record.fieldName]++;
      }
    });

    const labels = Object.keys(fieldDistributionData);
    const data = Object.values(fieldDistributionData);

    this.fieldDistributionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Maintenance Records by Field',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  }
}
