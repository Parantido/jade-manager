import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { SettingComponent } from './setting/setting.component';
import { UserComponent } from './user/user.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'user',
      component: UserComponent,
    },
    {
      path: 'setting',
      component: SettingComponent,
    },
    {
      path: '',
      redirectTo: 'user',
      pathMatch: 'full',
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
