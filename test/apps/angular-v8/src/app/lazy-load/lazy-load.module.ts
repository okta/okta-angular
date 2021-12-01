import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LazyLoadComponent } from './lazy-load.component';

const routes: Routes = [
  {
    path: '',
    component: LazyLoadComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    LazyLoadComponent
  ]
})
export class LazyLoadModule { }
