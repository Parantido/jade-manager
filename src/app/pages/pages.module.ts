import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { ThemeModule } from '../@theme/theme.module';
import { SettingComponent } from './setting/setting.component';
import { UserComponent } from './user/user.component';
import { TrunkComponent } from './trunk/trunk.component';
import { SdpComponent } from './sdp/sdp.component';

import { Ng2SmartTableModule } from 'ng2-smart-table';


const PAGES_COMPONENTS = [
  PagesComponent,
];

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    Ng2SmartTableModule,
  ],
  declarations: [
    ...PAGES_COMPONENTS,
    UserComponent,
    TrunkComponent,
    SdpComponent,
    SettingComponent,
  ],
  providers: [
  ],
})
export class PagesModule {
}
