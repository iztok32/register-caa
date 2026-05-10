<!DOCTYPE html>
<html lang="sl">
<head>
    <meta charset="UTF-8">
    <title>Zahtevek za poizvedbo o lastniku zrakoplova</title>
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
                Zahtevek za poizvedbo o lastniku zrakoplova
            </h2>
            <p style="margin:6px 0 0;color:#666666;font-size:12px;">
                Datum: {{ now()->format('d.m.Y') }} ob {{ now()->format('H:i:s') }}
            </p>
        </td>
    </tr>
    <tr><td style="background:#d6d6d8;height:1px;margin:0 24px;"></td></tr>

    <!-- Applicant section -->
    <tr>
        <td style="padding:16px 24px 8px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#666666;letter-spacing:0.5px;">
                Vlagatelj
            </p>
            <p style="margin:2px 0;"><strong>{{ $applicant['name'] ?? '—' }}</strong></p>
            <p style="margin:2px 0;color:#444;">{{ $applicant['address'] ?? '' }}</p>
            <p style="margin:2px 0;color:#444;">{{ $applicant['postNum'] ?? '' }} {{ $applicant['postOffice'] ?? '' }}</p>
            @if (!empty($applicant['tax']))
                <p style="margin:2px 0;color:#444;">Davčna številka: {{ $applicant['tax'] }}</p>
            @endif
            @if (!empty($applicant['legal']))
                <p style="margin:8px 0 0;color:#444;font-style:italic;">Pravna podlaga: {{ $applicant['legal'] }}</p>
            @endif
        </td>
    </tr>
    <tr><td style="background:#d6d6d8;height:1px;"></td></tr>

    <!-- Subject section -->
    <tr>
        <td style="padding:16px 24px 8px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#666666;letter-spacing:0.5px;">
                Poizvedenec
            </p>
            <p style="margin:2px 0;"><strong>{{ $subject['display_name'] ?? '—' }}</strong></p>
            @if (!empty($subject['address']))
                <p style="margin:2px 0;color:#444;">{{ $subject['address'] }}</p>
            @endif
            @if (!empty($subject['zip_code']) || !empty($subject['city']))
                <p style="margin:2px 0;color:#444;">{{ $subject['zip_code'] ?? '' }} {{ $subject['city'] ?? '' }}</p>
            @endif
            @if (!empty($subject['tax']))
                <p style="margin:2px 0;color:#444;">Davčna številka: {{ $subject['tax'] }}</p>
            @endif
        </td>
    </tr>
    <tr><td style="background:#d6d6d8;height:1px;"></td></tr>

    <!-- Aircraft section -->
    <tr>
        <td style="padding:16px 24px 8px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#666666;letter-spacing:0.5px;">
                Najdeni zrakoplovi (aktivni vpisi)
            </p>
            @if (count($aircraft) > 0)
                <ul style="margin:0;padding-left:20px;">
                    @foreach ($aircraft as $a)
                        <li style="margin:3px 0;">
                            <strong>{{ $a['registration_mark'] ?? '?' }}</strong>
                            @if (!empty($a['manufacturer']) || !empty($a['type']))
                                — {{ implode(' ', array_filter([$a['manufacturer'] ?? null, $a['type'] ?? null])) }}
                            @endif
                        </li>
                    @endforeach
                </ul>
            @else
                <p style="color:#888;">Ni najdenih aktivnih zrakoplovov.</p>
            @endif
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
