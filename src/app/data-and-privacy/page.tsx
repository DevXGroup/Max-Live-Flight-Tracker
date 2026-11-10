import Link from 'next/link';

export default function DataAndPrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] px-4 py-10 text-slate-100 md:px-8">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex min-h-[44px] items-center text-sm text-blue-300 underline underline-offset-4 hover:text-blue-200">
          Back to flight tracker
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Data and privacy</h1>
        <p className="mt-3 text-sm text-slate-400">What this flight tracker sends and receives.</p>

        <div className="mt-8 space-y-8 text-sm leading-6 text-slate-300">
          <section>
            <h2 className="text-lg font-semibold text-white">When you search</h2>
            <p className="mt-2">The flight number you enter is sent to this app’s server. For the standard live lookup, the server asks <a className="text-blue-300 underline" href="https://www.adsb.lol/" target="_blank" rel="noreferrer">adsb.lol</a> for aircraft observations. The app may also use a pinned <a className="text-blue-300 underline" href="https://github.com/vradarserver/standing-data" target="_blank" rel="noreferrer">Virtual Radar Server reference file</a> to suggest an unconfirmed route. A suggested route is not a confirmed current trip or airline schedule.</p>
            <p className="mt-2">The app can also use AviationStack for trip details, or adsb.fi and airplanes.live for aircraft observations, when the operator enables those services.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Map and hosting requests</h2>
            <p className="mt-2">The map loads tiles from <a className="text-blue-300 underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> directly in your browser. As with a normal web request, OpenStreetMap can receive your IP address and the browser’s Referer header. The browser uses its normal cache behavior.</p>
            <p className="mt-2">The app is hosted on Vercel. Requests to the app, including searches, pass through Vercel and may appear in its service logs. See the <a className="text-blue-300 underline" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Vercel privacy policy</a> and the <a className="text-blue-300 underline" href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noreferrer">OpenStreetMap privacy policy</a> for how those services handle requests.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">What the app keeps</h2>
            <p className="mt-2">The app does not ask for an account, passenger details, or your device location. This tracker does not use an analytics tool. The server briefly keeps recent flight results to make repeat searches faster. The app does not save a permanent flight search history.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">More information and questions</h2>
            <p className="mt-2">Read the <a className="text-blue-300 underline" href="https://devxgroup.io/privacy" target="_blank" rel="noreferrer">DevX Group privacy policy</a>. This page explains which services the flight tracker uses. For questions or a privacy or deletion request, email <a className="text-blue-300 underline" href="mailto:privacy@devxgroup.io">privacy@devxgroup.io</a>.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
