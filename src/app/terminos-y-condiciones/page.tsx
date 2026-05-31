import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Servicio | Perfect Nails",
  description:
    "Términos y condiciones de uso de los servicios de Perfect Nails.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--quartz)] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl bg-white rounded-2xl shadow-sm border border-[var(--line)] p-8 sm:p-12">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--ink)] mb-4">
            Términos de Servicio
          </h1>
          <p className="text-[var(--ink)]/60 font-light max-w-2xl mx-auto">
            Última actualización: {new Date().toLocaleDateString("es-CO")}
          </p>
        </header>

        <div className="prose prose-stone max-w-none prose-headings:font-display prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl text-[var(--ink)]/80 leading-relaxed font-light">
          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar el sitio web de Perfect Nails y nuestros
            servicios, usted acepta estar sujeto a estos Términos de Servicio.
            Si no está de acuerdo con alguna parte de los términos, no podrá
            utilizar nuestros servicios.
          </p>

          <h2>2. Reservas y Cancelaciones</h2>
          <p>
            Al programar una cita, le solicitaremos información básica para
            garantizar su espacio. Entendemos que pueden surgir imprevistos, por
            lo que le pedimos que cualquier cancelación o reprogramación se
            realice con al menos <strong>24 horas de antelación</strong>. Las
            cancelaciones tardías o inasistencias pueden estar sujetas a una
            tarifa o la pérdida del depósito de reserva.
          </p>

          <h2>3. Pagos y Reembolsos</h2>
          <p>
            Todos los precios presentados en nuestro sitio están expresados en
            pesos colombianos (COP). Se podrá solicitar un adelanto o pago total
            al momento de la reserva o compra de paquetes. No se emitirán
            reembolsos parciales ni totales una vez que el servicio ha sido
            prestado o si incumple nuestra política de cancelación.
          </p>

          <h2>4. Condiciones de Salud y Seguridad</h2>
          <p>
            Por su seguridad, le pedimos que nos informe sobre cualquier
            condición médica, alergias, embarazos o tratamientos en curso antes
            de realizar cualquier servicio, especialmente en depilación láser,
            masajes o tratamientos estéticos avanzados. Nos reservamos el
            derecho de denegar el servicio si consideramos que puede existir un
            riesgo para su salud.
          </p>

          <h2>5. Comportamiento en las Instalaciones</h2>
          <p>
            Buscamos mantener un ambiente relajante y respetuoso. Cualquier
            forma de acoso, violencia, o comportamiento inapropiado hacia
            nuestro personal o hacia otros clientes resultará en la terminación
            inmediata del servicio y el posible veto en futuras ocasiones, sin
            derecho a reembolso.
          </p>

          <h2>6. Modificaciones de los Términos</h2>
          <p>
            Nos reservamos el derecho de modificar o reemplazar estos Términos
            de Servicio en cualquier momento. Cualquier cambio será notificado
            mediante nuestra página web o por correo electrónico. El uso
            continuado de nuestros servicios constituirá la aceptación de los
            nuevos términos.
          </p>

          <h2>7. Ley Aplicable</h2>
          <p>
            Estos Términos de Servicio se regirán e interpretarán de acuerdo con
            las leyes de la República de Colombia.
          </p>
        </div>
      </div>
    </div>
  );
}
