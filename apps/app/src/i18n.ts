import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  lng: 'es',
  fallbackLng: 'es',
  resources: {
    es: {
      translation: {
        // Auth
        'auth.login': 'Iniciar sesión',
        'auth.register': 'Registrarse',
        'auth.logout': 'Cerrar sesión',
        'auth.email': 'Email',
        'auth.password': 'Contraseña',
        'auth.fullName': 'Nombre completo',
        'auth.username': 'Usuario',
        'auth.forgotPassword': '¿Olvidaste tu contraseña?',
        // Nav
        'nav.home': 'Inicio',
        'nav.matches': 'Partidos',
        'nav.reservations': 'Reservas',
        'nav.tournaments': 'Torneos',
        'nav.profile': 'Perfil',
        // Common
        'common.loading': 'Cargando...',
        'common.error': 'Algo salió mal',
        'common.retry': 'Reintentar',
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        'common.confirm': 'Confirmar',
        'common.back': 'Volver',
        // Home
        'home.welcome': 'Bienvenido',
        'home.findMatch': 'Encontrar partido',
        'home.bookCourt': 'Reservar cancha',
        'home.myMatches': 'Mis partidos',
        'home.upcomingReservations': 'Próximas reservas',
        // Matches
        'matches.title': 'Partidos',
        'matches.create': 'Crear partido',
        'matches.join': 'Unirse',
        'matches.status.waiting': 'Esperando jugadores',
        'matches.status.in_progress': 'En curso',
        'matches.status.completed': 'Finalizado',
        'matches.status.cancelled': 'Cancelado',
        // Reservations
        'reservations.title': 'Reservas',
        'reservations.book': 'Reservar',
        'reservations.new': 'Nueva reserva',
        'reservations.upcoming': 'Próximas',
        'reservations.history': 'Historial',
        'reservations.noUpcoming': 'Sin reservas próximas',
        'reservations.noHistory': 'Sin historial de reservas',
        'reservations.cancel': 'Cancelar',
        'reservations.confirm': 'Confirmar reserva',
        'reservations.status.pending': 'Pendiente',
        'reservations.status.confirmed': 'Confirmada',
        'reservations.status.cancelled': 'Cancelada',
        'reservations.status.completed': 'Completada',
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
