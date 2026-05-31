import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Perfect Nails",
  description: "Política de privacidad y protección de datos de Perfect Nails.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--quartz)] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl bg-white rounded-2xl shadow-sm border border-[var(--line)] p-8 sm:p-12">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--ink)] mb-4">
            Política de Privacidad
          </h1>
          <p className="text-[var(--ink)]/60 font-light max-w-2xl mx-auto">
            Última actualización: {new Date().toLocaleDateString("es-CO")}
          </p>
        </header>

        <div className="prose prose-stone max-w-none prose-headings:font-display prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl text-[var(--ink)]/80 leading-relaxed font-light">
          <h2>1. Información General</h2>
          <p>
            En Perfect Nails (en adelante, &quot;nosotros&quot;,
            &quot;nuestro&quot; o &quot;la Empresa&quot;), respetamos su
            privacidad y nos comprometemos a proteger la información personal
            que pueda proporcionarnos a través de nuestro sitio web. Esta
            Política de Privacidad describe cómo recopilamos, utilizamos,
            almacenamos y protegemos sus datos personales.
          </p>

          <h2>2. Recopilación de Información</h2>
          <p>
            Al visitar nuestro sitio o utilizar nuestros servicios de reserva y
            compra, podemos recopilar la siguiente información:
          </p>
          <ul>
            <li>
              <strong>Información de identificación personal:</strong> Nombre
              completo, dirección de correo electrónico, número de teléfono.
            </li>
            <li>
              <strong>Información de reservas:</strong> Historial de citas,
              servicios solicitados, preferencias estéticas.
            </li>
            <li>
              <strong>Información de uso y navegación:</strong> Dirección IP,
              tipo de navegador, páginas visitadas, sistema operativo y cookies.
            </li>
          </ul>

          <h2>3. Uso de la Información</h2>
          <p>
            La información recopilada se utilizará para los siguientes fines:
          </p>
          <ul>
            <li>Gestionar sus reservas y citas.</li>
            <li>
              Procesar las compras de nuestros productos o paquetes de
              servicios.
            </li>
            <li>Mejorar nuestra página web y los servicios que ofrecemos.</li>
            <li>
              Enviar información promocional, ofertas y novedades (siempre y
              cuando haya otorgado su consentimiento, del cual puede darse de
              baja en cualquier momento).
            </li>
            <li>Cumplir con nuestras obligaciones legales y fiscales.</li>
          </ul>

          <h2>4. Protección de sus Datos</h2>
          <p>
            Implementamos una variedad de medidas de seguridad, incluyendo el
            encriptado SSL, para mantener la seguridad de su información
            personal. Sus datos están contenidos detrás de redes seguras y solo
            son accesibles por un número limitado de personas que tienen
            derechos especiales de acceso a dichos sistemas y que están
            obligadas a mantener la confidencialidad de la información.
          </p>

          <h2>5. Derechos del Usuario (ARCO)</h2>
          <p>
            Como usuario, usted tiene el derecho de <strong>Acceder</strong>,{" "}
            <strong>Rectificar</strong>, <strong>Cancelar</strong> u{" "}
            <strong>Oponerse</strong> al tratamiento de sus datos personales.
            Para ejercer cualquiera de estos derechos, puede ponerse en contacto
            con nosotros en la información provista en la sección de contacto.
          </p>

          <h2>6. Cookies</h2>
          <p>
            Utilizamos cookies propias y de terceros para mejorar nuestro sitio
            web y analizar los hábitos de navegación. Usted puede configurar su
            navegador para rechazar o aceptar las cookies según sus
            preferencias.
          </p>

          <h2>7. Contacto</h2>
          <p>
            Si tiene alguna pregunta sobre esta Política de Privacidad, por
            favor, contáctenos:
          </p>
          <ul>
            <li>
              <strong>Dirección:</strong> Calle 31 #55-13, Bello 051052,
              Antioquia
            </li>
            <li>
              <strong>Teléfono:</strong> +57 310 4627014
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
