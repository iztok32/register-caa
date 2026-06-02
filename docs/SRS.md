# Specifikacija programskih zahtev (SRS)
## CAA Register — Spletni portal Civilne Letalske Agencije

| | |
|---|---|
| **Dokument** | Specifikacija programskih zahtev (SRS) |
| **Projekt** | CAA Register |
| **Naročnik** | Civilna Letalska Agencija Republike Slovenije |
| **Različica** | 1.0 |
| **Datum** | 2026-05-31 |
| **Status** | Osnutek |

---

## Kazalo

1. [Uvod](#1-uvod)
2. [Splošni opis sistema](#2-splošni-opis-sistema)
3. [Uporabniki sistema](#3-uporabniki-sistema)
4. [Funkcionalne zahteve](#4-funkcionalne-zahteve)
   - 4.1 Javni dostop in iskanje
   - 4.2 Avtentikacija in varnost
   - 4.3 Register zrakoplovov
   - 4.4 Lastniki in operaterji
   - 4.5 Poizvedba o lastništvu
   - 4.6 Zahteva za kvalificiran dostop
   - 4.7 Upravljanje z uporabniki
   - 4.8 Vloge in pravice
   - 4.9 Sistem obvestil
   - 4.10 Vsebine (Prispevki)
   - 4.11 Nastavitve sistema
   - 4.12 Statistika iskanj
   - 4.13 Revizijska sled
5. [Nefunkcionalne zahteve](#5-nefunkcionalne-zahteve)
6. [Tehnični dodatek](#6-tehnični-dodatek)

---

## 1. Uvod

### 1.1 Namen dokumenta

Ta dokument opisuje funkcionalne in nefunkcionalne zahteve za spletni portal **CAA Register** — uradno elektronsko evidenco Civilne Letalske Agencije Republike Slovenije. Dokument je namenjen naročniku za potrditev obsega sistema ter razvijalcem kot referenčni dokument med razvojem in vzdrževanjem.

### 1.2 Obseg sistema

CAA Register je večslojni spletni portal, ki zagotavlja:

- **Javen dostop** do registra zrakoplovov za splošno javnost (iskanje, statistika)
- **Avtenticirani dostop** za upravljavce in uradnike CAA za upravljanje podatkov, pregled lastništva, pošiljanje poizvedb in administracijo sistema
- **Administratorski panel** za upravljanje uporabnikov, vlog, obvestil in sistemskih nastavitev

### 1.3 Definicije in kratice

| Kratica / Izraz | Pomen |
|---|---|
| CAA | Civilna Letalska Agencija Republike Slovenije |
| EMPIC | Evidenčna matična številka v registru zrakoplovov |
| 2FA | Dvostopenjska avtentikacija (Two-Factor Authentication) |
| TOTP | Enkratno geslo na podlagi časa (Time-based One-Time Password) |
| SRS | Software Requirements Specification |
| RBAC | Nadzor dostopa na podlagi vlog (Role-Based Access Control) |
| AJPES | Agencija RS za javnopravne evidence in storitve |

---

## 2. Splošni opis sistema

### 2.1 Kontekst sistema

Portal deluje kot centralna spletna aplikacija CAA. Podatki o zrakoplovih in lastnikih izvirajo iz obstoječega EMPIC registra. Portal omogoča tako bralni dostop za javnost kot operativno delo za zaposlene na CAA.

### 2.2 Glavne funkcije

- Javno iskanje po registru zrakoplovov
- Pregled podatkov o zrakoplovih in lastnikih
- Elektronske poizvedbe o lastništvu z generiranjem dokumentov
- Upravljanje z uporabniki in dostopnimi pravicami
- Obveščanje prek portala, e-pošte in SMS-a
- Sistemske nastavitve in monitoring iskanj

### 2.3 Omejitve

- Portal je bralnik registra EMPIC — ne omogoča neposredne spremembe registrskih podatkov
- Uvoz podatkov (zrakoplovi, lastniki) poteka prek ločenega mehanizma sinhronizacije z EMPIC bazo
- Podatki o lastništvu so dostopni samo kvalificiranim in višjim uporabnikom

---

## 3. Uporabniki sistema

Sistem pozna pet ravni dostopa, ki so urejen hierarhično:

### 3.1 Javni uporabnik (brez prijave)

Dostop do javne iskalne strani (če je funkcija omogočena v nastavitvah). Vidi omejen nabor podatkov o zrakoplovih brez informacij o lastništvu.

### 3.2 Javni dostop — `user`

Prijavljen uporabnik z osnovno vlogo. Dostop do registra zrakoplovov brez podatkov o lastništvu. Ne vidi imen lastnikov, operaterjev in hipotekarnih vpisov.

### 3.3 Kvalificiran uporabnik — `qualified-user`

Prijavljen uporabnik z razširjenim dostopom. Vidi podatke o lastništvu, operaterjih in hipotekah. Dostop do modula za poizvedbo o lastništvu. Za dostop je praviloma zahtevana dvostopenjska avtentikacija (2FA).

### 3.4 CAA Upravljalec — `operator`

Zaposlen pri CAA z dostopom do upravljalnih funkcij: upravljanje vsebine, pošiljanje obvestil, upravljanje z uporabniki (v okviru svojih pravic). Prejema sistemska obvestila (zahtevki za ponastavitev 2FA, zahtevki za lastništvo).

### 3.5 CAA Administrator — `admin`

Polni dostop do upravljalnega panela vključno z upravljanjem vlog, pravic, nastavitev in revizijske sledi. Upravlja sistemske parametre.

### 3.6 SuperAdministrator — `superadmin`

Tehnični skrbnik z dostopom do vseh funkcij sistema vključno z definicijo vlog in strukturo menija.

---

## 4. Funkcionalne zahteve

---

### 4.1 Javni dostop in iskanje

#### 4.1.1 Javna iskalna stran

- Sistem prikazuje javno iskalno stran na korenski URL-ju (`/`) ko je nastavitev `public_access_enabled` vklopljena.
- Ko je nastavitev izklopljena, se prikaže privzeta predstavitvena stran z možnostjo prijave.

#### 4.1.2 Iskanje zrakoplovov

- Iskanje je mogoče po poljih: registrska oznaka, proizvajalec, tip zrakoplova.
- Iskanje se sproži šele pri vnosu minimalnega števila znakov (nastavljivo, privzeto 3).
- Rezultati so omejeni na nastavljivo maksimalno število zadetkov (privzeto 20).
- Iskanje se izvede samodejno med tipkanjem z zamudo (debounce).

#### 4.1.3 Statistika registra

Na javni strani se prikazuje statistični panel:
- Skupno število zrakoplovov v registru
- Število registriranih zrakoplovov (z odstotkom)
- Število lastnikov — fizičnih oseb
- Število lastnikov — pravnih oseb

#### 4.1.4 Omejevanje iskanj (Rate Limiting)

- Sistem beleži in omejuje število iskanj po IP naslovu.
- Nastavljivi parametri (prek administracijskega vmesnika):
  - Maksimalno število iskanj na minuto (privzeto 30)
  - Maksimalno število iskanj na uro (privzeto 200)
- Ob prekoračitvi omejitve se prikaže sporočilo, iskanje ni izvedeno.
- Vsako iskanje se zabeleži v log (IP, poizvedba, število zadetkov, ali je bilo blokirano).

---

### 4.2 Avtentikacija in varnost

#### 4.2.1 Prijava in registracija

- Registracija z imenom, e-poštnim naslovom in geslom.
- Obvezna potrditev e-poštnega naslova po registraciji.
- Prijava z e-pošto in geslom.
- Pozabljeno geslo — ponastavitev prek e-poštne povezave.

#### 4.2.2 Dvostopenjska avtentikacija (2FA)

- Podprta metoda: TOTP (Google Authenticator, Authy, Microsoft Authenticator).
- Ob prvem vstopu z 2FA se generira QR koda in ročni ključ za vnos.
- Sistem generira 8 enkratnih obnovitvenih kod ob nastavitvi 2FA.
- Obnovitvene kode so enkratne — po uporabi se izbrišejo.
- 2FA se lahko zahteva:
  - Za posameznega uporabnika (per-user nastavitev)
  - Za vse uporabnike globalno (sistemska nastavitev `two_factor_required_global`)

#### 4.2.3 Postopek nastavitve 2FA

Ko je 2FA zahtevana in uporabnik je še nima nastavljene, se po prijavi izvede 3-koračni čarovnik:
1. Korak: Navodila za namestitev aplikacije
2. Korak: Skeniranje QR kode in potrditev s 6-mestno kodo
3. Korak: Prikaz in shranitev obnovitvenih kod

#### 4.2.4 Ponastavitev 2FA

- Uporabnik, ki je izgubil dostop do aplikacije za avtentikacijo **in** obnovitvenih kod, lahko odda zahtevek za ponastavitev 2FA prek strani za 2FA izziv.
- Zahtevek vključuje neobvezno sporočilo.
- Ob oddanem zahtevku upravljalci prejmejo e-poštno in portalno obvestilo.
- Administrator ali upravljalec potrdi ponastavitev v upravljanju z uporabniki.
- Po ponastavitvi se uporabniku pošlje portalno obvestilo; ob naslednji prijavi mora nastaviti 2FA znova.

---

### 4.3 Register zrakoplovov

#### 4.3.1 Seznam zrakoplovov

- Pregled vseh zrakoplovov iz registra EMPIC.
- Iskanje po: registrski oznaki, proizvajalcu, tipu, serijski številki.
- Filtriranje po statusu (Registered, Deregistered).
- Paginacija (20 zadetkov na stran).

#### 4.3.2 Podrobnosti zrakoplova

Stran prikazuje:
- EMPIC identifikator, registrsko oznako, status
- Podatki zrakoplova: proizvajalec, tip, serijska številka, leto izgradnje
- Datum registracije in morebitnega razveljavitve
- Aktivne hipoteke (samo za kvalificirane in višje uporabnike)
- Zgodovina lastništva in operaterjev (samo za kvalificirane in višje uporabnike)

---

### 4.4 Lastniki in operaterji

#### 4.4.1 Seznam lastnikov

Dostopno samo kvalificiranim in višjim uporabnikom.

- Iskanje po: priimku, imenu, naziv organizacije, EMPIC ID, davčna številka, kraj
- Filtriranje po tipu: fizična oseba / pravna oseba / vsi
- Prikazano: ime, e-pošta, telefon, naslov, EMPIC ID, število aktivnih zrakoplovov

#### 4.4.2 Podrobnosti lastnika

- Osebni ali organizacijski podatki
- Celotna zgodovina lastništva in operaterskih razmerij z zrakoplovi (vloga, deleži, datumi)
- Seznam trenutno in preteklo povezanih zrakoplovov

---

### 4.5 Poizvedba o lastništvu

Modul za generiranje uradnih poizvedb o lastništvu zrakoplova. Dostopno kvalificiranim in višjim uporabnikom.

#### 4.5.1 Postopek poizvedbe

1. Vnos podatkov vlagatelja (ime/naziv, naslov, poštna številka, kraj, davčna številka, pravna podlaga)
2. Iskanje poizvedenca — sistem poišče v treh virih:
   - EMPIC register
   - AJPES baza pravnih oseb
   - INETIS (rezervni vir)
3. Prikaz najdenih zrakoplovov za izbranega poizvedenca
4. Generiranje dokumenta in pošiljanje na e-pošto CAA

#### 4.5.2 Dokumenti

- Sistem generira HTML/PDF dokument s podpisom in pečatom (slika naložena v nastavitvah)
- Dokument vsebuje podatke vlagatelja, poizvedenca in seznama zrakoplovov
- Zahtevki se arhivirajo v profilu uporabnika

---

### 4.6 Zahteva za kvalificiran dostop

- Prijavljen uporabnik z osnovno vlogo lahko odda zahtevek za kvalificiran dostop.
- Obrazec vsebuje podatke o organizaciji in pravno podlago.
- Po oddaji se pošlje e-poštno obvestilo na CAA.
- Administrator ročno promovira vlogo uporabnika po preverjanju.

---

### 4.7 Upravljanje z uporabniki

Dostopno upravljalcem in administratorjem (glede na pravice).

#### 4.7.1 Seznam uporabnikov

- Prikaz v tabeli ali kartičnem pogledu
- Iskanje po imenu, e-pošti, vlogi
- Filter: uporabniki z aktivno 2FA
- Filter: uporabniki s čakajočo zahtevo za ponastavitev 2FA (z vidnim rdečim indikatorjem)
- Izvoz v Excel

#### 4.7.2 Upravljanje posameznega uporabnika

- Ustvari novega uporabnika
- Uredi: ime, e-pošta, GSM, status (aktiven/neaktiven), zahteva 2FA, vloga
- Pošlji e-poštno povezavo za ponastavitev gesla
- Ponastavi 2FA (s potrditvenim dialogom — ob potrditvi se počistijo vsi 2FA podatki in uporabnik prejme portalno obvestilo)
- Izbriši uporabnika (mehki izbris)

---

### 4.8 Vloge in pravice

#### 4.8.1 Definicija vlog

- Hierarhičen sistem vlog z urejenimi prioritetami prikaza.
- Vsaka vloga ima: ime, URL-slug, prioriteto.
- Vloge so združene v skupine z določenimi vidnostnimi pravili.

#### 4.8.2 Pravice

- Granularne pravice (npr. `users.view`, `users.create`, `users.edit`, `users.delete`).
- Vsaki vlogi se dodelijo pravice prek matričnega vmesnika.
- Posamezni vlogi se omejijo vidni navigacijski elementi.

---

### 4.9 Sistem obvestil

#### 4.9.1 Kanali

- **Portal** (in-app): Obvestilo je vidno v aplikaciji v predalčniku uporabnika.
- **E-pošta**: Pošiljanje e-poštnih sporočil posameznim uporabnikom ali skupini.
- **SMS**: Pošiljanje SMS sporočil na GSM številke (zahteva integriran SMS prehod).

Vsak kanal se lahko posamično vklopi/izklopi v konfiguraciji strežnika.

#### 4.9.2 Pošiljanje obvestil

- Pošiljanje posamezniku ali skupini izbranih uporabnikov
- Pošiljanje vsem aktivnim uporabnikom (broadcast)
- Beleženje statusa dostave (poslano/neuspešno) in morebitnih napak

#### 4.9.3 Predalčnik (Inbox)

- Uporabnik vidi vsa portalna obvestila namenjena njemu in broadcast obvestila
- Označevanje kot prebrano (posamezno ali vse naenkrat)

#### 4.9.4 Sistemska obvestila (samodejno)

Sistem samodejno pošlje obvestila v naslednjih primerih:

| Dogodek | Kanal | Prejemnik |
|---|---|---|
| Zahtevek za ponastavitev 2FA | E-pošta + portal | Upravljalci iz nastavitev |
| Potrditev ponastavitve 2FA | Portal | Prizadeti uporabnik |
| Zahtevek za lastništvo | E-pošta | CAA (nastavljiva e-pošta) |

#### 4.9.5 Prejemniki sistemskih obvestil

V nastavitvah sistema se z izbiralnikom določi seznam prejemnikov sistemskih obvestil. Izbirnik ponudi vse aktivne uporabnike z vlogama Administrator ali CAA upravljalec.

---

### 4.10 Vsebine (Prispevki)

- Ustvarjanje in urejanje prispevkov/obvestil (naslov, vsebina, slike)
- Statusi: objavljeno / osnutek
- Sledenje avtorju in datumu objave

---

### 4.11 Nastavitve sistema

Dostopno administratorjem. Nastavitve so shranjene v bazi in jih je mogoče spreminjati brez posega v kodo.

#### 4.11.1 Nastavitve dostopa

| Parameter | Opis | Tip |
|---|---|---|
| `public_access_enabled` | Omogoči javno iskalno stran brez prijave | Da/Ne |

#### 4.11.2 Varnostne nastavitve

| Parameter | Opis | Tip |
|---|---|---|
| `two_factor_required_global` | Zahteva 2FA za vse uporabnike | Da/Ne |

#### 4.11.3 Nastavitve iskanja

| Parameter | Opis | Privzeta vrednost |
|---|---|---|
| `search_rate_per_minute` | Maks. iskanj na minuto (per IP) | 30 |
| `search_rate_per_hour` | Maks. iskanj na uro (per IP) | 200 |
| `search_max_results` | Maks. zadetkov na iskanje | 20 |
| `search_min_chars` | Min. znakov za iskanje | 3 |

#### 4.11.4 Nastavitve obvestil

| Parameter | Opis | Tip |
|---|---|---|
| `notification_emails` | Seznam e-poštnih naslovov prejemnikov sistemskih obvestil | Večkratna izbira |

#### 4.11.5 Nastavitve dokumentov

| Parameter | Opis | Tip |
|---|---|---|
| `signature_image` | Slika podpisa in pečata za generirane dokumente | Slika (JPG/PNG/WEBP, max 4 MB) |

---

### 4.12 Statistika iskanj

Dostopno administratorjem in upravljalcem.

- **Povzetki**: iskanja danes, blokirano danes, unikatni IP-ji danes, iskanja ta mesec
- **Grafikon**: dnevno število iskanj in blokiranih iskanj za zadnjih 14 dni
- **Top iskalni nizi**: najpogostejše poizvedbe (zadnjih 7 dni)
- **Top IP naslovi**: IP-ji z največ iskanji, označeni blokirani
- **Zadnja iskanja**: tabela zadnjih 50 iskanj z IP, poizvedbo, številom zadetkov in statusom

---

### 4.13 Revizijska sled

- Sistem beleži vse spremembe entitet (uporabniki, vloge, pravice, vsebine).
- Zapis vsebuje: uporabnik, IP, dejanje (ustvari/uredi/izbriši), staro in novo vrednost, URL, user agent.
- Pregled celotne revizijske sledi z možnostjo iskanja in filtriranja.

---

## 5. Nefunkcionalne zahteve

### 5.1 Varnost

- Vsa komunikacija mora potekati prek HTTPS.
- Gesla so shranjena s hashiranjem (bcrypt).
- 2FA skrivnosti so shranjene šifrirane v bazi.
- Obnovitvene kode za 2FA so enkratne in se po uporabi izbrišejo.
- Sistem implementira CSRF zaščito za vse obrazce.
- Javno iskanje je zaščiteno z rate limitingom po IP naslovu.
- Dostop do občutljivih podatkov (lastništvo, hipoteke) je omejen z vlogami.

### 5.2 Zmogljivost

- Stran se mora naložiti v manj kot 2 sekundi pri normalnih pogojih.
- Iskanje zrakoplovov vrne rezultate v manj kot 1 sekundi.
- Sistem mora podpirati sočasno delo vsaj 50 aktivnih uporabnikov.

### 5.3 Razpoložljivost

- Sistem mora biti dostopen 99,5 % časa (dovoljeno skupno 44 ur izpada letno).
- Redna vzdrževalna okna so mogoča izven delovnega časa.

### 5.4 Uporabniška izkušnja

- Vmesnik mora biti odziven (responsive) in prilagojen za namizne in mobilne naprave.
- Podpora za svetli in temni barvni način.
- Podpora za najmanj dva jezika: slovenščina in angleščina.
- Sistem mora jasno sporočiti napake in stanje operacij.

### 5.5 Vzdrževanje

- Koda mora biti strukturirana po modulih za enostavno dodajanje novih funkcij.
- Sistemske nastavitve morajo biti spremenljive brez posega v kodo.
- Navigacijski meni mora biti konfigurabilni brez sprememb kode.

---

## 6. Tehnični dodatek

*Ta razdelek je namenjen razvijalcem.*

### 6.1 Tehnološki sklad

| Komponenta | Tehnologija | Različica |
|---|---|---|
| Strežniški okvir | Laravel | 13.x |
| Frontend okvir | React + TypeScript | 18.x |
| SPA integracija | Inertia.js | 2.x |
| Baza podatkov | PostgreSQL | 15+ |
| Gradnja frontend | Vite | — |
| UI komponente | shadcn/ui + Tailwind CSS | — |
| 2FA knjižnica | PragmaRX Google2FA | — |
| Kontejnerizacija | Docker (PHP 8.4-FPM, Nginx, Supervisor) | — |

### 6.2 Ključni podatkovni modeli

| Model | Tabela | Opis |
|---|---|---|
| `User` | `users` | Uporabniki z 2FA polji, vlogami, konfigom |
| `Role` | `roles` | Vloge z slugom in prioriteto |
| `Permission` | `permissions` | Granularne pravice |
| `AircraftSearchIndex` | `aircraft_search_index` | Denormalizirana tabela za hitro iskanje |
| `Owner` | `owners` | Lastniki in operaterji |
| `Setting` | `settings` | Sistemske nastavitve (ključ-vrednost) |
| `Notification` | `notifications` | Portalna, e-poštna in SMS obvestila |
| `SearchLog` | `search_logs` | Log javnih iskanj |
| `TwoFactorResetRequest` | `two_factor_reset_requests` | Zahtevki za ponastavitev 2FA |

### 6.3 Varnostni mehanizmi

- **Avtentikacija**: Laravel Breeze (session-based)
- **2FA**: TOTP (RFC 6238), šifrirani secret v bazi
- **Dovoljenja**: Middleware `permission:<permission-slug>` na rutah
- **2FA middleware**: `EnsureTwoFactorAuthenticated` — preveri nastavitev per-user in globalno
- **Rate limiting**: Cache-based (minute/ura key per IP), brez odvisnosti od baze

### 6.4 Deployment

- Produkcija: Docker image (PHP 8.4-FPM + Nginx + Supervisor v enem kontejnerju)
- Frontend se prevede lokalno (`npm run build`) pred gradnjo Docker image
- `public/build/` je izključen iz git repozitorija
- Migracije se izvajajo prek `php artisan migrate` ob deploymentu

### 6.5 Konfigurabilni parametri (`.env`)

```
APP_NAME, APP_URL, APP_ENV, APP_KEY
DB_CONNECTION, DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
MAIL_MAILER, MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM_ADDRESS
NOTIFICATION_ENABLE_PORTAL, NOTIFICATION_ENABLE_EMAIL, NOTIFICATION_ENABLE_SMS
```

---

*Dokument pripravil: razvojna ekipa RoLAN d.o.o.*
*Verzija za potrditev pri naročniku: Civilna Letalska Agencija RS*
