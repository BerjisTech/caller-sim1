import { Routes } from '@angular/router';
import { RoomCreatorComponent } from './components/shared/room-creator/room-creator.component';
import { RoomComponent } from './pages/room/room.component';

export const routes: Routes = [
    {
      path: '',
      component: RoomCreatorComponent,
    },
    {
      path: 'lobby',
      component: RoomCreatorComponent,
    },
    {
      path: 'lobby/:name',
      component: RoomComponent,
    },
];
