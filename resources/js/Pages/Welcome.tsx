import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/Components/LanguageSwitcher";
import ThemeToggle from "@/Components/ThemeToggle";
import {
    Plane,
    FileText,
    Users,
    Radio,
    Shield,
    ChevronRight,
    BookOpen,
    ClipboardList,
} from 'lucide-react';

const services = [
    {
        icon: Plane,
        titleKey: 'Zrakoplovi',
        descriptionKey: 'Registracija in evidenca zrakoplovov civilnega letalstva',
        href: null,
    },
    {
        icon: Users,
        titleKey: 'Letalsko osebje',
        descriptionKey: 'Licence pilotov, kontrolorjev in letalskega tehničnega osebja',
        href: null,
    },
    {
        icon: Radio,
        titleKey: 'Brezpilotni sistemi',
        descriptionKey: 'Registracija upravljavcev in brezpilotnih zrakoplovov (UAS)',
        href: null,
    },
    {
        icon: FileText,
        titleKey: 'Letalske organizacije',
        descriptionKey: 'Odobritve in certifikati letalskih šol ter organizacij',
        href: null,
    },
    {
        icon: Shield,
        titleKey: 'Varnostni programi',
        descriptionKey: 'Varnostni programi letališč in ponudnikov storitev',
        href: null,
    },
    {
        icon: BookOpen,
        titleKey: 'Letališka infrastruktura',
        descriptionKey: 'Evidenca letališč, vzletišč in helipadov',
        href: null,
    },
];

