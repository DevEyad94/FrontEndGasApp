import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ZskService } from '../../shared/services/zsk.service';
import { MaintenanceType } from '../../models/maintenance-type.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from '../../shared/services/dashboard.service';
import { DashboardFilter, DashboardResponse } from '../../models/dashboard.model';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { TextInputComponent } from '../../shared/components/text-input/text-input.component';
import { ZskSelectComponent } from '../../shared/components/zsk/zsk-select.component';
import { GasField } from '../../models/gas-field.model';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxEchartsModule,
    TextInputComponent,
    ZskSelectComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  filterForm!: FormGroup;
  maintenanceTypes: MaintenanceType[] = [];
  maintenanceTypeOptions: { value: any, label: string }[] = [];
  fields: GasField[] = [];
  fieldOptions: { value: any, label: string }[] = [];
  yearOptions: { value: any, label: string }[] = [];

  // Dashboard data
  dashboardData?: DashboardResponse;

  // ECharts options
  productionChartOption: EChartsOption = {};
  maintenanceCostChartOption: EChartsOption = {};

  // Stats
  totalProductionRate: number = 0;
  totalMaintenanceCost: number = 0;
  fieldCount: number = 0;

  // Export options
  showExportModal = false;
  exportFormat: 'pdf' | 'excel' = 'pdf';
  isExporting = false;

  constructor(
    private dashboardService: DashboardService,
    private zskService: ZskService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Initialize form first
    this.initFilterForm();

    // Load maintenance types for filter options
    this.loadFilterOptions();

    // Load initial dashboard data
    setTimeout(() => {
      this.loadDashboardData();
    });
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      minProductionRate: [null],
      maxProductionRate: [null],
      extractionYear: [null],
      fromYear: [null],
      toYear: [null],
      maintenanceTypeId: [null],
      minCost: [null],
      maxCost: [null],
      fieldId: [null]
    });

    // Subscribe to form changes to reload data when filters change
    this.filterForm.valueChanges.subscribe(() => {
      this.loadDashboardData();
    });
  }

  loadFilterOptions(): void {
    forkJoin({
      maintenanceTypes: this.zskService.getMaintenanceTypes(),
      fields: this.zskService.getFields(),
      years: this.dashboardService.getYears()
    }).subscribe(result => {
      // Process maintenance types
      this.maintenanceTypes = result.maintenanceTypes;
      this.maintenanceTypeOptions = this.maintenanceTypes.map(type => ({
        value: type.zMaintenanceTypeId,
        label: type.name
      }));

      // Process fields
      this.fields = result.fields;
      this.fieldOptions = this.fields.map(field => ({
        value: field.zFieldId,
        label: field.name
      }));

      // Process years
      this.yearOptions = result.years.map(year => ({
        value: year,
        label: year.toString()
      }));
    });
  }

  loadDashboardData(): void {
    // Make sure to have a filter object even if form is not initialized
    const filter: DashboardFilter = this.filterForm?.value || {};

    // Make API call
    this.dashboardService.getDashboardData(filter).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.updateStats();
        this.renderCharts();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  updateStats(): void {
    if (this.dashboardData) {
      this.totalProductionRate = this.dashboardData.totalProductionRate;
      this.totalMaintenanceCost = this.dashboardData.totalMaintenanceCost;
      this.fieldCount = this.dashboardData.fieldData?.length || 0;
    }
  }

  renderCharts(): void {
    this.renderProductionChart();
    this.renderMaintenanceCostChart();
  }

  renderProductionChart(): void {
    if (!this.dashboardData?.productionRateChart) return;

    const data = this.dashboardData.productionRateChart;

    this.productionChartOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.period),
        axisLabel: {
          rotate: 45,
          color: '#333'
        },
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Production Rate',
        nameTextStyle: {
          color: '#333'
        },
        axisLabel: {
          color: '#333'
        },
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#eee'
          }
        }
      },
      series: [
        {
          name: 'Production Rate',
          type: 'bar',
          data: data.map(item => item.productionRate),
          itemStyle: {
            color: '#3AA1FF'
          }
        }
      ]
    };
  }

  renderMaintenanceCostChart(): void {
    if (!this.dashboardData?.maintenanceCostChart) return;

    const data = this.dashboardData.maintenanceCostChart;

    this.maintenanceCostChartOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        formatter: '{a} <br/>{b}: ${c}'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.period),
        axisLabel: {
          rotate: 45,
          color: '#333'
        },
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Maintenance Cost ($)',
        nameTextStyle: {
          color: '#333'
        },
        axisLabel: {
          color: '#333'
        },
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#eee'
          }
        }
      },
      series: [
        {
          name: 'Maintenance Cost',
          type: 'line',
          data: data.map(item => item.cost),
          itemStyle: {
            color: '#FF5722'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(255, 87, 34, 0.7)'
                },
                {
                  offset: 1,
                  color: 'rgba(255, 87, 34, 0.1)'
                }
              ]
            }
          }
        }
      ]
    };
  }

  // Show export modal
  openExportModal(): void {
    this.showExportModal = true;
  }

  // Close export modal
  closeExportModal(): void {
    this.showExportModal = false;
  }

  // Set export format
  setExportFormat(format: 'pdf' | 'excel'): void {
    this.exportFormat = format;
  }

  // Export dashboard data
  exportDashboard(): void {
    this.isExporting = true;
    const filter: DashboardFilter = this.filterForm?.value || {};

    this.dashboardService.exportDashboardData(filter, this.exportFormat).subscribe({
      next: (blob) => {
        const fileName = `dashboard-export-${new Date().toISOString().split('T')[0]}.${this.exportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
        saveAs(blob, fileName);
        this.isExporting = false;
        this.closeExportModal();
      },
      error: (error) => {
        console.error('Error exporting dashboard data:', error);
        this.isExporting = false;
      }
    });
  }
}
