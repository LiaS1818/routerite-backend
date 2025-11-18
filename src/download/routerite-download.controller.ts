import { Controller, Get, Render } from '@nestjs/common';

@Controller('routerite')
export class RouteriteDownloadController {
  @Get('download')
  @Render('routerite-download')
  getDownloadPage() {
    // Estos datos los puedes dinamizar si quieres
    return {
      appName: 'RouteRite',
      shortDescription: 'Crea itinerarios turísticos inteligentes en Guadalajara y alrededores.',
      rating: 4.8,
      reviewsCount: '1,234',
      downloads: '10 k+',
      apkUrl: '/apk/routerite-release.apk', // ruta en /public
      iconUrl: '/images/routerite-icon.png',
      screenshotUrls: [
        '/images/routerite-screen-1.png',
        '/images/routerite-screen-2.png',
        '/images/routerite-screen-3.png',
      ],
      version: '1.0.0',
      updatedAt: 'Noviembre 2025',
      size: '25 MB',
      requiresAndroid: 'Android 8.0 y versiones posteriores',
      developer: 'RouteRite Team',
      developerEmail: 'soporte@routerite.app',
      privacyPolicyUrl: '/privacy-policy', // o lo que ya tengas en tu proyecto
    };
  }
}
