<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white shadow-sm rounded-lg p-8 md:p-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Condiciones del Servicio</h1>
        <p class="text-sm text-gray-500 mb-8">Última actualización: {{ lastUpdated }}</p>

        <div class="prose prose-gray max-w-none">
          <!-- Introducción -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p class="text-gray-700 mb-4">
              Bienvenido a Miniferias Live. Al acceder y utilizar nuestra plataforma, usted acepta estar sujeto a estos
              Términos de Servicio y todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos
              términos, no debe utilizar nuestros servicios.
            </p>
            <p class="text-gray-700">
              Estos términos se aplican a todos los usuarios de la plataforma, incluyendo visitantes, compradores,
              expositores y administradores.
            </p>
          </section>

          <!-- Descripción del servicio -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">2. Descripción del Servicio</h2>
            <p class="text-gray-700 mb-4">
              Miniferias Live es una plataforma de eventos en vivo y comercio electrónico que permite:
            </p>
            <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Ver eventos en vivo y transmisiones de vendedores</li>
              <li>Comprar productos durante eventos en vivo</li>
              <li>Interactuar mediante chat en tiempo real</li>
              <li>Recibir notificaciones sobre eventos de interés</li>
              <li>Gestionar pedidos y compras</li>
            </ul>
            <p class="text-gray-700">
              Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio en cualquier
              momento sin previo aviso.
            </p>
          </section>

          <!-- Registro y cuenta -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">3. Registro y Cuenta de Usuario</h2>

            <h3 class="text-xl font-semibold text-gray-800 mb-3">3.1 Creación de cuenta</h3>
            <p class="text-gray-700 mb-4">
              Para acceder a ciertas funcionalidades, debe crear una cuenta. Puede registrarse mediante:
            </p>
            <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Correo electrónico y contraseña</li>
              <li>Inicio de sesión social (Facebook, Google)</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-800 mb-3">3.2 Responsabilidades del usuario</h3>
            <p class="text-gray-700 mb-4">Al crear una cuenta, usted se compromete a:</p>
            <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Proporcionar información precisa, actual y completa</li>
              <li>Mantener la seguridad de su contraseña</li>
              <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta</li>
              <li>No compartir su cuenta con terceros</li>
              <li>Ser mayor de 18 años</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-800 mb-3">3.3 Suspensión de cuenta</h3>
            <p class="text-gray-700">
              Nos reservamos el derecho de suspender o cancelar su cuenta si detectamos actividad fraudulenta,
              violación de estos términos, o comportamiento que consideremos inapropiado.
            </p>
          </section>

          <!-- Uso aceptable -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">4. Uso Aceptable</h2>
            <p class="text-gray-700 mb-4">Al utilizar Miniferias Live, usted acepta NO:</p>
            <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Usar la plataforma para actividades ilegales o fraudulentas</li>
              <li>Acosar, amenazar o intimidar a otros usuarios</li>
              <li>Publicar contenido ofensivo, difamatorio o inapropiado</li>
              <li>Intentar acceder sin autorización a sistemas o datos</li>
              <li>Interferir con el funcionamiento normal de la plataforma</li>
              <li>Usar bots, scrapers o herramientas automatizadas sin permiso</li>
              <li>Violar derechos de propiedad intelectual</li>
              <li>Hacer spam o publicidad no solicitada</li>
            </ul>
          </section>

          <!-- Compras y transacciones -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">5. Compras y Transacciones</h2>

            <h3 class="text-xl font-semibold text-gray-800 mb-3">5.1 Proceso de compra</h3>
            <p class="text-gray-700 mb-4">
              Al realizar una compra durante un evento en vivo:
            </p>
            <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Los precios mostrados pueden estar sujetos a cambios durante el evento</li>
              <li>La disponibilidad de productos no está garantizada hasta completar la compra</li>
              <li>Usted autoriza el cargo a su método de pago seleccionado</li>
              <li>Recibirá confirmación de su pedido por correo electrónico</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-800 mb-3">5.2 Rol de la plataforma</h3>
            <p class="text-gray-700 mb-4">
              Miniferias Live actúa como intermediario entre compradores y vendedores (expositores). No somos responsables de:
            </p>
            <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>La calidad, seguridad o legalidad de los productos vendidos</li>
              <li>La capacidad del vendedor para completar las ventas</li>
              <li>Disputas entre compradores y vendedores</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-800 mb-3">5.3 Devoluciones y reembolsos</h3>
            <p class="text-gray-700">
              Las políticas de devolución y reembolso son establecidas por cada expositor. Le recomendamos revisar
              estas políticas antes de realizar una compra. Para disputas, debe contactar directamente al vendedor
              o a nuestro equipo de soporte.
            </p>
          </section>

          <!-- Propiedad intelectual -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">6. Propiedad Intelectual</h2>

            <h3 class="text-xl font-semibold text-gray-800 mb-3">6.1 Contenido de Miniferias Live</h3>
            <p class="text-gray-700 mb-4">
              Todo el contenido de la plataforma, incluyendo diseño, logotipos, texto, gráficos, código y software,
              es propiedad de Miniferias Live o sus licenciantes y está protegido por leyes de propiedad intelectual.
            </p>

            <h3 class="text-xl font-semibold text-gray-800 mb-3">6.2 Contenido del usuario</h3>
            <p class="text-gray-700 mb-4">
              Al publicar contenido en la plataforma (mensajes de chat, comentarios, etc.):
            </p>
            <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Conserva la propiedad de su contenido</li>
              <li>Nos otorga una licencia para usar, mostrar y distribuir ese contenido en la plataforma</li>
              <li>Garantiza que tiene los derechos necesarios sobre el contenido</li>
              <li>El contenido no viola derechos de terceros</li>
            </ul>
          </section>

          <!-- Limitación de responsabilidad -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
            <p class="text-gray-700 mb-4">
              En la medida permitida por la ley:
            </p>
            <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Miniferias Live se proporciona "tal cual" sin garantías de ningún tipo</li>
              <li>No garantizamos que el servicio será ininterrumpido o libre de errores</li>
              <li>No somos responsables de daños indirectos, incidentales o consecuentes</li>
              <li>Nuestra responsabilidad total no excederá el monto pagado por usted en los últimos 12 meses</li>
            </ul>
          </section>

          <!-- Indemnización -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">8. Indemnización</h2>
            <p class="text-gray-700">
              Usted acepta indemnizar y eximir de responsabilidad a Miniferias Live, sus directores, empleados y
              afiliados de cualquier reclamo, daño, pérdida o gasto (incluyendo honorarios legales) que surja de:
              (1) su uso de la plataforma, (2) violación de estos términos, o (3) violación de derechos de terceros.
            </p>
          </section>

          <!-- Privacidad -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">9. Privacidad</h2>
            <p class="text-gray-700">
              El uso de nuestros servicios también está sujeto a nuestra
              <router-link to="/privacy-policy" class="text-blue-600 hover:text-blue-800">Política de Privacidad</router-link>,
              que describe cómo recopilamos, usamos y protegemos su información personal.
            </p>
          </section>

          <!-- Modificaciones -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">10. Modificaciones a los Términos</h2>
            <p class="text-gray-700">
              Nos reservamos el derecho de modificar estos Términos de Servicio en cualquier momento. Los cambios
              significativos serán notificados a través de la plataforma o por correo electrónico. Su uso continuado
              del servicio después de dichos cambios constituye su aceptación de los nuevos términos.
            </p>
          </section>

          <!-- Ley aplicable -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">11. Ley Aplicable y Jurisdicción</h2>
            <p class="text-gray-700">
              Estos términos se rigen por las leyes del país donde opera Miniferias Live. Cualquier disputa
              relacionada con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales competentes
              de dicha ubicación.
            </p>
          </section>

          <!-- Divisibilidad -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">12. Divisibilidad</h2>
            <p class="text-gray-700">
              Si alguna disposición de estos términos se considera inválida o inaplicable, las disposiciones restantes
              continuarán en pleno vigor y efecto.
            </p>
          </section>

          <!-- Contacto -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">13. Contacto</h2>
            <p class="text-gray-700">
              Si tiene preguntas sobre estos Términos de Servicio, contáctenos en:
            </p>
            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-700">
                <strong>Email:</strong> legal@miniferieslive.com
              </p>
            </div>
          </section>
        </div>

        <!-- Botón volver -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <button
            @click="$router.back()"
            class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppHeader from '@/components/shared/AppHeader.vue'
import AppFooter from '@/components/shared/AppFooter.vue'

const lastUpdated = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>
