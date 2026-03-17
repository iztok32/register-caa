import { Config, RouteParam, RouteName } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface NavigationItem {
    id: number;
    type: string;
    title_key: string;
    url?: string;
    icon?: string;
    metadata?: any;
    children?: NavigationItem[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    locale: string;
    availableLocales: string[];
    translations: Record<string, string>;
    navigation: {
        main: NavigationItem[];
        teams: NavigationItem[];
        projects: NavigationItem[];
    };
};

declare global {
    function route(): { current: (name?: string, params?: any) => boolean };
    function route(
        name: RouteName,
        params?: RouteParam | undefined,
        absolute?: boolean,
        config?: Config,
    ): string;
}