export default function Welcome({ auth }: PageProps) {
    const { t } = useTranslation();

    return (
        <>
            <Head title="Register CAA – Civilna Letalska Agencija" />
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">

                {/* Top utility bar */}
                <div className="bg-[#003d7d] text-white text-xs">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-8">
                            <span className="opacity-75">Republika Slovenija – Civilna Letalska Agencija</span>
                            <div className="flex items-center gap-2">
                                <LanguageSwitcher />
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main header */}
                <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-20">

                            {/* Logo + naziv */}
                            <div className="flex items-center gap-4">
                                                <img
                                    src="/images/header-logo.png"
                                    alt="Civilna Letalska Agencija"
                                    className="h-12 w-auto object-contain"
                                />
                            </div>

                            {/* Navigacija */}
                            <nav className="flex items-center gap-3">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium text-white bg-[#003d7d] hover:bg-[#002d5e] transition-colors"
                                    >
                                        <ClipboardList className="h-4 w-4" />
                                        {t('Dashboard')}
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="px-4 py-2 rounded text-sm font-medium text-[#003d7d] dark:text-blue-400 border border-[#003d7d] dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors"
                                        >
                                            {t('Log in')}
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="px-4 py-2 rounded text-sm font-medium text-white bg-[#003d7d] hover:bg-[#002d5e] transition-colors"
                                        >
                                            {t('Register')}
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero section */}
                <section className="relative bg-[#003d7d] dark:bg-[#002d5e] overflow-hidden">
                    {/* Fotografija v ozadju */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
                    />
                    {/* Temni overlay čez fotografijo */}
                    <div className="absolute inset-0 bg-[#003d7d]/75 dark:bg-[#001d3e]/85" />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6 border border-white/20">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400"></span>
                                Uradni register civilnega letalstva
                            </div>

                            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                                Evidenca in registracija<br />
                                <span className="text-sky-300">civilnega letalstva</span>
                            </h1>

                            <p className="mt-6 text-lg text-blue-100 max-w-2xl leading-relaxed">
                                Uradna elektronska evidenca Civilne Letalske Agencije Republike Slovenije.
                                Vpis zrakoplovov, licenc, brezpilotnih sistemov in letalskih organizacij.
                            </p>

                            <div className="mt-10 flex flex-wrap gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold text-[#003d7d] bg-white hover:bg-blue-50 transition-colors shadow"
                                    >
                                        <ClipboardList className="h-4 w-4" />
                                        {t('Dashboard')}
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold text-[#003d7d] bg-white hover:bg-blue-50 transition-colors shadow"
                                        >
                                            {t('Log in')}
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors"
                                        >
                                            {t('Register')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Spodnji ukrivljeni prehod */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-white dark:bg-zinc-950"
                        style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }}
                    />
                </section>

                {/* Storitve / področja */}
                <section className="py-20 bg-white dark:bg-zinc-950">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                Področja registra
                            </h2>
                            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                                Register CAA pokriva vsa ključna področja evidence civilnega letalstva v Republiki Sloveniji.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service, index) => {
                                const Icon = service.icon;
                                return (
                                    <div
                                        key={index}
                                        className="group relative p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#003d7d] dark:hover:border-blue-500 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 flex items-center justify-center h-11 w-11 rounded bg-[#003d7d]/10 dark:bg-blue-900/30 group-hover:bg-[#003d7d] dark:group-hover:bg-blue-700 transition-colors">
                                                <Icon className="h-5 w-5 text-[#003d7d] dark:text-blue-400 group-hover:text-white dark:group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                                                    {t(service.titleKey)}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                                    {t(service.descriptionKey)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Informativni pas */}
                <section className="bg-gray-50 dark:bg-zinc-900 border-y border-gray-200 dark:border-zinc-800 py-14">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                            <div>
                                <div className="text-3xl font-bold text-[#003d7d] dark:text-blue-400">EU</div>
                                <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Skladen z EU uredbo</div>
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Uredba EU 2018/1139 in izvedbeni akti EASA</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-[#003d7d] dark:text-blue-400">ICAO</div>
                                <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Mednarodne norme</div>
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Standard ICAO Annex v skladu z Zakonom o letalstvu</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-[#003d7d] dark:text-blue-400">24/7</div>
                                <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Elektronski dostop</div>
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Vloge in pregled statusa kadarkoli, od kjerkoli</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA sekcija */}
                {!auth.user && (
                    <section className="py-16 bg-white dark:bg-zinc-950">
                        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Prijava v register
                            </h2>
                            <p className="mt-3 text-gray-500 dark:text-gray-400">
                                Za dostop do vloge in pregled stanja prijave se prijavite z obstoječim računom ali ustvarite novega.
                            </p>
                            <div className="mt-8 flex justify-center gap-4">
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold text-white bg-[#003d7d] hover:bg-[#002d5e] transition-colors"
                                >
                                    {t('Log in')}
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center px-6 py-3 rounded text-sm font-medium text-[#003d7d] dark:text-blue-400 border border-[#003d7d] dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    {t('Register')}
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Prazno raztezanje */}
                <div className="flex-1" />

                {/* Footer */}
                <footer className="bg-[#002d5e] text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <img
                                        src="/images/header-logo.png"
                                        alt="Civilna Letalska Agencija"
                                        className="h-8 w-auto object-contain"
                                    />
                                </div>
                                <p className="text-blue-200 text-xs leading-relaxed">
                                    Uradna elektronska evidenca Civilne Letalske Agencije Republike Slovenije.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-3">Kontakt</h4>
                                <ul className="space-y-1 text-sm text-blue-100">
                                    <li>Civilna Letalska Agencija</li>
                                    <li>Kotnikova ulica 19a</li>
                                    <li>1000 Ljubljana, Slovenija</li>
                                    <li className="pt-1 text-blue-300 text-xs">info@caa.si</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-3">Povezave</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <a
                                            href="https://www.caa.si"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-100 hover:text-white transition-colors inline-flex items-center gap-1"
                                        >
                                            Spletna stran CAA
                                            <ChevronRight className="h-3 w-3" />
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="https://www.easa.europa.eu"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-100 hover:text-white transition-colors inline-flex items-center gap-1"
                                        >
                                            EASA
                                            <ChevronRight className="h-3 w-3" />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-blue-300">
                            <span>© {new Date().getFullYear()} Civilna Letalska Agencija – Republika Slovenija</span>
                            <span>Vse pravice pridržane</span>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
