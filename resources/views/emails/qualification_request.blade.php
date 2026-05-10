<!DOCTYPE html>
<html lang="sl">
<head>
    <meta charset="UTF-8">
    <title>Zahteva za kvalificiranega uporabnika</title>
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
                Zahteva za kvalificiranega uporabnika
            </h2>
            <p style="margin:6px 0 0;color:#666666;font-size:12px;">
                Datum: {{ now()->format('d.m.Y') }} ob {{ now()->format('H:i:s') }}
            </p>
        </td>
    </tr>
    <tr><td style="background:#d6d6d8;height:1px;"></td></tr>

    <!-- User account info -->
    <tr>
        <td style="padding:16px 24px 8px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#666666;letter-spacing:0.5px;">
                Račun vlagatelja
            </p>
            <p style="margin:2px 0;"><strong>{{ $user->name }}</strong></p>
            <p style="margin:2px 0;color:#444;">{{ $user->email }}</p>
        </td>
    </tr>
    <tr><td style="background:#d6d6d8;height:1px;"></td></tr>

    <!-- Applicant details -->
    <tr>
        <td style="padding:16px 24px 8px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#666666;letter-spacing:0.5px;">
                Podatki vlagatelja
            </p>
            <p style="margin:2px 0;"><strong>{{ $applicant['name'] ?? '—' }}</strong></p>
            <p style="margin:2px 0;color:#444;">{{ $applicant['address'] ?? '' }}</p>
            <p style="margin:2px 0;color:#444;">{{ $applicant['postNum'] ?? '' }} {{ $applicant['postOffice'] ?? '' }}</p>
            @if (!empty($applicant['tax']))
                <p style="margin:2px 0;color:#444;">Davčna številka: <strong>{{ $applicant['tax'] }}</strong></p>
            @endif
            @if (!empty($applicant['registration']))
                <p style="margin:2px 0;color:#444;">Matična številka: <strong>{{ $applicant['registration'] }}</strong></p>
            @endif
            @if (!empty($applicant['contact']))
                <p style="margin:4px 0 2px;color:#444;">Kontaktna oseba: <strong>{{ $applicant['contact'] }}</strong></p>
            @endif
        </td>
    </tr>
    <tr><td style="background:#d6d6d8;height:1px;"></td></tr>

    <!-- Legal basis -->
    <tr>
        <td style="padding:16px 24px 8px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#666666;letter-spacing:0.5px;">
                Pravna podlaga / namen poizvedbe
            </p>
            <p style="margin:0;color:#333;line-height:1.6;">{{ $applicant['legal'] ?? '—' }}</p>
        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td style="background:#d6d6d8;height:4px;"></td>
    </tr>
    <tr>
        <td style="padding:12px 24px;color:#888;font-size:11px;">
            Zahtevek je bil poslan prek spletnega portala CAA Register.
        </td>
    </tr>
</table>
</body>
</html>
