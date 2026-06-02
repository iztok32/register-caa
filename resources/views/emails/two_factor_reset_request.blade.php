<!DOCTYPE html>
<html lang="sl">
<head>
    <meta charset="UTF-8">
    <title>Zahtevek za ponastavitev 2FA</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;font-size:13px;">
<table width="620" align="center" cellpadding="0" cellspacing="0" border="0"
       style="background:#ffffff;border:1px solid #cccccc;margin:20px auto;">

    <!-- Header -->
    <tr>
        <td style="background:#003580;padding:18px 24px;">
            <span style="color:#ffffff;font-size:17px;font-weight:bold;">Civilna Aviacija — CAA Register</span>
        </td>
    </tr>
    <tr>
        <td style="background:#d6d6d8;height:4px;"></td>
    </tr>

    <!-- Title -->
    <tr>
        <td style="padding:20px 24px 8px;">
            <h2 style="margin:0;font-size:15px;color:#111111;">
                Zahtevek za ponastavitev dvostopenjske avtentikacije (2FA)
            </h2>
            <p style="margin:6px 0 0;color:#666666;font-size:12px;">
                Datum: {{ now()->format('d.m.Y') }} ob {{ now()->format('H:i:s') }}
            </p>
        </td>
    </tr>
    <tr><td style="background:#d6d6d8;height:1px;"></td></tr>

    <!-- User info -->
    <tr>
        <td style="padding:16px 24px 8px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#666666;letter-spacing:0.5px;">
                Uporabnik
            </p>
            <p style="margin:2px 0;"><strong>{{ $user->name }}</strong></p>
            <p style="margin:2px 0;color:#444;">{{ $user->email }}</p>
            <p style="margin:6px 0 0;color:#888;font-size:12px;">ID: {{ $user->id }}</p>
        </td>
    </tr>
    <tr><td style="background:#d6d6d8;height:1px;"></td></tr>

    @if (!empty($message))
    <!-- User message -->
    <tr>
        <td style="padding:16px 24px 8px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#666666;letter-spacing:0.5px;">
                Sporočilo uporabnika
            </p>
            <p style="margin:0;color:#333;line-height:1.5;font-style:italic;">
                &ldquo;{{ $message }}&rdquo;
            </p>
        </td>
    </tr>
    <tr><td style="background:#d6d6d8;height:1px;"></td></tr>
    @endif

    <!-- Action info -->
    <tr>
        <td style="padding:16px 24px 8px;">
            <p style="margin:0 0 10px;color:#333;line-height:1.5;">
                Uporabnik <strong>{{ $user->name }}</strong> je sporočil, da je izgubil dostop do
                aplikacije za dvostopenjsko avtentikacijo in obnovitvenih kod.
            </p>
            <p style="margin:0;color:#333;line-height:1.5;">
                Za ponastavitev 2FA obiščite upravljanje z uporabniki v portalu in
                potrdite zahtevek za ponastavitev.
            </p>
        </td>
    </tr>

    <!-- CTA button -->
    <tr>
        <td style="padding:8px 24px 20px;">
            <a href="{{ $portalUrl }}"
               style="display:inline-block;background:#003580;color:#ffffff;padding:10px 20px;text-decoration:none;font-size:13px;font-weight:bold;border-radius:4px;">
                Odpri portal
            </a>
        </td>
    </tr>

    <!-- Warning -->
    <tr>
        <td style="padding:0 24px 16px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%"
                   style="background:#fff8e1;border:1px solid #ffe082;border-radius:4px;">
                <tr>
                    <td style="padding:12px 16px;color:#795548;font-size:12px;line-height:1.5;">
                        <strong>Opozorilo:</strong> Preden potrdite ponastavitev,
                        preverite identiteto uporabnika na drug način (telefonski klic, osebno srečanje ipd.).
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td style="background:#d6d6d8;height:4px;"></td>
    </tr>
    <tr>
        <td style="padding:12px 24px;color:#888;font-size:11px;">
            Obvestilo je bilo samodejno poslano prek portala CAA Register.
        </td>
    </tr>

</table>
</body>
</html>
