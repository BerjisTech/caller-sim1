import { Routes } from '@angular/router';
import { RoomCreatorComponent } from './components/shared/room-creator/room-creator.component';
import { RoomComponent } from './pages/room/room.component';
import { TermsComponent } from './pages/terms/terms.component';
import { CanvasComponent } from './pages/canvas/canvas.component';
import { MainLayoutComponent } from './components/shared/main-layout/main-layout.component';
import { FaqComponent } from './pages/faq/faq.component';
import { StreamingComponent } from './pages/streaming/streaming.component';
import { DashboardLayoutComponent } from './components/shared/dashboard-layout/dashboard-layout.component';
import { GroundZeroComponent } from './pages/ground-zero/ground-zero.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: RoomCreatorComponent
      },
      {
        path: 'faq',
        component: FaqComponent,
      },
      {
        path: 'stream',
        component: StreamingComponent,
      },
      {
        path: 'lobby',
        component: RoomCreatorComponent,
      },
      {
        path: 'lobby/:name',
        component: RoomComponent,
      },
      {
        path: 'terms',
        component: TermsComponent,
      },
      {
        path: 'terms/:language',
        component: TermsComponent,
      },
      {
        path: 'canvas',
        component: CanvasComponent
      }
    ]
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'g0',
        component: GroundZeroComponent,
      }
    ]
  }
];
