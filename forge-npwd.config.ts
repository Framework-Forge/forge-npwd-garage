import App from './src/App';
import { GarageIcon, NotificationIcon } from './icon';
import { GarageWidget } from './src/widgets/GarageWidget';

export const path = '/forge-npwd-garage';

export default () => ({
  id: 'forge-npwd-garage',
  nameLocale: 'Forge Garage',
  color: '#ffffff',
  backgroundColor: '#171717',
  path,
  icon: GarageIcon,
  app: App,
  notificationIcon: NotificationIcon,
  homeWidgets: [{
    id: 'fleet',
    name: 'Minha garagem',
    description: 'Frota, localização, apreensões e multas pendentes.',
    sizes: [
      { width: 2, height: 1, label: 'Compacto 2×1' },
      { width: 4, height: 1, label: 'Resumo 4×1' },
      { width: 4, height: 2, label: 'Completo 4×2' },
    ],
    Component: GarageWidget,
    path,
  }],
});
