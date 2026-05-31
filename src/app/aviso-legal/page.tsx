import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso Legal | Perfect Nails",
  description: "Aviso legal e información corporativa de Perfect Nails.",
};

export default function LegalNoticePage() {
  return (
    <div className="min-h-screen bg-[var(--quartz)] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl bg-white rounded-2xl shadow-sm border border-[var(--line)] p-8 sm:p-12">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--ink)] mb-4">
            Aviso Legal
          </h1>
          <p className="text-[var(--ink)]/60 font-light max-w-2xl mx-auto">
            Última actualización: {new Date().toLocaleDateString("es-CO")}
          </p>
        </header>

        <div className="prose prose-stone max-w-none prose-headings:font-display prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl text-[var(--ink)]/80 leading-relaxed font-light">
          <h2>1. Información Identidad Corporativa</h2>
          <p>
            En cumplimiento con el deber de información dispuesto en la
            normatividad colombiana, se reflejan a continuación los siguientes
            datos corporativos:
            <br />
            <br />
            <strong>Razón Social:</strong> Perfect Nails
            <br />
            <strong>Dirección:</strong> Calle 31 #55-13, Bello 051052, Antioquia
            <br />
            <strong>Teléfono de contacto:</strong> +57 310 4627014
            <br />
            <strong>Dominio Web:</strong> perfect-nails.vercel.app (o dominio
            vigente)
          </p>

          <h2>2. Propiedad Intelectual e Industrial</h2>
          <p>
            Perfect Nails por sí o como cesionaria, es titular de todos los
            derechos de propiedad intelectual e industrial de su página web, así
            como de los elementos contenidos en la misma (a título enunciativo:
            imágenes, sonido, audio, vídeo, software o textos; marcas o
            logotipos, combinaciones de colores, estructura y diseño, etc.).
          </p>
          <p>
            Quedan expresamente prohibidas la reproducción, la distribución y la
            comunicación pública, incluida su modalidad de puesta a disposición,
            de la totalidad o parte de los contenidos de esta página web, con
            fines comerciales, en cualquier soporte y por cualquier medio
            técnico, sin la autorización previa y por escrito de Perfect Nails.
          </p>

          <h2>3. Exclusión de Garantías y Responsabilidad</h2>
          <p>
            Perfect Nails no se hace responsable, en ningún caso, de los daños y
            perjuicios de cualquier naturaleza que pudieran ocasionar, a título
            enunciativo: errores u omisiones en los contenidos, falta de
            disponibilidad del portal, o la transmisión de virus o programas
            maliciosos o lesivos en los contenidos, a pesar de haber adoptado
            todas las medidas tecnológicas preventivas necesarias para evitarlo.
          </p>

          <h2>4. Modificaciones</h2>
          <p>
            Perfect Nails se reserva el derecho de efectuar sin previo aviso las
            modificaciones que considere oportunas en su portal, pudiendo
            cambiar, suprimir o añadir tanto los contenidos y servicios que se
            presten a través de la misma como la forma en la que éstos aparezcan
            presentados o localizados en su portal.
          </p>

          <h2>5. Enlaces (Links)</h2>
          <p>
            En el caso de que en la página web se dispusiesen enlaces o
            hipervínculos hacía otros sitios de Internet, Perfect Nails no
            ejercerá ningún tipo de control sobre dichos sitios y contenidos. En
            ningún caso Perfect Nails asumirá responsabilidad alguna por los
            contenidos de algún enlace perteneciente a un sitio web ajeno.
          </p>
        </div>
      </div>
    </div>
  );
}
