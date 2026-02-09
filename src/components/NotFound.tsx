import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <main className="grid min-h-full w-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-2xl font-semibold text-destructive">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-5xl">
            Page not found
          </h1>
          <p className="mt-6 text-base leading-7 text-accent-foreground">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/"
              className="rounded-md bg-orange-500 px-3.5 py-2.5 text-sm 
              font-semibold text-white shadow-sm hover:bg-dark-green 
              focus-visible:outline-2 
              focus-visible:outline-offset-1 focus-visible:outline-secondary-green"
            >
              Go back home
            </Link>
            <a
              href="mailto:ismpsupport@helpdesk.ellatzite-med.com?subject=ИСМП Портал - Поддръжка&cc=p.penkov@ellatzite-med.com;genadi.tsolov@ellatzite-med.com"
              className="text-sm font-semibold text-accent-foreground"
            >
              Contact support <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
