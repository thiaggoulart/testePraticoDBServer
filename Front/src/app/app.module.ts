import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { PlantaListarComponent } from './planta-listar/planta-listar.component';
import { RotasModule } from './rotas.module';
import { SensorListarComponent } from './planta-listar/sensor-listar.component';

@NgModule({
  declarations: [
    AppComponent,
    PlantaListarComponent,
    SensorListarComponent
  ],
  imports: [
    MatButtonModule,
    MatToolbarModule,
    BrowserAnimationsModule,
    MatTableModule,
    BrowserModule,
    HttpClientModule,
    RotasModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
